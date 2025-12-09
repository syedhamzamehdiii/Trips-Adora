"""
Customers API Routes
Handles HTTP requests for customer management
"""
from fastapi import APIRouter, Query, HTTPException, Path, Body
from typing import Optional
from app.services.customer_service import CustomerService
from app.services.message_service import AdminMessageService
from app.schemas.customer import (
    CustomerListResponse,
    CustomerStatsResponse,
    CustomerDetailsResponse,
    AdminMessageRequest
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/customers", response_model=CustomerListResponse)
async def get_customers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, email, or customer ID")
):
    """
    Get all customers with pagination and search
    
    - **page**: Page number (starts from 1)
    - **page_size**: Number of items per page (max 100)
    - **search**: Optional search term for filtering by name, email, or customer ID
    """
    try:
        result = await CustomerService.get_customers(
            page=page,
            page_size=page_size,
            search=search
        )
        return CustomerListResponse(**result)
    except Exception as e:
        logger.error(f"Error in get_customers endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customers/stats", response_model=CustomerStatsResponse)
async def get_customer_stats():
    """
    Get aggregated customer statistics
    
    Returns:
    - Total customers
    - Active customers (last 30 days)
    - VIP customers (250+ bookings)
    - Average spending last month
    - Percentage changes from previous month
    """
    try:
        stats = await CustomerService.get_customer_stats()
        return CustomerStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Error in get_customer_stats endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customers/{customer_id}/details", response_model=CustomerDetailsResponse)
async def get_customer_details(
    customer_id: str = Path(..., description="Customer user ID")
):
    """
    Get detailed information about a specific customer
    
    Returns:
    - Customer basic info (name, email, customer ID)
    - Statistics (total bookings, reviews, spending, average rating)
    - Booking history (recent bookings)
    """
    try:
        details = await CustomerService.get_customer_details(customer_id)
        return CustomerDetailsResponse(**details)
    except ValueError as e:
        logger.error(f"Customer not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error in get_customer_details endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/customers/{customer_id}/message")
async def send_message_to_customer(
    customer_id: str = Path(..., description="Customer user ID"),
    payload: AdminMessageRequest = Body(...)
):
    """
    Send a message from admin to customer
    
    The message will appear in the customer's chat interface
    """
    try:
        # Get the actual user_id that matches customer platform's format
        # The customer_id from path is users._id, but customer platform uses customer_profiles.user_id
        from app.core.database import get_database
        from bson import ObjectId
        
        db = get_database()
        users_collection = db.users
        profiles_collection = db.customer_profiles
        
        # Find user by _id (customer_id from path is users._id)
        user = None
        try:
            if ObjectId.is_valid(customer_id):
                user = await users_collection.find_one({"_id": ObjectId(customer_id)})
        except:
            pass
        
        if not user:
            user = await users_collection.find_one({"user_id": customer_id})
        
        if not user:
            raise ValueError(f"Customer not found: {customer_id}")
        
        # Get the user_id that customer platform uses (this is what's stored in customer_profiles.user_id)
        # It's the users._id as a string
        user_id_for_message = str(user.get("_id", ""))
        
        # Verify this user_id exists in customer_profiles (what customer platform uses)
        profile = await profiles_collection.find_one({"user_id": user_id_for_message})
        if not profile:
            # If no profile, still send message but log warning
            logger.warning(f"No customer profile found for user_id {user_id_for_message}, sending message anyway")
        
        # Use the correct user_id format (users._id as string, which matches customer_profiles.user_id)
        message = await AdminMessageService.send_admin_message(
            customer_id=user_id_for_message,
            message=payload.message,
            admin_name=payload.admin_name
        )
        return {
            "success": True,
            "message_id": message.get("id"),
            "message": "Message sent successfully"
        }
    except ValueError as e:
        logger.error(f"Customer not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error sending message to customer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

