"""
Supplier Onboarding API Endpoints
Handles supplier registration/onboarding data submission and verification
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from app.models.supplier_onboarding import SupplierOnboarding, BusinessType, OnboardingStatus
from app.models.user import User, UserRole
from app.models.account_settings import SupplierAccountSettings
from app.core.dependencies import get_current_user, get_current_user_optional
from app.schemas.supplier_onboarding import (
    SupplierOnboardingCreate,
    SupplierOnboardingResponse,
    SupplierOnboardingUpdate
)
from app.services.email_service import (
    send_supplier_onboarding_approved_email,
    send_supplier_onboarding_rejected_email,
)
import logging
from datetime import datetime
from bson import ObjectId

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/supplier-onboarding", tags=["Supplier Onboarding"])

def _clean_str(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    if not isinstance(v, str):
        return v  # type: ignore[return-value]
    s = v.strip()
    return s if s else None

def _join_non_empty(parts: List[Optional[str]], sep: str = ", ") -> Optional[str]:
    cleaned = [_clean_str(p) for p in parts]
    cleaned = [p for p in cleaned if p]
    return sep.join(cleaned) if cleaned else None

def _score_onboarding(o: SupplierOnboarding) -> float:
    """
    Sort key for choosing the best onboarding per email.
    Prefer the most recently updated/submitted/created.
    """
    try:
        dt = getattr(o, "updated_at", None) or getattr(o, "submitted_at", None) or getattr(o, "created_at", None)
        if dt:
            return dt.timestamp()
    except Exception:
        pass
    return 0.0

def _dedupe_onboardings(onboardings: List[SupplierOnboarding]) -> List[SupplierOnboarding]:
    """
    If the DB already contains duplicates for the same email, only show the latest.
    This prevents admin seeing 2 requests for the same supplier.
    """
    best_by_email: dict[str, SupplierOnboarding] = {}
    for o in onboardings:
        email_key = (getattr(o, "email", "") or "").lower().strip()
        if not email_key:
            # keep as-is (rare, but don't drop)
            best_by_email[str(getattr(o, "id", ""))] = o
            continue
        prev = best_by_email.get(email_key)
        if not prev or _score_onboarding(o) >= _score_onboarding(prev):
            best_by_email[email_key] = o
    return list(best_by_email.values())


@router.post("", response_model=SupplierOnboardingResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier_onboarding(
    data: SupplierOnboardingCreate
):
    """
    Submit supplier onboarding/registration data
    
    This endpoint accepts all registration data including:
    - Business type and employee count
    - Business identity (for non-solo businesses)
    - ID verification details
    - All document URLs (uploaded to Cloudinary)
    """
    try:
        # Normalize email to lowercase to prevent duplicates
        normalized_email = data.email.lower().strip() if data.email else None
        if not normalized_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        # Check if onboarding already exists for this email
        # First try exact match with normalized email
        existing = await SupplierOnboarding.find_one(SupplierOnboarding.email == normalized_email)
        
        # If not found, also check case-insensitive (for existing records with different case)
        if not existing:
            # Get all onboardings and check case-insensitively (fallback for existing data)
            all_onboardings = await SupplierOnboarding.find_all().to_list()
            for onboarding in all_onboardings:
                if onboarding.email and onboarding.email.lower().strip() == normalized_email:
                    existing = onboarding
                    logger.warning(f"Found existing onboarding {existing.id} with different case email: {onboarding.email} -> {normalized_email}")
                    break
        
        # Try to attach user_id if user exists (helps admin panel enrich data)
        existing_user = await User.find_one(User.email == normalized_email)

        if existing:
            # If already approved, don't allow overwriting the onboarding
            if existing.status == OnboardingStatus.APPROVED:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Supplier onboarding is already approved."
                )

            # If rejected, resubmission should reset status back to pending
            if existing.status == OnboardingStatus.REJECTED:
                existing.status = OnboardingStatus.PENDING
                existing.rejection_reason = None
                existing.reviewed_at = None
                existing.reviewed_by = None

            # Update existing onboarding instead of creating duplicate
            logger.warning(
                f"Duplicate prevention: Found existing onboarding {existing.id} for email: {normalized_email}, updating instead of creating duplicate"
            )
            payload = data.dict(exclude_unset=True)
            for key, value in payload.items():
                if key == "email":
                    value = normalized_email
                if isinstance(value, str):
                    value = _clean_str(value)
                setattr(existing, key, value)

            now = datetime.utcnow()
            existing.updated_at = now
            existing.submitted_at = now
            if existing_user and not existing.user_id:
                existing.user_id = str(existing_user.id)
            # best-effort fill name/email if missing
            if existing_user:
                existing.user_email = existing.user_email or existing_user.email
                existing.user_name = existing.user_name or existing_user.full_name
            await existing.save()
            onboarding = existing
            logger.info(f"Updated existing onboarding {onboarding.id} for email: {normalized_email}")
        else:
            # Create new onboarding with normalized email
            onboarding_data = data.dict()
            onboarding_data["email"] = normalized_email
            # Normalize empty strings to None so admin UI can cleanly fallback to profile/settings
            for k, v in list(onboarding_data.items()):
                if isinstance(v, str):
                    onboarding_data[k] = _clean_str(v)
            if existing_user:
                onboarding_data["user_id"] = str(existing_user.id)
                onboarding_data["user_email"] = onboarding_data.get("user_email") or existing_user.email
                onboarding_data["user_name"] = onboarding_data.get("user_name") or existing_user.full_name
            onboarding = SupplierOnboarding(**onboarding_data)
            try:
                await onboarding.insert()
                logger.info(f"Created new onboarding {onboarding.id} for email: {normalized_email}")
            except Exception as insert_error:
                # If insert fails due to duplicate (race condition), try to find and update
                logger.warning(f"Insert failed, checking for duplicate: {insert_error}")
                existing = await SupplierOnboarding.find_one(SupplierOnboarding.email == normalized_email)
                if existing:
                    logger.warning(f"Race condition detected: Found duplicate after failed insert, updating existing {existing.id}")
                    for key, value in data.dict(exclude_unset=True).items():
                        if key == 'email' and value:
                            value = value.lower().strip()
                        setattr(existing, key, value)
                    existing.updated_at = datetime.utcnow()
                    await existing.save()
                    onboarding = existing
                else:
                    raise
        
        # Return the onboarding data
        return SupplierOnboardingResponse(
            id=str(onboarding.id),
            email=onboarding.email,
            business_type=onboarding.business_type,
            employee_count=onboarding.employee_count,
            status=onboarding.status,
            submitted_at=onboarding.submitted_at,
            created_at=onboarding.created_at
        )
    except Exception as e:
        logger.error(f"Error creating supplier onboarding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit onboarding data: {str(e)}"
        )


@router.get("/{onboarding_id}", response_model=dict)
async def get_supplier_onboarding(
    onboarding_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get supplier onboarding data by ID
    Users can only view their own onboarding data
    """
    try:
        onboarding = await SupplierOnboarding.get(onboarding_id)
        
        if not onboarding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Onboarding data not found"
            )
        
        # Check if user has access (own data or admin)
        if current_user.role != UserRole.ADMIN:
            if onboarding.user_id and onboarding.user_id != str(current_user.id):
                if onboarding.email != current_user.email:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied"
                    )
        
        # Serialize ObjectIds to strings
        result = onboarding.dict()
        result["id"] = str(onboarding.id) if getattr(onboarding, "id", None) else None
        result["user_id"] = str(onboarding.user_id) if getattr(onboarding, "user_id", None) else None
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting supplier onboarding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get onboarding data: {str(e)}"
        )


