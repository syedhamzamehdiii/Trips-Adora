from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId

from app.core.database import get_database


TRAVEL_CATEGORY_LABELS = {
    "adventure": "Adventure",
    "cultural": "Cultural",
    "relaxation": "Relaxation",
    "food_dining": "Food & Dining",
}


PREFERENCE_KEYWORDS = {
    "adventure": [
        "adventure",
        "hike",
        "hiking",
        "climb",
        "mountain",
        "rafting",
        "ski",
        "snow",
        "trail",
        "outdoor",
    ],
    "cultural": [
        "cultural",
        "culture",
        "temple",
        "heritage",
        "historic",
        "museum",
        "tour",
        "festival",
    ],
    "relaxation": [
        "relax",
        "relaxing",
        "spa",
        "resort",
        "retreat",
        "escape",
        "zen",
        "onsen",
    ],
    "food_dining": [
        "food",
        "dining",
        "restaurant",
        "culinary",
        "tasting",
        "foodie",
        "dinner",
        "wine",
    ],
}


class ActivityService:
    COLLECTION = "customer_profile_activity"

    @staticmethod
    def _collection():
        db = get_database()
        return db[ActivityService.COLLECTION]

    @staticmethod
    def _serialize(document: Dict[str, Any]) -> Dict[str, Any]:
        if not document:
            return {}

        doc = dict(document)
        raw_id = doc.pop("_id", None)
        if isinstance(raw_id, ObjectId):
            doc["id"] = str(raw_id)
        elif raw_id is not None:
            doc["id"] = str(raw_id)
        else:
            doc["id"] = doc.get("id")

        timestamp = doc.get("timestamp") or doc.get("created_at")
        if isinstance(timestamp, datetime):
            doc["timestamp"] = timestamp.isoformat()

        if "weight" in doc and doc["weight"] is None:
            doc["weight"] = 1.0

        return doc

    @staticmethod
    async def log_activity(
        user_id: str,
        *,
        title: str,
        category: Optional[str] = None,
        preference_category: Optional[str] = None,
        context: Optional[str] = None,
        weight: float = 1.0,
        metadata: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        doc: Dict[str, Any] = {
            "user_id": user_id,
            "title": title,
            "category": category,
            "preference_category": preference_category,
            "context": context,
            "weight": float(weight or 1.0),
            "metadata": metadata or {},
            "timestamp": timestamp or datetime.utcnow(),
            "created_at": datetime.utcnow(),
        }

        result = await ActivityService._collection().insert_one(doc)
        doc["_id"] = result.inserted_id
        return ActivityService._serialize(doc)

    @staticmethod
    async def get_recent_activity(
        user_id: str,
        limit: int = 8,
        bookings: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        cursor = (
            ActivityService._collection()
            .find({"user_id": user_id})
            .sort("timestamp", -1)
            .limit(limit)
        )
        documents = await cursor.to_list(length=None)
        serialized = [ActivityService._serialize(doc) for doc in documents]

        if serialized or not bookings:
            return serialized

        # Provide a fallback view based on existing bookings if no activity has been logged yet.
        fallback: List[Dict[str, Any]] = []
        for booking in sorted(
            bookings,
            key=lambda item: item.get("startDate") or item.get("createdAt") or "",
            reverse=True,
        )[:limit]:
            title = booking.get("title") or booking.get("tourName") or "Trip"
            date = booking.get("startDate") or booking.get("createdAt")
            fallback.append(
                {
                    "id": f"booking-{booking.get('id')}",
                    "title": f"Booked {title}",
                    "timestamp": date or datetime.utcnow().isoformat(),
                    "category": "booking",
                    "context": booking.get("destination"),
                }
            )

        return fallback

    @staticmethod
    def _match_keyword_category(*values: Optional[str]) -> Optional[str]:
        combined = " ".join(filter(None, values)).lower()
        if not combined:
            return None

        for category, keywords in PREFERENCE_KEYWORDS.items():
            for keyword in keywords:
                if keyword in combined:
                    return category
        return None

    @staticmethod
    def derive_preference_category_from_booking(booking: Dict[str, Any]) -> Optional[str]:
        if not booking:
            return None

        metadata = booking.get("metadata") or {}
        explicit_category = metadata.get("preference_category") or metadata.get("category")
        if explicit_category and explicit_category in TRAVEL_CATEGORY_LABELS:
            return explicit_category

        title = booking.get("title") or booking.get("tour_name") or ""
        notes = booking.get("notes") or ""
        destination = booking.get("destination") or booking.get("location") or ""
        return ActivityService._match_keyword_category(title, notes, destination)

    @staticmethod
    async def get_travel_preferences(
        user_id: str,
        *,
        bookings: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "preference_category": {"$in": list(TRAVEL_CATEGORY_LABELS.keys())},
                }
            },
            {
                "$group": {
                    "_id": "$preference_category",
                    "score": {"$sum": {"$ifNull": ["$weight", 1]}},
                }
            },
        ]

        cursor = ActivityService._collection().aggregate(pipeline)
        aggregated = await cursor.to_list(length=None)
        scores = {doc["_id"]: float(doc.get("score", 0)) for doc in aggregated}

        # If we have no activity data yet, fall back to deriving from bookings.
        if not scores and bookings:
            for booking in bookings:
                category = ActivityService.derive_preference_category_from_booking(booking)
                if not category:
                    continue
                scores[category] = scores.get(category, 0.0) + 1.0

        total_score = sum(scores.values())
        if total_score <= 0:
            return [
                {"label": label, "value": 0}
                for label in TRAVEL_CATEGORY_LABELS.values()
            ]

        preferences: List[Dict[str, Any]] = []
        for key, label in TRAVEL_CATEGORY_LABELS.items():
            score = scores.get(key, 0.0)
            percentage = int(round((score / total_score) * 100))
            preferences.append({"label": label, "value": percentage})

        total_percentage = sum(item["value"] for item in preferences)
        if preferences and total_percentage != 100:
            diff = 100 - total_percentage
            # Adjust the category with the highest score to keep the total at 100.
            max_index = max(range(len(preferences)), key=lambda idx: scores.get(list(TRAVEL_CATEGORY_LABELS.keys())[idx], 0.0))
            preferences[max_index]["value"] = max(0, preferences[max_index]["value"] + diff)

        return preferences

    @staticmethod
    async def log_booking_created(booking: Dict[str, Any]):
        user_id = booking.get("user_id")
        if not user_id:
            return

        category = ActivityService.derive_preference_category_from_booking(booking)
        title = f"Booked {booking.get('title') or booking.get('tour_name') or 'a trip'}"
        context = booking.get("destination") or booking.get("location")

        await ActivityService.log_activity(
            user_id=user_id,
            title=title,
            category="booking",
            preference_category=category,
            context=context,
            weight=3 if category else 1,
            metadata={
                "type": "booking_created",
                "booking_id": booking.get("id") or booking.get("bookingId"),
            },
        )

    @staticmethod
    async def log_booking_cancelled(booking: Dict[str, Any], *, reason: Optional[str] = None):
        user_id = booking.get("user_id")
        if not user_id:
            return

        preference_category = ActivityService.derive_preference_category_from_booking(booking)

        await ActivityService.log_activity(
            user_id=user_id,
            title=f"Cancelled {booking.get('title') or booking.get('tour_name') or 'a booking'}",
            category="booking",
            preference_category=preference_category,
            context=reason or booking.get("destination"),
            weight=1,
            metadata={
                "type": "booking_cancelled",
                "booking_id": booking.get("id") or booking.get("bookingId"),
                "reason": reason,
            },
        )

    @staticmethod
    async def log_profile_updated(user_id: str):
        await ActivityService.log_activity(
            user_id=user_id,
            title="Updated Profile Information",
            category="profile",
            preference_category=None,
            context=None,
            weight=0.5,
            metadata={"type": "profile_updated"},
        )

    @staticmethod
    async def log_review_submitted(review: Dict[str, Any]):
        user_id = review.get("user_id")
        if not user_id:
            return

        product_title = review.get("product_title") or review.get("productId") or "a trip"

        await ActivityService.log_activity(
            user_id=user_id,
            title=f"Shared thoughts about {product_title}",
            category="review",
            preference_category=None,
            context=review.get("title") or review.get("content"),
            weight=2,
            metadata={
                "type": "review_submitted",
                "review_id": review.get("id"),
                "product_id": review.get("product_id"),
                "rating": review.get("rating"),
            },
        )

    @staticmethod
    async def log_review_deleted(*, user_id: str, review_id: str, product_title: Optional[str] = None):
        await ActivityService.log_activity(
            user_id=user_id,
            title=f"Deleted review for {product_title or 'a trip'}",
            category="review",
            preference_category=None,
            context=None,
            weight=1,
            metadata={
                "type": "review_deleted",
                "review_id": review_id,
                "product_title": product_title,
            },
        )


