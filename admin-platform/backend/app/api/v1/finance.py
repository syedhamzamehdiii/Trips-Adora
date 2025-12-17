from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from app.services.finance_service import FinanceService
from app.schemas.finance import (
    FinanceSummaryResponse,
    FinanceTrendResponse,
    SupplierPayoutListResponse,
    SupplierPayoutHistoryListResponse,
    AdminCommissionListResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/finance/summary", response_model=FinanceSummaryResponse)
async def get_finance_summary():
    try:
        result = await FinanceService.get_summary()
        return result
    except Exception as e:
        logger.error(f"Error fetching finance summary: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch finance summary")


@router.get("/finance/trend", response_model=FinanceTrendResponse)
async def get_finance_trend(months: int = Query(6, ge=1, le=24)):
    try:
        points = await FinanceService.get_trend(months=months)
        return {"points": points}
    except Exception as e:
        logger.error(f"Error fetching finance trend: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch finance trend")


@router.get("/finance/supplier-payouts", response_model=SupplierPayoutListResponse)
async def get_supplier_payouts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    month: Optional[str] = Query(None, description="Month filter (e.g. October, Oct, 10, or All)"),
):
    try:
        result = await FinanceService.list_supplier_payouts(page=page, page_size=page_size, search=search, month=month)
        return result
    except Exception as e:
        logger.error(f"Error fetching supplier payouts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch supplier payouts")


@router.get("/finance/supplier-payout-history", response_model=SupplierPayoutHistoryListResponse)
async def get_supplier_payout_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    month: Optional[str] = Query(None, description="Month filter (e.g. October, Oct, 10, or All)"),
):
    try:
        result = await FinanceService.list_supplier_payout_history(page=page, page_size=page_size, search=search, month=month)
        return result
    except Exception as e:
        logger.error(f"Error fetching supplier payout history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch supplier payout history")


@router.get("/finance/admin-commission", response_model=AdminCommissionListResponse)
async def get_admin_commission(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    month: Optional[str] = Query(None, description="Month filter (e.g. October, Oct, 10, or All)"),
):
    try:
        result = await FinanceService.list_admin_commission(page=page, page_size=page_size, search=search, month=month)
        return result
    except Exception as e:
        logger.error(f"Error fetching admin commission: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch admin commission")


