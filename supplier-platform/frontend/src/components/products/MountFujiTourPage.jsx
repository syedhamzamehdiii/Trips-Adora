import React, { useState } from 'react';
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
  FiMenu,
  FiHome,
  FiArrowLeft,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import PublishProductModal from './PublishProductModal';
import ApplicationSubmittedPage from './ApplicationSubmittedPage';
import Footer from '@/components/common/Footer';
import productService from '@/services/productService';

const MountFujiTourPage = ({ coverImage, uploadedPhotos, productData, onBack }) => {
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [language, setLanguage] = useState('US English');
  const [currency, setCurrency] = useState('$ USD - US Dollar');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleSaveDraft = async () => {
    try {
      console.log('💾 Saving draft to database...');
      
      // Derive and normalize title from form state (support both title and productTitle)
      const normalizedTitle = (productData?.title || productData?.productTitle || '').trim();

      // Prepare product data for API (matching ProductCreate schema)
      const apiProductData = {
        title: normalizedTitle || 'Untitled Product',
        category: productData?.category || 'tour',
        tagline: productData?.tagline || '',
        description: productData?.description || 'No description provided',
        highlights: Array.isArray(productData?.highlights) ? productData.highlights.map(h => ({
          icon: h.icon || 'mountain',
          text: h.text || ''
        })) : [],
        images: [],
        hero_image: null,
        gallery_images: [],
        itinerary: Array.isArray(productData?.itineraries) ? productData.itineraries.map(item => ({
          time: item.time || '',
          title: item.title || '',
          description: item.description || '',
          icon: item.icon || 'sightseeing'
        })) : [],
        duration: productData?.duration || '',
        guide_type: productData?.guideType || '',
        activity_type: productData?.activityType || '',
        languages: Array.isArray(productData?.languages) ? productData.languages : [],
        things_to_carry: Array.isArray(productData?.thingsToCarry) ? productData.thingsToCarry : [],
        included_excluded: {
          included: Array.isArray(productData?.includedItems) ? productData.includedItems : 
                   (productData?.includedItems ? [productData.includedItems] : []),
          excluded: Array.isArray(productData?.excludedItems) ? productData.excludedItems : 
                   (productData?.excludedItems ? [productData?.excludedItems] : [])
        },
        accessibility: productData?.accessibility || {},
        vehicle_details: productData?.vehicles?.[0] ? {
          vehicle_type: productData.vehicles[0].type || 'car',
          vehicle_model: productData.vehicles[0].model || '',
          capacity: productData.vehicles[0].capacity || null
        } : null,
        pickup_dropoff: {
          pickup_location: productData?.pickupLocations?.[0] || '',
          dropoff_location: productData?.dropoffLocations?.[0] || '',
          pickup_time: productData?.pickupTime || '',
          available_days: productData?.weekDay ? [productData.weekDay] : [],
          available_time_slots: productData?.timeSlots ? Object.keys(productData.timeSlots) : []
        },
        price: parseFloat(productData?.vehicles?.[0]?.amount || 0),
        currency: 'USD',
        price_unit: 'Per Group',
        destination: productData?.destination || '',
        breadcrumb: productData?.breadcrumb || [],
        selling_points: Array.isArray(productData?.sellingPoints) ? productData.sellingPoints : 
                       (productData?.sellingPoints ? [productData.sellingPoints] : []),
        style_theme: productData?.styleTheme || '',
        faqs: []
      };

      // Validate title length (minimum 30 chars for database)
      if (!apiProductData.title || apiProductData.title.length < 30) {
        throw new Error('Title must be at least 30 characters to save as draft');
      }
      
      // Create product in database (will be auto-published, then we'll save as draft)
      const createdProduct = await productService.createProduct(apiProductData);
      const dbProductId = createdProduct.id;
      console.log('✅ Draft product created in database with ID:', dbProductId);
      
      // Save as draft (change status from published to draft)
      await productService.saveAsDraft(dbProductId);
      console.log('✅ Draft saved successfully!');
      
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
        coverImage: coverImage?.url || coverImage || productData?.coverImage?.url || productData?.coverImage || null,
        uploadedPhotos: (uploadedPhotos || productData?.uploadedPhotos || []).map(p => p.url || p).filter(Boolean),
        selectedGuideType: productData?.guideType || '',
        selectedActivityType: productData?.activityType || '',
        selectedLanguages: productData?.languages || [],
        selectedThingsToCarry: productData?.thingsToCarry || [],
        includedItems: productData?.includedItems || '',
        excludedItems: productData?.excludedItems || '',
        accessibilityToggles: productData?.accessibility || {},
        vehicles: productData?.vehicles || [],
        selectedVehicleForTour: productData?.vehicles || [],
        selectedPickupLocations: productData?.pickupLocations || [],
        selectedDropoffLocations: productData?.dropoffLocations || [],
        pickupTime: productData?.pickupTime || '',
        selectedWeekDay: productData?.weekDay || '',
        selectedDate: productData?.selectedDate || '',
        itineraries: productData?.itineraries || [],
        lastModified: new Date().toISOString()
      };
      
      // Save full draft data with images to localStorage
      localStorage.setItem(`product_draft_${dbProductId}`, JSON.stringify(fullDraftData));
      console.log('💾 Full draft data with images saved to localStorage:', `product_draft_${dbProductId}`);
      
      // Show success message
      alert('✅ Draft saved successfully!');
      
      // Navigate back or refresh
      setTimeout(() => {
        window.location.href = '/products/drafts';
      }, 500);
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      alert(`Error saving draft: ${error.message}`);
    }
  };

  const handlePublishProduct = async () => {
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
      const draftIdsToDelete = [];
      
      // Normalize title (support both title and productTitle)
      const publishTitle = (productData?.title || productData?.productTitle || '').trim();

      // Read original image data (no compression)
      const readAsDataURL = (file) => new Promise((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } catch (e) { resolve(null); }
      });

      // Build image URLs from either prop `uploadedPhotos` or draft data using original file/base64
      const rawPhotos = Array.isArray(uploadedPhotos) && uploadedPhotos.length
        ? uploadedPhotos
        : (Array.isArray(productData?.uploadedPhotos) ? productData.uploadedPhotos : []);

      const imageUrls = [];
      for (const p of rawPhotos) {
        if (!p) continue;
        if (typeof p === 'string') {
          imageUrls.push(p);
        } else if (p.url) {
          imageUrls.push(p.url);
        } else if (p.file) {
          const dataUrl = await readAsDataURL(p.file);
          if (dataUrl) imageUrls.push(dataUrl);
        }
      }

      // Cover image preference: prop coverImage > productData.coverImage > first image
      let heroImageUrl = null;
      if (coverImage) {
        if (typeof coverImage === 'string') heroImageUrl = coverImage;
        else if (coverImage.url) heroImageUrl = coverImage.url;
        else if (coverImage.file) heroImageUrl = await readAsDataURL(coverImage.file);
      }
      if (!heroImageUrl && productData?.coverImage) {
        const ci = productData.coverImage;
        if (typeof ci === 'string') heroImageUrl = ci;
        else if (ci.url) heroImageUrl = ci.url;
        else if (ci.file) heroImageUrl = await readAsDataURL(ci.file);
      }
      if (!heroImageUrl) heroImageUrl = imageUrls[0] || null;

      // Normalize category to backend enum values
      const normalizedCategory = (productData?.category || 'tour')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');

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

      // Helper to map photo objects/strings to URL strings
      function rawPixelsToUrls(arr){
        return (Array.isArray(arr) ? arr : []).map(p => typeof p === 'string' ? p : (p && p.url ? p.url : null)).filter(Boolean);
      }
      
      // Prepare product data for API (matching ProductCreate schema)
      const apiProductData = {
        title: publishTitle || 'Untitled Product',
        category: normalizedCategory,
        tagline: productData?.tagline || '',
        description: (productData?.description || '').toString(),
        highlights: Array.isArray(productData?.bHighlights || productData?.highlights)
          ? (productData?.highlights || []).map(h => ({
              icon: (h && h.icon) ? h.icon : 'mountain',
              text: (h && h.text) ? h.text : ''
            }))
          : [],
        images: imageUrls,
        hero_image: heroImageUrl || null,
        gallery_images: imageUrls.slice(1),
        itinerary: Array.isArray(productData?.itineraries)
          ? productData.itineraries.map(it => ({
              time: (it?.time && String(it.time).trim()) ? it.time : '09:00',
              title: (it?.title && String(it.title).trim()) ? it.title : 'Experience highlight',
              description: (it?.description || '').toString(),
              icon: (it?.lineIcon || it?.icon || 'sightseeing')
            }))
          : [],
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
          pickup_location: (productData?.pickupLocations && productData.pickupLocations[0]) ? String(productData.pickupLocations[0]) : '',
          dropoff_location: (productData?.dropoffLocations && productData.dropoffLocations[0]) ? String(productData.dropoffLocations[0]) : '',
          pickup_time: (productData?.pickupTime || '').toString(),
          available_days: availableDays,
          available_time_slots: productData?.timeSlots ? Object.keys(productData.timeSlots) : []
        },
        price: parseFloat(productData?.vehicles?.[0]?.amount ?? productData?.price ?? 0),
        currency: 'USD',
        price_unit: 'Per Group',
        destination: (productData?.destination || '').toString(),
        breadcrumb: Array.isArray(productData?.breadcrumb) ? productData.breadcrumb : [],
        selling_points: Array.isArray(productData?.sellingPoints) ? productData.sellingPoints : (productData?.sellingPoints ? [productData.sellingPoints] : []),
        style_theme: productData?.styleTheme || '',
        faqs: []
      };

      console.log('apiProductData ->', apiProductData);

      // Save to database (required - no localStorage fallback)
      // Validate title length (backend requires min 30 chars)
        if (!apiProductData.title || apiProductData.title.length < 30) {
        console.warn('apiProductData invalid title length', apiProductData.title);
        throw new Error(`Title must be at least 30 characters (got ${apiProductData.title?.length || 0})`);
        }
        
        const createdProduct = await productService.createProduct(apiProductData);
      const dbProductId = createdProduct.id;
        console.log('✅ Product saved to database with ID:', dbProductId);
        
      // NOTE: Products are now auto-published on creation (bypassing admin approval temporarily)
      // The explicit publish call below is optional but kept for compatibility
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
        pickupTime: productData?.pickupTime || '',
        selectedWeekDay: productData?.weekDay || '',
        selectedDate: productData?.selectedDate || '',
        itineraries: productData?.itineraries || [],
        destination: productData?.destination || '',
        duration: productData?.duration || '',
        lastModified: new Date().toISOString()
      };
      // Try to save to localStorage, but if it fails due to quota, save to backend cache only
      try {
      localStorage.setItem(`product_full_${dbProductId}`, JSON.stringify(fullPublishedData));
        console.log('💾 Full published data saved to localStorage:', `product_full_${dbProductId}`);
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
      
      // Also delete full draft data for all removed drafts
      draftIdsToDelete.forEach(draftId => {
        localStorage.removeItem(`product_draft_${draftId}`);
        console.log(`🗑️ Deleted full draft data: product_draft_${draftId}`);
      });
      
    // Close publish modal and show success modal
    setShowPublishModal(false);
    setShowSuccessModal(true);
      
      // Force reload after 2 seconds to show the new product
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('❌ Error publishing product:', error);
      alert('Error publishing product. Please try again.');
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
  const defaultPhotos = [
    { src: "/assets/Screenshot 2025-10-21 at 3.42.38 PM.png", alt: "Mount Fuji view 1" },
    { src: "/assets/Screenshot 2025-10-21 at 3.44.28 PM.png", alt: "Mount Fuji view 2" },
    { src: "/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png", alt: "Mount Fuji view 3" }
  ];

  // Convert uploaded photos to the same format
  const photos = uploadedPhotos && uploadedPhotos.length > 0 
    ? uploadedPhotos.map(photo => ({ src: photo.url, alt: photo.name }))
    : defaultPhotos;

  // All photos for modal (cover + uploaded photos)
  const allPhotos = coverImage && uploadedPhotos && uploadedPhotos.length > 0
    ? [{ src: coverImage.url, alt: coverImage.name }, ...photos]
    : [
        { src: "/assets/WhatsApp Image 2025-10-15 at 3.49.28 PM.jpeg", alt: "Mount Fuji cover" },
        ...defaultPhotos
      ];

  // Determine main cover image
  const mainCoverImage = coverImage 
    ? coverImage.url 
    : "/assets/WhatsApp Image 2025-10-15 at 3.49.28 PM.jpeg";

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

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

  const itineraryItems = productData?.itineraries && productData.itineraries.length > 0
    ? productData.itineraries.map((itinerary, index) => ({
        time: `${String(6 + index * 2).padStart(2, '0')}:00`, // Generate times starting from 06:00 with 2-hour intervals
        title: itinerary.location,
        description: itinerary.description,
        attractionType: itinerary.attractionType,
        timeSpent: itinerary.timeSpent,
        isFree: itinerary.isFree,
        photo: itinerary.photo, // Include cropped photo
        icon: 'sightseeing'
      }))
    : defaultItineraryItems;

  // Use dynamic highlights from productData or fallback to defaults
  const defaultHighlights = [
    { icon: 'mountain', text: 'Visit iconic Mount Fuji viewpoints including Lake Kawaguchi' },
    { icon: 'camera', text: 'Explore Chureito Pagoda for the perfect panoramic shots' },
    { icon: 'car', text: 'Comfortable private transport with flexible itinerary' },
    { icon: 'guide', text: 'Multilingual guide (English, Japanese, Hindi available)' }
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

  const faqs = [
    {
      question: 'What happens if Mount Fuji is not visible due to weather?',
      answer: 'We provide alternative viewpoints and cultural experiences. Weather conditions are monitored, and we adjust the itinerary accordingly.'
    },
    {
      question: 'Can the itinerary be customized?',
      answer: 'Yes, this is a private tour with flexible scheduling. We can accommodate special requests within the tour duration.'
    },
    {
      question: 'Is this tour suitable for elderly travelers?',
      answer: 'Absolutely. Our vehicle is wheelchair accessible and we can adjust the pace and activities based on your needs.'
    },
    {
      question: 'What\'s the cancellation policy?',
      answer: 'Free cancellation up to 24 hours before the tour. Full refund for weather-related cancellations.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navbar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/assets/logo.jpg" alt="TripsAdora" className="h-12 w-auto" />
            </div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-[#1d236b] font-medium relative">
                Home
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]"></span>
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">FAQs</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Support</a>
            </nav>
            
            {/* User Info Section */}
            <div className="flex items-center space-x-6">
              {/* Notification Icons */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FiClock size={20} className="text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="relative">
                  <FiBell size={20} className="text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
              
              {/* Language Selector */}
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-700">EN</span>
                <FiChevronDown size={14} className="text-gray-600" />
              </div>
              
              {/* Balance */}
              <div className="text-right">
                <p className="text-xs text-gray-600">Available Balance</p>
                <p className="text-lg font-bold text-gray-900">$1850</p>
              </div>
              
              {/* User Profile */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <FiUser size={20} className="text-gray-600" />
                </div>
                <p className="text-xs text-gray-600 mt-1">ID 00032123</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Working Navbar */}
      <nav className="bg-transparent border-b border-gray-200">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-center space-x-12 relative">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="text-black font-medium hover:text-gray-600 cursor-pointer"
            >
              Dashboard
            </button>
            
            {/* Listings with Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-black font-medium hover:text-gray-600">
                <span>Listings</span>
                <FiChevronDown size={16} />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button 
                    onClick={() => window.location.href = '/products/create'}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                  >
                    Create new product
                  </button>
                  <button 
                    onClick={() => window.location.href = '/products'}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    Active Product listing
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.href = '/availability'}
              className="text-black font-medium hover:text-gray-600 cursor-pointer"
            >
              Availability
            </button>
            <button 
              onClick={() => window.location.href = '/bookings'}
              className="text-black font-medium hover:text-gray-600 cursor-pointer"
            >
              Bookings
            </button>
            <button 
              onClick={() => window.location.href = '/insights'}
              className="text-black font-medium hover:text-gray-600 cursor-pointer"
            >
              Insights
            </button>
            <button 
              onClick={() => window.location.href = '/finance'}
              className="text-black font-medium hover:text-gray-600 cursor-pointer"
            >
              Finance
            </button>
          </div>
        </div>
      </nav>

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
              className="flex items-center space-x-2 px-4 py-2 border border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 bg-white shadow-sm transition-colors"
            >
              <FiEdit3 size={16} />
              <span>Save as Draft</span>
            </button>
            <button 
              onClick={() => setShowPublishModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-colors"
            >
              <FiUpload size={16} />
              <span>Publish Product</span>
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
                    onClick={() => handlePhotoClick(1)}
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
                      onClick={() => setShowPhotoModal(true)}
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

            {/* Vehicle & Pricing */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <FiTruck size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Vehicle & Pricing</h3>
              </div>
              {productData?.vehicles && productData.vehicles.length > 0 ? (
                productData.vehicles.map((vehicle, index) => (
                  <div key={vehicle.id || index} className="mb-6 last:mb-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-start space-x-3">
                        <FiTruck size={20} className="text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Vehicle Details</h4>
                          <p className="text-gray-600">
                            {vehicle.title || (vehicle.type && vehicle.model ? `${vehicle.type} ${vehicle.model.replace('-', ' ')}` : 'Vehicle')}
                          </p>
                          {vehicle.year && <p className="text-sm text-gray-500">{vehicle.year} model</p>}
                          {vehicle.attributes && <p className="text-sm text-gray-500">{vehicle.attributes}</p>}
                          {vehicle.capacity && <p className="text-sm text-gray-500">Best for up to {vehicle.capacity} travelers</p>}
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FiClock size={20} className="text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Duration</h4>
                          <p className="text-gray-600">{vehicle.duration || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    {(vehicle.currency || vehicle.amount || vehicle.pricingType) && (
                      <div className="mt-6 flex items-center space-x-3">
                        {(vehicle.currency || vehicle.amount) && (
                          <span className="text-2xl font-bold text-gray-900">
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
                  </div>
                ))
              ) : (
                <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start space-x-3">
                  <FiTruck size={20} className="text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Vehicle Details</h4>
                    <p className="text-gray-600">Mercedes-Benz A-Class (2018 model)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiClock size={20} className="text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Duration</h4>
                    <p className="text-gray-600">10 hours</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-900">$240</span>
                <span className="text-gray-600">Per Group</span>
              </div>
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
                    {productData?.pickupLocations && productData.pickupLocations.length > 0 ? (
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
                    {productData?.pickupTime && (
                      <p className="text-sm text-gray-600 mt-2">
                        Time: {productData.pickupTime}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-2">Drop-off</h4>
                    {productData?.dropoffLocations && productData.dropoffLocations.length > 0 ? (
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
                      {days.map((day) => (
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
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-2">Time Slots</h4>
                    <div className="grid grid-cols-6 gap-2">
                      {timeSlots.map((time) => (
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
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
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
              <div className="space-y-4">
                {itineraryItems.map((item, index) => (
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
                    src={allPhotos[currentPhotoIndex].src}
                    alt={allPhotos[currentPhotoIndex].alt}
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
                  {currentPhotoIndex + 1} / {photos.length}
                </div>
                
                {/* Thumbnail Strip */}
                <div className="absolute bottom-4 left-4 right-4 flex space-x-2 overflow-x-auto pb-2">
                  {photos.map((photo, index) => (
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
