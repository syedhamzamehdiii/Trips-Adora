"""
Cloudinary Image Upload Service
Handles image uploads to Cloudinary cloud storage
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Optional, Dict, Any, List
from fastapi import UploadFile, HTTPException, status
from io import BytesIO
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
        # Validate file type - allow images and PDFs (especially for onboarding)
        allowed_image_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
        allowed_pdf_types = ["application/pdf"]
        
        # Check content type
        content_type = file.content_type or ""
        filename = file.filename or ""
        
        # Also check file extension as fallback (browsers sometimes don't send correct content-type)
        file_extension = filename.lower().split('.')[-1] if '.' in filename else ""
        is_pdf_by_extension = file_extension == "pdf"
        is_image_by_extension = file_extension in ["jpg", "jpeg", "png", "webp", "gif"]
        
        is_pdf = content_type in allowed_pdf_types or is_pdf_by_extension
        is_image = content_type in allowed_image_types or is_image_by_extension
        
        # For onboarding folder, allow both images and PDFs
        # For other folders, only allow images (unless it's a PDF)
        if folder.startswith("supplier/onboarding"):
            if not (is_image or is_pdf):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file type. Allowed types: {', '.join(allowed_image_types + allowed_pdf_types)}. Received: {content_type or 'unknown'} (file: {filename})"
                )
        else:
            if not is_image:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file type. Allowed types: {', '.join(allowed_image_types)}. Received: {content_type or 'unknown'} (file: {filename})"
                )
        
        # Validate file size (10MB limit)
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 10MB"
            )
        
        # Upload to Cloudinary using bytes directly
        # Create BytesIO from file content and ensure it's at position 0
        file_stream = BytesIO(file_content)
        file_stream.seek(0)
        
        # Build upload options
        if is_pdf:
            # PDFs should be uploaded as "raw" resource type
            upload_options = {
                "folder": folder,
                "resource_type": "raw",  # PDFs are raw files, not images
            }
        else:
            # Images use image resource type with transformations
            default_transformation = {
                "quality": "auto",
                "fetch_format": "auto",  # Auto WebP/AVIF when supported
                "flags": "progressive"  # Progressive JPEG
            }
            
            if transformation:
                default_transformation.update(transformation)
            
            upload_options = {
                "folder": folder,
                "resource_type": "image",
                "transformation": [default_transformation]
            }
        
        if public_id:
            upload_options["public_id"] = public_id
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file_stream,
            **upload_options
        )
        
        return {
            "url": upload_result["secure_url"],  # HTTPS URL
            "public_id": upload_result["public_id"],
            "format": upload_result.get("format"),
            "width": upload_result.get("width"),  # None for PDFs
            "height": upload_result.get("height"),  # None for PDFs
            "bytes": upload_result.get("bytes"),
            "folder": folder,
            "resource_type": upload_result.get("resource_type", "image"),  # "image" or "raw" for PDFs
            "original_filename": filename  # Store original filename for proper download names
        }
    
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        logger.error(f"Error uploading image to Cloudinary: {error_type}: {error_msg}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {error_msg}"
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

