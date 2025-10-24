import React, { useState } from 'react';
import { FiClock, FiMapPin, FiRotateCcw, FiPlus, FiX, FiCheckCircle, FiChevronDown, FiCamera, FiUpload, FiEdit3, FiTrash2, FiUser, FiStar } from 'react-icons/fi';
import MountFujiTourPage from './MountFujiTourPage';

const AddItineraryComponent = ({ onClose, onBack, coverImage, uploadedPhotos, productData }) => {
  const [selectedTourType, setSelectedTourType] = useState('One day Tour');
  const [showAddItineraryModal, setShowAddItineraryModal] = useState(false);
  const [showAttractionsDropdown, setShowAttractionsDropdown] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState('Select Attractions');
  const [entryIsFree, setEntryIsFree] = useState(true);
  const [hours, setHours] = useState('02');
  const [minutes, setMinutes] = useState('30');
  const [hasSavedItinerary, setHasSavedItinerary] = useState(false);
  const [itineraryEntries, setItineraryEntries] = useState([]);
  const [showSubmitView, setShowSubmitView] = useState(false);
  const [showFinalLook, setShowFinalLook] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');

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
    const newEntry = {
      id: Date.now(),
      placeName: placeName || 'Fujinimiya',
      location: `${placeName || 'Fujinimiya'} - Mont. Fuji`,
      description: description || 'Beautiful mountain views and traditional temples',
      attractionType: selectedAttraction === 'Select Attractions' ? 'Sightseeing & Photography' : selectedAttraction,
      timeSpent: `${hours}h ${minutes}min`,
      isFree: entryIsFree,
      hasPhoto: false
    };
    
    setItineraryEntries(prev => [...prev, newEntry]);
    setShowAddItineraryModal(false);
    setHasSavedItinerary(true);
    setShowSubmitView(true); // Automatically navigate to the submit view
    
    // Reset form
    setPlaceName('');
    setDescription('');
    setSelectedAttraction('Select Attractions');
    setHours('02');
    setMinutes('30');
    setEntryIsFree(true);
  };

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
    setItineraryEntries(prev => prev.filter(entry => entry.id !== id));
    if (itineraryEntries.length === 1) {
      setHasSavedItinerary(false);
    }
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

                      {/* Pickup Locations */}
                      {productData?.pickupLocations && productData.pickupLocations.length > 0 && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <FiMapPin className="mr-2 text-green-600" size={18} />
                            Pick-up Locations:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {productData.pickupLocations.map((location, index) => (
                              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                {location}
                              </span>
                            ))}
                          </div>
                          {productData.pickupTime && (
                            <p className="text-sm text-gray-600 mt-2">
                              Pick-up Time: {productData.pickupTime}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Drop-off Locations */}
                      {productData?.dropoffLocations && productData.dropoffLocations.length > 0 && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <FiMapPin className="mr-2 text-blue-600" size={18} />
                            Drop-off Locations:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {productData.dropoffLocations.map((location, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {location}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Complete Timeline */}
                      <div className="relative">
                        {/* Timeline Line - extends to very bottom */}
                        <div className="absolute left-4 top-4 w-1 bg-gray-800" style={{height: `${(itineraryEntries.length + 2) * 96 + 160}px`}}></div>

                        {/* Start Point - Mount Fuji */}
                        <div className="flex items-start mb-8 relative">
                          <div className="w-8 h-8 border-2 border-black bg-gray-200 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                            {/* Mountain with person icon */}
                            <div className="w-4 h-4 flex flex-col items-center justify-end">
                              <div className="w-2 h-1.5 bg-black rounded-t-sm"></div>
                              <div className="w-0.5 h-1 bg-black rounded-full mt-0.5"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-black mb-2">Mount Fuji</h3>
                            <p className="text-gray-600 mb-3">Iconic mountain views and traditional temples</p>
                            
                            {/* Activities Section */}
                            <div className="mb-3">
                              <p className="text-gray-600 font-bold mb-2">Activities:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Sightseeing & Photography</span>
                                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Food & Drink</span>
                                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Cultural visit</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Free</span>
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">3h 30min</span>
                            </div>
                          </div>
                        </div>

                        {/* Itinerary Entries */}
                        {itineraryEntries.map((entry, index) => (
                          <div key={entry.id} className="flex items-start mb-8 relative">
                            <div className="w-8 h-8 border-2 border-black bg-gray-200 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                              {/* Person torso with head icon */}
                              <div className="w-4 h-4 flex flex-col items-center justify-center">
                                <div className="w-0.5 h-0.5 bg-black rounded-full mb-0.5"></div>
                                <div className="w-2 h-1.5 bg-black rounded-sm"></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-black mb-2">{entry.location}</h3>
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
                                  {entry.isFree ? 'Free' : 'Paid'}
                                </span>
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                                  {entry.timeSpent}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* End Point - Finished Return */}
                        <div className="flex items-start relative">
                          <div className="w-8 h-8 border-2 border-black bg-gray-200 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                            {/* Return arrow icon */}
                            <FiRotateCcw className="w-4 h-4 text-black" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-black mb-2">Finished - Return</h3>
                            <p className="text-gray-600 mb-3">Fujinomiya – thrill at the foot of Mount Fuji with stunning views, waterfalls, and adventure all around!</p>
                            
                            {/* Activities Section */}
                            <div className="mb-3">
                              <p className="text-gray-600 font-bold mb-2">Activities:</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Sightseeing & Photography</span>
                                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Food & Drink</span>
                                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">Cultural visit</span>
                              </div>
                            </div>
                          </div>
                        </div>
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
                        <div className="absolute left-4 top-4 bottom-4 w-1 bg-black"></div>

                        {/* Start Point - Mount Fuji */}
                        <div className="flex items-start mb-12 relative">
                          <div className="w-8 h-8 border-2 border-black bg-gray-200 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                            {/* Mountain with person icon */}
                            <div className="w-4 h-4 flex flex-col items-center justify-end">
                              <div className="w-2 h-1.5 bg-black rounded-t-sm"></div>
                              <div className="w-0.5 h-1 bg-black rounded-full mt-0.5"></div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-black">Mount Fuji</h3>
                          </div>
                        </div>

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
                            <h3 className="text-2xl font-bold text-black mb-4">Add your first itinerary</h3>
                      <button
                              onClick={() => setShowAddItineraryModal(true)}
                              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4 text-lg font-medium"
                            >
                              Create itinerary
                            </button>
                            <p className="text-gray-600 text-base">
                              Add the stopovers or mid-points you'll visit on the way to Mount Fuji.
                            </p>
                          </div>
                        </div>

                        {/* End Point - Finished Return */}
                        <div className="flex items-start relative">
                          <div className="w-8 h-8 border-2 border-black bg-gray-200 rounded-full flex items-center justify-center mr-6 flex-shrink-0 relative z-10">
                            {/* Return arrow icon */}
                            <FiRotateCcw className="w-4 h-4 text-black" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-black">Finished - Return</h3>
                          </div>
                        </div>
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
                                  {entry.isFree ? 'Free' : 'Paid'}
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
                              <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                                <FiEdit3 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
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
              <h2 className="text-xl font-bold text-black">Add new Itinerary stop</h2>
              <button
                onClick={() => setShowAddItineraryModal(false)}
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
                    placeholder="Enter the ticket fare here.."
                    className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center">
                    <FiCamera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-gray-600 mb-1">Upload Photo</span>
                    <FiUpload className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={handleSaveItinerary}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItineraryComponent;