from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, Field, ConfigDict, validator


class WalletBalances(BaseModel):
    total_balance: float = 0.0
    refund_balance: float = 0.0
    penalty: float = 0.0
    currency: str = "USD"
    simulated_payment_amount: Optional[float] = Field(default=None, description="Amount of any pending simulated payment")


class WalletPreferences(BaseModel):
    show_prices_in_selected_currency: bool = True
    show_personalized_recommendations: bool = True
    save_search_history: bool = True


class WalletPaymentMethod(BaseModel):
    id: str
    method_type: Literal["card", "paypal", "payoneer", "bank_transfer", "other"] = "card"
    brand: Optional[str] = None
    label: Optional[str] = None
    last4: Optional[str] = None
    exp_month: Optional[int] = Field(default=None, ge=1, le=12)
    exp_year: Optional[int] = Field(default=None, ge=1900)
    cardholder: Optional[str] = None
    is_default: bool = False
    added_at: Optional[str] = None
    account_identifier: Optional[str] = None
    metadata: Optional[dict] = None

    @validator("brand", "label", pre=True, always=True)
    def _lowercase_brand(cls, value: Optional[str]) -> Optional[str]:
        if isinstance(value, str):
            return value.strip()
        return value


class WalletBankAccount(BaseModel):
    id: str
    account_holder: str
    bank_name: str
    last4: Optional[str] = None
    country: Optional[str] = None
    currency: str = "USD"
    swift: Optional[str] = None
    routing_number_last4: Optional[str] = None
    account_type: Optional[str] = None
    added_at: Optional[str] = None


class WalletTransaction(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    direction: Literal["debit", "credit"] = "debit"
    amount: float
    currency: str = "USD"
    status: Optional[str] = None
    occurred_at: str
    booking_id: Optional[str] = None


class WalletResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    user_id: str
    balances: WalletBalances = Field(default_factory=WalletBalances)
    preferences: WalletPreferences = Field(default_factory=WalletPreferences)
    payment_methods: List[WalletPaymentMethod] = Field(default_factory=list)
    bank_accounts: List[WalletBankAccount] = Field(default_factory=list)
    payment_history: List[WalletTransaction] = Field(default_factory=list)
    recent_transactions: List[WalletTransaction] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class WalletUpdateRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="allow")

    balances: Optional[WalletBalances] = None
    preferences: Optional[WalletPreferences] = None
    recent_transactions: Optional[List[WalletTransaction]] = None
    payment_history: Optional[List[WalletTransaction]] = None


class PaymentMethodCreateRequest(BaseModel):
    method_type: Literal["card", "paypal", "payoneer", "bank_transfer", "other"] = "card"
    brand: Optional[str] = None
    label: Optional[str] = None
    last4: Optional[str] = None
    exp_month: Optional[int] = Field(default=None, ge=1, le=12)
    exp_year: Optional[int] = Field(default=None, ge=1900)
    cardholder: Optional[str] = None
    is_default: bool = False
    account_identifier: Optional[str] = None
    metadata: Optional[dict] = None


class BankAccountCreateRequest(BaseModel):
    account_holder: str
    bank_name: str
    account_number: Optional[str] = Field(default=None, description="Raw account number, used only to derive last4")
    country: Optional[str] = None
    currency: str = "USD"
    swift: Optional[str] = None
    routing_number: Optional[str] = None
    account_type: Optional[str] = None


