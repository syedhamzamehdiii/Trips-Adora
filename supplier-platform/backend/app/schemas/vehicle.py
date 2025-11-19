from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class VehicleBase(BaseModel):
    product_id: Optional[str] = Field(
        default=None, description="Product/draft identifier this vehicle belongs to"
    )
    title: str = Field(..., min_length=1)
    vehicle_type: str = Field(..., min_length=1)
    variant: str = Field(..., min_length=1)
    year: Optional[str] = Field(default=None)
    attributes: Optional[str] = Field(default=None)
    capacity: Optional[int] = Field(default=None, ge=1)
    currency: str = Field(default="USD")
    pricing_type: str = Field(default="Per Trip")
    amount: float = Field(..., ge=0)
    duration: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1)
    vehicle_type: Optional[str] = Field(default=None, min_length=1)
    variant: Optional[str] = Field(default=None, min_length=1)
    year: Optional[str] = None
    attributes: Optional[str] = None
    capacity: Optional[int] = Field(default=None, ge=1)
    currency: Optional[str] = None
    pricing_type: Optional[str] = None
    amount: Optional[float] = Field(default=None, ge=0)
    duration: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    product_id: Optional[str] = None


class VehicleResponse(VehicleBase):
    id: str
    supplier_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VehicleListResponse(BaseModel):
    vehicles: List[VehicleResponse] = []

