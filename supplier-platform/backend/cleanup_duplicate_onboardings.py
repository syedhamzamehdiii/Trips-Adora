#!/usr/bin/env python3
"""
Script to clean up duplicate supplier onboarding records with the same email.
This merges duplicates by keeping the most recent one and deleting older ones.
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.supplier_onboarding import SupplierOnboarding
from app.core.config import settings
from beanie import init_beanie
import motor.motor_asyncio
from collections import defaultdict
from datetime import datetime


async def cleanup_duplicates():
    """Find and merge duplicate onboarding records by email"""
    
    # Initialize database connection
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=20000,
    )
    database = client[settings.DATABASE_NAME]
    
    # Initialize Beanie
    await init_beanie(database=database, document_models=[SupplierOnboarding])
    
    print("🔍 Scanning for duplicate onboarding records...")
    
    # Get all onboardings
    all_onboardings = await SupplierOnboarding.find_all().to_list()
    
    # Group by normalized email
    email_groups = defaultdict(list)
    for onboarding in all_onboardings:
        normalized_email = onboarding.email.lower().strip() if onboarding.email else None
        if normalized_email:
            email_groups[normalized_email].append(onboarding)
    
    # Find duplicates
    duplicates_found = 0
    records_to_delete = []
    
    for normalized_email, onboardings in email_groups.items():
        if len(onboardings) > 1:
            duplicates_found += len(onboardings) - 1
            print(f"\n📧 Found {len(onboardings)} records for email: {normalized_email}")
            
            # Sort by created_at (most recent first)
            onboardings.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
            
            # Keep the most recent one
            keep = onboardings[0]
            print(f"   ✅ Keeping: {keep.id} (created: {keep.created_at}, status: {keep.status})")
            
            # Mark others for deletion
            for onboarding in onboardings[1:]:
                print(f"   ❌ Marking for deletion: {onboarding.id} (created: {onboarding.created_at}, status: {onboarding.status})")
                records_to_delete.append(onboarding.id)
    
    if duplicates_found == 0:
        print("\n✅ No duplicates found! All records are unique.")
        return
    
    print(f"\n📊 Summary:")
    print(f"   - Total duplicate records to remove: {duplicates_found}")
    print(f"   - Unique emails with duplicates: {len([g for g in email_groups.values() if len(g) > 1])}")
    
    # Ask for confirmation
    response = input(f"\n⚠️  Delete {duplicates_found} duplicate record(s)? (yes/no): ").strip().lower()
    if response != 'yes':
        print("❌ Cleanup cancelled.")
        return
    
    # Delete duplicates
    deleted_count = 0
    for record_id in records_to_delete:
        try:
            record = await SupplierOnboarding.get(record_id)
            if record:
                await record.delete()
                deleted_count += 1
                print(f"   🗑️  Deleted: {record_id}")
        except Exception as e:
            print(f"   ⚠️  Error deleting {record_id}: {e}")
    
    print(f"\n✅ Cleanup complete! Deleted {deleted_count} duplicate record(s).")
    
    # Normalize all remaining emails to lowercase
    print("\n🔄 Normalizing email addresses to lowercase...")
    all_remaining = await SupplierOnboarding.find_all().to_list()
    normalized_count = 0
    for onboarding in all_remaining:
        if onboarding.email and onboarding.email != onboarding.email.lower().strip():
            old_email = onboarding.email
            onboarding.email = onboarding.email.lower().strip()
            await onboarding.save()
            normalized_count += 1
            print(f"   📝 Normalized: {old_email} -> {onboarding.email}")
    
    if normalized_count > 0:
        print(f"\n✅ Normalized {normalized_count} email address(es).")
    else:
        print("\n✅ All emails are already normalized.")


async def main():
    print("🧹 Supplier Onboarding Duplicate Cleanup Script")
    print("=" * 60)
    
    try:
        await cleanup_duplicates()
        return 0
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

