# Image Migration Guide

All image paths have been updated in the code to use `/images/` instead of `/assests/`.

## Steps to Complete the Migration

### 1. Create the images directory
```bash
cd customer-platform/frontend
mkdir -p public/images
```

### 2. Move images from assests/ to public/images/
```bash
# Move all images from root assests/ folder
cp -r assests/* public/images/

# Move all images from public/assests/ folder (merge)
cp -r public/assests/* public/images/

# Remove old folders (after verifying images are copied)
# rm -rf assests/
# rm -rf public/assests/
```

### 3. Rename files with spaces to use hyphens
Some files have spaces in their names which can cause issues. Rename them:

```bash
cd public/images

# Rename files with spaces
mv "place 1.jpg" "place-1.jpg"
mv "place 2.jpg" "place-2.jpg"
mv "place 3.jpg" "place-3.jpg"
mv "core values.jpg" "core-values.jpg"
mv "mount fuji.jpg" "mount-fuji.jpg"
mv "Screenshot 2025-11-03 at 12.08.32 PM.png" "tokyo-skytree-1.png"
mv "Screenshot 2025-11-03 at 12.12.27 PM.png" "tokyo-tower-1.png"
mv "Screenshot 2025-11-03 at 12.13.07 PM.png" "arashiyama-bamboo-1.png"
mv "golden-pavilion-kinkakuji-temple-kyoto-japan 1.png" "golden-pavilion-kinkakuji-temple-kyoto-japan-1.png"
mv "tourist-looking-fuji-mountain-cherry-blossom-spring-fujinomiya-japan 2 (1).png" "tourist-looking-fuji-mountain-cherry-blossom-spring-fujinomiya-japan-2-1.png"
mv "tower ...jpg" "tower.jpg"
```

### 4. Verify all images are accessible
After moving, test that images load:
- `/images/logo1.png`
- `/images/bg.jpg`
- `/images/mount-fuji.jpg`
etc.

### 5. Rebuild and deploy
```bash
npm run build
```

## File Name Mappings

The following files have been renamed in code references:

| Old Name | New Name |
|----------|----------|
| `place 1.jpg` | `place-1.jpg` |
| `place 2.jpg` | `place-2.jpg` |
| `place 3.jpg` | `place-3.jpg` |
| `core values.jpg` | `core-values.jpg` |
| `mount fuji.jpg` | `mount-fuji.jpg` |
| `Screenshot 2025-11-03 at 12.08.32 PM.png` | `tokyo-skytree-1.png` |
| `Screenshot 2025-11-03 at 12.12.27 PM.png` | `tokyo-tower-1.png` |
| `Screenshot 2025-11-03 at 12.13.07 PM.png` | `arashiyama-bamboo-1.png` |
| `golden-pavilion-kinkakuji-temple-kyoto-japan 1.png` | `golden-pavilion-kinkakuji-temple-kyoto-japan-1.png` |
| `tourist-looking-fuji-mountain-cherry-blossom-spring-fujinomiya-japan 2 (1).png` | `tourist-looking-fuji-mountain-cherry-blossom-spring-fujinomiya-japan-2-1.png` |
| `tower ...jpg` | `tower.jpg` |

## Benefits

✅ Images are now in `public/images/` which is served directly by the web server
✅ Faster loading - no bundling required
✅ Works in production - absolute paths `/images/...` resolve correctly
✅ Better caching - static assets are cached separately
✅ Cleaner code - no import statements needed for static images

