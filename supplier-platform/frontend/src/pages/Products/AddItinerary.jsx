// Frontend/src/pages/Products/AddItinerary.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiInfo, FiMapPin, FiClock, FiPlus, FiX } from 'react-icons/fi';

const AddItinerary = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [itineraryData, setItineraryData] = useState({
    placeName: 'Fujinimiya',
    description: '',
    attractionsType: '',
    timeHours: '02',
    timeMinutes: '30',
    entryFree: true,
    ticketFare: '',
  });
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Overview', completed: true },
    { id: 2, title: 'Itinerary', completed: false },
    { id: 3, title: 'Details', completed: false },
    { id: 4, title: 'Photos', completed: false },
    { id: 5, title: 'Pricing', completed: false },
    { id: 6, title: 'Review', completed: false },
  ];

  const attractionTypes = [
    'Sightseeing & Photography',
    'Cultural Visits',
    'Food & Dining',
    'Adventure & Sports',
    'Shopping',
    'Museum & Galleries',
    'Nature & Wildlife',
    'Historical Tour'
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveItinerary = () => {
    setShowAddModal(false);
    // Handle saving itinerary item
    console.log('Itinerary saved:', itineraryData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Tour Itinerary Overview */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour Itinerary</h2>
              <p className="text-gray-600 mb-6">Your personalized travel plan at a glance</p>
              
              <div className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full w-fit">
                <FiClock className="mr-2" size={16} />
                One day Tour (06:00 - 23:15)
              </div>
            </div>

            {/* Itinerary Timeline */}
            <div className="relative">
              <div className="flex items-center space-x-6">
                {/* Start Point */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <FiMapPin className="text-white" size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Mount Fuji</span>
                </div>

                {/* Vertical Line */}
                <div className="flex-1 h-px bg-gray-300"></div>

                {/* Add Itinerary Step */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-2"></div>
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900 mb-2">Add your first itinerary</h3>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-2"
                    >
                      Create itinerary
                    </button>
                    <p className="text-sm text-gray-600">
                      Add the stopovers or mid-points you'll visit on the way to Mount Fuji.
                    </p>
                  </div>
                </div>

                {/* Vertical Line */}
                <div className="flex-1 h-px bg-gray-300"></div>

                {/* End Point */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mb-2">
                    <FiClock className="text-white" size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Finished - Return</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add new Itinerary stop</h2>
            
            {/* Place Name */}
            <div className="form-group">
              <label className="form-label">Place Name</label>
              <input
                type="text"
                className="input"
                value={itineraryData.placeName}
                onChange={(e) => setItineraryData({ ...itineraryData, placeName: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input h-24 resize-none"
                placeholder="Write Here"
                value={itineraryData.description}
                onChange={(e) => setItineraryData({ ...itineraryData, description: e.target.value })}
              />
            </div>

            {/* Attractions Type */}
            <div className="form-group">
              <label className="form-label">Attractions Type</label>
              <div className="relative">
                <select
                  className="input appearance-none pr-8"
                  value={itineraryData.attractionsType}
                  onChange={(e) => setItineraryData({ ...itineraryData, attractionsType: e.target.value })}
                >
                  <option value="">Select Attractions</option>
                  {attractionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <FiChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Time to Spend */}
            <div className="form-group">
              <label className="form-label">Time to Spend</label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    className="input"
                    value={itineraryData.timeHours}
                    onChange={(e) => setItineraryData({ ...itineraryData, timeHours: e.target.value })}
                  />
                  <span className="text-sm text-gray-600">Hours</span>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    className="input"
                    value={itineraryData.timeMinutes}
                    onChange={(e) => setItineraryData({ ...itineraryData, timeMinutes: e.target.value })}
                  />
                  <span className="text-sm text-gray-600">Minutes</span>
                </div>
              </div>
            </div>

            {/* Entry is Free */}
            <div className="form-group">
              <label className="form-label">Entry is Free</label>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Enter the ticket fare here.."
                  value={itineraryData.ticketFare}
                  onChange={(e) => setItineraryData({ ...itineraryData, ticketFare: e.target.value })}
                />
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Entry is Free</span>
                  <div className={`toggle-switch ${itineraryData.entryFree ? 'active' : ''}`}>
                    <div className="toggle-switch-thumb"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Photo */}
            <div className="form-group">
              <label className="form-label">Upload your Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center">
                  <FiPlus className="text-gray-400 mb-2" size={32} />
                  <span className="text-gray-600">Upload Photo</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveItinerary}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        );

      default:
        return <div>Step {currentStep} content coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                {/* TripsAdora Logo */}
                <img 
                  src="/assets/logo.jpg" 
                  alt="TripsAdora" 
                  className="h-8 w-auto"
                />
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="hover:text-blue-200">Home</a>
                <a href="#" className="hover:text-blue-200">FAQs</a>
                <a href="#" className="hover:text-blue-200">Support</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <select className="bg-blue-800 text-white border-none rounded px-2 py-1">
                <option>EN</option>
              </select>
              <span className="text-sm">Available Balance $1850</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span className="text-sm">ID 00032123</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold mb-6">Add Itinerary</h2>
                
                {/* Progress Steps */}
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        step.id <= currentStep ? 'bg-blue-600' : 'bg-white bg-opacity-20'
                      }`}>
                        {step.id < currentStep ? (
                          <FiChevronRight size={16} />
                        ) : (
                          <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      <span className={`text-sm ${step.id <= currentStep ? 'font-medium' : 'opacity-70'}`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.id <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.id < currentStep ? (
                        <FiChevronRight size={16} />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-2 ${
                        step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Information Banner */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-start">
                <FiInfo className="text-blue-600 mt-0.5 mr-3" size={20} />
                <p className="text-gray-700 text-sm">
                  Your choices set up your product. please review carefully; changes can't be made later.
                </p>
              </div>

              {/* Step Content */}
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Back
                </button>
                
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentStep === 1 ? 'Submit' : 'Final look'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Itinerary Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add new Itinerary stop</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content - Same as Step 2 */}
            <div className="space-y-6">
              {/* Place Name */}
              <div className="form-group">
                <label className="form-label">Place Name</label>
                <input
                  type="text"
                  className="input"
                  value={itineraryData.placeName}
                  onChange={(e) => setItineraryData({ ...itineraryData, placeName: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="input h-24 resize-none"
                  placeholder="Write Here"
                  value={itineraryData.description}
                  onChange={(e) => setItineraryData({ ...itineraryData, description: e.target.value })}
                />
              </div>

              {/* Attractions Type */}
              <div className="form-group">
                <label className="form-label">Attractions Type</label>
                <div className="relative">
                  <select
                    className="input appearance-none pr-8"
                    value={itineraryData.attractionsType}
                    onChange={(e) => setItineraryData({ ...itineraryData, attractionsType: e.target.value })}
                  >
                    <option value="">Select Attractions</option>
                    {attractionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <FiChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Time to Spend */}
              <div className="form-group">
                <label className="form-label">Time to Spend</label>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      className="input"
                      value={itineraryData.timeHours}
                      onChange={(e) => setItineraryData({ ...itineraryData, timeHours: e.target.value })}
                    />
                    <span className="text-sm text-gray-600">Hours</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      className="input"
                      value={itineraryData.timeMinutes}
                      onChange={(e) => setItineraryData({ ...itineraryData, timeMinutes: e.target.value })}
                    />
                    <span className="text-sm text-gray-600">Minutes</span>
                  </div>
                </div>
              </div>

              {/* Entry is Free */}
              <div className="form-group">
                <label className="form-label">Entry is Free</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Enter the ticket fare here.."
                    value={itineraryData.ticketFare}
                    onChange={(e) => setItineraryData({ ...itineraryData, ticketFare: e.target.value })}
                  />
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Entry is Free</span>
                    <div 
                      className={`toggle-switch ${itineraryData.entryFree ? 'active' : ''}`}
                      onClick={() => setItineraryData({ ...itineraryData, entryFree: !itineraryData.entryFree })}
                    >
                      <div className="toggle-switch-thumb"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Photo */}
              <div className="form-group">
                <label className="form-label">Upload your Photo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center">
                    <FiPlus className="text-gray-400 mb-2" size={32} />
                    <span className="text-gray-600">Upload Photo</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveItinerary}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
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

export default AddItinerary;

