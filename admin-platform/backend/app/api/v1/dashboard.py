from fastapi import APIRouter, Query, HTTPException
import logging
from typing import List, Dict, Any
from pydantic import BaseModel

from app.services.dashboard_service import DashboardService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class DashboardStatsResponse(BaseModel):
    total_bookings: int
    bookings_change: float
    total_revenue: float
    revenue_change: float
    cancellation_rate: float
    cancellation_change: float


class ChartDataPoint(BaseModel):
    month: str
    bookings: int
    revenue: float


class ChartDataResponse(BaseModel):
    data: List[ChartDataPoint]


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats():
    """
    Get dashboard statistics (bookings, revenue, cancellation rate)
    """
    try:
        stats = await DashboardService.get_dashboard_stats()
        return DashboardStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Error in get_dashboard_stats endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chart", response_model=ChartDataResponse)
async def get_bookings_revenue_chart(
    months: int = Query(12, ge=1, le=24, description="Number of months to include")
):
    """
    Get bookings and revenue chart data (time series)
    """
    try:
        chart_data = await DashboardService.get_bookings_revenue_chart(months=months)
        return ChartDataResponse(data=chart_data)
    except Exception as e:
        logger.error(f"Error in get_bookings_revenue_chart endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

