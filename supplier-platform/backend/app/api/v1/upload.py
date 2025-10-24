from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import Optional, List
import aiofiles
import os
from datetime import datetime
from app.models.user import User, UserRole
from app.core.dependencies import get_current_user
from app.models.coi_document import COIDocument, COIStatus
from app.core.config import settings

router = APIRouter()

# Ensure upload directory exists
UPLOAD_DIR = "uploads/coi"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/coi/upload")
async def upload_coi_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload Certificate of Insurance (COI) document
    """
    try:
        # Validate file type
        allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only PDF, JPEG, and PNG files are allowed."
            )
        
        # Validate file size (5MB limit)
        if file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 5MB."
            )
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"coi_{current_user.id}_{timestamp}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Create COI document record
        coi_doc = COIDocument(
            user_id=current_user.id,
            filename=filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=len(content),
            content_type=file.content_type,
            status=COIStatus.PENDING,
            uploaded_at=datetime.now()
        )
        await coi_doc.insert()
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "message": "COI document uploaded successfully",
                "document_id": str(coi_doc.id),
                "filename": filename,
                "status": "pending"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload COI document: {str(e)}"
        )

@router.get("/coi/status/{document_id}")
async def get_coi_status(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get COI document status
    """
    try:
        coi_doc = await COIDocument.find_one(
            COIDocument.id == document_id,
            COIDocument.user_id == current_user.id
        )
        
        if not coi_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="COI document not found"
            )
        
        return {
            "document_id": str(coi_doc.id),
            "filename": coi_doc.original_filename,
            "status": coi_doc.status,
            "uploaded_at": coi_doc.uploaded_at,
            "reviewed_at": coi_doc.reviewed_at,
            "rejection_reason": coi_doc.rejection_reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get COI status: {str(e)}"
        )

@router.get("/coi/user")
async def get_user_coi_documents(
    current_user: User = Depends(get_current_user)
):
    """
    Get all COI documents for the current user
    """
    try:
        coi_docs = await COIDocument.find(
            COIDocument.user_id == current_user.id
        ).sort([("uploaded_at", -1)]).to_list()
        
        return [
            {
                "document_id": str(doc.id),
                "filename": doc.original_filename,
                "status": doc.status,
                "uploaded_at": doc.uploaded_at,
                "reviewed_at": doc.reviewed_at,
                "rejection_reason": doc.rejection_reason
            }
            for doc in coi_docs
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user COI documents: {str(e)}"
        )

# Admin endpoints
@router.get("/coi/admin/pending")
async def get_pending_coi_documents(
    current_user: User = Depends(get_current_user)
):
    """
    Get all pending COI documents (Admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        coi_docs = await COIDocument.find(
            COIDocument.status == COIStatus.PENDING
        ).sort([("uploaded_at", 1)]).to_list()
        
        return [
            {
                "document_id": str(doc.id),
                "user_id": str(doc.user_id),
                "filename": doc.original_filename,
                "uploaded_at": doc.uploaded_at,
                "file_path": doc.file_path
            }
            for doc in coi_docs
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pending COI documents: {str(e)}"
        )

@router.post("/coi/admin/review/{document_id}")
async def review_coi_document(
    document_id: str,
    status: COIStatus,
    rejection_reason: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Review COI document (Approve/Reject) - Admin only
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        coi_doc = await COIDocument.find_one(COIDocument.id == document_id)
        
        if not coi_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="COI document not found"
            )
        
        if coi_doc.status != COIStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document has already been reviewed"
            )
        
        # Update document status
        coi_doc.status = status
        coi_doc.reviewed_at = datetime.now()
        coi_doc.reviewed_by = current_user.id
        
        if status == COIStatus.REJECTED and not rejection_reason:
            rejection_reason = "Document does not meet requirements"
        
        coi_doc.rejection_reason = rejection_reason
        await coi_doc.save()
        
        return {
            "message": f"COI document {status.value} successfully",
            "document_id": str(coi_doc.id),
            "status": status.value,
            "rejection_reason": rejection_reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to review COI document: {str(e)}"
        )

@router.delete("/coi/{document_id}")
async def delete_coi_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete COI document
    """
    try:
        coi_doc = await COIDocument.find_one(
            COIDocument.id == document_id,
            COIDocument.user_id == current_user.id
        )
        
        if not coi_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="COI document not found"
            )
        
        # Delete file from filesystem
        if os.path.exists(coi_doc.file_path):
            os.remove(coi_doc.file_path)
        
        # Delete document record
        await coi_doc.delete()
        
        return {"message": "COI document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete COI document: {str(e)}"
        )
