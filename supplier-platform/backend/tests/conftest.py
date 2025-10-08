import pytest
import asyncio
from httpx import AsyncClient
from app.main import app
from app.core.database import connect_to_database, close_database_connection
from app.models.user import User


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_app():
    """Create a test application."""
    await connect_to_database()
    yield app
    await close_database_connection()


@pytest.fixture
async def client(test_app):
    """Create a test client."""
    async with AsyncClient(app=test_app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user():
    """Create a test user data."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123",
        "full_name": "Test User",
        "business_name": "Test Business",
        "phone": "+1234567890",
        "address": "123 Test St",
        "country": "US",
    }


@pytest.fixture
async def authenticated_client(client: AsyncClient, test_user):
    """Create an authenticated test client."""
    # Register user
    await client.post("/api/v1/auth/register", json=test_user)
    
    # Login
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"],
        }
    )
    token = login_response.json()["token"]
    
    # Set authorization header
    client.headers.update({"Authorization": f"Bearer {token}"})
    
    yield client


@pytest.fixture
async def test_product():
    """Create test product data."""
    return {
        "name": "Test Product",
        "description": "Test product description",
        "category": "electronics",
        "price": 99.99,
        "stock": 50,
        "currency": "usd",
        "sku": "TEST-001",
        "weight": 1.5,
    }