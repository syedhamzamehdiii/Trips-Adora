"""
In-memory cache to store products from supplier platform localStorage.
This allows customer platform (public) to access products when the supplier DB isn't populated.
Adds best‑effort persistence to disk so cache survives supplier backend restarts.
"""
from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import json

# ---- In-memory state ----
_products_cache: Dict[str, dict] = {}
_last_sync: Optional[datetime] = None

# ---- Persistence target (backend/uploads/products/cache.json) ----
_BASE_DIR = Path(__file__).resolve().parents[1]  # .../app
_CACHE_FILE = _BASE_DIR.parent / "uploads" / "products" / "cache.json"


class LocalStorageCache:
    """Cache for supplier-side localStorage products with simple persistence."""

    # ---------- Public API ----------
    @staticmethod
    def sync_products(products: List[dict]) -> int:
        """Replace cache with currently published products from the supplier UI.
        Any product not present in the new list will be removed from cache.
        """
        global _products_cache, _last_sync

        published_ids: set[str] = set()
        new_cache: Dict[str, dict] = {}
        for p in products or []:
            status = (p.get("status") or "").lower()
            if status == "published":
                pid = str(p.get("id", ""))
                if not pid:
                    continue
                # Normalise status to a consistent value
                p["status"] = "Published"
                new_cache[pid] = p
                published_ids.add(pid)

        _products_cache = new_cache
        _last_sync = datetime.utcnow()
        LocalStorageCache._save_to_disk()
        return len(_products_cache)

    @staticmethod
    def sync_full_product_data(product_id: str, full_data: dict) -> bool:
        """Attach full product payload (including images) for a specific product."""
        global _products_cache, _last_sync
        pid = str(product_id)
        if not pid:
            return False

        if pid not in _products_cache:
            _products_cache[pid] = {
                "id": pid,
                "status": "Published",
                "name": full_data.get("productTitle", "Untitled Product"),
                "revenue": 0,
            }

        _products_cache[pid]["_full_data"] = full_data or {}
        _last_sync = datetime.utcnow()
        LocalStorageCache._save_to_disk()
        return True

    @staticmethod
    def get_published_products() -> List[dict]:
        """Return currently cached published products."""
        return [
            p for p in _products_cache.values()
            if (p.get("status") or "").lower() == "published"
            or p.get("status") == "Published"
        ]

    @staticmethod
    def get_product_by_id(product_id: str) -> Optional[dict]:
        return _products_cache.get(str(product_id))

    @staticmethod
    def clear_cache() -> None:
        global _products_cache, _last_sync
        _products_cache = {}
        _last_sync = None
        LocalStorageCache._save_to_disk()

    @staticmethod
    def get_cache_stats() -> dict:
        return {
            "total_products": len(_products_cache),
            "published_count": sum(1 for p in _products_cache.values() if (p.get("status") or "").lower() == "published" or p.get("status") == "Published"),
            "last_sync": _last_sync.isoformat() if _last_sync else None,
        }

    @staticmethod
    def load_from_disk() -> int:
        """Load cache from disk if a previous snapshot exists. Returns count loaded."""
        global _products_cache, _last_sync
        try:
            if not _CACHE_FILE.exists():
                return 0
            with _CACHE_FILE.open("r", encoding="utf-8") as f:
                data = json.load(f)
            items = data.get("products") or []
            _products_cache = {str(item.get("id")): item for item in items}
            last = data.get("last_sync")
            try:
                _last_sync = datetime.fromisoformat(last) if last else None
            except Exception:
                _last_sync = None
            print(f"🔁 Loaded {len(_products_cache)} products from cache file")
            return len(_products_cache)
        except Exception as exc:
            print(f"⚠️ Failed to load localstorage cache from disk: {exc}")
            return 0

    # ---------- Internal helpers ----------
    @staticmethod
    def _ensure_dir() -> None:
        try:
            _CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
        except Exception:
            pass

    @staticmethod
    def _save_to_disk() -> None:
        try:
            LocalStorageCache._ensure_dir()
            data = {
                "last_sync": _last_sync.isoformat() if _last_sync else None,
                "products": list(_products_cache.values()),
            }
            with _CACHE_FILE.open("w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
        except Exception as exc:
            # Non-fatal; just log
            print(f"⚠️ Failed to persist localstorage cache: {exc}")

