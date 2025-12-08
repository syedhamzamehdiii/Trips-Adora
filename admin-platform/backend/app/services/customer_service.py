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
    async def get_customers(
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get paginated list of customers with aggregated stats.
        
        Returns:
            - customers: List of customer objects with stats
            - total: Total count of customers
            - page: Current page
            - page_size: Items per page
            - total_pages: Total number of pages
        """
        try:
            skip = (page - 1) * page_size
            
            # Get all collections
            users_collection = CustomerService._get_collection(CustomerService.USERS_COLLECTION)
            profiles_collection = CustomerService._get_collection(CustomerService.PROFILES_COLLECTION)
            bookings_collection = CustomerService._get_collection(CustomerService.BOOKINGS_COLLECTION)
            reviews_collection = CustomerService._get_collection(CustomerService.REVIEWS_COLLECTION)
            
            # Build search query for users
            user_search_query = {}
            if search:
                search_regex = {"$regex": search, "$options": "i"}
                user_search_query = {"email": search_regex}
            
            # Get all users (customers) - get all first, then filter by search if needed
            users_cursor = users_collection.find(user_search_query)
            all_users = await users_cursor.to_list(length=None)
            
            # If search is provided, also search in profiles and match with users
            matching_user_ids = set()
            if search:
                search_regex = {"$regex": search, "$options": "i"}
                profile_search_query = {
                    "$or": [
                        {"user.first_name": search_regex},
                        {"user.last_name": search_regex},
                        {"user.name": search_regex},
                        {"user.email": search_regex},
                    ]
                }
                matching_profiles = await profiles_collection.find(profile_search_query).to_list(length=None)
                for profile in matching_profiles:
                    user_id = profile.get("user_id")
                    if user_id:
                        matching_user_ids.add(str(user_id))
                
                # Filter users to only those matching search
                all_users = [
                    u for u in all_users 
                    if str(u.get("_id", "")) in matching_user_ids or 
                       (search.lower() in (u.get("email", "") or "").lower())
                ]
            
            # Get total count before pagination
            total_users = len(all_users)
            
            # Apply pagination
            paginated_users = all_users[skip:skip + page_size]
            
            # Aggregate stats for each user
            customers = []
            for user in paginated_users:
                user_id = str(user.get("_id", ""))
                email = user.get("email", "")
                
                # Get customer profile
                profile = await profiles_collection.find_one({"user_id": user_id})
                if not profile:
                    # Try with ObjectId
                    try:
                        profile = await profiles_collection.find_one({"_id": ObjectId(user_id)})
                    except:
                        pass
                
                # Get name from profile or user
                name = ""
                if profile:
                    user_data = profile.get("user", {})
                    if isinstance(user_data, dict):
                        first_name = user_data.get("first_name", "")
                        last_name = user_data.get("last_name", "")
                        name = user_data.get("name", "")
                        if not name:
                            name = f"{first_name} {last_name}".strip()
                    # Fallback to direct fields
                    if not name:
                        first_name = profile.get("first_name", "")
                        last_name = profile.get("last_name", "")
                        name = f"{first_name} {last_name}".strip()
                if not name:
                    name = user.get("name", email.split("@")[0] if email else "Unknown")
                
                # Get bookings stats
                bookings_query = {"user_id": user_id}
                bookings_count = await bookings_collection.count_documents(bookings_query)
                
                # Calculate total spending
                bookings_cursor = bookings_collection.find(bookings_query)
                bookings_list = await bookings_cursor.to_list(length=None)
                total_spending = sum(
                    float(b.get("total_amount", 0)) 
                    for b in bookings_list 
                    if b.get("total_amount")
                )
                
                # Get reviews count
                reviews_query = {"user_id": user_id}
                reviews_count = await reviews_collection.count_documents(reviews_query)
                
                # Determine status (online if last_seen within last 5 minutes)
                last_seen = None
                if profile:
                    user_data = profile.get("user", {})
                    if isinstance(user_data, dict):
                        last_seen = user_data.get("last_seen")
                    if not last_seen:
                        last_seen = profile.get("last_seen")
                if not last_seen:
                    last_seen = user.get("last_seen")
                is_online = False
                if last_seen:
                    if isinstance(last_seen, datetime):
                        time_diff = datetime.utcnow() - last_seen
                        is_online = time_diff.total_seconds() < 300  # 5 minutes
                    elif isinstance(last_seen, str):
                        try:
                            last_seen_dt = datetime.fromisoformat(last_seen.replace("Z", "+00:00"))
                            time_diff = datetime.utcnow() - last_seen_dt.replace(tzinfo=None)
                            is_online = time_diff.total_seconds() < 300
                        except:
                            pass
                
                status = "Active" if is_online else "Inactive"
                
                # Generate customer ID (format: CU-{padded_number})
                # Use a hash of user_id to generate consistent ID
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
            
            # Active customers (last seen within 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            active_query = {
                "$or": [
                    {"last_seen": {"$gte": thirty_days_ago}},
                    {"updated_at": {"$gte": thirty_days_ago}},
                ]
            }
            active_customers = await users_collection.count_documents(active_query)
            
            # VIP customers (250+ bookings)
            # Get all users and check their booking counts
            all_users = await users_collection.find({}).to_list(length=None)
            vip_count = 0
            for user in all_users:
                user_id = str(user.get("_id", ""))
                bookings_count = await bookings_collection.count_documents({"user_id": user_id})
                if bookings_count >= 250:
                    vip_count += 1
            
            # Average spending last month
            now = datetime.utcnow()
            first_day_this_month = datetime(now.year, now.month, 1)
            last_day_last_month = first_day_this_month - timedelta(days=1)
            first_day_last_month = datetime(last_day_last_month.year, last_day_last_month.month, 1)
            
            last_month_bookings = await bookings_collection.find({
                "created_at": {
                    "$gte": first_day_last_month,
                    "$lt": first_day_this_month
                }
            }).to_list(length=None)
            
            total_spending_last_month = sum(
                float(b.get("total_amount", 0))
                for b in last_month_bookings
                if b.get("total_amount")
            )
            bookings_count_last_month = len(last_month_bookings)
            avg_spending_last_month = (
                total_spending_last_month / bookings_count_last_month
                if bookings_count_last_month > 0
                else 0
            )
            
            # Calculate changes from previous month
            # For simplicity, we'll calculate based on last 2 months
            first_day_two_months_ago = datetime(
                (first_day_last_month.year - 1) if first_day_last_month.month == 1 else first_day_last_month.year,
                (first_day_last_month.month - 1) if first_day_last_month.month > 1 else 12,
                1
            )
            
            # Total customers change (compare this month vs last month)
            # For now, we'll use a simple calculation
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
            
            # Active customers change
            active_customers_last_month = await users_collection.count_documents({
                "$or": [
                    {"last_seen": {"$gte": first_day_last_month - timedelta(days=30), "$lt": first_day_last_month}},
                    {"updated_at": {"$gte": first_day_last_month - timedelta(days=30), "$lt": first_day_last_month}},
                ]
            })
            active_customers_change = 0.0
            if active_customers_last_month > 0:
                active_customers_change = (
                    (active_customers - active_customers_last_month) / active_customers_last_month * 100
                )
            
            # Average spending change
            two_months_ago_bookings = await bookings_collection.find({
                "created_at": {
                    "$gte": first_day_two_months_ago,
                    "$lt": first_day_last_month
                }
            }).to_list(length=None)
            
            total_spending_two_months_ago = sum(
                float(b.get("total_amount", 0))
                for b in two_months_ago_bookings
                if b.get("total_amount")
            )
            bookings_count_two_months_ago = len(two_months_ago_bookings)
            avg_spending_two_months_ago = (
                total_spending_two_months_ago / bookings_count_two_months_ago
                if bookings_count_two_months_ago > 0
                else 0
            )
            
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

