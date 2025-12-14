from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
import logging
import uuid
import asyncio
from fastapi import HTTPException
from pymongo.errors import NetworkTimeout, AutoReconnect, ServerSelectionTimeoutError

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
        try:
            data = dict(doc)
            # Ensure id is always present
            doc_id = data.pop("_id", None)
            if doc_id:
                data["id"] = str(doc_id)
            elif "id" not in data:
                # Fallback: generate a temporary id if missing
                data["id"] = str(uuid.uuid4())
            
            # Handle created_at date
            created = data.get("created_at") or data.get("createdAt")
            if isinstance(created, datetime):
                data["created_at"] = created
                data["date"] = created.strftime("%B %Y")
            elif created:
                # Try to parse if it's a string
                try:
                    if isinstance(created, str):
                        created_dt = datetime.fromisoformat(created.replace('Z', '+00:00'))
                        data["created_at"] = created_dt
                        data["date"] = created_dt.strftime("%B %Y")
                except Exception:
                    pass
            
            # Resolve name from author field
            author = data.get("author")
            if not isinstance(author, dict):
                author = {}
            
            # Get name from author, or use existing name field, or default to "Customer"
            resolved_name = (
                author.get("name") or 
                author.get("email") or 
                data.get("name") or 
                "Customer"
            )
            data["name"] = resolved_name
            
            # Set text from content or text field
            data["text"] = data.get("content") or data.get("text") or ""
            
            # Set reference from product_title or booking_id
            data["reference"] = data.get("product_title") or data.get("booking_id") or None
            
            # Ensure required fields have defaults (matching FeedbackItem schema)
            if "user_id" not in data or data["user_id"] is None:
                data["user_id"] = None
            if "rating" not in data or data["rating"] is None:
                data["rating"] = None
            if "title" not in data or data["title"] is None:
                data["title"] = None
            if "date" not in data:
                # Ensure date is set from created_at
                if data.get("created_at"):
                    if isinstance(data["created_at"], datetime):
                        data["date"] = data["created_at"].strftime("%B %Y")
                    else:
                        data["date"] = None
                else:
                    data["date"] = None
                
            return data
        except Exception as exc:
            logger.error(f"[_serialize] Error serializing document: {exc}, doc keys: {list(doc.keys()) if isinstance(doc, dict) else 'not a dict'}")
            # Return minimal valid structure
            doc_id = doc.get("_id") if isinstance(doc, dict) else None
            return {
                "id": str(doc_id) if doc_id else str(uuid.uuid4()),
                "name": "Customer",
                "text": "",
                "reference": None,
                "user_id": None,
                "rating": None,
                "title": None,
                "date": None,
                "created_at": None
            }

    @staticmethod
    async def list_feedbacks(limit: int = 100, search: Optional[str] = None, month: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch all customer reviews/feedbacks - same approach as customer platform "Your Opinions" page,
        but fetches ALL reviews from ALL users (no user_id filter).
        """
        db = get_database()
        reviews = db[FeedbackService.REVIEWS_COLLECTION]

        logger.info(f"[list_feedbacks] Fetching ALL reviews - limit: {limit}, search: {search}, month: {month}")

        try:
            # Simple approach - same as customer platform but without user_id filter
            # Use projection to fetch only necessary fields for faster queries
            projection = {
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
                "_id": 1
            }
            
            # Build query - start with empty (all reviews)
            query: Dict[str, Any] = {}
            
            # Add search filter if provided
            if search and search.strip():
                search_regex = {"$regex": search.strip(), "$options": "i"}
                query["$or"] = [
                    {"author.name": search_regex},
                    {"author.email": search_regex},
                    {"product_title": search_regex},
                    {"booking_id": search_regex},
                    {"content": search_regex},
                    {"title": search_regex},
                ]
            
            # Fetch without sort first (faster) - we'll sort in Python
            # Add month filter if provided
            if month and month != "All":
                match_stage = FeedbackService._month_match(month)
                if match_stage:
                    if match_stage.get("$expr"):
                        # Need aggregation for month filter with $expr
                        pipeline = [{"$match": match_stage}]
                        if query:
                            pipeline.append({"$match": query})
                        pipeline.append({"$project": projection})
                        pipeline.append({"$limit": limit * 2})  # Fetch more, sort in Python
                        logger.debug(f"[list_feedbacks] Using aggregation for month filter (no sort)")
                        cursor = reviews.aggregate(pipeline, maxTimeMS=8000)
                        raw_docs = await asyncio.wait_for(cursor.to_list(length=limit * 2), timeout=7.0)
                    else:
                        # Simple month filter - can use find
                        query.update(match_stage)
                        cursor = reviews.find(query, projection).limit(limit * 2)  # No sort - faster
                        raw_docs = await asyncio.wait_for(cursor.to_list(length=limit * 2), timeout=7.0)
                else:
                    # No valid month filter, just use query
                    cursor = reviews.find(query, projection).limit(limit * 2)  # No sort - faster
                    raw_docs = await asyncio.wait_for(cursor.to_list(length=limit * 2), timeout=7.0)
            else:
                # No month filter - simple find query (fastest, no sort)
                cursor = reviews.find(query, projection).limit(limit * 2)  # Fetch more, sort in Python
                raw_docs = await asyncio.wait_for(cursor.to_list(length=limit * 2), timeout=7.0)
            
            # Sort in Python (much faster than MongoDB sort without index)
            if raw_docs:
                raw_docs.sort(
                    key=lambda x: (
                        x.get("created_at") if isinstance(x.get("created_at"), datetime) 
                        else datetime.fromisoformat(str(x.get("created_at")).replace('Z', '+00:00')) 
                        if x.get("created_at") 
                        else datetime.min
                    ),
                    reverse=True
                )
                # Limit after sorting
                raw_docs = raw_docs[:limit]
            
            logger.info(f"[list_feedbacks] Fetched {len(raw_docs)} raw documents")
            
            # Serialize documents - same as customer platform
            docs = []
            for doc in raw_docs:
                if doc and isinstance(doc, dict):
                    try:
                        serialized = FeedbackService._serialize(doc)
                        if serialized and serialized.get("id"):
                            docs.append(serialized)
                    except Exception as doc_exc:
                        logger.warning(f"[list_feedbacks] Error serializing document {doc.get('_id', 'unknown')}: {doc_exc}")
                        continue
            
            logger.info(f"[list_feedbacks] Returning {len(docs)} serialized feedbacks")
            return docs
                
        except asyncio.TimeoutError:
            logger.warning("[list_feedbacks] Query timeout - returning empty list")
            return []
        except (NetworkTimeout, AutoReconnect, ServerSelectionTimeoutError) as exc:
            logger.error(f"[list_feedbacks] Database timeout/connection error: {exc}")
            return []
        except Exception as exc:
            logger.error(f"[list_feedbacks] Error fetching feedbacks: {exc}", exc_info=True)
            return []

    @staticmethod
    async def get_stats(month: Optional[str] = None) -> Dict[str, Any]:
        """
        Get feedback statistics - same approach as customer platform but for ALL reviews.
        """
        db = get_database()
        reviews = db[FeedbackService.REVIEWS_COLLECTION]
        messages = db["messages"]

        try:
            # Build match query for month filter
            match_query: Dict[str, Any] = {}
            if month and month != "All":
                match_stage = FeedbackService._month_match(month)
                if match_stage and not match_stage.get("$expr"):
                    match_query.update(match_stage)

            # Total reviews - simple count
            try:
                total_reviews = await asyncio.wait_for(
                    reviews.count_documents(match_query),
                    timeout=5.0
                )
            except asyncio.TimeoutError:
                logger.warning("[get_stats] Count query timed out")
                total_reviews = 0

            # Average rating - simple aggregation
            avg_rating = 0.0
            try:
                rating_query = {**match_query, "rating": {"$exists": True, "$ne": None}}
                pipeline = [
                    {"$match": rating_query},
                    {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}},
                ]
                agg_cursor = reviews.aggregate(pipeline, maxTimeMS=5000)
                agg = await asyncio.wait_for(agg_cursor.to_list(length=1), timeout=4.0)
                if agg and agg[0].get("avg_rating") is not None:
                    avg_rating = float(agg[0]["avg_rating"])
            except (asyncio.TimeoutError, Exception) as e:
                logger.warning(f"[get_stats] Average rating calculation failed: {e}")
                avg_rating = 0.0

            # Pending replies: unread messages sent to admin
            pending_replies = 0
            try:
                pending_replies = await asyncio.wait_for(
                    messages.count_documents({
                        "recipient_id": "admin",
                        "is_read": False
                    }),
                    timeout=3.0
                )
            except (asyncio.TimeoutError, Exception) as e:
                logger.warning(f"[get_stats] Pending replies calculation failed: {e}")
                pending_replies = 0

            return {
                "total_reviews": total_reviews,
                "avg_rating": round(avg_rating, 2),
                "pending_replies": pending_replies,
            }
        except Exception as exc:
            logger.error(f"[get_stats] Error calculating stats: {exc}", exc_info=True)
            return {
                "total_reviews": 0,
                "avg_rating": 0.0,
                "pending_replies": 0,
            }

    @staticmethod
    async def delete_feedback(review_id: str) -> bool:
        """
        Delete a review/feedback by ID.
        Returns True if deleted, False if not found.
        Optimized: Direct delete without existence check for speed.
        """
        db = get_database()
        reviews = db[FeedbackService.REVIEWS_COLLECTION]

        try:
            logger.info(f"[delete_feedback] Attempting to delete review_id: {review_id} (type: {type(review_id)})")
            
            # Convert string ID to ObjectId
            oid = None
            try:
                oid = ObjectId(review_id)
                logger.debug(f"[delete_feedback] Converted to ObjectId: {oid}")
            except Exception as e:
                logger.warning(f"[delete_feedback] Invalid review_id format: {review_id}, error: {e}")
                # Try to find by string ID as fallback
                logger.info(f"[delete_feedback] Trying to find review by string _id field...")
                result = await asyncio.wait_for(
                    reviews.delete_one({"_id": review_id}),
                    timeout=5.0
                )
                if result.deleted_count == 1:
                    logger.info(f"[delete_feedback] Successfully deleted review by string ID: {review_id}")
                    return True
                return False

            # Delete directly (no existence check needed - faster)
            # Add timeout to prevent hanging
            try:
                result = await asyncio.wait_for(
                    reviews.delete_one({"_id": oid}),
                    timeout=5.0  # 5 second timeout
                )
                logger.info(f"[delete_feedback] Delete result: deleted_count={result.deleted_count}")
                if result.deleted_count == 1:
                    logger.info(f"[delete_feedback] Successfully deleted review: {review_id}")
                    return True
                else:
                    # Review not found - try to check if it exists with different ID format
                    logger.warning(f"[delete_feedback] Review not found with ObjectId: {oid}")
                    # Try string ID as fallback
                    try:
                        result2 = await asyncio.wait_for(
                            reviews.delete_one({"_id": review_id}),
                            timeout=2.0
                        )
                        if result2.deleted_count == 1:
                            logger.info(f"[delete_feedback] Successfully deleted review by string ID fallback: {review_id}")
                            return True
                    except Exception:
                        pass
                    logger.warning(f"[delete_feedback] Review not found or already deleted: {review_id}")
                    return False
            except asyncio.TimeoutError:
                logger.error(f"[delete_feedback] Delete operation timed out for: {review_id}")
                raise HTTPException(status_code=500, detail="Delete operation timed out")

        except HTTPException:
            raise
        except (NetworkTimeout, AutoReconnect, ServerSelectionTimeoutError) as exc:
            logger.error(f"[delete_feedback] Database timeout/connection error: {exc}")
            raise HTTPException(status_code=500, detail="Database connection error")
        except Exception as exc:
            logger.error(f"[delete_feedback] Error deleting feedback: {exc}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Unable to delete feedback: {str(exc)}")

