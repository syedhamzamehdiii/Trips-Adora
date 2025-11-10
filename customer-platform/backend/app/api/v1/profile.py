from __future__ import annotations

from fastapi import APIRouter, HTTPException, Path, status

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
        bookings = await BookingService.get_bookings_for_user(user_id)
        stats = await BookingService.get_stats_for_user(user_id, bookings=bookings)
        upcoming_trips = await BookingService.get_upcoming_trips(user_id, bookings=bookings)
        recent_activity = await ActivityService.get_recent_activity(user_id, bookings=bookings)
        travel_preferences = await ActivityService.get_travel_preferences(user_id, bookings=bookings)
        refer_summary = await ReferralService.get_summary(user_id, profile)
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
        bookings = await BookingService.get_bookings_for_user(user_id)
        stats = await BookingService.get_stats_for_user(user_id, bookings=bookings)
        upcoming_trips = await BookingService.get_upcoming_trips(user_id, bookings=bookings)
        recent_activity = await ActivityService.get_recent_activity(user_id, bookings=bookings)
        travel_preferences = await ActivityService.get_travel_preferences(user_id, bookings=bookings)
        refer_summary = await ReferralService.get_summary(user_id, profile)
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
        bookings = await BookingService.get_bookings_for_user(user_id)
        stats = await BookingService.get_stats_for_user(user_id, bookings=bookings)
        upcoming_trips = await BookingService.get_upcoming_trips(user_id, bookings=bookings)
        recent_activity = await ActivityService.get_recent_activity(user_id, bookings=bookings)
        travel_preferences = await ActivityService.get_travel_preferences(user_id, bookings=bookings)
        refer_summary = await ReferralService.get_summary(user_id, profile)
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


