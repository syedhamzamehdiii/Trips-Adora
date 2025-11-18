from fastapi import APIRouter, Query, HTTPException, status
from typing import Any, List, Optional
import math
from datetime import datetime

from app.schemas.product import (
    ProductResponse,
    ProductListResponse,
    Highlight,
    IncludedExcluded,
    ItineraryItem,
    PickupDropoff,
    VehicleDetails,
    Accessibility,
    FAQ,
    CancellationPolicy,
    CancellationTier,
)
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
        
        # DEBUG: Log raw product data from MongoDB
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"🔍 [DEBUG] Raw product from MongoDB (ID: {product_id}):")
        logger.info(f"   - guide_type: {product.get('guide_type')}")
        logger.info(f"   - things_to_carry: {product.get('things_to_carry')}")
        logger.info(f"   - languages: {product.get('languages')}")
        logger.info(f"   - included_excluded: {product.get('included_excluded')}")
        logger.info(f"   - vehicle_details: {product.get('vehicle_details')}")
        logger.info(f"   - accessibility: {product.get('accessibility')}")
        logger.info(f"   - highlights: {product.get('highlights')}")
        logger.info(f"   - itinerary: {len(product.get('itinerary', []))} items")
        logger.info(f"   - pickup_dropoff: {product.get('pickup_dropoff')}")
        
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
        
        # Extract guide_type, things_to_carry, languages
        guide_type = product.get("guide_type")
        things_to_carry = product.get("things_to_carry", [])
        if not isinstance(things_to_carry, list):
            things_to_carry = [things_to_carry] if things_to_carry else []
        
        languages = product.get("languages", [])
        if not isinstance(languages, list):
            languages = [languages] if languages else []
        
        # DEBUG: Log extracted values
        logger.info(f"🔍 [DEBUG] Extracted values:")
        logger.info(f"   - guide_type: {guide_type}")
        logger.info(f"   - things_to_carry: {things_to_carry}")
        logger.info(f"   - languages: {languages}")
        
        # Format vehicle_details
        vehicle_details = None
        if product.get("vehicle_details"):
            vd = product.get("vehicle_details")
            if isinstance(vd, dict):
                vehicle_details = VehicleDetails(
                    vehicle_type=vd.get("vehicle_type"),
                    vehicle_model=vd.get("vehicle_model"),
                    vehicle_year=vd.get("vehicle_year"),
                    capacity=vd.get("capacity")
                )
        
        # Format accessibility
        accessibility = None
        if product.get("accessibility"):
            acc = product.get("accessibility")
            if isinstance(acc, dict):
                accessibility = Accessibility(
                    wheelchair_accessible=acc.get("wheelchair_accessible", False),
                    service_animals_allowed=acc.get("service_animals_allowed", False),
                    infant_seat_available=acc.get("infant_seat_available", False),
                    stroller_friendly=acc.get("stroller_friendly", False)
                )
        
        # Format FAQs
        faqs = []
        if product.get("faqs"):
            for f in product.get("faqs", []):
                if isinstance(f, dict):
                    faqs.append(FAQ(question=f.get("question", ""), answer=f.get("answer", "")))

        # Cancellation policy
        cancellation_policy = None
        raw_policy = product.get("cancellation_policy")
        if isinstance(raw_policy, dict):
            schedule = []
            for tier in raw_policy.get("schedule", []):
                if isinstance(tier, dict):
                    schedule.append(
                        CancellationTier(
                            label=tier.get("label"),
                            percentage=tier.get("percentage"),
                            note=tier.get("note")
                        )
                    )
                elif isinstance(tier, (str, int, float)):
                    schedule.append(
                        CancellationTier(
                            label=str(tier),
                            percentage=None,
                            note=None
                        )
                    )
            notes = []
            raw_notes = raw_policy.get("notes")
            if isinstance(raw_notes, list):
                notes = [note for note in raw_notes if isinstance(note, str) and note.strip()]
            cancellation_policy = CancellationPolicy(
                free_cancellation_text=raw_policy.get("free_cancellation_text") or raw_policy.get("freeCancellationText"),
                schedule=schedule,
                notes=notes
            )
        
        # Extract selling_points and style_theme
        selling_points = product.get("selling_points", [])
        if not isinstance(selling_points, list):
            selling_points = [selling_points] if selling_points else []
        
        style_theme = product.get("style_theme")
        
        # Extract gallery_images
        gallery_images = product.get("gallery_images", [])
        if not isinstance(gallery_images, list):
            gallery_images = []
        
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
        available_days = []
        available_time_slots = []
        
        if isinstance(pd, dict):
            # Support both singular and plural field names
            pickup_loc = pd.get("pickup_locations") or pd.get("pickup_location")
            dropoff_loc = pd.get("dropoff_locations") or pd.get("dropoff_location")
            pickup_locations.extend(_ensure_list(pickup_loc))
            dropoff_locations.extend(_ensure_list(dropoff_loc))
            pickup_time = pd.get("pickup_time") or pickup_time
            # Also extract available_days and available_time_slots
            available_days = pd.get("available_days", [])
            available_time_slots = pd.get("available_time_slots", [])

        # Remove falsy values while preserving order
        pickup_locations = [loc for loc in pickup_locations if loc]
        dropoff_locations = [loc for loc in dropoff_locations if loc]
        
        pickup_dropoff = (
            PickupDropoff(
                pickup_locations=pickup_locations,
                pickup_time=pickup_time,
                dropoff_locations=dropoff_locations,
                available_days=available_days if isinstance(available_days, list) else [],
                available_time_slots=available_time_slots if isinstance(available_time_slots, list) else []
            )
            if (pickup_locations or dropoff_locations or pickup_time)
            else None
        )
        
        # Fetch supplier information (business_name)
        supplier_id = product.get("supplier_id")
        supplier_business_name = (
            product.get("supplier_business_name")
            or product.get("business_name")
            or product.get("supplier_name")
        )
        if supplier_id:
            try:
                from app.core.database import get_database
                from bson import ObjectId
                db = get_database()
                # Try to find supplier in users collection
                try:
                    supplier_user = await db.users.find_one(
                        {"_id": ObjectId(supplier_id) if ObjectId.is_valid(supplier_id) else supplier_id},
                        {"business_name": 1, "legal_name": 1, "company_name": 1}
                    )
                    if supplier_user:
                        supplier_business_name = (
                            supplier_user.get("business_name")
                            or supplier_user.get("legal_name")
                            or supplier_user.get("company_name")
                            or supplier_business_name
                        )
                        logger.info(f"🔍 [DEBUG] Found supplier business_name: {supplier_business_name}")
                except:
                    pass
                
                # Try suppliers collection as fallback
                if not supplier_business_name:
                    supplier = await db.suppliers.find_one(
                        {"user_id": str(supplier_id)},
                        {"business_name": 1, "legal_name": 1, "company_name": 1}
                    )
                    if supplier:
                        supplier_business_name = (
                            supplier.get("business_name")
                            or supplier.get("legal_name")
                            or supplier.get("company_name")
                            or supplier_business_name
                        )
                        logger.info(f"🔍 [DEBUG] Found supplier business_name from suppliers collection: {supplier_business_name}")
            except Exception as e:
                logger.warning(f"Could not fetch supplier information: {e}")
        
        # Create response
        response = ProductResponse(
            id=product.get("id", ""),
            title=product.get("title", ""),
            tagline=product.get("tagline"),
            description=product.get("description", ""),
            category=product.get("category", "tour"),
            images=product.get("images", []),
            hero_image=product.get("hero_image"),
            gallery_images=gallery_images,
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
            # Product details fields
            guide_type=guide_type,
            things_to_carry=things_to_carry,
            languages=languages,
            highlights=highlights,
            included_excluded=included_excluded,
            itinerary=itinerary,
            pickup_dropoff=pickup_dropoff,
            vehicle_details=vehicle_details,
            accessibility=accessibility,
            faqs=faqs,
            cancellation_policy=cancellation_policy,
            selling_points=selling_points,
            style_theme=style_theme,
            supplier_business_name=supplier_business_name,
            supplier_id=str(supplier_id) if supplier_id else None
        )
        
        # DEBUG: Log response data
        logger.info(f"🔍 [DEBUG] ProductResponse created:")
        logger.info(f"   - guide_type: {response.guide_type}")
        logger.info(f"   - things_to_carry count: {len(response.things_to_carry)}")
        logger.info(f"   - languages count: {len(response.languages)}")
        logger.info(f"   - highlights count: {len(response.highlights)}")
        logger.info(f"   - included_excluded: {response.included_excluded is not None}")
        logger.info(f"   - itinerary count: {len(response.itinerary)}")
        logger.info(f"   - vehicle_details: {response.vehicle_details is not None}")
        logger.info(f"   - accessibility: {response.accessibility is not None}")
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching product: {str(e)}"
        )

