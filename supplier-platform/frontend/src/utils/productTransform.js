/**
 * Utility functions to transform products between API format and localStorage format.
 * This keeps the supplier and customer platforms in sync while we migrate away from localStorage.
 */

const STATUS_MAP = {
  published: 'Published',
  draft: 'Draft',
  rejected: 'Rejected',
  archived: 'Archived',
  pending_review: 'Pending'
};

const mapAttractionToIcon = (attractionType) => {
  if (!attractionType) return 'sightseeing';
  const normalized = attractionType.toString().toLowerCase();
  if (normalized.includes('food') || normalized.includes('dining')) return 'dining';
  if (normalized.includes('culture') || normalized.includes('museum')) return 'highlight';
  if (normalized.includes('shopping')) return 'travel';
  if (normalized.includes('adventure') || normalized.includes('sport')) return 'travel';
  if (normalized.includes('wildlife') || normalized.includes('nature')) return 'sightseeing';
  return 'sightseeing';
};

const buildCustomFields = (productData) => {
  const customFields =
    (productData.customFields && typeof productData.customFields === 'object' && !Array.isArray(productData.customFields))
      ? { ...productData.customFields }
      : {};

  if (Array.isArray(productData.vehicles)) {
    customFields.vehicles_full = productData.vehicles;
  }

  if (Array.isArray(productData.itineraries)) {
    customFields.itineraries_full = productData.itineraries;
  }

  if (Array.isArray(productData.vehicleTimeAllocations)) {
    customFields.vehicle_time_allocations = productData.vehicleTimeAllocations;
  }

  if (productData.selectedVehicleForTour) {
    customFields.selected_vehicle_for_tour = productData.selectedVehicleForTour;
  }

  if (Array.isArray(productData.selectedPickupLocations)) {
    customFields.pickup_locations = productData.selectedPickupLocations;
  }

  if (Array.isArray(productData.selectedDropoffLocations)) {
    customFields.dropoff_locations = productData.selectedDropoffLocations;
  }

  if (productData.pickupTime) {
    customFields.pickup_time = productData.pickupTime;
  }

  if (productData.selectedWeekDay) {
    customFields.available_days = Array.isArray(productData.selectedWeekDay)
      ? productData.selectedWeekDay
      : [productData.selectedWeekDay];
  }

  if (productData.timeSlots) {
    customFields.time_slots = productData.timeSlots;
  }

  return customFields;
};

