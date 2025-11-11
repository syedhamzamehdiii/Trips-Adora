from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from beanie.operators import Eq

from app.models.account_settings import SupplierAccountSettings


class SupplierSettingsService:
    @staticmethod
    async def _get_document(supplier_id: str) -> Optional[SupplierAccountSettings]:
        return await SupplierAccountSettings.find_one(Eq(SupplierAccountSettings.supplier_id, supplier_id))

    @staticmethod
    async def get_document(supplier_id: str) -> Optional[SupplierAccountSettings]:
        return await SupplierSettingsService._get_document(supplier_id)

    @staticmethod
    async def get_settings(supplier_id: str) -> Dict[str, Any]:
        doc = await SupplierSettingsService._get_document(supplier_id)
        if not doc or not doc.data:
            return {}
        return doc.data

    @staticmethod
    async def upsert_settings(supplier_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload = payload or {}
        doc = await SupplierSettingsService._get_document(supplier_id)
        now = datetime.utcnow()

        if doc:
            doc.data = payload
            doc.updated_at = now
            await doc.save()
            return doc.data

        doc = SupplierAccountSettings(
            supplier_id=supplier_id,
            data=payload,
            created_at=now,
            updated_at=now,
        )
        await doc.insert()
        return doc.data

    @staticmethod
    async def update_section(supplier_id: str, section: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload = payload or {}
        doc = await SupplierSettingsService._get_document(supplier_id)
        now = datetime.utcnow()

        if not doc:
            doc = SupplierAccountSettings(
                supplier_id=supplier_id,
                data={section: payload},
                created_at=now,
                updated_at=now,
            )
            await doc.insert()
            return doc.data

        doc.data = doc.data or {}
        existing_section = doc.data.get(section)
        if isinstance(existing_section, dict) and isinstance(payload, dict):
            merged_section = {**existing_section, **payload}
        else:
            merged_section = payload

        doc.data[section] = merged_section
        doc.updated_at = now
        await doc.save()
        return doc.data

