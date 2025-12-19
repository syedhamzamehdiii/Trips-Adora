from fastapi import APIRouter, Query, HTTPException, status
from typing import Any, List, Optional
from pydantic import BaseModel
import math
from datetime import datetime
import logging

from app.schemas.product import (
    ProductResponse,
    ProductListResponse,
    Highlight,
    IncludedExcluded,
    ItineraryItem,
    PickupDropoff,
    PickupConfiguration,
    TimeSlotConfiguration,
    VehicleDetails,
    Vehicle,
    Accessibility,
    FAQ,
    CancellationPolicy,
    CancellationTier,
)
from app.schemas.review import ReviewListResponse
from app.services.product_service import ProductService
from app.services.currency_service import convert_to_usd
from app.services.review_service import ReviewService
from app.core.exceptions import DatabaseUnavailableError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["products"])


class ResolvedLocationRequest(BaseModel):
    """Payload for saving a resolved product location (for climate/comparison)."""
    location: str


class ResolvedLocationResponse(BaseModel):
    """Response wrapper for resolved product location."""
    product_id: str
    location: Optional[str]


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
        
        # Format products for response (normalize price to USD)
        formatted_products = []
        for product in products:
            original_price = product.get("price", 0.0)
            original_currency = product.get("currency", "USD")
            price_usd = await convert_to_usd(original_price, original_currency)

            # Get supplier business name
            supplier_id = product.get("supplier_id")
            supplier_business_name = product.get("supplier_business_name")
            if supplier_id and not supplier_business_name:
                try:
                    from app.core.database import get_database
                    from bson import ObjectId
                    db = get_database()
                    if db:
                        supplier_user = await db.users.find_one(
                            {"_id": ObjectId(supplier_id) if ObjectId.is_valid(supplier_id) else supplier_id},
                            {"business_name": 1, "legal_name": 1, "company_name": 1, "full_name": 1}
                        )
                        if supplier_user:
                            supplier_business_name = (
                                supplier_user.get("business_name")
                                or supplier_user.get("legal_name")
                                or supplier_user.get("company_name")
                                or supplier_user.get("full_name")
                            )
                except Exception as e:
                    logger.debug(f"Could not fetch supplier name: {e}")

            # Convert selling_points to tags (for frontend compatibility)
            selling_points = product.get("selling_points", [])
            tags = selling_points if isinstance(selling_points, list) else []
            if not tags and product.get("activity_type"):
                tags = [product.get("activity_type")]

            # Calculate groupSize from vehicle capacity if available
            group_size = product.get("groupSize")
            if not group_size:
                try:
                    from app.core.database import get_database
                    from bson import ObjectId
                    db = get_database()
                    if db and supplier_id:
                        vehicle_collection = db.supplier_vehicle_options
                        vehicles = await vehicle_collection.find({
                            "product_id": str(product.get("id", "")),
                            "is_active": True
                        }).to_list(length=10)
                        if vehicles:
                            max_capacity = max((v.get("capacity", 0) for v in vehicles if v.get("capacity")), default=None)
                            if max_capacity:
                                group_size = f"Up to {max_capacity}"
                except Exception as e:
                    logger.debug(f"Could not fetch vehicle capacity: {e}")

            formatted_products.append(ProductResponse(
                id=product.get("id", ""),
                title=product.get("title", ""),
                tagline=product.get("tagline"),
                description=product.get("description", ""),
                category=product.get("category", "tour"),
                images=product.get("images", []),
                hero_image=product.get("hero_image"),
                price=price_usd,
                currency="USD",
                price_unit=product.get("price_unit", "Per Group"),
                destination=product.get("destination"),
                duration=product.get("duration"),
                activity_type=product.get("activity_type"),
                rating=product.get("rating") or 0.0,  # Default to 0.0 if not set
                reviews_count=product.get("reviews_count", 0),
                views=product.get("views", 0),
                bookings_count=product.get("bookings_count", 0),
                created_at=product.get("created_at") or datetime.utcnow(),
                published_at=product.get("published_at"),
                location=product.get("location"),
                groupSize=group_size,
                supplier_business_name=supplier_business_name,
                supplier_id=str(supplier_id) if supplier_id else None,
                selling_points=tags,  # Use selling_points as tags
                inactive_dates=product.get("inactive_dates", []),
                vehicle_inactive_dates=product.get("vehicle_inactive_dates", {}),
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


@router.get("/{product_id}/resolved-location", response_model=ResolvedLocationResponse)
async def get_resolved_location(product_id: str):
    """
    Get a product's resolved location used for climate/comparison.

    This prefers any explicitly saved resolved location in MongoDB,
    then falls back to the product's existing location/destination.
    """
    try:
        logger.info(f"[RESOLVED_LOCATION] Fetching resolved location for product_id={product_id}")
        product = await ProductService.get_product_by_id(product_id)
        if not product:
            logger.warning(f"[RESOLVED_LOCATION] Product not found for product_id={product_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Prefer explicitly resolved location field if present (GPT-resolved for weather)
        # Then prefer destination (actual tour location like "Mount Fuji, Japan") over generic location (pickup city like "Tokyo, Japan")
        resolved = (
            product.get("resolved_location")
            or product.get("destination")
            or product.get("location")
        )
        logger.info(
            f"[RESOLVED_LOCATION] Resolved location for product_id={product_id}: "
            f"{resolved!r} (fields: "
            f"resolved_location={product.get('resolved_location')!r}, "
            f"location={product.get('location')!r}, "
            f"destination={product.get('destination')!r})"
        )

        return ResolvedLocationResponse(product_id=product_id, location=resolved)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching resolved location: {str(e)}"
        )


@router.post("/{product_id}/resolved-location", response_model=ResolvedLocationResponse)
async def save_resolved_location(product_id: str, payload: ResolvedLocationRequest):
    """
    Save a resolved location for a product.

    The frontend should only call this AFTER it has resolved the location
    (possibly using OpenAI). Once saved, future calls should re-use it
    instead of calling OpenAI again.
    """
    try:
        logger.info(
            f"[RESOLVED_LOCATION] Saving resolved location for product_id={product_id}: "
            f"{payload.location!r}"
        )
        updated = await ProductService.save_resolved_location(
            product_id=product_id,
            location=payload.location.strip(),
        )
        if not updated:
            logger.warning(
                f"[RESOLVED_LOCATION] Failed to save resolved location – "
                f"product not found for product_id={product_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        logger.info(
            f"[RESOLVED_LOCATION] Saved resolved location for product_id={product_id}: "
            f"{payload.location.strip()!r}"
        )
        return ResolvedLocationResponse(product_id=product_id, location=payload.location.strip() or None)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving resolved location: {str(e)}"
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
            original_price = product.get("price", 0.0)
            original_currency = product.get("currency", "USD")
            price_usd = await convert_to_usd(original_price, original_currency)

            # Get supplier business name
            supplier_id = product.get("supplier_id")
            supplier_business_name = product.get("supplier_business_name")
            if supplier_id and not supplier_business_name:
                try:
                    from app.core.database import get_database
                    from bson import ObjectId
                    db = get_database()
                    if db:
                        supplier_user = await db.users.find_one(
                            {"_id": ObjectId(supplier_id) if ObjectId.is_valid(supplier_id) else supplier_id},
                            {"business_name": 1, "legal_name": 1, "company_name": 1, "full_name": 1}
                        )
                        if supplier_user:
                            supplier_business_name = (
                                supplier_user.get("business_name")
                                or supplier_user.get("legal_name")
                                or supplier_user.get("company_name")
                                or supplier_user.get("full_name")
                            )
                except Exception as e:
                    logger.debug(f"Could not fetch supplier name: {e}")

            # Convert selling_points to tags (for frontend compatibility)
            selling_points = product.get("selling_points", [])
            tags = selling_points if isinstance(selling_points, list) else []
            if not tags and product.get("activity_type"):
                tags = [product.get("activity_type")]

            # Calculate groupSize from vehicle capacity if available
            group_size = product.get("groupSize")
            if not group_size:
                try:
                    from app.core.database import get_database
                    from bson import ObjectId
                    db = get_database()
                    if db and supplier_id:
                        vehicle_collection = db.supplier_vehicle_options
                        vehicles = await vehicle_collection.find({
                            "product_id": str(product.get("id", "")),
                            "is_active": True
                        }).to_list(length=10)
                        if vehicles:
                            max_capacity = max((v.get("capacity", 0) for v in vehicles if v.get("capacity")), default=None)
                            if max_capacity:
                                group_size = f"Up to {max_capacity}"
                except Exception as e:
                    logger.debug(f"Could not fetch vehicle capacity: {e}")

            formatted_products.append(ProductResponse(
                id=product.get("id", ""),
                title=product.get("title", ""),
                tagline=product.get("tagline"),
                description=product.get("description", ""),
                category=product.get("category", "tour"),
                images=product.get("images", []),
                hero_image=product.get("hero_image"),
                price=price_usd,
                currency="USD",
                price_unit=product.get("price_unit", "Per Group"),
                destination=product.get("destination"),
                duration=product.get("duration"),
                activity_type=product.get("activity_type"),
                rating=product.get("rating") or 0.0,  # Default to 0.0 if not set
                reviews_count=product.get("reviews_count", 0),
                views=product.get("views", 0),
                bookings_count=product.get("bookings_count", 0),
                created_at=product.get("created_at") or datetime.utcnow(),
                published_at=product.get("published_at"),
                location=product.get("location"),
                groupSize=group_size,
                supplier_business_name=supplier_business_name,
                supplier_id=str(supplier_id) if supplier_id else None,
                selling_points=tags,  # Use selling_points as tags
                inactive_dates=product.get("inactive_dates", []),
                vehicle_inactive_dates=product.get("vehicle_inactive_dates", {}),
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
        
        # Fetch vehicles from supplier_vehicle_options collection
        vehicles = []
        vehicle_docs = []  # Store vehicle docs for later use in populating pickup_configurations
        try:
            from app.core.database import get_database
            from bson import ObjectId
            db = get_database()
            vehicle_collection = db.supplier_vehicle_options
            
            # Normalize product_id to string for consistent matching
            normalized_product_id = str(product_id).strip()
            
            # Build product_id match to support both string and ObjectId storage
            or_clauses = [{"product_id": normalized_product_id}]
            if ObjectId.is_valid(product_id):
                or_clauses.append({"product_id": ObjectId(product_id)})
            
            # Find all active vehicles for this product (deleted vehicles are not returned)
            vehicle_docs = await vehicle_collection.find({
                "$and": [
                    {"$or": or_clauses},
                    {"is_active": True}
                ]
            }).sort("created_at", -1).to_list(length=100)
            
            # Remove any falsy entries defensively
            vehicle_docs = [v for v in vehicle_docs if v]
            
            logger.info(f"🔍 [DEBUG] Found {len(vehicle_docs)} active vehicles for product {normalized_product_id}")
            
            # Map vehicles to frontend format
            for v in vehicle_docs:
                original_amount = v.get("amount")
                original_currency = v.get("currency")
                amount_usd = await convert_to_usd(original_amount, original_currency)

                vehicles.append(Vehicle(
                    title=v.get("title"),  # Primary display name
                    type=v.get("vehicle_type"),
                    model=v.get("variant"),
                    year=v.get("year"),
                    capacity=v.get("capacity"),
                    currency="USD",
                    amount=amount_usd,
                    pricing_type=v.get("pricing_type"),
                    duration=v.get("duration")  # Vehicle duration (e.g., "7h", "Full Day", "8 hours")
                ))
            
            logger.info(f"🔍 [DEBUG] Fetched {len(vehicles)} vehicles for product {product_id}")
        except Exception as e:
            logger.warning(f"Could not fetch vehicles: {e}")
            vehicles = []
            vehicle_docs = []
        
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

        # Extract custom_fields first (needed for multiple sections)
        custom_fields = product.get("custom_fields") if isinstance(product.get("custom_fields"), dict) else {}
        
        # Extract total tour days and day durations
        total_tour_days = product.get("total_tour_days") or product.get("totalTourDays")
        day_durations = product.get("day_durations") or product.get("dayDurations") or {}
        if custom_fields:
            total_tour_days = custom_fields.get("total_tour_days") or custom_fields.get("totalTourDays") or total_tour_days
            day_durations = custom_fields.get("day_durations") or custom_fields.get("dayDurations") or day_durations

        # Format itinerary - prefer rich data stored in custom_fields
        itinerary: List[ItineraryItem] = []

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
                # Extract ticket fare - check multiple possible field names
                ticket_fare_value = (
                    item.get("ticketFare") or 
                    item.get("ticket_fare") or 
                    (item.get("ticket") if item.get("ticket") and item.get("ticket") != "Free" and item.get("ticket") != "Paid" else None) or
                    None
                )
                
                itinerary.append(
                    ItineraryItem(
                        location=item.get("location") or item.get("placeName") or item.get("title"),
                        title=item.get("title") or item.get("placeName") or item.get("location"),
                        description=item.get("description", ""),
                        time=item.get("time"),
                        timeSpent=item.get("timeSpent"),
                        isFree=item.get("isFree", item.get("entryFree")),
                        ticketFare=ticket_fare_value,
                        ticket=item.get("ticket") or None,  # For backward compatibility
                        photo=item.get("photo") or item.get("croppedPhoto") or item.get("photoPreview"),
                        attractionType=item.get("attractionType") or item.get("attractionsType"),
                        activities=_ensure_list(item.get("activities")),
                        day=item.get("day") or 1
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
        pickup_configurations = []  # CRITICAL: Preserve pickup_configurations
        time_slot_configuration = None
        time_slots_by_day = {}
        
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
            
            # CRITICAL: Preserve pickup_configurations from the original pickup_dropoff object
            raw_configs = pd.get("pickup_configurations")
            if raw_configs:
                if isinstance(raw_configs, list) and len(raw_configs) > 0:
                    # Populate vehicle objects in each configuration if missing
                    populated_configs = []
                    for config in raw_configs:
                        config_dict = config if isinstance(config, dict) else config.model_dump() if hasattr(config, 'model_dump') else {}
                        
                        # If vehicle object is missing but vehicle_id exists, populate it
                        if not config_dict.get("vehicle") and config_dict.get("vehicle_id"):
                            try:
                                from app.core.database import get_database
                                from bson import ObjectId
                                db = get_database()
                                vehicle_collection = db.supplier_vehicle_options
                                
                                vehicle_id = config_dict.get("vehicle_id")
                                vehicle_doc = await vehicle_collection.find_one({
                                    "_id": ObjectId(vehicle_id) if ObjectId.is_valid(vehicle_id) else vehicle_id,
                                    "is_active": True
                                })
                                
                                if vehicle_doc:
                                    # Normalize vehicle price to USD for any embedded vehicle object
                                    original_amount = vehicle_doc.get("amount")
                                    original_currency = vehicle_doc.get("currency")
                                    amount_usd = await convert_to_usd(original_amount, original_currency)

                                    config_dict["vehicle"] = {
                                        "id": str(vehicle_doc.get("_id")),
                                        "productId": str(vehicle_doc.get("product_id", "")),
                                        "title": vehicle_doc.get("title"),
                                        "type": vehicle_doc.get("vehicle_type"),
                                        "model": vehicle_doc.get("variant"),
                                        "year": vehicle_doc.get("year"),
                                        "attributes": vehicle_doc.get("attributes"),
                                        "capacity": vehicle_doc.get("capacity"),
                                        # Always expose customer-facing prices in USD
                                        "currency": "USD",
                                        "pricingType": vehicle_doc.get("pricing_type"),
                                        "amount": amount_usd,
                                        "duration": vehicle_doc.get("duration"),
                                        "description": vehicle_doc.get("description"),
                                        "isActive": vehicle_doc.get("is_active", True),
                                        "createdAt": vehicle_doc.get("created_at").isoformat() if vehicle_doc.get("created_at") else None,
                                        "updatedAt": vehicle_doc.get("updated_at").isoformat() if vehicle_doc.get("updated_at") else None
                                    }
                                    logger.info(f"✅ [DEBUG] Populated vehicle for config with vehicle_id: {vehicle_id}")
                                else:
                                    # Vehicle was deleted or is inactive - skip this configuration
                                    logger.info(f"⚠️ [DEBUG] Vehicle {vehicle_id} not found or inactive, skipping configuration")
                                    continue  # Skip adding this config to populated_configs
                            except Exception as e:
                                logger.warning(f"⚠️ [DEBUG] Could not populate vehicle for config: {e}")
                                # If there's an error and vehicle_id exists, skip this config
                                if config_dict.get("vehicle_id"):
                                    continue  # Skip adding this config to populated_configs
                        
                        # Only add config if it has a valid vehicle (either already present or just populated)
                        if config_dict.get("vehicle") or not config_dict.get("vehicle_id"):
                            populated_configs.append(config_dict)
                        else:
                            # Config references a vehicle_id but vehicle wasn't found - skip it
                            logger.info(f"⚠️ [DEBUG] Skipping config with missing vehicle_id: {config_dict.get('vehicle_id')}")
                    
                    pickup_configurations = populated_configs
                    
                    # IMPORTANT: Validate and normalize ANY existing vehicle objects in pickup_configurations
                    # Also filter out configurations with deleted/inactive vehicles
                    validated_configs = []
                    for cfg in pickup_configurations:
                        try:
                            veh = cfg.get("vehicle")
                            vehicle_id = cfg.get("vehicle_id")
                            
                            # Helper function to check if a vehicle ID exists in active vehicles
                            def vehicle_id_matches(vid_to_check, vehicle_doc):
                                """Check if vehicle ID matches (handles ObjectId and string formats)"""
                                if not vid_to_check or not vehicle_doc:
                                    return False
                                vid_str = str(vid_to_check).strip()
                                doc_id = vehicle_doc.get("_id")
                                doc_id_str = str(doc_id) if doc_id else ""
                                # Try direct string comparison
                                if vid_str == doc_id_str:
                                    return True
                                # Try ObjectId comparison if valid
                                try:
                                    from bson import ObjectId
                                    if ObjectId.is_valid(vid_str) and ObjectId.is_valid(doc_id_str):
                                        return ObjectId(vid_str) == ObjectId(doc_id_str)
                                except:
                                    pass
                                return False
                            
                            # If there's a vehicle_id, verify the vehicle still exists and is active
                            if vehicle_id:
                                vid_str = str(vehicle_id).strip()
                                # Check if this vehicle exists in our active vehicles list
                                vehicle_exists = any(
                                    vehicle_id_matches(vid_str, v) for v in vehicle_docs
                                )
                                if not vehicle_exists:
                                    # Vehicle was deleted - skip this configuration
                                    logger.info(f"⚠️ [DEBUG] Vehicle {vid_str} in config is deleted/inactive, skipping configuration")
                                    continue
                            
                            # If vehicle object is embedded, verify it's still active
                            if isinstance(veh, dict):
                                veh_id = veh.get("id") or veh.get("_id") or vehicle_id
                                if veh_id:
                                    veh_id_str = str(veh_id).strip()
                                    vehicle_exists = any(
                                        vehicle_id_matches(veh_id_str, v) for v in vehicle_docs
                                    )
                                    if not vehicle_exists:
                                        # Embedded vehicle was deleted - skip this configuration
                                        logger.info(f"⚠️ [DEBUG] Embedded vehicle {veh_id_str} in config is deleted/inactive, skipping configuration")
                                        continue
                            
                            # Vehicle is valid, proceed with normalization
                            if not isinstance(veh, dict):
                                validated_configs.append(cfg)
                                continue

                            # Try to find a matching vehicle_doc by ID
                            vid = str(
                                veh.get("id")
                                or veh.get("_id")
                                or cfg.get("vehicle_id")
                                or ""
                            )
                            original_amount = None
                            original_currency = None

                            if vid and vehicle_docs:
                                for v in vehicle_docs:
                                    if str(v.get("_id")) == vid:
                                        original_amount = v.get("amount")
                                        original_currency = v.get("currency")
                                        break

                            # Fallback to values embedded in the vehicle object
                            if original_amount is None:
                                original_amount = veh.get("amount")
                                original_currency = veh.get("currency")

                            amount_usd = await convert_to_usd(original_amount, original_currency)

                            veh["amount"] = amount_usd
                            veh["currency"] = "USD"
                            cfg["vehicle"] = veh
                            
                            validated_configs.append(cfg)
                        except Exception as e:
                            logger.warning(f"⚠️ [DEBUG] Could not normalize pickup_configurations vehicle to USD: {e}")
                            # Still add config if vehicle normalization fails (but vehicle exists)
                            validated_configs.append(cfg)

                    # Use validated configs (only those with active vehicles)
                    pickup_configurations = validated_configs
                    logger.info(f"🔍 [DEBUG] Found {len(pickup_configurations)} validated pickup_configurations (after filtering deleted vehicles)")
                else:
                    pickup_configurations = []
                    logger.warning(f"⚠️ [DEBUG] pickup_configurations is not a valid list: {type(raw_configs)}")
            else:
                pickup_configurations = []
                logger.warning(f"⚠️ [DEBUG] pickup_configurations MISSING in pickup_dropoff dict! Keys: {list(pd.keys())}")
            
            # NOTE: Previously we attempted to reconstruct pickup_configurations from
            # legacy custom_fields.vehicle_time_allocations when configs were empty.
            # This legacy path caused duplicate/mismatched vehicle data. We now rely
            # solely on explicit pickup_configurations + supplier_vehicle_options.
            
            # Preserve time_slot_configuration if present
            raw_time_slot_config = pd.get("time_slot_configuration")
            if raw_time_slot_config:
                if isinstance(raw_time_slot_config, dict):
                    time_slot_configuration = raw_time_slot_config  # Pydantic will validate/convert to TimeSlotConfiguration
                else:
                    time_slot_configuration = None
            
            # Preserve time_slots_by_day if present
            raw_time_slots_by_day = pd.get("time_slots_by_day")
            if raw_time_slots_by_day:
                if isinstance(raw_time_slots_by_day, dict):
                    time_slots_by_day = raw_time_slots_by_day
                else:
                    time_slots_by_day = {}
            else:
                time_slots_by_day = {}

        # Remove falsy values while preserving order
        pickup_locations = [loc for loc in pickup_locations if loc]
        dropoff_locations = [loc for loc in dropoff_locations if loc]
        
        # CRITICAL: Create PickupDropoff with ALL fields including pickup_configurations
        pickup_dropoff = None
        if pd or pickup_locations or dropoff_locations or pickup_time:
            try:
                # Create PickupDropoff with ALL fields including pickup_configurations
                pickup_dropoff = PickupDropoff(
                    pickup_location=pickup_locations[0] if pickup_locations else None,
                    dropoff_location=dropoff_locations[0] if dropoff_locations else None,
                    pickup_time=pickup_time,
                    available_days=available_days if isinstance(available_days, list) else [],
                    available_time_slots=available_time_slots if isinstance(available_time_slots, list) else [],
                    pickup_locations=pickup_locations,
                    dropoff_locations=dropoff_locations,
                    # CRITICAL: Include pickup_configurations to preserve vehicle-based configs
                    pickup_configurations=pickup_configurations,
                    time_slot_configuration=time_slot_configuration,
                    time_slots_by_day=time_slots_by_day if isinstance(time_slots_by_day, dict) else {}
                )
                
                logger.info(f"✅ [DEBUG] Created PickupDropoff with {len(pickup_configurations)} pickup_configurations")
            except Exception as e:
                logger.error(f"❌ [DEBUG] Error creating PickupDropoff: {e}")
                import traceback
                traceback.print_exc()
                # Fallback to basic PickupDropoff if there's an error
                pickup_dropoff = PickupDropoff(
                pickup_locations=pickup_locations,
                pickup_time=pickup_time,
                dropoff_locations=dropoff_locations,
                available_days=available_days if isinstance(available_days, list) else [],
                available_time_slots=available_time_slots if isinstance(available_time_slots, list) else []
                ) if (pickup_locations or dropoff_locations or pickup_time) else None
        
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
        
        # Normalize product base price to USD
        original_price = product.get("price", 0.0)
        original_currency = product.get("currency", "USD")
        price_usd = await convert_to_usd(original_price, original_currency)

        # Calculate groupSize from vehicle capacity if not set on product
        group_size = product.get("groupSize") or product.get("maxGroupSize") or product.get("capacity")
        if not group_size and vehicles:
            # Find maximum capacity from vehicles
            max_capacity = max((v.capacity for v in vehicles if v.capacity), default=None)
            if max_capacity:
                group_size = f"Up to {max_capacity} guests"
        
        # Ensure location is set (use destination or resolved location if available)
        location = product.get("location") or product.get("destination")

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
            price=price_usd,
            currency="USD",
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
            location=location,
            groupSize=group_size,
            # Product details fields
            guide_type=guide_type,
            things_to_carry=things_to_carry,
            languages=languages,
            highlights=highlights,
            included_excluded=included_excluded,
            itinerary=itinerary,
            itineraries=itinerary,  # preferred key for day-based itineraries
            totalTourDays=str(total_tour_days) if total_tour_days else None,
            dayDurations=day_durations or {},
            pickup_dropoff=pickup_dropoff,
            vehicle_details=vehicle_details,
            vehicles=vehicles,
            accessibility=accessibility,
            faqs=faqs,
            cancellation_policy=cancellation_policy,
            selling_points=selling_points,
            style_theme=style_theme,
            supplier_business_name=supplier_business_name,
            supplier_id=str(supplier_id) if supplier_id else None,
            inactive_dates=product.get("inactive_dates", []),
            vehicle_inactive_dates=product.get("vehicle_inactive_dates", {}),
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


@router.get("/{product_id}/reviews", response_model=ReviewListResponse)
async def get_product_reviews(
    product_id: str,
    limit: int = Query(50, ge=1, le=200, description="Max reviews to return for product"),
):
    """
    Get reviews for a specific product.
    Returns empty list if no reviews found.
    """
    logger.info(f"[get_product_reviews] Request received for product_id: {product_id}, limit: {limit}")
    
    try:
        if not product_id or not product_id.strip():
            logger.warning(f"[get_product_reviews] Empty product_id provided")
            return ReviewListResponse(reviews=[])
        
        product_id_clean = product_id.strip()
        logger.info(f"[get_product_reviews] Fetching reviews for product: {product_id_clean}")
        
        reviews = await ReviewService.list_reviews_by_product(product_id_clean, limit=limit)
        reviews_list = reviews or []
        
        logger.info(f"[get_product_reviews] Returning {len(reviews_list)} reviews for product {product_id_clean}")
        return ReviewListResponse(reviews=reviews_list)
        
    except DatabaseUnavailableError:
        logger.warning(f"[get_product_reviews] Database unavailable when fetching reviews for product {product_id}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )
    except Exception as e:
        logger.error(f"[get_product_reviews] Error fetching product reviews for {product_id}: {e}", exc_info=True)
        # Return empty list instead of error to prevent frontend issues
        return ReviewListResponse(reviews=[])

