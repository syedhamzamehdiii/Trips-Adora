from __future__ import annotations

from fastapi import APIRouter, HTTPException, Path, Response, status

from app.schemas.booking import (
    BookingCancellationRequest,
    BookingCreateRequest,
    BookingItem,
    BookingListResponse,
)
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/{user_id}", response_model=BookingListResponse)
async def list_bookings(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    bookings = await BookingService.get_bookings_for_user(user_id)
    return BookingListResponse(bookings=bookings)


@router.post(
    "/{user_id}",
    response_model=BookingItem,
    status_code=status.HTTP_201_CREATED,
)
async def create_booking(
    payload: BookingCreateRequest,
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    booking = await BookingService.create_booking(user_id=user_id, payload=payload)
    return BookingItem(**booking)


@router.delete(
    "/{user_id}/{booking_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def cancel_booking(
    request: BookingCancellationRequest,
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
    booking_id: str = Path(..., description="Booking identifier"),
):
    success = await BookingService.cancel_booking(user_id, booking_id, request.reason)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{user_id}/{booking_id}/delete",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Permanently delete a booking (customer storage cleanup only)",
)
async def delete_booking(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
    booking_id: str = Path(..., description="Booking identifier"),
):
    """
    Permanently delete a booking for customer storage cleanup.
    This does NOT affect supplier booking counts - the booking remains visible to suppliers.
    """
    success = await BookingService.delete_booking(user_id, booking_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


