from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import math
import logging

from app.schemas.product import AdminProductListResponse, RejectProductRequest
from app.services.product_approval_service import ProductApprovalService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/products", response_model=AdminProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    status: Optional[str] = Query(None, description="published | pending_review | rejected | draft | archived | All"),
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
):
    try:
        products, total = await ProductApprovalService.list_products(
            page=page,
            page_size=page_size,
            status=status,
            search=search,
            country=country,
            category=category,
        )
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        return {
            "products": products,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }
    except Exception as e:
        logger.error(f"Error listing products: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to list products")


@router.get("/products/pending/count")
async def pending_count():
    try:
        _, total = await ProductApprovalService.list_products(page=1, page_size=1, status="pending_review")
        return {"pending": total}
    except Exception as e:
        logger.error(f"Error counting pending products: {e}", exc_info=True)
        return {"pending": 0}


@router.post("/products/{product_id}/approve")
async def approve_product(product_id: str):
    try:
        ok = await ProductApprovalService.approve_product(product_id=product_id, approved_by="admin")
        if not ok:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving product {product_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to approve product")


@router.post("/products/{product_id}/reject")
async def reject_product(product_id: str, payload: RejectProductRequest):
    try:
        ok = await ProductApprovalService.reject_product(
            product_id=product_id,
            reason=payload.reason,
            rejected_by="admin",
        )
        if not ok:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting product {product_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to reject product")


