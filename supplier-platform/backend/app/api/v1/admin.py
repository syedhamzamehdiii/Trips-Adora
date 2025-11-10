# app/api/v1/admin.py
"""
Admin endpoints for product approval.

TEMPORARY: This file is a placeholder for future admin panel functionality.
When admin panel is implemented, uncomment and implement these endpoints.

TODO: Implement admin endpoints for:
- Approving/rejecting products
- Viewing pending products
- Managing product status
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.models.user import User
from app.core.dependencies import get_current_user

# TODO: When admin panel is ready, uncomment this router
# router = APIRouter(prefix="/admin", tags=["admin"])

# TODO: When admin panel is ready, implement these endpoints:

# @router.get("/products/pending")
# async def get_pending_products(
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Get all products pending admin approval.
#     Admin only.
#     """
#     # TODO: Check if current_user is admin
#     # TODO: Return products with status PENDING_REVIEW
#     pass

# @router.post("/products/{product_id}/approve")
# async def approve_product(
#     product_id: str,
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Approve a product for publishing.
#     Admin only.
#     """
#     # TODO: Check if current_user is admin
#     # TODO: Update product status to PUBLISHED
#     # TODO: Set published_at timestamp
#     pass

# @router.post("/products/{product_id}/reject")
# async def reject_product(
#     product_id: str,
#     rejection_reason: Optional[str] = None,
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Reject a product.
#     Admin only.
#     """
#     # TODO: Check if current_user is admin
#     # TODO: Update product status to REJECTED
#     # TODO: Store rejection_reason
#     pass


