#!/usr/bin/env python3
"""
Script to create an admin user in the supplier platform and get JWT token.
This is useful for setting up admin access to the supplier platform API.
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.user import User, UserRole
from app.core.security import get_password_hash, create_access_token, create_refresh_token
from app.core.config import settings
from beanie import init_beanie
import motor.motor_asyncio


async def create_admin_user(email: str, password: str, full_name: str = "Admin User"):
    """Create an admin user and return the JWT token"""
    
    # Initialize database connection using same settings as the app
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=20000,
    )
    database = client[settings.DATABASE_NAME]
    
    # Initialize Beanie
    await init_beanie(database=database, document_models=[User])
    
    # Check if admin user already exists
    existing_user = await User.find_one(User.email == email)
    
    if existing_user:
        print(f"⚠️  User with email {email} already exists.")
        response = input("Do you want to update this user to admin role? (y/n): ").strip().lower()
        if response == 'y':
            existing_user.role = UserRole.ADMIN
            existing_user.is_active = True
            existing_user.is_verified = True
            if password:
                existing_user.hashed_password = get_password_hash(password)
            await existing_user.save()
            user = existing_user
            print(f"✅ Updated user {email} to admin role.")
        else:
            print("❌ Cancelled. Exiting.")
            return None
    else:
        # Create new admin user
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            business_name=full_name,
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        await user.insert()
        print(f"✅ Created new admin user: {email}")
    
    # Generate JWT tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    print(f"\n{'='*60}")
    print(f"✅ Admin user created/updated successfully!")
    print(f"{'='*60}")
    print(f"\n📧 Email: {email}")
    print(f"👤 Name: {user.full_name}")
    print(f"🔑 Role: {user.role.value}")
    print(f"\n{'='*60}")
    print(f"🔐 JWT TOKEN (Copy this for admin platform):")
    print(f"{'='*60}")
    print(f"\n{access_token}\n")
    print(f"{'='*60}")
    print(f"\n📋 Instructions:")
    print(f"1. Copy the token above")
    print(f"2. Add it to your admin platform .env file:")
    print(f"   VITE_SUPPLIER_ADMIN_TOKEN={access_token}")
    print(f"3. Or set it in localStorage:")
    print(f"   localStorage.setItem('supplier_access_token', '{access_token}')")
    print(f"4. Restart your admin frontend to use the new token")
    print(f"\n🔄 Refresh Token (for token renewal):")
    print(f"{refresh_token}\n")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "role": user.role.value
        }
    }


async def main():
    print("🔐 Admin User Creator for Supplier Platform")
    print("=" * 60)
    
    # Get user input
    email = input("Enter admin email (required): ").strip()
    if not email:
        print("❌ Email is required!")
        return 1
    
    password = input("Enter password (required): ").strip()
    if not password:
        print("❌ Password is required!")
        return 1
    
    full_name = input("Enter full name (or press Enter for 'Admin User'): ").strip()
    if not full_name:
        full_name = "Admin User"
    
    try:
        result = await create_admin_user(email, password, full_name)
        if result:
            return 0
        else:
            return 1
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
