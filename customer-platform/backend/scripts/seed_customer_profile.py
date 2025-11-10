#!/usr/bin/env python3
"""
Seed or update the demo customer profile data used by the TripsAdora customer dashboard.

Usage:
    python scripts/seed_customer_profile.py

The script reads connection details from environment variables if present:
    - MONGODB_URL (defaults to the shared TripsAdora cluster)
    - DATABASE_NAME (defaults to "TripsAdora")
"""

from __future__ import annotations

import os
from datetime import datetime

from pymongo import MongoClient, ReturnDocument

DEFAULT_MONGODB_URL = "mongodb+srv://mehihamza1:mehihamza1@clusterr.st9ycu2.mongodb.net/TripsAdora"
DEFAULT_DATABASE_NAME = "TripsAdora"
COLLECTION_NAME = "customer_profiles"
USER_ID = os.getenv("CUSTOMER_PROFILE_USER_ID", "john-doe")


def main():
    mongo_url = os.getenv("MONGODB_URL", DEFAULT_MONGODB_URL)
    database_name = os.getenv("DATABASE_NAME", DEFAULT_DATABASE_NAME)

    client = MongoClient(mongo_url)
    db = client[database_name]
    collection = db[COLLECTION_NAME]

    now = datetime.utcnow()

    payload = {
        "user": {
            "id": USER_ID,
            "name": "John Doe",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "phone": "+1 (555) 123-4567",
            "location": "New York, USA",
            "date_of_birth": datetime(1990, 10, 5),
            "address_line1": "123 Main Street",
            "zip_code": "10001",
            "country": "United States",
            "language": "en",
            "member_since": datetime(2023, 1, 12),
            "membership_tier": "Premium Member",
            "loyalty_tier": "Platinum",
            "avatar_url": "/assests/richp.jpg",
        },
        "stats": {
            "total_bookings": 3,
            "active_bookings": 1,
            "loyalty_points": 2450,
            "total_spent": 600,
            "currency": "USD",
        },
        "upcoming_trips": [
            {
                "id": "tokyo-2025",
                "title": "Tokyo Japan",
                "destination": "Tokyo, Japan",
                "start_date": datetime(2025, 11, 15),
                "display_date": "Nov 15, 2025",
                "status": "customized",
                "status_label": "Customized",
                "status_color": "bg-green-100 text-green-700",
                "thumbnail": "/assests/place 1.jpg",
                "notes": "Private guided adventure with custom itinerary",
            },
            {
                "id": "nikko-winter-2025",
                "title": "Nikko Tour",
                "destination": "Nikko, Japan",
                "start_date": datetime(2025, 12, 20),
                "display_date": "Dec 20, 2025",
                "status": "pending",
                "status_label": "Pending",
                "status_color": "bg-yellow-100 text-yellow-700",
                "thumbnail": "/assests/place 2.jpg",
            },
        ],
        "travel_preferences": [
            {"label": "Adventure", "value": 85},
            {"label": "Cultural", "value": 70},
            {"label": "Relaxation", "value": 60},
            {"label": "Food & Dining", "value": 90},
        ],
        "recent_activity": [
            {
                "id": "activity-1",
                "title": "Booked Tokyo City Tour",
                "timestamp": now.replace(day=max(1, now.day - 2)),
                "category": "booking",
            },
            {
                "id": "activity-2",
                "title": "Added Item to Wishlist",
                "timestamp": now.replace(day=max(1, now.day - 5)),
                "category": "wishlist",
            },
            {
                "id": "activity-3",
                "title": "Left Review for Paris Tour",
                "timestamp": now.replace(day=max(1, now.day - 7)),
                "category": "review",
            },
            {
                "id": "activity-4",
                "title": "Updated Profile Information",
                "timestamp": now.replace(day=max(1, now.day - 14)),
                "category": "profile",
            },
        ],
        "refer_and_earn": {
            "code": "johnning",
            "referrals": 5,
            "earned": 280,
            "currency": "USD",
        },
        "wishlist": [
            {
                "id": "tokyo-highlights-001",
                "title": "Tokyo Highlights & Hidden Gems Tour",
                "location": "Tokyo, Japan",
                "price": 189,
                "currency": "USD",
                "image": "/assests/place 3.jpg",
            }
        ],
        "last_synced_at": now,
        "updated_at": now,
    }

    collection.find_one_and_update(
        {"user_id": USER_ID},
        {
            "$set": payload,
            "$setOnInsert": {
                "created_at": now,
                "user_id": USER_ID,
            },
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    doc = collection.find_one({"user_id": USER_ID})
    print(f"✅ Seeded profile for user_id={USER_ID} (document id={doc['_id']})")


if __name__ == "__main__":
    main()


