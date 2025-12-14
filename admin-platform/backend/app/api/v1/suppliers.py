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


class BlockSupplierRequest(BaseModel):
    reason: Optional[str] = None


# IMPORTANT: /suppliers/blocked must be defined BEFORE /suppliers/{supplier_code}
# Otherwise FastAPI will match "blocked" as a supplier_code parameter
@router.get("/suppliers/blocked", response_model=SupplierListResponse)
async def list_blocked_suppliers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or email")
):
    """
    List blocked suppliers with pagination/search.
    """
    try:
        result = await SupplierService.get_blocked_suppliers(page=page, page_size=page_size, search=search)
        # Ensure result is a dict with required fields
        if not isinstance(result, dict):
            result = {"suppliers": [], "total": 0, "page": page, "page_size": page_size, "total_pages": 0}
        return SupplierListResponse(**result)
    except Exception as e:
        logger.error(f"Error listing blocked suppliers: {e}", exc_info=True)
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        # Return empty response instead of 500 to prevent frontend errors
        return SupplierListResponse(
            suppliers=[],
            total=0,
            page=page,
            page_size=page_size,
            total_pages=0
        )


@router.post("/suppliers/{supplier_code}/block")
async def block_supplier(supplier_code: str, payload: BlockSupplierRequest):
    """
    Block a supplier. Sets is_active=False and stores block metadata.
    """
    try:
        result = await SupplierService.block_supplier(supplier_code, payload.reason)
        return {"message": "Supplier blocked", "supplier_id": result.get("supplier_id"), "blocked_reason": result.get("blocked_reason")}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error blocking supplier {supplier_code}: {e}")
        raise HTTPException(status_code=500, detail="Failed to block supplier")


@router.post("/suppliers/{supplier_code}/unblock")
async def unblock_supplier(supplier_code: str):
    """
    Unblock a supplier. Sets is_active=True and clears block metadata.
    """
    try:
        result = await SupplierService.unblock_supplier(supplier_code)
        return {"message": "Supplier unblocked", "supplier_id": result.get("supplier_id")}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error unblocking supplier {supplier_code}: {e}")
        raise HTTPException(status_code=500, detail="Failed to unblock supplier")


@router.get("/suppliers/{supplier_code}", response_model=SupplierDetailResponse)
async def get_supplier_detail(supplier_code: str):
    """
    Get detailed supplier profile by supplier_code.
    """
    try:
        result = await SupplierService.get_supplier_detail(supplier_code)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
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
