import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiX, FiChevronDown, FiUpload, FiSend } from 'react-icons/fi';
import AddItineraryComponent from './AddItineraryComponent';

const CreateProductComponent = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [showItineraryComponent, setShowItineraryComponent] = useState(false);
  const [showImageTipsModal, setShowImageTipsModal] = useState(false);
  const [showIncludedExcludedModal, setShowIncludedExcludedModal] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [selectedVehicleModel, setSelectedVehicleModel] = useState('');
  
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
  const [editingVehicleIndex, setEditingVehicleIndex] = useState(null);
  
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
  
  // Step 6 dropdown states
  const [showSelectLocationsDropdown, setShowSelectLocationsDropdown] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState('All Location');
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [selectedPickupHour, setSelectedPickupHour] = useState('06');
  const [selectedPickupMinute, setSelectedPickupMinute] = useState('00');
  const [selectedWeekDay, setSelectedWeekDay] = useState('week days');
  const [selectedPickupLocation, setSelectedPickupLocation] = useState('');
  const [selectedDropoffLocation, setSelectedDropoffLocation] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('01 Oct');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSelectVehicleModal, setShowSelectVehicleModal] = useState(false);
  const [useSamePickupLocation, setUseSamePickupLocation] = useState(true);
  
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

  const handleVehicleTypeChange = (vehicleType) => {
    setSelectedVehicleType(vehicleType);
    setSelectedVehicleModel(''); // Reset model when type changes
  };

  // === PHOTO UPLOAD HANDLERS ===
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
        alert(`File ${file.name} is too large. Maximum size is 2GB.`);
        return;
      }
      
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
  };

  const handleCoverImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
      alert('File is too large. Maximum size is 2GB.');
      return;
    }
    
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
    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
      alert(`File ${file.name} is too large. Maximum size is 2GB.`);
      return;
    }
    
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
  const deleteVehicle = (index) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(prev => prev.filter((_, idx) => idx !== index));
      // Also clear edit mode if deleting the vehicle being edited
      if (editingVehicleIndex === index) {
        clearVehicleForm();
        setEditingVehicleIndex(null);
      }
    }
  };

  // === STEP 5 VEHICLE FORM HANDLERS ===
  const saveVehicleOption = () => {
    // Validate all required fields
    if (!vehicleTitle || !selectedVehicleType || !selectedVehicleModel || 
        !vehicleAttributes || !numTravellers || !currency || 
        !pricingType || !productAmount || !totalDuration || !vehicleDescription) {
      alert('Please fill in all required fields before saving.');
      return;
    }

    const newVehicle = {
      id: editingVehicleIndex !== null ? vehicles[editingVehicleIndex].id : Date.now(),
      title: vehicleTitle,
      type: selectedVehicleType,
      model: selectedVehicleModel,
      year: vehicleYear,
      attributes: vehicleAttributes,
      capacity: parseInt(numTravellers),
      currency: currency,
      pricingType: pricingType,
      amount: productAmount,
      duration: totalDuration,
      description: vehicleDescription
    };

    if (editingVehicleIndex !== null) {
      // Update existing vehicle
      setVehicles(prev => prev.map((v, idx) => 
        idx === editingVehicleIndex ? newVehicle : v
      ));
      setEditingVehicleIndex(null);
    } else {
      // Add new vehicle
      setVehicles(prev => [...prev, newVehicle]);
    }

    // Clear form
    clearVehicleForm();
    alert('Vehicle option saved successfully!');
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
  };

  const editVehicleOption = (index) => {
    const vehicle = vehicles[index];
    setVehicleTitle(vehicle.title);
    setSelectedVehicleType(vehicle.type);
    setSelectedVehicleModel(vehicle.model);
    setVehicleYear(vehicle.year);
    setVehicleAttributes(vehicle.attributes);
    setNumTravellers(vehicle.capacity.toString());
    setCurrency(vehicle.currency);
    setPricingType(vehicle.pricingType);
    setProductAmount(vehicle.amount);
    setTotalDuration(vehicle.duration);
    setVehicleDescription(vehicle.description);
    setEditingVehicleIndex(index);
    
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
                <p className="text-sm text-gray-600 mb-3">Enter a clear and descriptive name for your product or service. (title should be maximum 40 characters)</p>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="e.g., Mount Fuji, Tokyo"
                  required
                  maxLength={40}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">{productTitle.length}/40 characters maximum</p>
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
               <div className="flex items-center mb-4">
                 <FiSend className="text-blue-600 mr-3" size={20} />
                 <h3 className="text-lg font-bold text-gray-900">Pick-up locations</h3>
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
                   placeholder="Search or enter pick-up locations"
                   value={selectedPickupLocation}
                   onChange={(e) => setSelectedPickupLocation(e.target.value)}
                   onClick={() => setShowPickupDropdown(!showPickupDropdown)}
                   className="w-full pl-10 pr-10 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                 />
                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
                 
                 {/* Pick-up Locations Dropdown */}
                 {showPickupDropdown && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                     <div className="p-2 max-h-64 overflow-y-auto">
                       {[
                         'Shibuya Crossing, Tokyo',
                         'Asakusa (Senso-ji Temple), Tokyo',
                         'Fushimi Inari Shrine, Kyoto',
                         'Arashiyama Bamboo Grove, Kyoto',
                         'Dotonbori, Osaka',
                         'Peace Memorial Park, Hiroshima',
                         'Mount Fuji 5th Station'
                       ].map((location, index) => (
                         <div 
                           key={index} 
                           className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                           onClick={() => {
                             setSelectedPickupLocation(location);
                             setShowPickupDropdown(false);
                           }}
                         >
                           {location}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>

               {/* Map and Action buttons container */}
               <div className="flex gap-4">
                 {/* Map Component */}
                 <div className="flex-1 relative bg-gray-100 border border-gray-300 rounded-lg h-64">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="text-center">
                       <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                         </svg>
                       </div>
                       <p className="text-gray-600">Map View</p>
                       <p className="text-sm text-gray-500">Tokyo area highlighted</p>
                     </div>
                   </div>
                   
                   {/* Map Controls */}
                   <div className="absolute top-4 right-4 flex flex-col space-y-2">
                     <button className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">
                       <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                     </button>
                     <button className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">
                       <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                       </svg>
                     </button>
                     <button className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">
                       <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                       </svg>
                     </button>
                   </div>
                 </div>

                 {/* Action buttons on the right */}
                 <div className="flex flex-col space-y-3 w-64">
                   <button className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 text-left">
                     Drag to choose the area you wants to deal
                   </button>
                   <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                     Add another area
                   </button>
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

             {/* Drop-off Locations Section */}
             {!useSamePickupLocation && (
             <div className="mb-8">
               <div className="flex items-center mb-4">
                 <FiSend className="text-blue-600 mr-3" size={20} />
                 <h3 className="text-lg font-bold text-gray-900">Drop-off locations</h3>
               </div>
               
               {/* Search Field */}
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                 </div>
                 <input
                   type="text"
                   placeholder="Search or enters drop-off locations"
                   value={selectedDropoffLocation}
                   onChange={(e) => setSelectedDropoffLocation(e.target.value)}
                   onClick={() => setShowDropoffDropdown(!showDropoffDropdown)}
                   className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                 />
                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
                 
                 {/* Drop-off Locations Dropdown */}
                 {showDropoffDropdown && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                     <div className="p-2 max-h-64 overflow-y-auto">
                       {[
                         'Shibuya Crossing, Tokyo',
                         'Asakusa (Senso-ji Temple), Tokyo',
                         'Fushimi Inari Shrine, Kyoto',
                         'Arashiyama Bamboo Grove, Kyoto',
                         'Dotonbori, Osaka',
                         'Peace Memorial Park, Hiroshima',
                         'Mount Fuji 5th Station'
                       ].map((location, index) => (
                         <div 
                           key={index} 
                           className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                           onClick={() => {
                             setSelectedDropoffLocation(location);
                             setShowDropoffDropdown(false);
                           }}
                         >
                           {location}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
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
                       
                       <button className="ml-4 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                         Add new time
                       </button>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => setShowSelectVehicleModal(true)}
                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                   >
                     Select Vehicle
                   </button>
                 </div>
               </div>

               {/* Gap between Pick-up time container and below content */}
               <div className="mb-8"></div>

               {/* Checkbox and Week Days */}
               <div className="flex items-center space-x-4 mb-6">
                 <label className="flex items-center">
                   <input type="checkbox" className="mr-2 w-4 h-4 text-blue-600 bg-blue-600 border-blue-600 rounded" defaultChecked />
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

               {/* Main Content Grid - Monday/Tuesday on left, Auto Intervals on right */}
               <div className="grid grid-cols-3 gap-6">
                 {/* Left Side - Monday & Tuesday Time Slots */}
                 <div className="col-span-2 space-y-6">
                   {/* Monday */}
                   <div>
                     <h4 className="text-sm font-bold text-gray-900 mb-3">Monday</h4>
                     <div className="grid grid-cols-5 gap-2">
                       {['06 : 00', '06 : 30', '07 : 00', '07 : 30', '08 : 00', '08 : 30', '09 : 00', '09 : 30', '10 : 00', '10 : 30', '11 : 00', '11 : 30', '12 : 00', '12 : 30', '13 : 00'].map((time, index) => (
                         <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-sm">
                           <span className="text-gray-700">{time}</span>
                           <button className="text-gray-400 hover:text-red-500">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Tuesday */}
                   <div>
                     <h4 className="text-sm font-bold text-gray-900 mb-3">Tuesday</h4>
                     <div className="grid grid-cols-5 gap-2">
                       {['06 : 00', '06 : 30', '07 : 00', '07 : 30', '08 : 00', '08 : 30', '09 : 00', '09 : 30', '10 : 00', '10 : 30', '11 : 00', '11 : 30', '12 : 00', '12 : 30', '13 : 00'].map((time, index) => (
                         <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-sm">
                           <span className="text-gray-700">{time}</span>
                           <button className="text-gray-400 hover:text-red-500">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
                 
                 {/* Right Side - Auto Intervals Container */}
                 <div className="col-span-1">
                   <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 h-fit">
                     <div className="flex items-center space-x-2 mb-3">
                       <input
                         type="text"
                         defaultValue="06 : 00"
                         className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-center text-sm"
                       />
                       <span className="text-gray-500 text-sm">and</span>
                       <input
                         type="text"
                         defaultValue="20 : 30"
                         className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-center text-sm"
                       />
                     </div>
                     <p className="text-xs text-gray-600 mb-3">You can add starting and ending time with the auto intervals of time.</p>
                     <div className="flex items-center space-x-2">
                       <input
                         type="text"
                         defaultValue="00 : 30"
                         className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-center text-sm"
                       />
                       <span className="text-xs text-gray-600">Duration between the time in minutes.</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Select Vehicle Modal */}
             {showSelectVehicleModal && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                 <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                   {/* Modal Header */}
                   <div className="p-6 border-b border-gray-200 relative sticky top-0 bg-white z-10">
                     <h2 className="text-lg font-semibold text-gray-900">Select Vehicle</h2>
                     <p className="text-sm text-gray-600 mt-1">Choose a vehicle for this tour from your saved options.</p>
                     
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
                     {vehicles.length === 0 ? (
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
                     ) : (
                       <div className="space-y-3">
                         {vehicles.map((vehicle, index) => (
                           <div 
                             key={vehicle.id}
                             className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                             onClick={() => {
                               // Here you would handle vehicle selection for the tour
                               console.log('Selected vehicle:', vehicle);
                               setShowSelectVehicleModal(false);
                             }}
                           >
                             <div className="flex justify-between items-start">
                               <div className="flex-1">
                                 <div className="flex items-baseline mb-1">
                                   <h3 className="text-lg font-bold text-gray-900">{vehicle.title}</h3>
                                 </div>
                                 <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                                   <span className="italic">{vehicle.attributes}</span>
                                   <span>{vehicle.year}</span>
                                   <span>Best for upto <span className="text-blue-600 font-medium">{vehicle.capacity < 10 ? '0' : ''}{vehicle.capacity}</span></span>
                                   <span>Approximate time <span className="text-blue-600 font-medium">{vehicle.duration}</span></span>
                                 </div>
                                 <p className="text-xs text-gray-500 leading-relaxed mb-2">
                                   {vehicle.description}
                                 </p>
                                 <div className="flex items-center space-x-2 text-sm">
                                   <span className="font-semibold text-blue-600">{vehicle.currency} {vehicle.amount}</span>
                                   <span className="text-gray-400">•</span>
                                   <span className="text-gray-600">{vehicle.pricingType}</span>
                                 </div>
                               </div>
                               <div className="text-right ml-4">
                                 <div className="text-lg font-bold text-blue-600">{vehicle.currency} {vehicle.amount}</div>
                                 <div className="text-xs text-gray-600">{vehicle.pricingType}</div>
                                 <div className="text-xs text-gray-400 mt-1">
                                   20% Commission will be charged
                                 </div>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>

                   {/* Modal Footer */}
                   {vehicles.length > 0 && (
                     <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                       <button
                         onClick={() => setShowSelectVehicleModal(false)}
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                       >
                         Cancel
                       </button>
                     </div>
                   )}
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
                  {editingVehicleIndex !== null && (
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
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      {editingVehicleIndex !== null ? 'Update' : 'Save'}
                    </button>
                    {editingVehicleIndex !== null && (
                      <button 
                        onClick={() => {
                          clearVehicleForm();
                          setEditingVehicleIndex(null);
                        }}
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
                
                {vehicles.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-500">No vehicles added yet. Click "Select Vehicle" above to add your first vehicle.</p>
                  </div>
                ) : (
                  vehicles.map((vehicle, index) => (
                    <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {vehicle.title || `${vehicle.type} - ${vehicle.model.replace('-', ' ')}`}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>{vehicle.attributes}</span>
                            <span>{vehicle.year}</span>
                            <span>Best for upto {vehicle.capacity < 10 ? '0' : ''}{vehicle.capacity}</span>
                            <span>Approximate time {vehicle.duration}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {vehicle.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm mt-3">
                            <span className="font-semibold text-blue-600">{vehicle.currency} {vehicle.amount}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">{vehicle.pricingType}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button 
                            onClick={() => editVehicleOption(index)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit vehicle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => deleteVehicle(index)}
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
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
            // Vehicle data
            vehicles: vehicles,
            // Location & Time data
            pickupLocation: selectedPickupLocation,
            dropoffLocation: selectedDropoffLocation,
            pickupTime: `${selectedPickupHour}:${selectedPickupMinute}`,
            weekDay: selectedWeekDay,
            selectedDate: selectedDate
          }}
        />
      )}
    </div>
  );
};

export default CreateProductComponent;