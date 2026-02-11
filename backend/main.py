"""
@file main.py
@description FastAPI entry point with rate limiting, security headers, and schema generation routes.
@module backend
"""

import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Form
from models import GenerateDataRequest
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables early
load_dotenv()

from services import generate_schema_from_image, transform_to_graph_data, generate_mock_data

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Whiteboard Architect API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

@app.get("/health")
@limiter.limit("100/minute")
async def health_check(request: Request):
    return {"status": "ok", "service": "Whiteboard Architect Backend"}

@app.post("/api/generate")
@limiter.limit("5/minute")
@limiter.limit("50/hour") # Dual-layer: per minute for bursts, per hour for persistent usage
async def generate_schema(
    request: Request, 
    file: UploadFile = File(...),
    dialect: str = Form("postgresql")
):
    """
    Upload an image, get back SQL and Graph Data.
    Limited to 5 requests per minute to manage AI costs/load.
    """
    if not file.content_type.startswith("image/"):
        return JSONResponse(
            status_code=400,
            content={"error": "invalid_file_type", "message": "File must be an image"}
        )
    
    # Limit file size (e.g., 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        return JSONResponse(
            status_code=413,
            content={"error": "file_too_large", "message": "File size exceeds 10MB limit"}
        )
    
    try:
        # 1. Call Gemini
        extraction = generate_schema_from_image(contents, file.content_type, dialect)
        
        # 2. Transform for Frontend
        graph_data = transform_to_graph_data(extraction)
        
        return {
            "sql_code": extraction.sql_code,
            "graph_data": graph_data,
            "raw_schema": extraction.model_dump()
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={
                "error": "generation_failed",
                "message": "AI Schema Generation failed",
                "details": str(e)
            }
        )

@app.post("/api/generate-data")
@limiter.limit("10/minute")
@limiter.limit("100/hour")
async def generate_data_endpoint(request: Request, data_request: GenerateDataRequest):
    """
    Generate mock INSERT statements for a given schema.
    """
    try:
        sql = generate_mock_data(data_request)
        return {"sql_code": sql}
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={
                "error": "mock_data_failed", 
                "message": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    # Use environment for port
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
