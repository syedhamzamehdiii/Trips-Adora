import React, { useEffect, useRef } from 'react'
import productService from '../services/productService'

const GlobalCacheSync = () => {
  const syncingRef = useRef(false)
  const lastPayloadRef = useRef('')

  const buildPayload = () => {
    try {
      const allProductsRaw = localStorage.getItem('all_products')
      const allProducts = allProductsRaw ? JSON.parse(allProductsRaw) : []
      const published = Array.isArray(allProducts) ? allProducts.filter(p => p?.status === 'Published') : []
      const productsWithFullData = published.map(p => {
        const key = `product_full_${p.id}`
        let fullData = null
        try {
          const raw = localStorage.getItem(key)
          fullData = raw ? JSON.parse(raw) : null
        } catch (_) {}
        return { ...p, _full_data: fullData }
      })
      return productsWithFullData
    } catch (_) {
      return []
    }
  }

  const syncNow = async () => {
    if (syncingRef.current) return
    syncingRef.current = true
    try {
      const payload = buildPayload()
      const fingerprint = JSON.stringify(payload.map(p => ({ id: p.id, updated: p._full_data?.lastModified || '' })))
      if (fingerprint === lastPayloadRef.current) return

      await productService.syncToBackendCache(payload)
      for (const p of payload) {
        if (p._full_data) {
          try { await productService.syncFullProductData(p.id, p._full_data) } catch (_) {}
        }
      }
      lastPayloadRef.current = fingerprint
    } finally {
      syncingRef.current = false
    }
  }

  useEffect(() => {
    // Initial sync shortly after load
    const t = setTimeout(syncNow, 500)
    // Periodic sync
    const iv = setInterval(syncNow, 5000)
    // React to localStorage changes (other tabs/windows)
    const onStorage = (e) => {
      if (!e) return
      if (e.key === 'all_products' || (e.key && e.key.startsWith('product_full_'))) {
        syncNow()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      clearTimeout(t)
      clearInterval(iv)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return null
}

export default GlobalCacheSync


