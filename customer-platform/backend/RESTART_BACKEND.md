# Restart Customer Backend to Load Cloudinary Credentials

## Issue
The backend server is running but Cloudinary credentials were added to `.env` after the server started. The server needs to be restarted to load the new environment variables.

## Solution

### Option 1: Restart the Backend Server

1. **Stop the current backend server:**
   - Find the process: `ps aux | grep "python.*app.main"` or `ps aux | grep "uvicorn.*8001"`
   - Kill it: `kill <PID>` or press `Ctrl+C` in the terminal where it's running

2. **Restart the backend:**
   ```bash
   cd customer-platform/backend
   python -m app.main
   # OR
   uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Look for this message in the logs:**
   ```
   ✅ Cloudinary configured successfully for customer platform
   ```

### Option 2: If using a process manager

If you're using PM2, supervisor, or similar:
```bash
pm2 restart customer-backend
# OR
supervisorctl restart customer-backend
```

## Verify It's Working

After restarting, test the upload:
1. Go to customer platform → Profile page
2. Click camera icon (📷)
3. Upload an image
4. Check browser console - should NOT see "Cloudinary not configured" error
5. Check backend logs - should see successful upload

## Expected Backend Logs

When the server starts, you should see:
```
✅ Database initialized successfully!
✅ Cloudinary configured successfully for customer platform
```

If you see:
```
⚠️ Cloudinary credentials not set. Image uploads will fail.
```

Then check that `.env` file has:
```
CLOUDINARY_CLOUD_NAME=dpozb2xhr
CLOUDINARY_API_KEY=357474239833836
CLOUDINARY_API_SECRET=8vaXvxYLvA21graA1hHfUStz2Mk
```

