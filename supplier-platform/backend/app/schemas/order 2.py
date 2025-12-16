# app/schemas/order.py
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class OrderItemSchema(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    total: float


class OrderBase(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    customer_address: str
    items: List[OrderItemSchema]
    subtotal: float
    tax: float = 0.0
    shipping: float = 0.0
    total: float


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None


class OrderResponse(OrderBase):
    id: str
    order_number: str
    status: str
    payment_status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True