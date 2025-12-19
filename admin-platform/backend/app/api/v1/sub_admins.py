from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
import secrets
import logging
from datetime import datetime, timedelta
from bson import ObjectId

from app.models.sub_admin import SubAdmin, SubAdminInviteRequest, SubAdminLoginRequest, SubAdminInviteResponse
from app.core.database import get_database
from app.core.config import settings
from app.core.dependencies import verify_admin_token

logger = logging.getLogger(__name__)
router = APIRouter()


def generate_invite_token() -> str:
    """Generate a secure random token for invite links"""
    return secrets.token_urlsafe(32)


@router.post("/invite", response_model=SubAdminInviteResponse)
async def invite_sub_admin(
    request: SubAdminInviteRequest,
    admin_user: dict = Depends(verify_admin_token)
):
    """Invite a sub-admin with specific permissions (Admin only)"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection unavailable")
        
        # Check if sub-admin already exists
        sub_admin = await SubAdmin.find_one(SubAdmin.email == request.email)
        if sub_admin:
            # Update permissions if exists
            sub_admin.permissions = request.permissions
            sub_admin.invite_token = generate_invite_token()
            sub_admin.invite_token_expires_at = datetime.utcnow() + timedelta(days=7)
            sub_admin.updated_at = datetime.utcnow()
            await sub_admin.save()
        else:
            # Create new sub-admin
            sub_admin = SubAdmin(
                email=request.email,
                permissions=request.permissions,
                invite_token=generate_invite_token(),
                invite_token_expires_at=datetime.utcnow() + timedelta(days=7),
                invited_at=datetime.utcnow()
            )
            await sub_admin.insert()
        
        # Generate invite link - direct access route
        frontend_url = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS and settings.CORS_ORIGINS[0] != "*" else "http://localhost:5175"
        invite_link = f"{frontend_url}/accept-invite?token={sub_admin.invite_token}&email={request.email}"
        
        # Send email with invite link automatically
        email_sent = False
        try:
            from app.services.email_service import EmailService
            email_sent = await EmailService.send_invite_email(
                to_email=request.email,
                invite_link=invite_link,
                permissions=request.permissions,
                personal_message=request.personal_message
            )
            if email_sent:
                logger.info(f"Invitation email sent successfully to {request.email}")
            else:
                logger.warning(f"Email not sent (SMTP not configured), but invite link generated: {invite_link}")
        except Exception as e:
            logger.error(f"Error sending invitation email: {e}", exc_info=True)
            # Don't fail the request if email fails, just log it
        
        logger.info(f"Invite link generated for {request.email}: {invite_link}")
        
        return SubAdminInviteResponse(
            email=request.email,
            invite_link=invite_link,
            message="Invitation email sent successfully" if email_sent else "Invitation created (email not configured, link available)"
        )
    except Exception as e:
        logger.error(f"Error inviting sub-admin: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to invite sub-admin: {str(e)}")


@router.get("/list")
async def list_sub_admins(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin_user: dict = Depends(verify_admin_token)
):
    """List all sub-admins (Admin only)"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection unavailable")
        
        skip = (page - 1) * page_size
        # Only show active sub-admins
        sub_admins = await SubAdmin.find(SubAdmin.is_active == True).skip(skip).limit(page_size).to_list()
        total = await SubAdmin.find(SubAdmin.is_active == True).count()
        
        # Convert to dict and ensure ID is string
        sub_admins_list = []
        for admin in sub_admins:
            admin_dict = admin.dict()
            # Ensure ID is a string
            if '_id' in admin_dict:
                admin_dict['id'] = str(admin_dict['_id'])
            elif 'id' in admin_dict:
                admin_dict['id'] = str(admin_dict['id'])
            sub_admins_list.append(admin_dict)
        
        return {
            "sub_admins": sub_admins_list,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    except Exception as e:
        logger.error(f"Error listing sub-admins: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to list sub-admins: {str(e)}")


@router.post("/login")
async def sub_admin_login(
    token: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    request: Optional[SubAdminLoginRequest] = None
):
    """Login for sub-admin - supports direct token-based access (no email/password needed)"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection unavailable")
        
        # Determine which email to use (query param takes precedence for direct access)
        login_email = email
        if not login_email and request:
            login_email = request.email
        
        if not login_email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Find sub-admin by email
        sub_admin = await SubAdmin.find_one(SubAdmin.email == login_email)
        
        if not sub_admin:
            raise HTTPException(status_code=404, detail="Sub-admin not found. Please contact admin for access.")
        
        if not sub_admin.is_active:
            raise HTTPException(status_code=403, detail="Your access has been revoked. Please contact admin.")
        
        # If token provided (direct access), validate it
        if token:
            if sub_admin.invite_token != token:
                raise HTTPException(status_code=403, detail="Invalid invite token")
            
            if sub_admin.invite_token_expires_at and sub_admin.invite_token_expires_at < datetime.utcnow():
                raise HTTPException(status_code=403, detail="Invite token has expired. Please request a new invite.")
            
            # Clear token after first use
            sub_admin.invite_token = None
            sub_admin.invite_token_expires_at = None
        
        # Update last login
        sub_admin.last_login = datetime.utcnow()
        await sub_admin.save()
        
        # Generate JWT token
        from app.core.security import create_access_token
        access_token = create_access_token(data={"sub": sub_admin.email, "type": "sub_admin"})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": sub_admin.email,
                "permissions": sub_admin.permissions,
                "role": "sub_admin"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in sub-admin login: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.put("/{sub_admin_id}/permissions")
async def update_sub_admin_permissions(
    sub_admin_id: str,
    permissions: dict,
    admin_user: dict = Depends(verify_admin_token)
):
    """Update sub-admin permissions (Admin only) - Real-time update"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection unavailable")
        
        # Try to find by ObjectId first, then by email
        sub_admin = None
        if ObjectId.is_valid(sub_admin_id):
            sub_admin = await SubAdmin.get(sub_admin_id)
        else:
            # Try finding by email
            sub_admin = await SubAdmin.find_one(SubAdmin.email == sub_admin_id)
        
        if not sub_admin:
            raise HTTPException(status_code=404, detail="Sub-admin not found")
        
        # Validate permissions structure - ensure only valid permissions are set
        valid_permissions = {
            "productsManagement": bool(permissions.get("productsManagement", False)),
            "customersFeedbacks": bool(permissions.get("customersFeedbacks", False)),
            "finance": bool(permissions.get("finance", False))
        }
        
        # Update permissions immediately in database
        sub_admin.permissions = valid_permissions
        sub_admin.updated_at = datetime.utcnow()
        await sub_admin.save()
        
        logger.info(f"Admin {admin_user.get('sub')} updated permissions for sub-admin {sub_admin.email}: {valid_permissions}")
        
        return {
            "message": "Permissions updated successfully",
            "sub_admin": sub_admin.dict(),
            "updated_at": sub_admin.updated_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating permissions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update permissions: {str(e)}")


@router.delete("/{sub_admin_id}")
async def delete_sub_admin(
    sub_admin_id: str,
    admin_user: dict = Depends(verify_admin_token)
):
    """Delete or deactivate a sub-admin (Admin only)"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection unavailable")
        
        # Try to find by ObjectId first, then by email
        sub_admin = None
        try:
            if ObjectId.is_valid(sub_admin_id):
                sub_admin = await SubAdmin.get(sub_admin_id)
            else:
                # Try finding by email
                sub_admin = await SubAdmin.find_one(SubAdmin.email == sub_admin_id)
        except Exception as e:
            logger.warning(f"Error finding sub-admin by ID, trying email: {e}")
            # Try finding by email as fallback
            sub_admin = await SubAdmin.find_one(SubAdmin.email == sub_admin_id)
        
        if not sub_admin:
            raise HTTPException(status_code=404, detail="Sub-admin not found")
        
        # Deactivate instead of deleting (for audit trail)
        sub_admin.is_active = False
        sub_admin.updated_at = datetime.utcnow()
        await sub_admin.save()
        
        logger.info(f"Admin {admin_user.get('sub')} deactivated sub-admin {sub_admin.email}")
        
        return {"message": "Sub-admin deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting sub-admin: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete sub-admin: {str(e)}")

