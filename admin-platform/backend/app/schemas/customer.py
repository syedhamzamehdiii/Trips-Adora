"""
Customer Schemas
Pydantic models for customer API responses
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class CustomerItem(BaseModel):
    """Individual customer data"""
    id: str = Field(..., description="User ID")
    customer_id: str = Field(..., description="Formatted customer ID (e.g., CU-1002484)")
    name: str = Field(..., description="Customer name")
    email: str = Field(..., description="Customer email")
    bookings: int = Field(..., description="Total number of bookings")
    reviews: int = Field(..., description="Total number of reviews")
    total_spending: float = Field(..., description="Total spending amount")
    status: str = Field(..., description="Status (Active/Inactive)")
    is_online: bool = Field(..., description="Whether customer is currently online")


class CustomerListResponse(BaseModel):
    """Response for customer list endpoint"""
    customers: List[CustomerItem]
    total: int = Field(..., description="Total number of customers")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")


class CustomerStatsResponse(BaseModel):
    """Response for customer stats endpoint"""
    total_customers: int = Field(..., description="Total number of customers")
    active_customers: int = Field(..., description="Active customers (last 30 days)")
    vip_customers: int = Field(..., description="VIP customers (250+ bookings)")
    avg_spending_last_month: float = Field(..., description="Average spending in last month")
    total_customers_change: float = Field(..., description="Percentage change in total customers")
    active_customers_change: float = Field(..., description="Percentage change in active customers")
    avg_spending_change: float = Field(..., description="Percentage change in average spending")


class BookingItem(BaseModel):
    """Individual booking in customer details"""
    id: str
    title: str
    date: str
    status: str
    amount: float
    booking_ref: str


class CustomerDetailsResponse(BaseModel):
    """Response for customer details endpoint"""
    customer: Dict[str, str] = Field(..., description="Customer basic info")
    stats: Dict[str, Any] = Field(..., description="Customer statistics")
    bookings: List[BookingItem] = Field(..., description="Customer booking history")


class AdminMessageRequest(BaseModel):
    """Request to send message from admin to customer"""
    message: str = Field(..., min_length=1, description="Message content")
    admin_name: str = Field(default="Admin", description="Name of admin sending message")