export const transformApiProductToLocal = (apiProduct) => {
  // Handle both full ProductResponse and lightweight ProductSummary responses
  // Summary responses may not have: custom_fields, vehicle_details, pickup_dropoff, itinerary, etc.
  const customFields = apiProduct.custom_fields || {};
  const vehiclesFull = Array.isArray(customFields?.vehicles_full) ? customFields.vehicles_full : null;
  const itinerariesFull = Array.isArray(customFields?.itineraries_full) ? customFields.itineraries_full : null;
  const pickupLocations = Array.isArray(customFields?.pickup_locations)
    ? customFields.pickup_locations
    : (apiProduct.pickup_dropoff?.pickup_location ? [apiProduct.pickup_dropoff.pickup_location] : []);
  const dropoffLocations = Array.isArray(customFields?.dropoff_locations)
    ? customFields.dropoff_locations
    : (apiProduct.pickup_dropoff?.dropoff_location ? [apiProduct.pickup_dropoff.dropoff_location] : []);
  const pickupTime = customFields?.pickup_time || apiProduct.pickup_dropoff?.pickup_time || '';
  const availableDays = customFields?.available_days || apiProduct.pickup_dropoff?.available_days || [];
  const availableTimeSlots = customFields?.time_slots
    ? (Array.isArray(customFields.time_slots) ? customFields.time_slots : Object.values(customFields.time_slots).flat())
    : (apiProduct.pickup_dropoff?.available_time_slots || []);

  return {
    id: apiProduct.id,
    dbProductId: apiProduct.id,
    name: apiProduct.title || '',
    referenceCode: apiProduct.id?.substring(0, 8) || `T-${Math.floor(1000 + Math.random() * 9000)}`,
    status: STATUS_MAP[apiProduct.status?.toLowerCase?.()] || 'Draft',
    bookings: apiProduct.bookings_count || 0,
    revenue: apiProduct.price || 0,
    creationDate: apiProduct.created_at ?
      new Date(apiProduct.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') :
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
    ratings: apiProduct.rating ? `${apiProduct.rating}/5` : '0/5',
    // Handle missing vehicle_details in summary responses
    vehicles: vehiclesFull && vehiclesFull.length
      ? vehiclesFull
      : (apiProduct.vehicle_details ? [{
          id: `${apiProduct.id}-vehicle`,
          title: apiProduct.vehicle_details.vehicle_model || 'Vehicle',
          type: apiProduct.vehicle_details.vehicle_type || 'car',
          model: apiProduct.vehicle_details.vehicle_model || '',
          year: apiProduct.vehicle_details.vehicle_year || '',
          attributes: '',
          capacity: apiProduct.vehicle_details.capacity || null,
          currency: apiProduct.currency || 'USD',
          pricingType: apiProduct.price_unit || 'Per Group',
          amount: apiProduct.price || 0,
          duration: apiProduct.duration || '',
          description: ''
        }] : []),
    // Handle missing itinerary in summary responses
    itineraries: itinerariesFull || apiProduct.itinerary || [],
    pickupLocations,
    dropoffLocations,
    pickupTime,
    availableDays,
    availableTimeSlots,
    faqs: Array.isArray(apiProduct.faqs) ? apiProduct.faqs : [],
    cancellationPolicy: apiProduct.cancellation_policy || null,
    // Store additional API data for reference (includes hero_image_url for summaries)
    _apiData: apiProduct
  };
};

export const transformLocalProductToApi = (localProduct, fullData = null) => {
  const productData = fullData || {};

  const title = (localProduct.name || productData.productTitle || 'Untitled Product').toString().trim();

  const rawCategory = (productData.productCategory || 'tour').toString().trim().toLowerCase();
  const category = rawCategory.replace(/\s+/g, '_');

  const rawPhotos = Array.isArray(productData.uploadedPhotos) ? productData.uploadedPhotos : [];
  const images = rawPhotos.map(p => (typeof p === 'string' ? p : (p && p.url ? p.url : null))).filter(Boolean);
  const hero_image = (typeof productData.coverImage === 'string' ? productData.coverImage : (productData.coverImage && productData.coverImage.url)) || images[0] || null;
  const gallery_images = images.slice(hero_image ? 1 : 0);

  const rawHighlights = Array.isArray(productData.highlights) ? productData.highlights : [];
  const highlights = rawHighlights.map(h => {
    if (typeof h === 'string') return { icon: 'mountain', text: h };
    return { icon: h?.icon || 'mountain', text: h?.text || '' };
  });

  const acc = productData.accessibilityToggles || productData.accessibility || {};
  const accessibility = {
    wheelchair_accessible: !!(acc.wheelchair || acc.wheelchair_accessible),
    service_animals_allowed: !!(acc.serviceAnimals || acc.service_animals_allowed),
    infant_seat_available: !!(acc.infantSeat || acc.infant_seat_available),
    stroller_friendly: !!(acc.stroller || acc.stroller_friendly)
  };

  const itinerary = Array.isArray(productData.itineraries)
    ? productData.itineraries.map((it, index) => ({
        time: (it?.time && String(it.time).trim())
          ? it.time
          : (it?.timeSpent ? String(it.timeSpent) : `Stop ${index + 1}`),
        title: (it?.title && String(it.title).trim())
          ? it.title
          : (it?.placeName || it?.location || `Experience highlight ${index + 1}`),
        description: (it?.description || '').toString(),
        icon: (it?.icon || mapAttractionToIcon(it?.attractionType))
      }))
    : [];

  const rawDay = productData.selectedWeekDay;
  let available_days = [];
  if (Array.isArray(rawDay)) {
    available_days = rawDay;
  } else if (typeof rawDay === 'string' && rawDay.trim()) {
    const low = rawDay.trim().toLowerCase();
    if (low === 'week days' || low === 'weekdays') {
      available_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    } else if (low === 'weekend' || low === 'week end') {
      available_days = ['Saturday', 'Sunday'];
    } else {
      available_days = [rawDay];
    }
  }

  const customFields = buildCustomFields(productData);

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
      vehicle_year: localProduct.vehicles[0].year || undefined,
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
    currency: productData.vehicles?.[0]?.currency || 'USD',
    price_unit: productData.vehicles?.[0]?.pricingType || 'Per Group',
    destination: (productData.destination || '').toString(),
    breadcrumb: Array.isArray(productData.breadcrumb) ? productData.breadcrumb : [],
    selling_points: Array.isArray(productData.sellingPoints) ? productData.sellingPoints : (productData.sellingPoints ? [productData.sellingPoints] : []),
    style_theme: productData.styleTheme || '',
    faqs: Array.isArray(productData.faqs) ? productData.faqs.filter(faq => faq.question && faq.answer && faq.question.trim() && faq.answer.trim()) : [],
    cancellation_policy: productData.cancellationPolicy && Array.isArray(productData.cancellationPolicy.schedule)
      ? {
          free_cancellation_text: productData.cancellationPolicy.freeCancellationText || '',
          schedule: productData.cancellationPolicy.schedule
            .filter(entry => entry?.label?.trim())
            .map(entry => ({
              label: entry.label.trim(),
              percentage: Number(entry.percentage) || 0,
              note: entry.note || ''
            })),
          notes: Array.isArray(productData.cancellationPolicy.notes)
            ? productData.cancellationPolicy.notes.filter(note => note && note.trim())
            : []
        }
      : null,
    custom_fields: customFields
  };
};

