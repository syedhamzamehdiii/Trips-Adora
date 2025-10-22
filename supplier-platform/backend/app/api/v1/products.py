# app/api/v1/products.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
import math

from app.models.user import User
from app.models.product import ProductStatus
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductPublishRequest,
    ProductStatusUpdate
)
from app.services.product_service import ProductService
from app.core.dependencies import get_current_user


router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new product.
    Requires authentication.
    """
    product = await ProductService.create_product(
        product_data=product_data,
        supplier_id=str(current_user.id)
    )
    
    return ProductResponse(**product.model_dump(), id=str(product.id))


@router.get("/", response_model=ProductListResponse)
async def get_my_products(
    status_filter: Optional[ProductStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """
    Get all products for the authenticated supplier.
    Supports filtering by status and pagination.
    """
    skip = (page - 1) * page_size
    
    products, total = await ProductService.get_products_by_supplier(
        supplier_id=str(current_user.id),
        status=status_filter,
        skip=skip,
        limit=page_size
    )
    
    total_pages = math.ceil(total / page_size)
    
    return ProductListResponse(
        products=[ProductResponse(**p.model_dump(), id=str(p.id)) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/published", response_model=ProductListResponse)
async def get_published_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    destination: Optional[str] = Query(None)
):
    """
    Get all published products (PUBLIC endpoint for customers).
    Supports filtering by category and destination.
    """
    skip = (page - 1) * page_size
    
    products, total = await ProductService.get_published_products(
        skip=skip,
        limit=page_size,
        category=category,
        destination=destination
    )
    
    total_pages = math.ceil(total / page_size)
    
    return ProductListResponse(
        products=[ProductResponse(**p.model_dump(), id=str(p.id)) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """
    Get a specific product by ID (PUBLIC endpoint).
    Increments view count.
    """
    product = await ProductService.increment_views(product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return ProductResponse(**product.model_dump(), id=str(product.id))


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update a product.
    Only the owner can update their products.
    """
    product = await ProductService.update_product(
        product_id=product_id,
        product_update=product_update,
        supplier_id=str(current_user.id)
    )
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to update it"
        )
    
    return ProductResponse(**product.model_dump(), id=str(product.id))


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a product.
    Only the owner can delete their products.
    """
    success = await ProductService.delete_product(
        product_id=product_id,
        supplier_id=str(current_user.id)
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to delete it"
        )
    
    return None


@router.post("/{product_id}/publish", response_model=ProductResponse)
async def publish_product(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Publish a product (submit for review).
    Changes status to PENDING_REVIEW.
    """
    product = await ProductService.publish_product(
        product_id=product_id,
        supplier_id=str(current_user.id)
    )
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to publish it"
        )
    
    return ProductResponse(**product.model_dump(), id=str(product.id))


@router.post("/{product_id}/draft", response_model=ProductResponse)
async def save_as_draft(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Save product as draft.
    Changes status to DRAFT.
    """
    product = await ProductService.save_as_draft(
        product_id=product_id,
        supplier_id=str(current_user.id)
    )
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to save it as draft"
        )
    
    return ProductResponse(**product.model_dump(), id=str(product.id))


@router.get("/search/query", response_model=ProductListResponse)
async def search_products(
    q: str = Query(..., min_length=2, description="Search term"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """
    Search published products by title or description (PUBLIC endpoint).
    """
    skip = (page - 1) * page_size
    
    products, total = await ProductService.search_products(
        search_term=q,
        skip=skip,
        limit=page_size
    )
    
    total_pages = math.ceil(total / page_size)
    
    return ProductListResponse(
        products=[ProductResponse(**p.model_dump(), id=str(p.id)) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

