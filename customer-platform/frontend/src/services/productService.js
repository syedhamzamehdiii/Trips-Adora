const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';
const FALLBACK_API_BASE_URL = import.meta.env.VITE_SUPPLIER_API_BASE_URL || 'http://localhost:8000/api/v1';

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
  const endpoints = [
    API_BASE_URL ? `${API_BASE_URL}${path}` : null,
    FALLBACK_API_BASE_URL ? `${FALLBACK_API_BASE_URL}${path}` : null,
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
        // Only log non-404 errors for the fallback endpoint (expected to fail)
        const isFallbackEndpoint = url.includes(FALLBACK_API_BASE_URL);
        if (!isFallbackEndpoint || response.status !== 404) {
          cleanupHandlers.forEach(cleanup => cleanup());
          throw new Error(`Request to ${url} failed with status ${response.status}`);
        }
        // For fallback 404s, silently continue to next endpoint
        cleanupHandlers.forEach(cleanup => cleanup());
        continue;
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
      // Only log real errors, not expected 404s from fallback
      const isFallbackEndpoint = url.includes(FALLBACK_API_BASE_URL);
      if (!isFallbackEndpoint || (error.message && !error.message.includes('404'))) {
        console.warn(`[API] Request failed (${url}): ${error?.message || error}`);
      }
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
  // Check cache first (only for page 1, no search, no filters)
  const isSimpleQuery = !params.search && !params.category && !params.destination && (params.page === 1 || !params.page);
  
  if (useCache && isSimpleQuery) {
    const cached = getCachedData(CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCTS_TIMESTAMP);
    if (cached && isCacheValid(cached, CACHE_TTL.PRODUCTS)) {
      // Return cached data immediately
      const allProducts = cached.data;
      
      // Apply pagination to cached data
      const page = params.page || 1;
      const pageSize = params.page_size || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = allProducts.slice(start, end);
      
      // Refresh in background if cache is getting old (> 50% of TTL)
      if (cached.age > CACHE_TTL.PRODUCTS * 0.5) {
        fetchFreshProducts(params).catch(() => {}); // Silent background refresh
      }
      
      return {
        products: paginated,
        total: allProducts.length,
        page: page,
        page_size: pageSize,
        total_pages: Math.ceil(allProducts.length / pageSize)
      };
    }
  }
  
  // No valid cache, fetch fresh data
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
  const cached = getCachedData(CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCTS_TIMESTAMP);
  if (cached && Array.isArray(cached.data)) {
    return cached.data;
  }
  // Fallback to old cache key for backward compatibility
  try {
    const raw = localStorage.getItem('published_products_cache');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
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
 * Returns cached data immediately, refreshes in background if stale
 */
export const getProductById = async (productId, useCache = true) => {
  // Validate productId
  if (!productId || productId === 'undefined' || productId === 'null') {
    console.error('❌ Invalid product ID:', productId);
    return null;
  }
  
  // Check cache first
  if (useCache) {
    const cacheKey = CACHE_KEYS.PRODUCT_DETAIL + productId;
    const timestampKey = CACHE_KEYS.PRODUCT_DETAIL_TIMESTAMP + productId;
    const cached = getCachedData(cacheKey, timestampKey);
    
    if (cached && isCacheValid(cached, CACHE_TTL.PRODUCT_DETAIL)) {
      // Refresh in background if cache is getting old
      if (cached.age > CACHE_TTL.PRODUCT_DETAIL * 0.5) {
        fetchFreshProductById(productId).catch(() => {}); // Silent background refresh
      }
      return cached.data;
    }
  }
  
  // No valid cache, fetch fresh data
  return await fetchFreshProductById(productId);
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
  
  const price = product.price ? `$${product.price}${product.price_unit === 'Per Person' ? '/person' : ''}` : (product.revenue ? `$${product.revenue}` : '$0');
  const oldPrice = product.price ? `$${Math.round(product.price * 1.2)}` : (product.revenue ? `$${Math.round(product.revenue * 1.2)}` : '$250');
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
  let vehicles = product.vehicles || [];
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

  // Extract meeting points from pickup_dropoff
  // IMPORTANT: Preserve the FULL pickup_dropoff structure including pickup_configurations
  const pickupDropoff = product.pickup_dropoff || {};
  
  // Debug: Log pickup_dropoff structure in development - with ERROR level so it's visible
  if (process.env.NODE_ENV === 'development') {
    console.error('📦 [CUSTOMER FETCH] ========== PICKUP_DROPOFF DEBUG ==========');
    console.error('📦 [CUSTOMER FETCH] Raw pickup_dropoff from API:', {
      hasPickupDropoff: !!pickupDropoff,
      keys: pickupDropoff ? Object.keys(pickupDropoff) : [],
      hasPickupConfigs: !!pickupDropoff?.pickup_configurations,
      configsCount: Array.isArray(pickupDropoff?.pickup_configurations) ? pickupDropoff.pickup_configurations.length : 0,
      pickupConfigs: pickupDropoff?.pickup_configurations,
      pickup_locations: pickupDropoff?.pickup_locations,
      pickup_time: pickupDropoff?.pickup_time,
      fullPickupDropoff: pickupDropoff,
      // Also check if it's in the raw product
      rawProductPickupDropoff: product.pickup_dropoff,
      rawProductKeys: product ? Object.keys(product).filter(k => k.includes('pickup') || k.includes('vehicle')) : []
    })
    
    // Also check custom_fields for vehicle_time_allocations
    const customFields = product.custom_fields || product.customFields || {}
    console.error('📦 [CUSTOMER FETCH] Custom fields check:', {
      hasCustomFields: !!customFields,
      customFieldsKeys: Object.keys(customFields),
      hasVehicleTimeAllocations: !!customFields.vehicle_time_allocations,
      vehicleTimeAllocationsCount: Array.isArray(customFields.vehicle_time_allocations) 
        ? customFields.vehicle_time_allocations.length 
        : 0,
      vehicleTimeAllocations: customFields.vehicle_time_allocations
    })
    
    // CRITICAL: Log the full raw product to see what the API returned
    console.error('📦 [CUSTOMER FETCH] Full raw product from API (pickup_dropoff section):', 
      JSON.stringify(product.pickup_dropoff || null, null, 2)
    );
    
    if (!pickupDropoff?.pickup_configurations || !Array.isArray(pickupDropoff.pickup_configurations) || pickupDropoff.pickup_configurations.length === 0) {
      console.error('❌ [CUSTOMER FETCH] WARNING: pickup_configurations is MISSING or EMPTY!');
    } else {
      console.error('✅ [CUSTOMER FETCH] pickup_configurations found:', pickupDropoff.pickup_configurations.length, 'configs');
    }
    console.error('📦 [CUSTOMER FETCH] ==========================================');
  }
  
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
    tags: ['Sightseeing', 'Local Food', 'Private Transport', 'HiddenGems', 'Photo Spots'],
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
    supplierId: product.supplier_id || product.supplierId
  };
  
  return transformed;
};
