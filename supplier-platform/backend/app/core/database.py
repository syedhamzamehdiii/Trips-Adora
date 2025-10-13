from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    database = None


db = Database()


async def connect_to_mongo():
    """Create database connection."""
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.database = db.client[settings.DATABASE_NAME]
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB!")
        
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise


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


async def init_db():
    """Initialize database and Beanie ODM."""
    try:
        # Import models here to avoid circular imports
        from app.models.user import User
        from app.models.product import Product
        from app.models.order import Order
        from app.models.partner import Partner
        from app.models.message import Message
        
        # Connect to MongoDB
        await connect_to_mongo()
        
        # Initialize Beanie with all models
        await init_beanie(
            database=db.database,
            document_models=[
                User,
                Product,
                Order,
                Partner,
                Message,
            ]
        )
        
        logger.info("Beanie initialized successfully!")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

