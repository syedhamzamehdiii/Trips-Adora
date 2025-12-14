from fastapi import APIRouter, Query, HTTPException
import logging
from typing import List, Dict, Any, Optional
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
    month: Optional[str] = None
    country: Optional[str] = None
    bookings: int
    revenue: float
    
    class Config:
        # Allow either month or country to be present
        extra = "allow"  # Allow extra fields
        schema_extra = {
            "example": {
                "month": "Jan",
                "bookings": 10,
                "revenue": 5000.0
            }
        }


class ChartDataResponse(BaseModel):
    data: List[ChartDataPoint]


class CountryDataPoint(BaseModel):
    country: str
    bookings: int


class CountryDataResponse(BaseModel):
    countries: List[CountryDataPoint]


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


@router.get("/countries", response_model=CountryDataResponse)
async def get_top_countries(
    month: Optional[str] = Query(None, description="Month name (e.g., 'January', 'February')")
):
    """
    Get top countries by bookings for a specific month
    """
    try:
        countries = await DashboardService.get_top_countries_by_month(month_name=month)
        return CountryDataResponse(countries=countries)
    except Exception as e:
        logger.error(f"Error in get_top_countries endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chart-by-country", response_model=ChartDataResponse)
async def get_bookings_revenue_by_country():
    """
    Get bookings and revenue chart data grouped by country
    """
    try:
        chart_data = await DashboardService.get_bookings_revenue_by_country()
        return ChartDataResponse(data=chart_data)
    except Exception as e:
        logger.error(f"Error in get_bookings_revenue_by_country endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

