from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Optional, Dict, Any
from app.core.database import get_database
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def serialize_review(doc: Dict[str, Any]) -> Dict[str, Any]:
    data = dict(doc)
    data["id"] = str(data.pop("_id", ""))
    return data


async def _resolve_user_matches(db, customer_id_or_email: str, extra_email: Optional[str] = None) -> Dict[str, Any]:
    """
    Resolve possible user_ids and emails to match reviews, given a customer_id, user_id, or email.
    Returns dict with 'user_ids' (list of ObjectId/str) and 'emails' (list).
    """
    user_ids: List[Any] = []
    emails: List[str] = []
    users = db["users"]
    profiles = db["customer_profiles"]

    if "@" in customer_id_or_email:
        emails.append(customer_id_or_email.lower())
    if extra_email and "@" in extra_email:
        emails.append(extra_email.lower())

    # direct id
    if ObjectId.is_valid(customer_id_or_email):
        user_ids.append(ObjectId(customer_id_or_email))
    user_ids.append(customer_id_or_email)

    # profiles by customer_id
    profile = await profiles.find_one({"customer_id": customer_id_or_email}, {"user_id": 1, "user.email": 1})
    if profile:
        uid = profile.get("user_id")
        if uid:
            user_ids.append(uid)
            if ObjectId.is_valid(uid):
                user_ids.append(ObjectId(uid))
        prof_email = (profile.get("user") or {}).get("email")
        if prof_email:
            emails.append(prof_email.lower())

    # profiles by email
    email_queries = []
    if "@" in customer_id_or_email:
        email_queries.append(customer_id_or_email)
    if extra_email and "@" in extra_email:
        email_queries.append(extra_email)
    for em in email_queries:
        prof = await profiles.find_one({"user.email": em}, {"user_id": 1, "user.email": 1})
        if prof:
            uid = prof.get("user_id")
            if uid:
                user_ids.append(uid)
                if ObjectId.is_valid(uid):
                    user_ids.append(ObjectId(uid))
            prof_email = (prof.get("user") or {}).get("email")
            if prof_email:
                emails.append(prof_email.lower())

    # users by customer_id or email
    user_query = {"$or": [{"customer_id": customer_id_or_email}, {"email": customer_id_or_email}]}
    if extra_email:
        user_query["$or"].append({"email": extra_email})
    user_doc = await users.find_one(user_query, {"_id": 1, "email": 1})
    if user_doc:
        oid = user_doc.get("_id")
        if oid:
            user_ids.append(oid)
            user_ids.append(str(oid))
        if user_doc.get("email"):
            emails.append(user_doc["email"].lower())

    # dedup
    def dedup(seq):
        seen = set()
        out = []
        for item in seq:
            key = str(item).lower() if isinstance(item, str) else str(item)
            if key in seen:
                continue
            seen.add(key)
            out.append(item)
        return out

    return {
        "user_ids": dedup(user_ids),
        "emails": dedup(emails),
    }


@router.get("/reviews/{customer_id}")
async def list_reviews_for_customer(
    customer_id: str = Path(..., description="Customer identifier (customer_id, user_id, or email)"),
    limit: int = Query(50, ge=1, le=200, description="Max reviews to return"),
    product_only: bool = Query(False, description="If true, only reviews with product_title"),
    email: Optional[str] = Query(None, description="Optional email to help match reviews"),
):
    try:
        db = get_database()
        resolved = await _resolve_user_matches(db, customer_id, extra_email=email)
        user_ids = resolved.get("user_ids", [])
        emails = resolved.get("emails", [])
        if not user_ids and not emails:
            return {"reviews": [], "total": 0}

        or_conditions: List[Dict[str, Any]] = []
        if user_ids:
            or_conditions.append({"user_id": {"$in": user_ids}})
        if emails:
            # case-insensitive email match
            email_regex = [{"author.email": {"$regex": f"^{e}$", "$options": "i"}} for e in emails]
            or_conditions.extend(email_regex)
        # customer_id direct match (for CU-xxxx formats if stored)
        or_conditions.append({"customer_id": customer_id})
        # fallback match on email stored directly (non-author)
        if emails:
            email_regex_direct = [{"email": {"$regex": f"^{e}$", "$options": "i"}} for e in emails]
            or_conditions.extend(email_regex_direct)
        # fallback match on name if provided
        if "@" not in customer_id:
            or_conditions.append({"author.name": {"$regex": customer_id, "$options": "i"}})

        if not or_conditions:
            return {"reviews": [], "total": 0}

        review_match: Dict[str, Any] = {"$or": or_conditions}

        if product_only:
            review_match["$and"] = [
                {"$or": [
                    {"product_title": {"$exists": True, "$ne": None}},
                    {"booking_id": {"$exists": True, "$ne": None}},
                ]}
            ]

        cursor = db["customer_reviews"].find(review_match).sort("created_at", -1).limit(limit)
        reviews: List[Dict[str, Any]] = []
        async for doc in cursor:
            reviews.append(serialize_review(doc))
        return {"reviews": reviews, "total": len(reviews)}
    except Exception as exc:
        logger.error(f"Error fetching reviews for {customer_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Unable to fetch reviews right now.")

