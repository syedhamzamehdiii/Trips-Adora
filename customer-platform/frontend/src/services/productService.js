const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';
const SUPPLIER_API_BASE_URL = 'http://localhost:8000/api/v1';

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
 * Get products from supplier platform backend cache (since localStorage can't be shared across origins)
 */
const getSupplierLocalStorageProducts = async () => {
  try {
    // Fetch from supplier platform's backend cache
    const response = await fetch(`${SUPPLIER_API_BASE_URL}/products/localstorage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const products = data.products || [];
      console.log('📦 Found products in supplier backend cache:', products.length);
      
      // Process products to include full data
      const processedProducts = products.map(p => {
        const fullData = p._full_data || {};
        
        // Extract images from full data
        let coverImage = null;
        if (fullData.coverImage) {
          if (typeof fullData.coverImage === 'string') {
            // If it's already a string (base64 or URL), use it directly
            coverImage = fullData.coverImage;
          } else if (fullData.coverImage && typeof fullData.coverImage === 'object') {
            // If it's an object with url property, extract the URL
            if (fullData.coverImage.url) {
              coverImage = fullData.coverImage.url;
            } else if (fullData.coverImage.src) {
              coverImage = fullData.coverImage.src;
            } else {
              // Try to use the object itself (might be a string-like object)
              coverImage = fullData.coverImage;
            }
          } else {
            coverImage = fullData.coverImage;
          }
        }
        
        // Compute uploaded photos before logging (avoid referencing before init)
        const uploadedPhotos = Array.isArray(fullData.uploadedPhotos) 
          ? fullData.uploadedPhotos.map(photo => {
              if (typeof photo === 'string') return photo;
              return photo.url || photo;
            }).filter(Boolean)
          : [];

        // Debug logging for cover image extraction
        console.log('📸 Processing product images:', {
          productName: p.name,
          hasCoverImageInFullData: !!fullData.coverImage,
          coverImageType: fullData.coverImage ? typeof fullData.coverImage : 'null',
          coverImageIsString: typeof fullData.coverImage === 'string',
          coverImageIsObject: typeof fullData.coverImage === 'object',
          coverImageHasUrl: fullData.coverImage?.url ? true : false,
          extractedCoverImage: (typeof coverImage === 'string') ? (coverImage.substring(0, 50) + '...') : (coverImage ? 'object' : 'null'),
          uploadedPhotosCount: uploadedPhotos.length
        });
        
        const allImages = coverImage ? [coverImage, ...uploadedPhotos] : uploadedPhotos;
        
        return {
          ...p,
          productTitle: fullData.productTitle || p.name,
          description: fullData.description || '',
          tagline: fullData.tagline || '',
          category: fullData.productCategory || 'tour',
          highlights: fullData.highlights || [],
          price: p.revenue || 0,
          images: allImages,
          hero_image: coverImage,
          gallery_images: uploadedPhotos,
          coverImage: coverImage,
          uploadedPhotos: uploadedPhotos,
          destination: fullData.destination || '',
          duration: fullData.duration || '8 hours',
          itineraries: fullData.itineraries || [],
          sellingPoints: fullData.sellingPoints || [],
          includedItems: fullData.includedItems || '',
          excludedItems: fullData.excludedItems || '',
          vehicles: Array.isArray(fullData.vehicles) ? fullData.vehicles : (Array.isArray(fullData.selectedVehicleForTour) ? fullData.selectedVehicleForTour : []),
          // meeting points / pickup info
          pickupLocations: Array.isArray(fullData.selectedPickupLocations) ? fullData.selectedPickupLocations : [],
          dropoffLocations: Array.isArray(fullData.selectedDropoffLocations) ? fullData.selectedDropoffLocations : [],
          pickupTime: fullData.pickupTime || '',
          availableDays: fullData.selectedWeekDay ? [fullData.selectedWeekDay] : [],
          availableTimeSlots: fullData.timeSlots ? Object.keys(fullData.timeSlots) : []
        };
      });
      
      console.log('✅ Processed products from supplier cache:', processedProducts.length);
      return processedProducts;
    } else {
      console.log('⚠️ Could not fetch from supplier backend cache');
    }
  } catch (error) {
    console.log('⚠️ Error fetching from supplier backend cache:', error.message);
  }
  return [];
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
    
    const url = `${API_BASE_URL}/products/published${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.products && Array.isArray(data.products)) {
        // Cache all products (for page 1, no filters)
        const isSimpleQuery = !params.search && !params.category && !params.destination && (params.page === 1 || !params.page);
        if (isSimpleQuery && data.products.length > 0) {
          setCachedData(CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCTS_TIMESTAMP, data.products);
        }
        return data;
      }
    }
  } catch (error) {
    console.log('API fetch failed, using fallback...', error);
  }
  
  // Fallback to supplier backend cache
  const localStorageProducts = await getSupplierLocalStorageProducts();
  
  if (!Array.isArray(localStorageProducts)) {
    return { products: [], total: 0, page: 1, page_size: 20, total_pages: 0 };
  }
  
  // Apply search filter if provided
  let filtered = localStorageProducts;
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filtered = localStorageProducts.filter(p => 
      (p.name || '').toLowerCase().includes(searchTerm) ||
      (p.productTitle || '').toLowerCase().includes(searchTerm) ||
      (p.description || '').toLowerCase().includes(searchTerm)
    );
  }
  
  if (!Array.isArray(filtered)) {
    filtered = [];
  }
  
  // Apply pagination
  const page = params.page || 1;
  const pageSize = params.page_size || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = filtered.slice(start, end);
  
  // Cache all products if simple query
  const isSimpleQuery = !params.search && !params.category && !params.destination && (params.page === 1 || !params.page);
  if (isSimpleQuery) {
    setCachedData(CACHE_KEYS.PRODUCTS, CACHE_KEYS.PRODUCTS_TIMESTAMP, filtered);
  }
  
  return {
    products: paginated,
    total: filtered.length,
    page: page,
    page_size: pageSize,
    total_pages: Math.ceil(filtered.length / pageSize)
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
    const url = `${API_BASE_URL}/products/top-picks?limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        setCachedData(CACHE_KEYS.TOP_PICKS, CACHE_KEYS.TOP_PICKS_TIMESTAMP, data);
        return data;
      }
    }
  } catch (error) {
    console.log('API failed, using fallback...', error);
  }
  
  // Fallback to supplier backend cache
  const localStorageProducts = await getSupplierLocalStorageProducts();
  
  if (!Array.isArray(localStorageProducts)) {
    return [];
  }
  
  const publishedProducts = localStorageProducts.slice(0, limit);
  setCachedData(CACHE_KEYS.TOP_PICKS, CACHE_KEYS.TOP_PICKS_TIMESTAMP, publishedProducts);
  
  return publishedProducts;
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
    const url = `${API_BASE_URL}/products/${productId}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      // Cache the product
      const cacheKey = CACHE_KEYS.PRODUCT_DETAIL + productId;
      const timestampKey = CACHE_KEYS.PRODUCT_DETAIL_TIMESTAMP + productId;
      setCachedData(cacheKey, timestampKey, data);
      return data;
    }
  } catch (error) {
    console.log('API failed, trying fallback...', error);
  }
  
  // Fallback to supplier backend cache
  const localStorageProducts = await getSupplierLocalStorageProducts();
  const product = localStorageProducts.find(p => p.id === productId || p.id === String(productId));
  
  if (product) {
    // Cache the fallback product too
    const cacheKey = CACHE_KEYS.PRODUCT_DETAIL + productId;
    const timestampKey = CACHE_KEYS.PRODUCT_DETAIL_TIMESTAMP + productId;
    setCachedData(cacheKey, timestampKey, product);
  }
  
  return product || null;
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
  // DEBUG: Log incoming product data
  console.log('🔍 [DEBUG] transformProductForFrontend - Raw product:', {
    id: product.id,
    guide_type: product.guide_type,
    things_to_carry: product.things_to_carry,
    languages: product.languages,
    included_excluded: product.included_excluded,
    vehicle_details: product.vehicle_details,
    accessibility: product.accessibility,
    highlights: product.highlights,
    itinerary: product.itinerary,
    pickup_dropoff: product.pickup_dropoff
  });
  
  // Handle both API format and localStorage format
  // Get image from various sources - prioritize coverImage/hero_image
  let image = null;
  
  // First try hero_image or coverImage (directly)
  if (product.hero_image) {
    image = typeof product.hero_image === 'string' ? product.hero_image : product.hero_image.url || product.hero_image;
  } else if (product.coverImage) {
    if (typeof product.coverImage === 'string') {
      image = product.coverImage;
    } else if (product.coverImage.url) {
      image = product.coverImage.url;
    } else {
      image = product.coverImage;
    }
  }
  
  // If no cover image, try images array
  if (!image && product.images && product.images.length > 0) {
    const firstImg = product.images[0];
    image = typeof firstImg === 'string' ? firstImg : (firstImg.url || firstImg);
  }
  
  // If still no image, try uploadedPhotos
  if (!image && product.uploadedPhotos && product.uploadedPhotos.length > 0) {
    const firstPhoto = product.uploadedPhotos[0];
    image = typeof firstPhoto === 'string' ? firstPhoto : (firstPhoto.url || firstPhoto);
  }
  
  // Process images array to ensure all URLs are strings
  let processedImages = [];
  if (product.images && Array.isArray(product.images)) {
    processedImages = product.images.map(img => {
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object') return img.url || img.src || img;
      return null;
    }).filter(Boolean);
  } else if (product.uploadedPhotos && Array.isArray(product.uploadedPhotos)) {
    processedImages = product.uploadedPhotos.map(photo => {
      if (typeof photo === 'string') return photo;
      if (photo && typeof photo === 'object') return photo.url || photo.src || photo;
      return null;
    }).filter(Boolean);
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
    host: 'Karvaan Tours',
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
    // Supplier information
    supplierBusinessName: product.supplier_business_name || product.supplierBusinessName,
    supplierId: product.supplier_id || product.supplierId
  };
  
  // DEBUG: Log transformed product
  console.log('🔍 [DEBUG] transformProductForFrontend - Transformed product:', {
    guideType: transformed.guideType,
    thingsToCarry: transformed.thingsToCarry,
    languages: transformed.languages,
    includedItems: transformed.includedItems,
    excludedItems: transformed.excludedItems,
    vehicles: transformed.vehicles,
    accessibility: transformed.accessibility,
    highlights: transformed.highlights,
    itineraries: transformed.itineraries
  });
  
  return transformed;
};
