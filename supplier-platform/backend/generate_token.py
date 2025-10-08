#!/usr/bin/env python3
"""
Simple script to generate JWT tokens for testing purposes.
Run this script to generate access and refresh tokens for a user.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import create_access_token, create_refresh_token, create_test_token
from datetime import timedelta

def main():
    print("🔐 JWT Token Generator for TripsAdora Supplier Platform")
    print("=" * 50)
    
    # Get user details
    user_id = input("Enter User ID (or press Enter for 'test_user_123'): ").strip()
    if not user_id:
        user_id = "test_user_123"
    
    email = input("Enter Email (or press Enter for 'test@tripsadora.com'): ").strip()
    if not email:
        email = "test@tripsadora.com"
    
    print(f"\n📝 Generating tokens for:")
    print(f"   User ID: {user_id}")
    print(f"   Email: {email}")
    
    # Generate tokens
    try:
        tokens = create_test_token(user_id, email)
        
        print(f"\n✅ Tokens generated successfully!")
        print(f"\n🔑 Access Token (expires in 30 minutes):")
        print(f"{tokens['access_token']}")
        
        print(f"\n🔄 Refresh Token (expires in 7 days):")
        print(f"{tokens['refresh_token']}")
        
        print(f"\n📋 Token Details:")
        print(f"   Type: {tokens['token_type']}")
        print(f"   Access Token Length: {len(tokens['access_token'])} characters")
        print(f"   Refresh Token Length: {len(tokens['refresh_token'])} characters")
        
        print(f"\n🧪 Testing Instructions:")
        print(f"   1. Copy the access token")
        print(f"   2. Add it to your HTTP requests as: Authorization: Bearer <token>")
        print(f"   3. Use the refresh token to get new access tokens when needed")
        
    except Exception as e:
        print(f"\n❌ Error generating tokens: {e}")
        return 1
    
    return 0

def generate_custom_token():
    """Generate a token with custom expiration."""
    print("\n🎯 Custom Token Generator")
    print("=" * 30)
    
    user_id = input("Enter User ID: ").strip()
    email = input("Enter Email: ").strip()
    minutes = input("Enter expiration in minutes (default 30): ").strip()
    
    if not minutes:
        minutes = 30
    else:
        try:
            minutes = int(minutes)
        except ValueError:
            print("Invalid minutes value, using 30")
            minutes = 30
    
    try:
        # Create custom expiration
        expires_delta = timedelta(minutes=minutes)
        access_token = create_access_token(
            data={"sub": user_id, "email": email}, 
            expires_delta=expires_delta
        )
        
        print(f"\n✅ Custom token generated!")
        print(f"   Expires in: {minutes} minutes")
        print(f"   Token: {access_token}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    print("Choose an option:")
    print("1. Generate standard tokens")
    print("2. Generate custom expiration token")
    
    choice = input("\nEnter choice (1 or 2): ").strip()
    
    if choice == "2":
        generate_custom_token()
    else:
        exit_code = main()
        sys.exit(exit_code)

