from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional

from beanie import PydanticObjectId

from app.core.database import get_database
from app.models.product import Product, ProductStatus


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
    async def _fetch_products(supplier_id: str) -> List[Product]:
        return await Product.find(Product.supplier_id == supplier_id).to_list()

    @staticmethod
    async def _fetch_bookings(product_ids: Iterable[str]) -> List[Dict[str, Any]]:
        product_ids = list(product_ids)
        if not product_ids:
            return []

        db = get_database()
        cursor = db["customer_bookings"].find({"product_id": {"$in": product_ids}})
        bookings = await cursor.to_list(length=None)
        return bookings

    @staticmethod
    def _serialize_booking(document: Dict[str, Any], product_lookup: Dict[str, Product]) -> Dict[str, Any]:
        booking_id = SupplierDashboardService._ensure_object_id(document.get("_id") or document.get("id"))
        product_id = str(document.get("product_id") or "")
        product = product_lookup.get(product_id)

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
            "product_title": document.get("title") or document.get("tour_name") or (product.title if product else ""),
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
            start = SupplierDashboardService._parse_datetime(booking.get("start_date"))
            if not start:
                continue

            if start.date() == today and status in ACTIVE_BOOKING_STATUSES:
                today_count += 1
                todays_balance += SupplierDashboardService._parse_float(booking.get("net_amount"))
            if start.date() == tomorrow and status in ACTIVE_BOOKING_STATUSES:
                tomorrow_count += 1

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
    def _derive_activity_metrics(products: List[Product]) -> Dict[str, Any]:
        total = max(len(products), 1)
        published = sum(1 for product in products if product.status == ProductStatus.PUBLISHED)
        drafts = sum(1 for product in products if product.status == ProductStatus.DRAFT)
        under_review = sum(1 for product in products if product.status == ProductStatus.PENDING_REVIEW)

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
    def _derive_product_metrics(products: List[Product], bookings: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_products = len(products)
        published = sum(1 for product in products if product.status == ProductStatus.PUBLISHED)
        drafts = sum(1 for product in products if product.status == ProductStatus.DRAFT)
        under_review = sum(1 for product in products if product.status == ProductStatus.PENDING_REVIEW)

        cancellations = sum(
            1 for booking in bookings if (booking.get("status") or "").lower() in CANCELLED_BOOKING_STATUSES
        )
        cancellation_rate = round((cancellations / len(bookings)) * 100, 2) if bookings else 0.0

        ratings = [product.rating for product in products if product.rating is not None]
        average_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0.0

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
        products = await SupplierDashboardService._fetch_products(supplier_id)
        product_map = {str(product.id): product for product in products}
        bookings_raw = await SupplierDashboardService._fetch_bookings(product_map.keys())
        bookings = [
            SupplierDashboardService._serialize_booking(booking, product_map)
            for booking in bookings_raw
        ]

        bookings_metrics = SupplierDashboardService._derive_bookings_metrics(bookings)
        finance_metrics = SupplierDashboardService._derive_finance_metrics(bookings)
        activity_metrics = SupplierDashboardService._derive_activity_metrics(products)
        product_metrics = SupplierDashboardService._derive_product_metrics(products, bookings)
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

