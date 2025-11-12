from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from app.models.user import User
from app.core.dependencies import get_current_user
from app.services.booking_service import SupplierBookingService
from app.schemas.booking import (
    SupplierBookingListResponse,
    SupplierBookingResponse,
    SupplierBookingStatsResponse
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/", response_model=SupplierBookingListResponse)
async def get_supplier_bookings(
    status: Optional[str] = Query(None, description="Filter by booking status"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of bookings to return"),
    skip: int = Query(0, ge=0, description="Number of bookings to skip"),
    current_user: User = Depends(get_current_user)
):
    """
    Get all bookings for the authenticated supplier.
    Bookings are filtered by supplier_id which matches the user's ID.
    """
    try:
        # Use user.id as supplier_id (products store user.id in supplier_id field)
        supplier_id = str(current_user.id)
        
        bookings = await SupplierBookingService.get_bookings_for_supplier(
            supplier_id=supplier_id,
            status=status,
            limit=limit,
            skip=skip
        )
        
        stats = await SupplierBookingService.get_booking_stats(supplier_id)
        
        return SupplierBookingListResponse(
            bookings=bookings,
            total=stats.get("total", 0),
            stats=stats
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching bookings: {str(e)}"
        )


@router.get("/stats", response_model=SupplierBookingStatsResponse)
async def get_booking_stats(
    current_user: User = Depends(get_current_user)
):
    """Get booking statistics for the authenticated supplier."""
    try:
        supplier_id = str(current_user.id)
        stats = await SupplierBookingService.get_booking_stats(supplier_id)
        return SupplierBookingStatsResponse(**stats)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching booking stats: {str(e)}"
        )


@router.get("/{booking_id}", response_model=SupplierBookingResponse)
async def get_booking_detail(
    booking_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific booking by ID."""
    try:
        supplier_id = str(current_user.id)
        booking = await SupplierBookingService.get_booking_by_id(booking_id, supplier_id)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        return SupplierBookingResponse(**booking)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching booking: {str(e)}"
        )

