from __future__ import annotations

from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.dashboard_service import SupplierDashboardService


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


async def _get_supplier_user_id(supplier_code: str, current_user: User) -> str:
    """
    Get the user_id for a supplier_code, verifying the current user has access.
    Returns the user_id of the supplier account owner.
    """
    # If user is viewing their own supplier account
    if current_user.supplier_code == supplier_code:
        return str(current_user.id)
    
    # Check if user has access to this supplier_code
    if current_user.supplier_access and supplier_code in current_user.supplier_access:
        # Find the user who owns this supplier_code
        owner_user = await User.find_one(User.supplier_code == supplier_code)
        if owner_user:
            return str(owner_user.id)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Supplier account {supplier_code} not found"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You don't have access to supplier account {supplier_code}"
        )


@router.get("/overview")
async def get_dashboard_overview(
    supplier_code: Optional[str] = Query(None, description="Supplier code to view (defaults to your own)"),
    current_user: User = Depends(get_current_user)
):
    """
    Return supplier-specific metrics for the dashboard and finance pages.
    If supplier_code is provided, view that supplier's dashboard (if you have access).
    Otherwise, view your own supplier dashboard.
    """
    try:
        # Determine which supplier to view
        if supplier_code:
            # View another supplier's dashboard (must have access)
            supplier_user_id = await _get_supplier_user_id(supplier_code, current_user)
        else:
            # View own dashboard
            if not current_user.supplier_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You don't have a supplier account. Please specify a supplier_code."
                )
            supplier_user_id = str(current_user.id)
        
        overview = await SupplierDashboardService.get_overview(supplier_user_id)
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

