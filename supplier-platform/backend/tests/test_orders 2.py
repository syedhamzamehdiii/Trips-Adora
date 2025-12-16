# tests/test_orders.py
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_orders(client: AsyncClient, auth_headers):
    """Test get orders."""
    response = await client.get(
        "/api/v1/orders/",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "orders" in data or isinstance(data, dict)


@pytest.mark.asyncio
async def test_get_order_unauthorized(client: AsyncClient):
    """Test get orders without authentication."""
    response = await client.get("/api/v1/orders/")
    assert response.status_code == 401