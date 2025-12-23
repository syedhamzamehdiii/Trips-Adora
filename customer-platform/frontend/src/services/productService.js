// Import config to ensure consistent API base URL
import { config } from '../config';

// Always use config.API_BASE_URL to ensure we use the correct production URL
// config.API_BASE_URL is 'https://tripsadora.com/api' (from config.js)
// We need to append /v1 to get the full API path: 'https://tripsadora.com/api/v1'
const getApiBaseUrl = () => {
  const baseUrl = config.API_BASE_URL || 'https://tripsadora.com/api';
  // Ensure baseUrl ends with /api, then append /v1
  if (baseUrl.endsWith('/api/v1')) {
    return baseUrl; // Already has /api/v1
  } else if (baseUrl.endsWith('/api')) {
    return `${baseUrl}/v1`; // Has /api, append /v1
  } else {
    return `${baseUrl}/api/v1`; // No /api, append /api/v1
  }
};

const API_BASE_URL = getApiBaseUrl();
// Remove fallback to supplier API - customer endpoints should only use customer API
const FALLBACK_API_BASE_URL = null;

// Cache configuration
const CACHE_KEYS = {
  PRODUCTS: 'published_products_cache',
  PRODUCTS_TIMESTAMP: 'published_products_cache_ts',
  TOP_PICKS: 'top_picks_cache',
  TOP_PICKS_TIMESTAMP: 'top_picks_cache_ts',
  PRODUCT_DETAIL: 'product_detail_cache_',
  PRODUCT_DETAIL_TIMESTAMP: 'product_detail_cache_ts_',
};

const CACHE_TTL = {
  PRODUCTS: 10 * 60 * 1000, // 10 minutes
  TOP_PICKS: 5 * 60 * 1000, // 5 minutes
  PRODUCT_DETAIL: 15 * 60 * 1000, // 15 minutes
};

// Simple helper to build API path with base URL/fallback
const apiPath = (path) => path.startsWith('/') ? path : `/${path}`;

const normalizeImageSource = (source) => {
  if (!source) return null;

  const normalizeString = (value) => {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (!trimmed.startsWith('http')) return null;
    if (!trimmed.includes('res.cloudinary.com')) return null;
    return trimmed;
  };

  if (typeof source === 'string') {
    return normalizeString(source);
  }

  if (typeof source === 'object') {
    return normalizeImageSource(source.url || source.src || source.href || null);
  }

  return null;
};

async function fetchJsonWithFallback(path, options = {}) {
  // Customer endpoints should only use customer API, no fallback to supplier API
  const endpoints = [
    API_BASE_URL ? `${API_BASE_URL}${path}` : null,
  ].filter(Boolean);

  let lastError;
  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    // Use provided signal if available, otherwise use our timeout controller's signal
    // If both exist, create a merged signal that aborts when either is aborted
    let signal = controller.signal;
    let cleanupHandlers = [];
    
    if (options.signal) {
      const mergedController = new AbortController();
      const abortHandler = () => mergedController.abort();
      
      controller.signal.addEventListener('abort', abortHandler);
      options.signal.addEventListener('abort', abortHandler);
      cleanupHandlers = [
        () => controller.signal.removeEventListener('abort', abortHandler),
        () => options.signal.removeEventListener('abort', abortHandler)
      ];
      
      signal = mergedController.signal;
    }
    
    const requestOptions = { ...options, signal };
    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeout);
      
      if (!response.ok) {
        cleanupHandlers.forEach(cleanup => cleanup());
        throw new Error(`Request to ${url} failed with status ${response.status}`);
      }
      const data = await response.json();
      // Clean up event listeners
      cleanupHandlers.forEach(cleanup => cleanup());
      return data;
    } catch (error) {
      clearTimeout(timeout);
      // Clean up event listeners
      cleanupHandlers.forEach(cleanup => cleanup());
      
      // Handle abort errors - they're expected when components unmount or timeouts occur
      const isAbortError = error.name === 'AbortError' || 
                          error.message?.includes('aborted') ||
                          error.message?.includes('signal is aborted');
      
      if (isAbortError) {
        // If this is the last endpoint and it was aborted, throw the error
        // Otherwise, continue to next endpoint silently
        if (i === endpoints.length - 1) {
          throw error;
        }
        // Continue to next endpoint for abort errors (might be timeout, try next)
        continue;
      }
      
      lastError = error;
      console.warn(`[API] Request failed (${url}): ${error?.message || error}`);
    }
  }

  throw lastError || new Error('All API endpoints failed');
}

