from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PlatformSettingsResponse(BaseModel):
    commission_rate: float = Field(..., ge=0.0, le=1.0, description="Admin commission as a decimal (e.g., 0.25)")
    commission_percent: float = Field(..., ge=0.0, le=100.0, description="Admin commission percent (e.g., 25)")
    payout_schedule: str = Field(..., description="Supplier payout schedule label (e.g., Bi-Weekly)")
    updated_at: Optional[datetime] = None


class PlatformSettingsUpdateRequest(BaseModel):
    # Accept either commission_rate (0..1) or commission_percent (0..100)
    commission_rate: Optional[float] = Field(None, ge=0.0, le=1.0)
    commission_percent: Optional[float] = Field(None, ge=0.0, le=100.0)
    payout_schedule: Optional[str] = None


