from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from app.core.database import get_database
from app.schemas.wallet import (
    BankAccountCreateRequest,
    PaymentMethodCreateRequest,
    WalletResponse,
    WalletUpdateRequest,
    WalletTransaction,
)


class WalletService:
    COLLECTION = "customer_wallets"

    @staticmethod
    def _collection():
        db = get_database()
        return db[WalletService.COLLECTION]

    @staticmethod
    def _default_document(user_id: str) -> Dict[str, Any]:
        now = datetime.utcnow()
        return {
            "user_id": user_id,
            "balances": {
                "total_balance": 0.0,
                "refund_balance": 0.0,
                "penalty": 0.0,
                "currency": "USD",
                "simulated_payment_amount": None,
            },
            "preferences": {
                "show_prices_in_selected_currency": True,
                "show_personalized_recommendations": True,
                "save_search_history": True,
            },
            "payment_methods": [],
            "bank_accounts": [],
            "payment_history": [],
            "recent_transactions": [],
            "created_at": now,
            "updated_at": now,
        }

    @staticmethod
    async def ensure_wallet(user_id: str) -> Dict[str, Any]:
        collection = WalletService._collection()
        doc = await collection.find_one({"user_id": user_id})
        if doc:
            return doc
        default_doc = WalletService._default_document(user_id)
        result = await collection.insert_one(default_doc)
        default_doc["_id"] = result.inserted_id
        return default_doc

    @staticmethod
    def _isoformat(value: Any) -> Any:
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, list):
            return [WalletService._isoformat(item) for item in value]
        if isinstance(value, dict):
            return {key: WalletService._isoformat(val) for key, val in value.items()}
        return value

    @staticmethod
    def _prepare(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not doc:
            return doc
        result = dict(doc)
        result["id"] = str(result.pop("_id"))
        return WalletService._isoformat(result)

    @staticmethod
    async def get_wallet(user_id: str) -> Optional[Dict[str, Any]]:
        doc = await WalletService._collection().find_one({"user_id": user_id})
        if not doc:
            return None
        return WalletService._prepare(doc)

    @staticmethod
    async def upsert_wallet(user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        collection = WalletService._collection()
        now = datetime.utcnow()
        base_doc = await WalletService.ensure_wallet(user_id)
        update_doc = {
            **base_doc,
            **payload,
            "user_id": user_id,
            "updated_at": now,
        }
        await collection.update_one({"_id": base_doc["_id"]}, {"$set": update_doc})
        updated = await collection.find_one({"_id": base_doc["_id"]})
        return WalletService._prepare(updated)

    @staticmethod
    async def update_wallet(user_id: str, updates: WalletUpdateRequest) -> Optional[Dict[str, Any]]:
        collection = WalletService._collection()
        existing = await WalletService.ensure_wallet(user_id)
        now = datetime.utcnow()
        update_data: Dict[str, Any] = {"updated_at": now}

        data = updates.model_dump(exclude_unset=True, by_alias=True)
        for key in ("balances", "preferences", "payment_history", "recent_transactions"):
            if key in data and data[key] is not None:
                update_data[key] = data[key]

        await collection.update_one({"_id": existing["_id"]}, {"$set": update_data})
        updated = await collection.find_one({"_id": existing["_id"]})
        return WalletService._prepare(updated)

    @staticmethod
    async def add_payment_method(user_id: str, payload: PaymentMethodCreateRequest) -> Dict[str, Any]:
        collection = WalletService._collection()
        doc = await WalletService.ensure_wallet(user_id)
        now = datetime.utcnow()
        payment_methods: List[Dict[str, Any]] = doc.get("payment_methods", [])

        method_id = uuid4().hex
        is_default = bool(payload.is_default) or not any(m.get("is_default") for m in payment_methods)
        method_doc = {
            "id": method_id,
            "method_type": payload.method_type,
            "brand": (payload.brand or payload.method_type or "card").lower(),
            "label": payload.label or payload.brand or payload.method_type.title(),
            "last4": payload.last4,
            "exp_month": payload.exp_month,
            "exp_year": payload.exp_year,
            "cardholder": payload.cardholder,
            "is_default": is_default,
            "added_at": now,
            "account_identifier": payload.account_identifier,
            "metadata": payload.metadata or {},
        }

        if is_default:
            payment_methods = [{**m, "is_default": False} for m in payment_methods]

        payment_methods.append(method_doc)

        await collection.update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "payment_methods": payment_methods,
                    "updated_at": now,
                }
            },
        )

        updated = await collection.find_one({"_id": doc["_id"]})
        return WalletService._prepare(updated)

    @staticmethod
    async def set_default_payment_method(user_id: str, method_id: str) -> Optional[Dict[str, Any]]:
        collection = WalletService._collection()
        doc = await WalletService.ensure_wallet(user_id)
        payment_methods: List[Dict[str, Any]] = doc.get("payment_methods", [])

        found = False
        new_methods: List[Dict[str, Any]] = []
        for method in payment_methods:
            if method.get("id") == method_id:
                found = True
                new_methods.append({**method, "is_default": True})
            else:
                new_methods.append({**method, "is_default": False})

        if not found:
            return WalletService._prepare(doc)

        now = datetime.utcnow()
        await collection.update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "payment_methods": new_methods,
                    "updated_at": now,
                }
            },
        )
        updated = await collection.find_one({"_id": doc["_id"]})
        return WalletService._prepare(updated)

    @staticmethod
    async def remove_payment_method(user_id: str, method_id: str) -> Optional[Dict[str, Any]]:
        collection = WalletService._collection()
        doc = await WalletService.ensure_wallet(user_id)
        payment_methods: List[Dict[str, Any]] = doc.get("payment_methods", [])
        filtered = [m for m in payment_methods if m.get("id") != method_id]
        if len(filtered) == len(payment_methods):
            return WalletService._prepare(doc)

        if filtered and not any(m.get("is_default") for m in filtered):
            filtered[0]["is_default"] = True

        now = datetime.utcnow()
        await collection.update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "payment_methods": filtered,
                    "updated_at": now,
                }
            },
        )
        updated = await collection.find_one({"_id": doc["_id"]})
        return WalletService._prepare(updated)

    @staticmethod
    async def add_bank_account(user_id: str, payload: BankAccountCreateRequest) -> Dict[str, Any]:
        collection = WalletService._collection()
        doc = await WalletService.ensure_wallet(user_id)
        now = datetime.utcnow()
        bank_accounts: List[Dict[str, Any]] = doc.get("bank_accounts", [])

        account_number = payload.account_number or ""
        last4 = account_number[-4:] if account_number else None
        routing_last4 = payload.routing_number[-4:] if payload.routing_number else None

        bank_doc = {
            "id": uuid4().hex,
            "account_holder": payload.account_holder,
            "bank_name": payload.bank_name,
            "last4": last4,
            "country": payload.country,
            "currency": payload.currency,
            "swift": payload.swift,
            "routing_number_last4": routing_last4,
            "account_type": payload.account_type,
            "added_at": now,
        }

        bank_accounts.append(bank_doc)

        await collection.update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "bank_accounts": bank_accounts,
                    "updated_at": now,
                }
            },
        )
        updated = await collection.find_one({"_id": doc["_id"]})
        return WalletService._prepare(updated)

    @staticmethod
    async def remove_bank_account(user_id: str, account_id: str) -> Optional[Dict[str, Any]]:
        collection = WalletService._collection()
        doc = await WalletService.ensure_wallet(user_id)
        bank_accounts: List[Dict[str, Any]] = doc.get("bank_accounts", [])
        filtered = [acct for acct in bank_accounts if acct.get("id") != account_id]

        if len(filtered) == len(bank_accounts):
            return WalletService._prepare(doc)

        now = datetime.utcnow()
        await collection.update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "bank_accounts": filtered,
                    "updated_at": now,
                }
            },
        )
        updated = await collection.find_one({"_id": doc["_id"]})
        return WalletService._prepare(updated)

    @staticmethod
    async def append_transaction(user_id: str, transaction: WalletTransaction) -> Dict[str, Any]:
        collection = WalletService._collection()
        doc = await WalletService.ensure_wallet(user_id)
        now = datetime.utcnow()

        transaction_doc = transaction.model_dump()
        if "occurred_at" not in transaction_doc or not transaction_doc["occurred_at"]:
            transaction_doc["occurred_at"] = datetime.utcnow().isoformat()

        recent_transactions: List[Dict[str, Any]] = doc.get("recent_transactions", [])
        payment_history: List[Dict[str, Any]] = doc.get("payment_history", [])

        recent_transactions.insert(0, transaction_doc)
        payment_history.insert(0, transaction_doc)

        # Keep only the latest 20 transactions in recent list
        recent_transactions = recent_transactions[:20]

        await collection.update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "recent_transactions": recent_transactions,
                    "payment_history": payment_history,
                    "updated_at": now,
                }
            },
        )
        updated = await collection.find_one({"_id": doc["_id"]})
        return WalletService._prepare(updated)

    @staticmethod
    async def record_booking_transaction(
        user_id: str,
        booking: Dict[str, Any],
        *,
        direction: str,
        description: str,
        status: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        amount = booking.get("total_amount") or booking.get("totalAmount")
        if amount is None:
            return None
        try:
            amount_value = float(amount)
        except (TypeError, ValueError):
            return None

        booking_id = booking.get("booking_id") or booking.get("bookingId") or booking.get("id")
        title = booking.get("title") or booking.get("tour_name") or "Booking"
        currency = booking.get("currency") or "USD"
        occurred_at = booking.get("created_at") or booking.get("createdAt") or datetime.utcnow().isoformat()
        if isinstance(occurred_at, datetime):
            occurred_at = occurred_at.isoformat()

        transaction = WalletTransaction(
            id=f"txn-{uuid4().hex}",
            title=title,
            description=description,
            direction=direction,
            amount=abs(amount_value),
            currency=currency,
            status=status or booking.get("status"),
            occurred_at=occurred_at,
            booking_id=str(booking_id) if booking_id else None,
        )
        return await WalletService.append_transaction(user_id, transaction)


