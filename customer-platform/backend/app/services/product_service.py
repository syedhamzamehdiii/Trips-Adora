from typing import List, Optional, Tuple
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
import logging

logger = logging.getLogger(__name__)


class ProductService:
    """Service layer for product operations for customer platform"""
    
    # Field projection - only fetch what we need for list views
    LIST_PROJECTION = {
        "_id": 1,
        "title": 1,
        "tagline": 1,
        "category": 1,
        "hero_image": 1,
        "images": {"$slice": 1},  # Only first image
        "price": 1,
        "currency": 1,
        "price_unit": 1,
        "destination": 1,
        "duration": 1,
        "activity_type": 1,
        "rating": 1,
        "reviews_count": 1,
        "views": 1,
        "bookings_count": 1,
        "published_at": 1,
        "created_at": 1,
        "selling_points": 1,  # Used for tags
        "supplier_id": 1,  # For fetching supplier info
        "supplier_business_name": 1,  # Direct supplier name if available
        "resolved_location": 1,  # For location display
        # Availability fields mirrored from supplier platform
        "inactive_dates": 1,
        "vehicle_inactive_dates": 1,
    }
    
    # Full projection for detail view - include supplier_id for chat functionality
    DETAIL_PROJECTION = {
        # Include all fields, including supplier_id (needed for fetching supplier info)
        # and resolved_location used for climate/comparison features.
    }
    
    @staticmethod
    def _format_product(product: dict, is_detail: bool = False) -> dict:
        """Format product data"""
        if not product:
            return None
            
        product["id"] = str(product["_id"])
        del product["_id"]
        
        # Prefer an explicitly saved resolved_location if present
        resolved_location = product.get("resolved_location")
        if resolved_location:
            product["location"] = resolved_location
        # Otherwise, fall back to destination only if it has a value
        elif "destination" in product and product.get("destination"):
            product["location"] = product.get("destination")
        
        # NOTE: groupSize is calculated in the API endpoint from vehicle capacity
        # Don't set hardcoded values here - let the API endpoint handle it
        
        return product
    
    @staticmethod
    async def get_published_products(
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        destination: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[dict], int]:
        """
        Get all published products from MongoDB with optimized query.
        Returns products and total count.
        """
        try:
            db = get_database()
            if db is None:
                logger.warning("Database connection not available, returning empty results")
                return [], 0
            
            collection = db.products
            
            # Build query - status index will be used!
            query = {"status": "published"}
            
            if category:
                query["category"] = category
            
            if destination:
                # Use regex for destination filtering
                query["destination"] = {"$regex": destination, "$options": "i"}
            
            # Only apply search filter if search term is provided and not empty
            # Handle both None and empty string cases
            if search is not None and isinstance(search, str) and search.strip():
                # Search across multiple fields using regex (works without text index)
                # This ensures all products are searchable like the regular fetch
                search_term = search.strip()
                search_regex = {"$regex": search_term, "$options": "i"}
                
                # Build $or conditions for search
                search_conditions = [
                    {"title": search_regex},
                    {"tagline": search_regex},
                    {"description": search_regex},
                    {"destination": search_regex},
                    {"category": search_regex}
                ]
                
                # If destination filter is already set, we need to combine it with search
                # The destination in $or will work alongside the destination filter
                query["$or"] = search_conditions
            
            logger.info(f"📊 Query: {query}")
            logger.info(f"📊 Search term: {search if search else 'None'}")
            
            # Get products with pagination and projection (single optimized query)
            cursor = (
                collection
                .find(query, ProductService.LIST_PROJECTION)
                .sort("published_at", -1)
                .skip(skip)
                .limit(limit)
            )
            
            products = await cursor.to_list(length=limit)
            
            # Count total (with hint to use index)
            total = await collection.count_documents(query)
            
            # Format products
            formatted_products = [
                ProductService._format_product(p) 
                for p in products
            ]
            
            logger.info(f"✅ Fetched {len(products)} products (total: {total})")
            return formatted_products, total
            
        except Exception as e:
            logger.error(f"❌ Error fetching published products: {e}")
            import traceback
            traceback.print_exc()
            return [], 0
    
    @staticmethod
    async def get_product_by_id(product_id: str) -> Optional[dict]:
        """Get a specific product by ID with full details"""
        try:
            db = get_database()
            collection = db.products
            
            # DEBUG: Log query
            logger.info(f"🔍 [DEBUG] ProductService.get_product_by_id - Querying MongoDB for product_id: {product_id}")
            
            product = await collection.find_one(
                {
                    "_id": ObjectId(product_id), 
                    "status": "published"
                },
                ProductService.DETAIL_PROJECTION
            )
            
            if product:
                # DEBUG: Log what was fetched from MongoDB
                logger.info(f"🔍 [DEBUG] ProductService.get_product_by_id - Raw MongoDB document keys: {list(product.keys())}")
                logger.info(f"🔍 [DEBUG] ProductService.get_product_by_id - Has guide_type: {'guide_type' in product}")
                logger.info(f"🔍 [DEBUG] ProductService.get_product_by_id - Has things_to_carry: {'things_to_carry' in product}")
                logger.info(f"🔍 [DEBUG] ProductService.get_product_by_id - Has languages: {'languages' in product}")
                logger.info(f"🔍 [DEBUG] ProductService.get_product_by_id - Has included_excluded: {'included_excluded' in product}")
                logger.info(f"🔍 [DEBUG] ProductService.get_product_by_id - Has vehicle_details: {'vehicle_details' in product}")
                logger.info(f"🔍 [DEBUG] ProductService.get_product_by_id - Has accessibility: {'accessibility' in product}")
                
                formatted = ProductService._format_product(product, is_detail=True)
                logger.info(f"🔍 [DEBUG] ProductService.get_product_by_id - Formatted product keys: {list(formatted.keys()) if formatted else 'None'}")
                return formatted
            else:
                logger.warning(f"🔍 [DEBUG] ProductService.get_product_by_id - Product not found or not published")
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error fetching product by ID: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    async def get_top_picks(limit: int = 4) -> List[dict]:
        """Get top picks - most popular published products"""
        try:
            db = get_database()
            if db is None:
                logger.warning("Database connection not available, returning empty top picks")
                return []
            
            collection = db.products
            
            # Use compound index for top picks
            cursor = (
                collection
                .find(
                    {"status": "published"},
                    ProductService.LIST_PROJECTION
                )
                .sort([
                    ("views", -1),
                    ("bookings_count", -1)
                ])
                .limit(limit)
            )
            
            products = await cursor.to_list(length=limit)
            
            formatted_products = [
                ProductService._format_product(p) 
                for p in products
            ]
            
            logger.info(f"✅ Fetched {len(formatted_products)} top picks")
            return formatted_products
            
        except Exception as e:
            logger.error(f"❌ Error fetching top picks: {e}")
            return []

    @staticmethod
    async def save_resolved_location(product_id: str, location: str) -> bool:
        """
        Persist a resolved location in MongoDB for the given product.

        This is used so that OpenAI is only called once per product to
        determine a clean, geocodable location string that can be re-used
        for climate/comparison features.
        """
        try:
            db = get_database()
            collection = db.products

            result = await collection.update_one(
                {"_id": ObjectId(product_id)},
                {
                    "$set": {
                        "resolved_location": location,
                        # Also set generic location field so existing
                        # frontend code can benefit immediately.
                        "location": location,
                    }
                },
            )

            return result.matched_count > 0
        except Exception as e:
            logger.error(f"❌ Error saving resolved location for product {product_id}: {e}")
            return False