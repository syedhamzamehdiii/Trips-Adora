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
        normalised = ProfileService._normalise_dates(doc)

        # Ensure key timestamp fields are always strings for schema validation
        def ensure_str(val):
            from datetime import datetime
            if isinstance(val, datetime):
                return val.isoformat()
            return val

        for field in ("last_synced_at", "created_at", "updated_at"):
            if field in normalised:
                normalised[field] = ensure_str(normalised[field])

        user_section = normalised.get("user")
        if isinstance(user_section, dict):
            for field in ("member_since", "date_of_birth"):
                if field in user_section:
                    user_section[field] = ensure_str(user_section[field])

        return normalised

    @staticmethod
    def _default_profile(user_id: str) -> Dict[str, Any]:
        """Create a default profile document for a new user."""
        now = datetime.utcnow()
        return {
            "user_id": user_id,
            "user": {},
            "wishlist": [],
            "created_at": now,
            "updated_at": now,
        }

    @staticmethod
    async def ensure_profile(user_id: str) -> Dict[str, Any]:
        """Ensure a profile exists for the user, creating one if it doesn't."""
        collection = ProfileService._collection()
        doc = await collection.find_one({"user_id": user_id})
        if doc:
            return ProfileService._prepare_document(doc)
        # Create default profile
        default_doc = ProfileService._default_profile(user_id)
        try:
            result = await collection.insert_one(default_doc)
            default_doc["_id"] = result.inserted_id
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to create profile data.") from exc
        return ProfileService._prepare_document(default_doc)

    @staticmethod
    async def get_profile(user_id: str, summary_only: bool = False) -> Optional[Dict[str, Any]]:
        """Get profile data. If summary_only=True, returns only essential user info for header."""
        collection = ProfileService._collection()
        try:
            if summary_only:
                # Ultra-lightweight query for header - only user info
                document = await collection.find_one(
                    {"user_id": user_id},
                    {
                        "user_id": 1,
                        "user": 1,
                        "_id": 1,
                    }
                )
            else:
                # Use projection to fetch only necessary fields for faster queries
                document = await collection.find_one(
                    {"user_id": user_id},
                    {
                        "user_id": 1,
                        "user": 1,
                        "wishlist": 1,
                        "created_at": 1,
                        "updated_at": 1,
                        # Exclude heavy fields that are computed separately
                        # "stats": 0,
                        # "upcoming_trips": 0,
                        # "recent_activity": 0,
                        # "travel_preferences": 0,
                        # "refer_and_earn": 0,
                    }
                )
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


