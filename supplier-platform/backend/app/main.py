from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import initiate_database
from app.services.localstorage_cache import LocalStorageCache
from app.api.v1 import auth, upload, products

app = FastAPI(
    title="TripsAdora Supplier Platform API",
    description="API for TripsAdora Supplier Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        await initiate_database()
        print("✅ Database initialized successfully!")
        # Warm up public cache from disk so customer site has products even if DB is empty
        loaded = LocalStorageCache.load_from_disk()
        if loaded:
            print(f"📦 Prefetched {loaded} products into local cache from disk snapshot")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/api/v1", tags=["Upload"])
app.include_router(products.router, prefix="/api/v1", tags=["Products"])

@app.get("/")
async def root():
    return {"message": "TripsAdora Supplier Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
