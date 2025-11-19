#!/usr/bin/env python3
"""Seed sample customer reviews for demo purposes."""

from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

from pymongo import MongoClient

DEFAULT_MONGODB_URL = "mongodb+srv://mehihamza1:mehihamza1@clusterr.st9ycu2.mongodb.net/TripsAdora"
DEFAULT_DATABASE_NAME = "TripsAdora"
COLLECTION_NAME = "customer_reviews"
USER_ID = os.getenv("CUSTOMER_PROFILE_USER_ID", "john-doe")


def build_reviews() -> List[Dict[str, Any]]:
    now = datetime.utcnow()
    return [
        {
            "user_id": USER_ID,
            "product_id": "tokyo-tour-001",
            "product_title": "Tokyo Highlights & Hidden Gems Tour",
            "booking_id": "booking-tokyo-highlights",
            "rating": 5,
            "title": "Amazing Tokyo adventure",
            "content": "Absolutely incredible experience! The guide was knowledgeable and the sunset views were breathtaking.",
            "visited_at": now - timedelta(days=90),
            "author": {
                "name": "Maham Saeed",
                "email": "maham.inbox@gmail.com",
                "avatar_url": "https://images.unsplash.com/photo-1542044801-287e1c0fedd1?auto=format&fit=facearea&w=120&h=120&q=80",
            },
            "created_at": now - timedelta(days=60),
            "updated_at": now - timedelta(days=55),
        },
        {
            "user_id": USER_ID,
            "product_id": "kyoto-cultural-002",
            "product_title": "Kyoto Cultural Escape",
            "booking_id": "booking-kyoto-cultural",
            "rating": 4,
            "title": "Loved the traditions",
            "content": "Kyoto's traditions came alive. The tea ceremony and temple visits gave a real sense of history.",
            "visited_at": now - timedelta(days=150),
            "author": {
                "name": "Maham Saeed",
                "email": "maham.inbox@gmail.com",
                "avatar_url": "https://images.unsplash.com/photo-1542044801-287e1c0fedd1?auto=format&fit=facearea&w=120&h=120&q=80",
            },
            "created_at": now - timedelta(days=120),
            "updated_at": now - timedelta(days=115),
        },
        {
            "user_id": USER_ID,
            "product_id": "osaka-food-003",
            "product_title": "Osaka Night Food Market Experience",
            "booking_id": "booking-osaka-food",
            "rating": 5,
            "title": "Street food heaven",
            "content": "Every bite was delicious! Osaka's food scene is unmatched. Highly recommend the takoyaki stop.",
            "visited_at": now - timedelta(days=45),
            "author": {
                "name": "Maham Saeed",
                "email": "maham.inbox@gmail.com",
                "avatar_url": "https://images.unsplash.com/photo-1542044801-287e1c0fedd1?auto=format&fit=facearea&w=120&h=120&q=80",
            },
            "created_at": now - timedelta(days=30),
            "updated_at": now - timedelta(days=28),
        },
    ]


def main():
    mongo_url = os.getenv("MONGODB_URL", DEFAULT_MONGODB_URL)
    database_name = os.getenv("DATABASE_NAME", DEFAULT_DATABASE_NAME)

    client = MongoClient(mongo_url)
    db = client[database_name]
    collection = db[COLLECTION_NAME]

    reviews = build_reviews()

    collection.delete_many({"user_id": USER_ID})
    if reviews:
        collection.insert_many(reviews)

    print(f"✅ Seeded {len(reviews)} reviews for user_id={USER_ID}")


if __name__ == "__main__":
    main()

