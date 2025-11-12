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


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    try:
        profile = await ProfileService.get_profile(user_id)
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


