from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
import logging

logger = logging.getLogger(__name__)


class FeedbackService:
    REVIEWS_COLLECTION = "customer_reviews"
    PROFILES_COLLECTION = "customer_profiles"
    _indexes_created = False

    @staticmethod
    def _month_match(month: Optional[str]) -> Dict[str, Any]:
        """Return a Mongo match clause for the given month (name or 1-12)."""
        if not month:
            return {}
        if isinstance(month, str) and month.lower() == "all":
            return {}
        month_num = None
        try:
            month_num = datetime.strptime(month[:3], "%b").month
        except Exception:
            try:
                month_num = int(month)
            except Exception:
                month_num = None
        if month_num and 1 <= month_num <= 12:
            return {"$expr": {"$eq": [{"$month": "$created_at"}, month_num]}}
        return {}

    @staticmethod
    async def _ensure_indexes():
        """Create helpful indexes to speed up feedback queries (idempotent)."""
        if FeedbackService._indexes_created:
            return
        db = get_database()
        reviews = db[FeedbackService.REVIEWS_COLLECTION]
        try:
            await reviews.create_index([("created_at", -1)], background=True)
            await reviews.create_index([("user_id", 1)], background=True)
            await reviews.create_index([("rating", 1)], background=True)
            await reviews.create_index([("product_title", 1)], background=True)
            FeedbackService._indexes_created = True
        except Exception as exc:
            logger.debug(f"Index creation skipped: {exc}")

    @staticmethod
    def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
        if not doc:
            return {}
        data = dict(doc)
        data["id"] = str(data.pop("_id", ""))
        created = data.get("created_at") or data.get("createdAt")
        if isinstance(created, datetime):
            data["created_at"] = created
            data["date"] = created.strftime("%B %Y")
        author = data.get("author") or {}
        data["name"] = author.get("name") or author.get("email") or "Customer"
        data["text"] = data.get("content") or data.get("text")
        data["reference"] = data.get("product_title") or data.get("booking_id")
        return data

    @staticmethod
    async def list_feedbacks(limit: int = 100, search: Optional[str] = None, month: Optional[str] = None) -> List[Dict[str, Any]]:
        await FeedbackService._ensure_indexes()
        db = get_database()
        reviews = db[FeedbackService.REVIEWS_COLLECTION]

        match_stage: Dict[str, Any] = FeedbackService._month_match(month)

        pipeline: List[Dict[str, Any]] = [
            {"$match": match_stage},
            {
                "$lookup": {
                    "from": FeedbackService.PROFILES_COLLECTION,
                    "localField": "user_id",
                    "foreignField": "user_id",
                    "as": "profile",
                    "pipeline": [
                        {"$project": {"user.name": 1, "user.email": 1}}
                    ]
                }
            },
            {
                "$addFields": {
                    "profile": {"$arrayElemAt": ["$profile", 0]},
                    "resolved_name": {
                        "$ifNull": [
                            "$author.name",
                            {
                                "$ifNull": [
                                    "$author.email",
                                    {
                                        "$ifNull": [
                                            "$profile.user.name",
                                            {"$ifNull": ["$profile.user.email", "Customer"]}
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    "resolved_reference": {"$ifNull": ["$product_title", "$booking_id"]},
                }
            },
        ]

        if search:
            search_regex = {"$regex": search, "$options": "i"}
            pipeline.append({
                "$match": {
                    "$or": [
                        {"resolved_name": search_regex},
                        {"resolved_reference": search_regex},
                        {"content": search_regex},
                        {"title": search_regex},
                    ]
                }
            })

        pipeline.extend([
            {"$sort": {"created_at": -1}},
            {"$limit": limit},
            {
                "$project": {
                    "user_id": 1,
                    "product_title": 1,
                    "booking_id": 1,
                    "rating": 1,
                    "title": 1,
                    "content": 1,
                    "created_at": 1,
                    "author": 1,
                    "name": "$resolved_name",
                    "reference": "$resolved_reference",
                }
            }
        ])

        docs = []
        async for doc in reviews.aggregate(pipeline):
            # Keep compatibility with existing serializer
            doc["author"] = doc.get("author") or {"name": doc.get("name")}
            docs.append(FeedbackService._serialize(doc))

        return docs

    @staticmethod
    async def get_stats(month: Optional[str] = None) -> Dict[str, Any]:
        await FeedbackService._ensure_indexes()
        db = get_database()
        reviews = db[FeedbackService.REVIEWS_COLLECTION]
        messages = db["messages"]

        match_stage = FeedbackService._month_match(month)

        # Total reviews
        total_reviews = await reviews.count_documents(match_stage if match_stage else {})

        # Average rating
        pipeline = [
            {"$match": {"rating": {"$exists": True}, **match_stage}},
            {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}},
        ]
        avg_rating = 0.0
        agg = await reviews.aggregate(pipeline).to_list(length=1)
        if agg and agg[0].get("avg_rating") is not None:
            avg_rating = float(agg[0]["avg_rating"])

        # Pending replies: unread messages sent to admin
        pending_replies = await messages.count_documents({
            "recipient_id": "admin",
            "is_read": False
        })

        return {
            "total_reviews": total_reviews,
            "avg_rating": round(avg_rating, 2),
            "pending_replies": pending_replies,
        }

