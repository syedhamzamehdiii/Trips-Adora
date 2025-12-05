# Testing Cloudinary Image Upload

## Setup Required

1. **Install Cloudinary package:**
   ```bash
   cd customer-platform/backend
   pip install cloudinary==1.36.0
   ```

2. **Set Cloudinary credentials in environment variables or .env file:**
   ```bash
   export CLOUDINARY_CLOUD_NAME="your-cloud-name"
   export CLOUDINARY_API_KEY="your-api-key"
   export CLOUDINARY_API_SECRET="your-api-secret"
   ```
   
   Or create a `.env` file in `customer-platform/backend/`:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Restart the customer backend server**

## Test the Upload Endpoint

Once the backend is running, you can test the upload endpoint:

```bash
curl -X POST "http://localhost:8001/api/v1/images/upload?folder=customer/profile-photos" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

Expected response:
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234567890/customer/profile-photos/xxx.jpg",
  "public_id": "customer/profile-photos/xxx",
  "width": 800,
  "height": 600,
  "bytes": 12345
}
```

## Verify in Cloudinary Dashboard

1. Go to https://cloudinary.com/console
2. Navigate to Media Library
3. Check the folder: `customer/profile-photos` (or whatever folder you specified)
4. You should see your uploaded images there

## Frontend Test

1. Open customer platform
2. Go to Profile page
3. Click the camera icon (📷) below the profile picture
4. Select an image
5. Check browser Network tab - you should see:
   - POST request to `/api/v1/images/upload?folder=customer/profile-photos`
   - Response with `url` field containing `res.cloudinary.com`
6. Check Cloudinary dashboard to confirm the image is there