@router.get("", response_model=List[dict])
async def list_supplier_onboardings(
    status_filter: Optional[OnboardingStatus] = None,
    current_user: User = Depends(get_current_user)
):
    """
    List supplier onboardings
    - Users can only see their own
    - Admins can see all with optional status filter
    """
    try:
        if current_user.role == UserRole.ADMIN:
            # Admin can see all
            query = {}
            if status_filter:
                query["status"] = status_filter
            onboardings = await SupplierOnboarding.find(query).to_list()
        else:
            # Regular users can only see their own
            query = {"$or": [
                {"user_id": str(current_user.id)},
                {"email": current_user.email}
            ]}
            if status_filter:
                query["status"] = status_filter
            onboardings = await SupplierOnboarding.find(query).to_list()
        
        # If duplicates exist, only return the latest per email
        onboardings = _dedupe_onboardings(onboardings)

        # Enrich with user + settings (profile photo, fallback phone/location) so admin panel has no "wrong empty" fields.
        emails = sorted({(o.email or "").lower().strip() for o in onboardings if getattr(o, "email", None)})
        users = await User.find({"email": {"$in": emails}}).to_list() if emails else []
        user_by_email = {(u.email or "").lower().strip(): u for u in users if getattr(u, "email", None)}

        supplier_ids = [str(u.id) for u in users]
        settings_docs = await SupplierAccountSettings.find({"supplier_id": {"$in": supplier_ids}}).to_list() if supplier_ids else []
        settings_by_supplier_id = {s.supplier_id: s for s in settings_docs if getattr(s, "supplier_id", None)}

        out: List[dict] = []
        for onboarding in onboardings:
            o = onboarding.dict()
            o["id"] = str(onboarding.id) if getattr(onboarding, "id", None) else None
            o["user_id"] = str(onboarding.user_id) if getattr(onboarding, "user_id", None) else None

            email_key = (getattr(onboarding, "email", "") or "").lower().strip()
            user = user_by_email.get(email_key)
            settings = settings_by_supplier_id.get(str(user.id)) if user else None
            settings_data = dict(getattr(settings, "data", None) or {})
            profile_data = dict(settings_data.get("profileData") or {})

            profile_photo_url = _clean_str(
                settings_data.get("globalUserPhoto")
                or settings_data.get("profilePhotoPreview")
                or profile_data.get("globalUserPhoto")
                or profile_data.get("profilePhotoPreview")
            )

            resolved_name = (
                _clean_str(getattr(onboarding, "business_name", None))
                or _clean_str(getattr(onboarding, "user_name", None))
                or _clean_str(getattr(user, "full_name", None))  # type: ignore[arg-type]
                or _clean_str(getattr(user, "business_name", None))  # type: ignore[arg-type]
                or _clean_str(getattr(onboarding, "email", None))
            )

            resolved_phone = (
                _clean_str(getattr(onboarding, "person_contact", None))
                or _clean_str(getattr(onboarding, "business_phone", None))
                or _clean_str(getattr(user, "phone", None))  # type: ignore[arg-type]
                or _clean_str(profile_data.get("phone"))
                or _clean_str(profile_data.get("contactNumber"))
            )

            resolved_location = (
                _join_non_empty([getattr(onboarding, "person_city", None), getattr(onboarding, "person_country", None)])
                or _clean_str(getattr(onboarding, "person_address", None))
                or _join_non_empty([getattr(onboarding, "business_city", None), getattr(onboarding, "business_country", None)])
                or _clean_str(getattr(user, "address", None))  # type: ignore[arg-type]
                or _clean_str(getattr(user, "country", None))  # type: ignore[arg-type]
                or _join_non_empty([profile_data.get("city"), profile_data.get("country")])
            )

            o["profile_photo_url"] = profile_photo_url
            o["resolved_name"] = resolved_name
            o["resolved_phone"] = resolved_phone
            o["resolved_location"] = resolved_location
            o["user_is_verified"] = bool(getattr(user, "is_verified", False)) if user else False
            out.append(o)

        return out
    except Exception as e:
        logger.error(f"Error listing supplier onboardings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list onboardings: {str(e)}"
        )


