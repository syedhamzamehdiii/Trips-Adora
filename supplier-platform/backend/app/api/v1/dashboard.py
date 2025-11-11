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
    overview = await SupplierDashboardService.get_overview(str(current_user.id))
    return overview

