import time
from typing import Dict, Optional

import httpx

from app.core.config import settings

_CACHE_RATES: Dict[str, float] = {}
_CACHE_EXPIRES_AT: Optional[float] = None
_CACHE_TTL_SECONDS = 60 * 60  # 1 hour


def _normalize_currency_code(raw: Optional[str]) -> str:
  """
  Normalize various human-readable currency labels to ISO codes that
  ExchangeRate-API uses (USD, JPY, PKR, etc.).
  """
  if not raw:
      return "USD"

  s = str(raw).strip().upper()

  # Common full labels from the supplier UI
  mapping = {
      "USD": "USD",
      "$ USD - US DOLLAR": "USD",
      "US DOLLAR": "USD",
      "$ US DOLLAR": "USD",
      "$": "USD",

      "EUR": "EUR",
      "€ EURO": "EUR",
      "EURO": "EUR",

      "JPY": "JPY",
      "JAPANESE YEN": "JPY",
      "¥ JAPANESE YEN": "JPY",
      "YEN": "JPY",

      "PKR": "PKR",
      "PAKISTANI RUPEE": "PKR",
      "RS PAKISTANI RUPEE": "PKR",
      "RS": "PKR",
  }

  if s in mapping:
      return mapping[s]

  # If it's already a 3-letter code, trust it
  if len(s) == 3 and s.isalpha():
      return s

  # Fallback: strip symbols and keep last word
  for sym in ["$", "€", "¥", "RS"]:
      s = s.replace(sym, " ")
  parts = [p for p in s.split() if p.isalpha()]
  if parts:
      key = " ".join(parts)
      return mapping.get(key, "USD")

  return "USD"


async def _get_rates_to_usd() -> Dict[str, float]:
    """
    Fetch and cache conversion rates where base is USD.
    API returns how much 1 USD is worth in each currency.
    """
    global _CACHE_RATES, _CACHE_EXPIRES_AT

    now = time.time()
    if _CACHE_RATES and _CACHE_EXPIRES_AT and now < _CACHE_EXPIRES_AT:
        return _CACHE_RATES

    api_key = getattr(settings, "EXCHANGE_RATE_API_KEY", None)
    if not api_key:
        # If no key configured, behave as if everything is already USD
        return {"USD": 1.0}

    base_url = getattr(
        settings,
        "EXCHANGE_RATE_API_BASE_URL",
        "https://v6.exchangerate-api.com/v6",
    ).rstrip("/")

    url = f"{base_url}/{api_key}/latest/USD"

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    rates = data.get("conversion_rates") or {}
    if not isinstance(rates, dict):
        rates = {}

    # Always ensure USD is present
    rates.setdefault("USD", 1.0)

    _CACHE_RATES = rates
    _CACHE_EXPIRES_AT = now + _CACHE_TTL_SECONDS
    return rates


async def convert_to_usd(amount: float, from_currency: Optional[str]) -> float:
    """
    Convert a numeric amount from `from_currency` to USD.
    If conversion fails or currency is unknown, returns the original amount.
    """
    if amount is None:
        return 0.0

    code = _normalize_currency_code(from_currency)
    if code == "USD":
        return float(amount)

    try:
        rates = await _get_rates_to_usd()
    except Exception:
        # On any API error, just return original amount
        return float(amount)

    rate = rates.get(code)
    if not rate:
        return float(amount)

    try:
        # conversion_rates[code] is "how much 1 USD is in that currency"
        # so amount_in_usd = amount_in_currency / rate
        return float(amount) / float(rate)
    except Exception:
        return float(amount)


