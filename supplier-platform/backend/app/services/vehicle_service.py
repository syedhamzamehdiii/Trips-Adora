from __future__ import annotations

from typing import Dict, List, Optional

from beanie import PydanticObjectId

from app.models.vehicle import SupplierVehicle


class VehicleService:
    """CRUD helpers around supplier vehicle options."""

    @staticmethod
    async def list_for_supplier(
        supplier_id: str, product_id: Optional[str] = None
    ) -> List[SupplierVehicle]:
        """
        List vehicles for a supplier.

        - When product_id is provided, returns vehicles tied to that specific product.
        - When product_id is omitted/empty, returns all active vehicles for the supplier
          across all products. This is used by the Availability Calendar when the user
          wants to manage availability per vehicle instead of per product.
        """

        # Base query with supplier and active status
        query: dict = {"supplier_id": supplier_id, "is_active": True}

        # Optionally scope to a specific product
        if product_id and isinstance(product_id, str) and product_id.strip():
            query["product_id"] = product_id.strip()

        return await SupplierVehicle.find(query).sort("-created_at").to_list()

    @staticmethod
    async def get_vehicle(
        supplier_id: str, vehicle_id: str
    ) -> Optional[SupplierVehicle]:
        try:
            document = await SupplierVehicle.get(PydanticObjectId(vehicle_id))
        except Exception:
            return None

        if not document or document.supplier_id != supplier_id:
            return None

        return document

    @staticmethod
    async def create_vehicle(
        supplier_id: str, payload: Dict[str, object]
    ) -> SupplierVehicle:
        document = SupplierVehicle(
            supplier_id=supplier_id,
            **payload,
        )
        await document.insert()
        
        # Reload the document to ensure it's fully persisted
        try:
            reloaded = await SupplierVehicle.get(document.id)
            return reloaded if reloaded else document
        except Exception:
            return document

    @staticmethod
    async def update_vehicle(
        supplier_id: str, vehicle_id: str, payload: Dict[str, object]
    ) -> Optional[SupplierVehicle]:
        document = await VehicleService.get_vehicle(supplier_id, vehicle_id)
        if not document:
            return None

        for key, value in payload.items():
            setattr(document, key, value)

        await document.touch()
        await document.save()
        return document

    @staticmethod
    async def delete_vehicle(supplier_id: str, vehicle_id: str) -> bool:
        """
        Delete a vehicle from MongoDB.
        This performs a hard delete - the vehicle is completely removed from the database.
        The customer platform will not see deleted vehicles because it filters by is_active=True.
        """
        document = await VehicleService.get_vehicle(supplier_id, vehicle_id)
        if not document:
            return False

        # Hard delete - completely remove from MongoDB
        await document.delete()
        return True

