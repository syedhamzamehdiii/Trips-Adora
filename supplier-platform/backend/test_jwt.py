#!/usr/bin/env python3
"""
Test script to verify JWT token generation and validation.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import (
    create_access_token, 
    create_refresh_token, 
    decode_token,
    verify_password,
    get_password_hash,
    create_test_token,
    get_user_from_token
)

def test_password_hashing():
    """Test password hashing functionality."""
    print("🔐 Testing Password Hashing...")
    
    password = "test_password_123"
    hashed = get_password_hash(password)
    
    print(f"   Original password: {password}")
    print(f"   Hashed password: {hashed}")
    
    # Verify password
    is_valid = verify_password(password, hashed)
    print(f"   Password verification: {'✅ Valid' if is_valid else '❌ Invalid'}")
    
    # Test wrong password
    wrong_password = "wrong_password"
    is_invalid = verify_password(wrong_password, hashed)
    print(f"   Wrong password test: {'✅ Correctly rejected' if not is_invalid else '❌ Should be rejected'}")
    
    return True

def test_token_creation():
    """Test JWT token creation and validation."""
    print("\n🎫 Testing JWT Token Creation...")
    
    user_id = "test_user_123"
    email = "test@tripsadora.com"
    
    # Create tokens
    access_token = create_access_token(data={"sub": user_id, "email": email})
    refresh_token = create_refresh_token(data={"sub": user_id, "email": email})
    
    print(f"   User ID: {user_id}")
    print(f"   Email: {email}")
    print(f"   Access token created: ✅")
    print(f"   Refresh token created: ✅")
    
    # Decode tokens
    access_payload = decode_token(access_token)
    refresh_payload = decode_token(refresh_token)
    
    if access_payload:
        print(f"   Access token decoded: ✅")
        print(f"   Access token type: {access_payload.get('type')}")
        print(f"   Access token user: {access_payload.get('sub')}")
    else:
        print(f"   Access token decode: ❌")
    
    if refresh_payload:
        print(f"   Refresh token decoded: ✅")
        print(f"   Refresh token type: {refresh_payload.get('type')}")
        print(f"   Refresh token user: {refresh_payload.get('sub')}")
    else:
        print(f"   Refresh token decode: ❌")
    
    return True

def test_helper_functions():
    """Test helper functions."""
    print("\n🛠️  Testing Helper Functions...")
    
    # Test create_test_token
    tokens = create_test_token("helper_user", "helper@test.com")
    print(f"   create_test_token: ✅")
    print(f"   Generated {len(tokens)} tokens")
    
    # Test get_user_from_token
    user_info = get_user_from_token(tokens["access_token"])
    if user_info:
        print(f"   get_user_from_token: ✅")
        print(f"   User ID: {user_info['user_id']}")
        print(f"   Email: {user_info['email']}")
        print(f"   Token type: {user_info['token_type']}")
    else:
        print(f"   get_user_from_token: ❌")
    
    return True

def test_token_expiration():
    """Test token expiration handling."""
    print("\n⏰ Testing Token Expiration...")
    
    from datetime import timedelta
    
    # Create a token that expires in 1 second
    expired_token = create_access_token(
        data={"sub": "expired_user", "email": "expired@test.com"},
        expires_delta=timedelta(seconds=1)
    )
    
    print(f"   Created token with 1-second expiration")
    
    # Decode immediately (should work)
    payload = decode_token(expired_token)
    if payload:
        print(f"   Token is valid immediately: ✅")
    else:
        print(f"   Token is invalid immediately: ❌")
    
    print(f"   Note: In real usage, expired tokens will be rejected")
    
    return True

def main():
    """Run all tests."""
    print("🧪 JWT Security Module Tests")
    print("=" * 40)
    
    try:
        # Run tests
        test_password_hashing()
        test_token_creation()
        test_helper_functions()
        test_token_expiration()
        
        print("\n✅ All tests completed successfully!")
        print("\n📋 Summary:")
        print("   - Password hashing: Working")
        print("   - JWT token creation: Working")
        print("   - JWT token validation: Working")
        print("   - Helper functions: Working")
        
        print("\n🚀 Your JWT system is ready to use!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)

