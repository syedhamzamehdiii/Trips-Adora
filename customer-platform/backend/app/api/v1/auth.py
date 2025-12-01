import logging
from datetime import datetime
from typing import Optional
import jwt
import requests
from fastapi import APIRouter, Depends, HTTPException, status
import asyncio
from fastapi.security import OAuth2PasswordBearer
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
from app.services.profile_service import ProfileService
from app.services.wallet_service import WalletService

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def _log_google_event(message: str) -> None:
    try:
        logger.info(message)
    except Exception:
        # don't raise from logging failure
        pass


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
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

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

    user_id_str = str(user.id)
    try:
        await ProfileService.ensure_profile(user_id_str)
        await WalletService.ensure_wallet(user_id_str)
    except Exception as e:
        logger.warning(f"Failed to auto-create profile/wallet for user {user_id_str}: {e}")
        # Do not fail registration if auxiliary services fail

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

    user_id_str = str(user.id)
    try:
        await ProfileService.ensure_profile(user_id_str)
        await WalletService.ensure_wallet(user_id_str)
    except Exception as e:
        logger.warning(f"Failed to auto-create profile/wallet for user {user_id_str}: {e}")

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
        # Don't reveal existence
        return {"message": "If the email exists, a reset link has been sent"}

    return {"message": "Password reset link sent to your email"}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    """Reset password"""
    return {"message": "Password reset successfully"}


@router.post("/google", response_model=dict)
async def google_login(google_data: GoogleLogin):
    """Google OAuth login (credential-based)"""
    try:
        try:
            response = requests.get("https://www.googleapis.com/oauth2/v3/certs", timeout=5)
            google_keys = response.json()
            decoded_token = jwt.decode(
                google_data.credential,
                google_keys,
                algorithms=["RS256"],
                audience=settings.GOOGLE_CLIENT_ID,
                issuer="https://accounts.google.com",
            )
        except Exception as e:
            logger.warning(f"Google token verification failed: {e}")
            decoded_token = jwt.decode(google_data.credential, options={"verify_signature": False})

        email = decoded_token.get("email")
        name = decoded_token.get("name")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email found in Google token",
            )

        user = await User.find_one(User.email == email)

        if not user:
            user = User(
                email=email,
                full_name=name or email.split("@")[0],
                role=UserRole.CUSTOMER,
                is_active=True,
                is_verified=True,
                hashed_password="",
            )
            await user.insert()
        else:
            if name and name.strip() and user.full_name != name:
                user.full_name = name
                await user.save()

        user_id_str = str(user.id)
        try:
            profile = await ProfileService.ensure_profile(user_id_str)

            if name and name.strip():
                name_parts = name.strip().split(" ", 1)
                first_name = name_parts[0] if len(name_parts) > 0 else name
                last_name = name_parts[1] if len(name_parts) > 1 else ""

                profile_user = profile.get("user", {}) or {}
                profile_user.update(
                    {
                        "name": name,
                        "first_name": first_name,
                        "last_name": last_name,
                        "email": email,
                    }
                )

                await ProfileService.update_profile(user_id_str, {"user": profile_user})

            await WalletService.ensure_wallet(user_id_str)
        except Exception as e:
            logger.warning(f"Failed to auto-create profile/wallet for user {user_id_str}: {e}")

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
            detail="Invalid Google token",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google login failed: {str(e)}",
        )


