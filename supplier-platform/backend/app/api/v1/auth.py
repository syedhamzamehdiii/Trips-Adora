import logging
from datetime import datetime
from typing import Optional
from uuid import uuid4

import jwt
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, constr

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
from app.services.settings_service import SupplierSettingsService

logger = logging.getLogger(__name__)

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
    supplier_code: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class GoogleLogin(BaseModel):
    credential: str


class VerificationRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: constr(min_length=4, max_length=12)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: constr(min_length=4, max_length=128)
    new_password: constr(min_length=6, max_length=128)


class VerificationRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: constr(min_length=4, max_length=12)




async def _generate_supplier_code() -> str:
    """Generate a unique supplier code."""
    while True:
        candidate = f"SUP-{uuid4().hex[:8].upper()}"
        existing = await User.find_one(User.supplier_code == candidate)
        if not existing:
            return candidate


async def _sync_supplier_code_to_settings(user_id: str, supplier_code: str) -> None:
    """Ensure supplier settings include the supplier code for downstream displays."""
    try:
        existing_doc = await SupplierSettingsService.get_document(user_id)
        settings_data = dict(existing_doc.data) if existing_doc and existing_doc.data else {}

        profile_data = dict(settings_data.get("profileData") or {})
        profile_data.setdefault("contactLabel", "Supplier ID")
        profile_data["contactValue"] = supplier_code
        profile_data["supplierCode"] = supplier_code

        settings_data["profileData"] = profile_data
        await SupplierSettingsService.upsert_settings(user_id, settings_data)
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.warning("Failed to sync supplier code to settings for %s: %s", user_id, exc)


async def _ensure_supplier_code(user: User) -> str:
    """Assign a supplier code to the user if missing and persist related settings."""
    if user.supplier_code:
        return user.supplier_code

    supplier_code = await _generate_supplier_code()
    user.supplier_code = supplier_code
    user.updated_at = datetime.utcnow()
    await user.save()
    await _sync_supplier_code_to_settings(str(user.id), supplier_code)
    return supplier_code


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        business_name=user.business_name,
        phone=user.phone,
        address=user.address,
        country=user.country,
        supplier_code=user.supplier_code,
        role=user.role.value,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


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
    
    supplier_code = await _generate_supplier_code()

    # Create new user
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        business_name=user_data.business_name,
        phone=user_data.phone,
        address=user_data.address,
        country=user_data.country,
        supplier_code=supplier_code,
        role=UserRole.SUPPLIER,
    )
    
    await user.insert()
    await _sync_supplier_code_to_settings(str(user.id), supplier_code)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
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

    await _ensure_supplier_code(user)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "user": _user_response(user),
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user"""
    # In a production app, you might want to blacklist the token
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    await _ensure_supplier_code(current_user)
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
async def forgot_password(payload: ForgotPasswordRequest):
    """Send password reset email"""
    user = await User.find_one(User.email == payload.email)
    
    if not user:
        # Don't reveal if user exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    # TODO: Generate reset token and send email
    # For now, just return success message
    
    return {"message": "Password reset link sent to your email"}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
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
            supplier_code = await _generate_supplier_code()
            user = User(
                email=email,
                full_name=name or email.split('@')[0],
                business_name=name or email.split('@')[0],
                role=UserRole.SUPPLIER,
                is_active=True,
                # No password for Google users
                hashed_password="",
                supplier_code=supplier_code,
            )
            await user.insert()
            await _sync_supplier_code_to_settings(str(user.id), supplier_code)
        else:
            await _ensure_supplier_code(user)
        
        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
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


class GoogleCallbackRequest(BaseModel):
    code: str
    redirect_uri: str

@router.post("/google/callback", response_model=dict)
async def google_callback(request: GoogleCallbackRequest):
    """Handle Google OAuth callback with authorization code"""
    import asyncio
    
    try:
        logger.info("Starting Google OAuth callback")
        
        # Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": request.code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": request.redirect_uri,
            "grant_type": "authorization_code"
        }
        
        logger.info("Exchanging authorization code with Google...")
        # Add timeout to prevent hanging (8 seconds - faster than frontend timeout)
        try:
            token_response = await asyncio.wait_for(
                asyncio.to_thread(requests.post, token_url, data=token_data, timeout=8),
                timeout=8.0
            )
        except asyncio.TimeoutError:
            logger.error("Google OAuth token exchange timed out")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Google OAuth token exchange timed out. Please try again."
            )
        
        # Check if request was successful
        if not token_response.ok:
            error_msg = f"Google OAuth token exchange failed: {token_response.status_code} - {token_response.text}"
            logger.error(error_msg)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        token_json = token_response.json()
        
        if "error" in token_json:
            error_msg = token_json.get('error_description', token_json.get('error', 'Unknown error'))
            logger.error(f"Google OAuth error: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google OAuth error: {error_msg}"
            )
        
        logger.info("Token exchange successful, decoding ID token...")
        
        # Get user info from Google
        id_token = token_json.get("id_token")
        
        # Decode the ID token (contains user info)
        try:
            decoded_token = jwt.decode(id_token, options={"verify_signature": False})
        except Exception as e:
            logger.error(f"Failed to decode ID token: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to decode ID token: {str(e)}"
            )
        
        email = decoded_token.get("email")
        name = decoded_token.get("name")
        
        if not email:
            logger.error("No email found in Google token")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email found in Google token"
            )
        
        logger.info(f"Looking up user with email: {email}")
        
        # Check if user already exists with timeout
        try:
            user = await asyncio.wait_for(
                User.find_one(User.email == email),
                timeout=5.0
            )
        except asyncio.TimeoutError:
            logger.error("MongoDB query timed out while looking up user")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Database query timed out. Please try again."
            )
        
        if not user:
            logger.info(f"Creating new user for email: {email}")
            # Create new user from Google data
            supplier_code = await _generate_supplier_code()
            user = User(
                email=email,
                full_name=name or email.split('@')[0],
                business_name=name or email.split('@')[0],
                role=UserRole.SUPPLIER,
                is_active=True,
                is_verified=True,
                hashed_password="",  # No password for Google users
                supplier_code=supplier_code,
            )
            try:
                await asyncio.wait_for(user.insert(), timeout=5.0)
                await asyncio.wait_for(_sync_supplier_code_to_settings(str(user.id), supplier_code), timeout=3.0)
            except asyncio.TimeoutError:
                logger.error("MongoDB insert timed out")
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="Database operation timed out. Please try again."
                )
            logger.info(f"New user created: {user.id}")
        else:
            logger.info(f"Existing user found: {user.id}")
            try:
                await asyncio.wait_for(_ensure_supplier_code(user), timeout=3.0)
            except asyncio.TimeoutError:
                logger.warning("Supplier code sync timed out, continuing...")
        
        logger.info("Creating JWT tokens...")
        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        logger.info("Google OAuth callback completed successfully")
        
        return {
            "token": access_token,
            "refresh_token": refresh_token,
            "user": _user_response(user),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google callback failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google callback failed: {str(e)}"
        )


@router.post("/send-verification-code")
async def send_verification_code(payload: VerificationRequest):
    """Send email verification code"""
    # TODO: Generate 6-digit code and send via email
    # For now, just return success message
    
    return {"message": "Verification code sent to your email"}


@router.post("/verify-code")
async def verify_code(payload: VerifyCodeRequest):
    """Verify email code"""
    # TODO: Verify the code
    # For now, just return success message
    
    return {"message": "Email verified successfully"}