"""
@file models.py
@description Pydantic models for database schema extraction and API responses.
@module backend
"""

from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Literal

class Column(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    name: str 
    type: str   # e.g., INTEGER, VARCHAR(255), BOOLEAN
    is_primary_key: bool = False
    is_foreign_key: bool = False
    foreign_key_target: Optional[str] = None

class TableModel(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    name: str 
    columns: List[Column] 

class Relationship(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    source_table: str 
    target_table: str 
    type: Literal["1:1", "1:N", "N:M"]
    source_column: str 
    target_column: str 

class SchemaExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    tables: List[TableModel] 
    relationships: List[Relationship] 
    sql_code: str 

class GenerateDataRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    sql_code: str
    dialect: str = "postgresql"
    count: int = 10 
