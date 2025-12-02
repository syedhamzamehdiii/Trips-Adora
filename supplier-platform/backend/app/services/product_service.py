# app/services/product_service.py
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId
from app.models.product import Product, ProductStatus
from app.schemas.product import ProductCreate, ProductUpdate
from app.core.database import get_database


class ProductService:
    """Service layer for product operations"""
    
    CLOUDINARY_HOST = "res.cloudinary.com"
    CLOUDINARY_PREFIXES = ("https://res.cloudinary.com/", "http://res.cloudinary.com/")
    
    @staticmethod
    def _validate_cloudinary_url(value: Optional[str], field_name: str) -> Optional[str]:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError(f"{field_name} must be a Cloudinary URL string")
        
        trimmed = value.strip()
        if not trimmed:
            return None
        
        lowered = trimmed.lower()
        if lowered.startswith("data:") or lowered.startswith("blob:"):
            raise ValueError(f"{field_name} must reference a Cloudinary URL, not base64/blob data")
        
        if not trimmed.startswith(("http://", "https://")):
            raise ValueError(f"{field_name} must be a Cloudinary URL starting with http or https")
        
        if ProductService.CLOUDINARY_HOST not in trimmed:
            raise ValueError(f"{field_name} must point to {ProductService.CLOUDINARY_HOST}")
        
        return trimmed
    
    @staticmethod
    def _enforce_cloudinary_media(payload: dict) -> None:
        """
        Ensure all media fields contain Cloudinary URLs.
        Mutates payload (filters lists) or raises ValueError.
        """
        if payload is None:
            return
        
        def process_list(key: str):
            if key not in payload or payload[key] is None:
                return
            values = payload[key]
            if not isinstance(values, list):
                raise ValueError(f"{key} must be a list of Cloudinary URLs")
            cleaned = []
            for item in values:
                url = ProductService._validate_cloudinary_url(item, key)
                if url:
                    cleaned.append(url)
            payload[key] = cleaned
        
        process_list("images")
        process_list("gallery_images")
        
        if "hero_image" in payload:
            payload["hero_image"] = ProductService._validate_cloudinary_url(payload.get("hero_image"), "hero_image")

        # Validate itinerary photos
        if "itinerary" in payload and payload["itinerary"] is not None:
            if not isinstance(payload["itinerary"], list):
                raise ValueError("itinerary must be a list")
            cleaned_itinerary = []
            for idx, item in enumerate(payload["itinerary"]):
                if not isinstance(item, dict):
                    raise ValueError("Each itinerary entry must be an object")
                if "photo" in item:
                    item["photo"] = ProductService._validate_cloudinary_url(
                        item.get("photo"), f"itinerary[{idx}].photo"
                    )
                cleaned_itinerary.append(item)
            payload["itinerary"] = cleaned_itinerary
    
    
    @staticmethod
    async def create_product(product_data: ProductCreate, supplier_id: str) -> Product:
        """
        Create a new product.
        
        TEMPORARY: Products are auto-published (bypassing admin approval).
        TODO: When admin panel is implemented, uncomment the admin approval flow below.
        """
        product_dict = product_data.model_dump()
        product_dict["supplier_id"] = supplier_id
        
        ProductService._enforce_cloudinary_media(product_dict)
        
        # TODO: ADMIN APPROVAL FLOW (to be uncommented when admin panel is ready)
        # When admin panel is implemented, products should be created as PENDING_REVIEW
        # and only published after admin approval. Uncomment the following:
        # product_dict["status"] = ProductStatus.PENDING_REVIEW
        
        # TEMPORARY: Auto-publish products (bypass admin approval)
        product_dict["status"] = ProductStatus.PUBLISHED
        
        product = Product(**product_dict)
        await product.insert()
        
        # TEMPORARY: Set published_at timestamp immediately
        # TODO: Remove this when admin approval is enabled - published_at should be set by admin
        product.published_at = datetime.utcnow()
        await product.save()
        
        return product
    
    @staticmethod
    async def get_product_by_id(product_id: str) -> Optional[Product]:
        """Get a product by ID"""
        try:
            return await Product.get(PydanticObjectId(product_id))
        except:
            return None

    @staticmethod
    async def get_product_by_id_and_supplier(
        product_id: str,
        supplier_id: str,
    ) -> Optional[Product]:
        """
        Get a single product by ID and ensure it belongs to the given supplier.
        Used by availability/status endpoints so a supplier can only modify
        their own products.
        """
        product = await ProductService.get_product_by_id(product_id)
        if not product:
            return None
        # Only allow access when supplier_id matches
        if str(product.supplier_id) != str(supplier_id):
            return None
        return product
    
    @staticmethod
    async def get_products_by_supplier(
        supplier_id: str,
        status: Optional[ProductStatus] = None,
        skip: int = 0,
        limit: int = 20,
        summary_only: bool = False
    ) -> tuple[List[Product], int]:
        """
        Get products for a specific supplier with pagination.
        
        Args:
            supplier_id: Supplier ID
            status: Optional status filter
            skip: Number of products to skip
            limit: Maximum number of products to return
            summary_only: If True, exclude heavy fields (images, itinerary, etc.) for faster queries
        """
        query = {"supplier_id": supplier_id}
        if status:
            query["status"] = status
        
        total = await Product.find(query).count()
        
        if summary_only:
            # Use Motor directly with projection to exclude heavy fields for better performance
            db = get_database()
            collection = db[Product.Settings.name]
            
            # Projection to exclude heavy fields
            projection = {
                "_id": 1,
                "supplier_id": 1,
                "title": 1,
                "category": 1,
                "tagline": 1,
                "status": 1,
                "price": 1,
                "currency": 1,
                "destination": 1,
                "duration": 1,
                "views": 1,
                "bookings_count": 1,
                "rating": 1,
                "reviews_count": 1,
                "created_at": 1,
                "updated_at": 1,
                "published_at": 1,
                "hero_image": 1,  # Keep only hero_image for thumbnail
            }
            
            cursor = collection.find(query, projection).skip(skip).limit(limit)
            raw_products = await cursor.to_list(length=limit)
            
            # Convert to Product objects (lightweight) - use model_validate to handle missing fields
            products = []
            for raw in raw_products:
                # Build minimal dict with required fields
                product_dict = {
                    "supplier_id": raw.get("supplier_id", ""),
                    "title": raw.get("title", "Untitled"),
                    "description": "",  # Minimal description for summary
                    "category": raw.get("category"),
                    "tagline": raw.get("tagline"),
                    "status": raw.get("status", ProductStatus.DRAFT),
                    "price": raw.get("price", 0.0),
                    "currency": raw.get("currency", "USD"),
                    "destination": raw.get("destination"),
                    "duration": raw.get("duration"),
                    "views": raw.get("views", 0),
                    "bookings_count": raw.get("bookings_count", 0),
                    "rating": raw.get("rating"),
                    "reviews_count": raw.get("reviews_count", 0),
                    "created_at": raw.get("created_at", datetime.utcnow()),
                    "updated_at": raw.get("updated_at", datetime.utcnow()),
                    "published_at": raw.get("published_at"),
                    "hero_image": raw.get("hero_image"),
                }
                # Use model_validate to create Product with minimal data
                try:
                    product = Product.model_validate(product_dict)
                    product.id = raw.get("_id")
                    products.append(product)
                except Exception as e:
                    # Skip products that can't be validated
                    continue
        else:
            products = await Product.find(query).skip(skip).limit(limit).to_list()
        
        return products, total
    
    @staticmethod
    async def get_published_products(
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        destination: Optional[str] = None
    ) -> tuple[List[Product], int]:
        """Get published products (for customer view)"""
        query = {"status": ProductStatus.PUBLISHED}
        
        if category:
            query["category"] = category
        if destination:
            query["destination"] = destination
        
        total = await Product.find(query).count()
        products = await Product.find(query).skip(skip).limit(limit).to_list()
        
        return products, total
    
    @staticmethod
    async def update_product(
        product_id: str,
        product_update: ProductUpdate,
        supplier_id: str
    ) -> Optional[Product]:
        """Update a product (only if owned by supplier)"""
        product = await ProductService.get_product_by_id(product_id)
        
        if not product or product.supplier_id != supplier_id:
            return None
        
        update_data = product_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        ProductService._enforce_cloudinary_media(update_data)
        
        for field, value in update_data.items():
            setattr(product, field, value)
        
        await product.save()
        return product
    
    @staticmethod
    async def delete_product(product_id: str, supplier_id: str) -> bool:
        """Delete a product (only if owned by supplier)"""
        product = await ProductService.get_product_by_id(product_id)
        
        if not product or product.supplier_id != supplier_id:
            return False
        
        await product.delete()
        return True
    
    @staticmethod
    async def publish_product(product_id: str, supplier_id: str) -> Optional[Product]:
        """
        Publish a product (change status to published - directly visible to customers).
        
        TEMPORARY: Admin approval is bypassed.
        TODO: When admin panel is implemented, add admin approval check here.
        """
        product = await ProductService.get_product_by_id(product_id)
        
        if not product or product.supplier_id != supplier_id:
            return None
        
        # TODO: ADMIN APPROVAL CHECK (to be uncommented when admin panel is ready)
        # When admin panel is implemented, add this check:
        # if product.status != ProductStatus.PENDING_REVIEW:
        #     raise ValueError("Product must be approved by admin before publishing")
        # 
        # # Check if product has been approved by admin
        # if not product.admin_approved:  # You'll need to add this field to Product model
        #     raise ValueError("Product has not been approved by admin")
        
        # TEMPORARY: Allow direct publishing (bypass admin approval)
        product.status = ProductStatus.PUBLISHED
        product.published_at = datetime.utcnow()
        product.updated_at = datetime.utcnow()
        await product.save()
        
        return product
    
    @staticmethod
    async def save_as_draft(product_id: str, supplier_id: str) -> Optional[Product]:
        """Save product as draft"""
        product = await ProductService.get_product_by_id(product_id)
        
        if not product or product.supplier_id != supplier_id:
            return None
        
        product.status = ProductStatus.DRAFT
        product.updated_at = datetime.utcnow()
        await product.save()
        
        return product
    
    @staticmethod
    async def increment_views(product_id: str) -> Optional[Product]:
        """Increment product view count"""
        product = await ProductService.get_product_by_id(product_id)
        
        if not product:
            return None
        
        product.views += 1
        await product.save()
        
        return product
    
    @staticmethod
    async def search_products(
        search_term: str,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Product], int]:
        """Search products by title or description"""
        total = await Product.find(
            {"$text": {"$search": search_term}, "status": ProductStatus.PUBLISHED}
        ).count()
        
        products = await Product.find(
            {"$text": {"$search": search_term}, "status": ProductStatus.PUBLISHED}
        ).skip(skip).limit(limit).to_list()
        
        return products, total

