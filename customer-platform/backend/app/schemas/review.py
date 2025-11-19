from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict, conint


class ReviewAuthor(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class ReviewBase(BaseModel):
    product_id: Optional[str] = None
    product_title: Optional[str] = None
    booking_id: Optional[str] = None
    rating: conint(ge=1, le=5) = 5
    title: Optional[str] = None
    content: str = Field(..., min_length=3, max_length=2000)
    visited_at: Optional[datetime] = None
    author: ReviewAuthor = Field(default_factory=ReviewAuthor)


class ReviewCreateRequest(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime


class ReviewListResponse(BaseModel):
    reviews: List[ReviewResponse] = Field(default_factory=list)

