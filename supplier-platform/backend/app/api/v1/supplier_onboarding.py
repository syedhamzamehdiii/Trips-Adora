"""
Supplier Onboarding API Endpoints
Handles supplier registration/onboarding data submission and verification
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from app.models.supplier_onboarding import SupplierOnboarding, BusinessType, OnboardingStatus
from app.models.user import User, UserRole
from app.core.dependencies import get_current_user, get_current_user_optional
from app.schemas.supplier_onboarding import (
    SupplierOnboardingCreate,
    SupplierOnboardingResponse,
    SupplierOnboardingUpdate
)
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/supplier-onboarding", tags=["Supplier Onboarding"])


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
        
        if existing:
            # Update existing onboarding instead of creating duplicate
            logger.warning(f"Duplicate prevention: Found existing onboarding {existing.id} for email: {normalized_email}, updating instead of creating duplicate")
            for key, value in data.dict(exclude_unset=True).items():
                # Normalize email if it's being updated
                if key == 'email' and value:
                    value = value.lower().strip()
                setattr(existing, key, value)
            existing.updated_at = datetime.utcnow()
            await existing.save()
            onboarding = existing
            logger.info(f"Updated existing onboarding {onboarding.id} for email: {normalized_email}")
        else:
            # Create new onboarding with normalized email
            onboarding_data = data.dict()
            onboarding_data['email'] = normalized_email
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
        
        # Ensure ObjectIds are serialized as strings to avoid Pydantic errors
        return [
            {
                **onboarding.dict(),
                "id": str(onboarding.id) if getattr(onboarding, "id", None) else None,
                "user_id": str(onboarding.user_id) if getattr(onboarding, "user_id", None) else None,
            }
            for onboarding in onboardings
        ]
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
        
        # If approved, update the user's verification status
        if update_data.status == OnboardingStatus.APPROVED and onboarding.email:
            user = await User.find_one(User.email == onboarding.email)
            if user:
                user.is_verified = True
                await user.save()
                logger.info(f"Updated user {user.email} verification status to True after onboarding approval")
        
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
