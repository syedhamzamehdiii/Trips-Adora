/**
 * Utility functions to transform products between API format and localStorage format
 * This allows gradual migration from localStorage to database
 */

/**
 * Transform API product to localStorage format (for compatibility)
 */
export const transformApiProductToLocal = (apiProduct) => {
  return {
    id: apiProduct.id,
    dbProductId: apiProduct.id, // Store database ID
    name: apiProduct.title || '',
    referenceCode: apiProduct.id?.substring(0, 8) || `T-${Math.floor(1000 + Math.random() * 9000)}`,
    status: apiProduct.status === 'published' ? 'Published' : 
            apiProduct.status === 'draft' ? 'Draft' :
            apiProduct.status === 'rejected' ? 'Rejected' :
            apiProduct.status === 'archived' ? 'Archived' : 'Draft',
    bookings: apiProduct.bookings_count || 0,
    revenue: apiProduct.price || 0,
    creationDate: apiProduct.created_at ? 
      new Date(apiProduct.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : 
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
    ratings: apiProduct.rating ? `${apiProduct.rating}/5` : "0/5",
    vehicles: apiProduct.vehicle_details ? [{
      type: apiProduct.vehicle_details.vehicle_type || 'car',
      model: apiProduct.vehicle_details.vehicle_model || '',
      capacity: apiProduct.vehicle_details.capacity || null,
      amount: apiProduct.price || 0
    }] : [],
    // Store additional API data for reference
    _apiData: apiProduct
  };
};

/**
 * Transform localStorage product format to API format
 */
export const transformLocalProductToApi = (localProduct, fullData = null) => {
  const productData = fullData || {};

  // Title
  const title = (localProduct.name || productData.productTitle || 'Untitled Product').toString().trim();

  // Category normalization: 'Rent a Car' -> 'rent_a_car'
  const rawCategory = (productData.productCategory || 'tour').toString().trim().toLowerCase();
  const category = rawCategory.replace(/\s+/g, '_');

  // Images -> strings
  const rawPhotos = Array.isArray(productData.uploadedPhotos) ? productData.uploadedPhotos : [];
  const images = rawPhotos.map(p => (typeof p === 'string' ? p : (p && p.url ? p.url : null))).filter(Boolean);
  const hero_image = (typeof productData.coverImage === 'string' ? productData.coverImage : (productData.coverImage && productData.coverImage.url)) || images[0] || null;
  const gallery_images = images.slice(1);

  // Highlights -> normalize to { icon, text }
  const rawHighlights = Array.isArray(productData.highlights) ? productData.highlights : [];
  const highlights = rawHighlights.map(h => {
    if (typeof h === 'string') return { icon: 'mountain', text: h };
    return { icon: h?.icon || 'mountain', text: h?.text || '' };
  });

  // Accessibility normalization
  const acc = productData.accessibilityToggles || productData.accessibility || {};
  const accessibility = {
    wheelchair_accessible: !!(acc.wheelchair || acc.wheelchair_accessible),
    service_animals_allowed: !!(acc.serviceAnimals || acc.service_animals_allowed),
    infant_seat_available: !!(acc.infantSeat || acc.infant_seat_available),
    stroller_friendly: !!(acc.stroller || acc.stroller_friendly)
  };

  // Itinerary defaults
  const itinerary = Array.isArray(productData.itineraries)
    ? productData.itineraries.map(it => ({
        time: (it?.time && String(it.time).trim()) ? it.time : '09:00',
        title: (it?.title && String(it.title).trim()) ? it.title : 'Experience highlight',
        description: (it?.description || '').toString(),
        icon: (it?.icon || 'sightseeing')
      }))
    : [];

  // Available days mapping
  const rawDay = productData.selectedWeekDay;
  let available_days = [];
  if (Array.isArray(rawDay)) {
    available_days = rawDay;
  } else if (typeof rawDay === 'string' && rawDay.trim()) {
    const low = rawDay.trim().toLowerCase();
    if (low === 'week days' || low === 'weekdays') {
      available_days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    } else if (low === 'weekend' || low === 'week end') {
      available_days = ['Saturday','Sunday'];
    } else {
      available_days = [rawDay];
    }
  }

  return {
    title,
    category,
    tagline: productData.tagline || '',
    description: productData.description || '',
    highlights,
    images,
    hero_image,
    gallery_images,
    itinerary,
    duration: productData.duration || '',
    guide_type: productData.selectedGuideType || '',
    activity_type: productData.selectedActivityType || '',
    languages: productData.selectedLanguages || [],
    things_to_carry: productData.selectedThingsToCarry || [],
    included_excluded: {
      included: productData.includedItems ? (Array.isArray(productData.includedItems) ? productData.includedItems : [productData.includedItems]) : [],
      excluded: productData.excludedItems ? (Array.isArray(productData.excludedItems) ? productData.excludedItems : [productData.excludedItems]) : []
    },
    accessibility,
    vehicle_details: localProduct.vehicles?.[0] ? {
      vehicle_type: localProduct.vehicles[0].type || 'car',
      vehicle_model: localProduct.vehicles[0].model || '',
      capacity: localProduct.vehicles[0].capacity || null
    } : null,
    pickup_dropoff: {
      pickup_location: productData.selectedPickupLocations?.[0] || '',
      dropoff_location: productData.selectedDropoffLocations?.[0] || '',
      pickup_time: productData.pickupTime || '',
      available_days,
      available_time_slots: productData.timeSlots ? Object.keys(productData.timeSlots) : []
    },
    price: parseFloat(localProduct.revenue || productData.vehicles?.[0]?.amount || productData.price || 0),
    currency: 'USD',
    price_unit: 'Per Group',
    destination: (productData.destination || '').toString(),
    breadcrumb: Array.isArray(productData.breadcrumb) ? productData.breadcrumb : [],
    selling_points: Array.isArray(productData.sellingPoints) ? productData.sellingPoints : (productData.sellingPoints ? [productData.sellingPoints] : []),
    style_theme: productData.styleTheme || '',
    faqs: []
  };
};

/**
 * Transform API products list response to localStorage format
 */
export const transformApiProductsList = (apiResponse) => {
  if (!apiResponse || !apiResponse.products) {
    return [];
  }
  
  return apiResponse.products.map(transformApiProductToLocal);
};

