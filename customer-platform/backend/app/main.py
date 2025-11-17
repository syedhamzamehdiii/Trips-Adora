from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import initiate_database
from app.api.v1 import products, profile, bookings, wallet, reviews, auth

app = FastAPI(
    title="TripsAdora Customer Platform API",
    description="API for TripsAdora Customer Platform",
    version="1.0.0"
)

# CORS middleware
# Filter out "*" from origins if credentials are enabled (FastAPI requirement)
cors_origins = [origin for origin in settings.CORS_ORIGINS if origin != "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],  # Use explicit origins or allow all
    allow_credentials=True if cors_origins else False,  # Only enable credentials with explicit origins
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        await initiate_database()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/v1", tags=["Products"])
app.include_router(profile.router, prefix="/api/v1")
app.include_router(bookings.router, prefix="/api/v1")
app.include_router(wallet.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "TripsAdora Customer Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

