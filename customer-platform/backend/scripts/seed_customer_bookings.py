#!/usr/bin/env python3
"""
Seed demo bookings for the TripsAdora customer dashboard.

Usage:
    python scripts/seed_customer_bookings.py
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

from pymongo import MongoClient, ReturnDocument

DEFAULT_MONGODB_URL = "mongodb+srv://mehihamza1:mehihamza1@clusterr.st9ycu2.mongodb.net/TripsAdora"
DEFAULT_DATABASE_NAME = "TripsAdora"
COLLECTION_NAME = "customer_bookings"
USER_ID = os.getenv("CUSTOMER_PROFILE_USER_ID", "john-doe")


def build_seed_bookings() -> List[Dict[str, Any]]:
    return [
        {
            "user_id": USER_ID,
            "title": "Tokyo Japan",
            "destination": "Tokyo, Japan",
            "start_date": datetime(2025, 11, 15),
            "status": "customized",
            "hero_image": "/assests/place 1.jpg",
            "total_amount": 420.0,
            "currency": "USD",
            "loyalty_points": 950,
            "notes": "Private guided itinerary with custom foodie tour.",
        },
        {
            "user_id": USER_ID,
            "title": "Nikko Tour",
            "destination": "Nikko, Japan",
            "start_date": datetime(2025, 12, 20),
            "status": "pending",
            "hero_image": "/assests/place 2.jpg",
            "total_amount": 180.0,
            "currency": "USD",
            "loyalty_points": 450,
            "notes": "Awaiting final confirmation from local operator.",
        },
        {
            "user_id": USER_ID,
            "title": "Kyoto Cultural Escape",
            "destination": "Kyoto, Japan",
            "start_date": datetime(2024, 9, 5),
            "status": "completed",
            "hero_image": "/assests/place 3.jpg",
            "total_amount": 600.0,
            "currency": "USD",
            "loyalty_points": 1050,
            "notes": "Completed successfully with 5-star review.",
        },
    ]


def main():
    mongo_url = os.getenv("MONGODB_URL", DEFAULT_MONGODB_URL)
    database_name = os.getenv("DATABASE_NAME", DEFAULT_DATABASE_NAME)

    client = MongoClient(mongo_url)
    db = client[database_name]
    collection = db[COLLECTION_NAME]

    collection.delete_many({"user_id": USER_ID})

    bookings = build_seed_bookings()
    now = datetime.utcnow()
    for booking in bookings:
        booking["created_at"] = now
        booking["updated_at"] = now
        collection.find_one_and_update(
            {"user_id": USER_ID, "title": booking["title"], "start_date": booking["start_date"]},
            {"$set": booking},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

    count = collection.count_documents({"user_id": USER_ID})
    print(f"✅ Seeded {count} bookings for user_id={USER_ID}")


if __name__ == "__main__":
    main()


