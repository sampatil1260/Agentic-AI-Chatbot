from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Databricks connection
    databricks_host: str = ""
    databricks_token: str = ""
    
    # Service Principal (for Vector Search)
    sp_client_id: str = ""
    sp_client_secret: str = ""
    
    # Databricks SQL Warehouse (for SQL functions)
    databricks_warehouse_id: str = ""
    
    # Model settings
    llm_model: str = "databricks-gpt-oss-120b"
    llm_max_tokens: int = 2000
    
    # Vector Search settings
    vs_endpoint: str = "vs_endpoint_1"
    vs_index: str = "agentic_catalog.agentic_schema.product_docs_index"
    vs_num_results: int = 3
    
    # App settings  
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