// Helper functions for cache management
const getCachedData = (key, timestampKey) => {
  try {
    const cached = localStorage.getItem(key);
    const timestamp = localStorage.getItem(timestampKey);
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      return { data: JSON.parse(cached), age, timestamp: parseInt(timestamp, 10) };
    }
  } catch (_) {}
  return null;
};

const setCachedData = (key, timestampKey, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(timestampKey, Date.now().toString());
  } catch (_) {}
};

const isCacheValid = (cacheInfo, ttl) => {
  return cacheInfo && cacheInfo.age < ttl;
};


/**
 * Fetch published products from backend, with smart caching
 * Returns cached data immediately, refreshes in background if stale
 */
export const getPublishedProducts = async (params = {}, useCache = true) => {
  // Availability (inactive dates) must be real-time, so we intentionally
  // bypass the local cache here and always fetch fresh data from the API.
  // This guarantees that product deactivations from the supplier platform
  // are reflected immediately on the customer side.
  return await fetchFreshProducts(params);
};

/**
 * Fetch fresh products from API
 */
const fetchFreshProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.category) queryParams.append('category', params.category);
    if (params.destination) queryParams.append('destination', params.destination);
    if (params.search) queryParams.append('search', params.search);
    
    const query = `/products/published${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const data = await fetchJsonWithFallback(query, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (data && data.products && Array.isArray(data.products)) {
      const isSimpleQuery = !params.search && !params.category && !params.destination && (params.page === 1 || !params.page);
      if (isSimpleQuery && data.products.length > 0) {
        setCachedData(CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCTS_TIMESTAMP, data.products);
      }
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch published products', error);
  }
  
  return {
    products: [],
    total: 0,
    page: params.page || 1,
    page_size: params.page_size || 20,
    total_pages: 0
  };
};

// Return last seen published products synchronously from localStorage (for instant rendering)
export const getCachedPublishedProductsSync = () => {
  // Availability must be real-time; disable synchronous cache usage so that
  // customer listings always reflect the latest supplier Availability state.
  return [];
};

/**
 * Fetch top picks products, with smart caching
 * Returns cached data immediately, refreshes in background if stale
 */
export const getTopPicks = async (limit = 4, useCache = true) => {
  // Check cache first
  if (useCache) {
    const cached = getCachedData(CACHE_KEYS.TOP_PICKS, CACHE_KEYS.TOP_PICKS_TIMESTAMP);
    if (cached && isCacheValid(cached, CACHE_TTL.TOP_PICKS)) {
      const products = Array.isArray(cached.data) ? cached.data.slice(0, limit) : [];
      
      // Refresh in background if cache is getting old
      if (cached.age > CACHE_TTL.TOP_PICKS * 0.5) {
        fetchFreshTopPicks(limit).catch(() => {}); // Silent background refresh
      }
      
      return products;
    }
  }
  
  // No valid cache, fetch fresh data
  return await fetchFreshTopPicks(limit);
};

/**
 * Fetch fresh top picks from API
 */
const fetchFreshTopPicks = async (limit = 4) => {
  try {
    const data = await fetchJsonWithFallback(`/products/top-picks?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (data && Array.isArray(data) && data.length > 0) {
      setCachedData(CACHE_KEYS.TOP_PICKS, CACHE_KEYS.TOP_PICKS_TIMESTAMP, data);
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch top picks', error);
  }
  
  return [];
};