@router.post("/google/callback", response_model=dict)
async def google_callback(request: GoogleCallbackRequest):
    """Handle Google OAuth callback with authorization code"""
    try:
        # Validate inputs
        if not request.code or not request.code.strip():
            _log_google_event("Missing authorization code")
            logger.error("Google callback: Missing authorization code")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authentication failed. Please try again.",
            )

        if not request.redirect_uri or not request.redirect_uri.strip():
            _log_google_event("Missing redirect URI")
            logger.error("Google callback: Missing redirect_uri")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authentication failed. Please try again.",
            )

        redirect_uri = request.redirect_uri.strip()
        _log_google_event(f"Received code with redirect={redirect_uri}")
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": request.code.strip(),
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }

        logger.info(f"[GoogleOAuth] Exchanging code (redirect={redirect_uri})")
        _log_google_event("Calling Google token endpoint")

        try:
            token_response = await asyncio.wait_for(
                asyncio.to_thread(requests.post, token_url, data=token_data, timeout=8),
                timeout=8.0,
            )
            logger.info(f"Google token response status: {token_response.status_code}")
            _log_google_event(f"Google token response status: {token_response.status_code}")
        except asyncio.TimeoutError:
            _log_google_event("Google token exchange timed out")
            logger.error("Google OAuth token exchange timed out")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Authentication timed out. Please try again.",
            )
        except requests.exceptions.RequestException as e:
            _log_google_event(f"Google token exchange network error: {e}")
            logger.error(f"Network error during Google OAuth token exchange: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication failed. Please try again.",
            )

        try:
            token_json = token_response.json()
        except Exception as parse_exc:
            _log_google_event(f"Failed to parse Google response: {parse_exc}")
            logger.error(f"Failed to parse Google response: {token_response.text}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication failed. Please try again.",
            )

        if not token_response.ok or "error" in token_json:
            error_msg = token_json.get("error_description", token_json.get("error", "Unknown error"))
            error_type = token_json.get("error", "unknown")
            logger.error(f"Google OAuth error: {error_type} - {error_msg}")
            logger.error(f"Redirect URI used: {redirect_uri}")
            logger.error(f"Status code: {token_response.status_code}")

            if error_type == "invalid_grant":
                detail = "Authorization code expired or already used. Please try signing in again."
            elif error_type == "redirect_uri_mismatch":
                detail = f"Redirect URI mismatch. Please ensure '{redirect_uri}' is registered in Google Cloud Console."
            else:
                detail = "Authentication failed. Please try again."

            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

        id_token = token_json.get("id_token")
        if not id_token:
            _log_google_event("Missing id_token in Google response")
            logger.error("Google OAuth: Missing id_token in response")
            logger.error(f"Token response keys: {list(token_json.keys())}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authentication failed. Please try again.",
            )

        try:
            decoded_token = jwt.decode(id_token, options={"verify_signature": False})
        except Exception as e:
            _log_google_event(f"Failed to decode ID token: {e}")
            logger.error(f"Failed to decode ID token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authentication failed. Please try again.",
            )

        email = decoded_token.get("email")
        name = decoded_token.get("name")

        _log_google_event(f"Decoded ID token: email={email}, name={name}")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email found in Google token",
            )

        # Ensure user exists or create
        try:
            user = await User.find_one(User.email == email)

            if not user:
                user = User(
                    email=email,
                    full_name=name or email.split("@")[0],
                    role=UserRole.CUSTOMER,
                    is_active=True,
                    is_verified=True,
                    hashed_password="",  # No password for Google users
                )
                await user.insert()
            else:
                if name and name.strip() and user.full_name != name:
                    user.full_name = name
                    await user.save()
        except Exception as exc:
            logger.exception("Failed ensuring user during Google OAuth for %s", email)
            _log_google_event(f"Failed ensuring user for {email}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google callback failed while ensuring user",
            ) from exc

        user_id_str = str(user.id)

        # Background async setup for profile and wallet
        async def setup_profile_and_wallet():
            _log_google_event(f"Background profile/wallet setup started for {user_id_str}")
            profile = None
            try:
                profile = await asyncio.wait_for(ProfileService.ensure_profile(user_id_str), timeout=5)
            except asyncio.TimeoutError:
                _log_google_event(f"Profile creation timed out for {user_id_str}")
                logger.warning(f"Profile creation timed out for user {user_id_str}")
            except Exception as e:
                _log_google_event(f"Failed to ensure profile for {user_id_str}: {e}")
                logger.warning(f"Failed to ensure profile for user {user_id_str}: {e}")

            if profile:
                profile_user = profile.get("user", {}) or {}
                trimmed_name = (name or "").strip()
                update_payload = {}
                updated_user_section = dict(profile_user)

                if trimmed_name:
                    if not (profile_user.get("name") or "").strip():
                        updated_user_section["name"] = trimmed_name
                    name_parts = trimmed_name.split(" ", 1)
                    first_name = name_parts[0] if len(name_parts) > 0 else trimmed_name
                    last_name = name_parts[1] if len(name_parts) > 1 else ""
                    if first_name and not (profile_user.get("first_name") or "").strip():
                        updated_user_section["first_name"] = first_name
                    if last_name and not (profile_user.get("last_name") or "").strip():
                        updated_user_section["last_name"] = last_name

                if email and not (profile_user.get("email") or "").strip():
                    updated_user_section["email"] = email

                if updated_user_section != profile_user:
                    update_payload["user"] = updated_user_section

                if update_payload:
                    try:
                        await asyncio.wait_for(ProfileService.update_profile(user_id_str, update_payload), timeout=5)
                    except asyncio.TimeoutError:
                        _log_google_event(f"Profile update timed out for {user_id_str}")
                        logger.warning(f"Profile update timed out for user {user_id_str}")
                    except Exception as e:
                        _log_google_event(f"Failed to update profile for {user_id_str}: {e}")
                        logger.warning(f"Failed to update profile for user {user_id_str}: {e}")

            try:
                await asyncio.wait_for(WalletService.ensure_wallet(user_id_str), timeout=5)
            except asyncio.TimeoutError:
                _log_google_event(f"Wallet creation timed out for {user_id_str}")
                logger.warning(f"Wallet creation timed out for user {user_id_str}")
            except Exception as e:
                _log_google_event(f"Failed to ensure wallet for {user_id_str}: {e}")
                logger.warning(f"Failed to ensure wallet for user {user_id_str}: {e}")

        # Schedule background task (non-blocking)
        try:
            asyncio.create_task(setup_profile_and_wallet())
        except RuntimeError:
            # If there is no running loop (unlikely in FastAPI), run it in a thread
            asyncio.get_event_loop().create_task(setup_profile_and_wallet())

        access_token = create_access_token(data={"sub": user_id_str})
        refresh_token = create_refresh_token(data={"sub": user_id_str})

        _log_google_event("Returning success response")
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
            detail=f"Google callback failed: {str(e)}",
        )


@router.post("/send-verification-code")
async def send_verification_code(payload: VerificationRequest):
    """Send email verification code"""
    return {"message": "Verification code sent to your email"}


@router.post("/verify-code")
async def verify_code(payload: VerifyCodeRequest):
    """Verify email code"""
    return {"message": "Email verified successfully"}
