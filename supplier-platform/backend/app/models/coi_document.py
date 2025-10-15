from beanie import Document
from datetime import datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel

class COIStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class COIDocument(Document):
    user_id: str
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    content_type: str
    status: COIStatus = COIStatus.PENDING
    uploaded_at: datetime = datetime.now()
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    rejection_reason: Optional[str] = None

    class Settings:
        name = "coi_documents"
        indexes = [
            "user_id",
            "status",
            "uploaded_at"
        ]

# Pydantic models for API responses
class COIDocumentResponse(BaseModel):
    document_id: str
    filename: str
    status: COIStatus
    uploaded_at: datetime
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

class COIUploadResponse(BaseModel):
    message: str
    document_id: str
    filename: str
    status: str

class COIReviewRequest(BaseModel):
    status: COIStatus
    rejection_reason: Optional[str] = None
