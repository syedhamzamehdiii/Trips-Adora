from __future__ import annotations

from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleListResponse,
    VehicleResponse,
    VehicleUpdate,
)
from app.services.vehicle_service import VehicleService


router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("/", response_model=VehicleListResponse)
async def list_vehicles(
    product_id: Optional[str] = Query(
        None, description="Filter vehicles by product/draft identifier"
    ),
    current_user: User = Depends(get_current_user),
) -> VehicleListResponse:
    vehicles = await VehicleService.list_for_supplier(
        str(current_user.id), product_id=product_id
    )
    return VehicleListResponse(vehicles=[VehicleResponse(**vehicle.model_dump(exclude={"id"}), id=str(vehicle.id)) for vehicle in vehicles])


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    payload: VehicleCreate,
    current_user: User = Depends(get_current_user),
) -> VehicleResponse:
    payload_dict = payload.dict(exclude_unset=False, exclude_none=False)
    
    # Ensure product_id is normalized if it exists
    if payload_dict.get('product_id') is not None:
        payload_dict['product_id'] = str(payload_dict['product_id']).strip()
    
    document = await VehicleService.create_vehicle(
        str(current_user.id),
        payload_dict,
    )
    return VehicleResponse(**document.model_dump(exclude={"id"}), id=str(document.id))


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    payload: VehicleUpdate,
    vehicle_id: str = Path(..., description="Vehicle identifier"),
    current_user: User = Depends(get_current_user),
) -> VehicleResponse:
    updates = payload.dict(exclude_unset=True, exclude_none=False)
    # Ensure product_id is normalized if it exists
    if 'product_id' in updates and updates['product_id'] is not None:
        updates['product_id'] = str(updates['product_id']).strip()
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No updates provided",
        )

    document = await VehicleService.update_vehicle(
        str(current_user.id),
        vehicle_id,
        updates,
    )
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    return VehicleResponse(**document.model_dump(exclude={"id"}), id=str(document.id))


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: str = Path(..., description="Vehicle identifier"),
    current_user: User = Depends(get_current_user),
) -> Response:
    deleted = await VehicleService.delete_vehicle(str(current_user.id), vehicle_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)

