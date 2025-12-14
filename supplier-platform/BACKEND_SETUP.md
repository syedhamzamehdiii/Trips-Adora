# TripsAdora Supplier Platform - Backend Setup Guide

## 🚀 Quick Start

### 1. Database Configuration

Your MongoDB connection string is already configured:
```
mongodb+srv://sabaarif2003:7fU8J1xrmVzmmZXs@cluster0.qeih2ta.mongodb.net/esg_research
```

### 2. Environment Setup

1. **Copy the environment template:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit `.env` file with your settings:**
   ```env
   # Database Configuration
   MONGODB_URL=mongodb+srv://sabaarif2003:7fU8J1xrmVzmmZXs@cluster0.qeih2ta.mongodb.net/esg_research
   DATABASE_NAME=supplier_platform
   
   # Security Keys (CHANGE THESE IN PRODUCTION!)
   SECRET_KEY=your-super-secret-key-change-this-in-production-12345
   JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production-67890
   JWT_ALGORITHM=HS256
   
   # Token Expiration Times
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   
   # CORS Origins (for frontend)
   CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
   ```

### 3. Install Dependencies

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 4. Test JWT Functionality

Run the JWT test script:
```bash
python test_jwt.py
```

Generate a test token:
```bash
python generate_token.py
```

### 5. Start the Test API Server

```bash
uvicorn test_auth_endpoint:app --reload --host 0.0.0.0 --port 8000
```

Visit: http://localhost:8000/docs

## 🔐 JWT Token Usage

### Generating Tokens

#### Method 1: Using the Script
```bash
python generate_token.py
```

#### Method 2: Using the API
```bash
# Generate test token
curl http://localhost:8000/auth/generate-test-token

# Login to get tokens
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@tripsadora.com", "password": "admin123"}'
```

#### Method 3: Programmatically
```python
from app.core.security import create_test_token

# Generate tokens for a user
tokens = create_test_token("user_id_123", "user@example.com")
access_token = tokens["access_token"]
refresh_token = tokens["refresh_token"]
```

### Using Tokens in Requests

#### Frontend (JavaScript/React)
```javascript
// Add to HTTP headers
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json'
};

// Example API call
fetch('/api/v1/auth/profile', {
  headers: headers
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Backend (Python)
```python
from app.core.security import get_current_user

# In your FastAPI endpoint
@app.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}
```

#### cURL
```bash
# Test authenticated endpoint
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/auth/profile
```

## 🧪 Testing Endpoints

### Available Test Endpoints

1. **Login** - `POST /auth/login`
   ```json
   {
     "email": "admin@tripsadora.com",
     "password": "admin123"
   }
   ```

2. **Get Profile** - `GET /auth/profile` (requires token)

3. **Test Token** - `GET /auth/test-token` (requires token)

4. **Generate Test Token** - `GET /auth/generate-test-token`

5. **Refresh Token** - `POST /auth/refresh`

### Test Users (Mock Data)

- **Admin**: admin@tripsadora.com / admin123
- **Supplier**: supplier@tripsadora.com / supplier123

## 🔧 JWT Configuration

### Token Expiration
- **Access Token**: 30 minutes (configurable)
- **Refresh Token**: 7 days (configurable)

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token generation and validation
- ✅ Token expiration handling
- ✅ Refresh token support
- ✅ Password reset token support

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🚨 Security Notes

1. **Change default secrets** in production
2. **Use HTTPS** in production
3. **Implement rate limiting** for login endpoints
4. **Store tokens securely** on frontend (httpOnly cookies recommended)
5. **Implement proper CORS** settings

## 🔄 Next Steps

1. **Connect to MongoDB**: Update database connection
2. **Implement User Models**: Create user schemas with Beanie
3. **Add Authentication Middleware**: Protect API endpoints
4. **Implement Registration**: Add user registration flow
5. **Add Password Reset**: Implement forgot password functionality

## 📞 Support

If you encounter any issues:
1. Check the logs for error messages
2. Verify MongoDB connection
3. Ensure all dependencies are installed
4. Check environment variables are set correctly

## 🎯 Example Usage

```python
# Complete example
from app.core.security import create_test_token, decode_token

# Generate token
tokens = create_test_token("user_123", "user@example.com")

# Use in request
import requests
headers = {"Authorization": f"Bearer {tokens['access_token']}"}
response = requests.get("http://localhost:8000/auth/profile", headers=headers)
print(response.json())
```

