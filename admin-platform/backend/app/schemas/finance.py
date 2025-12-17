from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class FinanceSummaryResponse(BaseModel):
    total_revenue: float
    revenue_change: float
    total_commission: float
    commission_change: float
    total_supplier_payouts: float
    payouts_change: float


class FinanceTrendPoint(BaseModel):
    month: str  # e.g. "Oct"
    commission: float
    net_earnings: float
    revenue: float


class FinanceTrendResponse(BaseModel):
    points: List[FinanceTrendPoint]


class SupplierPayoutRow(BaseModel):
    supplier_id: str
    supplier_code: Optional[str] = None
    month: str  # e.g. "Oct"
    product_id: Optional[str] = None
    product_name: str
    bookings: int
    earnings: float
    commission: float
    payout: float


class SupplierPayoutListResponse(BaseModel):
    rows: List[SupplierPayoutRow]
    total: int
    page: int
    page_size: int
    total_pages: int


class SupplierPayoutHistoryRow(BaseModel):
    date: str  # e.g. "2025-12-05"
    supplier_id: str
    supplier_code: Optional[str] = None
    product: str
    reference: Optional[str] = None
    bookings: int
    earnings: float
    commission: float
    dueAmount: float
    payout: float


class SupplierPayoutHistoryListResponse(BaseModel):
    rows: List[SupplierPayoutHistoryRow]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdminCommissionRow(BaseModel):
    month: str  # e.g. "Oct"
    total_earnings: float
    commission: float
    supplier_payouts: float
    bank: Optional[str] = None
    payout_status: Optional[str] = None
    wallet_received: Optional[bool] = None


class AdminCommissionListResponse(BaseModel):
    rows: List[AdminCommissionRow]
    total: int
    page: int
    page_size: int
    total_pages: int


