import os
from typing import Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    # Database - Using same MongoDB as supplier platform
    MONGODB_URL: str = "mongodb+srv://mehihamza1:mehihamza1@clusterr.st9ycu2.mongodb.net/TripsAdora"
    DATABASE_NAME: str = "TripsAdora"  # Same database
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "*"  # Allow all origins for development
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

