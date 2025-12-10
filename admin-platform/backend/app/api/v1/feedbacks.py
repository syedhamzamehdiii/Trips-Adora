from fastapi import APIRouter, Query, HTTPException
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
        feedbacks = await FeedbackService.list_feedbacks(limit=limit, search=search, month=month)
        return FeedbackListResponse(feedbacks=[FeedbackItem(**f) for f in feedbacks], total=len(feedbacks))
    except Exception as exc:
        logger.error(f"Error fetching feedbacks: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Unable to fetch feedbacks right now.")


@router.get("/feedbacks/stats", response_model=FeedbackStatsResponse)
async def feedback_stats(month: Optional[str] = Query(None, description="Filter stats by month (e.g., January or 1-12)")):
    try:
        stats = await FeedbackService.get_stats(month=month)
        return FeedbackStatsResponse(**stats)
    except Exception as exc:
        logger.error(f"Error fetching feedback stats: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Unable to fetch feedback stats right now.")