/**
 * Fetch a single product by ID - Gets FULL product details with all fields
 * Availability, vehicles, meeting points, and itineraries must be real-time,
 * so we bypass the cache by default.
 */
export const getProductById = async (productId, useCache = false) => {
  // Validate productId
  if (!productId || productId === 'undefined' || productId === 'null') {
    console.error('❌ Invalid product ID:', productId);
    return null;
  }
  
  // Always fetch fresh unless caller explicitly allows cache
  if (!useCache) {
    return await fetchFreshProductById(productId);
  }
  
  // Optional cache path (not used by default)
  const cacheKey = CACHE_KEYS.PRODUCT_DETAIL + productId;
  const timestampKey = CACHE_KEYS.PRODUCT_DETAIL_TIMESTAMP + productId;
  const cached = getCachedData(cacheKey, timestampKey);
  
  if (cached && isCacheValid(cached, CACHE_TTL.PRODUCT_DETAIL)) {
    if (cached.age > CACHE_TTL.PRODUCT_DETAIL * 0.5) {
      fetchFreshProductById(productId).catch(() => {});
    }
    return cached.data;
  }
  
  return await fetchFreshProductById(productId);
};

/**
 * Fetch a product's resolved location (if any) from the backend.
 * This is used to avoid calling OpenAI multiple times per product.
 */
