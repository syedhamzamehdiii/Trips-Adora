# app/models/supplier.py
from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime


class Supplier(Document):
    user_id: str
    business_name: str
    verification_status: str = "pending"
    rating: float = 0.0
    total_orders: int = 0
    total_revenue: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "suppliers"



