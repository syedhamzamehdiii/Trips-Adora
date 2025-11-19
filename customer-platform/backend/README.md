# Customer Platform Backend

Backend API for TripsAdora Customer Platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables (optional, defaults are in config.py):
```bash
export MONGODB_URL="your_mongodb_url"
export DATABASE_NAME="supplier_platform"
```

3. Run the server:
```bash
python -m app.main
# or
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## API Endpoints

### Products

- `GET /api/v1/products/published` - Get all published products
  - Query params: `page`, `page_size`, `category`, `destination`, `search`
  
- `GET /api/v1/products/top-picks` - Get top picks
  - Query params: `limit` (default: 4)

- `GET /api/v1/products/{product_id}` - Get a specific product

## Database

Uses the same MongoDB database as the supplier platform to access published products.

