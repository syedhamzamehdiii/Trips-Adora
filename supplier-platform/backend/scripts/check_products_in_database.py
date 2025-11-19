"""
Diagnostic script to check if products are being stored in the database.

This script:
1. Connects to the database
2. Counts total products
3. Shows products by status
4. Lists recent products
5. Shows product details

Usage:
    python scripts/check_products_in_database.py
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import connect_to_mongo, close_mongo_connection
from app.models.product import Product, ProductStatus


async def check_products():
    """Check products in database and display statistics"""
    try:
        print("=" * 60)
        print("🔍 Checking Products in Database")
        print("=" * 60)
        print()
        
        # Connect to database
        print("🔌 Connecting to database...")
        await connect_to_mongo()
        print("✅ Connected to database")
        print()
        
        # Count total products
        total_count = await Product.find().count()
        print(f"📊 Total Products: {total_count}")
        print()
        
        if total_count == 0:
            print("⚠️  No products found in database!")
            print()
            print("Possible reasons:")
            print("1. Products are only being saved to localStorage (not database)")
            print("2. Database connection issues")
            print("3. Products are being created but not saved")
            print("4. Wrong database being queried")
            return
        
        # Count by status
        print("📈 Products by Status:")
        for status in ProductStatus:
            count = await Product.find({"status": status}).count()
            print(f"   - {status.value}: {count}")
        print()
        
        # Get recent products
        print("📦 Recent Products (last 10):")
        recent_products = await Product.find().sort("-created_at").limit(10).to_list()
        
        if not recent_products:
            print("   No products found")
        else:
            for i, product in enumerate(recent_products, 1):
                print(f"\n   {i}. {product.title[:60]}...")
                print(f"      ID: {product.id}")
                print(f"      Status: {product.status}")
                print(f"      Supplier ID: {product.supplier_id}")
                print(f"      Created: {product.created_at}")
                print(f"      Published: {product.published_at or 'Not published'}")
                print(f"      Price: ${product.price} {product.currency}")
        
        print()
        
        # Check for published products
        published_count = await Product.find({"status": ProductStatus.PUBLISHED}).count()
        print(f"✅ Published Products: {published_count}")
        
        if published_count > 0:
            print("   These products should be visible to customers!")
        else:
            print("   ⚠️  No published products found!")
            print("   Products need to be published to be visible to customers.")
        
        print()
        
        # Check for products without published_at
        products_without_published_at = await Product.find({
            "status": ProductStatus.PUBLISHED,
            "published_at": None
        }).count()
        
        if products_without_published_at > 0:
            print(f"⚠️  Found {products_without_published_at} published products without published_at timestamp")
        
        print()
        print("=" * 60)
        print("✅ Database check complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error checking products: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        # Close database connection
        await close_mongo_connection()
        print("\n🔌 Database connection closed.")


if __name__ == "__main__":
    asyncio.run(check_products())


