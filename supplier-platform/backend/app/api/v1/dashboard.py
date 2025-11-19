from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.dashboard_service import SupplierDashboardService


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview")
async def get_dashboard_overview(current_user: User = Depends(get_current_user)):
    """
    Return supplier-specific metrics for the dashboard and finance pages.
    """
    try:
        overview = await SupplierDashboardService.get_overview(str(current_user.id))
        return overview
    except Exception as e:
        # Return default/empty overview if there's an error (e.g., MongoDB timeout)
        print(f"⚠️ Error getting dashboard overview for user {current_user.id}: {e}")
        # Return a default empty overview structure
        return {
            "metrics": {
                "available_balance": 0,
                "todays_bookings": 0,
                "tomorrows_bookings": 0,
                "todays_balance": 0,
            },
            "activity": {
                "percentages": {"published": 0, "draft": 0, "under_review": 0},
                "counts": {"published": 0, "draft": 0, "under_review": 0, "total": 0},
            },
            "finance": {
                "total_earning": 0,
                "pending_payout": 0,
                "loss_from_cancellation": 0,
                "paid_this_month": 0,
            },
            "products": {"total": 0, "cancellation_rate": 0, "average_rating": 0},
            "account_stability": {"positive": 100, "cancellation": 0, "negative": 0},
            "bookings": {"total": 0, "today": 0, "tomorrow": 0, "items": []},
        }

