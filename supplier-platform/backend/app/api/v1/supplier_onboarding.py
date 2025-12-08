"""
Supplier Onboarding API Endpoints
Handles supplier registration/onboarding data submission and verification
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from app.models.supplier_onboarding import SupplierOnboarding, BusinessType, OnboardingStatus
from app.models.user import User, UserRole
from app.core.dependencies import get_current_user
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
        # Check if onboarding already exists for this email
        existing = await SupplierOnboarding.find_one(SupplierOnboarding.email == data.email)
        if existing:
            # Update existing onboarding
            for key, value in data.dict(exclude_unset=True).items():
                setattr(existing, key, value)
            existing.updated_at = datetime.utcnow()
            await existing.save()
            onboarding = existing
            logger.info(f"Updated existing onboarding for email: {data.email}")
        else:
            # Create new onboarding
            onboarding_data = data.dict()
            onboarding = SupplierOnboarding(**onboarding_data)
            await onboarding.insert()
            logger.info(f"Created new onboarding for email: {data.email}")
        
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
        
        return onboarding.dict()
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
        
        return [onboarding.dict() for onboarding in onboardings]
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
        
        logger.info(f"Admin {current_user.id} updated onboarding {onboarding_id} to {update_data.status}")
        
        return onboarding.dict()
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
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get onboarding data by email
    Users can check their own onboarding status
    """
    try:
        onboarding = await SupplierOnboarding.find_one(SupplierOnboarding.email == email)
        
        if not onboarding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Onboarding data not found for this email"
            )
        
        # If user is logged in, verify they own this email
        if current_user:
            if current_user.role != UserRole.ADMIN and onboarding.email != current_user.email:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        return onboarding.dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting onboarding by email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get onboarding data: {str(e)}"
        )
