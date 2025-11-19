from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    database = None


db = Database()


async def initiate_database():
    """Initialize database connection."""
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            tls=True,
            tlsAllowInvalidCertificates=True,
        )
        db.database = db.client[settings.DATABASE_NAME]

        await db.client.admin.command("ping")
        logger.info("Successfully connected to MongoDB!")
        
        # Initialize Beanie with User model
        await init_beanie(database=db.database, document_models=[User])
        logger.info("Beanie initialized with User model!")

    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
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
    """Get database instance."""
    if db.database is None:
        raise ConnectionError("MongoDB connection is not available.")
    return db.database


def get_collection(collection_name: str):
    """Get a specific collection from the database."""
    return db.database[collection_name]

