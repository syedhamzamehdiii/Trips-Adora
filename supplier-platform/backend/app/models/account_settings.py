from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from beanie import Document
from pydantic import Field


class SupplierAccountSettings(Document):
    supplier_id: str = Field(..., description="Reference to the supplier/user id")
    data: Dict[str, Any] = Field(default_factory=dict, description="Persisted settings payload")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "supplier_account_settings"
        indexes = ["supplier_id"]

    async def touch(self) -> None:
        self.updated_at = datetime.utcnow()

