import React, { useState, useRef, useEffect } from 'react';
import { FiClock, FiMapPin, FiRotateCcw, FiPlus, FiX, FiCheckCircle, FiChevronDown, FiCamera, FiUpload, FiEdit3, FiTrash2, FiUser, FiStar } from 'react-icons/fi';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import MountFujiTourPage from './MountFujiTourPage';
import { imageService } from '@/services/imageService';

const DEFAULT_CROP = { unit: '%', width: 80, height: 80, x: 10, y: 10, aspect: 1 };

const sanitizeCrop = (candidate = {}) => {
  const merged = { ...DEFAULT_CROP, ...candidate };
  const numericKeys = ['width', 'height', 'x', 'y'];
  numericKeys.forEach((key) => {
    const value = merged[key];
    merged[key] = Number.isFinite(value) ? value : DEFAULT_CROP[key];
  });
  merged.unit = merged.unit || DEFAULT_CROP.unit;
  merged.aspect = merged.aspect || DEFAULT_CROP.aspect;
  return merged;
};

const areItinerariesEqual = (a, b) => {
  const arrA = Array.isArray(a) ? a : [];
  const arrB = Array.isArray(b) ? b : [];
  if (arrA.length !== arrB.length) return false;
  for (let i = 0; i < arrA.length; i += 1) {
    const left = arrA[i] ?? null;
    const right = arrB[i] ?? null;
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      return false;
    }
  }
  return true;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSION_PX = 420;

