import os
from typing import Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = "mongodb+srv://mehihamza1:mehihamza1@clusterr.st9ycu2.mongodb.net/TripsAdora"
    DATABASE_NAME: str = "TripsAdora"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    JWT_SECRET_KEY: str = "your-jwt-secret-key-here-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
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
        "https://yourdomain.com",
        "*"  # Allow all origins for development
    ]
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = "353190546831-i9oc4kvu61gs3po363k3u646jnbt0mv4.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET: str = "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"
    GOOGLE_REDIRECT_URIS: list = [
        "http://localhost:3000",
        "http://localhost:3000/auth/google/callback",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://localhost:5173/auth/google/callback",
        "http://localhost:5177",
        "http://localhost:5177/auth/google/callback",
        "https://yourdomain.com",
        "https://yourdomain.com/auth/google/callback"
    ]
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Cloudinary (Image Storage)
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    # Optional: exchange rate API (used by finance features if configured)
    EXCHANGE_RATE_API_KEY: Optional[str] = None
    
    # Frontend URL for invitation links
    FRONTEND_URL: str = "http://localhost:5173"
    SUPPLIER_FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

