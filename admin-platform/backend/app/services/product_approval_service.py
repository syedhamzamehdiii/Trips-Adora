from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from bson import ObjectId

from app.core.database import get_database


class ProductApprovalService:
    USERS_COLLECTION = "users"
    SETTINGS_COLLECTION = "supplier_account_settings"

    @staticmethod
    def _db():
        return get_database()

    @staticmethod
    def _build_match(
        status: Optional[str] = None,
        search: Optional[str] = None,
        country: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Dict[str, Any]:
        match: Dict[str, Any] = {}

        if status and str(status).strip() and str(status).lower() != "all":
            match["status"] = str(status).strip().lower()

        if category and str(category).strip() and str(category).lower() != "all":
            match["category"] = {"$regex": str(category).strip(), "$options": "i"}

        if country and str(country).strip() and str(country).lower() != "all":
            # best-effort filter: destination/country is stored in destination like "Tokyo, Japan"
            match["destination"] = {"$regex": str(country).strip(), "$options": "i"}

        if search and str(search).strip():
            q = str(search).strip()
            regex = {"$regex": q, "$options": "i"}
            match["$or"] = [
                {"title": regex},
                {"tagline": regex},
                {"description": regex},
                {"destination": regex},
                {"category": regex},
            ]

        return match

    @staticmethod
    async def list_products(
        *,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
        country: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Tuple[List[Dict[str, Any]], int]:
        db = ProductApprovalService._db()
        products = db["products"]

        page = max(1, int(page or 1))
        page_size = max(1, min(int(page_size or 20), 100))
        skip = (page - 1) * page_size

        match = ProductApprovalService._build_match(status=status, search=search, country=country, category=category)

        total = await products.count_documents(match)

        pipeline: List[Dict[str, Any]] = [
            {"$match": match},
            {
                "$addFields": {
                    "supplier_obj_id": {
                        "$convert": {
                            "input": "$supplier_id",
                            "to": "objectId",
                            "onError": None,
                            "onNull": None,
                        }
                    }
                }
            },
            {
                "$lookup": {
                    "from": ProductApprovalService.USERS_COLLECTION,
                    "localField": "supplier_obj_id",
                    "foreignField": "_id",
                    "as": "supplier_user",
                }
            },
            {
                "$lookup": {
                    "from": ProductApprovalService.SETTINGS_COLLECTION,
                    "localField": "supplier_id",
                    "foreignField": "supplier_id",
                    "as": "supplier_settings",
                }
            },
            {
                "$addFields": {
                    "supplier_name": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$supplier_user.business_name", 0]},
                            {"$arrayElemAt": ["$supplier_user.full_name", 0]},
                        ]
                    },
                    "supplier_avatar_url": {
                        "$let": {
                            "vars": {
                                "s": {"$arrayElemAt": ["$supplier_settings", 0]}
                            },
                            "in": {
                                "$ifNull": [
                                    "$$s.data.globalUserPhoto",
                                    {
                                        "$ifNull": [
                                            "$$s.data.profilePhotoPreview",
                                            {
                                                "$ifNull": [
                                                    {"$arrayElemAt": ["$supplier_user.avatar_url", 0]},
                                                    {"$arrayElemAt": ["$supplier_user.profile_photo", 0]},
                                                ]
                                            },
                                        ]
                                    },
                                ]
                            }
                        }
                    },
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "supplier_id": 1,
                    "supplier_name": 1,
                    "supplier_avatar_url": 1,
                    "title": 1,
                    "category": 1,
                    "activity_type": 1,
                    "destination": 1,
                    "resolved_location": 1,  # For location display
                    "duration": 1,
                    "status": 1,
                    "price": {"$ifNull": ["$price", 0]},
                    "currency": {"$ifNull": ["$currency", "USD"]},
                    "price_unit": 1,
                    "hero_image": 1,
                    "images": 1,
                    "rating": 1,
                    "reviews_count": {"$ifNull": ["$reviews_count", 0]},
                    "selling_points": 1,  # For tags
                    "groupSize": 1,  # Group size if set
                    "maxGroupSize": 1,  # Alternative group size field
                    "created_at": 1,
                    "updated_at": 1,
                    "published_at": 1,
                }
            },
            {"$sort": {"updated_at": -1, "created_at": -1}},
            {"$skip": skip},
            {"$limit": page_size},
        ]

        rows = await products.aggregate(pipeline).to_list(length=page_size)
        out: List[Dict[str, Any]] = []
        for r in rows:
            r["id"] = str(r.pop("_id"))
            # Normalize hero image from images if missing
            hero = r.get("hero_image")
            if not hero:
                imgs = r.get("images") or []
                if isinstance(imgs, list) and imgs:
                    r["hero_image"] = imgs[0]
            
            # Set location from resolved_location or destination
            if not r.get("location"):
                r["location"] = r.get("resolved_location") or r.get("destination")
            
            # Calculate groupSize from vehicle capacity if not set
            if not r.get("groupSize") and not r.get("maxGroupSize"):
                try:
                    db = ProductApprovalService._db()
                    if db:
                        vehicle_collection = db.supplier_vehicle_options
                        vehicles = await vehicle_collection.find({
                            "product_id": r.get("id"),
                            "is_active": True
                        }).to_list(length=10)
                        if vehicles:
                            max_capacity = max((v.get("capacity", 0) for v in vehicles if v.get("capacity")), default=None)
                            if max_capacity:
                                r["groupSize"] = f"Up to {max_capacity}"
                except Exception:
                    pass  # If vehicle lookup fails, leave groupSize as None
            
            # Ensure groupSize is set
            if not r.get("groupSize"):
                r["groupSize"] = r.get("maxGroupSize") or "Up to 12"
            
            out.append(r)

        return out, int(total or 0)

    @staticmethod
    async def approve_product(product_id: str, approved_by: str = "admin") -> bool:
        db = ProductApprovalService._db()
        products = db["products"]
        if not ObjectId.is_valid(product_id):
            return False
        now = datetime.utcnow()
        res = await products.update_one(
            {"_id": ObjectId(product_id)},
            {
                "$set": {
                    "status": "published",
                    "published_at": now,
                    "updated_at": now,
                    "admin_approved_at": now,
                    "admin_approved_by": approved_by,
                    "admin_rejection_reason": None,
                }
            },
        )
        return res.matched_count > 0

    @staticmethod
    async def reject_product(product_id: str, reason: Optional[str] = None, rejected_by: str = "admin") -> bool:
        db = ProductApprovalService._db()
        products = db["products"]
        if not ObjectId.is_valid(product_id):
            return False
        now = datetime.utcnow()
        res = await products.update_one(
            {"_id": ObjectId(product_id)},
            {
                "$set": {
                    "status": "rejected",
                    "updated_at": now,
                    "admin_rejection_reason": (reason or "").strip() or None,
                    "admin_rejected_at": now,
                    "admin_rejected_by": rejected_by,
                }
            },
        )
        return res.matched_count > 0


