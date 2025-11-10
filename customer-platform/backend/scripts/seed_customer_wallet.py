#!/usr/bin/env python3
"""
Seed customer wallet data for TripsAdora demo user.

Usage:
    python scripts/seed_customer_wallet.py
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Any, Dict

from pymongo import MongoClient

DEFAULT_MONGODB_URL = "mongodb+srv://mehihamza1:mehihamza1@clusterr.st9ycu2.mongodb.net/TripsAdora"
DEFAULT_DATABASE_NAME = "TripsAdora"
COLLECTION_NAME = "customer_wallets"
USER_ID = os.getenv("CUSTOMER_PROFILE_USER_ID", "john-doe")


def build_wallet_document() -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "user_id": USER_ID,
        "balances": {
            "total_balance": 695.50,
            "refund_balance": 820.50,
            "penalty": 125.00,
            "currency": "USD",
            "simulated_payment_amount": 750.00,
        },
        "preferences": {
            "show_prices_in_selected_currency": True,
            "show_personalized_recommendations": True,
            "save_search_history": True,
        },
        "payment_methods": [
            {
                "id": "visa-4242",
                "method_type": "card",
                "brand": "visa",
                "label": "VISA",
                "last4": "4242",
                "exp_month": 12,
                "exp_year": 2025,
                "cardholder": "John Doe",
                "is_default": True,
                "added_at": now - timedelta(days=90),
            },
            {
                "id": "mc-8888",
                "method_type": "card",
                "brand": "mastercard",
                "label": "Mastercard",
                "last4": "8888",
                "exp_month": 6,
                "exp_year": 2026,
                "cardholder": "John Doe",
                "is_default": False,
                "added_at": now - timedelta(days=60),
            },
        ],
        "bank_accounts": [
            {
                "id": "bank-chase-1",
                "account_holder": "John Doe",
                "bank_name": "Chase Bank De",
                "last4": "1234",
                "country": "United States",
                "currency": "USD",
                "swift": "CHASUS33XXX",
                "routing_number_last4": "0021",
                "account_type": "checking",
                "added_at": now - timedelta(days=120),
            },
            {
                "id": "bank-japan-1",
                "account_holder": "John Doe",
                "bank_name": "Bank of Japan",
                "last4": "4321",
                "country": "Japan",
                "currency": "JPY",
                "swift": "BOJPJPJTXXX",
                "routing_number_last4": None,
                "account_type": "savings",
                "added_at": now - timedelta(days=95),
            },
        ],
        "payment_history": [
            {
                "id": "txn-rome-tour",
                "title": "Rome Ancient Wonders Tour",
                "description": "Booking payment",
                "direction": "debit",
                "amount": 349.00,
                "currency": "USD",
                "status": "confirmed",
                "occurred_at": (now - timedelta(days=55)).isoformat(),
                "booking_id": "BK-2025-0915",
            },
            {
                "id": "txn-bali-temples",
                "title": "Bali Temples Day Trip",
                "description": "Booking payment",
                "direction": "debit",
                "amount": 89.00,
                "currency": "USD",
                "status": "confirmed",
                "occurred_at": (now - timedelta(days=75)).isoformat(),
                "booking_id": "BK-2025-0810",
            },
            {
                "id": "txn-dubai-safari",
                "title": "Dubai Desert Safari",
                "description": "Booking payment",
                "direction": "debit",
                "amount": 119.00,
                "currency": "USD",
                "status": "confirmed",
                "occurred_at": (now - timedelta(days=95)).isoformat(),
                "booking_id": "BK-2025-0705",
            },
            {
                "id": "txn-paris-refund",
                "title": "Flight Cancellation Refund",
                "description": "Refund processed",
                "direction": "credit",
                "amount": 320.50,
                "currency": "USD",
                "status": "refund",
                "occurred_at": (now - timedelta(days=25)).isoformat(),
                "booking_id": "BK-2025-0620",
            },
        ],
        "recent_transactions": [
            {
                "id": "txn-recent-rome",
                "title": "Rome Ancient Wonders Tour",
                "description": "Booking payment",
                "direction": "debit",
                "amount": 349.00,
                "currency": "USD",
                "status": "confirmed",
                "occurred_at": (now - timedelta(days=55)).isoformat(),
                "booking_id": "BK-2025-0915",
            },
            {
                "id": "txn-recent-bali",
                "title": "Bali Temples Day Trip",
                "description": "Booking payment",
                "direction": "debit",
                "amount": 89.00,
                "currency": "USD",
                "status": "confirmed",
                "occurred_at": (now - timedelta(days=75)).isoformat(),
                "booking_id": "BK-2025-0810",
            },
            {
                "id": "txn-recent-dubai",
                "title": "Dubai Desert Safari",
                "description": "Booking payment",
                "direction": "debit",
                "amount": 119.00,
                "currency": "USD",
                "status": "confirmed",
                "occurred_at": (now - timedelta(days=95)).isoformat(),
                "booking_id": "BK-2025-0705",
            },
            {
                "id": "txn-recent-paris",
                "title": "Paris City Tour",
                "description": "Booking payment",
                "direction": "debit",
                "amount": 225.00,
                "currency": "USD",
                "status": "confirmed",
                "occurred_at": (now - timedelta(days=120)).isoformat(),
                "booking_id": "BK-2025-0620",
            },
        ],
        "created_at": now,
        "updated_at": now,
    }


def main():
    mongo_url = os.getenv("MONGODB_URL", DEFAULT_MONGODB_URL)
    database_name = os.getenv("DATABASE_NAME", DEFAULT_DATABASE_NAME)

    client = MongoClient(mongo_url)
    db = client[database_name]
    collection = db[COLLECTION_NAME]

    wallet_document = build_wallet_document()
    existing = collection.find_one({"user_id": USER_ID})
    if existing:
        collection.replace_one({"_id": existing["_id"]}, wallet_document)
    else:
        collection.insert_one(wallet_document)

    print(f"✅ Wallet seeded for user_id={USER_ID}")


if __name__ == "__main__":
    main()


