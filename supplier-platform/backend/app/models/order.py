# app/models/order.py
from beanie import Document, Link
from pydantic import Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
from app.models.user import User
from app.models.product import Product


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    total: float


class Order(Document):
    order_number: str = Field(unique=True)
    supplier_id: Link[User]
    customer_name: str
    customer_email: str
    customer_phone: Optional[str]
    customer_address: str
    items: List[OrderItem]
    subtotal: float
    tax: float = 0.0
    shipping: float = 0.0
    total: float
    status: OrderStatus = OrderStatus.PENDING
    payment_status: str = "pending"
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "orders"
