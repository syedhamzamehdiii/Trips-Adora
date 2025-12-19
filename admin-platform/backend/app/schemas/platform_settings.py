from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PlatformSettingsResponse(BaseModel):
    commission_rate: float = Field(..., ge=0.0, le=1.0, description="Admin commission as a decimal (e.g., 0.25)")
    commission_percent: float = Field(..., ge=0.0, le=100.0, description="Admin commission percent (e.g., 25)")
    payout_schedule: str = Field(..., description="Supplier payout schedule label (e.g., Bi-Weekly)")
    refund_policy: Optional[dict] = Field(None, description="Refund policy configuration")
    platform_name: Optional[str] = Field(None, description="Platform name")
    platform_url: Optional[str] = Field(None, description="Platform URL")
    support_email: Optional[str] = Field(None, description="Support email address")
    contact_number: Optional[str] = Field(None, description="Contact number")
    updated_at: Optional[datetime] = None


class PlatformSettingsUpdateRequest(BaseModel):
    # Accept either commission_rate (0..1) or commission_percent (0..100)
    commission_rate: Optional[float] = Field(None, ge=0.0, le=1.0)
    commission_percent: Optional[float] = Field(None, ge=0.0, le=100.0)
    payout_schedule: Optional[str] = None
    refund_policy: Optional[dict] = None
    platform_name: Optional[str] = None
    platform_url: Optional[str] = None
    support_email: Optional[str] = None
    contact_number: Optional[str] = None