@router.put("/{onboarding_id}/status", response_model=dict)
async def update_onboarding_status(
    onboarding_id: str,
    update_data: SupplierOnboardingUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update onboarding status (Admin only)
    Used for approving/rejecting supplier registrations
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        onboarding = await SupplierOnboarding.get(onboarding_id)
        
        if not onboarding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Onboarding data not found"
            )
        
        onboarding.status = update_data.status
        onboarding.reviewed_at = datetime.utcnow()
        onboarding.reviewed_by = str(current_user.id)
        onboarding.rejection_reason = update_data.rejection_reason
        onboarding.updated_at = datetime.utcnow()
        
        await onboarding.save()

        # If there are duplicate onboarding docs for this email (legacy data), keep them in sync
        try:
            normalized_email = (onboarding.email or "").lower().strip()
            if normalized_email:
                coll = SupplierOnboarding.get_motor_collection()
                oid = None
                try:
                    oid = ObjectId(str(onboarding.id))
                except Exception:
                    oid = onboarding.id
                await coll.update_many(
                    {"email": normalized_email, "_id": {"$ne": oid}},
                    {
                        "$set": {
                            "status": update_data.status,
                            "reviewed_at": onboarding.reviewed_at,
                            "reviewed_by": onboarding.reviewed_by,
                            "rejection_reason": onboarding.rejection_reason,
                            "updated_at": onboarding.updated_at,
                        }
                    },
                )
        except Exception as dup_exc:  # pragma: no cover
            logger.warning("Failed to sync duplicate onboardings for %s: %s", onboarding.email, dup_exc)
        
        # If approved/rejected, update the user's verification status
        user = await User.find_one(User.email == onboarding.email) if onboarding.email else None
        if update_data.status == OnboardingStatus.APPROVED and user:
            user.is_verified = True
            await user.save()
            if not onboarding.user_id:
                onboarding.user_id = str(user.id)
                await onboarding.save()
            logger.info(f"Updated user {user.email} verification status to True after onboarding approval")
        elif update_data.status == OnboardingStatus.REJECTED and user:
            user.is_verified = False
            await user.save()

        # Send approval/rejection email (best-effort; only sends if SMTP configured)
        recipient_name = _clean_str(getattr(onboarding, "user_name", None)) or _clean_str(getattr(onboarding, "business_name", None)) or onboarding.email
        if onboarding.email and update_data.status == OnboardingStatus.APPROVED:
            await send_supplier_onboarding_approved_email(onboarding.email, recipient_name or onboarding.email)
        if onboarding.email and update_data.status == OnboardingStatus.REJECTED:
            await send_supplier_onboarding_rejected_email(onboarding.email, recipient_name or onboarding.email, update_data.rejection_reason)
        
        logger.info(f"Admin {current_user.id} updated onboarding {onboarding_id} to {update_data.status}")
        
        # Serialize ObjectIds to strings to avoid Pydantic errors
        result = onboarding.dict()
        result["id"] = str(onboarding.id) if getattr(onboarding, "id", None) else None
        result["user_id"] = str(onboarding.user_id) if getattr(onboarding, "user_id", None) else None
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating onboarding status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update onboarding status: {str(e)}"
        )


