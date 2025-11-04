const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';
const SUPPLIER_API_BASE_URL = 'http://localhost:8000/api/v1';

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
 * Fetch published products from backend, with localStorage fallback
 */
export const getPublishedProducts = async (params = {}, retries = 3) => {
  // Try API first
  for (let i = 0; i < retries; i++) {
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
        // Only use API data if it has products, otherwise fallback to localStorage
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          console.log('✅ Using API data:', data.products.length, 'products');
          try { localStorage.setItem('published_products_cache', JSON.stringify(data.products)); } catch {}
          return data;
        } else {
          console.log('⚠️ API returned empty products, using localStorage fallback...');
          break; // Exit retry loop and use localStorage
        }
      }
    } catch (error) {
      if (i === retries - 1) {
        console.log('API failed, using localStorage fallback...');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  // Fallback to supplier backend cache
  console.log('Using supplier backend cache as fallback...');
  const localStorageProducts = await getSupplierLocalStorageProducts();
  
  // Ensure it's an array
  if (!Array.isArray(localStorageProducts)) {
    console.error('⚠️ localStorageProducts is not an array:', typeof localStorageProducts);
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
  
  // Ensure filtered is still an array
  if (!Array.isArray(filtered)) {
    console.error('⚠️ Filtered result is not an array');
    filtered = [];
  }
  
  // Apply pagination
  const page = params.page || 1;
  const pageSize = params.page_size || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = filtered.slice(start, end);
  try { localStorage.setItem('published_products_cache', JSON.stringify(filtered)); } catch {}
  
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
  try {
    const raw = localStorage.getItem('published_products_cache');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

/**
 * Fetch top picks products, with localStorage fallback
 */
export const getTopPicks = async (limit = 4, retries = 3) => {
  // Try API first
  for (let i = 0; i < retries; i++) {
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
        // Only use API data if it has products, otherwise fallback to localStorage
        if (data && Array.isArray(data) && data.length > 0) {
          console.log('✅ Using API top picks:', data.length, 'products');
          return data;
        } else {
          console.log('⚠️ API returned empty top picks, using localStorage fallback...');
          break; // Exit retry loop and use localStorage
        }
      }
    } catch (error) {
      if (i === retries - 1) {
        console.log('API failed, using localStorage fallback...');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  // Fallback to supplier backend cache
  console.log('Using supplier backend cache as fallback...');
  const localStorageProducts = await getSupplierLocalStorageProducts();
  
  // Ensure it's an array
  if (!Array.isArray(localStorageProducts)) {
    console.error('⚠️ localStorageProducts is not an array:', typeof localStorageProducts);
    return [];
  }
  
  const publishedProducts = localStorageProducts.slice(0, limit);
  
  return publishedProducts;
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (productId) => {
  // Try API first
  try {
    const url = `${API_BASE_URL}/products/${productId}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('API failed, trying localStorage fallback...');
  }
  
  // Fallback to supplier backend cache
  const localStorageProducts = await getSupplierLocalStorageProducts();
  const product = localStorageProducts.find(p => p.id === productId || p.id === String(productId));
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
  
  // Fallback to default image
  if (!image) {
    image = '/assests/bg.jpg'; // Fallback
  }
  
  const price = product.price ? `$${product.price}${product.price_unit === 'Per Person' ? '/person' : ''}` : (product.revenue ? `$${product.revenue}` : '$0');
  const oldPrice = product.price ? `$${Math.round(product.price * 1.2)}` : (product.revenue ? `$${Math.round(product.revenue * 1.2)}` : '$250');
  const reviewsCount = product.reviews_count || 0;
  const reviewsText = reviewsCount >= 1000 ? `${(reviewsCount / 1000).toFixed(1)}k reviews` : reviewsCount >= 100 ? `${reviewsCount} reviews` : '384 reviews';

  return {
    id: product.id,
    name: product.name || product.title || product.productTitle || 'Untitled Product',
    image: image,
    images: product.images || product.uploadedPhotos || [],
    rating: product.rating || 4.8,
    reviews: reviewsText,
    reviewsCount: reviewsCount,
    duration: product.duration || '8 hours',
    groupSize: product.groupSize || 'Up to 12',
    price: price,
    oldPrice: oldPrice,
    location: product.location || product.destination || 'Tokyo Japan',
    tags: ['Sightseeing', 'Local Food', 'Private Transport', 'HiddenGems', 'Photo Spots'],
    host: 'Karvaan Tours',
    isPrivate: product.activity_type?.includes('Private') || true,
    isTripadurasChoice: true,
    category: product.category,
    description: product.description,
    tagline: product.tagline,
    highlights: product.highlights || [],
    itineraries: product.itineraries || [],
    vehicles: product.vehicles || [],
    // meeting points
    meetingPoints: Array.isArray(product.pickupLocations) ? product.pickupLocations : [],
    pickupTime: product.pickupTime || '',
    availableDays: product.availableDays || [],
    availableTimeSlots: product.availableTimeSlots || []
  };
};
