from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
import logging
import asyncio

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    database = None


db = Database()


async def initiate_database():
    """Initialize database connection with optimized settings."""
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            # Connection pool settings - increased for better resilience
            maxPoolSize=100,
            minPoolSize=5,
            maxIdleTimeMS=45000,
            # Timeout settings - increased for better reliability
            serverSelectionTimeoutMS=60000,  # Increased from 5s to 60s
            connectTimeoutMS=30000,  # 30 seconds
            socketTimeoutMS=120000,  # 120 seconds
            # Retry settings
            retryWrites=True,
            retryReads=True,
            # Heartbeat settings - helps maintain connection
            heartbeatFrequencyMS=10000,
            # TLS (allow self-signed certificates for development)
            tls=True,
            tlsAllowInvalidCertificates=True,
            # Connection retry settings
            directConnection=False,  # Use replica set connection
        )
        db.database = db.client[settings.DATABASE_NAME]

        # Test the connection with retry
        max_retries = 3
        for attempt in range(max_retries):
            try:
                await db.client.admin.command("ping")
                logger.info("✅ Successfully connected to MongoDB!")
                break
            except Exception as ping_error:
                if attempt < max_retries - 1:
                    logger.warning(f"MongoDB ping failed (attempt {attempt + 1}/{max_retries}), retrying...")
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"❌ Failed to connect to MongoDB after {max_retries} attempts: {ping_error}")
                    # Don't raise immediately - allow app to start and retry later
                    logger.warning("⚠️  Application will continue but database operations may fail")
                    db.client = None
                    db.database = None
                    return
        
        # Initialize Beanie with User model
        await init_beanie(database=db.database, document_models=[User])
        logger.info("✅ Beanie initialized with User model!")

    except Exception as e:
        logger.error(f"❌ Error connecting to MongoDB: {e}")
        # Don't raise - allow app to start and retry later
        logger.warning("⚠️  Application will continue but database operations may fail")
        db.client = None
        db.database = None


async def connect_to_mongo():
    """Create database connection."""
    await initiate_database()


async def close_mongo_connection():
    """Close database connection."""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB!")


def get_database():
    """Get database instance. Returns None if connection is not available."""
    if db.database is None:
        logger.warning("MongoDB connection is not available.")
        return None
    return db.database


def get_collection(collection_name: str):
    """Get a specific collection from the database."""
    return db.database[collection_name]

