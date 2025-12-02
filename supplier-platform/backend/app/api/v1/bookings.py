import logging
from fastapi import APIRouter, Depends, Query, HTTPException, status, Body
from typing import Optional
from app.models.user import User
from app.core.dependencies import get_current_user
from app.services.booking_service import SupplierBookingService
from app.services.email_service import send_booking_diversion_email, send_booking_cancellation_email, send_supplier_to_customer_email
from app.schemas.booking import (
    SupplierBookingListResponse,
    SupplierBookingResponse,
    SupplierBookingStatsResponse
)

logger = logging.getLogger(__name__)
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


@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    request_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Cancel a booking. Supplier can cancel their own bookings."""
    try:
        supplier_id = str(current_user.id)
        reason = request_data.get("reason", "")
        result = await SupplierBookingService.cancel_booking(booking_id, supplier_id, reason)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or already cancelled"
            )
        
        # Send cancellation email to customer
        try:
            customer_email = result.get("customer_email")
            customer_name = result.get("customer_name") or "Customer"
            
            if customer_email:
                # Get booking reference
                booking_reference = result.get("id", booking_id)
                if len(booking_reference) > 8:
                    booking_reference = booking_reference[-8:].upper()
                
                # Get supplier name
                supplier_name = current_user.full_name or current_user.business_name or current_user.email.split('@')[0]
                
                # Send email (non-blocking - don't fail the cancellation if email fails)
                email_sent = await send_booking_cancellation_email(
                    customer_email=customer_email,
                    customer_name=customer_name,
                    booking_reference=booking_reference,
                    booking_details=result,
                    supplier_name=supplier_name,
                    cancellation_reason=reason
                )
                
                if not email_sent:
                    logger.warning(f"Booking cancelled but email notification failed for {customer_email}")
        except Exception as email_error:
            # Log but don't fail the cancellation if email fails
            logger.error(f"Error sending cancellation email: {email_error}")
        
        return {"success": True, "message": "Booking cancelled successfully", "booking": result}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling booking: {str(e)}"
        )


@router.post("/{booking_id}/divert")
async def divert_booking_to_supplier(
    booking_id: str,
    request_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Divert a booking cancellation request to another supplier with booking management access."""
    try:
        supplier_id = str(current_user.id)
        
        # Get booking details
        booking = await SupplierBookingService.get_booking_by_id(booking_id, supplier_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Get recipient supplier email and name
        recipient_email = request_data.get("recipient_email")
        recipient_name = request_data.get("recipient_name", "Supplier")
        cancellation_reason = request_data.get("reason", "")
        
        if not recipient_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Recipient email is required"
            )
        
        # Get sender info
        sender_name = current_user.full_name or current_user.business_name or current_user.email.split('@')[0]
        sender_email = current_user.email
        
        # Get booking reference
        booking_reference = booking.get("id", booking_id)
        if len(booking_reference) > 8:
            booking_reference = booking_reference[-8:].upper()
        
        # Send email
        email_sent = await send_booking_diversion_email(
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            booking_reference=booking_reference,
            booking_details=booking,
            sender_name=sender_name,
            sender_email=sender_email,
            cancellation_reason=cancellation_reason
        )
        
        return {
            "success": True,
            "message": "Booking diversion request sent successfully",
            "email_sent": email_sent
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error diverting booking: {str(e)}"
        )


@router.post("/{booking_id}/contact-customer")
async def contact_customer(
    booking_id: str,
    request_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Send email from supplier to customer regarding a booking."""
    try:
        supplier_id = str(current_user.id)
        
        # Get booking details
        booking = await SupplierBookingService.get_booking_by_id(booking_id, supplier_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Get email data from request
        subject = request_data.get("subject", "").strip()
        message = request_data.get("message", "").strip()
        customer_email = booking.get("customer_email") or request_data.get("customer_email")
        customer_name = booking.get("customer_name") or "Customer"
        
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subject is required"
            )
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message is required"
            )
        
        if not customer_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customer email not found"
            )
        
        # Get supplier info
        supplier_email = current_user.email
        supplier_name = current_user.full_name or current_user.business_name or current_user.email.split('@')[0]
        
        # Get booking reference
        booking_reference = booking.get("id", booking_id)
        if len(booking_reference) > 8:
            booking_reference = booking_reference[-8:].upper()
        
        # Send email
        email_sent = await send_supplier_to_customer_email(
            customer_email=customer_email,
            customer_name=customer_name,
            supplier_email=supplier_email,
            supplier_name=supplier_name,
            subject=subject,
            message=message,
            booking_reference=booking_reference
        )
        
        return {
            "success": True,
            "message": "Email sent successfully" if email_sent else "Email queued (SMTP may not be configured)",
            "email_sent": email_sent
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending email: {str(e)}"
        )

