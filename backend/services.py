"""
@file services.py
@description Core business logic for Gemini AI integration and React Flow data transformation.
@module backend
"""

import os
import json
import google.generativeai as genai
import bleach
from fastapi import HTTPException
from models import SchemaExtraction, GenerateDataRequest

# Configure Gemini
def get_api_key():
    return os.environ.get("GEMINI_API_KEY")

def configure_genai():
    key = get_api_key()
    if key:
        genai.configure(api_key=key)
        # Masked print for debugging
        masked_key = f"{key[:6]}...{key[-4:]}" if len(key) > 10 else "****"
        print(f"INFO: Gemini configured with key {masked_key}")
    else:
        print("WARNING: GEMINI_API_KEY not found in environment.")

# Initial configuration
configure_genai()

def generate_schema_from_image(file_bytes: bytes, mime_type: str, dialect: str = "postgresql") -> SchemaExtraction:
    """
    Sends the image to Gemini 1.5 Flash and extracts the database schema.
    Returns a validated SchemaExtraction Pydantic model.
    """
    if not get_api_key():
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY is not configured on the server."
        )

    try:
        model = genai.GenerativeModel("gemini-flash-latest")
        
        system_instructions = (
            f"You are an expert SQL Architect. Convert hand-drawn whiteboard schema sketches "
            f"into high-performance {dialect.upper()} DDL and a structured JSON model. "
            "STRICT RULES:\n"
            "1. Use snake_case for all identifiers.\n"
            "2. For every column, you MUST include: 'name', 'type', 'is_primary_key', 'is_foreign_key', and 'foreign_key_target'.\n"
            "3. If a column is NOT a foreign key, 'foreign_key_target' MUST be an empty string (not null).\n"
            "4. Return ONLY valid JSON that matches the requested schema."
        )
        
        
        prompt = """Analyze this whiteboard sketch and extract the database schema as JSON.

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "tables": [
    {
      "name": "table_name",
      "columns": [
        {
          "name": "column_name",
          "type": "VARCHAR(255)",
          "is_primary_key": false,
          "is_foreign_key": false,
          "foreign_key_target": null
        }
      ]
    }
  ],
  "relationships": [
    {
      "source_table": "table1",
      "target_table": "table2",
      "type": "one-to-many"
    }
  ],
  "sql_code": "CREATE TABLE ..."
}

Use snake_case for all identifiers. For foreign_key_target, use null if not a foreign key."""

        # Simplified config without response_schema
        generation_config = genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1,
        )
        
        # Try standard Part object structure if simple dict fails
        response = model.generate_content(
            [
                system_instructions, 
                prompt, 
                {"mime_type": mime_type, "data": file_bytes}
            ],
            generation_config=generation_config
        )

        # Parse and validate manually
        extraction = SchemaExtraction.model_validate_json(response.text)
        
        # Sanitize the generated SQL code
        extraction.sql_code = bleach.clean(extraction.sql_code, tags=[], attributes={}, strip=True)
        
        return extraction

    except Exception as e:
        print(f"Error calling Gemini: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI Schema Generation failed: {str(e)}")

def generate_mock_data(request: GenerateDataRequest) -> str:
    """
    Generates mock data (INSERT statements) for the given SQL schema.
    """
    if not get_api_key():
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured.")

    try:
        model = genai.GenerativeModel("gemini-flash-latest")
        
        prompt = (
            f"Generate {request.count} valid INSERT statements for the following {request.dialect} schema. "
            "Ensure referential integrity (foreign keys must match). "
            "Return ONLY the SQL code, no markdown block syntax, no comments.\n\n"
            f"Schema:\n{request.sql_code}"
        )

        response = model.generate_content(prompt)
        
        # Cleanup
        sql = bleach.clean(response.text, tags=[], attributes={}, strip=True)
        # remove markdown quotes if present
        sql = sql.replace("```sql", "").replace("```", "").strip()
        
        return sql

    except Exception as e:
        print(f"Error generating mock data: {e}")
        raise HTTPException(status_code=500, detail=f"Mock Data Generation failed: {str(e)}")

def transform_to_graph_data(schema: SchemaExtraction):
    """
    Transforms the structured schema into React Flow nodes and edges.
    Applies basic grid layout and styling.
    """
    nodes = []
    edges = []
    
    # Layout configuration
    x_gap = 350 # Width of a node + gap
    y_gap = 300 # Height + gap
    cols_per_row = 3
    
    for i, table in enumerate(schema.tables):
        # Grid layout logic
        row = i // cols_per_row
        col = i % cols_per_row
        
        nodes.append({
            "id": f"table-{table.name}",
            "type": "databaseNode",
            "position": {"x": col * x_gap, "y": row * y_gap},
            "data": {
                "label": table.name,
                "schema": table.model_dump()
            }
        })

    for i, rel in enumerate(schema.relationships):
        edges.append({
            "id": f"edge-{i}",
            "source": f"table-{rel.source_table}",
            "target": f"table-{rel.target_table}",
            "label": rel.type,
            "animated": True,
            "style": { "stroke": "#8b5cf6", "strokeWidth": 2 },
            "labelStyle": { "fill": "#ffffff", "fontWeight": 700 }
        })
        
    return {"nodes": nodes, "edges": edges}
