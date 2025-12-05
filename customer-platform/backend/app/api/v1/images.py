"""
Image Upload API Endpoints
Handles image uploads to Cloudinary
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from app.services.cloudinary_service import (
    upload_image,
    upload_multiple_images,
    delete_image,
    configure_cloudinary,
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
        logger.info("✅ Cloudinary configured successfully for customer platform")
    else:
        logger.warning("⚠️ Cloudinary credentials not set. Image uploads will fail.")


@router.post("/upload")
async def upload_single_image(
    file: UploadFile = File(...),
    folder: str = "customer"
):
    """
    Upload a single image to Cloudinary
    
    Returns the image URL to store in your database (instead of base64)
    """
    try:
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
    folder: str = "customer"
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
    public_id: str
):
    """
    Delete an image from Cloudinary by public_id
    """
    try:
        # Decode the public_id (it may be URL-encoded)
        from urllib.parse import unquote
        decoded_public_id = unquote(public_id)
        
        success = await delete_image(decoded_public_id)
        
        if success:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"success": True, "message": "Image deleted successfully"}
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found or could not be deleted"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )

