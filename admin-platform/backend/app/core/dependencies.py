from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from app.core.security import decode_token
from app.core.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()


def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify admin token and return user info.
    For admin platform, we check if the token is valid and belongs to admin.
    """
    try:
        token = credentials.credentials
        payload = decode_token(token)
        
        # Check if token is for admin (not sub-admin)
        token_type = payload.get("type")
        if token_type == "sub_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sub-admins cannot perform admin operations"
            )
        
        # Verify admin email or role
        email = payload.get("sub")
        role = payload.get("role")
        
        # Allow if it's admin type or has admin role or admin email
        if token_type == "admin" or role == "admin" or (email and email == "admin@gmail.com"):
            return payload
        
        # If no clear admin indicator, deny access
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_admin_user(admin_payload: dict = Depends(verify_admin_token)) -> dict:
    """Get admin user info from verified token"""
    return admin_payload