const dataUrlToFile = (dataUrl, filename = `itinerary-${Date.now()}.jpg`) => {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const AddItineraryComponent = ({
  onClose,
  onBack,
  coverImage,
  uploadedPhotos,
  productData,
  currentItineraries = [],
  onItinerariesChange
}) => {
  const [selectedTourType, setSelectedTourType] = useState('One day Tour');
  const [showAddItineraryModal, setShowAddItineraryModal] = useState(false);
  const [showAttractionsDropdown, setShowAttractionsDropdown] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState('Select Attractions');
  const [entryIsFree, setEntryIsFree] = useState(true);
  const [ticketFare, setTicketFare] = useState('');
  const [hours, setHours] = useState('02');
  const [minutes, setMinutes] = useState('30');
  const [hasSavedItinerary, setHasSavedItinerary] = useState(false);
  const [itineraryEntries, setItineraryEntries] = useState(Array.isArray(currentItineraries) ? currentItineraries : []);
  // Initialize showSubmitView to true if there are existing itineraries
  const [showSubmitView, setShowSubmitView] = useState(Array.isArray(currentItineraries) && currentItineraries.length > 0);
  const [showFinalLook, setShowFinalLook] = useState(false);
  const [editingItineraryId, setEditingItineraryId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [croppedPhoto, setCroppedPhoto] = useState(null);
  const [photoPublicId, setPhotoPublicId] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);

  const uploadPhotoToCloud = async (file, folder = 'products/itinerary') => {
    setPhotoUploading(true);
    setPhotoUploadProgress(0);
    try {
      const response = await imageService.uploadImage(file, {
        folder,
        onUploadProgress: (progress) => setPhotoUploadProgress(progress)
      });
      if (!response?.url) {
        throw new Error(response?.detail || 'Upload failed');
      }
      return response;
    } finally {
      setPhotoUploading(false);
      setPhotoUploadProgress(0);
    }
  };
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [completedCrop, setCompletedCrop] = useState(DEFAULT_CROP);
  const photoInputRef = useRef(null);
  const imgRef = useRef(null);
  // Final Look timeline measurements
  const finalTimelineRef = useRef(null);
  const [finalLineTop, setFinalLineTop] = useState(16);
  const [finalLineHeight, setFinalLineHeight] = useState(0);

  useEffect(() => {
    if (!Array.isArray(currentItineraries)) return;
    setItineraryEntries(prev => {
      if (areItinerariesEqual(prev, currentItineraries)) {
        return prev;
      }
      return currentItineraries;
    });
    const hasItineraries = currentItineraries.length > 0;
    setHasSavedItinerary(hasItineraries);
    // If there are existing itineraries, automatically show the submit view (management page)
    if (hasItineraries) {
      setShowSubmitView(true);
    }
  }, [currentItineraries]);

  // Load existing itineraries from draft when available
  const draftInitializationRef = useRef(false);

  useEffect(() => {
    if (draftInitializationRef.current) return;
    const draftId = productData?.draftId;
    if (!draftId) {
      draftInitializationRef.current = true;
      return;
    }

    try {
      const saved = localStorage.getItem(`product_draft_${draftId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.itineraries) && parsed.itineraries.length > 0) {
          setItineraryEntries(prev => {
            if (areItinerariesEqual(prev, parsed.itineraries)) {
              return prev;
            }
            return parsed.itineraries;
          });
          setHasSavedItinerary(true);
          // Automatically show submit view (management page) if there are existing itineraries
          setShowSubmitView(true);
          onItinerariesChange?.(parsed.itineraries);
        }
      }
    } catch (e) {
      console.warn('Unable to load itineraries from draft:', e);
    } finally {
      draftInitializationRef.current = true;
    }
  }, [productData?.draftId, onItinerariesChange]);

  const tourTypes = [
    { 
      id: 'one-day', 
      name: 'One day Tour', 
      timeRange: '06:00 - 23:15',
      icon: <FiClock className="w-5 h-5" />
    },
    { 
      id: 'half-day', 
      name: 'Half day Tour', 
      timeRange: '06:00 - 12:00',
      icon: <FiClock className="w-5 h-5" />
    },
    { 
      id: 'multi-day', 
      name: 'Multi day Tour', 
      timeRange: 'Custom',
      icon: <FiClock className="w-5 h-5" />
    }
  ];

  const handleTourTypeSelect = (tourType) => {
    setSelectedTourType(tourType.name);
  };

  const validatePhotoForItinerary = (file, onValid) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      alert(`File size must be less than 5MB (received ${(file.size / (1024 * 1024)).toFixed(2)}MB).`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.width < MIN_DIMENSION_PX || img.height < MIN_DIMENSION_PX) {
        alert(`Image resolution must be at least ${MIN_DIMENSION_PX}px on both sides.`);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      URL.revokeObjectURL(objectUrl);
      onValid();
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      alert('Unable to read the image. Please try another file.');
    };
    img.src = objectUrl;
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    validatePhotoForItinerary(file, () => {
      setUploadedPhoto(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setCrop(DEFAULT_CROP);
        setCompletedCrop(DEFAULT_CROP);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);

      console.log('✅ Photo uploaded:', file.name);
    });
  };

  const getCroppedImg = (image, rawCrop) => {
    const safeCrop = sanitizeCrop(rawCrop);
    const canvas = document.createElement('canvas');
    const widthPx = safeCrop.unit === '%'
      ? (safeCrop.width / 100) * image.naturalWidth
      : safeCrop.width;
    const heightPx = safeCrop.unit === '%'
      ? (safeCrop.height / 100) * image.naturalHeight
      : safeCrop.height;
    const xPx = safeCrop.unit === '%'
      ? (safeCrop.x / 100) * image.naturalWidth
      : safeCrop.x;
    const yPx = safeCrop.unit === '%'
      ? (safeCrop.y / 100) * image.naturalHeight
      : safeCrop.y;

    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      xPx,
      yPx,
      widthPx,
      heightPx,
      0,
      0,
      widthPx,
      heightPx
    );

    return canvas.toDataURL('image/jpeg', 0.99);
  };

  const handleCropComplete = (rawCrop) => {
    setCompletedCrop(sanitizeCrop(rawCrop));
  };

  const applyCrop = async () => {
    const cropToUse = sanitizeCrop(completedCrop || crop);
    if (!imgRef.current) return;

    const croppedImageUrl = getCroppedImg(imgRef.current, cropToUse);
    setPhotoPreview(croppedImageUrl);
    try {
      const file = dataUrlToFile(croppedImageUrl);
      if (photoPublicId) {
        imageService.deleteImage(photoPublicId).catch(() => {});
      }
      const upload = await uploadPhotoToCloud(file);
      setUploadedPhoto(file);
      setCroppedPhoto(upload.url);
      setPhotoPublicId(upload.public_id);
      console.log('✅ Photo cropped & uploaded successfully');
    } catch (error) {
      console.error('Failed to upload cropped photo', error);
      alert('Failed to upload cropped photo. Please try again.');
    } finally {
      setShowCropModal(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setUploadedPhoto(null);
    setCrop(DEFAULT_CROP);
    setCompletedCrop(DEFAULT_CROP);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    if (photoPublicId) {
      imageService.deleteImage(photoPublicId).catch(() => {});
    }
    setUploadedPhoto(null);
    setPhotoPreview(null);
    setCroppedPhoto(null);
    setPhotoPublicId(null);
    setPhotoUploading(false);
    setPhotoUploadProgress(0);
    setCrop(DEFAULT_CROP);
    setCompletedCrop(DEFAULT_CROP);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const attractionsOptions = [
    'Slightseeing & Photography',
    'Cultural Visits',
    'Food & Dining',
    'Sports & Adventure',
    'Shopping',
    'Museum & Galleries',
    'Nature & Wildlife',
    'Historical Tour'
  ];

  const handleSaveItinerary = () => {
    const startHour = 6 + itineraryEntries.length * 2;
    const inferredTime = `${String(startHour % 24).padStart(2, '0')}:00`;

    const normalizedName = placeName?.trim() || '';
    // Preserve existing photo URL if editing and photo hasn't changed
    const existingEntry = editingItineraryId ? itineraryEntries.find(e => e.id === editingItineraryId) : null;
    const photoUrlForEntry = croppedPhoto || photoPreview || (existingEntry?.photo || null);
    const normalizedTicketFare = ticketFare?.trim() || '';
    const ticketDisplayText = entryIsFree ? 'Free' : (normalizedTicketFare ? normalizedTicketFare : 'Paid');
    
    const entryData = {
      id: editingItineraryId || Date.now(),
      title: normalizedName || 'Itinerary Stop',
      placeName: normalizedName || 'Fujinimiya',
      location: normalizedName || 'Fujinimiya',
      description: description || 'Beautiful mountain views and traditional temples',
      attractionType: selectedAttraction === 'Select Attractions' ? 'Sightseeing & Photography' : selectedAttraction,
      timeSpent: `${hours}h ${minutes}min`,
      isFree: entryIsFree,
      ticketFare: normalizedTicketFare,
      ticket: ticketDisplayText,
      hasPhoto: Boolean(photoUrlForEntry),
      photo: photoUrlForEntry || null,
      photoPublicId: photoPublicId || (existingEntry?.photoPublicId || null),
      time: inferredTime,
      activities: [
        selectedAttraction === 'Select Attractions' ? 'Sightseeing & Photography' : selectedAttraction,
        'Food & Drink',
        'Cultural visit'
      ].filter(Boolean)
    };

    let updatedEntries;
    if (editingItineraryId) {
      // Update existing entry
      updatedEntries = itineraryEntries.map(entry => 
        entry.id === editingItineraryId ? entryData : entry
      );
      setEditingItineraryId(null);
    } else {
      // Add new entry
      updatedEntries = [...itineraryEntries, entryData];
    }
    
    setItineraryEntries(updatedEntries);
    setShowAddItineraryModal(false);
    setHasSavedItinerary(true);
    setShowSubmitView(true); // Automatically navigate to the submit view
    onItinerariesChange?.(updatedEntries);

    // Persist to draft if available
    try {
      const draftId = productData?.draftId;
      if (draftId) {
        const key = `product_draft_${draftId}`;
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : {};
        localStorage.setItem(key, JSON.stringify({ ...parsed, itineraries: updatedEntries, lastModified: new Date().toISOString() }));
      }
    } catch (e) {
      console.warn('Failed to persist itinerary to draft:', e);
    }
    
    // Reset form
    setPlaceName('');
    setDescription('');
    setSelectedAttraction('Select Attractions');
    setHours('02');
    setMinutes('30');
    setEntryIsFree(true);
    setTicketFare('');
    setUploadedPhoto(null);
    setPhotoPreview(null);
    setCroppedPhoto(null);
    setPhotoPublicId(null);
    setPhotoUploading(false);
    setPhotoUploadProgress(0);
    setImageToCrop(null);
    setCrop({ unit: '%', width: 100, aspect: 1 });
    setCompletedCrop(null);
    setEditingItineraryId(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleEditItinerary = (entry) => {
    setEditingItineraryId(entry.id);
    setPlaceName(entry.placeName || entry.location || entry.title || '');
    setDescription(entry.description || '');
    setSelectedAttraction(entry.attractionType || 'Select Attractions');
    // Parse timeSpent (e.g., "2h 30min" -> hours: "02", minutes: "30")
    const timeMatch = (entry.timeSpent || '').match(/(\d+)h\s*(\d+)min/);
    if (timeMatch) {
      setHours(String(parseInt(timeMatch[1])).padStart(2, '0'));
      setMinutes(String(parseInt(timeMatch[2])).padStart(2, '0'));
    } else {
      setHours('02');
      setMinutes('30');
    }
    setEntryIsFree(entry.isFree !== false);
    // Load ticket fare - if entry has ticketFare, use it, otherwise check if ticket is not "Free"
    const savedTicketFare = entry.ticketFare || '';
    setTicketFare(savedTicketFare);
    // Preserve existing photo - check if it's a URL string or needs to be preserved
    if (entry.photo) {
      let photoUrl = null;
      // If photo is already a URL string, use it directly
      if (typeof entry.photo === 'string') {
        // Handle various URL formats: http, https, data URLs, and Cloudinary URLs
        if (entry.photo.startsWith('http://') || entry.photo.startsWith('https://') || entry.photo.startsWith('data:')) {
          photoUrl = entry.photo;
        } else if (entry.photo.startsWith('/')) {
          // Relative path - might need to be converted
          photoUrl = entry.photo;
        } else {
          // Try to use it as-is - might be a valid URL without protocol
          photoUrl = entry.photo;
        }
      } else if (entry.photo?.url) {
        // Photo is an object with url property
        photoUrl = entry.photo.url;
      } else if (entry.photo?.secure_url) {
        // Cloudinary secure URL
        photoUrl = entry.photo.secure_url;
      }
      
      // Set photo preview and cropped photo if we have a valid URL
      if (photoUrl) {
        setPhotoPreview(photoUrl);
        setCroppedPhoto(photoUrl);
        // Also preserve photoPublicId if available
        setPhotoPublicId(entry.photoPublicId || entry.photo?.public_id || null);
      } else {
        // Fallback: try to use entry.photo directly
        setPhotoPreview(entry.photo);
        setCroppedPhoto(entry.photo);
        setPhotoPublicId(entry.photoPublicId || null);
      }
    } else {
      setPhotoPreview(null);
      setCroppedPhoto(null);
      setPhotoPublicId(null);
    }
    setShowAddItineraryModal(true);
  };

  // Persist any changes to itinerary list to draft (e.g., delete)
  useEffect(() => {
    try {
      const draftId = productData?.draftId;
      if (!draftId) return;
      const key = `product_draft_${draftId}`;
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem(key, JSON.stringify({ ...parsed, itineraries: itineraryEntries, lastModified: new Date().toISOString() }));
    } catch (e) {
      // ignore
    }
    onItinerariesChange?.(itineraryEntries);
  }, [itineraryEntries, productData?.draftId, onItinerariesChange]);

  // Measure timeline line to end exactly at drop-off icon center
  useEffect(() => {
    if (!showFinalLook || !finalTimelineRef.current) return;
    
    const measureLine = () => {
      const container = finalTimelineRef.current;
      if (!container) return;
      
      const markers = container.querySelectorAll('[data-timeline-marker]');
      if (markers.length === 0) {
        // Fallback: estimate based on item count
        const itemCount = (productData?.pickupLocations?.length > 0 ? 1 : 0) + 
                         itineraryEntries.length + 
                         (productData?.dropoffLocations?.length > 0 ? 1 : 0);
        setFinalLineTop(16);
        setFinalLineHeight(itemCount > 0 ? (itemCount * 88) : 200);
        return;
      }
      
      const firstMarker = markers[0];
      const lastMarker = markers[markers.length - 1];
      
      // Get positions relative to container
      const containerRect = container.getBoundingClientRect();
      const firstRect = firstMarker.getBoundingClientRect();
      const lastRect = lastMarker.getBoundingClientRect();
      
      // Calculate centers relative to container top
      const firstCenter = (firstRect.top + firstRect.height / 2) - containerRect.top;
      const lastCenter = (lastRect.top + lastRect.height / 2) - containerRect.top;
      
      // Set line to start at first marker center and end at last marker center
      setFinalLineTop(firstCenter);
      setFinalLineHeight(Math.max(0, lastCenter - firstCenter));
    };
    
    // Measure after a short delay to ensure DOM is ready
    const timeout1 = setTimeout(measureLine, 100);
    const timeout2 = setTimeout(measureLine, 300);
    
    // Also measure on resize
    window.addEventListener('resize', measureLine);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      window.removeEventListener('resize', measureLine);
    };
  }, [showFinalLook, itineraryEntries, productData?.pickupLocations?.length, productData?.dropoffLocations?.length]);

  const handleSubmit = () => {
    if (hasSavedItinerary && !showSubmitView) {
      setShowSubmitView(true);
    } else if (showSubmitView) {
      setShowFinalLook(true);
    }
  };

  const handleBackFromFinalLook = () => {
    setShowFinalLook(false);
    setShowSubmitView(true); // Go back to the submit view
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDeleteEntry = (id) => {
    const target = itineraryEntries.find(entry => entry.id === id);
    if (target?.photoPublicId) {
      imageService.deleteImage(target.photoPublicId).catch(() => {});
    }
    const updatedEntries = itineraryEntries.filter(entry => entry.id !== id);
    setItineraryEntries(updatedEntries);
    setHasSavedItinerary(updatedEntries.length > 0);
  };

  // Show the preview page if showPreview is true
  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-white z-[100] overflow-auto">
        <MountFujiTourPage 
          coverImage={coverImage} 
          uploadedPhotos={uploadedPhotos} 
          productData={{
            ...productData,
            itineraries: itineraryEntries // Pass saved itineraries to preview
          }}
          onBack={() => setShowPreview(false)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-[95vw] h-[90vh] max-w-7xl flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white rounded-t-lg border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <img 
              src="/assets/logo.jpg" 
              alt="TripsAdora Logo" 
              className="h-8 w-auto"
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Background Image */}
          <div className="w-1/3 relative overflow-hidden">
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
              Add Itinerary
            </h1>
            </div>
            
              {/* Progress Steps - Vertical List - Centered */}
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-6">
                  {[1, 2, 3, 4, 5, 6].map((stepNumber, index) => (
                    <div key={stepNumber} className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 bg-blue-600 text-white border-blue-600"
                      >
                        <FiCheckCircle size={16} />
                      </div>
                      {index < 5 && (
                        <div className="w-0.5 h-6 mt-2 bg-blue-600"></div>
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
              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5, 6].map((step, index) => (
                    <React.Fragment key={step}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            bg-blue-600 text-white`}
                      >
                        {step}
                      </div>
                      {index < 5 && (
                          <div className="w-8 h-0.5 bg-blue-600"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Information Banner */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-sm">!</span>
                  </div>
                  <p className="text-gray-700">
                    Your choices set up your product. please review carefully; changes can't be made later.
                  </p>
                </div>
              </div>

              {/* Tour Itinerary Section */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Tour Itinerary</h2>
                <p className="text-gray-500 mb-6">Your personalized travel plan at a glance</p>

                  {showFinalLook ? (
                    /* Final Look View - Complete Timeline */
                    <div className="space-y-6">
                      {/* One day Tour Bar */}
                      <div className="mb-8">
                        <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-3 flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4 relative">
                            <FiClock className="w-5 h-5 text-white" />
                            {/* Small downward arrow at bottom center */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                              <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-600"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-black">One day Tour</h3>
                            <p className="text-sm text-gray-600">(06:00 - 23:15)</p>
                          </div>
                        </div>
                      </div>

                      {/* Removed Pick-up & Drop-off summary panels in Final Look */}

                      {/* Complete Timeline */}
                      <div ref={finalTimelineRef} className="relative">
                        {/* Timeline Line - starts at first marker center, ends exactly at drop-off marker center */}
                        {finalLineHeight > 0 && (
                          <div 
                            className="absolute w-1 bg-gray-800"
                            style={{ 
                              left: '1rem', 
                              top: `${finalLineTop}px`, 
                              height: `${finalLineHeight}px` 
                            }}
                          ></div>
                        )}

                        {/* Optional Pick-up as first timeline item */}
                        {productData?.pickupLocations && productData.pickupLocations.length > 0 && (
                          <div className="flex items-start mb-8 relative">
                            <div data-timeline-marker className="w-8 h-8 border-2 border-green-700 bg-green-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                              <FiMapPin className="w-4 h-4 text-green-700" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-black mb-2">Pick-up</h3>
                              <div className="flex flex-wrap gap-2 mb-1">
                                {productData.pickupLocations.map((loc, idx) => (
                                  <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{loc}</span>
                                ))}
                              </div>
                              {productData.pickupTime && (
                                <p className="text-sm text-gray-600">Time: {productData.pickupTime}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Removed fixed Mount Fuji start; pickup is shown above when available */}

                        {/* Itinerary Entries */}
                        {itineraryEntries.map((entry, index) => (
                          <div key={entry.id || index} className="flex items-start mb-8 relative">
                            <div data-timeline-marker className="w-8 h-8 border-2 border-black bg-gray-200 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10 overflow-hidden">
                              {entry.photo ? (
                                <img 
                                  src={entry.photo} 
                                  alt={entry.title || entry.placeName || entry.location || `Itinerary stop ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-sm font-semibold text-gray-800">
                                  {(entry.title && entry.title[0]) ||
                                   (entry.placeName && entry.placeName[0]) ||
                                   (entry.location && entry.location[0]) ||
                                   String(index + 1)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-black mb-2">
                                {entry.title || entry.placeName || entry.location || `Itinerary stop ${index + 1}`}
                              </h3>
                              <p className="text-gray-600 mb-3">{entry.description}</p>
                              
                              {/* Activities Section */}
                              <div className="mb-3">
                                <p className="text-gray-600 font-bold mb-2">Activities:</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{entry.attractionType}</span>
                                  <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Food & Drink</span>
                                  <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Cultural visit</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                                  Ticket: {entry.isFree ? 'Free' : (entry.ticketFare ? entry.ticketFare : entry.ticket || 'Paid')}
                                </span>
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                                  {entry.timeSpent}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Optional Drop-off just before End */}
                        {productData?.dropoffLocations && productData.dropoffLocations.length > 0 && (
                          <div className="flex items-start mb-8 relative">
                            <div data-timeline-marker className="w-8 h-8 border-2 border-blue-700 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                              <FiMapPin className="w-4 h-4 text-blue-700" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-black mb-2">Drop-off</h3>
                              <div className="flex flex-wrap gap-2">
                                {productData.dropoffLocations.map((loc, idx) => (
                                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{loc}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Removed fixed Finished - Return; drop-off is shown above when available */}
                      </div>
                    </div>
                  ) : !showSubmitView ? (
                    <>
                      {/* One day Tour Bar */}
                <div className="mb-8">
                        <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-3 flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4 relative">
                            <FiClock className="w-5 h-5 text-white" />
                            {/* Small downward arrow at bottom center */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                              <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-600"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-black">One day Tour</h3>
                            <p className="text-sm text-gray-600">(06:00 - 23:15)</p>
                          </div>
                        </div>
                      </div>

                      {/* Itinerary Timeline */}
                      <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-3.5 top-7 bottom-16 w-1 bg-black"></div>

                        {/* Optional Pick-up as first item */}
                        {productData?.pickupLocations && productData.pickupLocations.length > 0 && (
                          <div className="flex items-start mb-12 relative">
                            <div className="w-8 h-8 border-2 border-green-700 bg-green-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                              <FiMapPin className="w-4 h-4 text-green-700" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-black">Pick-up</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {productData.pickupLocations.map((loc, idx) => (
                                  <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{loc}</span>
                                ))}
                              </div>
                              {productData.pickupTime && (
                                <p className="text-sm text-gray-600 mt-2">Time: {productData.pickupTime}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Mid Point - Add Itinerary */}
                        <div className="flex items-start mb-12 relative">
                          <div className="w-8 h-8 border-2 border-black bg-gray-200 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                            {/* Person torso with head icon */}
                            <div className="w-4 h-4 flex flex-col items-center justify-center">
                              <div className="w-0.5 h-0.5 bg-black rounded-full mb-0.5"></div>
                              <div className="w-2 h-1.5 bg-black rounded-sm"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-black mb-4">
                              {itineraryEntries.length > 0 ? 'Add another itinerary stop' : 'Add your first itinerary'}
                            </h3>
                            <button
                              onClick={() => setShowAddItineraryModal(true)}
                              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4 text-lg font-medium"
                            >
                              {itineraryEntries.length > 0 ? 'Add itinerary stop' : 'Create itinerary'}
                            </button>
                            <p className="text-gray-600 text-base">
                              Add the stopovers or mid-points you'll visit on the way to Mount Fuji.
                            </p>
                          </div>
                        </div>

                        {itineraryEntries.length > 0 && (
                          <div className="mb-12 flex flex-col items-center text-center">
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">Saved itinerary stops</h4>
                            <div className="space-y-6 w-full max-w-3xl">
                              {itineraryEntries.map((entry, index) => (
                                <div key={entry.id || index} className="relative flex items-start">
                                  <div className="w-8 h-8 border-2 border-blue-700 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                                    <FiMapPin className="w-4 h-4 text-blue-700" />
                                  </div>
                                  <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Stop {index + 1}</p>
                                        <h5 className="text-xl font-semibold text-gray-900">
                                          {entry.title || entry.placeName || entry.location || `Itinerary stop ${index + 1}`}
                                        </h5>
                                      </div>
                                      {(entry.time || entry.timeSpent) && (
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                          <FiClock className="mr-1" size={12} />
                                          {entry.time || entry.timeSpent}
                                        </span>
                                      )}
                                    </div>
                                    {entry.description && (
                                      <p className="mt-3 text-sm text-gray-600">{entry.description}</p>
                                    )}
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                      {entry.attractionType && (
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                          {entry.attractionType}
                                        </span>
                                      )}
                                      {'isFree' in entry && (
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${entry.isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                          {entry.isFree ? 'Free stop' : 'Paid stop'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Optional Drop-off as last item */}
                        {productData?.dropoffLocations && productData.dropoffLocations.length > 0 && (
                          <div className="flex items-start relative">
                            <div className="w-8 h-8 border-2 border-blue-700 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                              <FiMapPin className="w-4 h-4 text-blue-700" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-black">Drop-off</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {productData.dropoffLocations.map((loc, idx) => (
                                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{loc}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Submit View - Itinerary Entries */
                    <div className="space-y-6">
                      {/* Add new itinerary button */}
                      <div className="flex justify-center">
                        <button 
                          onClick={() => setShowAddItineraryModal(true)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                        >
                          Add new itinerary
                        </button>
                      </div>

                      {/* Itinerary Entries */}
                      {itineraryEntries.map((entry, index) => (
                        <div key={entry.id} className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Location with map pin */}
                              <div className="flex items-center mb-2">
                                <FiMapPin className="w-4 h-4 text-gray-600 mr-2" />
                                <span className="text-base font-medium text-gray-900">{entry.location}</span>
                              </div>
                              
                              {/* Description */}
                              <p className="text-gray-700 text-sm mb-2">{entry.description}</p>
                              
                              {/* Activity */}
                              <p className="text-gray-700 text-sm mb-3">{entry.attractionType}</p>
                              
                              {/* Tags Row */}
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  Ticket: {entry.isFree ? 'Free' : (entry.ticketFare ? entry.ticketFare : entry.ticket || 'Paid')}
                                </span>
                                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  {entry.timeSpent}
                                </span>
                              </div>
                              
                              {/* Photo Status */}
                              <p className="text-gray-600 text-sm">
                                Photo: {entry.hasPhoto ? 'Added' : 'Not added'}
                              </p>
                            </div>
                            
                            {/* Action Icons - Right aligned */}
                            <div className="flex items-center space-x-1 ml-4">
                              <button 
                                onClick={() => handleEditItinerary(entry)}
                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                title="Edit itinerary"
                              >
                                <FiEdit3 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                title="Delete itinerary"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                  )}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="bg-white border-t border-gray-200 px-8 py-6">
            <div className="max-w-4xl mx-auto flex justify-end space-x-4">
              {!showFinalLook ? (
                <>
              <button
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white transition-colors"
              >
                Back
              </button>
              
              <button
                    onClick={handleSubmit}
                    disabled={!hasSavedItinerary}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      hasSavedItinerary
                        ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {showSubmitView ? 'Final look' : 'Submit'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBackFromFinalLook}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white transition-colors"
                  >
                    Back
                  </button>

                  <button
                    onClick={handlePreview}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Preview
                  </button>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add new Itinerary stop Modal */}
      {showAddItineraryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">
                {editingItineraryId ? 'Edit Itinerary Stop' : 'Add new Itinerary stop'}
              </h2>
              <button
                onClick={() => {
                  setShowAddItineraryModal(false);
                  setEditingItineraryId(null);
                  // Reset form when closing
                  setPlaceName('');
                  setDescription('');
                  setSelectedAttraction('Select Attractions');
                  setHours('02');
                  setMinutes('30');
                  setEntryIsFree(true);
                  setTicketFare('');
                  setUploadedPhoto(null);
                  setPhotoPreview(null);
                  setCroppedPhoto(null);
                  setPhotoPublicId(null);
                  if (photoInputRef.current) {
                    photoInputRef.current.value = '';
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Place Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Place Name</label>
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="Fujinimiya"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write Here"
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Attractions Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Attractions Type</label>
                <div className="relative">
                  <button
                    onClick={() => setShowAttractionsDropdown(!showAttractionsDropdown)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span className="text-gray-700">{selectedAttraction}</span>
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showAttractionsDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {attractionsOptions.map((option, index) => (
                        <button
                          key={index}
                onClick={() => {
                            setSelectedAttraction(option);
                            setShowAttractionsDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Time to Spend */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Time to Spend</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-16 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-600">Hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      className="w-16 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-600">Minutes</span>
                  </div>
                </div>
              </div>

              {/* Entry is Free */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Entry is Free</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={ticketFare}
                    onChange={(e) => setTicketFare(e.target.value)}
                    placeholder="Enter the ticket fare here.."
                    className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={entryIsFree}
                  />
                  <div className="relative">
                    <button
                      onClick={() => setEntryIsFree(!entryIsFree)}
                      className={`relative w-12 h-6 rounded-full shadow-inner transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                        entryIsFree ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                        entryIsFree ? 'left-6' : 'left-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Upload your Photo</label>
                {photoPreview ? (
                  // Show cropped photo preview in circular format
                  <div className="border-2 border-gray-300 rounded-lg p-6">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gray-100">
                          <img 
                            src={photoPreview} 
                            alt="Cropped preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', photoPreview);
                              // If image fails to load, try to set a placeholder or handle the error
                              e.target.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', photoPreview);
                            }}
                          />
                        </div>
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md z-10"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <FiCheckCircle className="mr-1" size={16} />
                          Photo uploaded successfully
                        </span>
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Change Photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show upload area
                  <div 
                    onClick={() => photoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <FiCamera className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-600 mb-1">Upload Photo</span>
                      <FiUpload className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500 mt-2">Click to browse or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">Min 420px · Max 5MB</p>
                    </div>
                  </div>
                )}
                {photoUploading && (
                  <p className="text-xs text-blue-500 mt-3 text-center">
                    Uploading photo… {photoUploadProgress}%
                  </p>
                )}
                {/* Hidden file input */}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={handleSaveItinerary}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingItineraryId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80]">
          <div className="bg-white rounded-lg shadow-xl w-[700px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">Crop Your Photo</h2>
              <button
                onClick={handleCancelCrop}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Crop Area */}
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop((prev) => sanitizeCrop({ ...prev, ...c }))}
                  onComplete={handleCropComplete}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imageToCrop}
                    alt="Crop preview"
                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                  />
                </ReactCrop>
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                Drag to adjust the circular crop area. The photo will be displayed in a circle on your itinerary.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelCrop}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
                <button
                 onClick={applyCrop}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItineraryComponent;