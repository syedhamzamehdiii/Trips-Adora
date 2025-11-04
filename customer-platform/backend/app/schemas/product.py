from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ProductResponse(BaseModel):
    """Schema for product response to customer frontend"""
    id: str
    title: str
    tagline: Optional[str] = None
    description: str
    category: str
    images: List[str] = []
    hero_image: Optional[str] = None
    price: float
    currency: str = "USD"
    price_unit: str = "Per Group"
    destination: Optional[str] = None
    duration: Optional[str] = None
    activity_type: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: int = 0
    views: int = 0
    bookings_count: int = 0
    created_at: datetime
    published_at: Optional[datetime] = None
    
    # Additional fields for frontend
    location: Optional[str] = None
    groupSize: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ProductListResponse(BaseModel):
    """Schema for paginated product list"""
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

