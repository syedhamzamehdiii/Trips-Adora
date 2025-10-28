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

const MountFujiTourPage = ({ coverImage, uploadedPhotos, productData, onBack }) => {
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [language, setLanguage] = useState('US English');
  const [currency, setCurrency] = useState('$ USD - US Dollar');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleSaveDraft = () => {
    try {
      // Get current products from localStorage
      const allProductsData = localStorage.getItem('all_products');
      let allProducts = allProductsData ? JSON.parse(allProductsData) : [];
      
      console.log('📦 Current products before save:', allProducts.length);
      
      // Check if this draft already exists in all_products
      const existingDraftIndex = allProducts.findIndex(p => 
        p.name === (productData?.title || 'Untitled Product') && p.status === 'Draft'
      );
      
      // Generate unique draft ID
      const draftId = existingDraftIndex >= 0 ? allProducts[existingDraftIndex].id : Date.now();
      
      const draftProduct = {
        id: draftId,
        name: productData?.title || 'Untitled Product',
        referenceCode: existingDraftIndex >= 0 ? allProducts[existingDraftIndex].referenceCode : `T-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Draft',
        bookings: 0,
        revenue: parseInt(productData?.vehicles?.[0]?.amount || 0),
        creationDate: existingDraftIndex >= 0 ? allProducts[existingDraftIndex].creationDate : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
        ratings: "0/5",
        vehicles: Array.isArray(productData?.vehicles) ? productData.vehicles : []
      };
      
      // Update existing draft or add new one
      if (existingDraftIndex >= 0) {
        allProducts[existingDraftIndex] = draftProduct;
        console.log('✅ Draft updated successfully!', draftProduct);
      } else {
        allProducts.push(draftProduct);
        console.log('✅ Draft saved successfully!', draftProduct);
      }
      
      // Save back to localStorage
      localStorage.setItem('all_products', JSON.stringify(allProducts));
      console.log('📦 Total products after save:', allProducts.length);
      
      // ** IMPORTANT: Also save the FULL product data for editing later **
      // NOTE: Images (uploadedPhotos, coverImage) are excluded to avoid localStorage quota errors
      const fullDraftData = {
        draftId: draftId,
        productTitle: productData?.title || 'Untitled Product',
        productCategory: productData?.category || '',
        sellingPoints: productData?.sellingPoints || '',
        tagline: productData?.tagline || '',
        description: productData?.description || '',
        highlights: productData?.highlights || [],
        // uploadedPhotos: excluded due to localStorage size limits
        // coverImage: excluded due to localStorage size limits
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
      
      // Save full draft data under unique key
      localStorage.setItem(`product_draft_${draftId}`, JSON.stringify(fullDraftData));
      console.log('💾 Full draft data saved to product_draft_' + draftId + ' (images excluded)');
      
      // Verify save
      const verifyData = localStorage.getItem('all_products');
      const verifyProducts = JSON.parse(verifyData);
      console.log('✔️ Verified products in localStorage:', verifyProducts.length);
      
      // Show success message
      alert('✅ Draft saved successfully! Refreshing to show in listings...');
      
      // Force reload after 1 second to show the new draft
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      alert('Error saving draft. Please try again.');
    }
  };

  const handlePublishProduct = () => {
    try {
      // Get current products from localStorage
      const allProductsData = localStorage.getItem('all_products');
      let allProducts = allProductsData ? JSON.parse(allProductsData) : [];
      
      console.log('📦 Current products before publish:', allProducts.length);
      
      // Find and remove any existing draft with the same name, and track IDs for cleanup
      const draftIdsToDelete = [];
      const beforeFilter = allProducts.length;
      allProducts = allProducts.filter(p => {
        if (p.name === (productData?.title || 'Untitled Product') && p.status === 'Draft') {
          draftIdsToDelete.push(p.id); // Track draft ID for full data deletion
          return false; // Remove this draft
        }
        return true; // Keep this product
      });
      console.log('🗑️ Removed drafts:', beforeFilter - allProducts.length);
      
      // Create new product entry
      const newProduct = {
        id: Date.now(), // Use timestamp as unique ID
        name: productData?.title || 'Untitled Product',
        referenceCode: `T-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Published',
        bookings: 0,
        revenue: parseInt(productData?.vehicles?.[0]?.amount || 0),
        creationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
        ratings: "0/5",
        vehicles: Array.isArray(productData?.vehicles) ? productData.vehicles : [],
        // Persist vehicle-time allocations for availability filters
        vehicleTimeAllocations: Array.isArray(productData?.vehicleTimeAllocations) ? productData.vehicleTimeAllocations : []
      };
      
      // Add to products array
      allProducts.push(newProduct);
      
      // Save back to localStorage
      localStorage.setItem('all_products', JSON.stringify(allProducts));
      console.log('✅ Product published successfully!', newProduct);
      console.log('📦 Total products after publish:', allProducts.length);

      // Also persist full published data for cloning later (same shape as drafts)
      const fullPublishedData = {
        draftId: newProduct.id,
        productTitle: productData?.title || 'Untitled Product',
        productCategory: productData?.category || '',
        sellingPoints: productData?.sellingPoints || '',
        tagline: productData?.tagline || '',
        description: productData?.description || '',
        highlights: productData?.highlights || [],
        // images excluded due to quota limits
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
        selectedPickupLocations: productData?.pickupLocations || [],
        selectedDropoffLocations: productData?.dropoffLocations || [],
        pickupTime: productData?.pickupTime || '',
        selectedWeekDay: productData?.weekDay || '',
        selectedDate: productData?.selectedDate || '',
        itineraries: productData?.itineraries || [],
        lastModified: new Date().toISOString()
      };
      localStorage.setItem(`product_full_${newProduct.id}`, JSON.stringify(fullPublishedData));
      console.log('💾 Full published data saved to', `product_full_${newProduct.id}`);
      
      // Verify save
      const verifyData = localStorage.getItem('all_products');
      const verifyProducts = JSON.parse(verifyData);
      console.log('✔️ Verified products in localStorage:', verifyProducts.length);
      
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
