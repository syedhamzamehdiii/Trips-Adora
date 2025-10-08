# tests/test_auth.py
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient, test_user):
    """Test user registration."""
    response = await client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["email"] == test_user["email"]


@pytest.mark.asyncio
async def test_login(client: AsyncClient, test_user):
    """Test user login."""
    # First register
    await client.post("/api/v1/auth/register", json=test_user)
    
    # Then login
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"],
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "user" in data


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with invalid credentials."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "invalid@example.com",
            "password": "wrongpassword",
        }
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, test_user):
    """Test get current user."""
    # Register and login
    await client.post("/api/v1/auth/register", json=test_user)
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"],
        }
    )
    token = login_response.json()["token"]
    
    # Get current user
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]
