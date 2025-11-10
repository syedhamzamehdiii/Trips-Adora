from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from bson import ObjectId
from pymongo import ReturnDocument
from pymongo.errors import AutoReconnect, ServerSelectionTimeoutError

from app.core.database import get_database
from app.core.exceptions import DatabaseUnavailableError
from app.services.activity_service import ActivityService


class ProfileService:
    """Service layer that handles reads/writes for customer profile dashboard data."""

    COLLECTION = "customer_profiles"

    @staticmethod
    def _collection():
        db = get_database()
        return db[ProfileService.COLLECTION]

    @staticmethod
    def _normalise_dates(value: Any) -> Any:
        if isinstance(value, dict):
            return {key: ProfileService._normalise_dates(val) for key, val in value.items()}
        if isinstance(value, list):
            return [ProfileService._normalise_dates(item) for item in value]
        if isinstance(value, datetime):
            return value.isoformat()
        return value

    @staticmethod
    def _prepare_document(document: Dict[str, Any]) -> Dict[str, Any]:
        """Normalise MongoDB document into a serialisable dict for API responses."""
        if not document:
            return document

        doc = dict(document)
        doc["id"] = str(doc.pop("_id"))
        return ProfileService._normalise_dates(doc)

    @staticmethod
    async def get_profile(user_id: str) -> Optional[Dict[str, Any]]:
        collection = ProfileService._collection()
        try:
            document = await collection.find_one({"user_id": user_id})
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Profile data is currently unavailable.") from exc
        if not document:
            return None
        return ProfileService._prepare_document(document)

    @staticmethod
    async def upsert_profile(user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Create or fully replace a profile document for the given user."""
        collection = ProfileService._collection()
        now = datetime.utcnow()

        payload_to_set = {
            **payload,
            "user_id": user_id,
            "updated_at": now,
        }

        try:
            result = await collection.find_one_and_update(
                {"user_id": user_id},
                {
                    "$set": payload_to_set,
                    "$setOnInsert": {"created_at": now},
                },
                upsert=True,
                return_document=ReturnDocument.AFTER,
            )
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to upsert profile data.") from exc
        return ProfileService._prepare_document(result)

    @staticmethod
    async def update_profile(user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Apply partial updates to an existing profile document."""
        if not updates:
            return await ProfileService.get_profile(user_id)

        collection = ProfileService._collection()
        now = datetime.utcnow()
        update_doc: Dict[str, Any] = {
            "$set": {**updates, "updated_at": now},
            "$setOnInsert": {"created_at": now},
        }

        try:
            result = await collection.find_one_and_update(
                {"user_id": user_id},
                update_doc,
                upsert=True,
                return_document=ReturnDocument.AFTER,
            )
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to update profile data.") from exc

        if not result:
            return None

        await ActivityService.log_profile_updated(user_id)

        return ProfileService._prepare_document(result)

    @staticmethod
    async def delete_profile(user_id: str) -> bool:
        collection = ProfileService._collection()
        try:
            result = await collection.delete_one({"user_id": user_id})
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to delete profile data.") from exc
        return result.deleted_count == 1


