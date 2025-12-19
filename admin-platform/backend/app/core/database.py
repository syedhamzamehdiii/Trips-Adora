from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.supplier import Supplier
from app.models.supplier_onboarding import SupplierOnboarding
from app.models.user import User
from app.models.sub_admin import SubAdmin
import logging
import asyncio

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    database = None


db = Database()


async def initiate_database():
    """Initialize database and Beanie ODM with optimized connection settings."""
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            # Connection pool settings - increased for better resilience
            maxPoolSize=100,
            minPoolSize=5,
            maxIdleTimeMS=45000,
            # Timeout settings - increased for better reliability
            serverSelectionTimeoutMS=60000,  # Increased from 30s to 60s
            connectTimeoutMS=30000,  # Increased from 20s to 30s
            socketTimeoutMS=120000,  # Increased from 60s to 120s
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
                await db.client.admin.command('ping')
                logger.info("✅ Successfully connected to MongoDB!")
                break
            except Exception as ping_error:
                if attempt < max_retries - 1:
                    logger.warning(f"MongoDB ping failed (attempt {attempt + 1}/{max_retries}), retrying...")
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"❌ Failed to connect to MongoDB after {max_retries} attempts: {ping_error}")
                    raise
        
        # Initialize Beanie with all document models
        await init_beanie(
            database=db.database,
            document_models=[Supplier, SupplierOnboarding, User, SubAdmin]
        )
        logger.info("✅ Beanie initialized successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error connecting to MongoDB: {e}")
        # Don't raise immediately - allow app to start and retry later
        logger.warning("⚠️  Application will continue but database operations may fail")


async def connect_to_mongo():
    """Create database connection."""
    await initiate_database()


async def close_mongo_connection():
    """Close database connection gracefully."""
    if db.client:
        try:
            # Give pending operations a moment to complete
            await asyncio.sleep(0.1)
            # Close the connection
            db.client.close()
            logger.info("✅ Disconnected from MongoDB!")
        except Exception as e:
            # Suppress errors during shutdown - connection will close anyway
            logger.debug(f"MongoDB close error (ignored during shutdown): {e}")


def get_database():
    """Get database instance."""
    return db.database


def get_collection(collection_name: str):
    """Get a specific collection from the database."""
    return db.database[collection_name]