export const getResolvedLocation = async (productId) => {
  if (!productId) return null;
  try {
    const data = await fetchJsonWithFallback(apiPath(`/products/${productId}/resolved-location`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data && data.location ? String(data.location) : null;
  } catch (error) {
    console.warn('Failed to fetch resolved location', error);
    return null;
  }
};

/**
 * Persist a resolved location for a product in MongoDB.
 * The caller is responsible for only sending high-quality, geocodable values.
 */
export const saveResolvedLocation = async (productId, location) => {
  if (!productId || !location) return false;
  try {
    const body = JSON.stringify({ location });
    const data = await fetchJsonWithFallback(apiPath(`/products/${productId}/resolved-location`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    return !!(data && data.location);
  } catch (error) {
    console.warn('Failed to save resolved location', error);
    return false;
  }
};


/**
 * Fetch fresh product by ID from API
 */
const fetchFreshProductById = async (productId) => {
  try {
    const data = await fetchJsonWithFallback(`/products/${productId}`);
    if (data) {
      const cacheKey = CACHE_KEYS.PRODUCT_DETAIL + productId;
      const timestampKey = CACHE_KEYS.PRODUCT_DETAIL_TIMESTAMP + productId;
      setCachedData(cacheKey, timestampKey, data);
      return data;
    }
  } catch (error) {
    console.error(`Failed to fetch product ${productId}`, error);
  }
  
  return null;
};

// Click tracking (local, with optional backend in future)
export const recordProductClick = (productId) => {
  try {
    const key = 'product_clicks';
    const raw = localStorage.getItem(key);
    const clicks = raw ? JSON.parse(raw) : {};
    clicks[productId] = (clicks[productId] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(clicks));
    // notify listeners
    emitRealtimeUpdate();
    return clicks[productId];
  } catch {
    return 0;
  }
};

export const getProductClicks = () => {
  try {
    const raw = localStorage.getItem('product_clicks');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Recently viewed helpers
const RECENT_KEY = 'recently_viewed_products';
const RECENT_MAX = 12;

// Update any in-memory/localStorage product caches with a newly resolved location
// so that UIs (cards, detail views, comparison) immediately reflect the change
// without requiring a full page reload.
const updateCachedLocationForProduct = (productId, location) => {
  if (!productId || !location) return;

  try {
    // 1) Product detail cache for that ID
    const cacheKey = CACHE_KEYS.PRODUCT_DETAIL + productId;
    const timestampKey = CACHE_KEYS.PRODUCT_DETAIL_TIMESTAMP + productId;
    const detailCached = getCachedData(cacheKey, timestampKey);
    if (detailCached && detailCached.data) {
      const updatedProduct = {
        ...detailCached.data,
        location,
        resolved_location: location,
      };
      setCachedData(cacheKey, timestampKey, updatedProduct);
    }
  } catch (_) {}

  try {
    // 2) Published products list cache
    const listCached = getCachedData(CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCTS_TIMESTAMP);
    if (listCached && Array.isArray(listCached.data)) {
      const updatedList = listCached.data.map((p) => {
        if (!p) return p;
        const id = p.id || p._id;
        if (String(id) !== String(productId)) return p;
        return {
          ...p,
          location,
          resolved_location: location,
        };
      });
      setCachedData(CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCTS_TIMESTAMP, updatedList);
    }
  } catch (_) {}

  try {
    // 3) Recently viewed cache
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list) && list.length) {
      const updated = list.map((p) =>
        p && String(p.id) === String(productId) ? { ...p, location } : p
      );
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    }
  } catch (_) {}
};

export const updateLocationCachesForProduct = (productId, location) => {
  try {
    updateCachedLocationForProduct(productId, location);
  } catch (e) {
    console.warn('[CACHE] Failed to update cached location for product', productId, e);
  }
};

export const addRecentlyViewed = (productSnapshot) => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    // Remove any existing entry with same id
    const filtered = list.filter(p => p && p.id !== productSnapshot.id);
    const updated = [
      {
        id: productSnapshot.id,
        name: productSnapshot.name,
        image: productSnapshot.image,
        price: productSnapshot.price,
        duration: productSnapshot.duration || '8 hours',
        groupSize: productSnapshot.groupSize || 'Up to 12',
        location: productSnapshot.location || 'Tokyo Japan',
      },
      ...filtered
    ].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    emitRealtimeUpdate();
    return updated;
  } catch {
    return [];
  }
};

export const getRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

// Simple realtime notifier for in-tab updates
export const emitRealtimeUpdate = () => {
  try {
    const evt = new Event('realtime-products-update');
    window.dispatchEvent(evt);
  } catch {}
};

/**
 * Transform product from API or localStorage to frontend format
 */
export const transformProductForFrontend = (product) => {
  // Handle both API format and localStorage format
  // Get image from various sources - prioritize coverImage/hero_image
  let image = null;
  const customFields = product.custom_fields || product.customFields || {};
  
  // First try hero_image or coverImage (directly)
  if (product.hero_image_url) {
    image = normalizeImageSource(product.hero_image_url);
  }
  if (!image && product.hero_image) {
    image = normalizeImageSource(product.hero_image);
  }
  if (!image && product.coverImage) {
    image = normalizeImageSource(product.coverImage);
  }
  
  // If no cover image, try images array
  if (!image && product.images && product.images.length > 0) {
    const firstImg = product.images[0];
    image = normalizeImageSource(firstImg);
  }
  
  // If still no image, try uploadedPhotos
  if (!image && product.uploadedPhotos && product.uploadedPhotos.length > 0) {
    const firstPhoto = product.uploadedPhotos[0];
    image = normalizeImageSource(firstPhoto);
  }
  
  // Process images array to ensure all URLs are strings
  let processedImages = [];
  if (product.images && Array.isArray(product.images)) {
    processedImages = product.images
      .map(img => normalizeImageSource(img))
      .filter(Boolean);
  } else if (product.uploadedPhotos && Array.isArray(product.uploadedPhotos)) {
    processedImages = product.uploadedPhotos
      .map(photo => normalizeImageSource(photo))
      .filter(Boolean);
  }
  
  // If we have processed images but no main image, use first processed image
  if (!image && processedImages.length > 0) {
    image = processedImages[0];
  }
  
  // Don't use fallback image - let component handle missing images gracefully

  // --- Pricing: always show minimum USD price across base product and vehicles ---
  const unit = product.price_unit || product.priceUnit || 'Per Group';

  // Base product price coming from backend (already normalized to USD)
  const basePriceValueRaw = product.price != null ? Number(product.price) : Number(product.revenue || 0);
  const basePriceValue = Number.isFinite(basePriceValueRaw) && basePriceValueRaw > 0 ? basePriceValueRaw : 0;

  // Ensure vehicles array is available before computing min price (may be overwritten below)
  let vehicles = product.vehicles || [];

  // Collect numeric vehicle amounts (already in USD from backend currency service)
  const vehicleAmounts = Array.isArray(vehicles)
    ? vehicles
        .map(v => {
          if (v && v.amount != null) {
            const n = Number(v.amount);
            return Number.isFinite(n) && n > 0 ? n : null;
          }
          return null;
        })
        .filter(v => v != null)
    : [];

  let effectivePriceValue = basePriceValue;
  if (vehicleAmounts.length > 0) {
    const minVehicleAmount = Math.min(...vehicleAmounts);
    if (!effectivePriceValue || minVehicleAmount < effectivePriceValue) {
      effectivePriceValue = minVehicleAmount;
    }
  }

  if (!effectivePriceValue) {
    effectivePriceValue = 0;
  }

  const formattedPriceNumber =
    effectivePriceValue % 1 === 0
      ? effectivePriceValue.toString()
      : effectivePriceValue.toFixed(2);

  const price =
    `$${formattedPriceNumber}` +
    (unit === 'Per Person' || unit === 'Per person' ? '/person' : '');

  const oldPriceBase = effectivePriceValue || basePriceValue || Number(product.revenue || 0) || 0;
  const oldPriceValue = oldPriceBase > 0 ? Math.round(oldPriceBase * 1.2) : 0;
  const oldPrice = oldPriceValue > 0 ? `$${oldPriceValue}` : '$0';
  const reviewsCount = product.reviews_count || 0;
  const reviewsText = reviewsCount >= 1000 ? `${(reviewsCount / 1000).toFixed(1)}k reviews` : reviewsCount >= 100 ? `${reviewsCount} reviews` : '384 reviews';

  const resolvedDuration = product.total_duration || product.totalDuration || product.duration || product.vehicle_duration || 
    (product.vehicle_details?.duration) || 
    (product.totalDuration) || 
    (Array.isArray(product.vehicles) && product.vehicles.length > 0 ? product.vehicles[0].duration : null) || 
    '';

  const resolvedGroupSizeRaw = product.groupSize || product.num_travellers || product.numTravellers || product.group_size || 
    (Array.isArray(product.vehicles) && product.vehicles.length > 0 ? product.vehicles[0].capacity : null);
  const resolvedGroupSize = resolvedGroupSizeRaw
    ? (typeof resolvedGroupSizeRaw === 'number' ? `Up to ${resolvedGroupSizeRaw}` : resolvedGroupSizeRaw)
    : '';

  // Transform vehicle_details to vehicles array
  vehicles = product.vehicles || vehicles || [];
  const vehiclesFromCustomFields = Array.isArray(customFields?.vehicles_full) ? customFields.vehicles_full : null;
  if (product.vehicle_details && !vehicles.length) {
    // Convert vehicle_details object to vehicles array format
    const vd = product.vehicle_details;
    vehicles = [{
      type: vd.vehicle_type || '',
      model: vd.vehicle_model || '',
      year: vd.vehicle_year || '',
      capacity: vd.capacity || null
    }];
  } else if (!vehicles.length && vehiclesFromCustomFields && vehiclesFromCustomFields.length) {
    vehicles = vehiclesFromCustomFields;
  } else if (
    !vehicles.length &&
    customFields?.selected_vehicle_for_tour &&
    typeof customFields.selected_vehicle_for_tour === 'object'
  ) {
    vehicles = [customFields.selected_vehicle_for_tour];
  }

  // CRITICAL: Enrich vehicles array with vehicle data from pickup_configurations
  // This ensures vehicles have proper IDs and full details from the configs
  // Extract pickup_dropoff temporarily for vehicle extraction
  const pickupDropoffTemp = product.pickup_dropoff || {};
  if (Array.isArray(pickupDropoffTemp.pickup_configurations) && pickupDropoffTemp.pickup_configurations.length > 0) {
    // Extract unique vehicles from pickup_configurations (by vehicle ID)
    const vehiclesFromConfigs = new Map();
    pickupDropoffTemp.pickup_configurations.forEach(config => {
      if (config.vehicle && config.vehicle.id) {
        const vehicleId = config.vehicle.id;
        // Store vehicle with its ID as key to avoid duplicates
        if (!vehiclesFromConfigs.has(vehicleId)) {
          vehiclesFromConfigs.set(vehicleId, {
            id: config.vehicle.id,
            _id: config.vehicle._id || config.vehicle.id,
            title: config.vehicle.title,
            type: config.vehicle.type,
            model: config.vehicle.model,
            year: config.vehicle.year,
            attributes: config.vehicle.attributes,
            capacity: config.vehicle.capacity,
            currency: config.vehicle.currency,
            pricingType: config.vehicle.pricingType || config.vehicle.pricing_type,
            amount: config.vehicle.amount,
            duration: config.vehicle.duration,
            description: config.vehicle.description
          });
        }
      }
    });
    
    // Merge vehicles from configs with existing vehicles array
    // Prioritize vehicles from configs as they have IDs
    if (vehiclesFromConfigs.size > 0) {
      const configVehiclesArray = Array.from(vehiclesFromConfigs.values());
      
      // Build a map of existing vehicles by ID
      const existingVehicleMap = new Map();
      vehicles.forEach(v => {
        const vid = v.id || v._id;
        if (vid) {
          existingVehicleMap.set(String(vid), v);
        }
      });
      
      // Merge: vehicles from configs take precedence, but preserve any existing vehicles not in configs
      const mergedVehicles = [];
      configVehiclesArray.forEach(configVehicle => {
        const existingVehicle = existingVehicleMap.get(String(configVehicle.id));
        if (existingVehicle) {
          // Merge existing vehicle data with config vehicle data (config takes precedence)
          mergedVehicles.push({ ...existingVehicle, ...configVehicle });
        } else {
          mergedVehicles.push(configVehicle);
        }
      });
      
      // Add any existing vehicles that weren't in configs (if they don't have IDs, add them too)
      vehicles.forEach(v => {
        const vid = v.id || v._id;
        if (!vid || !vehiclesFromConfigs.has(String(vid))) {
          // Only add if not already added from configs
          if (!mergedVehicles.some(mv => {
            const mvid = mv.id || mv._id;
            return mvid && vid && String(mvid) === String(vid);
          })) {
            mergedVehicles.push(v);
          }
        }
      });
      
      vehicles = mergedVehicles.length > 0 ? mergedVehicles : configVehiclesArray;
    }
  }

  // Filter out vehicles that have been deactivated on the supplier side.
  // Any entry in vehicle_inactive_dates for a vehicle means it should not be
  // selectable on the customer product detail page, regardless of date range.
  try {
    const vehicleInactiveMap = product.vehicle_inactive_dates || product.vehicleInactiveDates || {};
    if (vehicles && Array.isArray(vehicles) && vehicleInactiveMap && typeof vehicleInactiveMap === 'object') {
      const productIdForKey = product.id || product._id || product.product_id || null;
      const originalLength = vehicles.length;

      vehicles = vehicles.filter((v, idx) => {
        if (!v) return false;
        const vid = v.id || v._id;
        const directKey = vid ? String(vid) : null;
        const syntheticKey = !directKey && productIdForKey ? `${productIdForKey}-vehicle-${idx + 1}` : null;
        const dates =
          (directKey && vehicleInactiveMap[directKey]) ||
          (syntheticKey && vehicleInactiveMap[syntheticKey]) ||
          [];
        return !(Array.isArray(dates) && dates.length > 0);
      });

      // Fallback: if there is exactly one vehicle and ANY vehicle_inactive_dates
      // configured, hide that vehicle entirely so the detail page reflects
      // supplier Availability even if IDs don't line up perfectly.
      if (originalLength === 1 && Object.keys(vehicleInactiveMap).length > 0) {
        vehicles = [];
      }
    }
  } catch {
    // If anything goes wrong, fall back to showing vehicles rather than crashing UI
  }

  // Extract meeting points from pickup_dropoff
  // IMPORTANT: Preserve the FULL pickup_dropoff structure including pickup_configurations
  const pickupDropoff = product.pickup_dropoff || {};
  
  // Extract pickup_locations - prioritize from pickup_dropoff.pickup_locations
  const meetingPoints = Array.isArray(pickupDropoff.pickup_locations) && pickupDropoff.pickup_locations.length > 0
    ? pickupDropoff.pickup_locations
    : (Array.isArray(product.pickupLocations) ? product.pickupLocations : []);
  // Extract pickup_time - prioritize from pickup_configurations, then legacy fields
  const pickupTime = (() => {
    // Priority 1: First pickup configuration time
    if (Array.isArray(pickupDropoff.pickup_configurations) && pickupDropoff.pickup_configurations.length > 0) {
      const firstConfig = pickupDropoff.pickup_configurations[0];
      if (firstConfig?.pickup_time) {
        return firstConfig.pickup_time;
      }
    }
    // Priority 2: Legacy pickup_dropoff.pickup_time
    if (pickupDropoff.pickup_time) {
      return pickupDropoff.pickup_time;
    }
    // Priority 3: Product pickupTime field
    if (product.pickupTime) {
      return product.pickupTime;
    }
    return '';
  })();
  const availableDays = pickupDropoff.available_days || product.availableDays || [];
  const availableTimeSlots = Array.isArray(pickupDropoff.available_time_slots) && pickupDropoff.available_time_slots.length > 0
    ? pickupDropoff.available_time_slots
    : (Array.isArray(product.availableTimeSlots) ? product.availableTimeSlots : []);

  const supplierBusinessName =
    product.supplier_business_name ||
    product.supplierBusinessName ||
    product.business_name ||
    product.businessName ||
    product?.supplier?.business_name ||
    product?.supplier?.businessName ||
    product.host ||
    null;

  const inactiveDates = product.inactive_dates || product.inactiveDates || [];

  const transformed = {
    id: product.id,
    name: product.name || product.title || product.productTitle || 'Untitled Product',
    image: image,
    images: processedImages.length > 0 ? processedImages : (product.images || product.uploadedPhotos || []),
    rating: product.rating || 4.8,
    reviews: reviewsText,
    reviewsCount: reviewsCount,
    duration: (typeof resolvedDuration === 'string' && resolvedDuration.trim()) ? resolvedDuration.trim() : '8 hours',
    groupSize: (resolvedGroupSize && String(resolvedGroupSize).trim()) ? String(resolvedGroupSize).trim() : 'Up to 12',
    price: price,
    priceValue: product.price || product.revenue || 0,
    currency: product.currency || 'USD',
    priceUnit: product.price_unit || product.priceUnit || 'Per Group',
    oldPrice: oldPrice,
    location: (product.location && product.location.trim()) || (product.destination && product.destination.trim()) || 'Tokyo Japan',
    // Use selling_points from backend; fall back to some generic tags if missing
    tags: (Array.isArray(product.selling_points) && product.selling_points.length > 0)
      ? product.selling_points
      : ['Sightseeing', 'Local Food', 'Private Transport', 'HiddenGems', 'Photo Spots'],
    host: supplierBusinessName || 'TripsAdora Partner',
    isPrivate: product.activity_type?.includes('Private') || true,
    isTripadurasChoice: true,
    category: product.category,
    description: product.description,
    tagline: product.tagline,
    highlights: product.highlights || [],
    itineraries: product.itineraries || product.itinerary || [],
    vehicles: vehicles,
    // Product details fields
    guideType: product.guide_type,
    thingsToCarry: product.things_to_carry || [],
    languages: product.languages || [],
    accessibility: product.accessibility || null,
    // meeting points - from pickup_dropoff or pickupLocations
    meetingPoints: meetingPoints,
    pickupTime: pickupTime,
    // included/excluded
    includedItems: product.included_excluded?.included || 
                   (product.includedItems ? (Array.isArray(product.includedItems) ? product.includedItems : [product.includedItems]) : []),
    excludedItems: product.included_excluded?.excluded || 
                   (product.excludedItems ? (Array.isArray(product.excludedItems) ? product.excludedItems : [product.excludedItems]) : []),
    availableDays: availableDays,
    availableTimeSlots: availableTimeSlots,
    // Include full pickup_dropoff structure for vehicle-based access
    pickup_dropoff: pickupDropoff || null,
    // Include custom_fields for fallback data access (vehicles_full, vehicle_time_allocations, etc.)
    custom_fields: customFields || {},
    cancellationPolicy: product.cancellation_policy || product.cancellationPolicy || null,
    faqs: Array.isArray(product.faqs) ? product.faqs : [],
    // Supplier information
    supplierBusinessName: supplierBusinessName,
    supplierId: product.supplier_id || product.supplierId,
    // Availability: product is visible to customers ONLY when:
    // - it is published (handled on backend /products/published), and
    // - it is NOT currently deactivated in supplier Availability.
    // We treat a product as "inactive" for customers if:
    //   * inactive_dates contains "*"  (fully blocked), OR
    //   * inactive_dates contains any date that is today or in the future.
    isAvailableForCustomer: (() => {
      try {
        if (!Array.isArray(inactiveDates) || inactiveDates.length === 0) return true;
        if (inactiveDates.includes('*')) return false;

        const today = new Date();
        const todayY = today.getFullYear();
        const todayM = today.getMonth();
        const todayD = today.getDate();

        const isDateTodayOrFuture = (iso) => {
          if (typeof iso !== 'string' || !iso.includes('-')) return false;
          const [y, m, d] = iso.split('-').map(n => parseInt(n, 10));
          if (!y || !m || !d) return false;
          const dt = new Date(y, m - 1, d);
          if (Number.isNaN(dt.getTime())) return false;
          if (dt.getFullYear() > todayY) return true;
          if (dt.getFullYear() < todayY) return false;
          if (dt.getMonth() > todayM) return true;
          if (dt.getMonth() < todayM) return false;
          return dt.getDate() >= todayD;
        };

        // If any inactive date is today or later, do NOT show this product
        return !inactiveDates.some(isDateTodayOrFuture);
      } catch {
        // On parsing errors, fall back to showing the product
        return true;
      }
    })()
  };
  
  return transformed;
};

// Fetch reviews for a specific product
export async function getProductReviews(productId, { limit = 50 } = {}) {
  if (!productId) {
    console.warn('[getProductReviews] No productId provided');
    return { reviews: [] };
  }
  
  // Reviews are customer-platform specific, don't use fallback
  const url = `${API_BASE_URL}/products/${productId}/reviews?limit=${limit}`;
  console.log(`[getProductReviews] API_BASE_URL: ${API_BASE_URL}`);
  console.log(`[getProductReviews] Fetching reviews from: ${url}`);
  console.log(`[getProductReviews] Product ID: ${productId}`);
  
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log(`[getProductReviews] Response status: ${response.status} for ${url}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[getProductReviews] No reviews found (404) for product ${productId}`);
        return { reviews: [] };
      }
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[getProductReviews] HTTP error ${response.status}:`, errorText);
      throw new Error(`Failed to fetch reviews: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[getProductReviews] Successfully fetched ${data?.reviews?.length || 0} reviews for product ${productId}`);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[getProductReviews] Request timeout for ${url}`);
    } else {
      console.error(`[getProductReviews] Error fetching product reviews from ${url}:`, error);
      console.error(`[getProductReviews] Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    // Return empty reviews on error instead of throwing
    return { reviews: [] };
  }
}
