from fastapi import APIRouter, Query, HTTPException, status
from typing import List, Optional
import math
from datetime import datetime

from app.schemas.product import ProductResponse, ProductListResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/published", response_model=ProductListResponse)
async def get_published_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    destination: Optional[str] = Query(None, description="Filter by destination"),
    search: Optional[str] = Query(None, description="Search term")
):
    """
    Get all published products (PUBLIC endpoint for customers).
    Supports filtering by category, destination, and search.
    """
    try:
        skip = (page - 1) * page_size
        
        products, total = await ProductService.get_published_products(
            skip=skip,
            limit=page_size,
            category=category,
            destination=destination,
            search=search
        )
        
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        
        # Format products for response
        formatted_products = []
        for product in products:
            formatted_products.append(ProductResponse(
                id=product.get("id", ""),
                title=product.get("title", ""),
                tagline=product.get("tagline"),
                description=product.get("description", ""),
                category=product.get("category", "tour"),
                images=product.get("images", []),
                hero_image=product.get("hero_image"),
                price=product.get("price", 0.0),
                currency=product.get("currency", "USD"),
                price_unit=product.get("price_unit", "Per Group"),
                destination=product.get("destination"),
                duration=product.get("duration"),
                activity_type=product.get("activity_type"),
                rating=product.get("rating"),
                reviews_count=product.get("reviews_count", 0),
                views=product.get("views", 0),
                bookings_count=product.get("bookings_count", 0),
                created_at=product.get("created_at") or datetime.utcnow(),
                published_at=product.get("published_at"),
                location=product.get("location"),
                groupSize=product.get("groupSize")
            ))
        
        return ProductListResponse(
            products=formatted_products,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching products: {str(e)}"
        )


@router.get("/top-picks", response_model=List[ProductResponse])
async def get_top_picks(
    limit: int = Query(4, ge=1, le=20, description="Number of top picks")
):
    """
    Get top picks - most popular published products.
    """
    try:
        products = await ProductService.get_top_picks(limit=limit)
        
        formatted_products = []
        for product in products:
            formatted_products.append(ProductResponse(
                id=product.get("id", ""),
                title=product.get("title", ""),
                tagline=product.get("tagline"),
                description=product.get("description", ""),
                category=product.get("category", "tour"),
                images=product.get("images", []),
                hero_image=product.get("hero_image"),
                price=product.get("price", 0.0),
                currency=product.get("currency", "USD"),
                price_unit=product.get("price_unit", "Per Group"),
                destination=product.get("destination"),
                duration=product.get("duration"),
                activity_type=product.get("activity_type"),
                rating=product.get("rating"),
                reviews_count=product.get("reviews_count", 0),
                views=product.get("views", 0),
                bookings_count=product.get("bookings_count", 0),
                created_at=product.get("created_at") or datetime.utcnow(),
                published_at=product.get("published_at"),
                location=product.get("location"),
                groupSize=product.get("groupSize")
            ))
        
        return formatted_products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching top picks: {str(e)}"
        )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """
    Get a specific product by ID (PUBLIC endpoint).
    """
    try:
        product = await ProductService.get_product_by_id(product_id)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return ProductResponse(
            id=product.get("id", ""),
            title=product.get("title", ""),
            tagline=product.get("tagline"),
            description=product.get("description", ""),
            category=product.get("category", "tour"),
            images=product.get("images", []),
            hero_image=product.get("hero_image"),
            price=product.get("price", 0.0),
            currency=product.get("currency", "USD"),
            price_unit=product.get("price_unit", "Per Group"),
            destination=product.get("destination"),
            duration=product.get("duration"),
            activity_type=product.get("activity_type"),
            rating=product.get("rating"),
            reviews_count=product.get("reviews_count", 0),
            views=product.get("views", 0),
            bookings_count=product.get("bookings_count", 0),
            created_at=product.get("created_at", datetime.utcnow()),
            published_at=product.get("published_at"),
            location=product.get("location"),
            groupSize=product.get("groupSize")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching product: {str(e)}"
        )

