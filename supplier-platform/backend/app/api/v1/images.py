"""
Image Upload API Endpoints
Handles image uploads to Cloudinary
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status, Header
from fastapi.responses import JSONResponse
from typing import List, Optional
from app.models.user import User
from app.core.dependencies import get_current_user, get_current_user_optional
from app.services.cloudinary_service import (
    upload_image,
    upload_multiple_images,
    delete_image,
    configure_cloudinary,
    get_optimized_url
)
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/images", tags=["images"])


def init_cloudinary():
    """Configure Cloudinary - call this from main.py startup"""
    if all([
        settings.CLOUDINARY_CLOUD_NAME,
        settings.CLOUDINARY_API_KEY,
        settings.CLOUDINARY_API_SECRET
    ]):
        configure_cloudinary(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )
        logger.info("✅ Cloudinary configured successfully")
    else:
        logger.warning("⚠️ Cloudinary credentials not set. Image uploads will fail.")


@router.post("/upload")
async def upload_single_image(
    file: UploadFile = File(...),
    folder: str = "products",
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Upload a single image to Cloudinary
    
    Returns the image URL to store in your database (instead of base64)
    
    Note: Authentication is optional for 'supplier/onboarding' folder to allow
    unauthenticated users to upload registration documents.
    """
    try:
        # Allow unauthenticated uploads only for onboarding folder
        if not current_user and not folder.startswith("supplier/onboarding"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required for this folder"
            )
        
        result = await upload_image(file, folder=folder)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "url": result["url"],  # Store this URL in MongoDB
                "public_id": result["public_id"],
                "width": result.get("width"),
                "height": result.get("height"),
                "bytes": result.get("bytes")
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.post("/upload/multiple")
async def upload_multiple(
    files: List[UploadFile] = File(...),
    folder: str = "products",
    current_user: User = Depends(get_current_user)
):
    """
    Upload multiple images to Cloudinary
    
    Returns array of image URLs to store in your database
    """
    try:
        results = await upload_multiple_images(files, folder=folder)
        
        # Filter out errors
        successful_uploads = [
            {
                "url": r["url"],
                "public_id": r["public_id"],
                "width": r.get("width"),
                "height": r.get("height")
            }
            for r in results if "url" in r
        ]
        
        errors = [
            {"filename": r.get("filename"), "error": r.get("error")}
            for r in results if "error" in r
        ]
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "images": successful_uploads,  # Store these URLs in MongoDB
                "errors": errors if errors else None
            }
        )
    except Exception as e:
        logger.error(f"Error uploading multiple images: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload images: {str(e)}"
        )


@router.delete("/{public_id}")
async def delete_image_endpoint(
    public_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete an image from Cloudinary
    """
    try:
        success = await delete_image(public_id)
        if success:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"success": True, "message": "Image deleted successfully"}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found or already deleted"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )


@router.get("/optimize")
async def get_optimized_image_url(
    url: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    quality: str = "auto"
):
    """
    Get optimized image URL with transformations
    
    Example: /images/optimize?url=https://...&width=800&height=600&quality=80
    """
    try:
        optimized_url = get_optimized_url(
            url=url,
            width=width,
            height=height,
            quality=quality
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "original_url": url,
                "optimized_url": optimized_url
            }
        )
    except Exception as e:
        logger.error(f"Error optimizing image URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize image URL: {str(e)}"
        )

