# Cloudinary Setup Guide

## Quick Start (5 minutes)

### Step 1: Sign Up for Cloudinary
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. You'll get 25GB storage and 25GB bandwidth/month free

### Step 2: Get Your Credentials
1. After signing up, go to your Dashboard
2. Copy these three values:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### Step 3: Add to Environment Variables
Add to your `.env` file in `supplier-platform/backend/`:

```env
```

### Step 4: Install Cloudinary SDK
```bash
cd supplier-platform/backend
pip install cloudinary
```

### Step 5: Register the Router
Add to your `app/main.py` or router registration:

```python
from app.api.v1 import images

app.include_router(images.router, prefix="/api/v1")
```

### Step 6: Test Upload
```bash
# Using curl
curl -X POST "http://localhost:8000/api/v1/images/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=products"
```

## Usage Examples

### Frontend: Upload Image
```javascript
// Instead of converting to base64:
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'products');

const response = await fetch('/api/v1/images/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { url } = await response.json();
// Store 'url' in MongoDB instead of base64 string
```

### Backend: Store URL in Database
```python
# Instead of storing base64:
product.images = ["https://res.cloudinary.com/.../image.jpg"]

# MongoDB document is now tiny and fast!
```

### Get Optimized Images
```javascript
// Get thumbnail (200x200)
const thumbnailUrl = `${imageUrl}?w=200&h=200&q=80&f=webp`;

// Get responsive image
const mobileUrl = `${imageUrl}?w=400&q=auto&f=auto`;
const desktopUrl = `${imageUrl}?w=1200&q=auto&f=auto`;
```

## Migration from Base64

### Step 1: Update Upload Handler
Replace `readAsDataURL` with direct upload to Cloudinary:

**Before:**
```javascript
reader.readAsDataURL(file);
// Stores base64 in state
```

**After:**
```javascript
const formData = new FormData();
formData.append('file', file);
const response = await uploadService.uploadImage(formData);
// Store response.url in state
```

### Step 2: Update Database Schema
No changes needed! Just store URLs instead of base64 strings.

**Before:**
```python
images: List[str] = ["data:image/jpeg;base64,/9j/4AAQ..."]  # 2MB string
```

**After:**
```python
images: List[str] = ["https://res.cloudinary.com/.../image.jpg"]  # 100 bytes
```

### Step 3: Update Frontend Display
**Before:**
```jsx
<img src={imageUrl} />  // Works with base64
```

**After:**
```jsx
<img src={imageUrl} />  // Works with Cloudinary URL too!
```

## Performance Comparison

### Before (Base64 in MongoDB)
- Product document: ~2-5MB
- Query time: 500-2000ms
- Page load: 3-5 seconds

### After (Cloudinary URLs)
- Product document: ~5-10KB
- Query time: 10-50ms
- Page load: 0.5-1 second

**Result: 10-100x faster queries, 3-5x faster page loads!**

## Cost Comparison

### Free Tier (Most apps)
- 25GB storage
- 25GB bandwidth/month
- **Cost: $0/month**

### Paid Tier (If you exceed free tier)
- Storage: $0.10/GB
- Bandwidth: $0.10/GB
- Transformations: $0.10/1000
- **Typical cost: $5-20/month for medium apps**

## Best Practices

1. **Use folders** - Organize by type: `products/`, `avatars/`, `chat/`
2. **Optimize on upload** - Use `quality: "auto"` and `fetch_format: "auto"`
3. **Use responsive images** - Generate different sizes for mobile/desktop
4. **Delete unused images** - Clean up when products are deleted
5. **Cache URLs** - Don't regenerate transformation URLs on every request

## Troubleshooting

### "Cloudinary not configured"
- Check `.env` file has all three credentials
- Restart your FastAPI server after adding credentials

### "Invalid file type"
- Only images are supported: JPEG, PNG, WebP, GIF
- Check `file.content_type` matches allowed types

### "File too large"
- Default limit is 10MB
- Increase in `cloudinary_service.py` or compress images before upload

## Next Steps

1. ✅ Set up Cloudinary account
2. ✅ Add credentials to `.env`
3. ✅ Install SDK: `pip install cloudinary`
4. ✅ Test upload endpoint
5. ✅ Update frontend to use new upload service
6. ✅ Migrate existing base64 images (optional, can be done gradually)

