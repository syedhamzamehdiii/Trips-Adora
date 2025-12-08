# Admin Platform Backend

Backend API for TripsAdora Admin Platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file (optional, defaults are set in config.py):
```env
MONGODB_URL=mongodb+srv://your-connection-string
DATABASE_NAME=TripsAdora
```

3. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

## API Endpoints

### Suppliers

- `GET /api/v1/suppliers` - Get all active suppliers (with pagination and search)
- `GET /api/v1/suppliers/stats` - Get supplier statistics

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── suppliers.py      # Supplier API routes
│   ├── core/
│   │   ├── config.py             # Configuration settings
│   │   └── database.py           # Database connection
│   ├── models/
│   │   ├── supplier.py           # Supplier model
│   │   ├── supplier_onboarding.py # Onboarding model
│   │   └── user.py               # User model
│   ├── schemas/
│   │   └── supplier.py           # Pydantic schemas
│   ├── services/
│   │   └── supplier_service.py   # Business logic
│   └── main.py                   # FastAPI app
├── main.py                       # Entry point
└── requirements.txt              # Dependencies
```
