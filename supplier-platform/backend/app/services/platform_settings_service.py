from __future__ import annotations

import time
from datetime import datetime
from typing import Any, Dict, Optional

from app.core.database import get_database


class PlatformSettingsService:
    """
    Reads global platform settings from Mongo (`platform_settings` collection).
    Admin writes these settings; supplier backend reads them for payout calculations.
    """

    COLLECTION = "platform_settings"
    DOC_ID = "platform"

    DEFAULT_COMMISSION_RATE = 0.25
    DEFAULT_PAYOUT_SCHEDULE = "Bi-Weekly"

    _cache: Optional[Dict[str, Any]] = None
    _cache_ts: float = 0.0
    _ttl_seconds: int = 10

    @classmethod
    async def get_settings(cls, *, bypass_cache: bool = False) -> Dict[str, Any]:
        now = time.time()
        if not bypass_cache and cls._cache and (now - cls._cache_ts) < cls._ttl_seconds:
            return cls._cache

        db = get_database()
        doc = await db[cls.COLLECTION].find_one({"_id": cls.DOC_ID}) or {}

        commission_rate = float(doc.get("commission_rate", cls.DEFAULT_COMMISSION_RATE) or cls.DEFAULT_COMMISSION_RATE)
        commission_rate = max(0.0, min(commission_rate, 1.0))
        payout_schedule = str(doc.get("payout_schedule", cls.DEFAULT_PAYOUT_SCHEDULE) or cls.DEFAULT_PAYOUT_SCHEDULE)

        data = {
            "commission_rate": commission_rate,
            "commission_percent": round(commission_rate * 100, 2),
            "payout_schedule": payout_schedule,
            "updated_at": doc.get("updated_at") or datetime.utcnow(),
        }

        cls._cache = data
        cls._cache_ts = now
        return data

    @classmethod
    async def get_commission_rate(cls) -> float:
        s = await cls.get_settings()
        return float(s.get("commission_rate", cls.DEFAULT_COMMISSION_RATE) or cls.DEFAULT_COMMISSION_RATE)


