"""
Dashboard Service
Handles business logic for admin dashboard statistics
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any
from app.core.database import get_database
import logging

logger = logging.getLogger(__name__)


class DashboardService:
    BOOKINGS_COLLECTION = "customer_bookings"

    @staticmethod
    def _get_collection(name: str):
        """Get a MongoDB collection by name."""
        db = get_database()
        return db[name]

    @staticmethod
    async def get_dashboard_stats() -> Dict[str, Any]:
        """
        Get dashboard statistics:
        - Total bookings
        - Total earnings/revenue
        - Cancellation rate
        - Percentage changes for trends
        """
        try:
            bookings_collection = DashboardService._get_collection(DashboardService.BOOKINGS_COLLECTION)
            
            now = datetime.utcnow()
            this_month_start = datetime(now.year, now.month, 1)
            last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
            last_month_end = this_month_start - timedelta(seconds=1)
            
            # Total bookings (all time)
            total_bookings = await bookings_collection.count_documents({})
            
            # Total bookings this month
            bookings_this_month = await bookings_collection.count_documents({
                "created_at": {"$gte": this_month_start}
            })
            
            # Total bookings last month
            bookings_last_month = await bookings_collection.count_documents({
                "created_at": {"$gte": last_month_start, "$lte": last_month_end}
            })
            
            # Calculate bookings percentage change
            bookings_change = 0.0
            if bookings_last_month > 0:
                bookings_change = ((bookings_this_month - bookings_last_month) / bookings_last_month) * 100
            elif bookings_this_month > 0:
                bookings_change = 100.0
            
            # Total revenue (all time)
            revenue_pipeline = [
                {"$group": {
                    "_id": None,
                    "total_revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}}
                }}
            ]
            revenue_result = await bookings_collection.aggregate(revenue_pipeline).to_list(length=1)
            total_revenue = float(revenue_result[0].get("total_revenue", 0)) if revenue_result else 0.0
            
            # Revenue this month
            revenue_this_month_pipeline = [
                {"$match": {"created_at": {"$gte": this_month_start}}},
                {"$group": {
                    "_id": None,
                    "total_revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}}
                }}
            ]
            revenue_this_month_result = await bookings_collection.aggregate(revenue_this_month_pipeline).to_list(length=1)
            revenue_this_month = float(revenue_this_month_result[0].get("total_revenue", 0)) if revenue_this_month_result else 0.0
            
            # Revenue last month
            revenue_last_month_pipeline = [
                {"$match": {"created_at": {"$gte": last_month_start, "$lte": last_month_end}}},
                {"$group": {
                    "_id": None,
                    "total_revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}}
                }}
            ]
            revenue_last_month_result = await bookings_collection.aggregate(revenue_last_month_pipeline).to_list(length=1)
            revenue_last_month = float(revenue_last_month_result[0].get("total_revenue", 0)) if revenue_last_month_result else 0.0
            
            # Calculate revenue percentage change
            revenue_change = 0.0
            if revenue_last_month > 0:
                revenue_change = ((revenue_this_month - revenue_last_month) / revenue_last_month) * 100
            elif revenue_this_month > 0:
                revenue_change = 100.0
            
            # Cancellation rate
            # Count cancelled bookings (assuming status field or cancellation field exists)
            cancelled_bookings = await bookings_collection.count_documents({
                "$or": [
                    {"status": {"$in": ["cancelled", "canceled", "Cancelled", "Canceled"]}},
                    {"cancelled": True},
                    {"is_cancelled": True}
                ]
            })
            
            cancellation_rate = 0.0
            if total_bookings > 0:
                cancellation_rate = (cancelled_bookings / total_bookings) * 100
            
            # Cancellation rate last month
            cancelled_last_month = await bookings_collection.count_documents({
                "$and": [
                    {"created_at": {"$gte": last_month_start, "$lte": last_month_end}},
                    {"$or": [
                        {"status": {"$in": ["cancelled", "canceled", "Cancelled", "Canceled"]}},
                        {"cancelled": True},
                        {"is_cancelled": True}
                    ]}
                ]
            })
            
            bookings_last_month_for_cancel = await bookings_collection.count_documents({
                "created_at": {"$gte": last_month_start, "$lte": last_month_end}
            })
            
            cancellation_rate_last_month = 0.0
            if bookings_last_month_for_cancel > 0:
                cancellation_rate_last_month = (cancelled_last_month / bookings_last_month_for_cancel) * 100
            
            # Calculate cancellation rate change
            cancellation_change = cancellation_rate - cancellation_rate_last_month
            
            return {
                "total_bookings": total_bookings,
                "bookings_change": round(bookings_change, 1),
                "total_revenue": round(total_revenue, 2),
                "revenue_change": round(revenue_change, 1),
                "cancellation_rate": round(cancellation_rate, 1),
                "cancellation_change": round(cancellation_change, 1),
            }
        except Exception as e:
            logger.error(f"Error in get_dashboard_stats: {e}", exc_info=True)
            raise

    @staticmethod
    async def get_bookings_revenue_chart(months: int = 12) -> List[Dict[str, Any]]:
        """
        Get bookings and revenue data for chart (time series).
        Returns data grouped by month.
        """
        try:
            bookings_collection = DashboardService._get_collection(DashboardService.BOOKINGS_COLLECTION)
            
            now = datetime.utcnow()
            start_date = now - timedelta(days=months * 30)
            
            # Aggregate bookings and revenue by month
            pipeline = [
                {"$match": {"created_at": {"$gte": start_date}}},
                {"$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"}
                    },
                    "bookings": {"$sum": 1},
                    "revenue": {"$sum": {"$ifNull": ["$total_amount", 0]}}
                }},
                {"$sort": {"_id.year": 1, "_id.month": 1}}
            ]
            
            results = await bookings_collection.aggregate(pipeline).to_list(length=months)
            
            # Format data for chart
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            chart_data = []
            
            # Create a map of existing data
            data_map = {}
            for result in results:
                year = result["_id"]["year"]
                month = result["_id"]["month"]
                key = f"{year}-{month}"
                data_map[key] = {
                    "bookings": int(result.get("bookings", 0)),
                    "revenue": float(result.get("revenue", 0))
                }
            
            # Generate chart data for the last N months
            for i in range(months):
                date = now - timedelta(days=(months - i - 1) * 30)
                year = date.year
                month = date.month
                key = f"{year}-{month}"
                
                month_data = data_map.get(key, {"bookings": 0, "revenue": 0})
                
                chart_data.append({
                    "month": month_names[month - 1] if i % 2 == 0 else "",
                    "bookings": month_data["bookings"],
                    "revenue": round(month_data["revenue"], 0)
                })
            
            return chart_data
        except Exception as e:
            logger.error(f"Error in get_bookings_revenue_chart: {e}", exc_info=True)
            raise

