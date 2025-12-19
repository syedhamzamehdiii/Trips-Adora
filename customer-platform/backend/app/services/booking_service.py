from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
import logging

from bson import ObjectId
from bson.errors import InvalidId

from app.core.database import get_database
from app.core.exceptions import DatabaseUnavailableError
from app.schemas.booking import BookingCreateRequest
from app.services.activity_service import ActivityService
from app.services.wallet_service import WalletService
from pymongo.errors import AutoReconnect, ServerSelectionTimeoutError

# Import platform settings to get commission rate at booking time
try:
    from app.services.platform_settings_service import PlatformSettingsService
except ImportError:
    # Fallback if platform_settings_service doesn't exist in customer platform
    PlatformSettingsService = None

logger = logging.getLogger(__name__)


ACTIVE_STATUSES = {"pending", "customized", "confirmed"}
UPCOMING_STATUSES = {"pending", "customized", "confirmed"}


class BookingService:
    COLLECTION = "customer_bookings"

    @staticmethod
    def _collection():
        db = get_database()
        if db is None:
            raise ConnectionError("MongoDB connection is not available.")
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
    async def get_bookings_for_user(user_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        try:
            # Exclude bookings deleted by customer
            query = {"user_id": user_id, "deleted_by_customer": {"$ne": True}}
            cursor = BookingService._collection().find(query).sort("start_date", 1)
            if limit:
                cursor = cursor.limit(limit)
            bookings = await cursor.to_list(length=limit or None)
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
        if db is None:
            logger.error("Database connection not available for cancellation")
            return False
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

        # Update booking status to "cancelled" instead of deleting
        # This allows suppliers to see cancelled bookings and track account stability
        try:
            update_result = await collection.update_one(
                {"_id": object_id, "user_id": user_id},
                {
                    "$set": {
                        "status": "cancelled",
                        "cancelled_at": datetime.utcnow(),
                        "cancellation_reason": (reason or "").strip(),
                        "updated_at": datetime.utcnow(),
                    }
                }
            )
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to cancel booking right now.") from exc

        if update_result.modified_count == 1:
            # Fetch updated booking
            updated_booking = await collection.find_one({"_id": object_id})
            serialized = BookingService._serialize_booking(updated_booking)
            
            await ActivityService.log_booking_cancelled(
                {**updated_booking, **serialized},
                reason=reason,
            )
            await WalletService.record_booking_transaction(
                user_id,
                {**updated_booking, **serialized},
                direction="credit",
                description=reason or "Booking cancelled",
                status="refund",
            )
            
            # Create notification for supplier if supplier_id exists
            supplier_id = updated_booking.get("supplier_id")
            if supplier_id:
                # Ensure supplier_id is a string
                supplier_id = str(supplier_id)
                try:
                    logger.info(f"Creating cancellation notification for supplier {supplier_id}, booking {updated_booking.get('id')}")
                    await BookingService._create_supplier_cancellation_notification(
                        supplier_id, 
                        {**updated_booking, **serialized}, 
                        reason
                    )
                except Exception as e:
                    logger.error(f"Could not create supplier cancellation notification: {e}", exc_info=True)
            else:
                logger.warning(f"No supplier_id found in booking {updated_booking.get('id')} for cancellation notification")
            
            return True
        return False

    @staticmethod
    async def delete_booking(user_id: str, booking_id: str) -> bool:
        """
        Permanently delete a booking for storage cleanup.
        This is a customer-only action and does NOT affect supplier booking counts.
        The booking is marked as deleted_by_customer but remains visible to suppliers.
        """
        try:
            object_id = ObjectId(booking_id)
        except (InvalidId, TypeError):
            return False

        collection = BookingService._collection()
        booking = await collection.find_one({"_id": object_id, "user_id": user_id})
        if not booking:
            return False

        # Mark as deleted_by_customer instead of actually deleting
        # This way suppliers can still see it for their records
        try:
            update_result = await collection.update_one(
                {"_id": object_id, "user_id": user_id},
                {
                    "$set": {
                        "deleted_by_customer": True,
                        "deleted_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                    }
                }
            )
        except (ConnectionError, AutoReconnect, ServerSelectionTimeoutError) as exc:
            raise DatabaseUnavailableError("Unable to delete booking right now.") from exc

        if update_result.modified_count == 1:
            logger.info(f"Booking {booking_id} marked as deleted by customer {user_id}")
            return True
        return False

    @staticmethod
    async def create_booking(user_id: str, payload: BookingCreateRequest) -> Dict[str, Any]:
        now = datetime.utcnow()
        status_value = payload.status.value if isinstance(payload.status, Enum) else str(payload.status).lower()
        
        # Look up supplier_id from the product and get current commission rate
        supplier_id = None
        commission_rate = None
        if payload.productId:
            try:
                db = get_database()
                if db is None:
                    logger.warning("Database connection not available, skipping product lookup")
                else:
                    product = await db.products.find_one({"_id": ObjectId(payload.productId)})
                    if product:
                        supplier_id = product.get("supplier_id") or product.get("user_id")
                        # Ensure supplier_id is a string
                        if supplier_id:
                            supplier_id = str(supplier_id)
                            logger.info(f"Found supplier_id {supplier_id} for product {payload.productId}")
            except Exception as e:
                logger.warning(f"Could not fetch supplier_id for product {payload.productId}: {e}")
        
        # Get current commission rate at booking time and store it with the booking
        try:
            if PlatformSettingsService:
                commission_rate = await PlatformSettingsService.get_commission_rate()
            else:
                # Fallback: try to read from platform_settings collection directly
                db = get_database()
                if db is None:
                    commission_rate = 0.25  # Default fallback
                else:
                    settings_doc = await db.platform_settings.find_one({"_id": "platform"})
                if settings_doc and settings_doc.get("commission_rate") is not None:
                    commission_rate = float(settings_doc.get("commission_rate", 0.25))
                else:
                    commission_rate = 0.25  # Default fallback
        except Exception as e:
            logger.warning(f"Could not fetch commission rate, using default 0.25: {e}")
            commission_rate = 0.25  # Default fallback
        
        document: Dict[str, Any] = {
            "user_id": user_id,
            "product_id": payload.productId,
            "supplier_id": supplier_id,  # Store supplier_id for filtering
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
            "commission_rate": commission_rate,  # Store commission rate at booking time
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
        
        # Create notification for supplier if supplier_id exists
        if supplier_id:
            try:
                await BookingService._create_supplier_notification(supplier_id, serialized)
            except Exception as e:
                logger.warning(f"Could not create supplier notification: {e}")
        
        return serialized

    @staticmethod
    async def _create_supplier_notification(supplier_id: str, booking: Dict[str, Any]) -> None:
        """Create a notification for the supplier when their product is booked."""
        try:
            db = get_database()
            if db is None:
                logger.warning("Database connection not available, skipping notification")
                return
            notifications_collection = db["supplier_notifications"]
            
            notification = {
                "supplier_id": supplier_id,
                "type": "booking",
                "title": f"New booking for {booking.get('title', 'your product')}",
                "message": f"{booking.get('customer_name', 'A customer')} booked your product",
                "booking_id": booking.get("id"),
                "product_id": booking.get("product_id"),
                "read": False,
                "created_at": datetime.utcnow(),
            }
            
            await notifications_collection.insert_one(notification)
            logger.info(f"Created notification for supplier {supplier_id} about booking {booking.get('id')}")
        except Exception as e:
            logger.error(f"Error creating supplier notification: {e}")
            # Don't raise - notification failure shouldn't break booking creation

    @staticmethod
    async def _create_supplier_cancellation_notification(
        supplier_id: str, 
        booking: Dict[str, Any], 
        reason: Optional[str] = None
    ) -> None:
        """Create a notification for the supplier when a booking is cancelled."""
        try:
            db = get_database()
            if db is None:
                logger.warning("Database connection not available, skipping cancellation notification")
                return
            notifications_collection = db["supplier_notifications"]
            
            booking_title = booking.get('title') or booking.get('tour_name') or 'your product'
            customer_name = booking.get('customer_name') or 'A customer'
            reason_text = f" Reason: {reason}" if reason else ""
            
            notification = {
                "supplier_id": supplier_id,
                "type": "cancellation",
                "title": f"Booking cancelled: {booking_title}",
                "message": f"{customer_name} cancelled their booking.{reason_text}",
                "booking_id": booking.get("id"),
                "product_id": booking.get("product_id"),
                "read": False,
                "created_at": datetime.utcnow(),
            }
            
            await notifications_collection.insert_one(notification)
            logger.info(f"Created cancellation notification for supplier {supplier_id} about booking {booking.get('id')}")
        except Exception as e:
            logger.error(f"Error creating supplier cancellation notification: {e}")
            # Don't raise - notification failure shouldn't break booking cancellation


