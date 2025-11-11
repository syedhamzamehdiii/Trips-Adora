from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class SupplierSettingsPayload(BaseModel):
    """Wrapper for full settings payload."""

    settings: Dict[str, Any] = Field(default_factory=dict)


class SupplierSettingsSectionUpdate(BaseModel):
    """Wrapper for partial section updates."""

    settings: Dict[str, Any] = Field(default_factory=dict)


class SupplierSettingsResponse(BaseModel):
    """Response payload for settings endpoints."""

    settings: Dict[str, Any] = Field(default_factory=dict)
    updated_at: Optional[datetime] = None

