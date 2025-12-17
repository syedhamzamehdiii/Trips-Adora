from __future__ import annotations

import time
from datetime import datetime
from typing import Any, Dict, Optional

from app.core.database import get_database


class PlatformSettingsService:
    """
    Single source of truth for commission settings (shared across platforms via Mongo).
    Stored in collection `platform_settings` with a single document `_id="platform"`.
    """

    COLLECTION = "platform_settings"
    DOC_ID = "platform"

    DEFAULT_COMMISSION_RATE = 0.25
    DEFAULT_PAYOUT_SCHEDULE = "Bi-Weekly"

    _cache: Optional[Dict[str, Any]] = None
    _cache_ts: float = 0.0
    _ttl_seconds: int = 10  # small TTL so changes reflect quickly everywhere

    @staticmethod
    def _db():
        return get_database()

    @classmethod
    async def get_settings(cls, *, bypass_cache: bool = False) -> Dict[str, Any]:
        now = time.time()
        if not bypass_cache and cls._cache and (now - cls._cache_ts) < cls._ttl_seconds:
            return cls._cache

        db = cls._db()
        doc = await db[cls.COLLECTION].find_one({"_id": cls.DOC_ID}) or {}

        commission_rate = float(doc.get("commission_rate", cls.DEFAULT_COMMISSION_RATE) or cls.DEFAULT_COMMISSION_RATE)
        # clamp just in case
        commission_rate = max(0.0, min(commission_rate, 1.0))
        payout_schedule = str(doc.get("payout_schedule", cls.DEFAULT_PAYOUT_SCHEDULE) or cls.DEFAULT_PAYOUT_SCHEDULE)
        updated_at = doc.get("updated_at")

        data = {
            "commission_rate": commission_rate,
            "commission_percent": round(commission_rate * 100, 2),
            "payout_schedule": payout_schedule,
            "updated_at": updated_at,
        }

        cls._cache = data
        cls._cache_ts = now
        return data

    @classmethod
    async def get_commission_rate(cls) -> float:
        s = await cls.get_settings()
        return float(s.get("commission_rate", cls.DEFAULT_COMMISSION_RATE) or cls.DEFAULT_COMMISSION_RATE)

    @classmethod
    async def update_settings(
        cls,
        *,
        commission_rate: Optional[float] = None,
        commission_percent: Optional[float] = None,
        payout_schedule: Optional[str] = None,
    ) -> Dict[str, Any]:
        if commission_percent is not None and commission_rate is None:
            commission_rate = float(commission_percent) / 100.0
        if commission_rate is None:
            commission_rate = None

        update: Dict[str, Any] = {"updated_at": datetime.utcnow()}
        if commission_rate is not None:
            rate = max(0.0, min(float(commission_rate), 1.0))
            update["commission_rate"] = rate
        if payout_schedule is not None:
            update["payout_schedule"] = str(payout_schedule).strip() or cls.DEFAULT_PAYOUT_SCHEDULE

        db = cls._db()
        await db[cls.COLLECTION].update_one(
            {"_id": cls.DOC_ID},
            {"$set": update, "$setOnInsert": {"_id": cls.DOC_ID}},
            upsert=True,
        )

        # bust cache so it reflects immediately
        cls._cache = None
        cls._cache_ts = 0.0
        return await cls.get_settings(bypass_cache=True)


