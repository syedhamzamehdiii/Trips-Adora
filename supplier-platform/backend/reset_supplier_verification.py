#!/usr/bin/env python3
"""
Quick fix script to reset is_verified status for suppliers that should go through registration again.
This is useful after cleanup when onboarding records were deleted but user accounts still exist.
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.user import User, UserRole
from app.core.config import settings
from beanie import init_beanie
import motor.motor_asyncio


# Suppliers to keep (by supplier_code or email)
KEEP_SUPPLIERS = {
    "supplier_codes": ["SUP-726A0E80", "SUP-5912999E"],
    "emails": ["mehihamza1@gmail.com", "maham.inbox@gmail.com"]
}


async def reset_verification():
    """Reset is_verified to False for kept suppliers"""
    
    # Initialize database connection
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=20000,
        tls=True,
        tlsAllowInvalidCertificates=True,
    )
    database = client[settings.DATABASE_NAME]
    
    # Initialize Beanie
    await init_beanie(database=database, document_models=[User])
    
    print("🔍 Finding suppliers to reset verification status...")
    print("=" * 60)
    
    # Find all supplier users
    all_suppliers = await User.find(User.role == UserRole.SUPPLIER).to_list()
    
    print(f"\n📊 Found {len(all_suppliers)} total supplier(s)")
    
    # Find suppliers to reset (only those NOT in the keep list)
    suppliers_to_reset = []
    suppliers_to_keep_list = []
    
    for supplier in all_suppliers:
        should_keep = False
        
        # Check by supplier_code
        if supplier.supplier_code and supplier.supplier_code in KEEP_SUPPLIERS["supplier_codes"]:
            should_keep = True
        
        # Check by email
        if supplier.email and supplier.email.lower() in [e.lower() for e in KEEP_SUPPLIERS["emails"]]:
            should_keep = True
        
        if should_keep:
            suppliers_to_keep_list.append(supplier)
            print(f"   ✅ KEEPING (verified: {supplier.is_verified}): {supplier.supplier_code or 'N/A'} - {supplier.email}")
        else:
            # Only reset suppliers that are NOT in the keep list
            if supplier.is_verified:
                suppliers_to_reset.append(supplier)
                print(f"   🔄 Will reset: {supplier.supplier_code or 'N/A'} - {supplier.email} (currently verified: {supplier.is_verified})")
    
    print(f"\n📊 Summary:")
    print(f"   - Suppliers to keep (will NOT be reset): {len(suppliers_to_keep_list)}")
    print(f"   - Other suppliers to reset: {len(suppliers_to_reset)}")
    
    if len(suppliers_to_reset) == 0:
        print("\n✅ No suppliers need verification reset!")
        return
    
    # Ask for confirmation
    response = input(f"\n⚠️  Reset is_verified to False for {len(suppliers_to_reset)} supplier(s)? (type 'RESET' to confirm): ").strip()
    
    if response != 'RESET':
        print("❌ Reset cancelled.")
        return
    
    print("\n🔄 Resetting verification status...")
    
    reset_count = 0
    for supplier in suppliers_to_reset:
        try:
            supplier.is_verified = False
            await supplier.save()
            reset_count += 1
            print(f"   ✅ Reset: {supplier.supplier_code or 'N/A'} - {supplier.email}")
        except Exception as e:
            print(f"   ⚠️  Error resetting {supplier.id}: {e}")
    
    print(f"\n✅ Reset verification for {reset_count} supplier(s)")
    print("\n💡 These suppliers will now be redirected to the registration page when they log in.")


async def main():
    print("🔄 Supplier Verification Reset Script")
    print("=" * 60)
    print(f"⚠️  NOTE: Suppliers in the keep list will NOT be reset!")
    print(f"Keeping suppliers (will remain verified):")
    for code in KEEP_SUPPLIERS["supplier_codes"]:
        print(f"   - {code}")
    for email in KEEP_SUPPLIERS["emails"]:
        print(f"   - {email}")
    print("=" * 60)
    
    try:
        await reset_verification()
        return 0
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        if 'client' in locals():
            client.close()


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

