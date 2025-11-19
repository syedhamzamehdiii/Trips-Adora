from __future__ import annotations

from typing import Dict, List, Optional

from beanie import PydanticObjectId

from app.models.vehicle import SupplierVehicle


class VehicleService:
    """CRUD helpers around supplier vehicle options."""

    @staticmethod
    async def list_for_supplier(supplier_id: str) -> List[SupplierVehicle]:
        return await SupplierVehicle.find(
            {"supplier_id": supplier_id, "is_active": True}
        ).sort("-created_at").to_list()

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
        document = await VehicleService.get_vehicle(supplier_id, vehicle_id)
        if not document:
            return False

        await document.delete()
        return True

