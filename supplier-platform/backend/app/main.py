from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import initiate_database
from app.services.localstorage_cache import LocalStorageCache
from app.api.v1 import (
    auth,
    upload,
    products,
    settings as settings_router,
    vehicles as vehicles_router,
    dashboard as dashboard_router,
    bookings as bookings_router,
    notifications as notifications_router,
    messages as messages_router,
    images as images_router,
)

app = FastAPI(
    title="TripsAdora Supplier Platform API",
    description="API for TripsAdora Supplier Platform",
    version="1.0.0"
)

# CORS middleware
# Explicitly allow localhost:5173 and other development origins
cors_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
# Also include any from settings that aren't "*"
for origin in settings.CORS_ORIGINS:
    if origin != "*" and origin not in cors_origins:
        cors_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Explicit list of allowed origins
    allow_credentials=True,  # Allow cookies/auth headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # All HTTP methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
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
        
        # Initialize Cloudinary
        images_router.init_cloudinary()
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/api/v1", tags=["Upload"])
app.include_router(products.router, prefix="/api/v1", tags=["Products"])
app.include_router(settings_router.router, prefix="/api/v1", tags=["Settings"])
app.include_router(vehicles_router.router, prefix="/api/v1", tags=["Vehicles"])
app.include_router(dashboard_router.router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(bookings_router.router, prefix="/api/v1", tags=["Bookings"])
app.include_router(notifications_router.router, prefix="/api/v1", tags=["Notifications"])
app.include_router(messages_router.router, prefix="/api/v1", tags=["Messages"])
app.include_router(images_router.router, prefix="/api/v1", tags=["Images"])

@app.get("/")
async def root():
    return {"message": "TripsAdora Supplier Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
