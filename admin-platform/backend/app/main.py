from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import initiate_database
from app.api.v1 import suppliers, customers

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

# Include routers
app.include_router(suppliers.router, prefix="/api/v1", tags=["Suppliers"])
app.include_router(customers.router, prefix="/api/v1", tags=["Customers"]) 

@app.get("/")
async def root():
    return {"message": "TripsAdora Admin Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
