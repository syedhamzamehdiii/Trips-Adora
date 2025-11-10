from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import initiate_database
from app.api.v1 import products, profile, bookings, wallet, reviews

app = FastAPI(
    title="TripsAdora Customer Platform API",
    description="API for TripsAdora Customer Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
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

