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
  for (const url of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const requestOptions = { ...options, signal: controller.signal };
    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error;
      console.warn(`[API] Request failed (${url}): ${error?.message || error}`);
    } finally {
      clearTimeout(timeout);
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

  // Transform vehicle_details to vehicles array
  let vehicles = product.vehicles || [];
  if (product.vehicle_details && !vehicles.length) {
    // Convert vehicle_details object to vehicles array format
    const vd = product.vehicle_details;
    vehicles = [{
      type: vd.vehicle_type || '',
      model: vd.vehicle_model || '',
      year: vd.vehicle_year || '',
      capacity: vd.capacity || null
    }];
  }

  // Extract meeting points from pickup_dropoff
  const pickupDropoff = product.pickup_dropoff || {};
  const meetingPoints = pickupDropoff.pickup_locations || 
                       (Array.isArray(product.pickupLocations) ? product.pickupLocations : []);
  const pickupTime = pickupDropoff.pickup_time || product.pickupTime || '';
  const availableDays = pickupDropoff.available_days || product.availableDays || [];
  const availableTimeSlots = pickupDropoff.available_time_slots || product.availableTimeSlots || [];

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
    duration: (product.duration && product.duration.trim()) || '8 hours',
    groupSize: product.groupSize || 'Up to 12',
    price: price,
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
    cancellationPolicy: product.cancellation_policy || product.cancellationPolicy || null,
    faqs: Array.isArray(product.faqs) ? product.faqs : [],
    // Supplier information
    supplierBusinessName: supplierBusinessName,
    supplierId: product.supplier_id || product.supplierId
  };
  
  return transformed;
};
