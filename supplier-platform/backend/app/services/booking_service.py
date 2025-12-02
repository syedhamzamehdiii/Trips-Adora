from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.core.database import get_database
from app.models.user import User
import logging

logger = logging.getLogger(__name__)


class SupplierBookingService:
    """Service for managing supplier bookings from customer_bookings collection."""
    
    COLLECTION = "customer_bookings"
    
    @staticmethod
    def _collection():
        db = get_database()
        return db[SupplierBookingService.COLLECTION]
    
    @staticmethod
    def _serialize_booking(doc: Dict[str, Any]) -> Dict[str, Any]:
        """Convert MongoDB document to API response format."""
        if not doc:
            return {}
        
        result = dict(doc)
        result["id"] = str(result.pop("_id"))
        
        # Normalize date fields
        for date_field in ["created_at", "updated_at", "start_date", "end_date", "cancelled_at"]:
            if date_field in result and isinstance(result[date_field], datetime):
                result[date_field] = result[date_field].isoformat()
        
        # Ensure status is normalized (cancelled should be lowercase)
        if "status" in result:
            status = str(result["status"]).lower()
            if status in ["canceled", "cancel"]:
                result["status"] = "cancelled"
            else:
                result["status"] = status
        
        return result
    
    @staticmethod
    async def get_bookings_for_supplier(
        supplier_id: str,
        status: Optional[str] = None,
        limit: int = 100,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get all bookings for a specific supplier.
        
        Args:
            supplier_id: The supplier's user ID or supplier_code
            status: Optional status filter (pending, confirmed, cancelled, etc.)
            limit: Maximum number of bookings to return
            skip: Number of bookings to skip (for pagination)
        """
        try:
            collection = SupplierBookingService._collection()
            
            # Build query - match by supplier_id
            # Don't filter out deleted_by_customer - suppliers should see all bookings
            query = {"supplier_id": supplier_id}
            
            # Add status filter if provided
            if status and status.lower() != "all":
                # Normalize status filter - handle both "cancelled" and "canceled"
                normalized_status = status.lower()
                if normalized_status in ["cancelled", "canceled"]:
                    # Query for both variations to be safe
                    query["$or"] = [
                        {"status": "cancelled"},
                        {"status": "canceled"}
                    ]
                else:
                    query["status"] = normalized_status
            
            # Fetch bookings
            cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
            bookings = await cursor.to_list(length=limit)

            # Attach review aggregates per product from customer_reviews (shared DB)
            try:
                product_ids = list({
                    b.get("product_id")
                    for b in bookings
                    if b.get("product_id")
                })

                rating_by_product: Dict[str, Dict[str, Any]] = {}
                if product_ids:
                    db = get_database()
                    reviews_coll = db.get_collection("customer_reviews")
                    pipeline = [
                        {"$match": {"product_id": {"$in": product_ids}}},
                        {
                            "$group": {
                                "_id": "$product_id",
                                "avg_rating": {"$avg": "$rating"},
                                "count": {"$sum": 1},
                            }
                        },
                    ]
                    review_docs = await reviews_coll.aggregate(pipeline).to_list(length=None)
                    for doc in review_docs:
                        pid = str(doc.get("_id"))
                        rating_by_product[pid] = {
                            "avg_rating": float(doc.get("avg_rating") or 0.0),
                            "count": int(doc.get("count") or 0),
                        }

                # Merge rating info into each booking's metadata so frontend can use it
                for b in bookings:
                    pid = b.get("product_id")
                    if not pid:
                        continue
                    stats = rating_by_product.get(pid)
                    if not stats:
                        continue
                    metadata = b.get("metadata") or {}
                    metadata["avg_rating"] = stats["avg_rating"]
                    metadata["review_count"] = stats["count"]
                    b["metadata"] = metadata
            except Exception as agg_err:
                logger.error(f"Error aggregating review data for supplier {supplier_id}: {agg_err}")
            
            # Get customer email and country from users collection (authenticated profiles)
            user_ids: List[ObjectId] = []
            for b in bookings:
                raw_user_id = b.get("user_id")
                if not raw_user_id:
                    continue
                try:
                    user_ids.append(
                        raw_user_id
                        if isinstance(raw_user_id, ObjectId)
                        else ObjectId(str(raw_user_id))
                    )
                except Exception:
                    # Skip invalid IDs
                    continue
            
            customer_info_map: Dict[str, Dict[str, Any]] = {}
            if user_ids:
                try:
                    db = get_database()
                    user_docs = await db["users"].find(
                        {"_id": {"$in": user_ids}},
                        {"email": 1, "country": 1, "address": 1},
                    ).to_list(length=None)
                    for doc in user_docs:
                        uid = str(doc.get("_id"))
                        email = doc.get("email")
                        # Prefer explicit country, fall back to address/location if set
                        country = doc.get("country") or doc.get("address")
                        customer_info_map[uid] = {
                            "email": email,
                            "country": country,
                        }
                except Exception as user_err:
                    logger.warning(f"Error fetching customer profile info: {user_err}")
            
            # Serialize bookings and update customer_email / customer_country
            serialized = []
            for booking in bookings:
                serialized_booking = SupplierBookingService._serialize_booking(booking)
                user_id = booking.get("user_id")
                user_key = str(user_id) if user_id is not None else ""
                if user_key in customer_info_map:
                    info = customer_info_map[user_key]
                    if info.get("email"):
                        serialized_booking["customer_email"] = info["email"]
                    if info.get("country"):
                        serialized_booking["customer_country"] = info["country"]
                serialized.append(serialized_booking)
            
            return serialized
        
        except Exception as e:
            logger.error(f"Error fetching bookings for supplier {supplier_id}: {e}")
            return []
    
    @staticmethod
    async def get_booking_by_id(booking_id: str, supplier_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific booking by ID, ensuring it belongs to the supplier."""
        try:
            collection = SupplierBookingService._collection()
            
            try:
                oid = ObjectId(booking_id)
            except Exception:
                return None
            
            booking = await collection.find_one({
                "_id": oid,
                "supplier_id": supplier_id
            })
            
            if booking:
                serialized = SupplierBookingService._serialize_booking(booking)
                # Get customer's authenticated email and country from User collection
                user_id = booking.get("user_id")
                if user_id:
                    try:
                        user = await User.find_one({"_id": ObjectId(str(user_id))})
                        if user:
                            if getattr(user, "email", None):
                                serialized["customer_email"] = user.email
                            if getattr(user, "country", None):
                                serialized["customer_country"] = user.country
                    except Exception as user_err:
                        logger.warning(f"Error fetching customer details for user {user_id}: {user_err}")
                return serialized
            return None
        
        except Exception as e:
            logger.error(f"Error fetching booking {booking_id} for supplier {supplier_id}: {e}")
            return None
    
    @staticmethod
    async def cancel_booking(booking_id: str, supplier_id: str, reason: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Cancel a booking. Only the supplier who owns the booking can cancel it."""
        try:
            collection = SupplierBookingService._collection()
            
            try:
                oid = ObjectId(booking_id)
            except Exception:
                return None
            
            # Find the booking and verify it belongs to the supplier
            booking = await collection.find_one({
                "_id": oid,
                "supplier_id": supplier_id
            })
            
            if not booking:
                return None
            
            # Check if already cancelled
            current_status = str(booking.get("status", "")).lower()
            if current_status in ["cancelled", "canceled"]:
                return SupplierBookingService._serialize_booking(booking)
            
            # Update booking status to cancelled
            update_data = {
                "status": "cancelled",
                "cancelled_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Store cancellation reason in metadata if provided
            if reason:
                metadata = booking.get("metadata", {})
                metadata["cancellation_reason"] = reason
                metadata["cancelled_by"] = "supplier"
                update_data["metadata"] = metadata
            
            result = await collection.update_one(
                {"_id": oid, "supplier_id": supplier_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                # Fetch and return updated booking
                updated_booking = await collection.find_one({"_id": oid})
                return SupplierBookingService._serialize_booking(updated_booking)
            
            return None
        
        except Exception as e:
            logger.error(f"Error cancelling booking {booking_id} for supplier {supplier_id}: {e}")
            return None
    
    @staticmethod
    async def get_booking_stats(supplier_id: str) -> Dict[str, Any]:
        """Get booking statistics for a supplier, including cancelled bookings."""
        try:
            collection = SupplierBookingService._collection()
            
            # Total bookings
            total = await collection.count_documents({"supplier_id": supplier_id})
            
            # Bookings by status
            status_counts = {}
            statuses = ["pending", "confirmed", "customized", "completed", "cancelled"]
            for status in statuses:
                # For cancelled, also check for "canceled" variation
                if status == "cancelled":
                    count = await collection.count_documents({
                        "supplier_id": supplier_id,
                        "$or": [
                            {"status": "cancelled"},
                            {"status": "canceled"}
                        ]
                    })
                else:
                    count = await collection.count_documents({
                        "supplier_id": supplier_id,
                        "status": status
                    })
                status_counts[status] = count
            
            # Total revenue (exclude cancelled bookings)
            pipeline = [
                {
                    "$match": {
                        "supplier_id": supplier_id,
                        "status": {"$nin": ["cancelled", "canceled"]}
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "total_revenue": {"$sum": "$total_amount"}
                    }
                }
            ]
            revenue_result = await collection.aggregate(pipeline).to_list(length=1)
            total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0.0
            
            return {
                "total": total,
                "by_status": status_counts,
                "total_revenue": total_revenue
            }
        
        except Exception as e:
            logger.error(f"Error fetching booking stats for supplier {supplier_id}: {e}")
            return {
                "total": 0,
                "by_status": {},
                "total_revenue": 0.0
            }

