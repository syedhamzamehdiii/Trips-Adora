# tests/test_products.py
import pytest
from httpx import AsyncClient


@pytest.fixture
async def auth_headers(client: AsyncClient, test_user):
    """Get authentication headers."""
    await client.post("/api/v1/auth/register", json=test_user)
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"],
        }
    )
    token = login_response.json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_product(client: AsyncClient, auth_headers):
    """Test product creation."""
    product_data = {
        "name": "Test Product",
        "description": "Test Description",
        "category": "electronics",
        "price": 99.99,
        "stock": 10,
        "currency": "usd",
    }
    
    response = await client.post(
        "/api/v1/products/",
        json=product_data,
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == product_data["name"]
    assert data["price"] == product_data["price"]


@pytest.mark.asyncio
async def test_get_products(client: AsyncClient, auth_headers):
    """Test get products."""
    response = await client.get(
        "/api/v1/products/",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_get_product(client: AsyncClient, auth_headers):
    """Test get single product."""
    # Create a product first
    product_data = {
        "name": "Test Product",
        "description": "Test Description",
        "category": "electronics",
        "price": 99.99,
        "stock": 10,
    }
    create_response = await client.post(
        "/api/v1/products/",
        json=product_data,
        headers=auth_headers
    )
    product_id = create_response.json()["id"]
    
    # Get the product
    response = await client.get(
        f"/api/v1/products/{product_id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == product_data["name"]


@pytest.mark.asyncio
async def test_update_product(client: AsyncClient, auth_headers):
    """Test product update."""
    # Create a product
    product_data = {
        "name": "Test Product",
        "description": "Test Description",
        "category": "electronics",
        "price": 99.99,
        "stock": 10,
    }
    create_response = await client.post(
        "/api/v1/products/",
        json=product_data,
        headers=auth_headers
    )
    product_id = create_response.json()["id"]
    
    # Update the product
    update_data = {"name": "Updated Product", "price": 149.99}
    response = await client.put(
        f"/api/v1/products/{product_id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["price"] == update_data["price"]


@pytest.mark.asyncio
async def test_delete_product(client: AsyncClient, auth_headers):
    """Test product deletion."""
    # Create a product
    product_data = {
        "name": "Test Product",
        "description": "Test Description",
        "category": "electronics",
        "price": 99.99,
        "stock": 10,
    }
    create_response = await client.post(
        "/api/v1/products/",
        json=product_data,
        headers=auth_headers
    )
    product_id = create_response.json()["id"]
    
    # Delete the product
    response = await client.delete(
        f"/api/v1/products/{product_id}",
        headers=auth_headers
    )
    assert response.status_code == 204