@router.get("/email/{email}", response_model=dict)
async def get_onboarding_by_email(
    email: str,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get onboarding data by email
    Users can check their own onboarding status (public endpoint for status checking)
    """
    try:
        # Normalize email for lookup
        normalized_email = email.lower().strip() if email else None
        if not normalized_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        # Try exact match first
        onboarding = await SupplierOnboarding.find_one(SupplierOnboarding.email == normalized_email)
        
        # If not found, check case-insensitively (for existing records)
        if not onboarding:
            all_onboardings = await SupplierOnboarding.find_all().to_list()
            for onb in all_onboardings:
                if onb.email and onb.email.lower().strip() == normalized_email:
                    onboarding = onb
                    break
        
        if not onboarding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Onboarding data not found for this email"
            )
        
        # If user is logged in, verify they own this email (unless admin)
        if current_user:
            if current_user.role != UserRole.ADMIN and onboarding.email != current_user.email:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # For public status checks, only return status and rejection_reason
        # If user is authenticated and owns the email, return full data
        result = onboarding.dict()
        result["id"] = str(onboarding.id) if getattr(onboarding, "id", None) else None
        result["user_id"] = str(onboarding.user_id) if getattr(onboarding, "user_id", None) else None
        
        # If not authenticated, return status-related fields plus ID (needed for support contact)
        if not current_user:
            return {
                "id": result.get("id"),
                "email": result.get("email"),
                "status": result.get("status"),
                "rejection_reason": result.get("rejection_reason"),
            }
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting onboarding by email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get onboarding data: {str(e)}"
        )
