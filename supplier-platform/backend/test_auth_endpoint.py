#!/usr/bin/env python3
"""
Simple FastAPI app to test JWT authentication endpoints.
Run this with: uvicorn test_auth_endpoint:app --reload
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import uvicorn

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_user_from_token,
    create_test_token
)

app = FastAPI(title="TripsAdora JWT Test API", version="1.0.0")
security = HTTPBearer()

# Request/Response models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserInfo(BaseModel):
    user_id: str
    email: str
    token_type: str

# Mock user database (in real app, this would be MongoDB)
MOCK_USERS = {
    "admin@tripsadora.com": {
        "user_id": "admin_001",
        "password": "admin123",
        "full_name": "Admin User"
    },
    "supplier@tripsadora.com": {
        "user_id": "supplier_001", 
        "password": "supplier123",
        "full_name": "Test Supplier"
    }
}

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract current user from JWT token."""
    token = credentials.credentials
    user_info = get_user_from_token(token)
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_info

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "TripsAdora JWT Test API",
        "version": "1.0.0",
        "endpoints": {
            "login": "/auth/login",
            "refresh": "/auth/refresh", 
            "profile": "/auth/profile",
            "test_token": "/auth/test-token",
            "docs": "/docs"
        }
    }

@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login endpoint - returns JWT tokens."""
    # Check if user exists (mock authentication)
    if request.email not in MOCK_USERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user = MOCK_USERS[request.email]
    if user["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create tokens
    tokens = create_test_token(user["user_id"], request.email)
    
    return LoginResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        user_id=user["user_id"],
        email=request.email
    )

@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token."""
    user_info = get_user_from_token(refresh_token)
    
    if not user_info or user_info.get("token_type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Create new tokens
    new_tokens = create_test_token(user_info["user_id"], user_info["email"])
    
    return TokenResponse(**new_tokens)

@app.get("/auth/profile", response_model=UserInfo)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile - requires valid JWT token."""
    return UserInfo(**current_user)

@app.get("/auth/test-token")
async def test_token(current_user: dict = Depends(get_current_user)):
    """Test endpoint that requires authentication."""
    return {
        "message": "Token is valid!",
        "user": current_user,
        "timestamp": "2025-01-15T10:30:00Z"
    }

@app.get("/auth/generate-test-token")
async def generate_test_token(user_id: Optional[str] = None, email: Optional[str] = None):
    """Generate a test token for development purposes."""
    if not user_id:
        user_id = "test_user_123"
    if not email:
        email = "test@tripsadora.com"
    
    tokens = create_test_token(user_id, email)
    
    return {
        "message": "Test token generated",
        "tokens": tokens,
        "usage": "Add to Authorization header: Bearer <access_token>",
        "expires": "30 minutes"
    }

if __name__ == "__main__":
    print("🚀 Starting TripsAdora JWT Test API...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔐 Test Endpoints:")
    print("   POST /auth/login - Login with email/password")
    print("   GET /auth/profile - Get user profile (requires token)")
    print("   GET /auth/test-token - Test authenticated endpoint")
    print("   GET /auth/generate-test-token - Generate test token")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

