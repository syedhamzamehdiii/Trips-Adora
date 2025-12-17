# app/api/v1/products.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict
from pymongo.errors import DocumentTooLarge
import math

from app.models.user import User
from app.models.product import ProductStatus
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductSummary,
    ProductSummaryListResponse,
    ProductPublishRequest,
    ProductStatusUpdate
)
from app.services.product_service import ProductService
from app.services.currency_service import convert_to_usd
from app.core.dependencies import get_current_user
from pydantic import BaseModel


router = APIRouter(prefix="/products", tags=["products"])


class ProductAvailabilityUpdate(BaseModel):
    inactive_dates: Optional[List[str]] = None
    vehicle_id: Optional[str] = None
    vehicle_inactive_dates: Optional[List[str]] = None


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new product.
    Requires authentication.
    
    Products are created as DRAFT. Suppliers can submit for admin approval via
    POST /products/{product_id}/publish (status -> pending_review).
    """
    try:
        # Suppliers must be approved (verified) before they can create products
        if not getattr(current_user, "is_verified", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your supplier account is pending admin approval. Please wait until your registration is approved.",
            )
        print(f"📦 Creating product for supplier: {current_user.id}")
        print(f"   Title: {product_data.title[:50]}...")
        
        product = await ProductService.create_product(
            product_data=product_data,
            supplier_id=str(current_user.id)
        )
        
        print(f"✅ Product created successfully with ID: {product.id}")
        print(f"   Status: {product.status}")
        print(f"   Published at: {product.published_at}")
        
        # Use mode='json' and exclude_none=False to ensure nested fields are properly serialized
        return ProductResponse(**product.model_dump(mode='json', exclude={"id"}, exclude_none=False), id=str(product.id))
    except DocumentTooLarge:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Product media is too large. Please compress or remove some images and try again.",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating product: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )


@router.get("/")
async def get_my_products(
    status_filter: Optional[ProductStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    summary: bool = Query(False, description="Return lightweight summary (excludes images and heavy fields)"),
    current_user: User = Depends(get_current_user)
):
    """
    Get all products for the authenticated supplier.
    Supports filtering by status and pagination.
    
    Use summary=true for faster list views (excludes images, itinerary, etc.)
    """
    skip = (page - 1) * page_size
    
    products, total = await ProductService.get_products_by_supplier(
        supplier_id=str(current_user.id),
        status=status_filter,
        skip=skip,
        limit=page_size,
        summary_only=summary
    )
    
    total_pages = math.ceil(total / page_size)
    
    if summary:
        # Return lightweight summaries
        summaries = []
        for p in products:
            # Extract hero_image URL if it's a URL, otherwise None
            hero_image_url = None
            if hasattr(p, 'hero_image') and p.hero_image:
                # If it's a URL (starts with http), use it; otherwise skip base64
                if isinstance(p.hero_image, str) and p.hero_image.startswith(('http://', 'https://', '/')):
                    hero_image_url = p.hero_image
                # For base64, we skip it in summary mode

            # Normalize price to USD for display
            price_usd = await convert_to_usd(p.price, p.currency)
        
            summaries.append(ProductSummary(
                id=str(p.id),
                supplier_id=p.supplier_id,
                title=p.title,
                category=p.category,
                tagline=p.tagline,
                status=p.status,
                price=price_usd,
                currency="USD",
                destination=p.destination,
                duration=p.duration,
                views=p.views,
                bookings_count=p.bookings_count,
                rating=p.rating,
                reviews_count=p.reviews_count,
                created_at=p.created_at,
                updated_at=p.updated_at,
                published_at=p.published_at,
                hero_image_url=hero_image_url
            ))
    
        return ProductSummaryListResponse(
            products=summaries,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    else:
        # Return full products
        # Use mode='json' and exclude_none=False to ensure nested fields are properly serialized
        return ProductListResponse(
            products=[ProductResponse(**p.model_dump(mode='json', exclude={"id"}, exclude_none=False), id=str(p.id)) for p in products],
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
    
    # Normalize prices to USD for each product
    normalized_products = []
    for p in products:
        price_usd = await convert_to_usd(p.price, p.currency)
        data = p.model_dump(exclude={"id"})
        data["price"] = price_usd
        data["currency"] = "USD"
        normalized_products.append(ProductResponse(**data, id=str(p.id)))

    return ProductListResponse(
        products=normalized_products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


# IMPORTANT: LocalStorage routes must come BEFORE /{product_id} route to avoid route conflicts
@router.post("/localstorage/sync")
async def sync_localstorage_products(products: List[dict]):
    """
    Sync products from supplier platform localStorage to backend cache.
    Called by supplier platform frontend when products are published.
    """
    from app.services.localstorage_cache import LocalStorageCache
    
    count = LocalStorageCache.sync_products(products)
    return {"synced": count, "message": f"Synced {count} products to cache"}


@router.post("/localstorage/sync-full/{product_id}")
async def sync_full_product_data(product_id: str, full_data: dict):
    """
    Sync full product data (including images) for a specific product.
    """
    from app.services.localstorage_cache import LocalStorageCache
    
    success = LocalStorageCache.sync_full_product_data(product_id, full_data)
    return {"success": success, "message": "Full data synced" if success else "Product not found"}


@router.get("/localstorage")
async def get_localstorage_products():
    """
    Get published products from localStorage cache (PUBLIC endpoint for customer platform).
    This endpoint serves products stored in cache when database is not available.
    """
    try:
        from app.services.localstorage_cache import LocalStorageCache
        
        products = LocalStorageCache.get_published_products()
        return {"products": products, "total": len(products)}
    except Exception as e:
        # Log error but return empty list instead of crashing
        print(f"Error in get_localstorage_products: {e}")
        import traceback
        traceback.print_exc()
        return {"products": [], "total": 0}


@router.get("/localstorage/stats")
async def get_cache_stats():
    """
    Get cache statistics.
    """
    try:
        from app.services.localstorage_cache import LocalStorageCache
        
        return LocalStorageCache.get_cache_stats()
    except Exception as e:
        # Log error but return empty stats instead of crashing
        print(f"Error in get_cache_stats: {e}")
        import traceback
        traceback.print_exc()
        return {"total_products": 0, "published_count": 0, "last_sync": None}


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
    
    # Use mode='json' and exclude_none=False to ensure nested fields (like pickup_configurations) are properly serialized.
    # This ensures that empty lists and nested objects are included in the response.
    product_dict = product.model_dump(mode='json', exclude={"id"}, exclude_none=False)

    # Create and return ProductResponse
    return ProductResponse(**product_dict, id=str(product.id))


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
    
    return ProductResponse(**product.model_dump(exclude={"id"}), id=str(product.id))


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


@router.put("/{product_id}/availability", response_model=ProductResponse)
async def update_product_availability(
    product_id: str,
    payload: ProductAvailabilityUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Update availability information for a product:
    - inactive_dates: dates when the whole product is not available
    - vehicle_inactive_dates for a specific vehicle_id
    """
    from app.models.product import Product  # local import to avoid circular

    product = await ProductService.get_product_by_id_and_supplier(
        product_id=product_id,
        supplier_id=str(current_user.id),
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to update it",
        )

    # Load Beanie document to update fields safely
    beanie_product = await Product.get(product_id)
    if not beanie_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Update product-level inactive dates
    if payload.inactive_dates is not None:
        beanie_product.inactive_dates = list({d.strip() for d in payload.inactive_dates if d})

    # Update vehicle-level inactive dates
    if payload.vehicle_id and payload.vehicle_inactive_dates is not None:
        vid = str(payload.vehicle_id)
        existing: Dict[str, List[str]] = beanie_product.vehicle_inactive_dates or {}
        existing[vid] = list({d.strip() for d in payload.vehicle_inactive_dates if d})
        beanie_product.vehicle_inactive_dates = existing

    await beanie_product.save()

    # Return updated product in existing response format
    return ProductResponse(
        **beanie_product.model_dump(mode="json", exclude={"id"}, exclude_none=False),
        id=str(beanie_product.id),
    )


@router.post("/{product_id}/publish", response_model=ProductResponse)
async def publish_product(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Submit a product for admin approval (status -> pending_review).
    The product becomes visible to customers only after admin approval.
    """
    if not getattr(current_user, "is_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your supplier account is pending admin approval. Please wait until your registration is approved.",
        )
    product = await ProductService.publish_product(
        product_id=product_id,
        supplier_id=str(current_user.id)
    )
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to publish it"
        )
    
    return ProductResponse(**product.model_dump(exclude={"id"}), id=str(product.id))


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
    
    return ProductResponse(**product.model_dump(exclude={"id"}), id=str(product.id))


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
        products=[ProductResponse(**p.model_dump(exclude={"id"}), id=str(p.id)) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

