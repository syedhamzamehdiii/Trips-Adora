# Admin Platform Setup Guide

## Obtaining Supplier Platform Admin JWT Token

The admin platform needs a JWT token from the supplier platform to access supplier onboarding data. Here are two methods to obtain this token:

---

## Method 1: Using the Create Admin Script (Recommended)

### Step 1: Run the Admin User Creation Script

Navigate to the supplier platform backend directory and run:

```bash
cd supplier-platform/backend
python create_admin_user.py
```

The script will:
- Prompt you for email, password, and name
- Create a new admin user (or update existing user to admin)
- Generate and display the JWT token

### Step 2: Use the Token

**Option A: Environment Variable (Recommended for Production)**
Add to your `.env` file in `admin-platform/frontend/`:
```env
VITE_SUPPLIER_ADMIN_TOKEN=your_jwt_token_here
```
Then restart your frontend dev server.

**Option B: Browser Console (For Quick Testing)**
Open browser console in admin platform and run:
```javascript
localStorage.setItem('supplier_access_token', 'your_jwt_token_here');
```
Then refresh the page.

---

## Method 2: Using Login API Endpoint

### Step 1: Ensure You Have an Admin User

If you don't have an admin user yet, you can:
- Use Method 1 above, OR
- Manually update a user in MongoDB to have `role: "admin"`

### Step 2: Login via API

Make a POST request to the supplier platform login endpoint:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

Response will include:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "user": { ... }
}
```

### Step 3: Use the Token

Copy the `token` value and use it as described in Method 1, Step 2.

---

## Method 3: Manual Database Update + Login

### Step 1: Update User Role in MongoDB

Connect to your MongoDB database and update a user:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { 
    $set: { 
      role: "admin",
      is_active: true,
      is_verified: true
    }
  }
)
```

### Step 2: Login via API

Use Method 2, Step 2 to login and get the token.

---

## Verifying the Token Works

After setting up the token, check the browser console when loading the "Manage Supplier Approvals" page. You should see:
- ✅ No 401 errors
- ✅ Supplier onboarding data loading successfully

---

## Troubleshooting

### 401 Unauthorized Error
- **Issue**: Token is invalid or expired
- **Solution**: Generate a new token using Method 1 or Method 2

### Token Not Being Used
- **Issue**: Token not in localStorage or env variable
- **Solution**: 
  - Check `localStorage.getItem('supplier_access_token')` in browser console
  - Verify `.env` file has `VITE_SUPPLIER_ADMIN_TOKEN` set
  - Restart frontend dev server after changing `.env`

### User Not Admin
- **Issue**: User exists but doesn't have admin role
- **Solution**: Run the `create_admin_user.py` script and choose to update existing user

---

## Security Notes

⚠️ **Important**: 
- Keep admin tokens secure
- Don't commit tokens to version control
- Use environment variables for production
- Tokens expire (default: 30 minutes for access, 7 days for refresh)
- Regenerate tokens if compromised
