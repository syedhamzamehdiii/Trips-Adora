from fastapi import APIRouter, Query, HTTPException, status
from typing import Any, List, Optional
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
        
        # Import schemas
        from app.schemas.product import Highlight, IncludedExcluded, ItineraryItem, PickupDropoff
        
        # Format highlights
        highlights = []
        if product.get("highlights"):
            for h in product.get("highlights", []):
                if isinstance(h, dict):
                    highlights.append(Highlight(icon=h.get("icon"), text=h.get("text", "")))
                elif isinstance(h, str):
                    highlights.append(Highlight(text=h))
        
        # Format included_excluded
        included_excluded = None
        if product.get("included_excluded"):
            inc_exc = product.get("included_excluded")
            included_excluded = IncludedExcluded(
                included=inc_exc.get("included", []) if isinstance(inc_exc, dict) else [],
                excluded=inc_exc.get("excluded", []) if isinstance(inc_exc, dict) else []
            )
        
        # Helper to normalize list values
        def _ensure_list(value):
            if not value:
                return []
            if isinstance(value, list):
                return value
            return [value]

        # Format itinerary - prefer rich data stored in custom_fields
        itinerary: List[ItineraryItem] = []
        custom_fields = product.get("custom_fields") if isinstance(product.get("custom_fields"), dict) else {}

        itinerary_sources: List[Any] = []
        if custom_fields:
            for key in ["itineraries_full", "itinerary_full", "itineraries", "itinerary"]:
                data = custom_fields.get(key)
                if data:
                    itinerary_sources.append(data)
        # Fallback to top-level fields
        for key in ["itineraries", "itinerary"]:
            data = product.get(key)
            if data:
                itinerary_sources.append(data)

        for source in itinerary_sources:
            if not isinstance(source, list):
                continue
            for item in source:
                if not isinstance(item, dict):
                    continue
                itinerary.append(
                    ItineraryItem(
                        location=item.get("location") or item.get("placeName") or item.get("title"),
                        title=item.get("title") or item.get("placeName") or item.get("location"),
                        description=item.get("description", ""),
                        time=item.get("time"),
                        timeSpent=item.get("timeSpent"),
                        isFree=item.get("isFree", item.get("entryFree")),
                        photo=item.get("photo") or item.get("croppedPhoto"),
                        attractionType=item.get("attractionType") or item.get("attractionsType"),
                        activities=_ensure_list(item.get("activities"))
                    )
                )
            if itinerary:
                break  # stop at the richest dataset available

        # Format pickup_dropoff - merge data from multiple possible sources
        pickup_locations: List[Any] = []
        dropoff_locations: List[Any] = []
        pickup_time: Optional[str] = None

        if custom_fields:
            pickup_locations.extend(_ensure_list(custom_fields.get("pickup_locations")))
            dropoff_locations.extend(_ensure_list(custom_fields.get("dropoff_locations")))
            pickup_time = custom_fields.get("pickup_time") or pickup_time

        # Legacy fields sometimes stored at top-level
        pickup_locations.extend(_ensure_list(product.get("pickupLocations")))
        dropoff_locations.extend(_ensure_list(product.get("dropoffLocations")))
        pickup_time = product.get("pickupTime") or pickup_time

        pd = product.get("pickup_dropoff")
        if isinstance(pd, dict):
            pickup_locations.extend(_ensure_list(pd.get("pickup_locations") or pd.get("pickup_location")))
            dropoff_locations.extend(_ensure_list(pd.get("dropoff_locations") or pd.get("dropoff_location")))
            pickup_time = pd.get("pickup_time") or pickup_time

        # Remove falsy values while preserving order
        pickup_locations = [loc for loc in pickup_locations if loc]
        dropoff_locations = [loc for loc in dropoff_locations if loc]

        pickup_dropoff = (
            PickupDropoff(
                pickup_locations=pickup_locations,
                pickup_time=pickup_time,
                dropoff_locations=dropoff_locations
            )
            if (pickup_locations or dropoff_locations or pickup_time)
            else None
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
            groupSize=product.get("groupSize"),
            highlights=highlights,
            included_excluded=included_excluded,
            itinerary=itinerary,
            pickup_dropoff=pickup_dropoff
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching product: {str(e)}"
        )

