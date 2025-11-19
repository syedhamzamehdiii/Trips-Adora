from __future__ import annotations

from fastapi import APIRouter, HTTPException, Path, status

from app.schemas.wallet import (
    BankAccountCreateRequest,
    PaymentMethodCreateRequest,
    WalletResponse,
    WalletUpdateRequest,
)
from app.services.wallet_service import WalletService

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.get("/{user_id}", response_model=WalletResponse)
async def get_wallet(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    wallet = await WalletService.get_wallet(user_id)
    if not wallet:
        wallet = await WalletService.ensure_wallet(user_id)
        wallet = WalletService._prepare(wallet)
    return WalletResponse(**wallet)


@router.patch("/{user_id}", response_model=WalletResponse)
async def update_wallet(
    request: WalletUpdateRequest,
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    updated = await WalletService.update_wallet(user_id, request)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found",
        )
    return WalletResponse(**updated)


@router.post("/{user_id}/payment-methods", response_model=WalletResponse, status_code=status.HTTP_201_CREATED)
async def add_payment_method(
    request: PaymentMethodCreateRequest,
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    wallet = await WalletService.add_payment_method(user_id, request)
    return WalletResponse(**wallet)


@router.post(
    "/{user_id}/payment-methods/{method_id}/default",
    response_model=WalletResponse,
    status_code=status.HTTP_200_OK,
)
async def set_default_payment_method(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
    method_id: str = Path(..., description="Payment method identifier"),
):
    wallet = await WalletService.set_default_payment_method(user_id, method_id)
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
    return WalletResponse(**wallet)


@router.delete(
    "/{user_id}/payment-methods/{method_id}",
    response_model=WalletResponse,
    status_code=status.HTTP_200_OK,
)
async def remove_payment_method(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
    method_id: str = Path(..., description="Payment method identifier"),
):
    wallet = await WalletService.remove_payment_method(user_id, method_id)
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
    return WalletResponse(**wallet)


@router.post("/{user_id}/bank-accounts", response_model=WalletResponse, status_code=status.HTTP_201_CREATED)
async def add_bank_account(
    request: BankAccountCreateRequest,
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
):
    wallet = await WalletService.add_bank_account(user_id, request)
    return WalletResponse(**wallet)


@router.delete(
    "/{user_id}/bank-accounts/{account_id}",
    response_model=WalletResponse,
    status_code=status.HTTP_200_OK,
)
async def remove_bank_account(
    user_id: str = Path(..., description="Customer identifier, e.g. email slug"),
    account_id: str = Path(..., description="Bank account identifier"),
):
    wallet = await WalletService.remove_bank_account(user_id, account_id)
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
    return WalletResponse(**wallet)


