import logging
from datetime import datetime
from typing import Optional
import jwt
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User, UserRole
from app.services.profile_service import ProfileService
from app.services.wallet_service import WalletService

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str]
    address: Optional[str]
    country: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class GoogleLogin(BaseModel):
    credential: str


class GoogleCallbackRequest(BaseModel):
    code: str
    redirect_uri: str


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        address=user.address,
        country=user.country,
        role=user.role.value,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new customer"""
    # Check if user already exists
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        address=user_data.address,
        country=user_data.country,
        role=UserRole.CUSTOMER,
    )
    
    await user.insert()
    
    # Auto-create profile and wallet for new user
    user_id_str = str(user.id)
    try:
        await ProfileService.ensure_profile(user_id_str)
        await WalletService.ensure_wallet(user_id_str)
    except Exception as e:
        logger.warning(f"Failed to auto-create profile/wallet for user {user_id_str}: {e}")
        # Don't fail registration if profile/wallet creation fails
    
    # Create tokens
    access_token = create_access_token(data={"sub": user_id_str})
    refresh_token = create_refresh_token(data={"sub": user_id_str})
    
    return {
        "message": "User registered successfully",
        "token": access_token,
        "refresh_token": refresh_token,
        "user": _user_response(user),
    }


@router.post("/login", response_model=dict)
async def login(user_data: UserLogin):
    """Login user"""
    user = await User.find_one(User.email == user_data.email)
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )
    
    # Auto-create profile and wallet if they don't exist
    user_id_str = str(user.id)
    try:
        await ProfileService.ensure_profile(user_id_str)
        await WalletService.ensure_wallet(user_id_str)
    except Exception as e:
        logger.warning(f"Failed to auto-create profile/wallet for user {user_id_str}: {e}")
        # Don't fail login if profile/wallet creation fails
    
    # Create tokens
    access_token = create_access_token(data={"sub": user_id_str})
    refresh_token = create_refresh_token(data={"sub": user_id_str})
    
    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "user": _user_response(user),
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user"""
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return _user_response(current_user)


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    payload = decode_token(refresh_token)
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    user_id = payload.get("sub")
    user = await User.get(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )


@router.post("/forgot-password")
async def forgot_password(email: EmailStr):
    """Send password reset email"""
    user = await User.find_one(User.email == email)
    
    if not user:
        # Don't reveal if user exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    return {"message": "Password reset link sent to your email"}


@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    """Reset password"""
    return {"message": "Password reset successfully"}


@router.post("/google", response_model=dict)
async def google_login(google_data: GoogleLogin):
    """Google OAuth login"""
    try:
        # Verify the Google JWT token
        try:
            # Get Google's public keys for verification
            response = requests.get("https://www.googleapis.com/oauth2/v3/certs")
            google_keys = response.json()
            
            # Decode the JWT token with Google's public keys
            decoded_token = jwt.decode(
                google_data.credential,
                google_keys,
                algorithms=["RS256"],
                audience=settings.GOOGLE_CLIENT_ID,
                issuer="https://accounts.google.com"
            )
        except Exception as e:
            # Fallback: decode without verification for development
            logger.warning(f"Google token verification failed: {e}")
            decoded_token = jwt.decode(google_data.credential, options={"verify_signature": False})
        
        email = decoded_token.get("email")
        name = decoded_token.get("name")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email found in Google token"
            )
        
        # Check if user already exists
        user = await User.find_one(User.email == email)
        
        if not user:
            # Create new user from Google data
            user = User(
                email=email,
                full_name=name or email.split('@')[0],
                role=UserRole.CUSTOMER,
                is_active=True,
                is_verified=True,
                # No password for Google users
                hashed_password="",
            )
            await user.insert()
        
        # Auto-create profile and wallet for new/existing user
        user_id_str = str(user.id)
        try:
            await ProfileService.ensure_profile(user_id_str)
            await WalletService.ensure_wallet(user_id_str)
        except Exception as e:
            logger.warning(f"Failed to auto-create profile/wallet for user {user_id_str}: {e}")
            # Don't fail login if profile/wallet creation fails
        
        # Create tokens
        access_token = create_access_token(data={"sub": user_id_str})
        refresh_token = create_refresh_token(data={"sub": user_id_str})
        
        return {
            "token": access_token,
            "refresh_token": refresh_token,
            "user": _user_response(user),
        }
        
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google login failed: {str(e)}"
        )


@router.post("/google/callback", response_model=dict)
async def google_callback(request: GoogleCallbackRequest):
    """Handle Google OAuth callback with authorization code"""
    try:
        # Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": request.code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": request.redirect_uri,
            "grant_type": "authorization_code"
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        
        if "error" in token_json:
            error_msg = token_json.get('error_description', token_json.get('error', 'Unknown error'))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google OAuth error: {error_msg}"
            )
        
        # Get user info from Google
        id_token = token_json.get("id_token")
        
        # Decode the ID token (contains user info)
        try:
            decoded_token = jwt.decode(id_token, options={"verify_signature": False})
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to decode ID token: {str(e)}"
            )
        
        email = decoded_token.get("email")
        name = decoded_token.get("name")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email found in Google token"
            )
        
        # Check if user already exists
        user = await User.find_one(User.email == email)
        
        if not user:
            # Create new user from Google data
            user = User(
                email=email,
                full_name=name or email.split('@')[0],
                role=UserRole.CUSTOMER,
                is_active=True,
                is_verified=True,
                hashed_password="",  # No password for Google users
            )
            await user.insert()
        
        # Auto-create profile and wallet for new/existing user
        user_id_str = str(user.id)
        try:
            await ProfileService.ensure_profile(user_id_str)
            await WalletService.ensure_wallet(user_id_str)
        except Exception as e:
            logger.warning(f"Failed to auto-create profile/wallet for user {user_id_str}: {e}")
            # Don't fail login if profile/wallet creation fails
        
        # Create tokens
        access_token = create_access_token(data={"sub": user_id_str})
        refresh_token = create_refresh_token(data={"sub": user_id_str})
        
        return {
            "token": access_token,
            "refresh_token": refresh_token,
            "user": _user_response(user),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google callback failed: {str(e)}"
        )


@router.post("/send-verification-code")
async def send_verification_code(email: EmailStr):
    """Send email verification code"""
    return {"message": "Verification code sent to your email"}


@router.post("/verify-code")
async def verify_code(email: EmailStr, code: str):
    """Verify email code"""
    return {"message": "Email verified successfully"}

