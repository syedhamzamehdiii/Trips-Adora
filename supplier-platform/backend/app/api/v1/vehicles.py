from __future__ import annotations

from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

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
async def list_vehicles(current_user: User = Depends(get_current_user)) -> VehicleListResponse:
    vehicles = await VehicleService.list_for_supplier(str(current_user.id))
    return VehicleListResponse(vehicles=[VehicleResponse(**vehicle.model_dump()) for vehicle in vehicles])


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    payload: VehicleCreate,
    current_user: User = Depends(get_current_user),
) -> VehicleResponse:
    document = await VehicleService.create_vehicle(
        str(current_user.id),
        payload.dict(exclude_unset=True),
    )
    return VehicleResponse(**document.model_dump())


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    payload: VehicleUpdate,
    vehicle_id: str = Path(..., description="Vehicle identifier"),
    current_user: User = Depends(get_current_user),
) -> VehicleResponse:
    updates = payload.dict(exclude_unset=True)
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

    return VehicleResponse(**document.model_dump())


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

