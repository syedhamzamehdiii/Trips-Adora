from __future__ import annotations

from fastapi import APIRouter, HTTPException, Path, Response, status

from app.schemas.review import ReviewCreateRequest, ReviewListResponse, ReviewResponse
from app.services.review_service import ReviewService
from app.core.exceptions import DatabaseUnavailableError
from pymongo.errors import AutoReconnect, ServerSelectionTimeoutError


router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get(
    "/{user_id}",
    response_model=ReviewListResponse,
    summary="List reviews submitted by the customer",
)
async def list_reviews_for_user(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
) -> ReviewListResponse:
    try:
        reviews = await ReviewService.list_reviews(user_id)
    except DatabaseUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )
    return ReviewListResponse(reviews=reviews)


@router.post(
    "/{user_id}",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new review for a product/booking",
)
async def create_review_for_user(
    payload: ReviewCreateRequest,
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
) -> ReviewResponse:
    try:
        review = await ReviewService.create_review(user_id, payload.dict(exclude_unset=True))
    except DatabaseUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )
    return ReviewResponse(**review)


@router.delete(
    "/{user_id}/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a review submitted by the customer",
)
async def delete_review_for_user(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
    review_id: str = Path(..., description="Review identifier"),
) -> Response:
    try:
        deleted = await ReviewService.delete_review(user_id, review_id)
    except DatabaseUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        )
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

