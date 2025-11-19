from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pymongo.errors import AutoReconnect, ServerSelectionTimeoutError

from app.core.database import get_database
from app.core.exceptions import DatabaseUnavailableError
from app.services.activity_service import ActivityService


class ReviewService:
    COLLECTION = "customer_reviews"
    PROFILES_COLLECTION = "customer_profiles"

    @staticmethod
    def _collection():
        return get_database()[ReviewService.COLLECTION]

    @staticmethod
    def _serialize(document: Dict[str, Any]) -> Dict[str, Any]:
        if not document:
            return {}

        doc = dict(document)
        doc["id"] = str(doc.pop("_id"))
        created = doc.get("created_at") or doc.get("createdAt")
        if isinstance(created, datetime):
            doc["created_at"] = created.isoformat()
        updated = doc.get("updated_at") or doc.get("updatedAt")
        if isinstance(updated, datetime):
            doc["updated_at"] = updated.isoformat()
        visited = doc.get("visited_at") or doc.get("visitedAt")
        if isinstance(visited, datetime):
            doc["visited_at"] = visited.isoformat()
        return doc

    @staticmethod
    async def list_reviews(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        try:
            # Use projection to fetch only necessary fields for faster queries
            cursor = (
                ReviewService._collection()
                .find(
                    {"user_id": user_id},
                    {
                        "user_id": 1,
                        "product_id": 1,
                        "product_title": 1,
                        "booking_id": 1,
                        "rating": 1,
                        "title": 1,
                        "content": 1,
                        "visited_at": 1,
                        "author": 1,
                        "created_at": 1,
                        "updated_at": 1,
                    }
                )
                .sort("created_at", -1)
                .limit(limit)
            )
            documents = await cursor.to_list(length=limit)
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Review data is currently unavailable.") from exc
        return [ReviewService._serialize(doc) for doc in documents]

    @staticmethod
    async def _resolve_author(user_id: str, author: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        author = dict(author or {})

        has_name = bool(author.get("name"))
        has_email = bool(author.get("email"))
        has_avatar = bool(author.get("avatar_url"))

        if has_name and has_email and has_avatar:
            return author

        try:
            profile = await get_database()[ReviewService.PROFILES_COLLECTION].find_one(
                {"user_id": user_id},
                {"user.name": 1, "user.email": 1, "user.avatar_url": 1},
            )
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Profile data is currently unavailable.") from exc
        if profile:
            user = profile.get("user") or {}
            author.setdefault("name", user.get("name"))
            author.setdefault("email", user.get("email"))
            author.setdefault("avatar_url", user.get("avatar_url"))

        return author

    @staticmethod
    async def create_review(user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.utcnow()
        document_payload = dict(payload)
        visited = document_payload.get("visited_at")
        if isinstance(visited, str):
            try:
                document_payload["visited_at"] = datetime.fromisoformat(visited)
            except ValueError:
                document_payload["visited_at"] = visited

        document_payload["author"] = await ReviewService._resolve_author(user_id, document_payload.get("author"))

        document: Dict[str, Any] = {
            **document_payload,
            "user_id": user_id,
            "created_at": now,
            "updated_at": now,
        }

        try:
            result = await ReviewService._collection().insert_one(document)
            inserted = await ReviewService._collection().find_one({"_id": result.inserted_id})
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to save review right now.") from exc
        serialized = ReviewService._serialize(inserted)

        await ActivityService.log_review_submitted(serialized)

        return serialized

    @staticmethod
    async def delete_review(user_id: str, review_id: str) -> bool:
        try:
            oid = ObjectId(review_id)
        except Exception:
            return False

        try:
            doc = await ReviewService._collection().find_one({"_id": oid, "user_id": user_id})
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to load review data right now.") from exc
        if not doc:
            return False

        try:
            result = await ReviewService._collection().delete_one({"_id": oid, "user_id": user_id})
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to delete review right now.") from exc
        if result.deleted_count == 1:
            await ActivityService.log_review_deleted(
                user_id=user_id,
                review_id=review_id,
                product_title=doc.get("product_title"),
            )
            return True
        return False

