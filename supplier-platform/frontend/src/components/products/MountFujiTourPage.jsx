import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, 
  FiEdit3, 
  FiUpload, 
  FiCompass, 
  FiStar, 
  FiCamera, 
  FiBriefcase, 
  FiUser, 
  FiTruck, 
  FiClock, 
  FiMapPin, 
  FiCalendar, 
  FiHelpCircle, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiPhone, 
  FiMail,
  FiGlobe,
  FiDollarSign,
  FiLinkedin,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiChevronDown,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiMinus,
  FiX
} from 'react-icons/fi';
import PublishProductModal from './PublishProductModal';
import ApplicationSubmittedPage from './ApplicationSubmittedPage';
import Footer from '@/components/common/Footer';
import productService from '@/services/productService';
import Header from '@/components/common/Header';
import dashboardService from '@/services/dashboardService';

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // ~1.5MB per image after compression
const MAX_IMAGE_COUNT = 8;

const approximateBytesFromDataUrl = (dataUrl = '') => {
  if (typeof dataUrl !== 'string') return 0;
  const base64 = dataUrl.split(',')[1];
  if (!base64) return 0;
  return Math.floor((base64.length * 3) / 4);
};

const compressDataUrl = async (dataUrl, maxBytes = MAX_IMAGE_BYTES) => {
  if (typeof window === 'undefined' || !dataUrl?.startsWith('data:image')) {
    return dataUrl;
  }

  const initialBytes = approximateBytesFromDataUrl(dataUrl);
  if (initialBytes <= maxBytes) {
    return dataUrl;
  }

  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      const scale = Math.sqrt(maxBytes / initialBytes);
      const targetWidth = Math.max(1, Math.floor(img.width * Math.min(scale, 1)));
      const targetHeight = Math.max(1, Math.floor(img.height * Math.min(scale, 1)));

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      let quality = 0.85;
      let output = canvas.toDataURL('image/jpeg', quality);
      let iterations = 0;

      while (approximateBytesFromDataUrl(output) > maxBytes && iterations < 8) {
        quality -= 0.1;
        output = canvas.toDataURL('image/jpeg', Math.max(quality, 0.4));
        iterations += 1;
      }

      resolve(output);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

const normaliseImageSource = async (source) => {
  if (!source || typeof source !== 'string') {
    return null;
  }

  const trimmed = source.trim();
  if (!trimmed.startsWith('data:image')) {
    return trimmed;
  }

  try {
    return await compressDataUrl(trimmed);
  } catch (error) {
    console.warn('Image compression failed, using original image.', error);
    return trimmed;
  }
};

const dedupeStrings = (items = []) => {
  const seen = new Set();
  const result = [];
  items.forEach((item) => {
    if (item && !seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  });
  return result;
};

const buildImagePayload = async (sources = [], limit = MAX_IMAGE_COUNT) => {
  const limited = sources.filter(Boolean).slice(0, limit);
  if (limited.length === 0) {
    return [];
  }

  const processed = await Promise.all(
    limited.map(async (item) => {
      const src = typeof item === 'string' ? item : item?.url || null;
      if (!src) return null;
      return await normaliseImageSource(src);
    })
  );

  return dedupeStrings(processed.filter(Boolean));
};

const mapItineraryEntriesForApi = (entries = []) => {
  if (!Array.isArray(entries)) return [];
  return entries.map((item, index) => {
    if (!item) return null;
    const resolvedTitle =
      (item.title && String(item.title).trim()) ||
      (item.placeName && String(item.placeName).trim()) ||
      (item.location && String(item.location).trim()) ||
      `Itinerary stop ${index + 1}`;
    const resolvedDescription = (item.description || '').toString();
    const resolvedTime =
      item.time && String(item.time).trim() ? item.time : `${String(9 + index).padStart(2, '0')}:00`;

    let photoUrl = null;
    if (item.photo) {
      if (typeof item.photo === 'string') {
        photoUrl = item.photo;
      } else if (item.photo?.url) {
        photoUrl = item.photo.url;
      }
    }
    if (!photoUrl) {
      photoUrl = item.croppedPhoto || item.photoPreview || null;
    }

    return {
      time: resolvedTime,
      title: resolvedTitle,
      description: resolvedDescription,
      icon: item.lineIcon || item.icon || 'sightseeing',
      photo: photoUrl,
      location: item.location || item.placeName || resolvedTitle,
      timeSpent: item.timeSpent || '',
      isFree: item.isFree !== undefined ? item.isFree : true,
      ticketFare: item.ticketFare || null,
      ticket: item.ticket || null,
      attractionType: item.attractionType || '',
      activities: Array.isArray(item.activities) ? item.activities : [],
    };
  }).filter(Boolean);
};

const buildCustomFieldsPayload = ({
  existingVehicles = [],
  selectedVehicleForTour = null,
  existingVehicleAllocations = [],
  productData = {},
  heroUrl = null,
  galleryImages = [],
  availableDays = [],
}) => ({
  vehicles_full: existingVehicles,
  selected_vehicle_for_tour: selectedVehicleForTour,
  vehicle_time_allocations: existingVehicleAllocations,
  itineraries_full: Array.isArray(productData?.itineraries) ? productData.itineraries : [],
  total_tour_days: productData?.totalTourDays || '1',
  day_durations: productData?.dayDurations || {},
  pickup_locations: productData?.pickupLocations || productData?.selectedPickupLocations || [],
  dropoff_locations: productData?.dropoffLocations || productData?.selectedDropoffLocations || [],
  pickup_time: (() => {
    // Priority 1: First vehicle-time allocation time
    if (Array.isArray(existingVehicleAllocations) && existingVehicleAllocations.length > 0) {
      const firstAllocation = existingVehicleAllocations[0];
      if (firstAllocation?.time || firstAllocation?.pickup_time) {
        return firstAllocation.time || firstAllocation.pickup_time || '';
      }
    }
    // Priority 2: From productData vehicleTimeAllocations
    if (Array.isArray(productData?.vehicleTimeAllocations) && productData.vehicleTimeAllocations.length > 0) {
      const firstAllocation = productData.vehicleTimeAllocations[0];
      if (firstAllocation?.time || firstAllocation?.pickup_time) {
        return firstAllocation.time || firstAllocation.pickup_time || '';
      }
    }
    // Priority 3: Legacy pickupTime field
    return productData?.pickupTime || '';
  })(),
  available_days: availableDays || [],
  time_slots: productData?.timeSlots || {},
  cover_image_backup: heroUrl || null,
  uploaded_photos_backup: Array.isArray(galleryImages) ? galleryImages : [],
});

const FALLBACK_SUPPLIER_ID = 'N/A';
const buildEmptyCancellationPolicy = () => ({
  freeCancellationText: '',
  schedule: [],
  notes: []
});

const MountFujiTourPage = ({ coverImage, uploadedPhotos, productData, onBack }) => {
  const navigate = useNavigate();
  
  // CRITICAL DEBUG: Log productData when component first receives it (at "final look")
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎬 [FINAL LOOK] MountFujiTourPage received productData:', {
        hasProductData: !!productData,
        productDataKeys: productData ? Object.keys(productData) : [],
        hasVehicleTimeAllocations: Array.isArray(productData?.vehicleTimeAllocations),
        vehicleTimeAllocationsCount: Array.isArray(productData?.vehicleTimeAllocations) 
          ? productData.vehicleTimeAllocations.length 
          : 0,
        vehicleTimeAllocations: productData?.vehicleTimeAllocations,
        hasVehicles: Array.isArray(productData?.vehicles),
        vehiclesCount: Array.isArray(productData?.vehicles) ? productData.vehicles.length : 0,
        vehicles: productData?.vehicles,
        hasPickupLocations: Array.isArray(productData?.pickupLocations),
        pickupLocationsCount: Array.isArray(productData?.pickupLocations) ? productData.pickupLocations.length : 0,
        pickupLocations: productData?.pickupLocations,
        pickupTime: productData?.pickupTime,
        hasPickupDropoff: !!productData?.pickup_dropoff,
        pickupDropoff: productData?.pickup_dropoff,
        // Check for vehicle-time allocation related keys
        relatedKeys: productData ? Object.keys(productData).filter(k => 
          k.toLowerCase().includes('vehicle') || 
          k.toLowerCase().includes('pickup') || 
          k.toLowerCase().includes('time') || 
          k.toLowerCase().includes('allocation')
        ) : []
      })
      
      // Specifically check vehicleTimeAllocations structure
      if (Array.isArray(productData?.vehicleTimeAllocations) && productData.vehicleTimeAllocations.length > 0) {
        console.log('✅ [FINAL LOOK] vehicleTimeAllocations DETAILS:', productData.vehicleTimeAllocations.map((alloc, idx) => ({
          index: idx,
          id: alloc.id,
          time: alloc.time,
          pickup_time: alloc.pickup_time,
          vehicle_id: alloc.vehicle_id,
          vehicle: alloc.vehicle ? {
            id: alloc.vehicle.id || alloc.vehicle._id,
            title: alloc.vehicle.title,
            model: alloc.vehicle.model,
            type: alloc.vehicle.type
          } : null,
          pickupLocations: alloc.pickupLocations,
          pickupLocation: alloc.pickupLocation,
          pickup_location: alloc.pickup_location,
          date: alloc.date,
          pickup_date: alloc.pickup_date,
          datetime: alloc.datetime,
          fullAllocation: alloc // Include full object for inspection
        })))
        
        // Also show the full array structure
        console.log('✅ [FINAL LOOK] vehicleTimeAllocations FULL ARRAY:', JSON.stringify(productData.vehicleTimeAllocations, null, 2))
      } else {
        console.warn('⚠️ [FINAL LOOK] NO vehicleTimeAllocations found in productData!')
        console.warn('⚠️ [FINAL LOOK] This means pickup_configurations will be EMPTY when publishing!')
      }
    }
  }, [productData]) // Only run when productData changes
  
  // Initialize selectedDay from available days
  const [selectedDay, setSelectedDay] = useState(() => {
    // Try to get from productData first
    if (Array.isArray(productData?.pickup_dropoff?.available_days) && productData.pickup_dropoff.available_days.length > 0) {
      return productData.pickup_dropoff.available_days[0];
    }
    if (Array.isArray(productData?.availableDays) && productData.availableDays.length > 0) {
      return productData.availableDays[0];
    }
    if (productData?.weekDay) {
      return productData.weekDay;
    }
    return 'Tuesday'; // Default fallback
  });
  
  // Update selectedDay when available days change
  useEffect(() => {
    if (Array.isArray(productData?.pickup_dropoff?.available_days) && productData.pickup_dropoff.available_days.length > 0) {
      if (!productData.pickup_dropoff.available_days.includes(selectedDay)) {
        setSelectedDay(productData.pickup_dropoff.available_days[0]);
      }
    } else if (Array.isArray(productData?.availableDays) && productData.availableDays.length > 0) {
      if (!productData.availableDays.includes(selectedDay)) {
        setSelectedDay(productData.availableDays[0]);
      }
    } else if (productData?.weekDay && selectedDay !== productData.weekDay) {
      setSelectedDay(productData.weekDay);
    }
  }, [productData?.pickup_dropoff?.available_days, productData?.availableDays, productData?.weekDay, selectedDay]);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [language, setLanguage] = useState('US English');
  const [currency, setCurrency] = useState('$ USD - US Dollar');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(null);
  const [previewProfile, setPreviewProfile] = useState({
    name: 'User',
    id: FALLBACK_SUPPLIER_ID,
    photo: null,
    balance: null
  });
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  useEffect(() => {
    const loadProfileFromStorage = () => {
      try {
        const stored =
          localStorage.getItem('account_settings') ||
          sessionStorage.getItem('account_settings');
        const supplierId =
          localStorage.getItem('supplier_id') ||
          sessionStorage.getItem('supplier_id') ||
          FALLBACK_SUPPLIER_ID;

        let name = 'User';
        let id = supplierId || FALLBACK_SUPPLIER_ID;
        let photo = null;

        if (stored) {
          const data = JSON.parse(stored);
          name =
            data?.editableInfo?.publicName?.trim() ||
            data?.profileData?.publicName?.trim() ||
            name;
          id =
            data?.profileData?.contactValue?.toString().trim() ||
            data?.editableInfo?.contactValue?.toString().trim() ||
            id;
          photo = data?.globalUserPhoto || data?.profilePhotoPreview || null;
        }

        const dashboardRaw =
          localStorage.getItem('dashboard_data') ||
          sessionStorage.getItem('dashboard_data');
        let balance = previewProfile.balance;

        if (dashboardRaw) {
          try {
            const dashboard = JSON.parse(dashboardRaw);
            const value =
              typeof dashboard?.balance === 'number'
                ? dashboard.balance
                : parseFloat(dashboard?.balance);
            if (!Number.isNaN(value)) {
              balance = value;
            }
          } catch (_) {
            // ignore malformed dashboard data
          }
        }

        setPreviewProfile({
          name,
          id: id || FALLBACK_SUPPLIER_ID,
          photo,
          balance
        });

        (async () => {
          try {
            const overview = await dashboardService.getOverview();
            const availableBalance = overview?.metrics?.available_balance;
            if (typeof availableBalance === 'number' && !Number.isNaN(availableBalance)) {
              setPreviewProfile((prev) => ({ ...prev, balance: availableBalance }));
            }
          } catch (error) {
            console.warn('Failed to refresh supplier balance', error);
          }
        })();
      } catch (error) {
        console.warn('Failed to load supplier preview profile', error);
      }
    };

    loadProfileFromStorage();
    window.addEventListener('account_settings_updated', loadProfileFromStorage);
    window.addEventListener('accountSettingsUpdated', loadProfileFromStorage);
    window.addEventListener('dashboard_data_updated', loadProfileFromStorage);
    window.addEventListener('bookings_updated', loadProfileFromStorage);
    window.addEventListener('products_updated', loadProfileFromStorage);
    window.addEventListener('storage', loadProfileFromStorage);

    return () => {
      window.removeEventListener(
        'account_settings_updated',
        loadProfileFromStorage
      );
      window.removeEventListener(
        'accountSettingsUpdated',
        loadProfileFromStorage
      );
      window.removeEventListener('dashboard_data_updated', loadProfileFromStorage);
      window.removeEventListener('bookings_updated', loadProfileFromStorage);
      window.removeEventListener('products_updated', loadProfileFromStorage);
      window.removeEventListener('storage', loadProfileFromStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Initialize selected vehicle index when vehicles are available
  useEffect(() => {
    if (Array.isArray(productData?.vehicles) && productData.vehicles.length > 0) {
      setSelectedVehicleIndex((prev) => {
        if (prev === null || prev >= productData.vehicles.length) {
          return 0;
        }
        return prev;
      });
    } else {
      setSelectedVehicleIndex(null);
    }
  }, [productData?.vehicles]);

  const selectedVehicle = useMemo(() => {
    if (!Array.isArray(productData?.vehicles) || selectedVehicleIndex === null) return null;
    return productData.vehicles[selectedVehicleIndex] || null;
  }, [productData?.vehicles, selectedVehicleIndex]);

  // Get pickup configurations for selected vehicle
  const selectedVehiclePickupConfigs = useMemo(() => {
    if (!selectedVehicle || !productData?.pickup_dropoff?.pickup_configurations) {
      return [];
    }
    
    const configs = productData.pickup_dropoff.pickup_configurations;
    if (!Array.isArray(configs) || configs.length === 0) {
      return [];
    }
    
    // Match configurations by vehicle_id, vehicle.id, or vehicle title/model
    const vehicleId = selectedVehicle.id || selectedVehicle._id;
    const vehicleTitle = selectedVehicle.title || selectedVehicle.model;
    
    return configs.filter(config => {
      // Match by vehicle_id
      if (config.vehicle_id && vehicleId && String(config.vehicle_id) === String(vehicleId)) {
        return true;
      }
      // Match by vehicle.id in config.vehicle object
      if (config.vehicle?.id && vehicleId && String(config.vehicle.id) === String(vehicleId)) {
        return true;
      }
      // Match by vehicle title/model in config.vehicle object
      if (config.vehicle && vehicleTitle) {
        const configTitle = config.vehicle.title || config.vehicle.model;
        if (configTitle && String(configTitle).toLowerCase() === String(vehicleTitle).toLowerCase()) {
          return true;
        }
      }
      // Also match by checking vehicleTimeAllocations for direct vehicle reference
      if (Array.isArray(productData?.vehicleTimeAllocations)) {
        const matchingAllocation = productData.vehicleTimeAllocations.find(alloc => {
          const allocVehicleId = alloc.vehicle?.id || alloc.vehicle_id;
          const allocVehicleTitle = alloc.vehicle?.title || alloc.vehicle?.model;
          return (allocVehicleId && vehicleId && String(allocVehicleId) === String(vehicleId)) ||
                 (allocVehicleTitle && vehicleTitle && String(allocVehicleTitle).toLowerCase() === String(vehicleTitle).toLowerCase());
        });
        if (matchingAllocation && (matchingAllocation.time === config.pickup_time || matchingAllocation.pickup_time === config.pickup_time)) {
          return true;
        }
      }
      return false;
    });
  }, [selectedVehicle, productData?.pickup_dropoff?.pickup_configurations, productData?.vehicleTimeAllocations]);

  // Get pickup locations (meeting points) for selected vehicle
  const selectedVehiclePickupLocations = useMemo(() => {
    const configs = selectedVehiclePickupConfigs;
    
    if (configs.length === 0) {
      // Fallback to productData.pickupLocations if no configurations for this vehicle
      // But also check vehicleTimeAllocations for this vehicle
      if (Array.isArray(productData?.vehicleTimeAllocations) && selectedVehicle) {
        const vehicleId = selectedVehicle.id || selectedVehicle._id;
        const vehicleTitle = selectedVehicle.title || selectedVehicle.model;
        
        const matchingAllocations = productData.vehicleTimeAllocations.filter(alloc => {
          const allocVehicleId = alloc.vehicle?.id || alloc.vehicle_id;
          const allocVehicleTitle = alloc.vehicle?.title || alloc.vehicle?.model;
          return (allocVehicleId && vehicleId && String(allocVehicleId) === String(vehicleId)) ||
                 (allocVehicleTitle && vehicleTitle && String(allocVehicleTitle).toLowerCase() === String(vehicleTitle).toLowerCase());
        });
        
        if (matchingAllocations.length > 0) {
          const locations = [];
          const seen = new Set();
          matchingAllocations.forEach(alloc => {
            if (Array.isArray(alloc.pickupLocations)) {
              alloc.pickupLocations.forEach(loc => {
                if (!seen.has(loc)) {
                  seen.add(loc);
                  locations.push(loc);
                }
              });
            } else if (alloc.pickupLocation && !seen.has(alloc.pickupLocation)) {
              seen.add(alloc.pickupLocation);
              locations.push(alloc.pickupLocation);
            }
          });
          if (locations.length > 0) {
            return locations;
          }
        }
      }
      return Array.isArray(productData?.pickupLocations) ? productData.pickupLocations : [];
    }
    
    // Extract unique pickup locations from configurations
    const locations = [];
    const seen = new Set();
    
    configs.forEach(config => {
      if (config.pickup_location) {
        // pickup_location can be a comma-separated string or single location
        const locs = config.pickup_location.split(',').map(l => l.trim()).filter(Boolean);
        locs.forEach(loc => {
          if (!seen.has(loc)) {
            seen.add(loc);
            locations.push(loc);
          }
        });
      }
    });
    
    return locations.length > 0 ? locations : (Array.isArray(productData?.pickupLocations) ? productData.pickupLocations : []);
  }, [selectedVehiclePickupConfigs, productData?.pickupLocations, productData?.vehicleTimeAllocations, selectedVehicle]);

  // Get dropoff locations for selected vehicle (similar to pickup locations)
  const selectedVehicleDropoffLocations = useMemo(() => {
    const configs = selectedVehiclePickupConfigs;
    
    if (configs.length === 0) {
      // Fallback to productData.dropoffLocations or vehicleTimeAllocations for this vehicle
      if (Array.isArray(productData?.vehicleTimeAllocations) && selectedVehicle) {
        const vehicleId = selectedVehicle.id || selectedVehicle._id;
        const vehicleTitle = selectedVehicle.title || selectedVehicle.model;
        
        const matchingAllocations = productData.vehicleTimeAllocations.filter(alloc => {
          const allocVehicleId = alloc.vehicle?.id || alloc.vehicle_id;
          const allocVehicleTitle = alloc.vehicle?.title || alloc.vehicle?.model;
          return (allocVehicleId && vehicleId && String(allocVehicleId) === String(vehicleId)) ||
                 (allocVehicleTitle && vehicleTitle && String(allocVehicleTitle).toLowerCase() === String(vehicleTitle).toLowerCase());
        });
        
        if (matchingAllocations.length > 0) {
          const locations = [];
          const seen = new Set();
          matchingAllocations.forEach(alloc => {
            // Check dropoffLocations first, fallback to pickupLocations if same
            const dropoffLocs = Array.isArray(alloc.dropoffLocations) && alloc.dropoffLocations.length > 0
              ? alloc.dropoffLocations
              : (Array.isArray(alloc.pickupLocations) ? alloc.pickupLocations : []);
            
            dropoffLocs.forEach(loc => {
              if (!seen.has(loc)) {
                seen.add(loc);
                locations.push(loc);
              }
            });
          });
          if (locations.length > 0) {
            return locations;
          }
        }
      }
      // Fallback to productData.dropoffLocations or pickupLocations (same as pickup)
      return Array.isArray(productData?.dropoffLocations) && productData.dropoffLocations.length > 0
        ? productData.dropoffLocations
        : (Array.isArray(productData?.pickupLocations) ? productData.pickupLocations : []);
    }
    
    // Extract unique dropoff locations from configurations
    // If dropoff_location is not specified or same as pickup, use pickup locations
    const locations = [];
    const seen = new Set();
    
    configs.forEach(config => {
      // Check if dropoff_location exists and is different from pickup_location
      if (config.dropoff_location && config.dropoff_location !== config.pickup_location) {
        // dropoff_location can be a comma-separated string or single location
        const dropoffLocs = config.dropoff_location.split(',').map(l => l.trim()).filter(Boolean);
        dropoffLocs.forEach(loc => {
          if (!seen.has(loc)) {
            seen.add(loc);
            locations.push(loc);
          }
        });
      } else {
        // No dropoff_location specified or same as pickup - use pickup locations
        if (config.pickup_location) {
          const pickupLocs = config.pickup_location.split(',').map(l => l.trim()).filter(Boolean);
          pickupLocs.forEach(loc => {
            if (!seen.has(loc)) {
              seen.add(loc);
              locations.push(loc);
            }
          });
        }
      }
    });
    
    return locations.length > 0 ? locations : (Array.isArray(productData?.dropoffLocations) && productData.dropoffLocations.length > 0
      ? productData.dropoffLocations
      : (Array.isArray(productData?.pickupLocations) ? productData.pickupLocations : []));
  }, [selectedVehiclePickupConfigs, productData?.dropoffLocations, productData?.pickupLocations, productData?.vehicleTimeAllocations, selectedVehicle]);

  // Get pickup time for selected vehicle
  const selectedVehiclePickupTime = useMemo(() => {
    // Priority 1: First pickup configuration time for selected vehicle
    if (selectedVehiclePickupConfigs.length > 0) {
      const firstConfig = selectedVehiclePickupConfigs[0];
      if (firstConfig?.pickup_time) {
        return firstConfig.pickup_time;
      }
    }
    // Priority 2: Check vehicleTimeAllocations for this specific vehicle
    if (Array.isArray(productData?.vehicleTimeAllocations) && selectedVehicle) {
      const vehicleId = selectedVehicle.id || selectedVehicle._id;
      const vehicleTitle = selectedVehicle.title || selectedVehicle.model;
      
      const matchingAllocation = productData.vehicleTimeAllocations.find(alloc => {
        const allocVehicleId = alloc.vehicle?.id || alloc.vehicle_id;
        const allocVehicleTitle = alloc.vehicle?.title || alloc.vehicle?.model;
        return (allocVehicleId && vehicleId && String(allocVehicleId) === String(vehicleId)) ||
               (allocVehicleTitle && vehicleTitle && String(allocVehicleTitle).toLowerCase() === String(vehicleTitle).toLowerCase());
      });
      
      if (matchingAllocation?.time || matchingAllocation?.pickup_time) {
        return matchingAllocation.time || matchingAllocation.pickup_time;
      }
    }
    // Priority 3: First pickup configuration time (any vehicle)
    if (productData?.pickup_dropoff?.pickup_configurations && 
        Array.isArray(productData.pickup_dropoff.pickup_configurations) && 
        productData.pickup_dropoff.pickup_configurations.length > 0) {
      const firstConfig = productData.pickup_dropoff.pickup_configurations[0];
      if (firstConfig?.pickup_time) {
        return firstConfig.pickup_time;
      }
    }
    // Priority 4: First vehicle-time allocation (any vehicle)
    if (Array.isArray(productData?.vehicleTimeAllocations) && productData.vehicleTimeAllocations.length > 0) {
      const firstAllocation = productData.vehicleTimeAllocations[0];
      if (firstAllocation?.time || firstAllocation?.pickup_time) {
        return firstAllocation.time || firstAllocation.pickup_time;
      }
    }
    // Priority 5: Legacy pickupTime field
    if (productData?.pickupTime) {
      return productData.pickupTime;
    }
    // Priority 6: pickup_dropoff.pickup_time
    if (productData?.pickup_dropoff?.pickup_time) {
      return productData.pickup_dropoff.pickup_time;
    }
    return null;
  }, [selectedVehiclePickupConfigs, productData?.pickup_dropoff?.pickup_configurations, productData?.vehicleTimeAllocations, productData?.pickupTime, productData?.pickup_dropoff?.pickup_time, selectedVehicle]);

  const profileInitials = useMemo(() => {
    if (!previewProfile?.name) return 'US';
    const parts = previewProfile.name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`
      .toUpperCase()
      .slice(0, 2);
  }, [previewProfile?.name]);

  const formattedBalance = useMemo(() => {
    const value = previewProfile?.balance;
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
    return '1850';
  }, [previewProfile?.balance]);


  const handleSaveDraft = async () => {
    if (isSavingDraft || isPublishing) {
      console.log('⏳ Already processing, please wait...');
      return;
    }
    
    setIsSavingDraft(true);
    try {
      console.log('💾 Saving draft to database...');
      
      // Helper to coerce various inputs into clean string arrays
      const ensureStringArray = (value, { splitOnComma = false } = {}) => {
        if (!value) return [];
        if (Array.isArray(value)) {
          return value
            .map((item) => {
              if (typeof item === 'string') {
                return item.trim();
              }
              if (item && typeof item === 'object') {
                return (
                  item.value?.toString().trim() ||
                  item.label?.toString().trim() ||
                  item.name?.toString().trim() ||
                  ''
                );
              }
              return '';
            })
            .map((item) => (splitOnComma ? item.split(',') : item))
            .flat()
            .map((item) => item.trim())
            .filter(Boolean);
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (!trimmed) return [];
          if (splitOnComma) {
            return trimmed
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);
          }
          return [trimmed];
        }
        return [];
      };

      // Normalize category from supplier form (which may contain labels like "Tour", "Rent a Car" or custom text)
      const normalizeCategoryValue = (value) => {
        const raw = (value || 'tour').toString().trim().toLowerCase();
        if (raw === 'tour') return 'tour';
        if (raw === 'hotel') return 'hotel';
        // Handle different ways supplier UI might represent "Rent a Car"
        if (raw === 'rent a car' || raw === 'rent_a_car' || raw === 'rentacar') return 'rent_a_car';
        // For any custom/manual category, fall back to a safe default enum value
        return 'tour';
      };

      const normalizedCategory = normalizeCategoryValue(productData?.category);

      const normalizedLanguages = ensureStringArray(productData?.languages);
      const normalizedThingsToCarry = ensureStringArray(productData?.thingsToCarry);
      const normalizedSellingPoints = ensureStringArray(productData?.sellingPoints);
      const normalizedBreadcrumb = ensureStringArray(productData?.breadcrumb, {
        splitOnComma: true
      });
      const normalizedIncluded = ensureStringArray(productData?.includedItems);
      const normalizedExcluded = ensureStringArray(productData?.excludedItems);
      const normalizedAvailableDays = ensureStringArray(
        productData?.availableDays ||
          productData?.availableDay ||
          (productData?.weekDay ? [productData.weekDay] : [])
      );

      // Derive and normalize title from form state (support both title and productTitle)
      const normalizedTitle = (productData?.title || productData?.productTitle || '').trim();

      const existingVehicles = Array.isArray(productData?.vehicles) ? productData.vehicles : [];
      const selectedVehicleForTour = productData?.selectedVehicleForTour
        ? (Array.isArray(productData.selectedVehicleForTour)
            ? productData.selectedVehicleForTour[0]
            : productData.selectedVehicleForTour)
        : existingVehicles[0] || null;
      const existingVehicleAllocations = Array.isArray(productData?.vehicleTimeAllocations)
        ? productData.vehicleTimeAllocations
        : [];
      const primaryVehicle = selectedVehicleForTour || existingVehicles[0] || null;

      const normalizedFaqs = Array.isArray(productData?.faqs)
        ? productData.faqs
            .filter(faq => faq?.question?.trim() && faq?.answer?.trim())
            .map(faq => ({
              question: faq.question.trim(),
              answer: faq.answer.trim()
            }))
        : [];
      const normalizedCancellationPolicy = productData?.cancellationPolicy && Array.isArray(productData.cancellationPolicy.schedule)
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
        : null;

      // Prepare product data for API (matching ProductCreate schema)
      const apiProductData = {
        title: normalizedTitle || 'Untitled Product',
        category: normalizedCategory,
        tagline: productData?.tagline || '',
        description: productData?.description || 'No description provided',
        highlights: Array.isArray(productData?.highlights) ? productData.highlights.map(h => ({
          icon: h.icon || 'mountain',
          text: h.text || ''
        })) : [],
        images: [],
        hero_image: null,
        gallery_images: [],
        itinerary: mapItineraryEntriesForApi(productData?.itineraries),
        total_tour_days: productData?.totalTourDays || '1',
        day_durations: productData?.dayDurations || {},
        duration: productData?.duration || '',
        guide_type: productData?.guideType || '',
        activity_type: productData?.activityType || '',
        languages: normalizedLanguages,
        things_to_carry: normalizedThingsToCarry,
        included_excluded: {
          included: normalizedIncluded,
          excluded: normalizedExcluded
        },
        accessibility: productData?.accessibility || {},
        vehicle_details: primaryVehicle ? {
          vehicle_type: primaryVehicle.type || 'car',
          vehicle_model: primaryVehicle.model || '',
          vehicle_year: primaryVehicle.year || null,
          capacity: Number.isFinite(primaryVehicle.capacity)
            ? primaryVehicle.capacity
            : null
        } : null,
        pickup_dropoff: {
          // Legacy fields for backward compatibility
          pickup_location: productData?.pickupLocations?.[0] || '',
          dropoff_location: productData?.dropoffLocations?.[0] || '',
          pickup_time: (() => {
            // Priority 1: First vehicle-time allocation time
            if (Array.isArray(productData?.vehicleTimeAllocations) && productData.vehicleTimeAllocations.length > 0) {
              const firstAllocation = productData.vehicleTimeAllocations[0];
              if (firstAllocation?.time || firstAllocation?.pickup_time) {
                let timeStr = firstAllocation.time || firstAllocation.pickup_time || '';
                // Ensure time is in HH:MM format
                if (timeStr && timeStr.includes(':')) {
                  const timeParts = timeStr.split(':');
                  if (timeParts.length >= 2) {
                    const hours = String(timeParts[0] || '00').padStart(2, '0');
                    const minutes = String(timeParts[1] || '00').padStart(2, '0');
                    return `${hours}:${minutes}`;
                  }
                }
                return timeStr;
              }
            }
            // Priority 2: Legacy pickupTime field
            const timeStr = productData?.pickupTime || '';
            if (timeStr && timeStr.includes(':')) {
              const timeParts = timeStr.split(':');
              if (timeParts.length >= 2) {
                const hours = String(timeParts[0] || '00').padStart(2, '0');
                const minutes = String(timeParts[1] || '00').padStart(2, '0');
                return `${hours}:${minutes}`;
              }
            }
            return timeStr;
          })(),
          available_days: normalizedAvailableDays,
          available_time_slots: productData?.timeSlots
            ? Object.values(productData.timeSlots).flat().filter(Boolean)
            : [],
          
          // New enhanced fields - vehicle-based pickup configurations
          pickup_locations: Array.isArray(productData?.pickupLocations) ? productData.pickupLocations : [],
          dropoff_locations: Array.isArray(productData?.dropoffLocations) ? productData.dropoffLocations : [],
          
          // Pickup configurations: location + vehicle + time + date (vehicle-based)
          pickup_configurations: Array.isArray(productData?.vehicleTimeAllocations) && productData.vehicleTimeAllocations.length > 0
            ? productData.vehicleTimeAllocations.map(allocation => {
                // Format pickup time as HH:MM
                let formattedTime = allocation.time || allocation.pickup_time || '';
                if (formattedTime) {
                  const timeParts = formattedTime.split(':');
                  if (timeParts.length >= 2) {
                    const hours = String(timeParts[0] || '00').padStart(2, '0');
                    const minutes = String(timeParts[1] || '00').padStart(2, '0');
                    formattedTime = `${hours}:${minutes}`;
                  }
                }
                
                // Extract pickup locations - can be array or comma-separated string
                let pickupLocationStr = '';
                if (Array.isArray(allocation.pickupLocations) && allocation.pickupLocations.length > 0) {
                  pickupLocationStr = allocation.pickupLocations.join(', ');
                } else if (allocation.pickupLocation) {
                  pickupLocationStr = allocation.pickupLocation;
                } else if (allocation.pickup_location) {
                  pickupLocationStr = allocation.pickup_location;
                }
                
                // Extract dropoff locations - use dropoff locations if provided, otherwise use pickup locations (same location)
                let dropoffLocationStr = null;
                const dropoffLocationsForConfig = Array.isArray(allocation.dropoffLocations) && allocation.dropoffLocations.length > 0
                  ? allocation.dropoffLocations
                  : (Array.isArray(allocation.pickupLocations) && allocation.pickupLocations.length > 0
                    ? allocation.pickupLocations
                    : []);
                
                if (dropoffLocationsForConfig.length > 0) {
                  dropoffLocationStr = dropoffLocationsForConfig.join(', ');
                  // Only set dropoff_location if it's different from pickup (otherwise null = same location)
                  if (dropoffLocationStr === pickupLocationStr) {
                    dropoffLocationStr = null;
                  }
                }
                
                return {
                  pickup_location: pickupLocationStr,
                  dropoff_location: dropoffLocationStr,  // null if same as pickup (will be shown as same location in UI)
                  vehicle_id: allocation.vehicle?.id || allocation.vehicle_id || null,
                  vehicle: allocation.vehicle || null,
                  pickup_time: formattedTime,
                  pickup_date: allocation.date || allocation.pickup_date || null,
                  pickup_datetime: allocation.datetime || allocation.pickup_datetime || null
                };
              })
            : [],
          
          // Time slot configuration settings
          time_slot_configuration: {
            start_time: productData?.startTime || null,
            end_time: productData?.endTime || null,
            duration: productData?.duration ? parseInt(productData.duration) : null,
            apply_to_all_days: productData?.applyToAllDays || false
          },
          
          // Time slots organized by day - normalize time format to HH:MM
          time_slots_by_day: productData?.timeSlots && typeof productData.timeSlots === 'object'
            ? (() => {
                const normalized = {};
                Object.keys(productData.timeSlots).forEach(day => {
                  const slots = productData.timeSlots[day];
                  if (Array.isArray(slots)) {
                    normalized[day] = slots.map(slot => {
                      if (typeof slot === 'string') {
                        const cleaned = slot.replace(/\s+/g, '').trim();
                        const parts = cleaned.split(':');
                        if (parts.length >= 2) {
                          const hours = String(parts[0] || '00').padStart(2, '0');
                          const minutes = String(parts[1] || '00').padStart(2, '0');
                          return `${hours}:${minutes}`;
                        }
                        return cleaned;
                      }
                      return slot;
                    }).filter(Boolean);
                  } else {
                    normalized[day] = [];
                  }
                });
                return normalized;
              })()
            : {}
        },
        cancellation_policy: normalizedCancellationPolicy,
        faqs: normalizedFaqs,
        price: (() => {
          // Try multiple sources for price
          if (primaryVehicle?.amount != null && !isNaN(primaryVehicle.amount) && parseFloat(primaryVehicle.amount) > 0) {
            return parseFloat(primaryVehicle.amount);
          }
          if (productData?.productAmount != null && !isNaN(productData.productAmount) && parseFloat(productData.productAmount) > 0) {
            return parseFloat(productData.productAmount);
          }
          if (productData?.price != null && !isNaN(productData.price) && parseFloat(productData.price) > 0) {
            return parseFloat(productData.price);
          }
          // Fallback to vehicle amount or 0
          return primaryVehicle ? Number(primaryVehicle.amount || 0) : parseFloat(productData?.price || productData?.productAmount || 0);
        })(),
        currency: primaryVehicle?.currency || 'USD',
        price_unit: primaryVehicle?.pricingType || 'Per Group',
        destination: productData?.destination || '',
        breadcrumb: normalizedBreadcrumb,
        selling_points: normalizedSellingPoints,
        style_theme: productData?.styleTheme || ''
      };

      const possiblePhotos = Array.isArray(uploadedPhotos) && uploadedPhotos.length
        ? uploadedPhotos
        : Array.isArray(productData?.uploadedPhotos)
          ? productData.uploadedPhotos
          : [];

      const photoSources = possiblePhotos
        .map((photo) => {
          if (!photo) return null;
          if (typeof photo === 'string') return photo;
          if (photo.url) return photo.url;
          return null;
        })
        .filter(Boolean);

      // For drafts, skip heavy image compression to speed up saving
      // Just use the images as-is (compression happens on publish)
      const imageUrls = photoSources.length > 0 ? photoSources.slice(0, MAX_IMAGE_COUNT) : [];

      const heroCandidates = [
        coverImage?.url,
        typeof coverImage === 'string' ? coverImage : null,
        productData?.coverImage?.url,
        productData?.coverImage,
        imageUrls[0],
      ].filter(Boolean);

      // For drafts, use first candidate without compression to speed up
      let heroUrl = heroCandidates.length > 0 ? heroCandidates[0] : null;

      if (!heroUrl && imageUrls.length > 0) {
        heroUrl = imageUrls[0];
      }

      const dedupedImages = dedupeStrings(heroUrl ? [heroUrl, ...imageUrls] : imageUrls);
      const galleryImages = dedupedImages.filter((url) => url !== heroUrl);

      apiProductData.images = dedupedImages;
      apiProductData.hero_image = heroUrl || null;
      apiProductData.gallery_images = galleryImages;
      apiProductData.custom_fields = buildCustomFieldsPayload({
        existingVehicles,
        selectedVehicleForTour,
        existingVehicleAllocations,
        productData,
        heroUrl,
        galleryImages,
        availableDays: normalizedAvailableDays,
      });

      // Validate title length (minimum 30 chars for database)
      if (!apiProductData.title || apiProductData.title.length < 30) {
        throw new Error('Title must be at least 30 characters to save as draft');
      }
      if (!Number.isFinite(apiProductData.price) || apiProductData.price <= 0) {
        throw new Error('Price must be greater than 0 to save as draft');
      }
      
      const existingProductIdRaw = productData?.dbProductId || productData?.draftId || productData?.id;
      const existingProductId = existingProductIdRaw && existingProductIdRaw !== 'current_draft'
        ? existingProductIdRaw
        : null;

      let dbProductId = existingProductId;

      if (existingProductId) {
        console.log('♻️ Updating existing product draft:', existingProductId);
        await productService.updateProduct(existingProductId, apiProductData);
        await productService.saveAsDraft(existingProductId);
        console.log('✅ Existing product updated & saved as draft:', existingProductId);
      } else {
        const createdProduct = await productService.createProduct(apiProductData);
        dbProductId = createdProduct.id;
        console.log('✅ Draft product created in database with ID:', dbProductId);
        await productService.saveAsDraft(dbProductId);
        console.log('✅ Draft saved successfully!');
      }

      if (!dbProductId) {
        throw new Error('Draft save failed: missing product ID after persistence.');
      }
      
      // Save images to localStorage for later use
      const fullDraftData = {
        draftId: dbProductId,
        dbProductId: dbProductId,
        productTitle: productData?.title || 'Untitled Product',
        productCategory: productData?.category || '',
        sellingPoints: productData?.sellingPoints || '',
        tagline: productData?.tagline || '',
        description: productData?.description || '',
        highlights: productData?.highlights || [],
        coverImage: heroUrl || null,
        uploadedPhotos: galleryImages,
        selectedGuideType: productData?.guideType || '',
        selectedActivityType: productData?.activityType || '',
        selectedLanguages: productData?.languages || [],
        selectedThingsToCarry: productData?.thingsToCarry || [],
        includedItems: productData?.includedItems || '',
        excludedItems: productData?.excludedItems || '',
        accessibilityToggles: productData?.accessibility || {},
        vehicles: existingVehicles,
        selectedVehicleForTour,
        selectedPickupLocations: productData?.pickupLocations || [],
        selectedDropoffLocations: productData?.dropoffLocations || [],
        pickupTime: (() => {
          // Priority 1: First vehicle-time allocation time
          if (Array.isArray(productData?.vehicleTimeAllocations) && productData.vehicleTimeAllocations.length > 0) {
            const firstAllocation = productData.vehicleTimeAllocations[0];
            if (firstAllocation?.time || firstAllocation?.pickup_time) {
              return firstAllocation.time || firstAllocation.pickup_time || '';
            }
          }
          // Priority 2: Legacy pickupTime field
          return productData?.pickupTime || '';
        })(),
        selectedWeekDay: productData?.weekDay || '',
        selectedDate: productData?.selectedDate || '',
        itineraries: productData?.itineraries || [],
        faqs: productData?.faqs || [],
        cancellationPolicy: productData?.cancellationPolicy || buildEmptyCancellationPolicy(),
        vehicleTimeAllocations: existingVehicleAllocations,
        lastModified: new Date().toISOString()
      };
      
      // Save full draft data with images to localStorage
      const storageDraftId = String(dbProductId);
      localStorage.setItem(`product_draft_${storageDraftId}`, JSON.stringify(fullDraftData));
      console.log('💾 Full draft data with images saved to localStorage:', `product_draft_${storageDraftId}`);
      
      // Show success message
      alert('✅ Draft saved successfully!');
      
      // Navigate back or refresh
      setTimeout(() => {
        window.location.href = '/products/drafts';
      }, 500);
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      const message = error?.friendlyMessage || error?.message || 'Unable to save draft.';
      alert(`Error saving draft: ${message}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublishProduct = async () => {
    if (isPublishing || isSavingDraft) {
      console.log('⏳ Already processing, please wait...');
      return;
    }
    
    setIsPublishing(true);
    
    // Debug: Log what we have at the start
    console.log('🚀 Publishing product - Initial state:', {
      hasCoverImageProp: !!coverImage,
      coverImageType: coverImage ? typeof coverImage : 'null',
      coverImageUrl: coverImage?.url ? 'exists' : 'none',
      hasUploadedPhotosProp: !!uploadedPhotos,
      uploadedPhotosCount: uploadedPhotos?.length || 0,
      hasProductDataCoverImage: !!productData?.coverImage,
      hasProductDataUploadedPhotos: !!productData?.uploadedPhotos,
      productDataUploadedPhotosCount: productData?.uploadedPhotos?.length || 0
    });
    
    try {
      // Check if there's an existing draft in database with the same title
      // (We'll handle this by checking if we're updating an existing draft)
      // Normalize title (support both title and productTitle)
      const publishTitle = (productData?.title || productData?.productTitle || '').trim();

      // Build image URLs from either prop `uploadedPhotos` or draft data
      const rawPhotos = Array.isArray(uploadedPhotos) && uploadedPhotos.length
        ? uploadedPhotos
        : (Array.isArray(productData?.uploadedPhotos) ? productData.uploadedPhotos : []);

      const photoSources = rawPhotos
        .map((photo) => {
          if (!photo) return null;
          if (typeof photo === 'string') return photo;
          if (photo.url) return photo.url;
          return null;
        })
        .filter(Boolean);

      const imageUrls = await buildImagePayload(photoSources);

      const heroCandidates = [
        coverImage?.url,
        typeof coverImage === 'string' ? coverImage : null,
        productData?.coverImage?.url,
        productData?.coverImage,
        imageUrls[0],
      ].filter(Boolean);

      let heroUrl = null;
      for (const candidate of heroCandidates) {
        const processed = await normaliseImageSource(candidate);
        if (processed) {
          heroUrl = processed;
          break;
        }
      }

      if (!heroUrl && imageUrls.length > 0) {
        heroUrl = imageUrls[0];
      }

      const dedupedImages = dedupeStrings(heroUrl ? [heroUrl, ...imageUrls] : imageUrls);
      const galleryImages = dedupedImages.filter((url) => url !== heroUrl);

      // Normalize accessibility to backend schema keys
      const acc = productData?.accessibility || productData?.accessibilityToggles || {};
      const accessibilityNormalized = {
        wheelchair_accessible: !!(acc.wheelchair || acc.wheelchair_accessible),
        service_animals_allowed: !!(acc.serviceAnimals || acc.service_animals_allowed),
        infant_seat_available: !!(acc.infantSeat || acc.infant_seat_available),
        stroller_friendly: !!(acc.stroller || acc.stroller_friendly)
      };

      // Normalize available days
      const wd = productData?.weekDay;
      let availableDays = [];
      if (Array.isArray(wd)) {
        availableDays = wd;
      } else if (typeof wd === 'string' && wd.trim()) {
        const low = wd.trim().toLowerCase();
        if (low === 'week days' || low === 'weekdays') {
          availableDays = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
        } else if (low === 'weekend' || low === 'week end') {
          availableDays = ['Saturday','Sunday'];
        } else {
          availableDays = [wd];
        }
      }

      const existingVehicles = Array.isArray(productData?.vehicles) ? productData.vehicles : [];
      const selectedVehicleForTour = productData?.selectedVehicleForTour
        ? (Array.isArray(productData.selectedVehicleForTour)
            ? productData.selectedVehicleForTour[0]
            : productData.selectedVehicleForTour)
        : existingVehicles[0] || null;
      const existingVehicleAllocations = Array.isArray(productData?.vehicleTimeAllocations)
        ? productData.vehicleTimeAllocations
        : [];
      const primaryVehicle = selectedVehicleForTour || existingVehicles[0] || null;

      // Helper to map photo objects/strings to URL strings
      const normalizedFaqs = Array.isArray(productData?.faqs)
        ? productData.faqs
            .filter(faq => faq?.question?.trim() && faq?.answer?.trim())
            .map(faq => ({
              question: faq.question.trim(),
              answer: faq.answer.trim()
            }))
        : [];
      const normalizedCancellationPolicy = productData?.cancellationPolicy && Array.isArray(productData.cancellationPolicy.schedule)
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
        : null;

      // Prepare product data for API (matching ProductCreate schema)
      // CRITICAL DEBUG: Log productData before building apiProductData
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [PUBLISH] productData received:', {
          hasVehicleTimeAllocations: Array.isArray(productData?.vehicleTimeAllocations),
          vehicleTimeAllocationsCount: Array.isArray(productData?.vehicleTimeAllocations) 
            ? productData.vehicleTimeAllocations.length 
            : 0,
          vehicleTimeAllocations: productData?.vehicleTimeAllocations,
          hasVehicles: Array.isArray(productData?.vehicles),
          vehiclesCount: Array.isArray(productData?.vehicles) ? productData.vehicles.length : 0,
          productDataKeys: productData ? Object.keys(productData) : []
        })
      }
      
      const apiProductData = {
        title: publishTitle || 'Untitled Product',
        // Category is now a free-form string field in the backend, so we can send
        // the supplier's exact value (e.g. "Tour", "Hotel", "Rent a Car", or custom).
        category: (productData?.category || 'tour').toString().trim(),
        tagline: productData?.tagline || '',
        description: (productData?.description || '').toString(),
        highlights: Array.isArray(productData?.bHighlights || productData?.highlights)
          ? (productData?.highlights || []).map(h => ({
              icon: (h && h.icon) ? h.icon : 'mountain',
              text: (h && h.text) ? h.text : ''
            }))
          : [],
        images: dedupedImages,
        hero_image: heroUrl || null,
        gallery_images: galleryImages,
        itinerary: mapItineraryEntriesForApi(productData?.itineraries),
        total_tour_days: productData?.totalTourDays || '1',
        day_durations: productData?.dayDurations || {},
        duration: productData?.duration || '',
        guide_type: productData?.guideType || '',
        activity_type: productData?.activityType || '',
        languages: Array.isArray(productData?.languages) ? productData.languages : [],
        things_to_carry: Array.isArray(productData?.thingsToCarry) ? productData.thingsToCarry : [],
        included_excluded: {
          included: Array.isArray(productData?.includedItems) ? productData.includedItems : (productData?.includedItems ? [productData.includedItems] : []),
          excluded: Array.isArray(productData?.excludedItems) ? productData.excludedItems : (productData?.excludedItems ? [productData?.excludedItems] : [])
        },
        accessibility: accessibilityNormalized,
        vehicle_details: Array.isArray(productData?.vehicles) && productData.vehicles.length ? {
          vehicle_type: productData.vehicles[0]?.type || 'car',
          vehicle_model: productData.vehicles[0]?.model || '',
          capacity: productData.vehicles[0]?.capacity ?? null
        } : null,
        pickup_dropoff: {
          // Legacy fields for backward compatibility
          pickup_location: (productData?.pickupLocations && productData.pickupLocations[0]) ? String(productData.pickupLocations[0]) : '',
          dropoff_location: (productData?.dropoffLocations && productData.dropoffLocations[0]) ? String(productData.dropoffLocations[0]) : '',
          pickup_time: (() => {
            // Priority 1: First vehicle-time allocation time
            if (Array.isArray(productData?.vehicleTimeAllocations) && productData.vehicleTimeAllocations.length > 0) {
              const firstAllocation = productData.vehicleTimeAllocations[0];
              if (firstAllocation?.time || firstAllocation?.pickup_time) {
                let timeStr = (firstAllocation.time || firstAllocation.pickup_time || '').toString();
                // Ensure time is in HH:MM format
                if (timeStr && timeStr.includes(':')) {
                  const timeParts = timeStr.split(':');
                  if (timeParts.length >= 2) {
                    const hours = String(timeParts[0] || '00').padStart(2, '0');
                    const minutes = String(timeParts[1] || '00').padStart(2, '0');
                    return `${hours}:${minutes}`;
                  }
                }
                return timeStr;
              }
            }
            // Priority 2: Legacy pickupTime field
            const timeStr = (productData?.pickupTime || '').toString();
            if (timeStr && timeStr.includes(':')) {
              const timeParts = timeStr.split(':');
              if (timeParts.length >= 2) {
                const hours = String(timeParts[0] || '00').padStart(2, '0');
                const minutes = String(timeParts[1] || '00').padStart(2, '0');
                return `${hours}:${minutes}`;
              }
            }
            return timeStr;
          })(),
          available_days: availableDays,
          available_time_slots: productData?.timeSlots
            ? Object.values(productData.timeSlots).flat().filter(Boolean)
            : [],
          
          // New enhanced fields - vehicle-based pickup configurations
          pickup_locations: Array.isArray(productData?.pickupLocations) ? productData.pickupLocations : [],
          dropoff_locations: Array.isArray(productData?.dropoffLocations) ? productData.dropoffLocations : [],
          
          // Pickup configurations: location + vehicle + time + date (vehicle-based)
          pickup_configurations: Array.isArray(productData?.vehicleTimeAllocations) && productData.vehicleTimeAllocations.length > 0
            ? productData.vehicleTimeAllocations.map(allocation => {
                // Format pickup time as HH:MM
                let formattedTime = allocation.time || allocation.pickup_time || '';
                if (formattedTime) {
                  const timeParts = formattedTime.split(':');
                  if (timeParts.length >= 2) {
                    const hours = String(timeParts[0] || '00').padStart(2, '0');
                    const minutes = String(timeParts[1] || '00').padStart(2, '0');
                    formattedTime = `${hours}:${minutes}`;
                  }
                }
                
                // Extract pickup locations - can be array or comma-separated string
                let pickupLocationStr = '';
                if (Array.isArray(allocation.pickupLocations) && allocation.pickupLocations.length > 0) {
                  pickupLocationStr = allocation.pickupLocations.join(', ');
                } else if (allocation.pickupLocation) {
                  pickupLocationStr = allocation.pickupLocation;
                } else if (allocation.pickup_location) {
                  pickupLocationStr = allocation.pickup_location;
                }
                
                // Extract dropoff locations - use dropoff locations if provided, otherwise use pickup locations (same location)
                let dropoffLocationStr = null;
                const dropoffLocationsForConfig = Array.isArray(allocation.dropoffLocations) && allocation.dropoffLocations.length > 0
                  ? allocation.dropoffLocations
                  : (Array.isArray(allocation.pickupLocations) && allocation.pickupLocations.length > 0
                    ? allocation.pickupLocations
                    : []);
                
                if (dropoffLocationsForConfig.length > 0) {
                  dropoffLocationStr = dropoffLocationsForConfig.join(', ');
                  // Only set dropoff_location if it's different from pickup (otherwise null = same location)
                  if (dropoffLocationStr === pickupLocationStr) {
                    dropoffLocationStr = null;
                  }
                }
                
                return {
                  pickup_location: pickupLocationStr,
                  dropoff_location: dropoffLocationStr,  // null if same as pickup (will be shown as same location in UI)
                  vehicle_id: allocation.vehicle?.id || allocation.vehicle_id || null,
                  vehicle: allocation.vehicle || null,
                  pickup_time: formattedTime,
                  pickup_date: allocation.date || allocation.pickup_date || null,
                  pickup_datetime: allocation.datetime || allocation.pickup_datetime || null
                };
              })
            : [],
          
          // Time slot configuration settings
          time_slot_configuration: {
            start_time: productData?.startTime || null,
            end_time: productData?.endTime || null,
            duration: productData?.duration ? parseInt(productData.duration) : null,
            apply_to_all_days: productData?.applyToAllDays || false
          },
          
          // Time slots organized by day - normalize time format to HH:MM
          time_slots_by_day: productData?.timeSlots && typeof productData.timeSlots === 'object'
            ? (() => {
                const normalized = {};
                Object.keys(productData.timeSlots).forEach(day => {
                  const slots = productData.timeSlots[day];
                  if (Array.isArray(slots)) {
                    normalized[day] = slots.map(slot => {
                      if (typeof slot === 'string') {
                        const cleaned = slot.replace(/\s+/g, '').trim();
                        const parts = cleaned.split(':');
                        if (parts.length >= 2) {
                          const hours = String(parts[0] || '00').padStart(2, '0');
                          const minutes = String(parts[1] || '00').padStart(2, '0');
                          return `${hours}:${minutes}`;
                        }
                        return cleaned;
                      }
                      return slot;
                    }).filter(Boolean);
                  } else {
                    normalized[day] = [];
                  }
                });
                return normalized;
              })()
            : {}
        },
        cancellation_policy: normalizedCancellationPolicy,
        faqs: normalizedFaqs,
        price: (() => {
          // Try multiple sources for price, prioritizing valid numbers > 0
          const vehicleAmount = productData?.vehicles?.[0]?.amount;
          const directPrice = productData?.price;
          const productAmount = productData?.productAmount; // From CreateProductComponent
          
          console.log('🔍 Price extraction debug:', {
            vehicleAmount,
            directPrice,
            productAmount,
            vehicles: productData?.vehicles,
            productDataKeys: Object.keys(productData || {})
          });
          
          // Check vehicle amount first if it's a valid positive number
          if (vehicleAmount != null && vehicleAmount !== '' && !isNaN(vehicleAmount) && parseFloat(vehicleAmount) > 0) {
            const parsed = parseFloat(vehicleAmount);
            console.log('✅ Using vehicle amount:', parsed);
            return parsed;
          }
          
          // Check productAmount (from CreateProductComponent form)
          if (productAmount != null && productAmount !== '' && !isNaN(productAmount) && parseFloat(productAmount) > 0) {
            const parsed = parseFloat(productAmount);
            console.log('✅ Using productAmount:', parsed);
            return parsed;
          }
          
          // Fall back to direct price if it's a valid positive number
          if (directPrice != null && directPrice !== '' && !isNaN(directPrice) && parseFloat(directPrice) > 0) {
            const parsed = parseFloat(directPrice);
            console.log('✅ Using direct price:', parsed);
            return parsed;
          }
          
          // Try vehicle amount even if 0 (might be valid)
          if (vehicleAmount != null && vehicleAmount !== '' && !isNaN(vehicleAmount)) {
            const parsed = parseFloat(vehicleAmount);
            console.log('⚠️ Using vehicle amount (may be 0):', parsed);
            return parsed;
          }
          
          // Try productAmount even if 0
          if (productAmount != null && productAmount !== '' && !isNaN(productAmount)) {
            const parsed = parseFloat(productAmount);
            console.log('⚠️ Using productAmount (may be 0):', parsed);
            return parsed;
          }
          
          // Try direct price even if 0
          if (directPrice != null && directPrice !== '' && !isNaN(directPrice)) {
            const parsed = parseFloat(directPrice);
            console.log('⚠️ Using direct price (may be 0):', parsed);
            return parsed;
          }
          
          // Default to 0
          console.warn('❌ No valid price found, defaulting to 0');
          return 0;
        })(),
        currency: productData?.vehicles?.[0]?.currency || productData?.currency || 'USD',
        price_unit: productData?.vehicles?.[0]?.pricingType || productData?.pricingType || 'Per Group',
        destination: (productData?.destination || '').toString(),
        breadcrumb: Array.isArray(productData?.breadcrumb) ? productData.breadcrumb : [],
        selling_points: Array.isArray(productData?.sellingPoints) ? productData.sellingPoints : (productData?.sellingPoints ? [productData.sellingPoints] : []),
        style_theme: productData?.styleTheme || ''
      };

      apiProductData.custom_fields = buildCustomFieldsPayload({
        existingVehicles,
        selectedVehicleForTour,
        existingVehicleAllocations,
        productData,
        heroUrl,
        galleryImages,
        availableDays,
      });

      // Debug: Log pickup_dropoff structure before sending to API
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 [PUBLISH] About to send product to API with pickup_dropoff:', {
          hasPickupDropoff: !!apiProductData.pickup_dropoff,
          pickupDropoffKeys: apiProductData.pickup_dropoff ? Object.keys(apiProductData.pickup_dropoff) : [],
          hasPickupConfigs: !!(apiProductData.pickup_dropoff?.pickup_configurations),
          pickupConfigsCount: Array.isArray(apiProductData.pickup_dropoff?.pickup_configurations) 
            ? apiProductData.pickup_dropoff.pickup_configurations.length 
            : 0,
          pickupConfigs: apiProductData.pickup_dropoff?.pickup_configurations,
          fullPickupDropoff: apiProductData.pickup_dropoff,
          sourceVehicleTimeAllocations: productData?.vehicleTimeAllocations,
          sourceVehicles: productData?.vehicles,
          // Detailed breakdown of pickup_configurations
          pickupConfigsDetails: Array.isArray(apiProductData.pickup_dropoff?.pickup_configurations)
            ? apiProductData.pickup_dropoff.pickup_configurations.map((config, idx) => ({
                index: idx,
                pickup_location: config.pickup_location,
                vehicle_id: config.vehicle_id,
                vehicle: config.vehicle,
                pickup_time: config.pickup_time,
                pickup_date: config.pickup_date
              }))
            : []
        })
        
        // Also log the full pickup_dropoff as JSON to see exact structure
        if (apiProductData.pickup_dropoff) {
          console.log('📤 [PUBLISH] pickup_dropoff JSON:', JSON.stringify(apiProductData.pickup_dropoff, null, 2))
        }
        
        // Warn if pickup_configurations is empty
        if (!Array.isArray(apiProductData.pickup_dropoff?.pickup_configurations) || 
            apiProductData.pickup_dropoff.pickup_configurations.length === 0) {
          console.error('❌ [PUBLISH] WARNING: pickup_configurations is EMPTY or MISSING!', {
            hasPickupDropoff: !!apiProductData.pickup_dropoff,
            pickupDropoffKeys: apiProductData.pickup_dropoff ? Object.keys(apiProductData.pickup_dropoff) : [],
            sourceVehicleTimeAllocationsCount: Array.isArray(productData?.vehicleTimeAllocations) 
              ? productData.vehicleTimeAllocations.length 
              : 0
          })
        }
      }
      console.log('apiProductData ->', apiProductData);

      // Save to database (required - no localStorage fallback)
      // Validate title length (backend requires min 30 chars)
      if (!apiProductData.title || apiProductData.title.length < 30) {
        console.warn('apiProductData invalid title length', apiProductData.title);
        throw new Error(`Title must be at least 30 characters (got ${apiProductData.title?.length || 0})`);
      }
      if (!Number.isFinite(apiProductData.price) || apiProductData.price <= 0) {
        console.error('❌ Price validation failed:', {
          price: apiProductData.price,
          vehicleAmount: productData?.vehicles?.[0]?.amount,
          directPrice: productData?.price,
          productAmount: productData?.productAmount,
          vehicles: productData?.vehicles,
          productDataKeys: Object.keys(productData || {})
        });
        throw new Error(`Price must be greater than 0 before publishing. Found: ${apiProductData.price}. Please check that the price is set in the vehicle details or product price field.`);
      }

      const existingProductIdRaw = productData?.dbProductId || productData?.draftId || productData?.id;
      const existingProductId = existingProductIdRaw && existingProductIdRaw !== 'current_draft'
        ? existingProductIdRaw
        : null;

      let dbProductId = existingProductId;

      // Store publish debug info in localStorage BEFORE API calls (so it persists after redirect)
      const publishDebugInfo = {
        timestamp: new Date().toISOString(),
        productId: existingProductId || 'new',
        pickupDropoff: apiProductData.pickup_dropoff,
        pickupConfigurationsCount: Array.isArray(apiProductData.pickup_dropoff?.pickup_configurations) 
          ? apiProductData.pickup_dropoff.pickup_configurations.length 
          : 0,
        pickupConfigurations: apiProductData.pickup_dropoff?.pickup_configurations || [],
        sourceVehicleTimeAllocations: productData?.vehicleTimeAllocations || [],
        sourceVehicleTimeAllocationsCount: Array.isArray(productData?.vehicleTimeAllocations) 
          ? productData.vehicleTimeAllocations.length 
          : 0,
        apiProductDataKeys: Object.keys(apiProductData),
        pickupDropoffKeys: apiProductData.pickup_dropoff ? Object.keys(apiProductData.pickup_dropoff) : []
      };
      
      // Store in localStorage with timestamp so we can check later
      try {
        localStorage.setItem('last_publish_debug', JSON.stringify(publishDebugInfo));
        console.log('💾 [PUBLISH] Debug info saved to localStorage as "last_publish_debug"');
      } catch (e) {
        console.warn('⚠️ Could not save debug info to localStorage:', e);
      }
      
      // Log to console with ERROR level so it's more visible
      console.error('📤 [PUBLISH] ========== PUBLISH DEBUG INFO ==========');
      console.error('📤 [PUBLISH] Product ID:', existingProductId || 'new');
      console.error('📤 [PUBLISH] pickup_configurations count:', publishDebugInfo.pickupConfigurationsCount);
      console.error('📤 [PUBLISH] pickup_configurations:', publishDebugInfo.pickupConfigurations);
      console.error('📤 [PUBLISH] Source vehicleTimeAllocations count:', publishDebugInfo.sourceVehicleTimeAllocationsCount);
      console.error('📤 [PUBLISH] Full pickup_dropoff:', JSON.stringify(publishDebugInfo.pickupDropoff, null, 2));
      console.error('📤 [PUBLISH] ==========================================');
      console.error('💾 [PUBLISH] Check localStorage.getItem("last_publish_debug") to see this data after page reload');

      if (existingProductId) {
        console.log('♻️ Updating existing product before publish:', existingProductId);
        const updatedProduct = await productService.updateProduct(existingProductId, apiProductData);
        
        // Log response to see what was actually saved
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [PUBLISH] Update response:', {
            id: updatedProduct?.id,
            pickup_dropoff: updatedProduct?.pickup_dropoff,
            pickupConfigurationsInResponse: updatedProduct?.pickup_dropoff?.pickup_configurations,
            pickupConfigurationsCount: Array.isArray(updatedProduct?.pickup_dropoff?.pickup_configurations)
              ? updatedProduct.pickup_dropoff.pickup_configurations.length
              : 0
          });
          
          // Store response in localStorage too - with full details
          try {
            const responseDebug = {
              timestamp: new Date().toISOString(),
              action: 'update',
              productId: existingProductId,
              response: {
                pickup_dropoff: updatedProduct?.pickup_dropoff,
                pickupConfigurations: updatedProduct?.pickup_dropoff?.pickup_configurations,
                pickupConfigurationsCount: Array.isArray(updatedProduct?.pickup_dropoff?.pickup_configurations)
                  ? updatedProduct.pickup_dropoff.pickup_configurations.length
                  : 0,
                pickupDropoffKeys: updatedProduct?.pickup_dropoff ? Object.keys(updatedProduct.pickup_dropoff) : [],
                fullResponse: updatedProduct // Store full response for debugging
              }
            };
            localStorage.setItem('last_publish_response', JSON.stringify(responseDebug));
            console.log('✅ [PUBLISH] Stored update response to localStorage:', {
              pickupConfigurationsCount: responseDebug.response.pickupConfigurationsCount,
              pickupDropoffKeys: responseDebug.response.pickupDropoffKeys
            });
          } catch (e) {
            console.warn('⚠️ Could not save response to localStorage:', e);
          }
        }
      } else {
        const createdProduct = await productService.createProduct(apiProductData);
        dbProductId = createdProduct.id;
        console.log('✅ Product saved to database with ID:', dbProductId);
        
        // Log response to see what was actually saved
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [PUBLISH] Create response:', {
            id: createdProduct?.id,
            pickup_dropoff: createdProduct?.pickup_dropoff,
            pickupConfigurationsInResponse: createdProduct?.pickup_dropoff?.pickup_configurations,
            pickupConfigurationsCount: Array.isArray(createdProduct?.pickup_dropoff?.pickup_configurations)
              ? createdProduct.pickup_dropoff.pickup_configurations.length
              : 0
          });
          
          // Store response in localStorage too - with full details
          try {
            const responseDebug = {
              timestamp: new Date().toISOString(),
              action: 'create',
              productId: dbProductId,
              response: {
                pickup_dropoff: createdProduct?.pickup_dropoff,
                pickupConfigurations: createdProduct?.pickup_dropoff?.pickup_configurations,
                pickupConfigurationsCount: Array.isArray(createdProduct?.pickup_dropoff?.pickup_configurations)
                  ? createdProduct.pickup_dropoff.pickup_configurations.length
                  : 0,
                pickupDropoffKeys: createdProduct?.pickup_dropoff ? Object.keys(createdProduct.pickup_dropoff) : [],
                fullResponse: createdProduct // Store full response for debugging
              }
            };
            localStorage.setItem('last_publish_response', JSON.stringify(responseDebug));
            console.log('✅ [PUBLISH] Stored create response to localStorage:', {
              pickupConfigurationsCount: responseDebug.response.pickupConfigurationsCount,
              pickupDropoffKeys: responseDebug.response.pickupDropoffKeys
            });
          } catch (e) {
            console.warn('⚠️ Could not save response to localStorage:', e);
          }
        }
      }

      if (!dbProductId) {
        throw new Error('Publish failed: missing product ID after save.');
      }

      await productService.publishProduct(dbProductId);
      console.log('✅ Product published in database');

      // Also persist full published data for cloning later - INCLUDING IMAGES
      // Save images to localStorage (will sync to backend cache which can handle large data)
      // For localStorage, save image references to avoid quota issues
      let savedCoverImage = null;
      
      // PRIORITY 1: Use coverImage prop (from component state)
      if (coverImage) {
        // coverImage is an object with {id, url, file, name} structure
        // Save only the URL (base64 string) to avoid localStorage quota issues
        if (typeof coverImage === 'object' && coverImage.url) {
          savedCoverImage = coverImage.url; // Save only the URL string (base64)
          console.log('📸 Using coverImage prop (object with url)');
        } else if (typeof coverImage === 'string') {
          savedCoverImage = coverImage; // Already a string (base64)
          console.log('📸 Using coverImage prop (string)');
        }
      } 
      // PRIORITY 2: Use productData.coverImage (from draft data)
      else if (productData?.coverImage) {
        if (typeof productData.coverImage === 'object' && productData.coverImage.url) {
          savedCoverImage = productData.coverImage.url;
          console.log('📸 Using productData.coverImage (object with url)');
        } else if (typeof productData.coverImage === 'string') {
          savedCoverImage = productData.coverImage;
          console.log('📸 Using productData.coverImage (string)');
        }
      }
      
      // Save uploadedPhotos URLs only (extract base64 strings)
      let savedUploadedPhotos = [];
      const photosToProcess = uploadedPhotos || productData?.uploadedPhotos || [];
      if (photosToProcess.length > 0) {
        savedUploadedPhotos = photosToProcess.map(photo => {
          if (typeof photo === 'string') {
            return photo; // Already a string
          } else if (photo && typeof photo === 'object' && photo.url) {
            return photo.url; // Extract URL from object
          }
          return photo;
        }).filter(Boolean); // Remove any null/undefined values
      }

      // Fallback: if no explicit cover set, use first uploaded photo as cover
      if (!savedCoverImage && savedUploadedPhotos.length > 0) {
        savedCoverImage = savedUploadedPhotos[0];
        console.log('📸 Fallback coverImage from first uploaded photo');
      }
      
      console.log('📸 Saving coverImage:', {
        hasCoverImageProp: !!coverImage,
        hasProductDataCoverImage: !!productData?.coverImage,
        savedCoverImage: !!savedCoverImage,
        savedCoverImageType: savedCoverImage ? typeof savedCoverImage : 'null',
        savedCoverImagePreview: savedCoverImage ? savedCoverImage.substring(0, 50) + '...' : 'none',
        photosCount: savedUploadedPhotos.length,
        photosSource: uploadedPhotos ? 'uploadedPhotos prop' : (productData?.uploadedPhotos ? 'productData' : 'none')
      });
      
      const fullPublishedData = {
        draftId: dbProductId,
        dbProductId: dbProductId, // Store database ID
        productTitle: publishTitle || 'Untitled Product',
        productCategory: productData?.category || '',
        sellingPoints: productData?.sellingPoints || '',
        tagline: productData?.tagline || '',
        description: productData?.description || '',
        highlights: productData?.highlights || [],
        // INCLUDE IMAGES - Save as strings (base64 URLs) to reduce localStorage size
        coverImage: savedCoverImage, // String (base64 URL)
        uploadedPhotos: savedUploadedPhotos, // Array of strings (base64 URLs)
        selectedGuideType: productData?.guideType || '',
        selectedActivityType: productData?.activityType || '',
        selectedLanguages: productData?.languages || [],
        selectedThingsToCarry: productData?.thingsToCarry || [],
        includedItems: productData?.includedItems || '',
        excludedItems: productData?.excludedItems || '',
        accessibilityToggles: productData?.accessibility || {},
        vehicles: Array.isArray(productData?.vehicles) ? productData.vehicles : [],
        selectedVehicleForTour: Array.isArray(productData?.vehicles) ? productData.vehicles : [],
        vehicleTimeAllocations: Array.isArray(productData?.vehicleTimeAllocations) ? productData.vehicleTimeAllocations : [],
        timeSlots: productData?.timeSlots || {},
        selectedPickupLocations: productData?.pickupLocations || [],
        selectedDropoffLocations: productData?.dropoffLocations || [],
        pickupTime: (() => {
          // Priority 1: First vehicle-time allocation time
          if (Array.isArray(productData?.vehicleTimeAllocations) && productData.vehicleTimeAllocations.length > 0) {
            const firstAllocation = productData.vehicleTimeAllocations[0];
            if (firstAllocation?.time || firstAllocation?.pickup_time) {
              return firstAllocation.time || firstAllocation.pickup_time || '';
            }
          }
          // Priority 2: Legacy pickupTime field
          return productData?.pickupTime || '';
        })(),
        selectedWeekDay: productData?.weekDay || '',
        selectedDate: productData?.selectedDate || '',
        itineraries: productData?.itineraries || [],
        destination: productData?.destination || '',
        duration: productData?.duration || '',
        lastModified: new Date().toISOString()
      };
      // Try to save to localStorage, but if it fails due to quota, save to backend cache only
      try {
      const storageProductId = String(dbProductId);
      localStorage.setItem(`product_full_${storageProductId}`, JSON.stringify(fullPublishedData));
        console.log('💾 Full published data saved to localStorage:', `product_full_${storageProductId}`);
        console.log('📸 CoverImage in localStorage:', {
          hasCoverImage: !!fullPublishedData.coverImage,
          coverImageType: fullPublishedData.coverImage ? typeof fullPublishedData.coverImage : 'null',
          coverImagePreview: fullPublishedData.coverImage ? fullPublishedData.coverImage.substring(0, 50) + '...' : 'none'
        });
      } catch (storageError) {
        if (storageError.name === 'QuotaExceededError') {
          console.warn('⚠️ localStorage quota exceeded, saving to backend cache only');
          // Don't throw - we'll sync to backend cache which can handle large data
          // But make sure we still have the data for backend sync
          fullPublishedData.coverImage = savedCoverImage; // Ensure coverImage is in the data
          fullPublishedData.uploadedPhotos = savedUploadedPhotos; // Ensure uploadedPhotos are in the data
        } else {
          throw storageError; // Re-throw other errors
        }
      }
      
      // Save images to localStorage for later use (images are still stored locally)
      // Note: Products are now in database, images remain in localStorage temporarily
      console.log('✅ Product published and saved to database');
      console.log('📸 Images saved to localStorage for later migration');
      
      // Clear draft data after publishing
      localStorage.removeItem('product_draft_current_draft');
      
    // Close publish modal and show success modal
    setShowPublishModal(false);
    setShowSuccessModal(true);
      
      // Before redirect, log final message with instructions to check localStorage
      console.error('📋 [PUBLISH] ========== PUBLISH COMPLETE ==========');
      console.error('📋 [PUBLISH] Page will redirect in 2 seconds...');
      console.error('📋 [PUBLISH] To view publish debug data, run in console:');
      console.error('📋 [PUBLISH]   JSON.parse(localStorage.getItem("last_publish_debug"))');
      console.error('📋 [PUBLISH]   JSON.parse(localStorage.getItem("last_publish_response"))');
      console.error('📋 [PUBLISH] =======================================');
      
      // Force reload after 2 seconds to show the new product
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('❌ Error publishing product:', error);
      const message = error?.friendlyMessage || error?.message || 'Unable to publish product.';
      alert(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReturnToDashboard = () => {
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

  const handlePhotoClick = (index) => {
    setCurrentPhotoIndex(index);
    setShowPhotoModal(true);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  // Use uploaded photos if available, otherwise use default photos
  const defaultCoverImage = "/assets/WhatsApp Image 2025-10-15 at 3.49.28 PM.jpeg";

  const coverPhoto = (() => {
    if (coverImage?.url) return { src: coverImage.url, alt: coverImage.name || 'Cover image' };
    if (typeof coverImage === 'string') return { src: coverImage, alt: 'Cover image' };
    return null;
  })();

  const galleryPhotos = Array.isArray(uploadedPhotos)
    ? uploadedPhotos
        .map((photo, index) => {
          if (!photo) return null;
          if (typeof photo === 'string') return { src: photo, alt: `Gallery photo ${index + 1}` };
          if (photo.url) return { src: photo.url, alt: photo.name || `Gallery photo ${index + 1}` };
          return null;
        })
        .filter(Boolean)
    : [];

  const photos = galleryPhotos.length > 0 ? galleryPhotos : [
    { src: "/assets/Screenshot 2025-10-21 at 3.42.38 PM.png", alt: "Default view 1" },
    { src: "/assets/Screenshot 2025-10-21 at 3.44.28 PM.png", alt: "Default view 2" },
    { src: "/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png", alt: "Default view 3" }
  ];

  const mainCoverImage = coverPhoto?.src || photos[0]?.src || defaultCoverImage;

  const allPhotos = (() => {
    const combined = [];
    if (coverPhoto?.src) combined.push(coverPhoto);
    const uniqueGallery = photos.filter(photo => coverPhoto?.src ? photo.src !== coverPhoto.src : true);
    combined.push(...uniqueGallery);

    if (combined.length === 0) {
      return [
        { src: defaultCoverImage, alt: 'Default cover image' },
        { src: "/assets/Screenshot 2025-10-21 at 3.42.38 PM.png", alt: "Default view 1" },
        { src: "/assets/Screenshot 2025-10-21 at 3.44.28 PM.png", alt: "Default view 2" }
      ];
    }

    return combined;
  })();

  const hasCoverPhoto = Boolean(coverPhoto?.src);

  const openGalleryPhoto = (galleryIndex) => {
    const offset = hasCoverPhoto ? 1 : 0;
    const targetIndex = galleryIndex + offset;
    handlePhotoClick(
      targetIndex >= 0 && targetIndex < allPhotos.length ? targetIndex : offset
    );
  };

  // Get available days from productData
  const availableDays = useMemo(() => {
    // Priority 1: From pickup_dropoff.available_days
    if (Array.isArray(productData?.pickup_dropoff?.available_days) && productData.pickup_dropoff.available_days.length > 0) {
      return productData.pickup_dropoff.available_days;
    }
    // Priority 2: From productData.availableDays
    if (Array.isArray(productData?.availableDays) && productData.availableDays.length > 0) {
      return productData.availableDays;
    }
    // Priority 3: From productData.weekDay (single day)
    if (productData?.weekDay) {
      return [productData.weekDay];
    }
    // Fallback to default days
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }, [productData?.pickup_dropoff?.available_days, productData?.availableDays, productData?.weekDay]);

  // Get time slots for selected vehicle and selected day
  const timeSlotsForSelectedDay = useMemo(() => {
    // Priority 1: From pickup_dropoff.time_slots_by_day for selected day
    if (productData?.pickup_dropoff?.time_slots_by_day && typeof productData.pickup_dropoff.time_slots_by_day === 'object') {
      const slotsForDay = productData.pickup_dropoff.time_slots_by_day[selectedDay];
      if (Array.isArray(slotsForDay) && slotsForDay.length > 0) {
        // Format time slots to HH:MM if needed
        return slotsForDay.map(slot => {
          if (typeof slot === 'string') {
            // Remove spaces and ensure HH:MM format
            const cleaned = slot.replace(/\s+/g, '').trim();
            if (cleaned.includes(':')) {
              const parts = cleaned.split(':');
              if (parts.length >= 2) {
                const hours = String(parts[0] || '00').padStart(2, '0');
                const minutes = String(parts[1] || '00').padStart(2, '0');
                return `${hours}:${minutes}`;
              }
            }
            return cleaned;
          }
          return slot;
        }).filter(Boolean);
      }
    }
    // Priority 2: From productData.timeSlots for selected day
    if (productData?.timeSlots && typeof productData.timeSlots === 'object') {
      const slotsForDay = productData.timeSlots[selectedDay];
      if (Array.isArray(slotsForDay) && slotsForDay.length > 0) {
        return slotsForDay.map(slot => {
          if (typeof slot === 'string') {
            const cleaned = slot.replace(/\s+/g, '').trim();
            if (cleaned.includes(':')) {
              const parts = cleaned.split(':');
              if (parts.length >= 2) {
                const hours = String(parts[0] || '00').padStart(2, '0');
                const minutes = String(parts[1] || '00').padStart(2, '0');
                return `${hours}:${minutes}`;
              }
            }
            return cleaned;
          }
          return slot;
        }).filter(Boolean);
      }
    }
    // Fallback to default time slots
    return ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  }, [productData?.pickup_dropoff?.time_slots_by_day, productData?.timeSlots, selectedDay]);

  // Use dynamic itineraries from productData or fallback to defaults
  const defaultItineraryItems = [
    { time: '06:00', title: 'Pick-up from Tokyo hotel', description: 'Meet your professional guide and start your journey', icon: 'pickup' },
    { time: '09:00', title: 'Lake Kawaguchi visit (2 hrs)', description: 'Enjoy stunning lake views and photo opportunities', icon: 'sightseeing' },
    { time: '11:30', title: 'Chureito Pagoda sight (1.5 hrs)', description: 'Climb to the famous pagoda for panoramic views', icon: 'sightseeing' },
    { time: '14:00', title: 'Lunch break', description: 'Traditional Japanese cuisine (own expense)', icon: 'dining' },
    { time: '15:30', title: 'Mount Fuji 5th Station (2 hrs)', description: 'Get closer to Japan\'s highest mountain', icon: 'highlight' },
    { time: '18:00', title: 'Scenic drive and photo stops', description: 'Additional viewpoints and cultural insights', icon: 'travel' },
    { time: '20:30', title: 'Drop-off in Tokyo', description: 'Return to your hotel with unforgettable memories', icon: 'dropoff' }
  ];

  // Only use default items for preview display if no actual itinerary data exists
  // When republishing, we should never use default items - use empty array instead
  const hasActualItineraryData = productData?.itineraries && Array.isArray(productData.itineraries) && productData.itineraries.length > 0;
  
  // Group itineraries by day
  const totalTourDays = parseInt(productData?.totalTourDays || '1', 10) || 1;
  const dayDurations = productData?.dayDurations || {};
  
  const itineraryItemsByDay = hasActualItineraryData
    ? (() => {
        const grouped = {};
        // Initialize all days
        for (let day = 1; day <= totalTourDays; day++) {
          grouped[day] = [];
        }
        // Group itineraries by day
        productData.itineraries.forEach((itinerary, index) => {
          const day = itinerary.day || 1;
          if (!grouped[day]) {
            grouped[day] = [];
          }
          
          // Preserve photo URL - handle string URLs (http/https/data), objects with url property
          let photoUrl = null;
          if (itinerary?.photo) {
            if (typeof itinerary.photo === 'string') {
              // Preserve if it's a URL (http, https, data URL, or relative path)
              photoUrl = (itinerary.photo.startsWith('http') || itinerary.photo.startsWith('data:') || itinerary.photo.startsWith('/'))
                ? itinerary.photo
                : null;
            } else if (itinerary.photo?.url) {
              photoUrl = itinerary.photo.url;
            }
          }
          // Fallback to other photo fields if main photo field is empty
          if (!photoUrl) {
            photoUrl = itinerary?.croppedPhoto || itinerary?.photoPreview || null;
          }
          
          grouped[day].push({
            time: itinerary.time || `${String(6 + grouped[day].length * 2).padStart(2, '0')}:00`,
            title: itinerary.location || itinerary.placeName || itinerary.title || `Itinerary stop ${index + 1}`,
            description: itinerary.description || '',
            attractionType: itinerary.attractionType || 'Sightseeing & Photography',
            timeSpent: itinerary.timeSpent || '',
            isFree: itinerary.isFree !== undefined ? itinerary.isFree : true,
            ticketFare: itinerary.ticketFare || '',
            photo: photoUrl,
            icon: 'sightseeing',
            day: day
          });
        });
        return grouped;
      })()
    : {}; // Return empty object instead of default items to prevent mock data from appearing after republishing
  
  // For backward compatibility, also create a flat list
  const itineraryItems = hasActualItineraryData
    ? productData.itineraries.map((itinerary, index) => {
        // Preserve photo URL - handle string URLs (http/https/data), objects with url property
        let photoUrl = null;
        if (itinerary?.photo) {
          if (typeof itinerary.photo === 'string') {
            // Preserve if it's a URL (http, https, data URL, or relative path)
            photoUrl = (itinerary.photo.startsWith('http') || itinerary.photo.startsWith('data:') || itinerary.photo.startsWith('/'))
              ? itinerary.photo
              : null;
          } else if (itinerary.photo?.url) {
            photoUrl = itinerary.photo.url;
          }
        }
        // Fallback to other photo fields if main photo field is empty
        if (!photoUrl) {
          photoUrl = itinerary?.croppedPhoto || itinerary?.photoPreview || null;
        }
        
        return {
          time: itinerary.time || `${String(6 + index * 2).padStart(2, '0')}:00`,
          title: itinerary.location || itinerary.placeName || itinerary.title || `Itinerary stop ${index + 1}`,
          description: itinerary.description || '',
          attractionType: itinerary.attractionType || 'Sightseeing & Photography',
          timeSpent: itinerary.timeSpent || '',
          isFree: itinerary.isFree !== undefined ? itinerary.isFree : true,
          ticketFare: itinerary.ticketFare || '',
          photo: photoUrl,
          icon: 'sightseeing',
          day: itinerary.day || 1
        };
      })
    : []; // Return empty array instead of default items to prevent mock data from appearing after republishing

  // Use dynamic highlights from productData or fallback to defaults
  const defaultHighlights = [
    { icon: 'mountain', text: 'Experience breathtaking alpine scenery and glacier views' },
    { icon: 'camera', text: 'Capture panoramic vistas from hidden vantage points' },
    { icon: 'car', text: 'Comfortable private transport tailored to your group' },
    { icon: 'guide', text: 'Expert local guide sharing culture, stories, and history' }
  ];
  
  const highlights = productData?.highlights && productData.highlights.length > 0
    ? productData.highlights.map((h, index) => ({
        icon: ['mountain', 'camera', 'car', 'guide'][index % 4],
        text: h.text
      }))
    : defaultHighlights;

  const includedItems = [
    'Private Mercedes-Benz A-Class vehicle',
    'Professional multilingual guide',
    'All entry tickets and fees',
    'Hotel pick-up and drop-off',
    'Bottled water during tour',
    'Wi-Fi in vehicle'
  ];

  const excludedItems = [
    'Meals and personal dining expenses',
    'Personal shopping and souvenirs',
    'Travel insurance',
    'Gratuities (optional)',
    'Additional activities not mentioned'
  ];

  // FAQs will be loaded from product data, no dummy data
  const faqs = productData?.faqs || [];
  const cancellationPolicyPreview = productData?.cancellationPolicy;
  const hasCancellationPolicyPreview =
    cancellationPolicyPreview &&
    Array.isArray(cancellationPolicyPreview.schedule) &&
    cancellationPolicyPreview.schedule.length > 0;
  const previewPolicyColors = [
    { bg: 'bg-green-100', border: 'border-green-200', accent: 'text-green-700' },
    { bg: 'bg-blue-100', border: 'border-blue-200', accent: 'text-blue-700' },
    { bg: 'bg-yellow-100', border: 'border-yellow-200', accent: 'text-yellow-700' },
    { bg: 'bg-red-100', border: 'border-red-200', accent: 'text-red-700' }
  ];

  const toggleFaq = (index) => {
    setExpandedFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header activePage="home" />

      {/* Page Header */}
      <div className="w-full px-6 py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Back Arrow */}
          <div className="mb-4">
            <button 
              onClick={onBack || (() => window.history.back())}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {productData?.title || 'Mount Fuji Customized Tour'}
            </h1>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {productData?.category || 'Tour'}
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1 border border-gray-300 text-gray-600 rounded-full text-sm">
                {productData?.sellingPoints || 'Travel & SightSeeing'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isPublishing}
              className="flex items-center space-x-2 px-4 py-2 border border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 bg-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingDraft ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiEdit3 size={16} />
                  <span>Save as Draft</span>
                </>
              )}
            </button>
            <button 
              onClick={() => setShowPublishModal(true)}
              disabled={isSavingDraft || isPublishing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <FiUpload size={16} />
                  <span>Publish Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section with Photo Gallery */}
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Hero Image - Left Side (Cover Image) */}
              <div className="lg:col-span-2">
                <img 
                  src={mainCoverImage}
                  alt="Tour cover" 
                  className="w-full h-[500px] object-cover rounded-lg cursor-pointer hover:opacity-95 transition-all"
                  onClick={() => handlePhotoClick(0)}
                />
              </div>
              
              {/* Photo Gallery - Right Side */}
              <div className="lg:col-span-1 space-y-4">
                {/* First smaller image */}
                {photos[0] && (
                <div className="relative">
                  <img 
                      src={photos[0].src}
                      alt={photos[0].alt}
                    className="w-full h-[240px] object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all"
                    onClick={() => openGalleryPhoto(0)}
                  />
                </div>
                )}
                
                {/* Second smaller image with See More overlay */}
                {photos[1] && (
                <div className="relative">
                  <img 
                      src={photos[1].src}
                      alt={photos[1].alt}
                    className="w-full h-[240px] object-cover rounded-lg"
                  />
                  {/* See More Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                    <button 
                      onClick={() => openGalleryPhoto(0)}
                      className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all"
                    >
                      See More
                    </button>
                  </div>
                </div>
                )}
              </div>
            </div>
            
            {/* Description below hero image */}
            <div className="mt-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm w-full">
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  {productData?.tagline || 'Discover the breathtaking beauty of Mount Fuji with a private guided tour from Tokyo, tailored for comfort and unforgettable memories.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">

            {/* Tour Description */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <FiCompass size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Tour Description</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {productData?.description || 
                  'Experience the magic of Mount Fuji on this exclusive one-day private tour designed for comfort and adventure. Our professional guides will take you to the most scenic spots including Lake Kawaguchi and the iconic Chureito Pagoda. Enjoy flexible scheduling, cultural insights, and personalized attention throughout your journey. Perfect for families, couples, or small groups seeking an authentic Japanese mountain experience.'}
              </p>
            </div>

            {/* Tour Highlights */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <FiStar size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Tour Highlights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {highlight.icon === 'mountain' && <span className="text-blue-600">🏔️</span>}
                        {highlight.icon === 'camera' && <FiCamera size={16} className="text-blue-600" />}
                        {highlight.icon === 'car' && <FiTruck size={16} className="text-blue-600" />}
                        {highlight.icon === 'guide' && <FiUser size={16} className="text-blue-600" />}
                      </div>
                      <p className="text-gray-700 text-sm">{highlight.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Trip Details */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiBriefcase size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Trip Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <FiUser size={20} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Guide Type</h4>
                      <p className="text-gray-600">{productData?.guideType || 'Driver + Guide'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiBriefcase size={20} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Things to Carry</h4>
                      <p className="text-gray-600">
                        {productData?.thingsToCarry && productData.thingsToCarry.length > 0
                          ? productData.thingsToCarry.join(', ')
                          : 'Camera, Walking Shoes, Water Bottle, +4 more'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiGlobe size={20} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Languages</h4>
                      <p className="text-gray-600">
                        {productData?.languages && productData.languages.length > 0
                          ? productData.languages.join(', ')
                          : 'English, Japanese, Hindi'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle size={20} className="text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Included</h4>
                      {productData?.includedItems ? (
                        <p className="text-gray-600 whitespace-pre-line">{productData.includedItems}</p>
                      ) : (
                      <ul className="text-gray-600 space-y-1">
                        {includedItems.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">♿</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Accessibility</h4>
                      <p className="text-gray-600">
                        {productData?.accessibility 
                          ? Object.entries(productData.accessibility)
                              .filter(([key, value]) => value)
                              .map(([key]) => key === 'wheelchair' ? 'Wheelchair accessible' :
                                              key === 'serviceAnimals' ? 'Service animals allowed' :
                                              key === 'infantSeat' ? 'Infant seat available' :
                                              key === 'stroller' ? 'Stroller friendly' : '')
                              .filter(Boolean)
                              .join(', ')
                          : 'Wheelchair accessible, stroller friendly'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiUser size={20} className="text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Activity Type</h4>
                      <p className="text-gray-600">{productData?.activityType || 'Private, Customizable'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-red-600 mt-1">✗</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Excluded</h4>
                      {productData?.excludedItems ? (
                        <p className="text-gray-600 whitespace-pre-line">{productData.excludedItems}</p>
                      ) : (
                      <ul className="text-gray-600 space-y-1">
                        {excludedItems.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {hasCancellationPolicyPreview && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <div className="text-sm uppercase tracking-wide text-gray-500 font-semibold">Policies</div>
                    <h3 className="text-2xl font-bold text-gray-900">Cancellation & Refund Policy</h3>
                    <p className="text-gray-600 text-sm">
                      Guests will see this policy on your public listing.
                    </p>
                  </div>
                </div>

                {cancellationPolicyPreview?.freeCancellationText && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-800 flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{cancellationPolicyPreview.freeCancellationText}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {cancellationPolicyPreview.schedule.map((tier, index) => {
                    const colors = previewPolicyColors[index % previewPolicyColors.length];
                    return (
                      <div
                        key={`${tier.label}-${index}`}
                        className={`${colors.bg} border ${colors.border} rounded-xl p-5 text-center`}
                      >
                        <div className={`text-4xl font-bold ${colors.accent} mb-2`}>
                          {typeof tier.percentage === 'number' ? `${tier.percentage}%` : tier.percentage}
                        </div>
                        <div className={`font-semibold ${colors.accent} mb-2`}>
                          {parseInt(tier.percentage, 10) === 100
                            ? 'Full Refund'
                            : parseInt(tier.percentage, 10) === 0
                            ? 'No Refund'
                            : 'Partial Refund'}
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {tier.note || tier.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {Array.isArray(cancellationPolicyPreview.notes) && cancellationPolicyPreview.notes.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Important Notes</h4>
                    <ul className="space-y-2">
                      {cancellationPolicyPreview.notes.map((note, idx) => (
                        <li key={`preview-note-${idx}`} className="flex items-start gap-3 text-sm text-gray-700">
                          <FiCheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Vehicle & Pricing */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                <FiTruck size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Vehicle & Pricing</h3>
                </div>
                {Array.isArray(productData?.vehicles) && productData.vehicles.length > 1 && (
                  <span className="text-sm text-gray-500">
                    {selectedVehicleIndex !== null && selectedVehicleIndex < productData.vehicles.length
                      ? `Vehicle ${selectedVehicleIndex + 1} of ${productData.vehicles.length}`
                      : `${productData.vehicles.length} vehicles available`}
                  </span>
                )}
              </div>
              {productData?.vehicles && productData.vehicles.length > 0 ? (
                <div className="space-y-4">
                  {productData.vehicles.map((vehicle, index) => {
                    const isSelected = selectedVehicleIndex === index;
                    const vehicleId = vehicle.id || vehicle._id || index;
                    
                    return (
                      <button
                        key={vehicleId}
                        type="button"
                        onClick={() => setSelectedVehicleIndex(index)}
                        className={`w-full text-left rounded-xl border-2 transition-all duration-200 p-4 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="flex items-start space-x-3">
                        <FiTruck size={20} className={`mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {vehicle.title || (vehicle.type && vehicle.model ? `${vehicle.type} ${vehicle.model.replace('-', ' ')}` : 'Vehicle')}
                            </h4>
                            {isSelected && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                                Selected
                              </span>
                            )}
                          </div>
                          {vehicle.year && <p className="text-sm text-gray-500">{vehicle.year} model</p>}
                          {vehicle.attributes && <p className="text-sm text-gray-500">{vehicle.attributes}</p>}
                          {vehicle.capacity && <p className="text-sm text-gray-500">Best for up to {vehicle.capacity} travelers</p>}
                        </div>
                      </div>
                    </div>
                    {(vehicle.currency || vehicle.amount || vehicle.pricingType) && (
                          <div className="mt-4 flex items-center space-x-3">
                        {(vehicle.currency || vehicle.amount) && (
                              <span className={`text-2xl font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                            {vehicle.currency || '$'} {vehicle.amount || '0'}
                          </span>
                        )}
                        {vehicle.pricingType && (
                          <span className="text-gray-600">{vehicle.pricingType}</span>
                        )}
                      </div>
                    )}
                    {vehicle.description && (
                      <p className="text-sm text-gray-600 mt-3">{vehicle.description}</p>
                    )}
                      </button>
                    );
                  })}
                  </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                  <p className="text-gray-700 font-medium mb-1">No vehicles added yet</p>
                  <p className="text-gray-500 text-sm">
                    Please go back and add at least one vehicle to show accurate vehicle and pricing details.
                  </p>
                </div>
              )}
            </div>

            {/* Pick-up & Drop-off */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <FiMapPin size={12} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-black">Pick-up & Drop-off Location</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-4">
                    <h4 className="font-bold text-black mb-2">Pick-up</h4>
                    {selectedVehiclePickupLocations.length > 0 ? (
                      <div className="space-y-2">
                        {selectedVehiclePickupLocations.map((location, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <p className="text-gray-700">{location}</p>
                          </div>
                        ))}
                      </div>
                    ) : productData?.pickupLocations && productData.pickupLocations.length > 0 ? (
                      <div className="space-y-2">
                        {productData.pickupLocations.map((location, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <p className="text-gray-700">{location}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      <p className="text-gray-500">Shibuya Crossing (Tokyo)</p>
                    </div>
                    )}
                    {selectedVehiclePickupTime && (
                      <p className="text-sm text-gray-600 mt-2">
                        Time: {selectedVehiclePickupTime}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-2">Drop-off</h4>
                    {selectedVehicleDropoffLocations.length > 0 ? (
                      <div className="space-y-2">
                        {selectedVehicleDropoffLocations.map((location, index) => {
                          // Check if dropoff location is same as pickup location
                          const isSameAsPickup = selectedVehiclePickupLocations.some(pickupLoc => 
                            String(pickupLoc).toLowerCase() === String(location).toLowerCase()
                          );
                          return (
                            <div key={index} className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${isSameAsPickup ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                              <p className={`text-gray-700 ${isSameAsPickup ? 'italic' : ''}`}>
                                {location}
                                {isSameAsPickup && <span className="text-xs text-gray-500 ml-1">(same as pickup)</span>}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : productData?.dropoffLocations && productData.dropoffLocations.length > 0 ? (
                      <div className="space-y-2">
                        {productData.dropoffLocations.map((location, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-gray-700">{location}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      <p className="text-gray-500">Same as Pick-up</p>
                    </div>
                    )}
                  </div>
                </div>
                <div>
                  {productData?.weekDay && (
                    <div className="mb-4">
                      <h4 className="font-bold text-black mb-2">Selected Days</h4>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                          {productData.weekDay}
                        </div>
                        {productData.selectedDate && (
                          <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                            {productData.selectedDate}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mb-4">
                    <h4 className="font-bold text-black mb-2">Available Days</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableDays.length > 0 ? (
                        availableDays.map((day) => (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedDay === day 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {day}
                        </button>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No available days set</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-2">Time Slots {selectedDay ? `(${selectedDay})` : ''}</h4>
                    {timeSlotsForSelectedDay.length > 0 ? (
                    <div className="grid grid-cols-6 gap-2">
                        {timeSlotsForSelectedDay.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 py-2 rounded-full text-sm font-medium ${
                            selectedTime === time 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No time slots available for {selectedDay || 'selected day'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiHelpCircle size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
              </div>
              <div className="space-y-4">
                {faqs.length > 0 ? (
                  faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h4 className="font-semibold text-gray-900">
                          {faq.question?.trim() || `FAQ ${index + 1}`}
                        </h4>
                        {expandedFaqIndex === index ? (
                          <FiMinus className="text-blue-600" size={18} />
                        ) : (
                          <FiPlus className="text-blue-600" size={18} />
                        )}
                      </button>
                      {expandedFaqIndex === index && faq.answer?.trim() && (
                        <p className="text-gray-600 mt-3">{faq.answer}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No FAQs added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Itinerary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiCalendar size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Itinerary</h3>
              </div>
              <div className="space-y-6">
                {totalTourDays > 1 ? (
                  // Multi-day tour: Show grouped by day
                  Array.from({ length: totalTourDays }, (_, i) => i + 1).map((day) => {
                    const dayItineraries = itineraryItemsByDay[day] || [];
                    const dayDuration = dayDurations[day] || dayDurations[String(day)] || '';
                    
                    if (dayItineraries.length === 0) return null;
                    
                    return (
                      <div key={day} className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-300">
                          <h4 className="text-lg font-bold text-gray-900">Day {day}</h4>
                          {dayDuration && (
                            <span className="text-sm text-gray-600">({dayDuration})</span>
                          )}
                        </div>
                        {dayItineraries.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-300 overflow-hidden bg-blue-100">
                                {item.photo ? (
                                  /* Show cropped circular photo */
                                  <img 
                                    src={item.photo} 
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  /* Show time if no photo */
                                <span className="text-blue-600 text-xs font-bold">{item.time}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                                  {item.photo && (
                                    <span className="text-blue-600 text-xs font-medium">{item.time}</span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-xs mt-1 mb-2">{item.description}</p>
                                {item.attractionType && (
                                  <p className="text-gray-500 text-xs mb-2">{item.attractionType}</p>
                                )}
                                <div className="flex items-center space-x-2">
                                  {item.isFree !== undefined && (
                                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                                      {item.isFree ? 'Free' : 'Paid'}
                                    </span>
                                  )}
                                  {item.timeSpent && (
                                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                                      {item.timeSpent}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                ) : (
                  // Single-day tour: Show flat list
                  itineraryItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-300 overflow-hidden bg-blue-100">
                          {item.photo ? (
                            /* Show cropped circular photo */
                            <img 
                              src={item.photo} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            /* Show time if no photo */
                          <span className="text-blue-600 text-xs font-bold">{item.time}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                            {item.photo && (
                              <span className="text-blue-600 text-xs font-medium">{item.time}</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-xs mt-1 mb-2">{item.description}</p>
                          {item.attractionType && (
                            <p className="text-gray-500 text-xs mb-2">{item.attractionType}</p>
                          )}
                          <div className="flex items-center space-x-2">
                            {item.isFree !== undefined && (
                              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                                {item.isFree ? 'Free' : 'Paid'}
                              </span>
                            )}
                            {item.timeSpent && (
                              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                                {item.timeSpent}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ready to Go Live */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-4">
                <FiCheckCircle size={20} className="text-green-600" />
                <h3 className="text-xl font-bold text-green-700">Ready to Go Live</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-600">All requirements met</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Commission Rate</span>
                  <span className="text-green-600">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Your Earnings</span>
                  <span className="text-green-600 font-semibold">$192 Per Booking</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-4">
                <FiRefreshCw size={20} className="text-purple-600" />
                <h3 className="text-xl font-bold text-purple-700">Next Steps</h3>
              </div>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">•</span>
                  <span>Review all details above</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">•</span>
                  <span>Use Quick Actions to proceed</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">•</span>
                  <span>Monitor performance after publishing</span>
                </li>
              </ul>
            </div>

            {/* Need Help */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <FiHelpCircle size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <FiPhone size={16} />
                  <span>Need Help?</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <FiMail size={16} />
                  <span>Email Support</span>
                </button>
                <div className="text-center text-sm text-gray-500">
                  <p>Support Hours: 9 AM - 6 PM (JST)</p>
                  <p>Response Time: Within 2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Publish Product Modal */}
      <PublishProductModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublishProduct}
        isPublishing={isPublishing}
      />

          {/* Application Submitted Success Modal */}
          <ApplicationSubmittedPage
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            onReturnToDashboard={handleReturnToDashboard}
          />

          {/* Photo Gallery Modal */}
          {showPhotoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
                {/* Close Button */}
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  <FiX size={24} />
                </button>
                
                {/* Main Photo */}
                <div className="relative">
                  <img
                    src={allPhotos[currentPhotoIndex]?.src}
                    alt={allPhotos[currentPhotoIndex]?.alt || 'Gallery photo'}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  />
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </div>
                
                {/* Photo Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                  {Math.min(currentPhotoIndex + 1, allPhotos.length)} / {allPhotos.length}
                </div>
                
                {/* Thumbnail Strip */}
                <div className="absolute bottom-4 left-4 right-4 flex space-x-2 overflow-x-auto pb-2">
                  {allPhotos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 ${
                        index === currentPhotoIndex ? 'border-white' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
    );
  };

export default MountFujiTourPage;
