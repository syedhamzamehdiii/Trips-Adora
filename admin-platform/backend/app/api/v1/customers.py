"""
Customers API Routes
Handles HTTP requests for customer management
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.customer_service import CustomerService
from app.schemas.customer import CustomerListResponse, CustomerStatsResponse
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

