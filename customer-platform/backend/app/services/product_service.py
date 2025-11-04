from typing import List, Optional, Tuple
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
import logging

logger = logging.getLogger(__name__)


class ProductService:
    """Service layer for product operations for customer platform"""
    
    @staticmethod
    async def get_published_products(
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        destination: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        """
        Get all published products from MongoDB.
        Returns products and total count.
        """
        try:
            db = get_database()
            collection = db.products
            
            # Build query for published products
            query = {"status": "published"}
            
            if category:
                query["category"] = category
            
            if destination:
                query["destination"] = {"$regex": destination, "$options": "i"}
            
            if search:
                query["$or"] = [
                    {"title": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}}
                ]
            
            # Get total count
            total = await collection.count_documents(query)
            
            # Get products with pagination
            cursor = collection.find(query).skip(skip).limit(limit).sort("published_at", -1)
            products = await cursor.to_list(length=limit)
            
            # Convert ObjectId to string and format data
            formatted_products = []
            for product in products:
                product["id"] = str(product["_id"])
                del product["_id"]
                
                # Set location from destination if available
                if "destination" in product:
                    product["location"] = product["destination"]
                
                # Set groupSize from activity_type or vehicle_details
                if "activity_type" in product and product["activity_type"]:
                    if "Private" in product["activity_type"]:
                        product["groupSize"] = "Up to 12"
                    elif "Group" in product["activity_type"]:
                        product["groupSize"] = "Up to 20"
                
                formatted_products.append(product)
            
            return formatted_products, total
            
        except Exception as e:
            logger.error(f"Error fetching published products: {e}")
            return [], 0
    
    @staticmethod
    async def get_product_by_id(product_id: str) -> Optional[dict]:
        """Get a specific product by ID"""
        try:
            db = get_database()
            collection = db.products
            
            product = await collection.find_one({
                "_id": ObjectId(product_id), 
                "status": "published"
            })
            
            if product:
                product["id"] = str(product["_id"])
                del product["_id"]
                
                # Set location from destination if available
                if "destination" in product:
                    product["location"] = product["destination"]
                
                # Set groupSize
                if "activity_type" in product and product["activity_type"]:
                    if "Private" in product["activity_type"]:
                        product["groupSize"] = "Up to 12"
                    elif "Group" in product["activity_type"]:
                        product["groupSize"] = "Up to 20"
            
            return product
            
        except Exception as e:
            logger.error(f"Error fetching product by ID: {e}")
            return None
    
    @staticmethod
    async def get_top_picks(limit: int = 4) -> List[dict]:
        """Get top picks - most popular published products"""
        try:
            db = get_database()
            collection = db.products
            
            # Get top products by views, bookings, or rating
            cursor = collection.find({"status": "published"}).sort([
                ("views", -1),
                ("bookings_count", -1),
                ("rating", -1)
            ]).limit(limit)
            
            products = await cursor.to_list(length=limit)
            
            formatted_products = []
            for product in products:
                product["id"] = str(product["_id"])
                del product["_id"]
                
                if "destination" in product:
                    product["location"] = product["destination"]
                
                if "activity_type" in product and product["activity_type"]:
                    if "Private" in product["activity_type"]:
                        product["groupSize"] = "Up to 12"
                    elif "Group" in product["activity_type"]:
                        product["groupSize"] = "Up to 20"
                
                formatted_products.append(product)
            
            return formatted_products
            
        except Exception as e:
            logger.error(f"Error fetching top picks: {e}")
            return []

