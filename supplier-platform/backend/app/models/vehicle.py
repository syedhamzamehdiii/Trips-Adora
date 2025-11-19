from __future__ import annotations

from datetime import datetime
from typing import Optional

from beanie import Document
from pydantic import Field


class SupplierVehicle(Document):
    """Persisted vehicle option that suppliers can reuse across products."""

    supplier_id: str = Field(..., description="Owner supplier/user id")
    title: str = Field(..., min_length=1)
    vehicle_type: str = Field(..., min_length=1, description="e.g. SUV, Sedan, Van")
    variant: str = Field(..., min_length=1, description="Vehicle model or trim")
    year: Optional[str] = Field(default=None)
    attributes: Optional[str] = Field(
        default=None,
        description="Short badges such as Premium 1.5x, Luxury, etc.",
    )
    capacity: Optional[int] = Field(
        default=None,
        ge=1,
        description="Recommended number of travellers",
    )
    currency: str = Field(default="USD")
    pricing_type: str = Field(
        default="Per Trip",
        description="Pricing label such as Per Trip, Per Hour",
    )
    amount: float = Field(..., ge=0)
    duration: Optional[str] = Field(
        default=None,
        description="Displayed duration label (e.g. 7h, Full Day)",
    )
    description: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "supplier_vehicle_options"
        indexes = ["supplier_id", "is_active"]

    async def touch(self) -> None:
        self.updated_at = datetime.utcnow()

