from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import initiate_database, close_mongo_connection
from app.api.v1 import suppliers, customers, messages, feedbacks, reviews, dashboard, finance, products
from app.api.v1 import settings as settings_router, sub_admins, auth
import asyncio
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="TripsAdora Admin Platform API",
    description="API for TripsAdora Admin Platform",
    version="1.0.0"
)

# CORS middleware
cors_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]

for origin in settings.CORS_ORIGINS:
    if origin != "*" and origin not in cors_origins:
        cors_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        await initiate_database()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on server shutdown."""
    try:
        logger.info("Shutting down server...")
        # Close MongoDB connection gracefully
        await close_mongo_connection()
        logger.info("✅ Server shutdown complete")
    except Exception as e:
        # Suppress errors during shutdown to prevent noisy logs
        logger.debug(f"Shutdown cleanup error (ignored): {e}")

# Include routers
app.include_router(suppliers.router, prefix="/api/v1", tags=["Suppliers"])
app.include_router(customers.router, prefix="/api/v1", tags=["Customers"]) 
app.include_router(messages.router, prefix="/api/v1", tags=["Messages"])
app.include_router(feedbacks.router, prefix="/api/v1", tags=["Feedbacks"])
app.include_router(reviews.router, prefix="/api/v1", tags=["Reviews"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(finance.router, prefix="/api/v1", tags=["Finance"])
app.include_router(products.router, prefix="/api/v1", tags=["Products"])
app.include_router(settings_router.router, prefix="/api/v1", tags=["Settings"])
app.include_router(sub_admins.router, prefix="/api/v1/sub-admins", tags=["Sub-Admins"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])

@app.get("/")
async def root():
    return {"message": "TripsAdora Admin Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