export const transformApiProductsList = (apiResponse) => {
  if (!apiResponse || !apiResponse.products) {
    return [];
  }

  return apiResponse.products.map(transformApiProductToLocal);
};

export const transformApiProductToDraftPayload = (apiProduct) => {
  if (!apiProduct) {
    return null;
  }

  const baseId = apiProduct.id || `product-${Date.now()}`;

  const normalizeCategory = (category) => {
    if (!category) return '';
    const words = String(category)
      .split(/[_\s]+/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return words.join(' ');
  };

  const customFields = apiProduct.custom_fields || {};
  const vehiclesFromCustom = Array.isArray(customFields?.vehicles_full) ? customFields.vehicles_full : null;
  const itineraryFromCustom = Array.isArray(customFields?.itineraries_full) ? customFields.itineraries_full : null;
  const pickupLocations = Array.isArray(customFields?.pickup_locations)
    ? customFields.pickup_locations
    : (apiProduct.pickup_dropoff?.pickup_location ? [apiProduct.pickup_dropoff.pickup_location] : []);
  const dropoffLocations = Array.isArray(customFields?.dropoff_locations)
    ? customFields.dropoff_locations
    : (apiProduct.pickup_dropoff?.dropoff_location ? [apiProduct.pickup_dropoff.dropoff_location] : []);
  const pickupTime = customFields?.pickup_time || apiProduct.pickup_dropoff?.pickup_time || '';
  const availableDays = customFields?.available_days || apiProduct.pickup_dropoff?.available_days || [];
  const timeSlots = customFields?.time_slots || apiProduct.pickup_dropoff?.available_time_slots || {};

  const buildPhotoObject = (url, index) => {
    if (!url) return null;
    const urlString = String(url);
    const nameFromUrl = urlString.split('/').pop()?.split('?')[0] || `Photo ${index + 1}`;
    return {
      id: `${baseId}-photo-${index}`,
      url: urlString,
      name: nameFromUrl,
      file: null
    };
  };

  const photos = [];
  const seen = new Set();

  const heroImage = apiProduct.hero_image || apiProduct.images?.[0] || null;
  if (heroImage) {
    const heroObj = buildPhotoObject(heroImage, 0);
    if (heroObj) {
      photos.push(heroObj);
      seen.add(heroObj.url);
    }
  }

  const galleryImages = Array.isArray(apiProduct.gallery_images) ? apiProduct.gallery_images : apiProduct.images || [];
  galleryImages.forEach((url, index) => {
    const obj = buildPhotoObject(url, photos.length + index);
    if (obj && !seen.has(obj.url)) {
      photos.push(obj);
      seen.add(obj.url);
    }
  });

  const vehicles = vehiclesFromCustom && vehiclesFromCustom.length
    ? vehiclesFromCustom
    : (apiProduct.vehicle_details ? [{
        id: `${baseId}-vehicle-0`,
        title: apiProduct.vehicle_details.vehicle_model || 'Vehicle',
        type: apiProduct.vehicle_details.vehicle_type || '',
        model: apiProduct.vehicle_details.vehicle_model || '',
        year: apiProduct.vehicle_details.vehicle_year || '',
        attributes: '',
        capacity: apiProduct.vehicle_details.capacity || null,
        currency: apiProduct.currency || 'USD',
        pricingType: apiProduct.price_unit || 'Per Group',
        amount: apiProduct.price || 0,
        duration: apiProduct.duration || '',
        description: ''
      }] : []);

  const itineraryEntries = itineraryFromCustom && itineraryFromCustom.length
    ? itineraryFromCustom
    : (Array.isArray(apiProduct.itinerary) ? apiProduct.itinerary.map((item, index) => ({
        id: `${baseId}-itinerary-${index}`,
        placeName: item.location || item.placeName || item.title || `Stop ${index + 1}`,
        location: item.location || item.placeName || item.title || `Stop ${index + 1}`,
        title: item.title || item.location || `Stop ${index + 1}`,
        description: item.description || '',
        attractionType: item.attractionType || item.icon || 'sightseeing',
        timeSpent: item.timeSpent || item.time || '',
        isFree: item.isFree !== undefined ? item.isFree : (item.ticketFare ? false : true),
        ticketFare: item.ticketFare || null,
        ticket: item.ticket || null,
        photo: item.photo || null,
        activities: Array.isArray(item.activities) ? item.activities : (item.attractionType ? [item.attractionType] : []),
        time: item.time || ''
      })) : []);

  const inferWeekDay = () => {
    if (Array.isArray(customFields?.available_days)) {
      const days = customFields.available_days;
      if (days.length >= 5) return 'week days';
      if (days.length === 1) return days[0];
      return days.join(', ');
    }
    if (availableDays.length === 7) return 'week days';
    return availableDays[0] || 'week days';
  };

  return {
    draftId: apiProduct.id,
    dbProductId: apiProduct.id,
    productTitle: apiProduct.title || '',
    productCategory: normalizeCategory(apiProduct.category),
    sellingPoints: apiProduct.selling_points || [],
    tagline: apiProduct.tagline || '',
    description: apiProduct.description || '',
    highlights: apiProduct.highlights || [],
    uploadedPhotos: photos,
    coverImage: photos.length ? { ...photos[0], id: `${baseId}-cover` } : null,
    selectedGuideType: apiProduct.guide_type || '',
    selectedActivityType: apiProduct.activity_type || '',
    selectedLanguages: apiProduct.languages || [],
    selectedThingsToCarry: apiProduct.things_to_carry || [],
    includedItems: apiProduct.included_excluded?.included || [],
    excludedItems: apiProduct.included_excluded?.excluded || [],
    accessibilityToggles: apiProduct.accessibility || {},
    vehicles,
    selectedVehicleForTour: customFields?.selected_vehicle_for_tour || (vehicles.length ? vehicles[0] : null),
    vehicleTimeAllocations: Array.isArray(customFields?.vehicle_time_allocations) ? customFields.vehicle_time_allocations : [],
    selectedPickupLocations: pickupLocations,
    selectedDropoffLocations: dropoffLocations,
    pickupTime,
    selectedPickupHour: pickupTime ? pickupTime.split(':')[0] : '00',
    selectedPickupMinute: pickupTime ? (pickupTime.split(':')[1] || '00') : '00',
    selectedWeekDay: inferWeekDay(),
    selectedDate: '',
    timeSlots,
    itineraries: itineraryEntries,
    faqs: Array.isArray(apiProduct.faqs) ? apiProduct.faqs : [],
    cancellationPolicy: apiProduct.cancellation_policy || null,
    destination: apiProduct.destination || '',
    duration: apiProduct.duration || '',
    lastModified: new Date().toISOString(),
    step: 1,
    customFields
  };
};
