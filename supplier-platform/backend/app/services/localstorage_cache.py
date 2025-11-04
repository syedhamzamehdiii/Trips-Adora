"""
In-memory cache to store products from supplier platform localStorage.
This allows customer platform to access products when database is not available.
"""
from typing import Dict, List, Optional
from datetime import datetime

# In-memory storage for products
_products_cache: Dict[str, dict] = {}
_last_sync: Optional[datetime] = None


class LocalStorageCache:
    """Cache for localStorage products"""
    
    @staticmethod
    def sync_products(products: List[dict]) -> int:
        """
        Sync products from localStorage to cache.
        Called by supplier platform frontend.
        This will REMOVE products that are no longer published (deleted, moved to draft, etc.)
        """
        global _products_cache, _last_sync
        
        # Get all published product IDs from the incoming list
        published_product_ids = set()
        count = 0
        
        for product in products:
            # Check status in multiple formats (Published, published, etc.)
            status = product.get('status', '').lower() if product.get('status') else ''
            if status == 'published':
                product_id = str(product.get('id', ''))
                if product_id:
                    # Ensure status is set correctly
                    product['status'] = 'Published'
                    _products_cache[product_id] = product
                    published_product_ids.add(product_id)
                    count += 1
        
        # Remove products from cache that are no longer published
        # (they were deleted, moved to draft, etc.)
        products_to_remove = []
        for cached_id in _products_cache.keys():
            if cached_id not in published_product_ids:
                products_to_remove.append(cached_id)
        
        for product_id in products_to_remove:
            del _products_cache[product_id]
        
        if products_to_remove:
            print(f"🗑️ Removed {len(products_to_remove)} unpublished products from cache")
        
        _last_sync = datetime.utcnow()
        return count
    
    @staticmethod
    def sync_full_product_data(product_id: str, full_data: dict) -> bool:
        """
        Sync full product data (including images) for a specific product.
        """
        global _products_cache
        
        product_id_str = str(product_id)
        # If product doesn't exist in cache, create it from full_data
        if product_id_str not in _products_cache:
            _products_cache[product_id_str] = {
                'id': product_id_str,
                'status': 'Published',
                'name': full_data.get('productTitle', 'Untitled Product'),
                'revenue': 0
            }
        
        _products_cache[product_id_str]['_full_data'] = full_data
        return True
    
    @staticmethod
    def get_published_products() -> List[dict]:
        """
        Get all published products from cache.
        """
        return [
            product for product in _products_cache.values()
            if product.get('status', '').lower() == 'published' or product.get('status') == 'Published'
        ]
    
    @staticmethod
    def get_product_by_id(product_id: str) -> Optional[dict]:
        """
        Get a specific product by ID.
        """
        return _products_cache.get(str(product_id))
    
    @staticmethod
    def clear_cache():
        """
        Clear the cache.
        """
        global _products_cache, _last_sync
        _products_cache = {}
        _last_sync = None
    
    @staticmethod
    def get_cache_stats() -> dict:
        """
        Get cache statistics.
        """
        return {
            'total_products': len(_products_cache),
            'published_count': len([p for p in _products_cache.values() if p.get('status', '').lower() == 'published' or p.get('status') == 'Published']),
            'last_sync': _last_sync.isoformat() if _last_sync else None
        }

