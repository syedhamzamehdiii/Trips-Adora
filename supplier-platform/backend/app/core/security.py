import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create an access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a refresh token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except Exception:
        return None


def generate_password_reset_token(email: str) -> str:
    """Generate a password reset token."""
    delta = timedelta(hours=1)  # Reset token expires in 1 hour
    now = datetime.utcnow()
    expires = now + delta
    
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email, "type": "password_reset"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify a password reset token and return the email."""
    try:
        decoded_token = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if decoded_token.get("type") != "password_reset":
            return None
        return decoded_token.get("sub")
    except jwt.ExpiredSignatureError:
        return None
    except Exception:
        return None


# Example usage functions for testing
def create_test_token(user_id: str, email: str) -> Dict[str, str]:
    """Create test tokens for a user."""
    access_token = create_access_token(data={"sub": user_id, "email": email})
    refresh_token = create_refresh_token(data={"sub": user_id, "email": email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Extract user information from a token."""
    payload = decode_token(token)
    if payload:
        return {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "token_type": payload.get("type")
        }
    return None

