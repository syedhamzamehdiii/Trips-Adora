from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional
import asyncio

from beanie import PydanticObjectId
from bson import ObjectId

from app.core.database import get_database
from app.models.product import ProductStatus
from app.models.user import User


ACTIVE_BOOKING_STATUSES = {"pending", "customized", "confirmed", "completed"}
CANCELLED_BOOKING_STATUSES = {"cancelled", "canceled", "refund", "refund/dispute"}


class SupplierDashboardService:
    """Aggregate supplier metrics across products, bookings and payouts."""

    @staticmethod
    def _ensure_object_id(value: Any) -> str:
        try:
            if isinstance(value, PydanticObjectId):
                return str(value)
            return str(PydanticObjectId(value))
        except Exception:
            return str(value)

    @staticmethod
    def _parse_datetime(value: Any) -> Optional[datetime]:
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%d"):
                try:
                    return datetime.fromisoformat(value.replace("Z", "+00:00"))
                except ValueError:
                    continue
        return None

    @staticmethod
    def _parse_float(value: Any) -> float:
        try:
            return float(value or 0.0)
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    async def _fetch_products(supplier_id: str) -> List[Dict[str, Any]]:
        """Fetch lightweight product summaries for a supplier with timeout handling"""
        try:
            db = get_database()
            projection = {
                "_id": 1,
                "title": 1,
                "status": 1,
                "rating": 1,
                "reviews_count": 1,
                "price": 1,
                "currency": 1,
                "published_at": 1,
                "created_at": 1,
                "updated_at": 1,
            }
            cursor = db["products"].find({"supplier_id": supplier_id}, projection).limit(500)

            # Add timeout to prevent hanging (30 seconds)
            docs = await asyncio.wait_for(cursor.to_list(length=None), timeout=30.0)
            normalized = []
            for doc in docs:
                normalized.append({
                    "id": str(doc.get("_id")),
                    "title": doc.get("title"),
                    "status": doc.get("status"),
                    "rating": doc.get("rating"),
                    "price": doc.get("price"),
                    "currency": doc.get("currency"),
                    "reviews_count": doc.get("reviews_count"),
                    "created_at": doc.get("created_at"),
                    "updated_at": doc.get("updated_at"),
                    "published_at": doc.get("published_at"),
                })
            return normalized
        except asyncio.TimeoutError:
            # Return empty list if query times out
            print(f"⚠️ MongoDB query timeout for supplier {supplier_id} - returning empty list")
            return []
        except Exception as e:
            # Log other errors and return empty list
            print(f"⚠️ Error fetching products for supplier {supplier_id}: {e}")
            return []

    @staticmethod
    async def _fetch_bookings(product_ids: Iterable[str], supplier_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch bookings with timeout handling"""
        try:
            product_ids = list(product_ids)
            db = get_database()
            
            # Optimize: If supplier_id is provided, query by supplier_id directly (faster)
            if supplier_id:
                query = {"supplier_id": supplier_id}
                # Use projection to fetch only needed fields for better performance
                cursor = db["customer_bookings"].find(query, {
                    "product_id": 1,
                    "status": 1,
                    "start_date": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "total_amount": 1,
                    "amount": 1,
                    "price": 1,
                    "currency": 1,
                    "payout_status": 1,
                    "customer_name": 1,
                    "customer_email": 1,
                    "reference_code": 1,
                    "title": 1,
                    "tour_name": 1,
                    "travel_date": 1,
                    "tour_date": 1,
                    "net_amount": 1,
                    "supplier_id": 1,
                }).limit(500)  # Limit to prevent huge queries
            elif product_ids:
                query = {"product_id": {"$in": product_ids}}
                cursor = db["customer_bookings"].find(query).limit(500)
            else:
                return []
            
            # Add timeout to prevent hanging (30 seconds)
            bookings = await asyncio.wait_for(
                cursor.to_list(length=None),
                timeout=30.0
            )
            return bookings
        except asyncio.TimeoutError:
            print(f"⚠️ MongoDB bookings query timeout - returning empty list")
            return []
        except Exception as e:
            print(f"⚠️ Error fetching bookings: {e}")
            return []

    @staticmethod
    def _serialize_booking(document: Dict[str, Any], product_lookup: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        booking_id = SupplierDashboardService._ensure_object_id(document.get("_id") or document.get("id"))
        product_id = str(document.get("product_id") or "")
        product = product_lookup.get(product_id, {})

        start_date = SupplierDashboardService._parse_datetime(
            document.get("start_date") or document.get("travel_date") or document.get("tour_date")
        )
        created_at = SupplierDashboardService._parse_datetime(document.get("created_at"))
        updated_at = SupplierDashboardService._parse_datetime(document.get("updated_at"))

        total_amount = SupplierDashboardService._parse_float(
            document.get("total_amount") or document.get("amount") or document.get("price")
        )

        payout_status = (document.get("payout_status") or "").strip().lower()
        status = (document.get("status") or "").strip().lower()

        return {
            "id": booking_id,
            "product_id": product_id,
            "product_title": document.get("title") or document.get("tour_name") or product.get("title", ""),
            "status": status or "pending",
            "status_label": status.title() if status else "Pending",
            "start_date": start_date.isoformat() if start_date else None,
            "created_at": created_at.isoformat() if created_at else None,
            "updated_at": updated_at.isoformat() if updated_at else None,
            "amount": total_amount,
            "currency": document.get("currency") or "USD",
            "net_amount": round(total_amount * 0.8, 2),
            "customer_name": document.get("customer_name"),
            "customer_email": document.get("customer_email"),
            "payout_status": payout_status or "pending",
            "reference_code": document.get("reference_code") or booking_id,
            "referenceCode": document.get("reference_code") or booking_id,
            "booked_on": created_at.isoformat() if created_at else None,
            "bookedOn": created_at.isoformat() if created_at else None,
            "travel_date": start_date.isoformat() if start_date else None,
            "travelDate": start_date.isoformat() if start_date else None,
        }

    @staticmethod
    def _derive_bookings_metrics(bookings: List[Dict[str, Any]]) -> Dict[str, Any]:
        today = datetime.utcnow().date()
        tomorrow = today + timedelta(days=1)

        total = len(bookings)
        today_count = 0
        tomorrow_count = 0
        todays_balance = 0.0

        for booking in bookings:
            status = (booking.get("status") or "").lower()

            # Travel date: used for today's/tomorrow's active bookings
            travel_dt = SupplierDashboardService._parse_datetime(
                booking.get("start_date") or booking.get("travel_date") or booking.get("tour_date")
            )

            # Created/booking date: used for today's earnings (bookings made today)
            created_dt = SupplierDashboardService._parse_datetime(booking.get("created_at"))

            if travel_dt:
                if travel_dt.date() == today and status in ACTIVE_BOOKING_STATUSES:
                    today_count += 1
                if travel_dt.date() == tomorrow and status in ACTIVE_BOOKING_STATUSES:
                    tomorrow_count += 1

            # Today's balance: net amount from bookings created today (not cancelled)
            if created_dt and created_dt.date() == today and status in ACTIVE_BOOKING_STATUSES:
                todays_balance += SupplierDashboardService._parse_float(booking.get("net_amount"))

        return {
            "total": total,
            "today": today_count,
            "tomorrow": tomorrow_count,
            "todays_balance": round(todays_balance, 2),
        }

    @staticmethod
    def _derive_finance_metrics(bookings: List[Dict[str, Any]]) -> Dict[str, Any]:
        today = datetime.utcnow()
        current_month_key = (today.year, today.month)

        total_earning = 0.0
        pending_payout = 0.0
        loss_from_cancellation = 0.0
        paid_this_month = 0.0

        for booking in bookings:
            status = (booking.get("status") or "").lower()
            payout_status = (booking.get("payout_status") or "").lower()
            net_amount = SupplierDashboardService._parse_float(booking.get("net_amount"))
            created_at = SupplierDashboardService._parse_datetime(booking.get("created_at"))

            if status in CANCELLED_BOOKING_STATUSES:
                loss_from_cancellation += net_amount
                continue

            total_earning += net_amount

            if payout_status == "paid":
                if created_at and (created_at.year, created_at.month) == current_month_key:
                    paid_this_month += net_amount
            elif status in ACTIVE_BOOKING_STATUSES:
                pending_payout += net_amount

        return {
            "total_earning": round(total_earning, 2),
            "pending_payout": round(pending_payout, 2),
            "loss_from_cancellation": round(loss_from_cancellation, 2),
            "paid_this_month": round(paid_this_month, 2),
        }

    @staticmethod
    def _derive_activity_metrics(products: List[Dict[str, Any]]) -> Dict[str, Any]:
        total = max(len(products), 1)
        def get_status(product):
            status = product.get("status") if isinstance(product, dict) else getattr(product, "status", None)
            return ProductStatus(status) if status and not isinstance(status, ProductStatus) else status

        published = sum(1 for product in products if get_status(product) == ProductStatus.PUBLISHED)
        drafts = sum(1 for product in products if get_status(product) == ProductStatus.DRAFT)
        under_review = sum(1 for product in products if get_status(product) == ProductStatus.PENDING_REVIEW)

        return {
            "counts": {
                "published": published,
                "draft": drafts,
                "under_review": under_review,
                "total": len(products),
            },
            "percentages": {
                "published": round((published / total) * 100, 2) if products else 0.0,
                "draft": round((drafts / total) * 100, 2) if products else 0.0,
                "under_review": round((under_review / total) * 100, 2) if products else 0.0,
            },
        }

    @staticmethod
    async def _derive_product_metrics(products: List[Dict[str, Any]], bookings: List[Dict[str, Any]], supplier_id: str) -> Dict[str, Any]:
        total_products = len(products)
        def get_status(product):
            status = product.get("status") if isinstance(product, dict) else getattr(product, "status", None)
            return ProductStatus(status) if status and not isinstance(status, ProductStatus) else status

        published = sum(1 for product in products if get_status(product) == ProductStatus.PUBLISHED)
        drafts = sum(1 for product in products if get_status(product) == ProductStatus.DRAFT)
        under_review = sum(1 for product in products if get_status(product) == ProductStatus.PENDING_REVIEW)

        cancellations = sum(
            1 for booking in bookings if (booking.get("status") or "").lower() in CANCELLED_BOOKING_STATUSES
        )
        cancellation_rate = round((cancellations / len(bookings)) * 100, 2) if bookings else 0.0

        # Calculate average rating from actual customer reviews (not just product.rating field)
        average_rating = 0.0
        try:
            # Get product IDs for this supplier (handle both ObjectId and string formats)
            product_ids = []
            for product in products:
                product_id = product.get("_id") or product.get("id")
                if product_id:
                    # Convert to string, handling both ObjectId and string
                    if isinstance(product_id, PydanticObjectId):
                        product_ids.append(str(product_id))
                    else:
                        product_ids.append(str(product_id))
            
            if product_ids:
                db = get_database()
                reviews_coll = db.get_collection("customer_reviews")
                pipeline = [
                    {"$match": {"product_id": {"$in": product_ids}}},
                    {
                        "$group": {
                            "_id": None,
                            "avg_rating": {"$avg": "$rating"},
                            "count": {"$sum": 1},
                        }
                    },
                ]
                review_docs = await reviews_coll.aggregate(pipeline).to_list(length=1)
                if review_docs and len(review_docs) > 0:
                    doc = review_docs[0]
                    avg = doc.get("avg_rating")
                    if avg is not None:
                        average_rating = round(float(avg), 1)
        except Exception as e:
            print(f"⚠️ Error calculating average rating from reviews: {e}")
            # Fallback to product.rating field if review aggregation fails
            def get_rating(product):
                return product.get("rating") if isinstance(product, dict) else getattr(product, "rating", None)
            ratings = [get_rating(product) for product in products if get_rating(product) is not None]
            if ratings:
                average_rating = round(sum(ratings) / len(ratings), 1)

        return {
            "total": total_products,
            "published": published,
            "draft": drafts,
            "under_review": under_review,
            "average_rating": average_rating,
            "cancellation_rate": cancellation_rate,
        }

    @staticmethod
    def _derive_account_stability(bookings: List[Dict[str, Any]]) -> Dict[str, float]:
        total = len(bookings)
        if total == 0:
            return {"positive": 100.0, "cancellation": 0.0, "negative": 0.0}

        cancellations = sum(
            1 for booking in bookings if (booking.get("status") or "").lower() in CANCELLED_BOOKING_STATUSES
        )
        cancellation_rate = min(100.0, round((cancellations / total) * 100, 2))
        positive = max(0.0, 100.0 - cancellation_rate)
        negative = max(0.0, min(100.0 - positive - cancellation_rate, 20.0))

        return {
            "positive": round(positive, 2),
            "cancellation": cancellation_rate,
            "negative": round(negative, 2),
        }

    @staticmethod
    async def get_overview(supplier_id: str) -> Dict[str, Any]:
        # Fetch products first (needed for product_map)
        products = await SupplierDashboardService._fetch_products(supplier_id)
        product_map = {str(product.get("id")): product for product in products}
        
        # Fetch bookings by supplier_id directly (much faster than product_ids)
        bookings_raw = await SupplierDashboardService._fetch_bookings(product_map.keys(), supplier_id=supplier_id)
        
        # Get customer emails from User collection (authenticated emails)
        user_ids = []
        for b in bookings_raw:
            user_id = b.get("user_id")
            if user_id:
                try:
                    # Convert to ObjectId if it's a string
                    if isinstance(user_id, str):
                        user_ids.append(ObjectId(user_id))
                    else:
                        user_ids.append(user_id)
                except Exception:
                    pass  # Skip invalid user_ids
        
        customer_emails_map = {}
        if user_ids:
            try:
                users = await User.find({"_id": {"$in": user_ids}}).to_list()
                for user in users:
                    user_id_str = str(user.id)
                    # Use authenticated email from User collection
                    customer_emails_map[user_id_str] = user.email
            except Exception as user_err:
                print(f"⚠️ Error fetching customer emails: {user_err}")
        
        # Serialize bookings and update customer_email with authenticated email
        bookings = []
        for booking in bookings_raw:
            serialized = SupplierDashboardService._serialize_booking(booking, product_map)
            # Override customer_email with authenticated email if available
            user_id = str(booking.get("user_id", ""))
            if user_id in customer_emails_map:
                serialized["customer_email"] = customer_emails_map[user_id]
            bookings.append(serialized)

        # Calculate all metrics (these are fast synchronous operations)
        bookings_metrics = SupplierDashboardService._derive_bookings_metrics(bookings)
        finance_metrics = SupplierDashboardService._derive_finance_metrics(bookings)
        activity_metrics = SupplierDashboardService._derive_activity_metrics(products)
        product_metrics = await SupplierDashboardService._derive_product_metrics(products, bookings, supplier_id)
        stability_metrics = SupplierDashboardService._derive_account_stability(bookings)

        available_balance = finance_metrics["pending_payout"]
        todays_balance = bookings_metrics["todays_balance"]

        return {
            "metrics": {
                "available_balance": available_balance,
                "todays_balance": todays_balance,
                "todays_bookings": bookings_metrics["today"],
                "tomorrows_bookings": bookings_metrics["tomorrow"],
            },
            "bookings": {
                "total": bookings_metrics["total"],
                "today": bookings_metrics["today"],
                "tomorrow": bookings_metrics["tomorrow"],
                "items": bookings,
            },
            "finance": finance_metrics,
            "products": product_metrics,
            "activity": activity_metrics,
            "account_stability": stability_metrics,
        }

