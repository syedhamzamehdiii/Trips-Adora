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
  const [selectedLanguage, setSelectedLanguage] = useState('Select Language');
  
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

  const handleVehicleTypeChange = (vehicleType) => {
    setSelectedVehicleType(vehicleType);
    setSelectedVehicleModel(''); // Reset model when type changes
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

  const nextStep = () => setStep((prev) => prev + 1);
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
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
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
                <label className="block text-sm font-medium text-gray-900 mb-2">Product Title</label>
                <p className="text-sm text-gray-600 mb-3">Enter a clear and descriptive name for your product or service. (title should be minimum 30 characters)</p>
                <input
                  type="text"
                  defaultValue="Mount fuji, Tokoyo"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                <p className="text-sm text-gray-600 mb-3">Select the category that best matches your product or service. Choose from Tour, Hotel, or Rent a Car.</p>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
                    <option>Category</option>
                    <option>Tour</option>
                    <option>Hotel</option>
                    <option>Rent a Car</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Selling Points</label>
                <p className="text-sm text-gray-600 mb-3">Choose the overall look, design, or concept that best represents your product.</p>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
                    <option>Choose Style</option>
                    <option>Art, Design, & Fashion</option>
                    <option>Entertainment</option>
                    <option>Food & Drink</option>
                    <option>Health & Fitness</option>
                    <option>History & Culture</option>
                    <option>Travel</option>
                    <option>Holidays</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tagline</label>
                <p className="text-sm text-gray-600 mb-1">This description will appear under your activity title.</p>
                <p className="text-sm text-gray-600 mb-3">Start with a short intro (2-3 sentences), then describe the full experience in order.</p>
                <textarea
                  rows="4"
                  placeholder="Please write atleast 50 Characters."
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
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

            {/* Warning Message */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 flex items-start">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-gray-900 text-sm">Your highlights define what makes this product unique. Please review carefully.</p>
            </div>

            <div className="space-y-8">
              {/* Description Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 mb-4">Describe your product or service clearly, highlighting key features and benefits in detail.</p>
                <textarea
                  placeholder="Please write at least 500 Characters."
                  rows="6"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Highlights Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Highlights</h3>
                <p className="text-gray-600 mb-4">Describe in 3-5 sentences what makes your activity unique and different from others. Highlight the special features or experiences that set it apart, so customers can easily compare and see why yours is the best choice.</p>
                
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        placeholder="Churelto Pagoda and Lake Kawaguchi."
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-3 text-sm text-gray-400">0/30</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-right mt-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Add another highlights
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
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
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
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center mb-2">
                <FiUpload className="mr-2" size={16} />
                Upload Photo
              </button>
              <p className="text-sm text-gray-600">Only JPG, PNG, SVG (3MB Max)</p>
            </div>

            {/* Cover Image Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cover Image</h3>
              
              {/* Image Field and Do/Don't Sections */}
              <div className="flex gap-6 mb-4">
                {/* Cover Image Field */}
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">Drag and drop your cover image here</p>
                      <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                    </div>
                  </div>
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

              <p className="text-sm text-gray-600 mb-4">You can also change cover image</p>
              
              {/* Thumbnail Images */}
              <div className="flex space-x-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500">Add image</p>
                    </div>
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
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
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
                <p className="text-gray-600 mb-4 text-sm">Select the language your tour guide will use during the trip.</p>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedLanguage('Arabic')}
                      className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                        selectedLanguage === 'Arabic' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Arabic
                    </button>
                    <button 
                      onClick={() => setSelectedLanguage('French')}
                      className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                        selectedLanguage === 'French' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      French
                    </button>
                    <button 
                      onClick={() => setSelectedLanguage('English')}
                      className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                        selectedLanguage === 'English' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      English
                    </button>
                  </div>
                  
                  <div className="relative">
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="Select Language">Select Language</option>
                      <option value="English">English</option>
                      <option value="Mandarin Chinese">Mandarin Chinese</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
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
                    <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none">
                      <option>Camera</option>
                      <option>Walking Shoes</option>
                      <option>Weather Suitable Clothes</option>
                      <option>Umbrella or Raincoat</option>
                      <option>Camera/Smart Phone</option>
                      <option>Reusable Water Bottle</option>
                      <option>Snacks & Light Foods</option>
                      <option>Power Bank</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                {/* Included & Excluded Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Included & Excluded</h3>
                  <p className="text-gray-600 mb-4 text-sm">Add the things that are Included on the trip and those that are Excluded. (optional)</p>
                  
                  <button 
                    onClick={() => setShowIncludedExcludedModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Click to add
                  </button>
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
               <div className="flex items-center space-x-2">
                 {[1, 2, 3, 4, 5, 6].map((s, index) => (
                   <React.Fragment key={s}>
                     <div
                       className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                         ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
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
                 <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
                   {/* Modal Header */}
                   <div className="p-6 border-b border-gray-200 relative">
                     <h2 className="text-lg font-semibold text-gray-900">Choose which Vehicle will be assigned for the selected pickup time.</h2>
                     <p className="text-sm text-gray-600 mt-1">This helps ensure the right vehicle is scheduled and ready for the traveller.</p>
                     
                     {/* Close Button */}
                     <button
                       onClick={() => setShowSelectVehicleModal(false)}
                       className="absolute top-6 right-6 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full"
                     >
                       <FiX className="w-4 h-4 text-gray-400" />
                     </button>
                   </div>

                   {/* Modal Content - Vertical Stacked Layout */}
                   <div className="p-4 space-y-3">
                     {/* Vehicle Option 1 - Benz A-Class */}
                     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                       <div className="flex justify-between items-start">
                         <div className="flex-1">
                           <div className="flex items-baseline mb-1">
                             <h3 className="text-lg font-bold text-gray-900">Benz</h3>
                             <h3 className="text-lg font-bold text-gray-900 ml-2">A-Class</h3>
                           </div>
                           <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                             <span className="italic text-gray-600">Luxury Premium</span>
                             <span className="text-gray-600">2008</span>
                             <span className="text-gray-600">Best for upto <span className="text-blue-600 font-medium">03</span></span>
                             <span className="text-gray-600">Approximate time <span className="text-blue-600 font-medium">04h</span></span>
                           </div>
                           <p className="text-xs text-gray-500 leading-relaxed">
                             The Mercedes-Benz A-Class combines luxury with modern innovation. It offers a sleek design, premium comfort, and advanced technology features, making every drive stylish and enjoyable.
                           </p>
                         </div>
                         <div className="text-right ml-4">
                           <div className="text-lg font-bold text-blue-600">$40</div>
                           <div className="text-xs text-gray-600">Group Based</div>
                           <div className="text-xs text-gray-400 mt-1">
                             20% Commission will charge per product according to your vehicle
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Vehicle Option 2 - Coster J3-400 */}
                     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                       <div className="flex justify-between items-start">
                         <div className="flex-1">
                           <div className="flex items-baseline mb-1">
                             <h3 className="text-lg font-bold text-gray-900">Coster</h3>
                             <h3 className="text-lg font-bold text-gray-900 ml-2">J3-400</h3>
                           </div>
                           <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                             <span className="italic text-gray-600">Comfort 1.2x</span>
                             <span className="text-gray-600">2008</span>
                             <span className="text-gray-600">Best for upto <span className="text-blue-600 font-medium">03</span></span>
                             <span className="text-gray-600">Approximate time <span className="text-blue-600 font-medium">04h</span></span>
                           </div>
                           <p className="text-xs text-gray-500 leading-relaxed">
                             The Mercedes-Benz A-Class combines luxury with modern innovation. It offers a sleek design, premium comfort, and advanced technology features, making every drive stylish and enjoyable.
                           </p>
                         </div>
                         <div className="text-right ml-4">
                           <div className="text-lg font-bold text-blue-600">$40</div>
                           <div className="text-xs text-gray-600">Group Based</div>
                           <div className="text-xs text-gray-400 mt-1">
                             20% Commission will charge per product according to your vehicle
                           </div>
                         </div>
                       </div>
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
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                        ${s === step ? 'bg-blue-600 text-white border-blue-600' : s < step ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">Title to your Option</h3>
                <input
                  type="text"
                  defaultValue="Mount Fuji tour by private car"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Vehicle Details Grid */}
              <div>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Row 1 */}
                   <div className="relative">
                     <label className="block text-sm font-medium text-gray-900 mb-2">Transportation Type</label>
                     <select 
                       className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-10"
                       value={selectedVehicleType}
                       onChange={(e) => handleVehicleTypeChange(e.target.value)}
                     >
                       <option value="">Select Vehicle</option>
                       <option value="van">Van</option>
                       <option value="car">Car</option>
                       <option value="bus">Bus</option>
                     </select>
                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                   </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Make & Variant</label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-5"
                      value={selectedVehicleModel}
                      onChange={(e) => setSelectedVehicleModel(e.target.value)}
                      disabled={!selectedVehicleType}
                    >
                      <option value="">Select Variant</option>
                      {getVehicleModels().map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Model of vehicle (optional)</label>
                    <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-5">
                      <option value="2008">2008</option>
                      <option value="2009">2009</option>
                      <option value="2012">2012</option>
                      <option value="2014">2014</option>
                      <option value="2018">2018</option>
                      <option value="2020">2020</option>
                    </select>
                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Row 2 */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Vehicle Attributes</label>
                    <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-5">
                      <option>Select Attributes</option>
                      <option>Comfort 1.2x</option>
                      <option>Economy 1x</option>
                      <option>Premium 1.5x</option>
                      <option>Automatic Transmission 1.1x</option>
                      <option>Manual Transmission 1.1x</option>
                      <option>Hybrid 1.3x</option>
                      <option>Electric 1.4x</option>
                    </select>
                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Number of travellers</label>
                    <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-5">
                      <option>03</option>
                      <option>01</option>
                      <option>02</option>
                      <option>04</option>
                    </select>
                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                    <div className="flex items-start mt-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm text-gray-600">Choose the number of traveler which will be best for Trip.</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Currency</label>
                    <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-5">
                      <option>Currency</option>
                      <option>$ US Dollar</option>
                      <option>€ Euro</option>
                      <option>¥ Japanese Yen</option>
                      <option>Rs Pakistani Rupee</option>
                    </select>
                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Row 3 */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Pricing Type</label>
                    <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-5">
                      <option>Select Type</option>
                      <option>Per Group</option>
                      <option>Per Person</option>
                      <option>Shared</option>
                      <option>Hourly Rate</option>
                    </select>
                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Enter the amount of your product</label>
                    <input
                      type="text"
                      placeholder="Enter Amount"
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
                 <div className="relative">
                   <label className="block text-sm font-medium text-gray-900 mb-2">Total duration</label>
                   <p className="text-sm text-gray-600 mb-3">Specify how long the car will be available for your trip.</p>
                   <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer pr-5">
                     <option>8h</option>
                     <option>1h</option>
                     <option>2h</option>
                     <option>3h</option>
                     <option>4h</option>
                     <option>5h</option>
                     <option>6h</option>
                     <option>7h</option>
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
                   </select>
                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </div>
                 </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    defaultValue="The Mercedes-Benz A-Class combines luxury with modern innovation. It offers a sleek design, premium comfort, and advanced technology features, making every drive stylish and enjoyable."
                    rows="4"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                    Save
                  </button>
                </div>
              </div>

              {/* Existing Vehicle Options */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Existing Vehicle Options</h3>
                
                {/* Benz A-Class */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Benz A-Class</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>Luxury Premium</span>
                        <span>2008</span>
                        <span>Best for upto 03</span>
                        <span>Approximate time 04h</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        The Mercedes-Benz A-Class combines luxury with modern innovation. It offers a sleek design, premium comfort, and advanced technology features, making every drive stylish and enjoyable.
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coster J3-400 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Coster J3-400</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>Comfort 1.2x</span>
                        <span>2008</span>
                        <span>Best for upto 03</span>
                        <span>Approximate time 04h</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        The Mercedes-Benz A-Class combines luxury with modern innovation. It offers a sleek design, premium comfort, and advanced technology features, making every drive stylish and enjoyable.
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
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
                 <button
                   onClick={onClose}
                   className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white transition-colors"
                 >
                   Cancel
                 </button>
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
                    src="/assets/WhatsApp Image 2025-10-13 at 4.52.46 PM (1).jpeg" 
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
                  placeholder="Clearly list the services or items NOT covered in the price, such as entry tickets, meals, or equipment, so customers know exactly what they're paying for."
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowIncludedExcludedModal(false)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save
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
        />
      )}
    </div>
  );
};

export default CreateProductComponent;