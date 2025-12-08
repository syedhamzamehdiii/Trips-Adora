"""
Suppliers API Routes
Handles HTTP requests for supplier management
"""
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.supplier_service import SupplierService
from app.schemas.supplier import SupplierListResponse, SupplierStatsResponse, SupplierDetailResponse, ProductListResponse, SupplierOnboardingListResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class OnboardingStatusUpdate(BaseModel):
    status: str
    rejection_reason: Optional[str] = None


@router.get("/suppliers", response_model=SupplierListResponse)
async def get_active_suppliers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or email")
):
    """
    Get all active suppliers with pagination
    
    - **page**: Page number (starts from 1)
    - **page_size**: Number of items per page (max 100)
    - **search**: Optional search term for filtering by name or email
    """
    try:
        result = await SupplierService.get_active_suppliers(
            page=page,
            page_size=page_size,
            search=search
        )
        return SupplierListResponse(**result)
    except Exception as e:
        logger.error(f"Error in get_active_suppliers endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suppliers/onboardings", response_model=SupplierOnboardingListResponse)
async def get_pending_onboardings(
    status: Optional[str] = Query(None, description="Filter by status (pending, approved, rejected)")
):
    """Get supplier onboarding submissions for admin review"""
    try:
        result = await SupplierService.get_pending_onboardings(status=status)
        return result
    except Exception as e:
        logger.error(f"Error in get_pending_onboardings endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/suppliers/onboardings/{onboarding_id}")
async def patch_onboarding_status(onboarding_id: str, update: OnboardingStatusUpdate):
    """Approve or reject a supplier onboarding"""
    try:
        result = await SupplierService.update_onboarding_status(
            onboarding_id,
            status=update.status,
            rejection_reason=update.rejection_reason
        )
        return result
    except Exception as e:
        logger.error(f"Error updating onboarding status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suppliers/stats", response_model=SupplierStatsResponse)
async def get_supplier_stats():
    """
    Get supplier statistics
    
    Returns:
    - Total suppliers count
    - Active suppliers count
    - Verification pending count
    - Total earnings
    """
    try:
        stats = await SupplierService.get_supplier_stats()
        return stats
    except Exception as e:
        logger.error(f"Error in get_supplier_stats endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suppliers/{supplier_code}", response_model=SupplierDetailResponse)
async def get_supplier_detail(supplier_code: str):
    """
    Get detailed supplier profile by supplier_code.
    """
    try:
        result = await SupplierService.get_supplier_detail(supplier_code)
        return result
    except Exception as e:
        logger.error(f"Error in get_supplier_detail endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suppliers/{supplier_code}/products", response_model=ProductListResponse)
async def get_supplier_products(
    supplier_code: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """
    Get published products for a supplier.
    """
    try:
        result = await SupplierService.get_supplier_products(supplier_code, page, page_size)
        return result
    except Exception as e:
        logger.error(f"Error in get_supplier_products endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
