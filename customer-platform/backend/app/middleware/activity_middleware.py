"""
Activity Middleware
Updates last_seen timestamp when customers make API requests
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as StarletteResponse
from datetime import datetime
from app.core.database import get_database
from bson import ObjectId
import logging
import asyncio

logger = logging.getLogger(__name__)


class ActivityMiddleware(BaseHTTPMiddleware):
    """Middleware to track customer activity and update last_seen"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip for health checks and static files
        if request.url.path in ["/health", "/", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)
        
        # Get user_id from headers or query params if available
        user_id = None
        # Try to get from Authorization header or custom header
        auth_header = request.headers.get("Authorization")
        if auth_header:
            # Extract user_id from token if possible
            pass
        
        # Try to get from query params (some endpoints pass user_id)
        user_id = request.query_params.get("user_id") or request.query_params.get("customer_id")
        
        # Try to get from path params for profile endpoints
        if not user_id and "/profile/" in request.url.path:
            path_parts = request.url.path.split("/")
            try:
                profile_index = path_parts.index("profile")
                if profile_index + 1 < len(path_parts):
                    user_id = path_parts[profile_index + 1]
            except ValueError:
                pass
        
        # Update last_seen if user_id is available
        if user_id:
            try:
                db = get_database()
                now = datetime.utcnow()
                
                # Update in customer_profiles collection
                await db.customer_profiles.update_one(
                    {"user_id": user_id},
                    {
                        "$set": {
                            "last_seen": now,
                            "updated_at": now
                        },
                        "$setOnInsert": {
                            "user_id": user_id,
                            "created_at": now
                        }
                    },
                    upsert=False  # Don't create if doesn't exist
                )
                
                # Also update in users collection if user_id is ObjectId
                try:
                    user_obj_id = ObjectId(user_id)
                    await db.users.update_one(
                        {"_id": user_obj_id},
                        {
                            "$set": {
                                "last_seen": now,
                                "updated_at": now
                            }
                        }
                    )
                except:
                    # If user_id is not ObjectId format, try as string
                    await db.users.update_one(
                        {"user_id": user_id},
                        {
                            "$set": {
                                "last_seen": now,
                                "updated_at": now
                            }
                        }
                    )
            except Exception as e:
                # Don't fail the request if activity tracking fails
                logger.debug(f"Failed to update last_seen for user {user_id}: {e}")
        
        try:
            response = await call_next(request)
        except asyncio.CancelledError:
            # Client disconnected; avoid noisy stack traces
            return Response(status_code=499, content="Client Closed Request")
        return response

