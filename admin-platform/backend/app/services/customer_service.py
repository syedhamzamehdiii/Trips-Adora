"""
Customer Service
Handles business logic for customer management and analytics
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from bson import ObjectId
from app.core.database import get_database
import logging

logger = logging.getLogger(__name__)


class CustomerService:
    BOOKINGS_COLLECTION = "customer_bookings"
    REVIEWS_COLLECTION = "customer_reviews"
    USERS_COLLECTION = "users"
    PROFILES_COLLECTION = "customer_profiles"

    @staticmethod
    def _get_collection(name: str):
        """Get a MongoDB collection by name."""
        db = get_database()
        return db[name]
    
    @staticmethod
    async def _get_reviews_count_for_users(user_ids: List[str]) -> Dict[str, int]:
        """
        Shared helper to get reviews count for a list of user_ids.
        This ensures get_customers and get_customer_details use EXACT same logic.
        Returns: Dict mapping user_id -> reviews_count
        """
        reviews_collection = CustomerService._get_collection(CustomerService.REVIEWS_COLLECTION)
        
        # Match on both string and ObjectId formats to ensure we catch all reviews
        user_ids_obj = [ObjectId(uid) for uid in user_ids if ObjectId.is_valid(uid)]
        reviews_match = {
            "$or": [
                {"user_id": {"$in": user_ids}},
                {"user_id": {"$in": user_ids_obj}}
            ]
        } if user_ids_obj else {"user_id": {"$in": user_ids}}
        
        reviews_pipeline = [
            {"$match": reviews_match},
            {"$group": {
                "_id": {
                    "$cond": [
                        {"$eq": [{"$type": "$user_id"}, "string"]},
                        "$user_id",
                        {"$toString": "$user_id"}
                    ]
                },
                "reviews_count": {"$sum": 1}
            }}
        ]
        
        reviews_stats = {}
        async for result in reviews_collection.aggregate(reviews_pipeline):
            user_id_key = str(result.get("_id", ""))
            # Sum up counts if user_id appears in multiple formats (handles edge cases)
            if user_id_key in reviews_stats:
                reviews_stats[user_id_key] += result.get("reviews_count", 0)
            else:
                reviews_stats[user_id_key] = result.get("reviews_count", 0)
        
        return reviews_stats

    @staticmethod
    async def get_customers(
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get paginated list of customers with aggregated stats.
        Optimized using aggregation pipelines for better performance.
        """
        try:
            skip = (page - 1) * page_size
            
            # Get all collections
            users_collection = CustomerService._get_collection(CustomerService.USERS_COLLECTION)
            profiles_collection = CustomerService._get_collection(CustomerService.PROFILES_COLLECTION)
            bookings_collection = CustomerService._get_collection(CustomerService.BOOKINGS_COLLECTION)
            reviews_collection = CustomerService._get_collection(CustomerService.REVIEWS_COLLECTION)
            
            # Build search query
            user_match = {}
            profile_match = {}
            if search:
                search_regex = {"$regex": search, "$options": "i"}
                user_match = {"email": search_regex}
                profile_match = {
                    "$or": [
                        {"user.first_name": search_regex},
                        {"user.last_name": search_regex},
                        {"user.name": search_regex},
                        {"user.email": search_regex},
                    ]
                }
            
            # Get matching user IDs from profiles if searching
            matching_user_ids = set()
            if search:
                async for profile in profiles_collection.find(profile_match, {"user_id": 1}):
                    user_id = profile.get("user_id")
                    if user_id:
                        matching_user_ids.add(str(user_id))
            
            # Build user query
            user_query = user_match.copy()
            if matching_user_ids:
                # Also include users matching profile search
                user_query = {
                    "$or": [
                        user_match,
                        {"_id": {"$in": [ObjectId(uid) for uid in matching_user_ids if ObjectId.is_valid(uid)]}}
                    ]
                } if user_match else {"_id": {"$in": [ObjectId(uid) for uid in matching_user_ids if ObjectId.is_valid(uid)]}}
            
            # Get total count
            total_users = await users_collection.count_documents(user_query if user_query else {})
            
            # Get paginated users
            users_cursor = users_collection.find(user_query if user_query else {}).skip(skip).limit(page_size)
            paginated_users = await users_cursor.to_list(length=page_size)
            
            if not paginated_users:
                return {
                    "customers": [],
                    "total": total_users,
                    "page": page,
                    "page_size": page_size,
                    "total_pages": 1,
                }
            
            # Get all user IDs for batch queries
            user_ids = [str(u.get("_id", "")) for u in paginated_users]
            user_ids_obj = [ObjectId(uid) for uid in user_ids if ObjectId.is_valid(uid)]
            
            # Batch fetch profiles
            profiles_map = {}
            async for profile in profiles_collection.find({"user_id": {"$in": user_ids}}, {"user_id": 1, "customer_id": 1, "user.email": 1, "user.name": 1}):
                user_id = str(profile.get("user_id", ""))
                profiles_map[user_id] = profile
            
            # Batch aggregate bookings stats
            bookings_pipeline = [
                {"$match": {"user_id": {"$in": user_ids}}},
                {"$group": {
                    "_id": "$user_id",
                    "bookings_count": {"$sum": 1},
                    "total_spending": {"$sum": {"$ifNull": ["$total_amount", 0]}},
                    "recent_booking_date": {"$max": "$created_at"}
                }}
            ]
            bookings_stats = {}
            async for result in bookings_collection.aggregate(bookings_pipeline):
                user_id = str(result.get("_id", ""))
                bookings_stats[user_id] = {
                    "count": result.get("bookings_count", 0),
                    "spending": float(result.get("total_spending", 0)),
                    "recent_date": result.get("recent_booking_date")
                }
            
            # Batch aggregate reviews count - use shared helper for consistency
            reviews_stats = await CustomerService._get_reviews_count_for_users(user_ids)
            
            # Build customer list
            # Check for real-time online status (within last 2 minutes for more accurate real-time detection)
            two_minutes_ago = datetime.utcnow() - timedelta(minutes=2)
            customers = []
            
            # Batch check recent activity for online status (within last 2 minutes)
            activity_collection = CustomerService._get_collection("customer_profile_activity")
            recent_activity_pipeline = [
                {"$match": {
                    "user_id": {"$in": user_ids},
                    "timestamp": {"$gte": two_minutes_ago}
                }},
                {"$group": {
                    "_id": "$user_id",
                    "last_activity": {"$max": "$timestamp"}
                }}
            ]
            recent_activity_map = {}
            async for result in activity_collection.aggregate(recent_activity_pipeline):
                user_id_key = str(result.get("_id", ""))
                recent_activity_map[user_id_key] = result.get("last_activity")
            
            for user in paginated_users:
                user_id = str(user.get("_id", ""))
                email = user.get("email", "")
                
                # Get profile
                profile = profiles_map.get(user_id)
                
                # Get name
                name = ""
                if profile:
                    user_data = profile.get("user", {})
                    if isinstance(user_data, dict):
                        first_name = user_data.get("first_name", "")
                        last_name = user_data.get("last_name", "")
                        name = user_data.get("name", "")
                        if not name:
                            name = f"{first_name} {last_name}".strip()
                    if not name:
                        first_name = profile.get("first_name", "")
                        last_name = profile.get("last_name", "")
                        name = f"{first_name} {last_name}".strip()
                if not name:
                    name = user.get("name", email.split("@")[0] if email else "Unknown")
                
                # Get stats from aggregated data
                booking_stat = bookings_stats.get(user_id, {})
                bookings_count = booking_stat.get("count", 0)
                total_spending = booking_stat.get("spending", 0)
                reviews_count = reviews_stats.get(user_id, 0)
                
                # Determine REAL-TIME online status (currently viewing the website)
                last_seen = None
                last_synced = None
                
                if profile:
                    user_data = profile.get("user", {})
                    if isinstance(user_data, dict):
                        last_seen = user_data.get("last_seen")
                    if not last_seen:
                        last_seen = profile.get("last_seen")
                    last_synced = profile.get("last_synced_at")
                
                if not last_seen:
                    last_seen = user.get("last_seen")
                if not last_synced:
                    last_synced = user.get("updated_at")
                
                # Check if currently online (within last 2 minutes for real-time detection)
                is_online = False
                now = datetime.utcnow()
                online_threshold_seconds = 120  # 2 minutes for more accurate real-time status
                
                # Check last_seen
                if last_seen:
                    if isinstance(last_seen, datetime):
                        time_diff = (now - last_seen).total_seconds()
                        is_online = time_diff < online_threshold_seconds
                    elif isinstance(last_seen, str):
                        try:
                            last_seen_dt = datetime.fromisoformat(last_seen.replace("Z", "+00:00"))
                            time_diff = (now - last_seen_dt.replace(tzinfo=None)).total_seconds()
                            is_online = time_diff < online_threshold_seconds
                        except:
                            pass
                
                # Check last_synced_at (updated when profile is accessed - most reliable indicator)
                if not is_online and last_synced:
                    if isinstance(last_synced, datetime):
                        time_diff = (now - last_synced).total_seconds()
                        is_online = time_diff < online_threshold_seconds
                    elif isinstance(last_synced, str):
                        try:
                            last_synced_dt = datetime.fromisoformat(last_synced.replace("Z", "+00:00"))
                            time_diff = (now - last_synced_dt.replace(tzinfo=None)).total_seconds()
                            is_online = time_diff < online_threshold_seconds
                        except:
                            pass
                
                # Check recent activity (page views, interactions) - most accurate for real-time
                if not is_online:
                    recent_activity = recent_activity_map.get(user_id)
                    if recent_activity:
                        if isinstance(recent_activity, datetime):
                            time_diff = (now - recent_activity).total_seconds()
                            is_online = time_diff < online_threshold_seconds
                        elif isinstance(recent_activity, str):
                            try:
                                activity_dt = datetime.fromisoformat(recent_activity.replace("Z", "+00:00"))
                                time_diff = (now - activity_dt.replace(tzinfo=None)).total_seconds()
                                is_online = time_diff < online_threshold_seconds
                            except:
                                pass
                
                # Status: "Active" = currently online, "Inactive" = offline
                status = "Active" if is_online else "Inactive"
                
                # Use stored customer_id if available, else deterministic fallback
                profile_customer_id = None
                prof = profiles_map.get(user_id)
                if prof:
                    profile_customer_id = prof.get("customer_id")
                customer_id = profile_customer_id or user.get("customer_id")
                if not customer_id:
                    customer_id_num = hash(user_id) % 10000000
                    if customer_id_num < 0:
                        customer_id_num = abs(customer_id_num)
                    customer_id = f"CU-{1000000 + customer_id_num}"
                
                customers.append({
                    "id": user_id,
                    "customer_id": customer_id,
                    "name": name,
                    "email": email,
                    "bookings": bookings_count,
                    "reviews": reviews_count,
                    "total_spending": total_spending,
                    "status": status,
                    "is_online": is_online,
                })
            
            # Sort by total spending (descending)
            customers.sort(key=lambda x: x["total_spending"], reverse=True)
            
            total_pages = (total_users + page_size - 1) // page_size if total_users > 0 else 1
            
            return {
                "customers": customers,
                "total": total_users,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
            }
            
        except Exception as e:
            logger.error(f"Error in get_customers: {e}")
            raise

    @staticmethod
    async def get_customer_stats() -> Dict[str, Any]:
        """
        Get aggregated customer statistics.
        
        Returns:
            - total_customers: Total number of customers
            - active_customers: Customers active in last 30 days
            - vip_customers: Customers with 250+ bookings
            - avg_spending_last_month: Average spending in last month
            - total_customers_change: Percentage change from previous month
            - active_customers_change: Percentage change from previous month
            - avg_spending_change: Percentage change from previous month
        """
        try:
            users_collection = CustomerService._get_collection(CustomerService.USERS_COLLECTION)
            profiles_collection = CustomerService._get_collection(CustomerService.PROFILES_COLLECTION)
            bookings_collection = CustomerService._get_collection(CustomerService.BOOKINGS_COLLECTION)
            
            # Total customers
            total_customers = await users_collection.count_documents({})
            
            # Active customers (currently online - within last 2 minutes for real-time)
            # Check both users collection and customer_profiles collection for real-time activity
            two_minutes_ago = datetime.utcnow() - timedelta(minutes=2)
            
            # Get currently online users from users collection
            active_users_set = set()
            async for user in users_collection.find({
                "$or": [
                    {"last_seen": {"$gte": two_minutes_ago}},
                ]
            }, {"_id": 1}):
                active_users_set.add(str(user.get("_id", "")))
            
            # Get currently online users from customer_profiles collection
            # last_synced_at is updated when profile is accessed (most reliable real-time indicator)
            async for profile in profiles_collection.find({
                "$or": [
                    {"last_seen": {"$gte": two_minutes_ago}},
                    {"last_synced_at": {"$gte": two_minutes_ago}},
                ]
            }, {"user_id": 1}):
                user_id = profile.get("user_id")
                if user_id:
                    active_users_set.add(str(user_id))
            
            # Also check recent activity (page views, interactions) - most accurate
            activity_collection = CustomerService._get_collection("customer_profile_activity")
            async for activity in activity_collection.find({
                "timestamp": {"$gte": two_minutes_ago}
            }, {"user_id": 1}):
                user_id = activity.get("user_id")
                if user_id:
                    active_users_set.add(str(user_id))
            
            active_customers = len(active_users_set)
            
            # VIP customers (250+ bookings) - use aggregation for performance
            vip_pipeline = [
                {"$group": {
                    "_id": "$user_id",
                    "bookings_count": {"$sum": 1}
                }},
                {"$match": {"bookings_count": {"$gte": 250}}},
                {"$count": "vip_count"}
            ]
            vip_result = await bookings_collection.aggregate(vip_pipeline).to_list(length=1)
            vip_count = vip_result[0].get("vip_count", 0) if vip_result else 0
            
            # Average spending last month
            # Calculate based on bookings created in the last calendar month
            now = datetime.utcnow()
            first_day_this_month = datetime(now.year, now.month, 1)
            last_day_last_month = first_day_this_month - timedelta(days=1)
            first_day_last_month = datetime(last_day_last_month.year, last_day_last_month.month, 1)
            
            # Get all bookings from last month using aggregation
            last_month_pipeline = [
                {"$match": {
                    "created_at": {
                        "$gte": first_day_last_month,
                        "$lt": first_day_this_month
                    }
                }},
                {"$group": {
                    "_id": None,
                    "total_spending": {"$sum": {"$ifNull": ["$total_amount", 0]}},
                    "bookings_count": {"$sum": 1}
                }}
            ]
            last_month_result = await bookings_collection.aggregate(last_month_pipeline).to_list(length=1)
            
            if last_month_result and last_month_result[0].get("bookings_count", 0) > 0:
                total_spending_last_month = float(last_month_result[0].get("total_spending", 0))
                bookings_count_last_month = last_month_result[0].get("bookings_count", 0)
                avg_spending_last_month = total_spending_last_month / bookings_count_last_month
            else:
                # Fallback: calculate average from all bookings
                all_bookings_pipeline = [
                    {"$group": {
                        "_id": None,
                        "total_spending": {"$sum": {"$ifNull": ["$total_amount", 0]}},
                        "bookings_count": {"$sum": 1}
                    }}
                ]
                all_bookings_result = await bookings_collection.aggregate(all_bookings_pipeline).to_list(length=1)
                if all_bookings_result and all_bookings_result[0].get("bookings_count", 0) > 0:
                    total_spending_all = float(all_bookings_result[0].get("total_spending", 0))
                    bookings_count_all = all_bookings_result[0].get("bookings_count", 0)
                    avg_spending_last_month = total_spending_all / bookings_count_all
                else:
                    avg_spending_last_month = 0
            
            # Calculate changes from previous month
            first_day_two_months_ago = datetime(
                (first_day_last_month.year - 1) if first_day_last_month.month == 1 else first_day_last_month.year,
                (first_day_last_month.month - 1) if first_day_last_month.month > 1 else 12,
                1
            )
            
            # Total customers change
            total_customers_this_month = await users_collection.count_documents({
                "created_at": {"$gte": first_day_this_month}
            })
            total_customers_last_month = await users_collection.count_documents({
                "created_at": {
                    "$gte": first_day_last_month,
                    "$lt": first_day_this_month
                }
            })
            
            total_customers_change = 0.0
            if total_customers_last_month > 0:
                total_customers_change = (
                    (total_customers_this_month - total_customers_last_month) / total_customers_last_month * 100
                )
            
            # Active customers change - check both collections
            active_customers_last_month_set = set()
            # From users collection
            async for user in users_collection.find({
                "$or": [
                    {"last_seen": {"$gte": first_day_last_month - timedelta(days=30), "$lt": first_day_last_month}},
                    {"updated_at": {"$gte": first_day_last_month - timedelta(days=30), "$lt": first_day_last_month}},
                ]
            }, {"_id": 1}):
                active_customers_last_month_set.add(str(user.get("_id", "")))
            
            # From customer_profiles collection
            async for profile in profiles_collection.find({
                "$or": [
                    {"last_seen": {"$gte": first_day_last_month - timedelta(days=30), "$lt": first_day_last_month}},
                    {"updated_at": {"$gte": first_day_last_month - timedelta(days=30), "$lt": first_day_last_month}},
                    {"last_synced_at": {"$gte": first_day_last_month - timedelta(days=30), "$lt": first_day_last_month}},
                ]
            }, {"user_id": 1}):
                user_id = profile.get("user_id")
                if user_id:
                    active_customers_last_month_set.add(str(user_id))
            
            active_customers_last_month = len(active_customers_last_month_set)
            active_customers_change = 0.0
            if active_customers_last_month > 0:
                active_customers_change = (
                    (active_customers - active_customers_last_month) / active_customers_last_month * 100
                )
            
            # Average spending change
            two_months_ago_pipeline = [
                {"$match": {
                    "created_at": {
                        "$gte": first_day_two_months_ago,
                        "$lt": first_day_last_month
                    }
                }},
                {"$group": {
                    "_id": None,
                    "total_spending": {"$sum": {"$ifNull": ["$total_amount", 0]}},
                    "bookings_count": {"$sum": 1}
                }}
            ]
            two_months_ago_result = await bookings_collection.aggregate(two_months_ago_pipeline).to_list(length=1)
            
            avg_spending_two_months_ago = 0.0
            if two_months_ago_result and two_months_ago_result[0].get("bookings_count", 0) > 0:
                total_spending_two_months_ago = float(two_months_ago_result[0].get("total_spending", 0))
                bookings_count_two_months_ago = two_months_ago_result[0].get("bookings_count", 0)
                avg_spending_two_months_ago = total_spending_two_months_ago / bookings_count_two_months_ago
            
            avg_spending_change = 0.0
            if avg_spending_two_months_ago > 0:
                avg_spending_change = (
                    (avg_spending_last_month - avg_spending_two_months_ago) / avg_spending_two_months_ago * 100
                )
            
            return {
                "total_customers": total_customers,
                "active_customers": active_customers,
                "vip_customers": vip_count,
                "avg_spending_last_month": round(avg_spending_last_month, 2),
                "total_customers_change": round(total_customers_change, 1),
                "active_customers_change": round(active_customers_change, 1),
                "avg_spending_change": round(avg_spending_change, 1),
            }
            
        except Exception as e:
            logger.error(f"Error in get_customer_stats: {e}")
            raise

    @staticmethod
    async def get_customer_details(customer_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific customer.
        
        Returns:
            - customer: Customer basic info
            - stats: Total bookings, reviews, spending, average rating
            - bookings: List of recent bookings
        """
        try:
            users_collection = CustomerService._get_collection(CustomerService.USERS_COLLECTION)
            profiles_collection = CustomerService._get_collection(CustomerService.PROFILES_COLLECTION)
            bookings_collection = CustomerService._get_collection(CustomerService.BOOKINGS_COLLECTION)
            reviews_collection = CustomerService._get_collection(CustomerService.REVIEWS_COLLECTION)
            
            # Find user by ID - try both ObjectId and string
            user = None
            try:
                user = await users_collection.find_one({"_id": ObjectId(customer_id)})
            except:
                pass
            
            if not user:
                user = await users_collection.find_one({"user_id": customer_id})
            
            if not user:
                raise ValueError(f"Customer not found: {customer_id}")
            
            user_id = str(user.get("_id", ""))
            email = user.get("email", "")
            
            # Get customer profile
            profile = await profiles_collection.find_one({"user_id": user_id})
            if not profile:
                try:
                    profile = await profiles_collection.find_one({"_id": ObjectId(user_id)})
                except:
                    pass
            
            # Get name
            name = ""
            if profile:
                user_data = profile.get("user", {})
                if isinstance(user_data, dict):
                    first_name = user_data.get("first_name", "")
                    last_name = user_data.get("last_name", "")
                    name = user_data.get("name", "")
                    if not name:
                        name = f"{first_name} {last_name}".strip()
                if not name:
                    first_name = profile.get("first_name", "")
                    last_name = profile.get("last_name", "")
                    name = f"{first_name} {last_name}".strip()
            if not name:
                name = user.get("name", email.split("@")[0] if email else "Unknown")
            
            # Get bookings stats - use aggregation for consistency
            bookings_pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {
                    "_id": None,
                    "bookings_count": {"$sum": 1},
                    "total_spending": {"$sum": {"$ifNull": ["$total_amount", 0]}}
                }}
            ]
            bookings_result = await bookings_collection.aggregate(bookings_pipeline).to_list(length=1)
            bookings_count = bookings_result[0].get("bookings_count", 0) if bookings_result else 0
            total_spending = float(bookings_result[0].get("total_spending", 0)) if bookings_result else 0
            
            # Get bookings list
            bookings_cursor = bookings_collection.find({"user_id": user_id}).sort("created_at", -1).limit(20)
            bookings_list = await bookings_cursor.to_list(length=20)
            
            # Get reviews - use shared helper to ensure EXACT same logic as get_customers
            user_ids_list = [user_id]  # This is str(user.get("_id", "")) - same as get_customers
            reviews_stats = await CustomerService._get_reviews_count_for_users(user_ids_list)
            
            # Look up by user_id string (EXACT same as get_customers line 206)
            reviews_count = reviews_stats.get(user_id, 0)
            
            # Calculate avg_rating separately (get_customers doesn't calculate it, but we need it for details)
            reviews_collection = CustomerService._get_collection(CustomerService.REVIEWS_COLLECTION)
            user_ids_obj = [ObjectId(uid) for uid in user_ids_list if ObjectId.is_valid(uid)]
            reviews_match = {
                "$or": [
                    {"user_id": {"$in": user_ids_list}},
                    {"user_id": {"$in": user_ids_obj}}
                ]
            } if user_ids_obj else {"user_id": {"$in": user_ids_list}}
            
            avg_rating_pipeline = [
                {"$match": reviews_match},
                {"$group": {
                    "_id": None,
                    "avg_rating": {"$avg": "$rating"}
                }}
            ]
            avg_rating_result = await reviews_collection.aggregate(avg_rating_pipeline).to_list(length=1)
            avg_rating = avg_rating_result[0].get("avg_rating", 0) if avg_rating_result else 0
            
            # Format bookings
            formatted_bookings = []
            for booking in bookings_list:
                booking_id = str(booking.get("_id", ""))
                title = booking.get("title") or booking.get("tour_name", "Unknown Tour")
                start_date = booking.get("start_date")
                status = booking.get("status", "pending")
                total_amount = booking.get("total_amount", 0)
                
                # Format date
                date_str = "N/A"
                if start_date:
                    if isinstance(start_date, str):
                        try:
                            dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
                            date_str = dt.strftime("%b %d, %Y")
                        except:
                            date_str = start_date
                    elif isinstance(start_date, datetime):
                        date_str = start_date.strftime("%b %d, %Y")
                
                # Generate booking reference
                booking_ref_num = hash(booking_id) % 10000000
                if booking_ref_num < 0:
                    booking_ref_num = abs(booking_ref_num)
                booking_ref = f"TA-{1000000 + booking_ref_num}"
                
                formatted_bookings.append({
                    "id": booking_id,
                    "title": title,
                    "date": date_str,
                    "status": status.capitalize(),
                    "amount": float(total_amount),
                    "booking_ref": booking_ref,
                })
            
            # Generate customer ID
            customer_id_num = hash(user_id) % 10000000
            if customer_id_num < 0:
                customer_id_num = abs(customer_id_num)
            formatted_customer_id = f"CU-{1000000 + customer_id_num}"
            
            return {
                "customer": {
                    "id": user_id,
                    "customer_id": formatted_customer_id,
                    "name": name,
                    "email": email,
                },
                "stats": {
                    "total_bookings": bookings_count,
                    "total_reviews": reviews_count,
                    "total_spending": total_spending,
                    "avg_rating": round(avg_rating, 1),
                },
                "bookings": formatted_bookings,
            }
            
        except Exception as e:
            logger.error(f"Error in get_customer_details: {e}")
            raise

