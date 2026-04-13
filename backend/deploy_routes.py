"""
@file deploy_routes.py
@description Deployment endpoints for Supabase and Firebase integrations.
@module backend
"""

import re
import httpx
import bleach
from uuid import uuid4
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

# Initialize router and limiter
router = APIRouter(prefix="/deploy", tags=["deploy"])
limiter = Limiter(key_func=get_remote_address)

# Request Models
class SupabaseDeployRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    projectRef: str
    serviceKey: str
    sql: str
    
    @field_validator("projectRef")
    @classmethod
    def validate_project_ref(cls, v: str) -> str:
        if not re.match(r"^[a-z]{20}$", v):
            raise ValueError("Invalid Project Reference ID format")
        return v
    
    @field_validator("serviceKey")
    @classmethod
    def validate_service_key(cls, v: str) -> str:
        if not (v.startswith("eyJ") or v.startswith("sbp_")):
            raise ValueError("Invalid key format. Provide either a service_role JWT key (starts with eyJ) or a Personal Access Token (starts with sbp_) from supabase.com/dashboard/account/tokens")
        return v

class FirebaseDeployRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    serviceAccount: dict
    schema: dict
    
    @field_validator("serviceAccount")
    @classmethod
    def validate_service_account(cls, v: dict) -> dict:
        if v.get("type") != "service_account":
            raise ValueError("Invalid service account JSON")
        required_fields = ["type", "project_id", "private_key_id", "private_key", "client_email"]
        for field in required_fields:
            if field not in v:
                raise ValueError(f"Missing required field: {field}")
        return v
    
    @field_validator("schema")
    @classmethod
    def validate_schema(cls, v: dict) -> dict:
        if "tables" not in v or not isinstance(v["tables"], list):
            raise ValueError("Schema must contain 'tables' array")
        return v

# Supabase Deployment Endpoint
@router.post("/supabase")
@limiter.limit("3/minute")
async def deploy_to_supabase(request: Request, deploy_request: SupabaseDeployRequest):
    """
    Deploy PostgreSQL DDL to Supabase project via Management API.
    Rate limited to 3 requests per minute per IP.
    """
    # Sanitize SQL before sending
    sanitized_sql = bleach.clean(deploy_request.sql, tags=[], attributes={}, strip=True)
    
    url = f"https://api.supabase.com/v1/projects/{deploy_request.projectRef}/database/query"
    headers = {
        "Authorization": f"Bearer {deploy_request.serviceKey}",
        "Content-Type": "application/json"
    }
    payload = {"query": sanitized_sql}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code == 401:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid service role key. Check Supabase Dashboard → Settings → API"
                )
            elif response.status_code == 404:
                raise HTTPException(
                    status_code=400,
                    detail="Project not found. Check your Project Reference ID"
                )
            elif response.status_code == 400:
                error_text = response.text
                if "already exists" in error_text.lower():
                    raise HTTPException(
                        status_code=400,
                        detail="Some tables already exist in your database. Drop them first or use IF NOT EXISTS"
                    )
                raise HTTPException(status_code=400, detail=error_text)
            elif not response.is_success:
                raise HTTPException(
                    status_code=400,
                    detail=f"Supabase API error: {response.text}"
                )
            
            # Extract table names from SQL
            table_names = extract_table_names(sanitized_sql)
            
            return {
                "status": "success",
                "message": "Schema deployed successfully",
                "tables": table_names
            }
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=408,
            detail="Supabase took too long to respond. Try again."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Deployment failed: {str(e)}"
        )

# Firebase Deployment Endpoint
@router.post("/firebase")
@limiter.limit("3/minute")
async def deploy_to_firebase(request: Request, deploy_request: FirebaseDeployRequest):
    """
    Deploy schema to Firebase Firestore by creating collections with schema metadata.
    Rate limited to 3 requests per minute per IP.
    """
    app_name = f"nexusdb-{uuid4().hex[:8]}"
    app = None
    
    try:
        # Initialize Firebase app with unique name
        cred = credentials.Certificate(deploy_request.serviceAccount)
        app = firebase_admin.initialize_app(cred, name=app_name)
        db = firestore.client(app=app)
        
        collections_created = []
        
        for table in deploy_request.schema["tables"]:
            table_name = table["name"]
            collection_ref = db.collection(table_name)
            
            # Create schema document
            schema_doc = {
                "_nexusdb_schema": True,
                "_generated_by": "NEXUS_DB",
                "columns": {}
            }
            
            sample_doc = {}
            
            for col in table["columns"]:
                col_name = col["name"]
                col_type = col["type"].upper()
                
                # Build schema description
                type_desc = col_type
                if col.get("is_primary_key"):
                    type_desc += " (PRIMARY KEY)"
                elif col.get("is_foreign_key") and col.get("foreign_key_target"):
                    type_desc += f" (FK → {col['foreign_key_target']})"
                
                schema_doc["columns"][col_name] = type_desc
                
                # Generate sample value based on type
                sample_doc[col_name] = generate_default_value(col_type)
            
            # Write documents
            collection_ref.document("_schema").set(schema_doc)
            collection_ref.document("sample_001").set(sample_doc)
            
            collections_created.append(table_name)
        
        return {
            "status": "success",
            "collectionsCreated": len(collections_created),
            "collections": collections_created
        }
        
    except ValueError as e:
        error_msg = str(e)
        if "Could not deserialize key data" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="Invalid service account JSON. Re-download from Firebase Console"
            )
        elif "Project not found" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="Firebase project not found. Check the project_id in your service account JSON"
            )
        raise HTTPException(status_code=400, detail=error_msg)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    finally:
        # Always cleanup Firebase app instance
        if app:
            try:
                firebase_admin.delete_app(app)
            except:
                pass

# Helper Functions
def extract_table_names(sql: str) -> list[str]:
    """Extract table names from CREATE TABLE statements."""
    pattern = r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`\"]?(\w+)[`\"]?"
    matches = re.findall(pattern, sql, re.IGNORECASE)
    return matches

def generate_default_value(col_type: str):
    """Generate appropriate default value based on column type."""
    col_type_upper = col_type.upper()
    
    # Integer types
    if any(t in col_type_upper for t in ["INT", "SERIAL", "BIGINT", "SMALLINT", "TINYINT"]):
        return 0
    
    # Float types
    if any(t in col_type_upper for t in ["FLOAT", "DOUBLE", "DECIMAL", "NUMERIC", "REAL"]):
        return 0.0
    
    # Boolean
    if "BOOL" in col_type_upper:
        return False
    
    # Timestamp/Date
    if any(t in col_type_upper for t in ["TIMESTAMP", "DATE", "TIME", "DATETIME"]):
        return firestore.SERVER_TIMESTAMP
    
    # Default to empty string for text types
    return ""
