from __future__ import annotations

from typing import Any, Dict, Optional

from app.core.database import get_database


class ReferralService:
    REFERRALS_COLLECTION = "customer_referrals"
    REWARDS_COLLECTION = "customer_referral_rewards"

    @staticmethod
    def _referrals_collection():
        return get_database()[ReferralService.REFERRALS_COLLECTION]

    @staticmethod
    def _rewards_collection():
        return get_database()[ReferralService.REWARDS_COLLECTION]

    @staticmethod
    async def _count_referrals(user_id: str) -> int:
        try:
            return await ReferralService._referrals_collection().count_documents({"user_id": user_id})
        except Exception:
            return 0

    @staticmethod
    async def _sum_rewards(user_id: str) -> float:
        try:
            pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {"_id": None, "total": {"$sum": {"$ifNull": ["$amount", 0]}}}},
            ]
            cursor = ReferralService._rewards_collection().aggregate(pipeline)
            results = await cursor.to_list(length=1)
            if not results:
                return 0.0
            total = results[0].get("total", 0.0)
            return float(total or 0.0)
        except Exception:
            return 0.0

    @staticmethod
    async def _ensure_referral_code(profile: Dict[str, Any], user_id: str) -> Optional[str]:
        refer = (profile or {}).get("refer_and_earn") or {}
        code = refer.get("code")
        if code:
            return code

        user = (profile or {}).get("user") or {}
        # Use a deterministic fallback code based on the user_id.
        code = user.get("id") or user_id.replace("@", "-at-").replace(".", "-")
        return code

    @staticmethod
    async def get_summary(user_id: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        profile_refer = (profile or {}).get("refer_and_earn") or {}

        referrals = await ReferralService._count_referrals(user_id)
        earned = await ReferralService._sum_rewards(user_id)
        code = await ReferralService._ensure_referral_code(profile, user_id)

        currency = profile_refer.get("currency") or "USD"

        return {
            "code": code,
            "referrals": referrals,
            "earned": earned,
            "currency": currency,
        }


