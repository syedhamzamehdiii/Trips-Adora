import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiX, FiChevronDown, FiUpload, FiSend, FiMapPin, FiClock } from 'react-icons/fi';
import { GoogleMap, Marker } from '@react-google-maps/api';
import AddItineraryComponent from './AddItineraryComponent';
import productService from '@/services/productService';
import vehicleService from '@/services/vehicleService';

const CreateProductComponent = ({ onClose, draftId = null }) => {
  const [step, setStep] = useState(1);
  const [showItineraryComponent, setShowItineraryComponent] = useState(false);
  const [showImageTipsModal, setShowImageTipsModal] = useState(false);
  const [showIncludedExcludedModal, setShowIncludedExcludedModal] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [selectedVehicleModel, setSelectedVehicleModel] = useState('');
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [dbProductId, setDbProductId] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  
  // Step 1 - Product Information
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [sellingPoints, setSellingPoints] = useState('');
  const [tagline, setTagline] = useState('');
  
  // Step 2 - Description & Highlights
  const [description, setDescription] = useState('');
  
  // Photo Management
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = React.useRef(null);
  
  // Highlights Management
  const [highlights, setHighlights] = useState([
    { id: 1, text: '' }
  ]);
  
  // Vehicle Management
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState(null);
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  
  // Step 5 - Vehicle Form Fields
  const [vehicleTitle, setVehicleTitle] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2024');
  const [vehicleAttributes, setVehicleAttributes] = useState('');
  const [numTravellers, setNumTravellers] = useState('');
  const [currency, setCurrency] = useState('');
  const [pricingType, setPricingType] = useState('');
  const [productAmount, setProductAmount] = useState('');
  const [totalDuration, setTotalDuration] = useState('');
  const [vehicleDescription, setVehicleDescription] = useState('');
  const editingVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === editingVehicleId) || null,
    [vehicles, editingVehicleId]
  );
  
  // Step 6 dropdown states
  const [showSelectLocationsDropdown, setShowSelectLocationsDropdown] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState('All Location');
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [selectedPickupHour, setSelectedPickupHour] = useState('00');
  const [selectedPickupMinute, setSelectedPickupMinute] = useState('00');
  const [selectedWeekDay, setSelectedWeekDay] = useState('week days');
  const [selectedPickupLocation, setSelectedPickupLocation] = useState('');
  const [selectedDropoffLocation, setSelectedDropoffLocation] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('01 Oct');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSelectVehicleModal, setShowSelectVehicleModal] = useState(false);
  const [selectedVehicleForTour, setSelectedVehicleForTour] = useState(null);
  const [useSamePickupLocation, setUseSamePickupLocation] = useState(true);
  
  // Real-time location search
  const [pickupSearchQuery, setPickupSearchQuery] = useState('');
  const [dropoffSearchQuery, setDropoffSearchQuery] = useState('');
  const [selectedPickupLocations, setSelectedPickupLocations] = useState([]);
  const [selectedDropoffLocations, setSelectedDropoffLocations] = useState([]);
  const [showLocationAddedMessage, setShowLocationAddedMessage] = useState(false);
  
  // Manual region input
  const [manualPickupRegion, setManualPickupRegion] = useState('');
  const [manualDropoffRegion, setManualDropoffRegion] = useState('');
  
  // Active/highlighted locations (clicked by user)
  const [activePickupLocations, setActivePickupLocations] = useState([]);
  const [activeDropoffLocations, setActiveDropoffLocations] = useState([]);
  
  // Time slots management
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const emptyTimeSlots = useMemo(() => ({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  }), []);

  const normalizeTimeSlots = useCallback((rawSlots) => {
    if (!rawSlots || typeof rawSlots !== 'object') {
      return { ...emptyTimeSlots };
    }

    const normalized = { ...emptyTimeSlots };

    Object.keys(normalized).forEach((day) => {
      const value = rawSlots[day];

      if (Array.isArray(value)) {
        normalized[day] = value.filter(Boolean);
        return;
      }

      if (typeof value === 'string' && value.trim()) {
        normalized[day] = [value.trim()];
        return;
      }

      if (value && typeof value === 'object') {
        const collected = Object.values(value).flatMap((entry) => {
          if (Array.isArray(entry)) return entry.filter(Boolean);
          if (typeof entry === 'string' && entry.trim()) return [entry.trim()];
          return [];
        });
        normalized[day] = collected;
      }
    });

    return normalized;
  }, [emptyTimeSlots]);

  const [timeSlots, setTimeSlots] = useState(() => ({ ...emptyTimeSlots }));
  
  // Vehicle-Time Allocations (time + vehicle pairings)
  const [vehicleTimeAllocations, setVehicleTimeAllocations] = useState([]);

  const loadVehicles = useCallback(async () => {
    setVehiclesLoading(true);
    setVehicleError(null);
    try {
      const fetched = await vehicleService.list();
      const mapped = Array.isArray(fetched) ? fetched : [];
      setVehicles(mapped);
      setSelectedVehicleForTour((prevSelected) => {
        if (prevSelected?.id) {
          const match = mapped.find((vehicle) => vehicle.id === prevSelected.id);
          return match || prevSelected;
        }
        return prevSelected || (mapped.length ? mapped[0] : null);
      });
    } catch (error) {
      console.error('Failed to load vehicle options:', error);
      setVehicles([]);
      setVehicleError(error?.message || 'Failed to load vehicles.');
    } finally {
      setVehiclesLoading(false);
    }
  }, []);
  
  // Google Maps state
  const [mapCenter, setMapCenter] = useState({ lat: 35.3606, lng: 138.7274 }); // Mount Fuji area
  const [mapZoom, setMapZoom] = useState(8);
  const [map, setMap] = useState(null);
  
  // Step 4 state management
  const [selectedGuideType, setSelectedGuideType] = useState('Driver');
  const [selectedActivityType, setSelectedActivityType] = useState('Private');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedThingsToCarry, setSelectedThingsToCarry] = useState([]);
  const [includedItems, setIncludedItems] = useState('');
  const [excludedItems, setExcludedItems] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showThingsToCarryDropdown, setShowThingsToCarryDropdown] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  
  // Step navigation hover menu (return to step 1 from step 2)
  const [showStep1Menu, setShowStep1Menu] = useState(false);
  const [topMenuStep, setTopMenuStep] = useState(null); // 1 or 2 when hovering top circles
  
  // Refs for all sections to enable scroll navigation
  const projectTitleRef = React.useRef(null);
  const categoryRef = React.useRef(null);
  const styleThemeRef = React.useRef(null);
  const taglineRef = React.useRef(null);
  const descriptionRef = React.useRef(null);
  const highlightsRef = React.useRef(null);
  const photosRef = React.useRef(null);
  const guideActivityRef = React.useRef(null);
  const languageRef = React.useRef(null);
  const accessibilityRef = React.useRef(null);
  const thingsToCarryRef = React.useRef(null);
  const includedExcludedRef = React.useRef(null);
  const vehicleTitleRef = React.useRef(null);
  const transportationRef = React.useRef(null);
  const durationRef = React.useRef(null);
  const addVehicleRef = React.useRef(null);
  
  const scrollToRef = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const navigateToSection = (stepNumber, ref) => {
    setStep(stepNumber);
    // Use setTimeout to ensure the step has rendered before scrolling
    setTimeout(() => scrollToRef(ref), 100);
  };
  
  // Helper function to count words
  const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  // Helper function to get coordinates for a location
  const getLocationCoordinates = (location) => {
    const coordinates = {
      // Tokyo areas
      'Shibuya Crossing (Tokyo)': { lat: 35.6595, lng: 139.7004 },
      'Tokyo Tower (Tokyo)': { lat: 35.6586, lng: 139.7454 },
      'Sensoji Temple (Asakusa, Tokyo)': { lat: 35.7148, lng: 139.7967 },
      'Shinjuku Station (Tokyo)': { lat: 35.6896, lng: 139.7006 },
      'Akihabara (Tokyo)': { lat: 35.7023, lng: 139.7745 },
      'Harajuku (Tokyo)': { lat: 35.6702, lng: 139.7028 },
      'Roppongi Hills (Tokyo)': { lat: 35.6604, lng: 139.7292 },
      'Tokyo Skytree (Tokyo)': { lat: 35.7101, lng: 139.8107 },
      'Odaiba (Tokyo)': { lat: 35.6265, lng: 139.7734 },
      'Ginza (Tokyo)': { lat: 35.6717, lng: 139.7653 },
      
      // Mount Fuji areas
      'Mount Fuji (Yamanashi)': { lat: 35.3606, lng: 138.7274 },
      'Kawaguchiko Lake (Mount Fuji)': { lat: 35.5110, lng: 138.7643 },
      'Gotemba Premium Outlets (Mount Fuji)': { lat: 35.3331, lng: 138.9503 },
      'Hakone (Kanagawa)': { lat: 35.2323, lng: 139.1070 },
      'Oshino Hakkai (Mount Fuji)': { lat: 35.4571, lng: 138.8447 },
      
      // Osaka areas
      'Osaka Castle (Osaka)': { lat: 34.6873, lng: 135.5262 },
      'Dotonbori (Osaka)': { lat: 34.6686, lng: 135.5004 },
      'Universal Studios Japan (Osaka)': { lat: 34.6654, lng: 135.4322 },
      'Shinsekai (Osaka)': { lat: 34.6524, lng: 135.5064 },
      'Umeda Sky Building (Osaka)': { lat: 34.7055, lng: 135.4903 },
      
      // Kyoto areas
      'Fushimi Inari Shrine (Kyoto)': { lat: 34.9671, lng: 135.7727 },
      'Kinkaku-ji Temple (Kyoto)': { lat: 35.0394, lng: 135.7292 },
      'Arashiyama Bamboo Grove (Kyoto)': { lat: 35.0170, lng: 135.6719 },
      'Kiyomizu-dera Temple (Kyoto)': { lat: 34.9948, lng: 135.7850 },
      'Gion District (Kyoto)': { lat: 35.0038, lng: 135.7753 },
      'Nijo Castle (Kyoto)': { lat: 35.0142, lng: 135.7481 },
      
      // Yokohama
      'Yokohama Chinatown (Yokohama)': { lat: 35.4437, lng: 139.6455 },
      'Minato Mirai (Yokohama)': { lat: 35.4561, lng: 139.6364 },
      'Yokohama Red Brick Warehouse (Yokohama)': { lat: 35.4532, lng: 139.6425 },
      
      // Hiroshima
      'Hiroshima Peace Memorial (Hiroshima)': { lat: 34.3955, lng: 132.4536 },
      'Itsukushima Shrine (Miyajima)': { lat: 34.2958, lng: 132.3197 },
      
      // Nara
      'Todai-ji Temple (Nara)': { lat: 34.6890, lng: 135.8398 },
      'Nara Park (Nara)': { lat: 34.6851, lng: 135.8431 },
      
      // Other major cities
      'Nagoya Castle (Nagoya)': { lat: 35.1852, lng: 136.8991 },
      'Sapporo Snow Festival Site (Sapporo)': { lat: 43.0618, lng: 141.3545 },
      'Fukuoka Tower (Fukuoka)': { lat: 33.5936, lng: 130.3560 }
    };
    
    return coordinates[location] || null;
  };
  
  // Accessibility & Comfort toggles
  const [accessibilityToggles, setAccessibilityToggles] = useState({
    wheelchair: true,
    serviceAnimals: true,
    infantSeat: true,
    stroller: true
  });
  
  const toggleAccessibility = (item) => {
    setAccessibilityToggles(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleSaveIncludedExcluded = () => {
    setShowSavedMessage(true);
    setTimeout(() => {
      setShowSavedMessage(false);
      setShowIncludedExcludedModal(false);
    }, 1500);
  };

  // Load draft data when component mounts
  useEffect(() => {
    const loadDraftData = () => {
      try {
        // Only load draft if draftId is provided (not null/undefined)
        if (!draftId) {
          console.log('💡 No draftId provided - Creating NEW product from scratch');
          setIsLoadingDraft(false);
          return;
        }
        
        console.log('🔍 Loading draft with ID:', draftId);
        console.log('🔍 Looking for key:', `product_draft_${draftId}`);
        
        const savedDraft = localStorage.getItem(`product_draft_${draftId}`);
        
        if (savedDraft) {
          console.log('📦 Found draft data in localStorage');
          const draftData = JSON.parse(savedDraft);
          console.log('📄 Draft data parsed:', draftData);
          
          const detectedDbId = draftData.dbProductId || draftData.draftId || (draftId && draftId !== 'current_draft' ? draftId : null);
          setDbProductId(detectedDbId || null);
          if (Array.isArray(draftData.itineraries)) setItineraries(draftData.itineraries);

          // Load Step 1 data
          if (draftData.productTitle) {
            console.log('✅ Loading title:', draftData.productTitle);
            setProductTitle(draftData.productTitle);
          }
          if (draftData.productCategory) setProductCategory(draftData.productCategory);
          if (draftData.sellingPoints) setSellingPoints(draftData.sellingPoints);
          if (draftData.tagline) setTagline(draftData.tagline);
          
          // Load Step 2 data
          if (draftData.description) {
            console.log('✅ Loading description:', draftData.description.substring(0, 50) + '...');
            setDescription(draftData.description);
          }
          if (draftData.highlights) {
            console.log('✅ Loading highlights:', draftData.highlights.length, 'items');
            setHighlights(draftData.highlights);
          }
          
          // Load photo data (will be empty due to quota fix)
          if (draftData.uploadedPhotos) setUploadedPhotos(draftData.uploadedPhotos);
          if (draftData.coverImage) setCoverImage(draftData.coverImage);
          
          // Load Step 4 data
          if (draftData.selectedGuideType) setSelectedGuideType(draftData.selectedGuideType);
          if (draftData.selectedActivityType) setSelectedActivityType(draftData.selectedActivityType);
          if (draftData.selectedLanguages) setSelectedLanguages(draftData.selectedLanguages);
          if (draftData.selectedThingsToCarry) setSelectedThingsToCarry(draftData.selectedThingsToCarry);
          if (draftData.includedItems) setIncludedItems(draftData.includedItems);
          if (draftData.excludedItems) setExcludedItems(draftData.excludedItems);
          if (draftData.accessibilityToggles) setAccessibilityToggles(draftData.accessibilityToggles);
          
          // Load Step 5 data (Vehicles)
          if (draftData.vehicleTitle) setVehicleTitle(draftData.vehicleTitle);
          if (draftData.selectedVehicleType) setSelectedVehicleType(draftData.selectedVehicleType);
          if (draftData.selectedVehicleModel) setSelectedVehicleModel(draftData.selectedVehicleModel);
          if (draftData.vehicleYear) setVehicleYear(draftData.vehicleYear);
          if (draftData.vehicleAttributes) setVehicleAttributes(draftData.vehicleAttributes);
          if (draftData.numTravellers) setNumTravellers(draftData.numTravellers);
          if (draftData.currency) setCurrency(draftData.currency);
          if (draftData.pricingType) setPricingType(draftData.pricingType);
          if (draftData.productAmount) setProductAmount(draftData.productAmount);
          if (draftData.totalDuration) setTotalDuration(draftData.totalDuration);
          if (draftData.vehicleDescription) setVehicleDescription(draftData.vehicleDescription);
          if (draftData.selectedVehicleForTour) setSelectedVehicleForTour(draftData.selectedVehicleForTour);
          
          // Load Step 6 data (Location & Time)
          if (draftData.selectedPickupLocations) {
            console.log('✅ Loading pickup locations:', draftData.selectedPickupLocations);
            setSelectedPickupLocations(draftData.selectedPickupLocations);
          }
          if (draftData.selectedDropoffLocations) setSelectedDropoffLocations(draftData.selectedDropoffLocations);
          if (draftData.activePickupLocations) setActivePickupLocations(draftData.activePickupLocations);
          if (draftData.activeDropoffLocations) setActiveDropoffLocations(draftData.activeDropoffLocations);
          if (draftData.selectedPickupHour) setSelectedPickupHour(draftData.selectedPickupHour);
          if (draftData.selectedPickupMinute) setSelectedPickupMinute(draftData.selectedPickupMinute);
          if (draftData.selectedWeekDay) setSelectedWeekDay(draftData.selectedWeekDay);
          if (draftData.selectedDate) setSelectedDate(draftData.selectedDate);
          if (draftData.timeSlots) setTimeSlots(normalizeTimeSlots(draftData.timeSlots));
          if (draftData.vehicleTimeAllocations) {
            console.log('✅ Loading vehicle-time allocations:', draftData.vehicleTimeAllocations.length);
            setVehicleTimeAllocations(draftData.vehicleTimeAllocations);
          }

          if (draftData.photoStoragePending) {
            const targetId = detectedDbId || draftId;
            if (targetId) {
              (async () => {
                try {
                  console.log('🔄 Hydrating images for draft from server:', targetId);
                  const fullProduct = await productService.getProduct(targetId);
                  const { transformApiProductToDraftPayload } = await import('@/utils/productTransform');
                  const hydratedDraft = transformApiProductToDraftPayload(fullProduct);
                  if (hydratedDraft?.coverImage) {
                    setCoverImage(hydratedDraft.coverImage);
                  }
                  if (Array.isArray(hydratedDraft?.uploadedPhotos) && hydratedDraft.uploadedPhotos.length) {
                    setUploadedPhotos(hydratedDraft.uploadedPhotos);
                  }
                } catch (hydrationError) {
                  console.warn('Unable to hydrate draft images from backend:', hydrationError);
                }
              })();
            }
          }
          
          // Load current step
          if (draftData.step) {
            console.log('✅ Loading step:', draftData.step);
            setStep(draftData.step);
          }
          
          console.log('✅ Draft data loaded successfully!');
          console.log('📊 Summary: Title=', draftData.productTitle, 'Highlights=', draftData.highlights?.length, 'Vehicles=', draftData.vehicles?.length);
        } else {
          console.log('⚠️ No existing draft found for ID:', draftId);
          console.log('💡 Starting fresh - no saved data to load');
          setDbProductId(draftId && draftId !== 'current_draft' ? draftId : null);
        }
      } catch (error) {
        console.error('❌ Error loading draft data:', error);
      } finally {
        // Mark loading as complete
        setIsLoadingDraft(false);
        console.log('✅ Draft loading complete, isLoadingDraft set to false');
      }
    };
    
    loadDraftData();
  }, [draftId, normalizeTimeSlots]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Utility to serialize photos for storage
  const serializePhoto = (photo) => {
    if (!photo) return null;
    const url = photo.url || photo.preview || '';
    if (!url) return null;
    return {
      id: photo.id || Date.now() + Math.random(),
      url,
      name: photo.name || 'Uploaded photo',
    };
  };

  // Auto-save draft data whenever any field changes
  useEffect(() => {
    // Don't auto-save if we're still loading the draft OR if there's no draftId (new product)
    if (isLoadingDraft || !draftId) {
      return;
    }
    
    const saveDraftData = () => {
      try {
        const storageKey = `product_draft_${draftId}`;
        let preservedCustomFields = undefined;

        try {
          const existingRaw = localStorage.getItem(storageKey);
          if (existingRaw) {
            const existingDraft = JSON.parse(existingRaw);
            if (existingDraft?.customFields && typeof existingDraft.customFields === 'object') {
              preservedCustomFields = existingDraft.customFields;
            }
          }
        } catch (parseError) {
          console.warn('Unable to read existing draft for custom fields preservation:', parseError);
        }

        const serializedPhotos = uploadedPhotos
          .map(serializePhoto)
          .filter(Boolean);
        const serializedCover = serializePhoto(coverImage);

        const draftData = {
          // Step 1 data
          productTitle,
          productCategory,
          sellingPoints,
          tagline,
          
          // Step 2 data
          description,
          highlights,
          
          // Photo data
          uploadedPhotos: serializedPhotos,
          coverImage: serializedCover,
          
          // Step 4 data
          selectedGuideType,
          selectedActivityType,
          selectedLanguages,
          selectedThingsToCarry,
          includedItems,
          excludedItems,
          accessibilityToggles,
          
          // Step 5 data
          vehicles,
          vehicleTitle,
          selectedVehicleType,
          selectedVehicleModel,
          vehicleYear,
          vehicleAttributes,
          numTravellers,
          currency,
          pricingType,
          productAmount,
          totalDuration,
          vehicleDescription,
          selectedVehicleForTour,
          
          // Step 6 data
          selectedPickupLocations,
          selectedDropoffLocations,
          activePickupLocations,
          activeDropoffLocations,
          selectedPickupHour,
          selectedPickupMinute,
          selectedWeekDay,
          selectedDate,
          timeSlots,
          vehicleTimeAllocations,
          
          // Current step
          step,
          
          // Metadata
          lastModified: new Date().toISOString(),
          draftId: draftId,
          dbProductId: dbProductId || (draftId && draftId !== 'current_draft' ? draftId : null),
          itineraries,
          customFields: preservedCustomFields
        };
        
        const attemptSave = (payload) => {
          try {
            localStorage.setItem(storageKey, JSON.stringify(payload));
            return true;
          } catch (storageError) {
            if (storageError && storageError.name === 'QuotaExceededError') {
              return false;
            }
            throw storageError;
          }
        };

        if (!attemptSave(draftData)) {
          console.warn('⚠️ Draft save exceeded localStorage quota, retrying without embedded images.');
          const slimDraft = {
            ...draftData,
            uploadedPhotos: [],
            coverImage: null,
            photoStoragePending: true
          };

          if (!attemptSave(slimDraft)) {
            throw new Error('Draft save failed even after stripping images.');
          } else {
            console.log('💾 Draft saved without images due to storage limits.');
          }
        } else {
          console.log('💾 Draft auto-saved to product_draft_' + draftId);
        }
      } catch (error) {
        console.error('Error saving draft data:', error);
      }
    };
    
    // Debounce the save operation (save after 1 second of no changes)
    const timeoutId = setTimeout(saveDraftData, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [
    isLoadingDraft,
    productTitle, productCategory, sellingPoints, tagline,
    description, highlights,
    uploadedPhotos, coverImage,
    selectedGuideType, selectedActivityType, selectedLanguages, selectedThingsToCarry,
    includedItems, excludedItems, accessibilityToggles,
    vehicles, vehicleTitle, selectedVehicleType, selectedVehicleModel, vehicleYear,
    vehicleAttributes, numTravellers, currency, pricingType, productAmount,
    totalDuration, vehicleDescription, selectedVehicleForTour,
    selectedPickupLocations, selectedDropoffLocations, activePickupLocations, activeDropoffLocations,
    selectedPickupHour, selectedPickupMinute, selectedWeekDay, selectedDate, timeSlots,
    vehicleTimeAllocations, itineraries,
    step, draftId, dbProductId
  ]);

  // Auto-generate time slots when start/end time, duration, or weekday changes
  useEffect(() => {
    if (startTime && endTime && duration && !isLoadingDraft) {
      console.log('🕐 Auto-generating time slots:', { startTime, endTime, duration, selectedWeekDay, applyToAllDays });
      
      const generatedSlots = generateTimeSlots();
      
      if (generatedSlots.length > 0) {
        if (applyToAllDays) {
          // Apply to all days
          setTimeSlots({
            Monday: [...generatedSlots],
            Tuesday: [...generatedSlots],
            Wednesday: [...generatedSlots],
            Thursday: [...generatedSlots],
            Friday: [...generatedSlots],
            Saturday: [...generatedSlots],
            Sunday: [...generatedSlots]
          });
          console.log('✅ Generated', generatedSlots.length, 'time slots for ALL days');
        } else {
          // Apply only to selected weekday
          if (selectedWeekDay !== 'week days') {
            setTimeSlots(prev => ({
              ...prev,
              [selectedWeekDay]: [...generatedSlots]
            }));
            console.log('✅ Generated', generatedSlots.length, 'time slots for', selectedWeekDay);
          } else {
            // If "week days" is selected, apply to Monday-Friday
            setTimeSlots(prev => ({
              ...prev,
              Monday: [...generatedSlots],
              Tuesday: [...generatedSlots],
              Wednesday: [...generatedSlots],
              Thursday: [...generatedSlots],
              Friday: [...generatedSlots]
            }));
            console.log('✅ Generated', generatedSlots.length, 'time slots for weekdays (Mon-Fri)');
          }
        }
      }
    }
  }, [startTime, endTime, duration, selectedWeekDay, applyToAllDays, isLoadingDraft]);

  // Japan regions and their locations database
  const japanRegionsMap = {
    'tokyo': [
      'Tokyo Station', 'Shibuya Crossing', 'Shinjuku Station', 'Harajuku', 'Asakusa', 'Akihabara',
      'Roppongi', 'Ginza', 'Odaiba', 'Ueno', 'Ikebukuro', 'Tokyo Skytree', 'Tokyo Tower',
      'Tsukiji Fish Market', 'Meiji Shrine', 'Senso-ji Temple', 'Imperial Palace Tokyo'
    ],
    'kyoto': [
      'Kyoto Station', 'Fushimi Inari Shrine', 'Kinkaku-ji (Golden Pavilion)', 'Gion District',
      'Arashiyama', 'Kiyomizu-dera Temple', 'Nijo Castle', 'Philosopher\'s Path',
      'Fushimi Sake District', 'Nishiki Market', 'Ginkaku-ji (Silver Pavilion)'
    ],
    'osaka': [
      'Osaka Station', 'Dotonbori', 'Osaka Castle', 'Umeda Sky Building', 'Shinsaibashi',
      'Namba', 'Universal Studios Japan', 'Tennoji', 'Tsutenkaku Tower'
    ],
    'hiroshima': [
      'Hiroshima Station', 'Hiroshima Peace Memorial Park', 'Atomic Bomb Dome', 'Miyajima Island',
      'Itsukushima Shrine', 'Shukkeien Garden'
    ],
    'nara': ['Nara Station', 'Nara Park', 'Todai-ji Temple', 'Kasuga Taisha Shrine'],
    'yokohama': ['Yokohama Station', 'Minato Mirai', 'Yokohama Chinatown', 'Yamashita Park'],
    'hakone': ['Hakone-Yumoto Station', 'Lake Ashi', 'Hakone Shrine', 'Owakudani Valley'],
    'mount fuji': [
      'Mount Fuji 5th Station', 'Lake Kawaguchi', 'Fujiyoshida', 'Chureito Pagoda',
      'Fuji-Q Highland', 'Oshino Hakkai'
    ],
    'fuji': [
      'Mount Fuji 5th Station', 'Lake Kawaguchi', 'Fujiyoshida', 'Chureito Pagoda',
      'Fuji-Q Highland', 'Oshino Hakkai'
    ],
    'nagoya': ['Nagoya Station', 'Nagoya Castle', 'Atsuta Shrine', 'Osu Shopping District'],
    'hokkaido': ['Sapporo Station', 'Odori Park', 'Susukino', 'Otaru', 'Hakodate', 'Niseko'],
    'sapporo': ['Sapporo Station', 'Odori Park', 'Susukino'],
    'fukuoka': ['Fukuoka Airport', 'Hakata Station', 'Tenjin', 'Canal City', 'Ohori Park'],
    'kanazawa': ['Kanazawa Station', 'Kenrokuen Garden', 'Higashi Chaya District', 'Kanazawa Castle']
  };

  // Flat list of all locations for backward compatibility
  const japanLocations = Object.values(japanRegionsMap).flat();

  // Intelligent region detection from user input
  const detectRegionsFromInput = (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) return [];
    
    const query = searchQuery.toLowerCase();
    const detectedRegions = [];
    
    // Check for "from X to Y" pattern
    const patterns = [
      /from\s+([a-z\s]+)\s+to\s+([a-z\s]+)/i,
      /([a-z\s]+)\s+to\s+([a-z\s]+)/i,
      /([a-z\s]+)\s*-\s*([a-z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        console.log('🎯 Detected region pattern:', match[0]);
        const region1 = match[1].trim();
        const region2 = match[2].trim();
        
        // Find locations for both regions
        for (const [regionKey, locations] of Object.entries(japanRegionsMap)) {
          if (regionKey.includes(region1) || region1.includes(regionKey)) {
            console.log('✅ Found pickup region:', regionKey, '→', locations.length, 'points');
            detectedRegions.push({ type: 'pickup', region: regionKey, locations });
          }
          if (regionKey.includes(region2) || region2.includes(regionKey)) {
            console.log('✅ Found dropoff region:', regionKey, '→', locations.length, 'points');
            detectedRegions.push({ type: 'dropoff', region: regionKey, locations });
          }
        }
        return detectedRegions;
      }
    }
    
    // If no pattern match, check if query is a single region
    for (const [regionKey, locations] of Object.entries(japanRegionsMap)) {
      if (query.includes(regionKey) || regionKey.includes(query)) {
        detectedRegions.push({ type: 'both', region: regionKey, locations });
      }
    }
    
    return detectedRegions;
  };

  // Filter locations based on search query with intelligent region detection
  const filterLocations = (query, locationType) => {
    if (!query || query.length < 2) return [];
    
    // First, try intelligent region detection
    const detectedRegions = detectRegionsFromInput(query);
    let filtered = [];
    
    if (detectedRegions.length > 0) {
      // If regions detected, show all points from those regions
      console.log('📍 Showing points from detected regions');
      detectedRegions.forEach(({ region, locations }) => {
        filtered = [...filtered, ...locations];
      });
    } else {
      // Fallback to regular search
      const searchTerm = query.toLowerCase();
      filtered = japanLocations.filter(location =>
        location.toLowerCase().includes(searchTerm)
      );
    }

    // Apply location type filter
    if (locationType === 'Hotels only') {
      filtered = filtered.filter(loc => 
        loc.includes('Hotel') || loc.includes('Station') || loc.includes('District')
      );
    } else if (locationType === 'Airports only') {
      filtered = filtered.filter(loc => loc.includes('Airport'));
    } else if (locationType === 'Seaports only') {
      filtered = filtered.filter(loc => 
        loc.includes('Port') || loc.includes('Harbor') || loc.includes('Bay')
      );
    }

    // Remove duplicates
    filtered = [...new Set(filtered)];

    return filtered.slice(0, 20); // Return top 20 results
  };

  // Add pickup location
  const addPickupLocation = (location) => {
    if (!selectedPickupLocations.includes(location)) {
      setSelectedPickupLocations([...selectedPickupLocations, location]);
      setShowLocationAddedMessage(true);
      setTimeout(() => setShowLocationAddedMessage(false), 2000);
    }
    setPickupSearchQuery('');
    setShowPickupDropdown(false);
  };

  // Remove pickup location
  const removePickupLocation = (location) => {
    setSelectedPickupLocations(selectedPickupLocations.filter(loc => loc !== location));
  };

  // Add drop-off location
  const addDropoffLocation = (location) => {
    if (!selectedDropoffLocations.includes(location)) {
      setSelectedDropoffLocations([...selectedDropoffLocations, location]);
      setShowLocationAddedMessage(true);
      setTimeout(() => setShowLocationAddedMessage(false), 2000);
    }
    setDropoffSearchQuery('');
    setShowDropoffDropdown(false);
  };

  // Remove drop-off location
  const removeDropoffLocation = (location) => {
    setSelectedDropoffLocations(selectedDropoffLocations.filter(loc => loc !== location));
    // Also remove from active locations if it was active
    setActiveDropoffLocations(activeDropoffLocations.filter(loc => loc !== location));
  };

  // Toggle active/highlighted state for pickup locations
  const togglePickupLocationActive = (location) => {
    if (activePickupLocations.includes(location)) {
      // Remove from active
      setActivePickupLocations(activePickupLocations.filter(loc => loc !== location));
    } else {
      // Add to active
      setActivePickupLocations([...activePickupLocations, location]);
    }
  };

  // Toggle active/highlighted state for drop-off locations
  const toggleDropoffLocationActive = (location) => {
    if (activeDropoffLocations.includes(location)) {
      // Remove from active
      setActiveDropoffLocations(activeDropoffLocations.filter(loc => loc !== location));
    } else {
      // Add to active
      setActiveDropoffLocations([...activeDropoffLocations, location]);
    }
  };

  // Time slot helper functions
  const parseTime = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num.trim()));
    return hours * 60 + minutes;
  };

  const formatTimeSlot = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')}`;
  };

  // Generate time slots automatically
  const generateTimeSlots = () => {
    if (!startTime || !endTime || !duration) return [];
    
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const interval = parseInt(duration) || 30;
    
    if (start >= end || interval <= 0) return [];
    
    const slots = [];
    let current = start;
    
    while (current <= end) {
      slots.push(formatTimeSlot(current));
      current += interval;
    }
    
    return slots;
  };

  // Apply generated time slots to selected days
  const applyGeneratedSlots = () => {
    const generatedSlots = generateTimeSlots();
    
    if (applyToAllDays) {
      // Apply to all days
      const allDaysSlots = {
        Monday: [...generatedSlots],
        Tuesday: [...generatedSlots],
        Wednesday: [...generatedSlots],
        Thursday: [...generatedSlots],
        Friday: [...generatedSlots],
        Saturday: [...generatedSlots],
        Sunday: [...generatedSlots]
      };
      setTimeSlots(allDaysSlots);
    } else {
      // Apply only to selected weekday
      if (selectedWeekDay !== 'week days') {
        setTimeSlots(prev => ({
          ...prev,
          [selectedWeekDay]: [...generatedSlots]
        }));
      } else {
        // Apply to weekdays only (Monday-Friday)
        setTimeSlots(prev => ({
          ...prev,
          Monday: [...generatedSlots],
          Tuesday: [...generatedSlots],
          Wednesday: [...generatedSlots],
          Thursday: [...generatedSlots],
          Friday: [...generatedSlots]
        }));
      }
    }
  };

  // Remove a specific time slot from a specific day
  const removeTimeSlot = (day, timeSlot) => {
    setTimeSlots(prev => ({
      ...prev,
      [day]: Array.isArray(prev[day]) ? prev[day].filter(slot => slot !== timeSlot) : []
    }));
  };

  // Add a custom time slot to a specific day
  const addCustomTimeSlot = (day, time) => {
    setTimeSlots(prev => {
      const current = Array.isArray(prev[day]) ? prev[day] : [];
      if (current.includes(time)) {
        return prev;
      }
      const nextDaySlots = [...current, time].sort(
        (a, b) => parseTime(a.replace(' : ', ':')) - parseTime(b.replace(' : ', ':'))
      );
      return {
        ...prev,
        [day]: nextDaySlots
      };
    });
  };

  const handleVehicleTypeChange = (vehicleType) => {
    setSelectedVehicleType(vehicleType);
    setSelectedVehicleModel(''); // Reset model when type changes
  };

  // === PHOTO UPLOAD HANDLERS ===
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
  const MIN_DIMENSION_PX = 720;

  const validateImage = (file, onValid) => {
    if (file.size > MAX_IMAGE_BYTES) {
      alert(`"${file.name}" is too large. Maximum size is 5MB.`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.width < MIN_DIMENSION_PX || img.height < MIN_DIMENSION_PX) {
        alert(`"${file.name}" is too small. Minimum resolution is ${MIN_DIMENSION_PX}px on both width and height.`);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      URL.revokeObjectURL(objectUrl);
      onValid();
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      alert(`Unable to read "${file.name}". Please try another image.`);
    };
    img.src = objectUrl;
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      validateImage(file, () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedPhotos(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      });
    });
  };

  const handleCoverImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    validateImage(file, () => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage({
          id: Date.now(),
          url: e.target.result,
          file: file,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
    // If deleted photo was the cover, clear cover
    if (coverImage && coverImage.id === photoId) {
      setCoverImage(null);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
  };

  const replacePhoto = (index, file) => {
    validateImage(file, () => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhotos(prev => prev.map((photo, idx) => 
          idx === index ? {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file,
            name: file.name
          } : photo
        ));
      };
      reader.readAsDataURL(file);
    });
  };

  const setCoverFromUploadedPhoto = (photoIndex) => {
    const photo = uploadedPhotos[photoIndex];
    if (photo) {
      setCoverImage({ ...photo });
    }
  };

  // === HIGHLIGHTS HANDLERS ===
  const handleHighlightChange = (id, value) => {
    setHighlights(prev => prev.map(h => 
      h.id === id ? { ...h, text: value } : h
    ));
  };

  const addHighlight = () => {
    setHighlights(prev => [...prev, { id: Date.now(), text: '' }]);
  };

  const removeHighlight = (id) => {
    if (highlights.length > 1) {
      setHighlights(prev => prev.filter(h => h.id !== id));
    }
  };

  // === VEHICLE HANDLERS (Legacy - for modal selection) ===
  const deleteVehicle = async (vehicleId) => {
    if (!vehicleId) return;
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const wasSelected = selectedVehicleForTour?.id === vehicleId;
      await vehicleService.remove(vehicleId);
      // Reload vehicles from database to ensure consistency
      const fetched = await vehicleService.list();
      const mapped = Array.isArray(fetched) ? fetched : [];
      setVehicles(mapped);
      
      // Update selected vehicle if the deleted one was selected
      if (wasSelected) {
        setSelectedVehicleForTour(mapped.length ? mapped[0] : null);
      } else {
        // Preserve current selection if it still exists
        const currentSelected = mapped.find(v => v.id === selectedVehicleForTour?.id);
        if (currentSelected) {
          setSelectedVehicleForTour(currentSelected);
        }
      }
      
      if (editingVehicleId === vehicleId) {
        clearVehicleForm();
      }
      alert('Vehicle deleted successfully!');
    } catch (error) {
      console.error('Failed to delete vehicle option:', error);
      alert(error?.message || 'Failed to delete vehicle.');
    }
  };

  // === STEP 5 VEHICLE FORM HANDLERS ===
  const saveVehicleOption = async () => {
    // Validate all required fields
    if (!vehicleTitle || !selectedVehicleType || !selectedVehicleModel || 
        !vehicleAttributes || !numTravellers || !currency || 
        !pricingType || !productAmount || !totalDuration || !vehicleDescription) {
      alert('Please fill in all required fields before saving.');
      return;
    }

    const capacityValue = parseInt(numTravellers, 10);
    const amountValue = Number(productAmount);

    const payload = {
      id: editingVehicleId || undefined,
      title: vehicleTitle.trim(),
      type: selectedVehicleType,
      model: selectedVehicleModel,
      year: vehicleYear,
      attributes: vehicleAttributes,
      capacity: Number.isFinite(capacityValue) ? capacityValue : null,
      currency,
      pricingType,
      amount: Number.isFinite(amountValue) ? amountValue : 0,
      duration: totalDuration,
      description: vehicleDescription.trim(),
    };

    setVehicleSaving(true);
    setVehicleError(null);

    try {
      if (editingVehicleId) {
        const updated = await vehicleService.update(editingVehicleId, payload);
        // Reload vehicles from database to ensure consistency
        await loadVehicles();
        setSelectedVehicleForTour((prevSelected) => {
          if (!prevSelected) return updated;
          return prevSelected.id === updated.id ? updated : prevSelected;
        });
        setEditingVehicleId(null);
        alert('Vehicle option updated successfully!');
      } else {
        const created = await vehicleService.create(payload);
        // Reload vehicles from database to ensure consistency
        await loadVehicles();
        setSelectedVehicleForTour((prevSelected) => prevSelected || created);
        alert('Vehicle option saved successfully!');
      }
      clearVehicleForm();
    } catch (error) {
      console.error('Failed to save vehicle option:', error);
      setVehicleError(error?.message || 'Failed to save vehicle.');
      alert(error?.message || 'Failed to save vehicle.');
    } finally {
      setVehicleSaving(false);
    }
  };

  const clearVehicleForm = () => {
    setVehicleTitle('');
    setSelectedVehicleType('');
    setSelectedVehicleModel('');
    setVehicleYear('2024');
    setVehicleAttributes('');
    setNumTravellers('');
    setCurrency('');
    setPricingType('');
    setProductAmount('');
    setTotalDuration('');
    setVehicleDescription('');
    setEditingVehicleId(null);
  };

  const editVehicleOption = (vehicle) => {
    if (!vehicle) return;
    setVehicleTitle(vehicle.title || '');
    setSelectedVehicleType(vehicle.type || '');
    setSelectedVehicleModel(vehicle.model || '');
    setVehicleYear(vehicle.year || '2024');
    setVehicleAttributes(vehicle.attributes || '');
    setNumTravellers(
      typeof vehicle.capacity === 'number' && !Number.isNaN(vehicle.capacity)
        ? String(vehicle.capacity)
        : ''
    );
    setCurrency(vehicle.currency || '');
    setPricingType(vehicle.pricingType || '');
    setProductAmount(
      typeof vehicle.amount === 'number' && !Number.isNaN(vehicle.amount)
        ? String(vehicle.amount)
        : ''
    );
    setTotalDuration(vehicle.duration || '');
    setVehicleDescription(vehicle.description || '');
    setEditingVehicleId(vehicle.id || null);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVehicleModels = () => {
    switch (selectedVehicleType) {
      case 'van':
        return [
          { value: 'suv', label: 'SUV' },
          { value: 'mini-van', label: 'Mini Van' },
          { value: 'chagan-carvan', label: 'Chagan Carvan' }
        ];
      case 'car':
        return [
          { value: 'bmw', label: 'BMW' },
          { value: 'corolla', label: 'Corolla' },
          { value: 'daze', label: 'Daze' }
        ];
      case 'bus':
        return [
          { value: 'standard-bus', label: 'Standard Bus' },
          { value: 'luxury-bus', label: 'Luxury Bus' },
          { value: 'mini-bus', label: 'Mini Bus' }
        ];
      default:
        return [];
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(formatDate(date));
    setShowCalendar(false);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // === VEHICLE-TIME ALLOCATION HANDLERS ===
  const addVehicleTimeAllocation = () => {
    if (!selectedVehicleForTour) {
      alert('Please select a vehicle first!');
      return;
    }
    
    const timeString = `${selectedPickupHour}:${selectedPickupMinute}`;
    const allocation = {
      id: Date.now(),
      time: timeString,
      vehicle: selectedVehicleForTour,
      date: selectedDate
    };
    
    setVehicleTimeAllocations(prev => [...prev, allocation]);
    console.log('✅ Vehicle-time allocation added:', timeString, selectedVehicleForTour.title);
    
    // Reset for next allocation
    setSelectedVehicleForTour(null);
    setSelectedPickupHour('06');
    setSelectedPickupMinute('00');
  };
  
  const removeVehicleTimeAllocation = (id) => {
    setVehicleTimeAllocations(prev => prev.filter(allocation => allocation.id !== id));
  };

  const nextStep = () => {
    // Validate Step 1 fields
    if (step === 1) {
      if (!productTitle || productTitle.length > 40) {
        alert('Please enter a product title with maximum 40 characters.');
        return;
      }
      if (!productCategory) {
        alert('Please select a category.');
        return;
      }
      if (!sellingPoints) {
        alert('Please select a selling point/style.');
        return;
      }
      if (!tagline || countWords(tagline) < 50) {
        alert('Please enter a tagline with at least 50 words.');
        return;
      }
    }
    
    // Validate Step 2 fields (Description & Highlights)
    if (step === 2) {
      if (!description || description.length < 500) {
        alert('Please enter a description with at least 500 characters.');
        return;
      }
      const filledHighlights = highlights.filter(h => h.text.trim() !== '');
      if (filledHighlights.length === 0) {
        alert('Please add at least one highlight.');
        return;
      }
    }
    
    setStep((prev) => prev + 1);
  };
  
  const prevStep = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative flex items-center space-x-2"
                   onMouseLeave={() => setTopMenuStep(null)}>
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${s < step ? 'cursor-pointer' : 'cursor-not-allowed'}
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
                      onMouseEnter={() => { if (s < step) setTopMenuStep(s); }}
                      onClick={() => { if (s < step) setStep(s) }}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 5 && (
                      <div className={`w-8 h-0.5 border-t-2 ${s < step ? 'border-blue-600' : 'border-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
              <FiInfo className="text-blue-600 mr-3 mt-1" size={20} />
              <p className="text-gray-700 text-sm">Your choices set up your product, please review carefully.</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">Enter a clear, descriptive title. <span className="font-medium">Min 30 characters</span> (max 40).</p>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="e.g., Scenic Full‑Day Private Tour of Mount Fuji and Lake Kawaguchi"
                  required
                  maxLength={40}
                  className={`w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 ${
                    productTitle.length > 0 && productTitle.length < 30
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className={`${productTitle.length < 30 ? 'text-red-600' : 'text-gray-500' } text-xs`}>
                    {productTitle.length} / 40 characters · {productTitle.length < 30 ? `${30 - productTitle.length} more needed` : 'Looks good'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">Select the category that best matches your product or service. Choose from Tour, Hotel, or Rent a Car.</p>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Tour">Tour</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Rent a Car">Rent a Car</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Selling Points <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">Choose the overall look, design, or concept that best represents your product.</p>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={sellingPoints}
                    onChange={(e) => setSellingPoints(e.target.value)}
                    required
                  >
                    <option value="">Choose Style</option>
                    <option value="Art, Design, & Fashion">Art, Design, & Fashion</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Food & Drink">Food & Drink</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="History & Culture">History & Culture</option>
                    <option value="Travel">Travel</option>
                    <option value="Holidays">Holidays</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tagline <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-1">This description will appear under your activity title.</p>
                <p className="text-sm text-gray-600 mb-3">Start with a short intro (2-3 sentences), then describe the full experience in order.</p>
                <textarea
                  rows="4"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Please write atleast 50 words."
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">{countWords(tagline)}/50 words minimum</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative flex items-center space-x-2"
                   onMouseLeave={() => setTopMenuStep(null)}>
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${s < step ? 'cursor-pointer' : 'cursor-not-allowed'}
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
                      onMouseEnter={() => { if (s < step) setTopMenuStep(s); }}
                      onClick={() => { if (s < step) setStep(s) }}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                      {topMenuStep === 1 && s === 1 && step > 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(1, projectTitleRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Project Title</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, categoryRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Category</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, styleThemeRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Style/Theme</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, taglineRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Tagline</button>
                        </div>
                      )}
                      {topMenuStep === 2 && s === 2 && step > 2 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => scrollToRef(descriptionRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Description</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => scrollToRef(highlightsRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Highlights</button>
                        </div>
                      )}
                    </div>
                    {index < 5 && (
                      <div className={`w-8 h-0.5 border-t-2 ${s < step ? 'border-blue-600' : 'border-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 flex items-start">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-gray-900 text-sm">Your highlights define what makes this product unique. Please review carefully.</p>
            </div>

            <div className="space-y-8">
              {/* Description Section */}
              <div ref={descriptionRef}>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Description <span className="text-red-500">*</span>
                </h3>
                <p className="text-gray-600 mb-4">Describe your product or service clearly, highlighting key features and benefits in detail.</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please write at least 500 Characters."
                  rows="6"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters minimum</p>
              </div>
              
              {/* Highlights Section */}
              <div ref={highlightsRef}>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Highlights <span className="text-red-500">*</span>
                </h3>
                <p className="text-gray-600 mb-4">Describe in 3-5 sentences what makes your activity unique and different from others. Highlight the special features or experiences that set it apart, so customers can easily compare and see why yours is the best choice.</p>
                
                <div className="space-y-4">
                  {highlights.map((highlight, index) => (
                    <div key={highlight.id} className="relative flex items-center gap-2">
                      <input
                        type="text"
                        value={highlight.text}
                        onChange={(e) => handleHighlightChange(highlight.id, e.target.value)}
                        placeholder="e.g., Churelto Pagoda and Lake Kawaguchi"
                        className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {highlights.length > 1 && (
                        <button
                          onClick={() => removeHighlight(highlight.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove highlight"
                        >
                          <FiX size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-right mt-4">
                  <button 
                    onClick={addHighlight}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add another highlight
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative flex items-center space-x-2"
                   onMouseLeave={() => setTopMenuStep(null)}>
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${s < step ? 'cursor-pointer' : 'cursor-not-allowed'}
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
                      onMouseEnter={() => { if (s < step) setTopMenuStep(s); }}
                      onClick={() => { if (s < step) setStep(s) }}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                      {topMenuStep === 1 && s === 1 && step > 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(1, projectTitleRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Project Title</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, categoryRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Category</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, styleThemeRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Style/Theme</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, taglineRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Tagline</button>
                        </div>
                      )}
                      {topMenuStep === 2 && s === 2 && step > 2 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(2, descriptionRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Description</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(2, highlightsRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Highlights</button>
                        </div>
                      )}
                    </div>
                    {index < 5 && (
                      <div className={`w-8 h-0.5 border-t-2 ${s < step ? 'border-blue-600' : 'border-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Information Banner */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 flex items-start">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-xs font-bold">①</span>
              </div>
              <p className="text-gray-900 text-sm">Upload at least 4 images to help customers visualize your activity and set clear expectations.</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Photos</h2>
            
            {/* Guidelines */}
            <div className="mb-8">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Upload 6+ high-quality photos you own, featuring real people and important details. Keep them bright, clear, and consistent to attract more visitors.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Avoid blurry, dark, or stock photos. Don't use screenshots, watermarks, collages, or edits that mislead customers.</span>
                </li>
              </ul>
            </div>

            {/* Upload Section */}
            <div className="mb-8">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/jpeg,image/png,image/svg+xml"
                multiple
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center mb-2"
              >
                <FiUpload className="mr-2" size={16} />
                Upload Photo
              </button>
              <p className="text-sm text-gray-600">Only JPG, PNG, SVG (2GB Max)</p>
            </div>

            {/* Cover Image Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cover Image</h3>
              
              {/* Image Field and Do/Don't Sections */}
              <div className="flex gap-6 mb-4">
                {/* Cover Image Field */}
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={handleCoverImageUpload}
                    accept="image/jpeg,image/png,image/svg+xml"
                    className="hidden"
                    id="cover-image-input"
                  />
                  {coverImage ? (
                    <div className="relative">
                      <img 
                        src={coverImage.url} 
                        alt="Cover"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={removeCoverImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                  ) : (
                    <label 
                      htmlFor="cover-image-input"
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-64 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                    >
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">Drag and drop your cover image here</p>
                      <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                    </div>
                    </label>
                  )}
                </div>

                {/* Do and Don't Sections */}
                <div className="w-80">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Do:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <FiCheckCircle className="text-green-600 mr-2" size={16} />
                          <span className="text-sm text-gray-700">Include 6+ photos</span>
                        </div>
                        <div className="flex items-center">
                          <FiCheckCircle className="text-green-600 mr-2" size={16} />
                          <span className="text-sm text-gray-700">Only use photos you own</span>
                        </div>
                        <div className="flex items-center">
                          <FiCheckCircle className="text-green-600 mr-2" size={16} />
                          <span className="text-sm text-gray-700">Add candid traveler photos</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Don't:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-red-600 mr-2 font-bold">✗</span>
                          <span className="text-sm text-gray-700">Screenshots, Watermarks, Collages</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-red-600 mr-2 font-bold">✗</span>
                          <span className="text-sm text-gray-700">Add blurry or dark photos</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowImageTipsModal(true)}
                        className="mt-3 text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                      >
                        Examples of great photos
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                You can also change cover image - Click on any photo below to set as cover
              </p>
              
              {/* Thumbnail Images - Dynamic based on uploaded photos */}
              <div className="flex flex-wrap gap-4">
                {/* Display uploaded photos */}
                {uploadedPhotos.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/svg+xml"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          replacePhoto(index, e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id={`replace-photo-${index}`}
                    />
                    <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden relative cursor-pointer">
                      <img 
                        src={photo.url} 
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-center">
                          <button
                            onClick={() => setCoverFromUploadedPhoto(index)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded mb-1 hover:bg-blue-700"
                          >
                            Set as Cover
                          </button>
                          <button
                            onClick={() => document.getElementById(`replace-photo-${index}`).click()}
                            className="px-3 py-1 bg-white text-gray-800 text-xs rounded mb-1 hover:bg-gray-100 block w-full"
                          >
                            Replace
                          </button>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 block w-full"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {/* Cover indicator */}
                      {coverImage && coverImage.id === photo.id && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Cover
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate w-32">{photo.name}</p>
                  </div>
                ))}
                
                {/* Add new image containers - up to 6 total */}
                {uploadedPhotos.length < 6 && [...Array(Math.min(3, 6 - uploadedPhotos.length))].map((_, index) => (
                  <div key={`add-${index}`}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/svg+xml"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id={`add-photo-${index}`}
                    />
                    <label
                      htmlFor={`add-photo-${index}`}
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                    >
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500">Add image</p>
                    </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Copyright Text */}
            <div className="text-xs text-gray-500 mb-8">
              <p>All images used in this content are protected by copyright. Unauthorized use, reproduction, or distribution of these images without prior permission is strictly prohibited. TripsAdora Supplier Agreement & TripsAdora's Terms of Use.</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative flex items-center space-x-2"
                   onMouseLeave={() => setTopMenuStep(null)}>
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${s < step ? 'cursor-pointer' : 'cursor-not-allowed'}
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
                      onMouseEnter={() => { if (s < step) setTopMenuStep(s); }}
                      onClick={() => { if (s < step) setStep(s) }}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                      {topMenuStep === 1 && s === 1 && step > 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(1, projectTitleRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Project Title</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, categoryRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Category</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, styleThemeRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Style/Theme</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, taglineRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Tagline</button>
                        </div>
                      )}
                      {topMenuStep === 2 && s === 2 && step > 2 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(2, descriptionRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Description</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(2, highlightsRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Highlights</button>
                        </div>
                      )}
                      {topMenuStep === 3 && s === 3 && step > 3 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(3, photosRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Add photos</button>
                        </div>
                      )}
                    </div>
                    {index < 5 && (
                      <div className={`w-8 h-0.5 border-t-2 ${s < step ? 'border-blue-600' : 'border-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 flex items-start">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-gray-900 text-sm">Set up your trip preferences to personalize your travel experience</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Preferences</h2>
            
            {/* Top Row - Guide & Activity Type and Language Cards */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Guide & Activity Type Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Guide & Activity Type</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSelectedGuideType('Driver')}
                        className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                          selectedGuideType === 'Driver' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Driver
                      </button>
                      <button 
                        onClick={() => setSelectedGuideType('Guide')}
                        className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                          selectedGuideType === 'Guide' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Guide
                      </button>
                      <button 
                        onClick={() => setSelectedGuideType('Both')}
                        className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                          selectedGuideType === 'Both' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Both
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Activity Type</h4>
                    <p className="text-gray-600 mb-3 text-sm">You can select either a shared option or a private/custom option.</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSelectedActivityType('Private')}
                        className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                          selectedActivityType === 'Private' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Private
                      </button>
                      <button 
                        onClick={() => setSelectedActivityType('Customised')}
                        className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                          selectedActivityType === 'Customised' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Customised
                      </button>
                      <button 
                        onClick={() => setSelectedActivityType('Shared')}
                        className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                          selectedActivityType === 'Shared' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Shared
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Language</h3>
                <p className="text-gray-600 mb-4 text-sm">Select the languages your tour guide will use during the trip.</p>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {['Arabic', 'French', 'English'].map((lang) => (
                    <button 
                        key={lang}
                        onClick={() => {
                          if (selectedLanguages.includes(lang)) {
                            setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                          } else {
                            setSelectedLanguages([...selectedLanguages, lang]);
                          }
                        }}
                      className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                          selectedLanguages.includes(lang)
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                        {lang}
                    </button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <select 
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !selectedLanguages.includes(e.target.value)) {
                          setSelectedLanguages([...selectedLanguages, e.target.value]);
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Mandarin Chinese">Mandarin Chinese</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                    <FiChevronDown 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                      size={20} 
                    />
                  </div>
                  
                  {selectedLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedLanguages.map((lang) => (
                        <div key={lang} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <span>{lang}</span>
                          <button
                            onClick={() => setSelectedLanguages(selectedLanguages.filter(l => l !== lang))}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <FiX size={14} />
                          </button>
                </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row - Accessibility & Comfort (Left) and Things to Carry + Included & Excluded (Right) */}
            <div className="grid grid-cols-2 gap-6">
              {/* Accessibility & Comfort Card - Left Side */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Accessibility & Comfort</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Wheelchair', key: 'wheelchair' },
                    { label: 'Service Animals', key: 'serviceAnimals' },
                    { label: 'Infant Seat', key: 'infantSeat' },
                    { label: 'Stroller', key: 'stroller' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <button
                        onClick={() => toggleAccessibility(item.key)}
                        className="relative w-10 h-5 focus:outline-none flex-shrink-0"
                      >
                        <div className={`w-10 h-5 rounded-full shadow-inner transition-colors ${
                          accessibilityToggles[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-0.5 transition-transform ${
                          accessibilityToggles[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Things to Carry and Included & Excluded Stacked */}
              <div className="space-y-6">
                {/* Things to Carry Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Things to Carry</h3>
                  <p className="text-gray-600 mb-4 text-sm">List the items travellers should bring for the trip.</p>
                  
                  <div className="relative">
                    <select 
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !selectedThingsToCarry.includes(e.target.value)) {
                          setSelectedThingsToCarry([...selectedThingsToCarry, e.target.value]);
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="">Select Items</option>
                      <option value="Camera">Camera</option>
                      <option value="Walking Shoes">Walking Shoes</option>
                      <option value="Weather Suitable Clothes">Weather Suitable Clothes</option>
                      <option value="Umbrella or Raincoat">Umbrella or Raincoat</option>
                      <option value="Camera/Smart Phone">Camera/Smart Phone</option>
                      <option value="Reusable Water Bottle">Reusable Water Bottle</option>
                      <option value="Snacks & Light Foods">Snacks & Light Foods</option>
                      <option value="Power Bank">Power Bank</option>
                    </select>
                    <FiChevronDown 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                      size={20} 
                    />
                  </div>
                  
                  {selectedThingsToCarry.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedThingsToCarry.map((item, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <span>{item}</span>
                          <button
                            onClick={() => setSelectedThingsToCarry(selectedThingsToCarry.filter((_, i) => i !== index))}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Included & Excluded Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Included & Excluded</h3>
                  <p className="text-gray-600 mb-4 text-sm">Add the things that are Included on the trip and those that are Excluded. (optional)</p>
                  
                  {(includedItems || excludedItems) ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                        <FiCheckCircle size={20} />
                        <span>Saved successfully!</span>
                      </div>
                      <button 
                        onClick={() => setShowIncludedExcludedModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium w-full"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                  <button 
                    onClick={() => setShowIncludedExcludedModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Click to add
                  </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
       case 6:
         return (
           <div>
             {/* Steps Indicator */}
             <div className="flex items-center justify-center mb-8">
               <div className="relative flex items-center space-x-2"
                    onMouseLeave={() => setTopMenuStep(null)}>
                 {[1, 2, 3, 4, 5, 6].map((s, index) => (
                   <React.Fragment key={s}>
                     <div
                       className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${s < step ? 'cursor-pointer' : 'cursor-not-allowed'}
                         ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
                       onMouseEnter={() => { if (s < step) setTopMenuStep(s); }}
                       onClick={() => { if (s < step) setStep(s) }}
                     >
                       {s < step ? <FiCheckCircle size={16} /> : s}
                       {topMenuStep === 1 && s === 1 && step > 1 && (
                         <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                           <button onClick={() => navigateToSection(1, projectTitleRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Project Title</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(1, categoryRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Category</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(1, styleThemeRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Style/Theme</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(1, taglineRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Tagline</button>
                         </div>
                       )}
                       {topMenuStep === 2 && s === 2 && step > 2 && (
                         <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                           <button onClick={() => navigateToSection(2, descriptionRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Description</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(2, highlightsRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Highlights</button>
                         </div>
                       )}
                       {topMenuStep === 3 && s === 3 && step > 3 && (
                         <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                           <button onClick={() => navigateToSection(3, photosRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Add photos</button>
                         </div>
                       )}
                       {topMenuStep === 4 && s === 4 && step > 4 && (
                         <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                           <button onClick={() => navigateToSection(4, guideActivityRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Guide & activity</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(4, languageRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Language</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(4, accessibilityRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Accessibility</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(4, thingsToCarryRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Things to carry</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(4, includedExcludedRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Included & excluded</button>
                         </div>
                       )}
                       {topMenuStep === 5 && s === 5 && step > 5 && (
                         <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                           <button onClick={() => navigateToSection(5, vehicleTitleRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Title to your Option</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(5, transportationRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Transportation</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(5, durationRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Total duration</button>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => navigateToSection(5, addVehicleRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Add new vehicle</button>
                         </div>
                       )}
                     </div>
                     {index < 5 && (
                       <div className={`w-8 h-0.5 border-t-2 ${s < step ? 'border-blue-600' : 'border-gray-300'}`}></div>
                     )}
                   </React.Fragment>
                 ))}
               </div>
             </div>

             {/* Header Section */}
             <div className="flex justify-between items-start mb-8">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Pick-up & Drop-off locations</h2>
                 <p className="text-gray-600">Select where you want to be picked-up and dropped-off for you activity</p>
               </div>
               <div className="relative">
                 <button 
                   onClick={() => setShowSelectLocationsDropdown(!showSelectLocationsDropdown)}
                   className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
                 >
                   <span className="text-gray-900">{selectedLocationType}</span>
                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </button>
                 
                 {/* Select Locations Dropdown */}
                 {showSelectLocationsDropdown && (
                   <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                     <div className="p-2">
                       {['All Location', 'Hotels only', 'Airports only', 'Seaports only'].map((option) => (
                         <label key={option} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                           <input
                             type="radio"
                             name="locationType"
                             value={option}
                             checked={selectedLocationType === option}
                             onChange={(e) => {
                               setSelectedLocationType(e.target.value);
                               setShowSelectLocationsDropdown(false);
                             }}
                             className="mr-3"
                           />
                           <span className="text-gray-700">{option}</span>
                         </label>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             </div>

             {/* Pick-up Locations Section */}
             <div className="mb-8">
              <div className="mb-4">
                <div className="flex items-center">
                 <FiSend className="text-blue-600 mr-3" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">Pick-up Points</h3>
                </div>
                <p className="text-sm text-gray-500 ml-9">Select specific pickup locations within your starting region</p>
               </div>
               
               {/* Search Field */}
               <div className="relative mb-4">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                 </div>
                 <input
                   type="text"
                   placeholder="Search Japan locations (e.g. Tokyo Station, Kyoto...)"
                   value={pickupSearchQuery}
                   onChange={(e) => {
                     setPickupSearchQuery(e.target.value);
                     setShowPickupDropdown(true);
                   }}
                   onFocus={() => setShowPickupDropdown(true)}
                   className="w-full pl-10 pr-10 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 />
                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
                 
                 {/* Real-time Pick-up Locations Dropdown */}
                 {showPickupDropdown && pickupSearchQuery.length >= 2 && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                     <div className="p-2 max-h-64 overflow-y-auto">
                       {filterLocations(pickupSearchQuery, selectedLocationType).length > 0 ? (
                         filterLocations(pickupSearchQuery, selectedLocationType).map((location, index) => (
                         <div 
                           key={index} 
                             className="p-3 hover:bg-blue-50 cursor-pointer text-gray-700 rounded flex items-center justify-between group"
                             onClick={() => addPickupLocation(location)}
                           >
                             <div className="flex items-center">
                               <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                               </svg>
                               <span>{location}</span>
                         </div>
                             <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">Click to add</span>
                           </div>
                         ))
                       ) : (
                         <div className="p-3 text-gray-500 text-center">
                           <p>No locations found for "{pickupSearchQuery}"</p>
                           <p className="text-xs mt-1">Try: Tokyo, Kyoto, Osaka, Mount Fuji...</p>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
               </div>

              {/* Selected Pickup Locations */}
              {selectedPickupLocations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Pick-up Locations:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPickupLocations.map((location, index) => {
                      const isActive = activePickupLocations.includes(location);
                      return (
                        <div 
                          key={index} 
                          onClick={() => togglePickupLocationActive(location)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                            isActive 
                              ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-md' 
                              : 'bg-blue-100 text-blue-800 border-2 border-transparent hover:bg-blue-200'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                         </svg>
                          <span>{location}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent onClick
                              removePickupLocation(location);
                            }}
                            className={`rounded-full p-0.5 ${
                              isActive ? 'hover:bg-blue-500' : 'hover:bg-blue-300'
                            }`}
                          >
                            <FiX size={14} />
                          </button>
                       </div>
                      );
                    })}
                     </div>
                   </div>
                 )}
               
              {/* Location Added Confirmation */}
              {showLocationAddedMessage && (
                <div className="mb-4 flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg">
                  <FiCheckCircle size={20} />
                  <span>Location added successfully!</span>
                   </div>
              )}

              {/* Map Section Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Find a location to select</h3>
                <p className="text-sm text-gray-600 mb-3">Select locations on the map or use the search above to find specific places in Japan</p>
              </div>

              {/* Map and Action buttons container */}
              <div className="flex gap-4">
                {/* Map Component */}
                <div className="flex-1 relative bg-gray-100 border border-gray-300 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
                      zoom={mapZoom}
                      onLoad={map => setMap(map)}
                      options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                        styles: []
                      }}
                    >
                      {/* Markers for selected pickup locations */}
                      {window.google && selectedPickupLocations.map((location, index) => {
                        const coords = getLocationCoordinates(location);
                        return coords ? (
                          <Marker
                            key={`pickup-${index}`}
                            position={coords}
                            label={{
                              text: "Free",
                              color: "#000",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}
                            icon={{
                              path: window.google.maps.SymbolPath.CIRCLE,
                              scale: 20,
                              fillColor: "#4F46E5",
                              fillOpacity: 0.9,
                              strokeColor: "#312E81",
                              strokeWeight: 2,
                            }}
                          />
                        ) : null;
                      })}
                      
                      {/* Markers for selected drop-off locations */}
                      {window.google && selectedDropoffLocations.map((location, index) => {
                        const coords = getLocationCoordinates(location);
                        return coords ? (
                          <Marker
                            key={`dropoff-${index}`}
                            position={coords}
                            label={{
                              text: "Free",
                              color: "#000",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}
                            icon={{
                              path: window.google.maps.SymbolPath.CIRCLE,
                              scale: 20,
                              fillColor: "#10B981",
                              fillOpacity: 0.9,
                              strokeColor: "#047857",
                              strokeWeight: 2,
                            }}
                          />
                        ) : null;
                      })}
                    </GoogleMap>
                 </div>

                 {/* Action buttons on the right */}
                 <div className="flex flex-col space-y-3 w-64">
                   <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-left text-sm">
                     <p className="font-medium mb-2">Instructions:</p>
                     <ul className="text-xs space-y-1 text-gray-600">
                       <li>• Type to search for any Japan location</li>
                       <li>• Click on results to add them</li>
                       <li>• Add multiple pick-up/drop-off areas</li>
                     </ul>
                   </div>
                   <button 
                     onClick={() => {
                       setPickupSearchQuery('');
                       setShowPickupDropdown(false);
                       document.querySelector('input[placeholder*="Search Japan"]').focus();
                     }}
                     className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                   >
                     Add another area
                   </button>
                 </div>
               </div>
             </div>

            {/* Manual Region Input Card - Editable From/To */}
            <div className="mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  {/* Left side - From/To editable inputs */}
                  <div className="flex-1 grid grid-cols-2 gap-8">
                    {/* From Region */}
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-semibold text-gray-900">From</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Starting region (e.g. Tokyo, Kyoto...)"
                        value={manualPickupRegion}
                        onChange={(e) => {
                          const value = e.target.value;
                          setManualPickupRegion(value);
                          
                          // Auto-detect region and show available pickup points
                          if (value.length >= 2) {
                            const detectedRegions = detectRegionsFromInput(value);
                            if (detectedRegions.length > 0) {
                              const region = detectedRegions.find(r => r.type === 'pickup' || r.type === 'both');
                              if (region && region.locations.length > 0) {
                                setSelectedPickupLocations(region.locations);
                                console.log('📍 Detected start region:', region.region, '→', region.locations.length, 'pickup points available');
                              }
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      {manualPickupRegion && selectedPickupLocations.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {selectedPickupLocations.length} pickup points available in this region
                        </p>
                      )}
                    </div>

                    {/* To Region */}
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-semibold text-gray-900">To</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Ending region (e.g. Mount Fuji, Osaka...)"
                        value={manualDropoffRegion}
                        onChange={(e) => {
                          const value = e.target.value;
                          setManualDropoffRegion(value);
                          
                          // Auto-detect region and show available drop-off points
                          if (value.length >= 2) {
                            const detectedRegions = detectRegionsFromInput(value);
                            if (detectedRegions.length > 0) {
                              const region = detectedRegions.find(r => r.type === 'dropoff' || r.type === 'both');
                              if (region && region.locations.length > 0) {
                                setSelectedDropoffLocations(region.locations);
                                console.log('📍 Detected end region:', region.region, '→', region.locations.length, 'drop-off points available');
                              }
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      {manualDropoffRegion && selectedDropoffLocations.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {selectedDropoffLocations.length} drop-off points available in this region
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side - Distance and Time badges */}
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-medium">
                      Distance: ~300-350 km
                    </div>
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-medium">
                      About: ~2 to 3 hours
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Define your tour route regions - pickup and drop-off points will be available within these areas
                  </p>
                 </div>
               </div>
             </div>

             {/* Use Same Pick-up Toggle */}
             <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
               <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-1">Use same pick-up location for drop-off</h3>
                   <p className="text-sm text-gray-600">We will detect your location automatically</p>
                 </div>
                 <div className="relative">
                   <button
                     onClick={() => setUseSamePickupLocation(!useSamePickupLocation)}
                     className={`relative w-12 h-6 rounded-full shadow-inner transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                       useSamePickupLocation ? 'bg-blue-600' : 'bg-gray-300'
                     }`}
                   >
                     <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                       useSamePickupLocation ? 'left-6' : 'left-0.5'
                     }`}></div>
                   </button>
                 </div>
               </div>
             </div>

             {/* Drop-off Locations Search Section */}
             {!useSamePickupLocation && (
             <div className="mb-8">
              <div className="mb-4">
                <div className="flex items-center">
                  <FiMapPin className="text-blue-600 mr-2" size={20} />
                  <h3 className="text-lg font-bold text-gray-900">Drop-off Points</h3>
                </div>
                <p className="text-sm text-gray-500 ml-9">Select specific drop-off locations within your ending region</p>
               </div>
               
               <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                 </div>
                 <input
                   type="text"
                   placeholder="Search or enters drop-off locations"
                     value={dropoffSearchQuery}
                     onChange={(e) => {
                       setDropoffSearchQuery(e.target.value);
                       setShowDropoffDropdown(true);
                     }}
                     onFocus={() => setShowDropoffDropdown(true)}
                     className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   />
                   <button className="absolute inset-y-0 right-0 pr-4 flex items-center">
                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                   </button>
                 
                   {/* Real-time Dropdown Results */}
                   {showDropoffDropdown && dropoffSearchQuery.length >= 2 && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                     <div className="p-2 max-h-64 overflow-y-auto">
                         {filterLocations(dropoffSearchQuery, selectedLocationType).length > 0 ? (
                           filterLocations(dropoffSearchQuery, selectedLocationType).map((location, index) => (
                         <div 
                           key={index} 
                               className="p-3 hover:bg-blue-50 cursor-pointer text-gray-700 rounded flex items-center justify-between group"
                               onClick={() => addDropoffLocation(location)}
                             >
                               <div className="flex items-center">
                                 <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                 </svg>
                                 <span>{location}</span>
                         </div>
                               <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100">Click to add</span>
                     </div>
                           ))
                         ) : (
                           <div className="p-3 text-gray-500 text-center">
                             <p>No locations found for "{dropoffSearchQuery}"</p>
                             <p className="text-xs mt-1">Try: Tokyo, Kyoto, Osaka, Mount Fuji...</p>
                   </div>
                 )}
               </div>
                     </div>
                   )}
                 </div>
                 
                {/* Selected Drop-off Locations */}
                {selectedDropoffLocations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Drop-off Locations:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDropoffLocations.map((location, index) => {
                        const isActive = activeDropoffLocations.includes(location);
                        return (
                          <div 
                            key={index} 
                            onClick={() => toggleDropoffLocationActive(location)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                              isActive 
                                ? 'bg-green-600 text-white border-2 border-green-700 shadow-md' 
                                : 'bg-green-100 text-green-800 border-2 border-transparent hover:bg-green-200'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{location}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent onClick
                                removeDropoffLocation(location);
                              }}
                              className={`rounded-full p-0.5 ${
                                isActive ? 'hover:bg-green-500' : 'hover:bg-green-300'
                              }`}
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
             </div>
             )}

             {/* Pick-up Time Section */}
             <div className="mb-8">
               <div className="bg-white border border-gray-200 rounded-lg p-6">
                 {/* Header with Clock Icon and Starting Date */}
                 <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center">
                     <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">Pick-up time</h3>
                   </div>
                   <div className="relative">
                     <button 
                       onClick={() => setShowCalendar(!showCalendar)}
                       className="bg-gray-100 rounded-lg px-3 py-2 flex items-center space-x-2 hover:bg-gray-200 transition-colors"
                     >
                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       <span className="text-gray-700 font-medium">Starting date: {selectedDate}</span>
                     </button>
                     
                     {/* Calendar Popup */}
                     {showCalendar && (
                       <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-4 w-80">
                         {/* Calendar Header */}
                         <div className="flex items-center justify-between mb-4">
                           <button 
                             onClick={() => navigateMonth(-1)}
                             className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                           >
                             <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                             </svg>
                           </button>
                           
                           <div className="flex flex-col items-center space-y-1">
                             <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                               {currentMonth.getFullYear()}
                             </div>
                             <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                               {currentMonth.toLocaleString('default', { month: 'long' })}
                             </div>
                           </div>
                           
                           <button 
                             onClick={() => navigateMonth(1)}
                             className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                           >
                             <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                             </svg>
                           </button>
                         </div>
                         
                         {/* Calendar Grid */}
                         <div className="grid grid-cols-8 gap-1">
                           {/* Week Numbers Column */}
                           <div className="flex flex-col space-y-1">
                             {[36, 37, 38, 39, 40, 41].map((week) => (
                               <div key={week} className="h-8 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                 {week}
                               </div>
                             ))}
                           </div>
                           
                           {/* Calendar Days */}
                           <div className="col-span-7">
                             {/* Day Headers */}
                             <div className="grid grid-cols-7 gap-1 mb-1">
                               {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                                 <div key={day} className="h-6 text-xs font-medium text-gray-500 flex items-center justify-center">
                                   {day}
                                 </div>
                               ))}
                             </div>
                             
                             {/* Calendar Days Grid */}
                             <div className="grid grid-cols-7 gap-1">
                               {getCalendarDays().map((day, index) => {
                                 const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                                 const isSelected = formatDate(day) === selectedDate;
                                 const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                 
                                 return (
                                   <button
                                     key={index}
                                     onClick={() => handleDateSelect(day)}
                                     className={`h-8 w-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                                       isSelected 
                                         ? 'bg-blue-600 text-white' 
                                         : isWeekend && isCurrentMonth
                                         ? 'text-blue-600 hover:bg-blue-50'
                                         : isCurrentMonth
                                         ? 'text-gray-900 hover:bg-gray-100'
                                         : 'text-gray-400 hover:bg-gray-50'
                                     }`}
                                   >
                                     {day.getDate()}
                                   </button>
                                 );
                               })}
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
                 
                 {/* Instructional Text */}
                 <p className="text-gray-600 mb-6">Please specify the exact time you will be available to pick up your customer from the designated location.</p>
                 
                 {/* Time Input Section */}
                 <div className="flex justify-between items-end mb-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-3">Time to Pick-up</label>
                     <div className="flex items-center space-x-3">
                       <div className="relative">
                         <select
                           value={selectedPickupHour}
                           onChange={(e) => setSelectedPickupHour(e.target.value)}
                           className="w-16 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-6"
                         >
                           {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((hour) => (
                             <option key={hour} value={hour}>{hour}</option>
                           ))}
                         </select>
                         <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                           <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                         </div>
                       </div>
                       <span className="text-gray-500 font-medium">Hours</span>
                       
                       <div className="relative ml-4">
                         <select
                           value={selectedPickupMinute}
                           onChange={(e) => setSelectedPickupMinute(e.target.value)}
                           className="w-16 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-6"
                         >
                           {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((minute) => (
                             <option key={minute} value={minute}>{minute}</option>
                           ))}
                         </select>
                         <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                           <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                         </div>
                       </div>
                       <span className="text-gray-500 font-medium">Minutes</span>
                       
                      <button 
                        onClick={() => setShowSelectVehicleModal(true)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        {selectedVehicleForTour ? 'Change Vehicle' : 'Select Vehicle'}
                       </button>
                     </div>
                   </div>
                   
                  <div>
                   <button 
                      onClick={addVehicleTimeAllocation}
                      className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                   >
                      Add new time
                   </button>
                    {selectedVehicleForTour && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <FiCheckCircle className="text-green-600" size={16} />
                          <span className="font-semibold text-green-900">Vehicle Selected:</span>
                          <span className="text-green-700">{selectedVehicleForTour.title}</span>
                        </div>
                      </div>
                    )}
                  </div>
                 </div>
               </div>

               {/* Gap between Pick-up time container and below content */}
               <div className="mb-8"></div>

              {/* Display Vehicle-Time Allocations */}
              {vehicleTimeAllocations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Allocated Time Slots</h3>
                  <div className="space-y-3">
                    {vehicleTimeAllocations.map((allocation) => (
                      <div 
                        key={allocation.id} 
                        className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                            <FiClock className="text-blue-600" size={24} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-bold text-gray-900">{allocation.time}</span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {allocation.date}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-sm text-gray-600 font-medium">{allocation.vehicle.title}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{allocation.vehicle.attributes}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">Max {allocation.vehicle.capacity} travelers</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeVehicleTimeAllocation(allocation.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove allocation"
                        >
                          <FiX size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

               {/* Checkbox and Week Days */}
               <div className="flex items-center space-x-4 mb-6">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={applyToAllDays}
                    onChange={(e) => setApplyToAllDays(e.target.checked)}
                    className="mr-2 w-4 h-4 text-blue-600 bg-blue-600 border-blue-600 rounded cursor-pointer" 
                  />
                   <span className="text-sm text-gray-700">Apply the same for all days</span>
                 </label>
                 
                 <div className="relative">
                   <select 
                     value={selectedWeekDay}
                     onChange={(e) => setSelectedWeekDay(e.target.value)}
                     className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-8"
                   >
                     <option value="week days">week days</option>
                     <option value="Monday">Monday</option>
                     <option value="Tuesday">Tuesday</option>
                     <option value="Wednesday">Wednesday</option>
                     <option value="Thursday">Thursday</option>
                     <option value="Friday">Friday</option>
                     <option value="Saturday">Saturday</option>
                     <option value="Sunday">Sunday</option>
                   </select>
                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </div>
                 </div>
               </div>

              {/* Auto Intervals Container - Full Width */}
              <div className="mb-8 flex justify-center">
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 w-full max-w-xl">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <input
                     type="time"
                     value={startTime}
                     onChange={(e) => setStartTime(e.target.value)}
                     className="w-32 px-3 py-2 bg-white border border-gray-300 rounded text-center text-sm"
                    />
                    <span className="text-gray-500 text-sm">and</span>
                    <input
                     type="time"
                     value={endTime}
                     onChange={(e) => setEndTime(e.target.value)}
                     className="w-32 px-3 py-2 bg-white border border-gray-300 rounded text-center text-sm"
                    />
                         </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed text-center">You can add starting and ending time with the auto intervals of time.</p>
                <div className="flex items-center justify-center gap-3">
                   <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    max="720"
                    placeholder="30"
                     className="w-24 px-3 py-2 bg-white border border-gray-300 rounded text-center text-sm flex-shrink-0"
                   />
                   <p className="text-xs text-gray-600 leading-relaxed">Duration between the time in minutes.</p>
                 </div>
                     </div>
                   </div>

              {/* Time Slots Section - Dynamic for all weekdays */}
              <div className="space-y-6">
                {Object.keys(timeSlots).map((day) => (
                  Array.isArray(timeSlots[day]) && timeSlots[day].length > 0 && (
                    <div key={day}>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">{day}</h4>
                     <div className="grid grid-cols-5 gap-2">
                        {timeSlots[day].map((time, index) => (
                         <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-sm">
                           <span className="text-gray-700">{time}</span>
                            <button 
                              onClick={() => {
                                setTimeSlots(prev => ({
                                  ...prev,
                                  [day]: prev[day].filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>
                  )
                ))}
                
                {/* Show message if no slots configured yet */}
                {Object.values(timeSlots).every(slots => !Array.isArray(slots) || slots.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 italic">
                      Select a weekday, then set start time, end time, and duration to generate time slots
                    </p>
                     </div>
                )}
                
                {Array.isArray(itineraries) && itineraries.length > 0 && (
                  <div className="mt-10 border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Itinerary Stops</h3>
                    <div className="space-y-4">
                      {itineraries.map((stop, index) => (
                        <div
                          key={stop.id || index}
                          className="flex items-start space-x-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                              {(stop.time && String(stop.time).trim()) || `#${index + 1}`}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-bold text-gray-900">
                                {stop.title || stop.placeName || stop.location || `Stop ${index + 1}`}
                              </h4>
                              {stop.isFree !== undefined && (
                                <span className={`ml-3 rounded-full px-3 py-1 text-xs font-semibold ${stop.isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {stop.isFree ? 'Free' : 'Paid'}
                                </span>
                              )}
                            </div>
                            {stop.description && (
                              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{stop.description}</p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              {stop.timeSpent && (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1">
                                  <FiClock className="mr-1" size={12} />
                                  {stop.timeSpent}
                                </span>
                              )}
                              {stop.attractionType && (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1">
                                  <FiMapPin className="mr-1" size={12} />
                                  {stop.attractionType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
               </div>
             </div>

             {/* Select Vehicle Modal */}
             {showSelectVehicleModal && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                 <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                   {/* Modal Header */}
                   <div className="p-6 border-b border-gray-200 relative sticky top-0 bg-white z-10">
                     <h2 className="text-lg font-semibold text-gray-900">Select Vehicle</h2>
                     <p className="text-sm text-gray-600 mt-1">Choose a vehicle from your existing vehicles. To edit or delete vehicles, go back to the vehicle form section.</p>
                     
                     {/* Close Button */}
                     <button
                       onClick={() => setShowSelectVehicleModal(false)}
                       className="absolute top-6 right-6 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full"
                     >
                       <FiX className="w-4 h-4 text-gray-400" />
                     </button>
                   </div>

                   {/* Modal Content - List of Saved Vehicles */}
                   <div className="p-6">
                     {/* Load all existing vehicles from database */}
                     {(() => {
                       // Use vehicles loaded from database (same as "Existing Vehicle Options")
                       const availableVehicles = vehicles;
                         
                       if (vehiclesLoading) {
                         return (
                           <div className="text-center py-12">
                             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                               <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                               </svg>
                             </div>
                             <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Vehicles...</h3>
                           </div>
                         );
                       }

                       if (availableVehicles.length === 0) {
                         return (
                           <div className="text-center py-12">
                             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                               </svg>
                             </div>
                             <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicles Available</h3>
                             <p className="text-gray-600 mb-4">You haven't added any vehicles yet. Please add a vehicle option first in the form above.</p>
                             <button
                               onClick={() => setShowSelectVehicleModal(false)}
                               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                             >
                               Close
                             </button>
                           </div>
                         );
                       }
                       
                       return (
                         <div className="space-y-3">
                           {availableVehicles.map((vehicle, index) => {
                             const isSelected = selectedVehicleForTour?.id === vehicle.id || 
                                               (selectedVehicleForTour && selectedVehicleForTour.title === vehicle.title);
                             return (
                               <div 
                                 key={vehicle.id || `vehicle-${index}`}
                                 className={`rounded-lg p-4 cursor-pointer transition-all ${
                                   isSelected 
                                     ? 'bg-blue-50 border-2 border-blue-600' 
                                     : 'bg-gray-50 border border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                                 }`}
                                 onClick={() => {
                                   setSelectedVehicleForTour(vehicle);
                                   setShowSelectVehicleModal(false);
                                 }}
                               >
                                 <div className="flex justify-between items-start">
                                   <div className="flex-1">
                                     <div className="flex items-baseline mb-1">
                                       <div className="flex items-center">
                                         <h3 className="text-lg font-bold text-gray-900">{vehicle.title || 'Untitled Vehicle'}</h3>
                                         {isSelected && (
                                           <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                                             <FiCheckCircle className="mr-1" size={14} />
                                             Selected
                                           </span>
                                         )}
                                       </div>
                                     </div>
                                     <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                                       {vehicle.attributes && <span className="italic">{vehicle.attributes}</span>}
                                       {vehicle.year && <span>{vehicle.year}</span>}
                                       {Number.isFinite(parseInt(vehicle.capacity)) && (
                                         <span>Best for upto <span className="text-blue-600 font-medium">{String(parseInt(vehicle.capacity)).padStart(2, '0')}</span></span>
                                       )}
                                       {vehicle.duration && (
                                         <span>Approximate time <span className="text-blue-600 font-medium">{vehicle.duration}</span></span>
                                       )}
                                     </div>
                                     {vehicle.description && (
                                       <p className="text-xs text-gray-500 leading-relaxed mb-2">
                                         {vehicle.description}
                                       </p>
                                     )}
                                     <div className="flex items-center space-x-2 text-sm">
                                       <span className="font-semibold text-blue-600">{vehicle.currency || '$'} {vehicle.amount || '0'}</span>
                                       <span className="text-gray-400">•</span>
                                       <span className="text-gray-600">{vehicle.pricingType || 'Per Group'}</span>
                                     </div>
                                   </div>
                                   <div className="text-right ml-4">
                                     <div className="text-lg font-bold text-blue-600">{vehicle.currency || '$'} {vehicle.amount || '0'}</div>
                                     <div className="text-xs text-gray-500">{vehicle.pricingType || 'Per Group'}</div>
                                   </div>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       );
                     })()}
                   </div>

                   {/* Modal Footer */}
                   <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                     <div className="flex items-center gap-3">
                       <button
                         onClick={() => {
                           setSelectedVehicleForTour(null);
                           setShowSelectVehicleModal(false);
                         }}
                         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                       >
                         Cancel
                       </button>
                       {selectedVehicleForTour && (
                         <button
                           onClick={() => {
                             // Confirm the selection and close modal
                             console.log('Confirmed vehicle:', selectedVehicleForTour);
                             setShowSelectVehicleModal(false);
                           }}
                           className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                         >
                           Confirm Selection
                         </button>
                       )}
                       </div>
                   </div>
                 </div>
               </div>
             )}


           </div>
         );
       case 5:
         return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative flex items-center space-x-2"
                   onMouseLeave={() => setTopMenuStep(null)}>
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${s < step ? 'cursor-pointer' : 'cursor-not-allowed'}
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
                      onMouseEnter={() => { if (s < step) setTopMenuStep(s); }}
                      onClick={() => { if (s < step) setStep(s) }}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                      {topMenuStep === 1 && s === 1 && step > 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(1, projectTitleRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Project Title</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, categoryRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Category</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, styleThemeRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Style/Theme</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(1, taglineRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Tagline</button>
                        </div>
                      )}
                      {topMenuStep === 2 && s === 2 && step > 2 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(2, descriptionRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Description</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(2, highlightsRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Highlights</button>
                        </div>
                      )}
                      {topMenuStep === 3 && s === 3 && step > 3 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(3, photosRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Add photos</button>
                        </div>
                      )}
                      {topMenuStep === 4 && s === 4 && step > 4 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 pt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                          <button onClick={() => navigateToSection(4, guideActivityRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Guide & activity</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(4, languageRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Language</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(4, accessibilityRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Accessibility</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(4, thingsToCarryRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Things to carry</button>
                          <div className="border-t border-gray-100" />
                          <button onClick={() => navigateToSection(4, includedExcludedRef)} className="w-full text-center px-3 py-2 hover:bg-gray-50 text-sm text-gray-700">Included & excluded</button>
                        </div>
                      )}
                    </div>
                    {index < 5 && (
                      <div className={`w-8 h-0.5 border-t-2 ${s < step ? 'border-blue-600' : 'border-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Information Banner */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 flex items-start">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-gray-900 text-sm">Fill in the details to set up your option</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle & Pricing</h2>
            
            <div className="space-y-8">
              {/* Title Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Title to your Option
                  {editingVehicleId && (
                    <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Editing</span>
                  )}
                </h3>
                <input
                  type="text"
                  placeholder="Enter option title"
                  value={vehicleTitle}
                  onChange={(e) => setVehicleTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Vehicle Details Grid */}
              <div>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Row 1 */}
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Transportation Type</label>
                     <div className="relative">
                     <select 
                       className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-10"
                       value={selectedVehicleType}
                       onChange={(e) => handleVehicleTypeChange(e.target.value)}
                         required
                     >
                       <option value="">Select Vehicle</option>
                       <option value="van">Van</option>
                       <option value="car">Car</option>
                       <option value="bus">Bus</option>
                     </select>
                       <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                       </div>
                     </div>
                   </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Make & Variant</label>
                    <div className="relative">
                    <select 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-10"
                      value={selectedVehicleModel}
                      onChange={(e) => setSelectedVehicleModel(e.target.value)}
                      disabled={!selectedVehicleType}
                        required
                    >
                      <option value="">Select Variant</option>
                      {getVehicleModels().map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                      </div>
                     </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Model of vehicle (optional)</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-10"
                        value={vehicleYear}
                        onChange={(e) => setVehicleYear(e.target.value)}
                      >
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                      <option value="2020">2020</option>
                        <option value="2018">2018</option>
                        <option value="2015">2015</option>
                    </select>
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                      </div>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Row 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Vehicle Attributes</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-10"
                        value={vehicleAttributes}
                        onChange={(e) => setVehicleAttributes(e.target.value)}
                        required
                      >
                        <option value="">Select Attributes</option>
                      <option>Comfort 1.2x</option>
                      <option>Economy 1x</option>
                      <option>Premium 1.5x</option>
                      <option>Automatic Transmission 1.1x</option>
                      <option>Manual Transmission 1.1x</option>
                      <option>Hybrid 1.3x</option>
                      <option>Electric 1.4x</option>
                    </select>
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                      </div>
                     </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Number of travellers</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-10"
                        value={numTravellers}
                        onChange={(e) => setNumTravellers(e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                      <option>01</option>
                      <option>02</option>
                        <option>03</option>
                      <option>04</option>
                        <option>05</option>
                        <option>06</option>
                        <option>07</option>
                        <option>08</option>
                    </select>
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                      </div>
                     </div>
                    <div className="flex items-start mt-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm text-gray-600">Choose the number of traveler which will be best for Trip.</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Currency</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-10"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        required
                      >
                        <option value="">Select Currency</option>
                      <option>$ US Dollar</option>
                      <option>€ Euro</option>
                      <option>¥ Japanese Yen</option>
                      <option>Rs Pakistani Rupee</option>
                    </select>
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                      </div>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Row 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Pricing Type</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-10"
                        value={pricingType}
                        onChange={(e) => setPricingType(e.target.value)}
                        required
                      >
                        <option value="">Select Type</option>
                      <option>Per Group</option>
                      <option>Per Person</option>
                      <option>Shared</option>
                      <option>Hourly Rate</option>
                    </select>
                      <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                      </div>
                     </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Enter the amount of your product</label>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={productAmount}
                      onChange={(e) => setProductAmount(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex flex-col justify-end">
                    <div className="text-sm text-gray-600 mb-1">
                      <p>20% Commission will charge per product according to your vehicle</p>
                      <p className="font-semibold">$40 You will receive after commission</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Duration and Description */}
              <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-900 mb-2">Total duration</label>
                   <p className="text-sm text-gray-600 mb-3">Specify how long the car will be available for your trip.</p>
                   <div className="relative">
                     <select 
                       className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-10"
                       value={totalDuration}
                       onChange={(e) => setTotalDuration(e.target.value)}
                       required
                     >
                       <option value="">Select Duration</option>
                     <option>1h</option>
                     <option>2h</option>
                     <option>3h</option>
                     <option>4h</option>
                     <option>5h</option>
                     <option>6h</option>
                     <option>7h</option>
                       <option>8h</option>
                     <option>9h</option>
                     <option>10h</option>
                     <option>11h</option>
                     <option>12h</option>
                     <option>13h</option>
                     <option>14h</option>
                     <option>15h</option>
                     <option>16h</option>
                     <option>17h</option>
                     <option>18h</option>
                       <option>Full Day</option>
                   </select>
                     <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                     </div>
                   </div>
                 </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    placeholder="Enter vehicle description..."
                    value={vehicleDescription}
                    onChange={(e) => setVehicleDescription(e.target.value)}
                    rows="4"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex gap-3 mt-3">
                    <button 
                      onClick={saveVehicleOption}
                      disabled={vehicleSaving}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${vehicleSaving ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {vehicleSaving ? 'Saving...' : editingVehicleId ? 'Update' : 'Save'}
                  </button>
                    {editingVehicleId && (
                      <button 
                        onClick={clearVehicleForm}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Existing Vehicle Options */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Existing Vehicle Options</h3>
                
                {vehicleError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                    {vehicleError}
                  </div>
                )}

                {vehiclesLoading ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                    Loading vehicles...
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500">No vehicles added yet. Click "Select Vehicle" above to add your first vehicle.</p>
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {vehicle.title || (vehicle.type && vehicle.model ? `${vehicle.type} - ${vehicle.model.replace('-', ' ')}` : 'Vehicle')}
                          </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            {vehicle.attributes && <span>{vehicle.attributes}</span>}
                            {vehicle.year && <span>{vehicle.year}</span>}
                            {typeof vehicle.capacity === 'number' && !Number.isNaN(vehicle.capacity) && (
                              <span>Best for upto {vehicle.capacity}</span>
                            )}
                            {vehicle.duration && <span>Approximate time {vehicle.duration}</span>}
                      </div>
                          {vehicle.description && (
                            <p className="text-sm text-gray-700 mb-2">
                              {vehicle.description}
                            </p>
                          )}
                          {(vehicle.currency || vehicle.amount) && (
                            <div className="flex items-center space-x-4 text-sm mt-3">
                              <span className="font-semibold text-blue-600">{vehicle.currency || '$'} {vehicle.amount || '0'}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600">{vehicle.pricingType}</span>
                            </div>
                          )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                          <button 
                            onClick={() => editVehicleOption(vehicle)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit vehicle"
                          >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                          <button 
                            onClick={() => deleteVehicle(vehicle.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete vehicle"
                          >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold text-black mb-4">Step {step}</h2>
            <p className="text-gray-600">Content for step {step}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
      {/* Top Navigation Bar */}
      <div className="w-[95vw] max-w-7xl bg-white rounded-t-lg border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <img 
            src="/assets/logo.jpg" 
            alt="TripsAdora Logo" 
            className="h-8 w-auto"
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-b-lg shadow-2xl w-[95vw] h-[85vh] max-w-7xl flex overflow-hidden">
        {/* Left Sidebar - Progress Indicator */}
        <div className="w-1/3 relative overflow-hidden rounded-bl-lg">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/assets/WhatsApp Image 2025-10-13 at 4.19.02 PM.jpeg')`,
              filter: 'blur(2px)'
            }}
          />
          
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col">
            <div className="text-center mb-12">
              <h1 className="text-2xl font-bold text-gray-800 mb-8">
                {step === 1 ? 'Create your Product' : 
                 step === 2 ? 'Add highlights & Description' :
                 step === 3 ? 'Add Photos' :
                 step === 4 ? 'Trip Details' :
                 step === 5 ? 'Vehicle & Pricing' :
                 step === 6 ? 'Pick-up & Drop-off' : 'Create your Product'}
              </h1>
            </div>
            
            {/* Progress Steps - Vertical List - Centered */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-6">
                {[1, 2, 3, 4, 5, 6].map((stepNumber, index) => (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2
                        ${stepNumber === step
                          ? 'bg-blue-600 text-white border-blue-600'
                          : stepNumber < step
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-gray-800 text-gray-800'}`}
                    >
                      {stepNumber < step ? <FiCheckCircle size={16} /> : ''}
                    </div>
                    {index < 5 && (
                      <div className={`w-0.5 h-6 mt-2 ${stepNumber < step ? 'bg-blue-600' : 'bg-gray-800'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {renderStepContent()}
            </div>
          </div>

           {/* Navigation Buttons */}
           <div className="bg-white border-t border-gray-200 px-8 py-6">
             <div className="max-w-4xl mx-auto flex justify-end space-x-4">
               {step === 6 ? (
                <>
                  <button
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white transition-colors"
                  >
                    Back
                  </button>
                 <button
                   onClick={onClose}
                   className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white transition-colors"
                 >
                   Cancel
                 </button>
                </>
               ) : (
                 <button
                   onClick={prevStep}
                   className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white transition-colors"
                 >
                   Back
                 </button>
               )}
               
               <button
                 onClick={step < 6 ? nextStep : () => {
                   setShowItineraryComponent(true);
                 }}
                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 {step < 6 ? 'Continue' : 'Confirm Location & Time'}
               </button>
             </div>
           </div>
        </div>
      </div>

      {/* Image Tips Modal */}
      {showImageTipsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[75vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Images Tips</h2>
              <button
                onClick={() => setShowImageTipsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-gray-700 mb-6">Upload clean, non-blurry images</p>

            {/* Example Images */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <img 
                    src="/assets/5e20accba877ebca3f7fd7f0a8f642697330bd69.png" 
                    alt="Clear example" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <FiCheckCircle className="text-green-600 mr-2" size={18} />
                  <span className="text-base text-gray-700 font-medium">Clear, sharp image</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <img 
                    src="/assets/WhatsApp Image 2025-10-13 at 4.19.02 PM.jpeg" 
                    alt="Blurry example" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-red-600 mr-2 font-bold text-lg">✗</span>
                  <span className="text-base text-gray-700 font-medium">Blurry, unclear image</span>
                </div>
              </div>
            </div>

            {/* Modal Navigation Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowImageTipsModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setShowImageTipsModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Included & Excluded Modal */}
      {showIncludedExcludedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setShowIncludedExcludedModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX size={24} />
            </button>
            
            {/* Modal Content */}
            <div className="space-y-6">
              {/* What's Included Section */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">What's Included</h2>
                <p className="text-gray-600 text-sm mb-4">Clearly list everything covered in the price so customers know exactly what they'll receive.</p>
                <textarea
                  value={includedItems}
                  onChange={(e) => setIncludedItems(e.target.value)}
                  placeholder="Clearly list the services or items covered in the price, such as entry tickets, meals, or equipment, so customers know exactly what they're paying for."
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* What's Excluded Section */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">What's Excluded</h2>
                <p className="text-gray-600 text-sm mb-4">Clearly list everything not covered in the price so customers know exactly what they'll receive.</p>
                <textarea
                  value={excludedItems}
                  onChange={(e) => setExcludedItems(e.target.value)}
                  placeholder="Clearly list the services or items NOT covered in the price, such as entry tickets, meals, or equipment, so customers know exactly what they're paying for."
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSaveIncludedExcluded}
                  disabled={showSavedMessage}
                  className={`px-8 py-3 rounded-lg font-medium transition-all ${
                    showSavedMessage 
                      ? 'bg-green-600 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {showSavedMessage ? (
                    <span className="flex items-center gap-2">
                      <FiCheckCircle size={20} />
                      Saved!
                    </span>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Itinerary Component - Overlay */}
      {showItineraryComponent && (
        <AddItineraryComponent 
          onClose={() => {
            setShowItineraryComponent(false);
            onClose();
          }}
          onBack={() => setShowItineraryComponent(false)}
          currentItineraries={itineraries}
          onItinerariesChange={setItineraries}
          coverImage={coverImage}
          uploadedPhotos={uploadedPhotos}
          productData={{
            title: productTitle,
            category: productCategory,
            sellingPoints: sellingPoints,
            tagline: tagline,
            description: description,
            highlights: highlights.filter(h => h.text.trim() !== ''),
            guideType: selectedGuideType,
            activityType: selectedActivityType,
            languages: selectedLanguages,
            thingsToCarry: selectedThingsToCarry,
            includedItems: includedItems,
            excludedItems: excludedItems,
            accessibility: accessibilityToggles,
            // Vehicle data - pass only the selected vehicle as an array
            vehicles: selectedVehicleForTour ? [selectedVehicleForTour] : vehicles,
            // Vehicle form fields (for price extraction)
            productAmount: productAmount,
            currency: currency,
            pricingType: pricingType,
            // Location & Time data (now using arrays for multiple locations)
            pickupLocations: selectedPickupLocations,
            dropoffLocations: selectedDropoffLocations,
            pickupTime: `${selectedPickupHour}:${selectedPickupMinute}`,
            weekDay: selectedWeekDay,
            selectedDate: selectedDate,
            // Time slots for all days
            timeSlots: timeSlots,
            vehicleTimeAllocations: vehicleTimeAllocations,
            applyToAllDays: applyToAllDays,
            itineraries: itineraries,
            // Provide draftId so AddItineraryComponent can preload existing itineraries
            draftId: draftId,
            dbProductId: dbProductId || (draftId && draftId !== 'current_draft' ? draftId : null)
          }}
        />
      )}
    </div>
  );
};

export default CreateProductComponent;