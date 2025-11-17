"""
Cloudinary Image Upload Service
Handles image uploads to Cloudinary cloud storage
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Optional, Dict, Any, List
from fastapi import UploadFile, HTTPException, status
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Cloudinary (will be configured in startup)
cloudinary_configured = False


def configure_cloudinary(
    cloud_name: str,
    api_key: str,
    api_secret: str
):
    """Configure Cloudinary with credentials"""
    global cloudinary_configured
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True  # Use HTTPS
    )
    cloudinary_configured = True
    logger.info("Cloudinary configured successfully")


async def upload_image(
    file: UploadFile,
    folder: str = "products",
    public_id: Optional[str] = None,
    transformation: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Upload an image to Cloudinary
    
    Args:
        file: FastAPI UploadFile object
        folder: Folder path in Cloudinary (e.g., "products", "avatars", "chat")
        public_id: Optional custom public ID (filename)
        transformation: Optional transformation parameters
    
    Returns:
        Dictionary with image URL and metadata
    """
    if not cloudinary_configured:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables."
        )
    
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Validate file size (10MB limit)
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 10MB"
            )
        
        # Reset file pointer
        await file.seek(0)
        
        # Default transformation: optimize and convert to WebP if possible
        default_transformation = {
            "quality": "auto",
            "fetch_format": "auto",  # Auto WebP/AVIF when supported
            "flags": "progressive"  # Progressive JPEG
        }
        
        if transformation:
            default_transformation.update(transformation)
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder=folder,
            public_id=public_id,
            transformation=[default_transformation],
            resource_type="image"
        )
        
        return {
            "url": upload_result["secure_url"],  # HTTPS URL
            "public_id": upload_result["public_id"],
            "format": upload_result.get("format"),
            "width": upload_result.get("width"),
            "height": upload_result.get("height"),
            "bytes": upload_result.get("bytes"),
            "folder": folder
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image to Cloudinary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


async def upload_multiple_images(
    files: List[UploadFile],
    folder: str = "products"
) -> List[Dict[str, Any]]:
    """
    Upload multiple images to Cloudinary
    
    Args:
        files: List of FastAPI UploadFile objects
        folder: Folder path in Cloudinary
    
    Returns:
        List of dictionaries with image URLs and metadata
    """
    results = []
    for file in files:
        try:
            result = await upload_image(file, folder=folder)
            results.append(result)
        except Exception as e:
            logger.error(f"Error uploading {file.filename}: {e}")
            # Continue with other files
            results.append({
                "error": str(e),
                "filename": file.filename
            })
    
    return results


async def delete_image(public_id: str) -> bool:
    """
    Delete an image from Cloudinary
    
    Args:
        public_id: Public ID of the image to delete
    
    Returns:
        True if successful
    """
    if not cloudinary_configured:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary not configured"
        )
    
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        logger.error(f"Error deleting image from Cloudinary: {e}")
        return False


def get_optimized_url(
    url: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    quality: str = "auto",
    format: Optional[str] = None
) -> str:
    """
    Generate optimized image URL with transformations
    
    Args:
        url: Original Cloudinary URL
        width: Desired width
        height: Desired height
        quality: Image quality ("auto", "80", etc.)
        format: Output format ("webp", "avif", etc.)
    
    Returns:
        Transformed URL
    """
    if not url or "cloudinary.com" not in url:
        return url  # Return as-is if not a Cloudinary URL
    
    # Extract public_id from URL
    # Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
    try:
        parts = url.split("/upload/")
        if len(parts) != 2:
            return url
        
        public_id_with_format = parts[1]
        public_id = public_id_with_format.rsplit(".", 1)[0]  # Remove extension
        
        # Build transformation string
        transformations = []
        if width or height:
            size = f"w_{width}" if width else ""
            if height:
                size += f",h_{height}" if size else f"h_{height}"
            transformations.append(size)
        
        if quality:
            transformations.append(f"q_{quality}")
        
        if format:
            transformations.append(f"f_{format}")
        
        # Build new URL
        if transformations:
            transform_str = "/".join(transformations) + "/"
            new_url = f"{parts[0]}/upload/{transform_str}{public_id_with_format}"
        else:
            new_url = url
        
        return new_url
    except Exception:
        return url  # Return original if parsing fails

