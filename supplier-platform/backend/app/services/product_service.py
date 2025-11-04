# app/services/product_service.py
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId
from app.models.product import Product, ProductStatus
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    """Service layer for product operations"""
    
    @staticmethod
    async def create_product(product_data: ProductCreate, supplier_id: str) -> Product:
        """Create a new product"""
        product_dict = product_data.model_dump()
        product_dict["supplier_id"] = supplier_id
        product = Product(**product_dict)
        await product.insert()
        return product
    
    @staticmethod
    async def get_product_by_id(product_id: str) -> Optional[Product]:
        """Get a product by ID"""
        try:
            return await Product.get(PydanticObjectId(product_id))
        except:
            return None
    
    @staticmethod
    async def get_products_by_supplier(
        supplier_id: str,
        status: Optional[ProductStatus] = None,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Product], int]:
        """Get products for a specific supplier with pagination"""
        query = {"supplier_id": supplier_id}
        if status:
            query["status"] = status
        
        total = await Product.find(query).count()
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
        """Publish a product (change status to published - directly visible to customers)"""
        product = await ProductService.get_product_by_id(product_id)
        
        if not product or product.supplier_id != supplier_id:
            return None
        
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

