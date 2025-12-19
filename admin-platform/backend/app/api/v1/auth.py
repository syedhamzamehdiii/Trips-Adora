from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from app.core.security import create_access_token
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Hardcoded admin credentials (in production, use database)
ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "sirzubair123"


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
async def admin_login(request: AdminLoginRequest):
    """Admin login endpoint"""
    try:
        # Verify credentials
        if request.email != ADMIN_EMAIL or request.password != ADMIN_PASSWORD:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Generate JWT token
        access_token = create_access_token(
            data={
                "sub": ADMIN_EMAIL,
                "type": "admin",
                "role": "admin"
            }
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": ADMIN_EMAIL,
                "name": "Admin",
                "role": "admin"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin login error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

