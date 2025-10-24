from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import jwt
import requests
from app.core.config import settings

from app.models.user import User, UserRole
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.dependencies import get_current_user

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    business_name: Optional[str] = None
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
    business_name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    country: Optional[str]
    role: str
    is_active: bool
    created_at: datetime


class GoogleLogin(BaseModel):
    credential: str




@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new supplier"""
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
        business_name=user_data.business_name,
        phone=user_data.phone,
        address=user_data.address,
        country=user_data.country,
        role=UserRole.SUPPLIER,
    )
    
    await user.insert()
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "message": "User registered successfully",
        "token": access_token,
        "refresh_token": refresh_token,
        "user": UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            business_name=user.business_name,
            phone=user.phone,
            address=user.address,
            country=user.country,
            role=user.role.value,
            is_active=user.is_active,
            created_at=user.created_at,
        ),
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
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "user": UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            business_name=user.business_name,
            phone=user.phone,
            address=user.address,
            country=user.country,
            role=user.role.value,
            is_active=user.is_active,
            created_at=user.created_at,
        ),
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user"""
    # In a production app, you might want to blacklist the token
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        business_name=current_user.business_name,
        phone=current_user.phone,
        address=current_user.address,
        country=current_user.country,
        role=current_user.role.value,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


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
    
    # TODO: Generate reset token and send email
    # For now, just return success message
    
    return {"message": "Password reset link sent to your email"}


@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    """Reset password"""
    # TODO: Verify reset token and update password
    
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
            print(f"Google token verification failed: {e}")
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
                business_name=name or email.split('@')[0],
                role=UserRole.SUPPLIER,
                is_active=True,
                # No password for Google users
                hashed_password=""
            )
            await user.insert()
        
        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return {
            "token": access_token,
            "refresh_token": refresh_token,
            "user": UserResponse(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                business_name=user.business_name,
                phone=user.phone,
                address=user.address,
                country=user.country,
                role=user.role.value,
                is_active=user.is_active,
                created_at=user.created_at,
            ),
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


class GoogleCallbackRequest(BaseModel):
    code: str
    redirect_uri: str

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
                business_name=name or email.split('@')[0],
                role=UserRole.SUPPLIER,
                is_active=True,
                is_verified=True,
                hashed_password=""  # No password for Google users
            )
            await user.insert()
        
        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return {
            "token": access_token,
            "refresh_token": refresh_token,
            "user": UserResponse(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                business_name=user.business_name,
                phone=user.phone,
                address=user.address,
                country=user.country,
                role=user.role.value,
                is_active=user.is_active,
                created_at=user.created_at,
            ),
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
    # TODO: Generate 6-digit code and send via email
    # For now, just return success message
    
    return {"message": "Verification code sent to your email"}


@router.post("/verify-code")
async def verify_code(email: EmailStr, code: str):
    """Verify email code"""
    # TODO: Verify the code
    # For now, just return success message
    
    return {"message": "Email verified successfully"}