from fastapi import APIRouter, Query, HTTPException, Path, Response, status
from typing import Optional
from app.services.feedback_service import FeedbackService
from app.schemas.feedback import FeedbackListResponse, FeedbackItem, FeedbackStatsResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/feedbacks", response_model=FeedbackListResponse)
async def list_feedbacks(
    limit: int = Query(200, ge=1, le=500, description="Max feedback items"),
    search: Optional[str] = Query(None, description="Search by name, ref, text"),
    month: Optional[str] = Query(None, description="Filter by month (e.g., January or 1-12)"),
):
    try:
        logger.info(f"[list_feedbacks] Request received - limit: {limit}, search: {search}, month: {month}")
        
        feedbacks = await FeedbackService.list_feedbacks(limit=limit, search=search, month=month)
        logger.info(f"[list_feedbacks] Service returned {len(feedbacks)} feedbacks")
        
        # Validate and serialize feedbacks
        feedback_items = []
        for idx, f in enumerate(feedbacks):
            try:
                if not isinstance(f, dict):
                    logger.warning(f"[list_feedbacks] Feedback {idx} is not a dict: {type(f)}")
                    continue
                
                # Ensure all required fields are present
                if "id" not in f:
                    logger.warning(f"[list_feedbacks] Feedback {idx} missing 'id' field")
                    continue
                
                feedback_items.append(FeedbackItem(**f))
            except Exception as item_exc:
                logger.warning(f"[list_feedbacks] Failed to serialize feedback item {idx}: {item_exc}")
                logger.debug(f"[list_feedbacks] Item data: {f}")
                # Skip invalid items
                continue
        
        logger.info(f"[list_feedbacks] Returning {len(feedback_items)} valid feedbacks")
        return FeedbackListResponse(feedbacks=feedback_items, total=len(feedback_items))
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as exc:
        logger.error(f"[list_feedbacks] Error fetching feedbacks: {exc}", exc_info=True)
        import traceback
        logger.error(f"[list_feedbacks] Full traceback:\n{traceback.format_exc()}")
        # Return empty list instead of 500 error to prevent breaking frontend
        return FeedbackListResponse(feedbacks=[], total=0)


@router.get("/feedbacks/stats", response_model=FeedbackStatsResponse)
async def feedback_stats(month: Optional[str] = Query(None, description="Filter stats by month (e.g., January or 1-12)")):
    try:
        stats = await FeedbackService.get_stats(month=month)
        return FeedbackStatsResponse(**stats)
    except Exception as exc:
        logger.error(f"Error fetching feedback stats: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Unable to fetch feedback stats right now.")


@router.delete("/feedbacks/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    review_id: str = Path(..., description="Review ID to delete"),
):
    """
    Delete a review/feedback by ID.
    """
    try:
        logger.info(f"[delete_feedback] Request received for review_id: {review_id}")
        deleted = await FeedbackService.delete_feedback(review_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        logger.info(f"[delete_feedback] Successfully deleted review: {review_id}")
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"[delete_feedback] Error deleting feedback: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unable to delete feedback: {str(exc)}")

