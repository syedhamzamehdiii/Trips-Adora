from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class FeedbackItem(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: Optional[str] = None
    reference: Optional[str] = None  # product or booking reference
    date: Optional[str] = None
    rating: Optional[float] = None
    title: Optional[str] = None
    text: Optional[str] = None
    created_at: Optional[datetime] = None


class FeedbackListResponse(BaseModel):
    feedbacks: List[FeedbackItem]
    total: int


class FeedbackStatsResponse(BaseModel):
    total_reviews: int
    avg_rating: float
    pending_replies: int

