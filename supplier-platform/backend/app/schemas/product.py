# app/schemas/product.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    description: str
    category: str
    price: float
    compare_price: Optional[float] = None
    currency: str = "usd"
    stock: int = 0
    sku: Optional[str] = None
    weight: Optional[float] = None
    images: List[str] = []


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    currency: Optional[str] = None
    stock: Optional[int] = None
    sku: Optional[str] = None
    weight: Optional[float] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    status: str
    views: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True