from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import auth, products, orders, partners, messages, settings as settings_router, upload


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown (if needed)


# Create FastAPI app
app = FastAPI(
    title="Trips Adora Supplier Platform",
    description="Backend API for Trips Adora Supplier Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],  # Add wildcard for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(partners.router, prefix="/api/v1/partners", tags=["partners"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["messages"])
app.include_router(settings_router.router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to Trips Adora Supplier Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

