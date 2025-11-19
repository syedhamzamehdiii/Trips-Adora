# Customer Platform Backend Setup

## Overview

This backend connects to the same MongoDB database as the supplier platform and provides API endpoints to fetch published products for the customer frontend.

## Structure

```
backend
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── products.py      # Product API endpoints
│   ├── core/
│   │   ├── config.py           # Configuration settings
│   │   └── database.py          # Database connection
│   ├── schemas/
│   │   └── product.py           # Response schemas
│   ├── services/
│   │   └── product_service.py   # Business logic
│   └── main.py                 # FastAPI application
├── requirements.txt
└── README.md
```

## Installation

1. Install Python dependencies:
```bash
cd customer-platform/backend
pip install -r requirements.txt
```

2. Run the server:
```bash
python -m app.main
# Or with uvicorn:
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at `http://localhost:8001`

## API Endpoints

### Get Published Products
```
GET /api/v1/products/published
Query Parameters:
- page: int (default: 1)
- page_size: int (default: 20, max: 100)
- category: str (optional)
- destination: str (optional)
- search: str (optional)
```

### Get Top Picks
```
GET /api/v1/products/top-picks
Query Parameters:
- limit: int (default: 4, max: 20)
```

### Get Product by ID
```
GET /api/v1/products/{product_id}
```

## Frontend Integration

The frontend service (`frontend/src/services/productService.js`) is configured to connect to:
- Default: `http://localhost:8001/api/v1`
- Can be overridden with `VITE_API_BASE_URL` environment variable

## Database

Uses the same MongoDB database as the supplier platform:
- Database: `supplier_platform`
- Collection: `products`
- Filters for: `status: "published"`

Products are automatically synced from the supplier platform - when a supplier publishes a product, it immediately becomes available to customers.

