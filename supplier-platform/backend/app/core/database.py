from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.coi_document import COIDocument
from app.models.product import Product
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    database = None


db = Database()


async def initiate_database():
    """Initialize database and Beanie ODM."""
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.database = db.client[settings.DATABASE_NAME]
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB!")
        
        # Initialize Beanie with all document models
        await init_beanie(
            database=db.database,
            document_models=[User, COIDocument, Product]
        )
        logger.info("Beanie initialized successfully!")
        
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise


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
    return db.database


def get_collection(collection_name: str):
    """Get a specific collection from the database."""
    return db.database[collection_name]

