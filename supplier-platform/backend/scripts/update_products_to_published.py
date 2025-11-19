"""
Utility script to update existing products to published status.

This script updates all products (draft, pending_review, etc.) to published status
so they become visible to customers globally.

Usage:
    python -m scripts.update_products_to_published

Or from the backend directory:
    python scripts/update_products_to_published.py
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import connect_to_mongo, close_mongo_connection
from app.models.product import Product, ProductStatus
from datetime import datetime


async def update_products_to_published():
    """
    Update all existing products to published status.
    Only updates products that are not already published.
    """
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        await connect_to_mongo()
        
        # Find all products that are not published
        products = await Product.find(
            {"status": {"$ne": ProductStatus.PUBLISHED}}
        ).to_list()
        
        if not products:
            print("✅ No products to update. All products are already published.")
            return
        
        print(f"📦 Found {len(products)} products to update...")
        
        updated_count = 0
        for product in products:
            old_status = product.status
            product.status = ProductStatus.PUBLISHED
            product.published_at = datetime.utcnow()
            product.updated_at = datetime.utcnow()
            await product.save()
            updated_count += 1
            print(f"  ✅ Updated product '{product.title[:50]}...' from {old_status} to published")
        
        print(f"\n✅ Successfully updated {updated_count} products to published status!")
        print(f"🎉 All products are now visible to customers globally.")
        
    except Exception as e:
        print(f"❌ Error updating products: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        # Close database connection
        await close_mongo_connection()
        print("\n🔌 Database connection closed.")


if __name__ == "__main__":
    print("=" * 60)
    print("🔄 Updating Products to Published Status")
    print("=" * 60)
    print()
    
    asyncio.run(update_products_to_published())


