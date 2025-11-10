from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId

from app.core.database import get_database
from app.core.exceptions import DatabaseUnavailableError
from app.schemas.booking import BookingCreateRequest
from app.services.activity_service import ActivityService
from app.services.wallet_service import WalletService
from pymongo.errors import AutoReconnect, ServerSelectionTimeoutError


ACTIVE_STATUSES = {"pending", "customized", "confirmed"}
UPCOMING_STATUSES = {"pending", "customized", "confirmed"}


class BookingService:
    COLLECTION = "customer_bookings"

    @staticmethod
    def _collection():
        db = get_database()
        return db[BookingService.COLLECTION]

    @staticmethod
    def _coerce_datetime(value: Any) -> Optional[datetime]:
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value)
            except ValueError:
                return None
        return None

    @staticmethod
    def _serialize_booking(booking: Dict[str, Any]) -> Dict[str, Any]:
        if not booking:
            return {}

        booking_copy = dict(booking)
        metadata = booking_copy.get("metadata") or {}
        raw_id = booking_copy.pop("_id", None)
        booking_id = ""
        if isinstance(raw_id, ObjectId):
            booking_id = str(raw_id)
        elif isinstance(raw_id, str):
            booking_id = raw_id
        elif booking_copy.get("id"):
            booking_id = str(booking_copy["id"])

        start_date = BookingService._coerce_datetime(booking_copy.get("start_date"))
        end_date = BookingService._coerce_datetime(booking_copy.get("end_date"))
        created_at = BookingService._coerce_datetime(booking_copy.get("created_at"))
        updated_at = BookingService._coerce_datetime(booking_copy.get("updated_at"))

        status = (booking_copy.get("status") or "").lower()
        tour_name = (
            booking_copy.get("tour_name")
            or booking_copy.get("title")
            or booking_copy.get("destination")
            or booking_copy.get("location")
        )
        destination = booking_copy.get("destination") or booking_copy.get("location")
        tour_date_label = booking_copy.get("tour_date_label")
        if not tour_date_label and start_date:
            try:
                tour_date_label = start_date.strftime("%b %d, %Y")
            except Exception:
                tour_date_label = None

        return {
            "id": booking_id,
            "bookingId": booking_copy.get("reference_code") or booking_id,
            "userId": booking_copy.get("user_id"),
            "productId": booking_copy.get("product_id"),
            "tourName": tour_name,
            "title": booking_copy.get("title") or tour_name,
            "destination": destination,
            "location": booking_copy.get("location") or destination,
            "status": status or "pending",
            "statusLabel": status.title() if status else "Pending",
            "startDate": start_date.isoformat() if start_date else None,
            "endDate": end_date.isoformat() if end_date else None,
            "tourDate": tour_date_label,
            "tourDateLabel": tour_date_label,
            "totalAmount": BookingService._format_currency_value(booking_copy.get("total_amount")),
            "currency": booking_copy.get("currency") or "USD",
            "loyaltyPoints": int(booking_copy.get("loyalty_points") or 0),
            "heroImage": booking_copy.get("hero_image"),
            "image": booking_copy.get("hero_image"),
            "notes": booking_copy.get("notes"),
            "travelers": booking_copy.get("travelers") or booking_copy.get("number_of_persons"),
            "packageType": booking_copy.get("package_type"),
            "pickUpLocation": booking_copy.get("pick_up_location"),
            "dropOffLocation": booking_copy.get("drop_off_location"),
            "customerName": booking_copy.get("customer_name"),
            "customerEmail": booking_copy.get("customer_email"),
            "customerPhone": booking_copy.get("customer_phone"),
            "vehicle": booking_copy.get("vehicle"),
            "extras": booking_copy.get("extras") or [],
            "metadata": metadata,
            "createdAt": created_at.isoformat() if created_at else None,
            "updatedAt": updated_at.isoformat() if updated_at else None,
        }

    @staticmethod
    async def get_bookings_for_user(user_id: str) -> List[Dict[str, Any]]:
        try:
            cursor = BookingService._collection().find({"user_id": user_id}).sort("start_date", 1)
            bookings = await cursor.to_list(length=None)
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Bookings data is currently unavailable.") from exc
        return [BookingService._serialize_booking(booking) for booking in bookings]

    @staticmethod
    def _format_currency_value(value: Optional[float]) -> float:
        try:
            return float(value or 0.0)
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    async def get_stats_for_user(
        user_id: str,
        bookings: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        if bookings is None:
            bookings = await BookingService.get_bookings_for_user(user_id)
        total = len(bookings)
        active = sum(1 for booking in bookings if (booking.get("status") or "").lower() in ACTIVE_STATUSES)
        loyalty_points = sum(int(booking.get("loyaltyPoints") or 0) for booking in bookings)
        total_spent = sum(
            BookingService._format_currency_value(booking.get("totalAmount"))
            for booking in bookings
        )
        currency = "USD"
        for booking in bookings:
            if booking.get("currency"):
                currency = booking["currency"]
                break
        return {
            "total_bookings": total,
            "active_bookings": active,
            "loyalty_points": loyalty_points,
            "total_spent": total_spent,
            "currency": currency,
        }

    @staticmethod
    async def get_upcoming_trips(
        user_id: str,
        bookings: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        if bookings is None:
            bookings = await BookingService.get_bookings_for_user(user_id)
        upcoming: List[Dict[str, Any]] = []
        STATUS_STYLE = {
            "customized": {"label": "Customized", "color": "bg-green-100 text-green-700"},
            "pending": {"label": "Pending", "color": "bg-yellow-100 text-yellow-700"},
            "confirmed": {"label": "Confirmed", "color": "bg-blue-100 text-blue-700"},
        }

        for booking in bookings:
            status = (booking.get("status") or "").lower()
            if status not in UPCOMING_STATUSES:
                continue

            start_date = booking.get("startDate")
            if isinstance(start_date, str):
                try:
                    start_date = datetime.fromisoformat(start_date)
                except ValueError:
                    start_date = None

            style = STATUS_STYLE.get(status, {"label": status.title(), "color": "bg-gray-100 text-gray-700"})
            upcoming.append(
                {
                    "id": booking.get("id"),
                    "title": booking.get("title") or booking.get("tourName"),
                    "destination": booking.get("destination") or booking.get("location"),
                    "start_date": start_date.isoformat() if start_date else datetime.utcnow().isoformat(),
                    "display_date": start_date.strftime("%b %d, %Y") if start_date else "",
                    "status": status,
                    "status_label": style["label"],
                    "status_color": style["color"],
                    "thumbnail": booking.get("heroImage") or booking.get("image"),
                    "notes": booking.get("notes"),
                }
            )

        upcoming.sort(key=lambda trip: trip.get("start_date") or "")
        return upcoming

    @staticmethod
    async def cancel_booking(user_id: str, booking_id: str, reason: Optional[str] = None) -> bool:
        try:
            object_id = ObjectId(booking_id)
        except (InvalidId, TypeError):
            return False

        collection = BookingService._collection()
        booking = await collection.find_one({"_id": object_id, "user_id": user_id})
        if not booking:
            return False

        db = get_database()
        cancellations = db["customer_booking_cancellations"]
        snapshot = dict(booking)
        snapshot["_id"] = str(snapshot.get("_id"))

        await cancellations.insert_one(
            {
                "booking_id": str(snapshot["_id"]),
                "user_id": user_id,
                "reason": (reason or "").strip(),
                "cancelled_at": datetime.utcnow(),
                "booking_snapshot": snapshot,
            }
        )

        try:
            result = await collection.delete_one({"_id": object_id, "user_id": user_id})
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to cancel booking right now.") from exc

        if result.deleted_count == 1:
            serialized = BookingService._serialize_booking(booking)
            await ActivityService.log_booking_cancelled(
                {**booking, **serialized},
                reason=reason,
            )
            await WalletService.record_booking_transaction(
                user_id,
                {**booking, **serialized},
                direction="credit",
                description=reason or "Booking cancelled",
                status="refund",
            )
            return True
        return False

    @staticmethod
    async def create_booking(user_id: str, payload: BookingCreateRequest) -> Dict[str, Any]:
        now = datetime.utcnow()
        status_value = payload.status.value if isinstance(payload.status, Enum) else str(payload.status).lower()
        document: Dict[str, Any] = {
            "user_id": user_id,
            "product_id": payload.productId,
            "title": payload.title,
            "tour_name": payload.title,
            "destination": payload.destination or payload.location,
            "location": payload.location or payload.destination,
            "status": status_value or "pending",
            "start_date": payload.startDate,
            "end_date": payload.endDate,
            "total_amount": BookingService._format_currency_value(payload.totalAmount),
            "currency": payload.currency or "USD",
            "loyalty_points": int(payload.loyaltyPoints or 0),
            "hero_image": payload.heroImage,
            "notes": payload.notes,
            "travelers": payload.travelers,
            "package_type": payload.packageType,
            "pick_up_location": payload.pickUpLocation,
            "drop_off_location": payload.dropOffLocation,
            "customer_name": payload.customerName,
            "customer_email": payload.customerEmail,
            "customer_phone": payload.customerPhone,
            "vehicle": payload.vehicle,
            "tour_date_label": payload.tourDateLabel,
            "extras": payload.extras or [],
            "metadata": payload.metadata or {},
            "created_at": now,
            "updated_at": now,
        }

        try:
            result = await BookingService._collection().insert_one(document)
            inserted = await BookingService._collection().find_one({"_id": result.inserted_id})
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to create booking right now.") from exc
        serialized = BookingService._serialize_booking(inserted)
        await ActivityService.log_booking_created({**inserted, **serialized})
        await WalletService.record_booking_transaction(
            user_id,
            {**inserted, **serialized},
            direction="debit",
            description="Booking payment",
            status=serialized.get("status"),
        )
        return serialized


