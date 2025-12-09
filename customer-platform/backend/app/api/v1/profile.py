from __future__ import annotations

from fastapi import APIRouter, HTTPException, Path, status
import asyncio

from datetime import datetime

from app.schemas.profile import ProfileResponse, ProfileUpdateRequest
from app.services.profile_service import ProfileService
from app.services.booking_service import BookingService
from app.services.activity_service import ActivityService
from app.services.referral_service import ReferralService
from app.core.exceptions import DatabaseUnavailableError
from pymongo.errors import AutoReconnect, ServerSelectionTimeoutError

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/{user_id}/summary")
async def get_profile_summary(
    user_id: str = Path(..., description="Customer identifier"),
):
    """Lightweight endpoint for header/profile summary - only returns essential user info"""
    # Update last_seen for real-time status tracking
    try:
        from app.core.database import get_database
        now = datetime.utcnow()
        db = get_database()
        await db.customer_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "last_seen": now,
                    "updated_at": now
                }
            }
        )
    except:
        pass  # Don't fail if update fails
    
    try:
        # Use summary_only=True for ultra-fast header fetching
        profile = await ProfileService.get_profile(user_id, summary_only=True)
        if not profile:
            profile = await ProfileService.ensure_profile(user_id)
    except DatabaseUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )
    
    # Return only essential fields for header display
    return {
        "user": profile.get("user", {}),
        "id": profile.get("id"),
        "user_id": profile.get("user_id"),
    }


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    try:
        profile = await ProfileService.get_profile(user_id)
        # Auto-create profile if it doesn't exist (like wallet service)
        if not profile:
            profile = await ProfileService.ensure_profile(user_id)
    except DatabaseUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )
    try:
        bookings = await BookingService.get_bookings_for_user(user_id, limit=50)  # Limit to 50 for faster fetching
        # Run all dependent queries in parallel for faster response
        stats, upcoming_trips, recent_activity, travel_preferences, refer_summary = await asyncio.gather(
            BookingService.get_stats_for_user(user_id, bookings=bookings),
            BookingService.get_upcoming_trips(user_id, bookings=bookings),
            ActivityService.get_recent_activity(user_id, bookings=bookings, limit=4),
            ActivityService.get_travel_preferences(user_id, bookings=bookings),
            ReferralService.get_summary(user_id, profile),
            return_exceptions=True
        )
        # Handle any exceptions from parallel queries
        if isinstance(stats, Exception) or isinstance(upcoming_trips, Exception) or isinstance(recent_activity, Exception) or isinstance(travel_preferences, Exception) or isinstance(refer_summary, Exception):
            raise DatabaseUnavailableError("Error fetching profile data")
    except (DatabaseUnavailableError, AutoReconnect, ServerSelectionTimeoutError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )

    profile["stats"] = stats
    profile["upcoming_trips"] = upcoming_trips
    profile["recent_activity"] = recent_activity
    profile["travel_preferences"] = travel_preferences
    profile["refer_and_earn"] = refer_summary
    
    # Update last_seen and last_synced_at for real-time status tracking
    now = datetime.utcnow()
    from app.core.database import get_database
    db = get_database()
    await db.customer_profiles.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "last_seen": now,
                "last_synced_at": now.isoformat(),
                "updated_at": now
            }
        }
    )
    
    profile["last_synced_at"] = now.isoformat()

    return ProfileResponse(**profile)


@router.put("/{user_id}", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
async def upsert_profile(
    request: ProfileUpdateRequest,
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    try:
        profile = await ProfileService.upsert_profile(
            user_id=user_id,
            payload=request.model_dump(exclude_unset=True),
        )
        bookings = await BookingService.get_bookings_for_user(user_id, limit=50)  # Limit to 50 for faster fetching
        # Run all dependent queries in parallel for faster response
        stats, upcoming_trips, recent_activity, travel_preferences, refer_summary = await asyncio.gather(
            BookingService.get_stats_for_user(user_id, bookings=bookings),
            BookingService.get_upcoming_trips(user_id, bookings=bookings),
            ActivityService.get_recent_activity(user_id, bookings=bookings, limit=4),
            ActivityService.get_travel_preferences(user_id, bookings=bookings),
            ReferralService.get_summary(user_id, profile),
            return_exceptions=True
        )
        # Handle any exceptions from parallel queries
        if isinstance(stats, Exception) or isinstance(upcoming_trips, Exception) or isinstance(recent_activity, Exception) or isinstance(travel_preferences, Exception) or isinstance(refer_summary, Exception):
            raise DatabaseUnavailableError("Error fetching profile data")
    except (DatabaseUnavailableError, AutoReconnect, ServerSelectionTimeoutError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )

    profile["stats"] = stats
    profile["upcoming_trips"] = upcoming_trips
    profile["recent_activity"] = recent_activity
    profile["travel_preferences"] = travel_preferences
    profile["refer_and_earn"] = refer_summary
    profile["last_synced_at"] = datetime.utcnow().isoformat()
    return ProfileResponse(**profile)


@router.patch("/{user_id}", response_model=ProfileResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    updates = request.model_dump(exclude_unset=True)
    try:
        profile = await ProfileService.update_profile(user_id=user_id, updates=updates)
    except DatabaseUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    try:
        bookings = await BookingService.get_bookings_for_user(user_id, limit=50)  # Limit to 50 for faster fetching
        # Run all dependent queries in parallel for faster response
        stats, upcoming_trips, recent_activity, travel_preferences, refer_summary = await asyncio.gather(
            BookingService.get_stats_for_user(user_id, bookings=bookings),
            BookingService.get_upcoming_trips(user_id, bookings=bookings),
            ActivityService.get_recent_activity(user_id, bookings=bookings, limit=4),
            ActivityService.get_travel_preferences(user_id, bookings=bookings),
            ReferralService.get_summary(user_id, profile),
            return_exceptions=True
        )
        # Handle any exceptions from parallel queries
        if isinstance(stats, Exception) or isinstance(upcoming_trips, Exception) or isinstance(recent_activity, Exception) or isinstance(travel_preferences, Exception) or isinstance(refer_summary, Exception):
            raise DatabaseUnavailableError("Error fetching profile data")
    except (DatabaseUnavailableError, AutoReconnect, ServerSelectionTimeoutError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )

    profile["stats"] = stats
    profile["upcoming_trips"] = upcoming_trips
    profile["recent_activity"] = recent_activity
    profile["travel_preferences"] = travel_preferences
    profile["refer_and_earn"] = refer_summary
    profile["last_synced_at"] = datetime.utcnow().isoformat()
    return ProfileResponse(**profile)


