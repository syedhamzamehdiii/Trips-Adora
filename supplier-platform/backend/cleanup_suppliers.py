#!/usr/bin/env python3
"""
Script to delete all suppliers from MongoDB except for specified ones.

This script will:
1. Delete all supplier users except SUP-726A0E80 and SUP-5912999E
2. Delete related data: products, onboardings, vehicles, settings, etc.
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.user import User, UserRole
from app.models.product import Product
from app.models.supplier_onboarding import SupplierOnboarding
from app.models.account_settings import SupplierAccountSettings
from app.models.vehicle import SupplierVehicle
from app.models.coi_document import COIDocument
from app.models.notification import Notification
from app.models.message import Message
from app.models.invitation import SupplierInvitation
from app.core.config import settings
from beanie import init_beanie
import motor.motor_asyncio
from datetime import datetime


# Suppliers to KEEP (by supplier_code or email)
KEEP_SUPPLIERS = {
    "supplier_codes": ["SUP-726A0E80", "SUP-5912999E"],
    "emails": ["mehihamza1@gmail.com", "maham.inbox@gmail.com"]
}


async def cleanup_suppliers():
    """Delete all suppliers except the ones specified in KEEP_SUPPLIERS"""
    
    # Initialize database connection
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=20000,
        tls=True,
        tlsAllowInvalidCertificates=True,
    )
    database = client[settings.DATABASE_NAME]
    
    # Initialize Beanie with all models
    await init_beanie(
        database=database,
        document_models=[
            User, Product, SupplierOnboarding, SupplierAccountSettings,
            SupplierVehicle, COIDocument, Notification, Message, SupplierInvitation
        ]
    )
    
    print("🔍 Scanning for suppliers to delete...")
    print("=" * 60)
    
    # Find all supplier users
    all_suppliers = await User.find(User.role == UserRole.SUPPLIER).to_list()
    
    print(f"\n📊 Found {len(all_suppliers)} total supplier(s) in database")
    
    # Identify suppliers to keep and delete
    suppliers_to_keep = []
    suppliers_to_delete = []
    
    for supplier in all_suppliers:
        should_keep = False
        
        # Check by supplier_code
        if supplier.supplier_code and supplier.supplier_code in KEEP_SUPPLIERS["supplier_codes"]:
            should_keep = True
        
        # Check by email
        if supplier.email and supplier.email.lower() in [e.lower() for e in KEEP_SUPPLIERS["emails"]]:
            should_keep = True
        
        if should_keep:
            suppliers_to_keep.append(supplier)
            print(f"   ✅ KEEPING: {supplier.supplier_code or 'N/A'} - {supplier.email} ({supplier.full_name})")
        else:
            suppliers_to_delete.append(supplier)
            print(f"   ❌ DELETING: {supplier.supplier_code or 'N/A'} - {supplier.email} ({supplier.full_name})")
    
    print(f"\n📊 Summary:")
    print(f"   - Suppliers to keep: {len(suppliers_to_keep)}")
    print(f"   - Suppliers to delete: {len(suppliers_to_delete)}")
    
    if len(suppliers_to_delete) == 0:
        print("\n✅ No suppliers to delete!")
        return
    
    # Get user IDs to delete
    user_ids_to_delete = [str(supplier.id) for supplier in suppliers_to_delete]
    supplier_codes_to_delete = [s.supplier_code for s in suppliers_to_delete if s.supplier_code]
    
    print(f"\n📋 Related data to be deleted:")
    
    # Count related data
    products_count = await Product.find({"supplier_id": {"$in": user_ids_to_delete}}).count()
    onboardings_count = await SupplierOnboarding.find({"email": {"$in": [s.email for s in suppliers_to_delete]}}).count()
    vehicles_count = await SupplierVehicle.find({"supplier_id": {"$in": user_ids_to_delete}}).count()
    settings_count = await SupplierAccountSettings.find({"supplier_id": {"$in": user_ids_to_delete}}).count()
    coi_count = await COIDocument.find({"user_id": {"$in": user_ids_to_delete}}).count()
    notifications_count = await Notification.find({"user_id": {"$in": user_ids_to_delete}}).count()
    messages_count = await Message.find({"$or": [{"sender_id": {"$in": user_ids_to_delete}}, {"receiver_id": {"$in": user_ids_to_delete}}]}).count()
    invitations_count = await SupplierInvitation.find({"supplier_code": {"$in": supplier_codes_to_delete}}).count()
    
    print(f"   - Products: {products_count}")
    print(f"   - Onboarding records: {onboardings_count}")
    print(f"   - Vehicles: {vehicles_count}")
    print(f"   - Account settings: {settings_count}")
    print(f"   - COI documents: {coi_count}")
    print(f"   - Notifications: {notifications_count}")
    print(f"   - Messages: {messages_count}")
    print(f"   - Invitations: {invitations_count}")
    
    # Ask for confirmation
    print("\n" + "=" * 60)
    print("⚠️  WARNING: This action cannot be undone!")
    print("=" * 60)
    response = input(f"\n⚠️  Delete {len(suppliers_to_delete)} supplier(s) and all related data? (type 'DELETE' to confirm): ").strip()
    
    if response != 'DELETE':
        print("❌ Cleanup cancelled.")
        return
    
    print("\n🗑️  Starting deletion process...")
    
    deleted_counts = {
        "suppliers": 0,
        "products": 0,
        "onboardings": 0,
        "vehicles": 0,
        "settings": 0,
        "coi_documents": 0,
        "notifications": 0,
        "messages": 0,
        "invitations": 0
    }
    
    # Delete related data first
    print("\n1. Deleting products...")
    products = await Product.find({"supplier_id": {"$in": user_ids_to_delete}}).to_list()
    for product in products:
        try:
            await product.delete()
            deleted_counts["products"] += 1
        except Exception as e:
            print(f"   ⚠️  Error deleting product {product.id}: {e}")
    
    print(f"   ✅ Deleted {deleted_counts['products']} product(s)")
    
    print("\n2. Deleting onboarding records...")
    onboardings = await SupplierOnboarding.find({"email": {"$in": [s.email for s in suppliers_to_delete]}}).to_list()
    for onboarding in onboardings:
        try:
            await onboarding.delete()
            deleted_counts["onboardings"] += 1
        except Exception as e:
            print(f"   ⚠️  Error deleting onboarding {onboarding.id}: {e}")
    
    print(f"   ✅ Deleted {deleted_counts['onboardings']} onboarding record(s)")
    
    print("\n3. Deleting vehicles...")
    vehicles = await SupplierVehicle.find({"supplier_id": {"$in": user_ids_to_delete}}).to_list()
    for vehicle in vehicles:
        try:
            await vehicle.delete()
            deleted_counts["vehicles"] += 1
        except Exception as e:
            print(f"   ⚠️  Error deleting vehicle {vehicle.id}: {e}")
    
    print(f"   ✅ Deleted {deleted_counts['vehicles']} vehicle(s)")
    
    print("\n4. Deleting account settings...")
    settings_list = await SupplierAccountSettings.find({"supplier_id": {"$in": user_ids_to_delete}}).to_list()
    for setting in settings_list:
        try:
            await setting.delete()
            deleted_counts["settings"] += 1
        except Exception as e:
            print(f"   ⚠️  Error deleting settings {setting.id}: {e}")
    
    print(f"   ✅ Deleted {deleted_counts['settings']} setting(s)")
    
    print("\n5. Deleting COI documents...")
    coi_docs = await COIDocument.find({"user_id": {"$in": user_ids_to_delete}}).to_list()
    for coi in coi_docs:
        try:
            await coi.delete()
            deleted_counts["coi_documents"] += 1
        except Exception as e:
            print(f"   ⚠️  Error deleting COI {coi.id}: {e}")
    
    print(f"   ✅ Deleted {deleted_counts['coi_documents']} COI document(s)")
    
    print("\n6. Deleting notifications...")
    notifications = await Notification.find({"user_id": {"$in": user_ids_to_delete}}).to_list()
    for notification in notifications:
        try:
            await notification.delete()
            deleted_counts["notifications"] += 1
        except Exception as e:
            print(f"   ⚠️  Error deleting notification {notification.id}: {e}")
    
    print(f"   ✅ Deleted {deleted_counts['notifications']} notification(s)")
    
    print("\n7. Deleting messages...")
    messages = await Message.find({"$or": [{"sender_id": {"$in": user_ids_to_delete}}, {"receiver_id": {"$in": user_ids_to_delete}}]}).to_list()
    for message in messages:
        try:
            await message.delete()
            deleted_counts["messages"] += 1
        except Exception as e:
            print(f"   ⚠️  Error deleting message {message.id}: {e}")
    
    print(f"   ✅ Deleted {deleted_counts['messages']} message(s)")
    
    print("\n8. Deleting invitations...")
    invitations = await SupplierInvitation.find({"supplier_code": {"$in": supplier_codes_to_delete}}).to_list()
    for invitation in invitations:
        try:
            await invitation.delete()
            deleted_counts["invitations"] += 1
        except Exception as e:
            print(f"   ⚠️  Error deleting invitation {invitation.id}: {e}")
    
    print(f"   ✅ Deleted {deleted_counts['invitations']} invitation(s)")
    
    # Finally, delete the supplier users
    print("\n9. Deleting supplier users...")
    for supplier in suppliers_to_delete:
        try:
            await supplier.delete()
            deleted_counts["suppliers"] += 1
            print(f"   🗑️  Deleted: {supplier.supplier_code or 'N/A'} - {supplier.email}")
        except Exception as e:
            print(f"   ⚠️  Error deleting supplier {supplier.id}: {e}")
    
    print(f"\n✅ Deleted {deleted_counts['suppliers']} supplier user(s)")
    
    # Final summary
    print("\n" + "=" * 60)
    print("✅ CLEANUP COMPLETE!")
    print("=" * 60)
    print(f"\n📊 Deletion Summary:")
    print(f"   - Suppliers: {deleted_counts['suppliers']}")
    print(f"   - Products: {deleted_counts['products']}")
    print(f"   - Onboarding records: {deleted_counts['onboardings']}")
    print(f"   - Vehicles: {deleted_counts['vehicles']}")
    print(f"   - Account settings: {deleted_counts['settings']}")
    print(f"   - COI documents: {deleted_counts['coi_documents']}")
    print(f"   - Notifications: {deleted_counts['notifications']}")
    print(f"   - Messages: {deleted_counts['messages']}")
    print(f"   - Invitations: {deleted_counts['invitations']}")
    
    print(f"\n✅ Kept {len(suppliers_to_keep)} supplier(s):")
    for supplier in suppliers_to_keep:
        print(f"   - {supplier.supplier_code or 'N/A'} - {supplier.email} ({supplier.full_name})")


async def main():
    print("🧹 Supplier Cleanup Script")
    print("=" * 60)
    print(f"Keeping suppliers:")
    for code in KEEP_SUPPLIERS["supplier_codes"]:
        print(f"   - {code}")
    for email in KEEP_SUPPLIERS["emails"]:
        print(f"   - {email}")
    print("=" * 60)
    
    try:
        await cleanup_suppliers()
        return 0
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        # Close connection
        if 'client' in locals():
            client.close()


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

