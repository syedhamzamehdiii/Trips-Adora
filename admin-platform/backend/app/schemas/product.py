from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class AdminProductSummary(BaseModel):
    id: str
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_avatar_url: Optional[str] = None

    title: str
    category: Optional[str] = None
    activity_type: Optional[str] = None
    destination: Optional[str] = None
    location: Optional[str] = None  # Resolved location or destination
    duration: Optional[str] = None
    groupSize: Optional[str] = None  # Group size from vehicle capacity

    status: str

    price: float = 0.0
    currency: str = "USD"
    price_unit: Optional[str] = None

    hero_image: Optional[str] = None
    images: List[str] = []

    rating: Optional[float] = None
    reviews_count: int = 0
    selling_points: List[str] = []  # For tags display

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None


class AdminProductListResponse(BaseModel):
    products: List[AdminProductSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


class RejectProductRequest(BaseModel):
    reason: Optional[str] = None


