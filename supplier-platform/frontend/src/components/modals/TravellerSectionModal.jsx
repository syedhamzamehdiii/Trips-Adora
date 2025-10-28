import { useState, useEffect } from 'react';
import { FiChevronDown, FiInfo } from 'react-icons/fi';
import Button from '@/components/common/Button';

const TravellerSectionModal = ({ isOpen, onClose, userProfile }) => {
  // Default user profile data - will be replaced by backend data
  const profile = userProfile || {
    name: "Edward William",
    initials: "EW",
    balance: 1850,
    id: "00002123",
    profileImage: "/assets/profile-placeholder.jpg"
  };
  // hydrate profile from account_settings for realtime header
  try {
    const saved = localStorage.getItem('account_settings') || sessionStorage.getItem('account_settings');
    if (saved) {
      const d = JSON.parse(saved);
      profile.name = d.editableInfo?.publicName || profile.name;
      profile.initials = profile.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
      profile.id = d.profileData?.contactValue || profile.id;
      profile.profileImage = d.globalUserPhoto || profile.profileImage;
    }
  } catch (_) {}
  const [flightInfo, setFlightInfo] = useState({
    showDropdown: false,
    selectedOptions: []
  });

  const [shipInfo, setShipInfo] = useState({
    showDropdown: false,
    selectedOptions: []
  });

  const [trainInfo, setTrainInfo] = useState({
    showDropdown: false,
    selectedOptions: []
  });

  const [specialText, setSpecialText] = useState('');

  // load saved configuration
  useEffect(() => {
    try {
      const saved = localStorage.getItem('traveller_section');
      if (saved) {
        const data = JSON.parse(saved);
        setFlightInfo(data.flightInfo || { showDropdown: false, selectedOptions: [] });
        setShipInfo(data.shipInfo || { showDropdown: false, selectedOptions: [] });
        setTrainInfo(data.trainInfo || { showDropdown: false, selectedOptions: [] });
        setSpecialText(data.specialText || '');
      }
    } catch (_) {}
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setFlightInfo(prev => ({ ...prev, showDropdown: false }));
        setShipInfo(prev => ({ ...prev, showDropdown: false }));
        setTrainInfo(prev => ({ ...prev, showDropdown: false }));
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const persist = (next) => {
    try {
      localStorage.setItem('traveller_section', JSON.stringify(next));
      window.dispatchEvent(new Event('travellerSectionUpdated'));
    } catch (_) {}
  };

  const handleToggle = (category, action, option = null) => {
    if (category === 'flight') {
      if (action === 'toggleDropdown') {
        setFlightInfo(prev => ({ ...prev, showDropdown: !prev.showDropdown }));
      } else if (action === 'selectOption') {
        setFlightInfo(prev => {
          const newSelected = prev.selectedOptions.includes(option)
            ? prev.selectedOptions.filter(opt => opt !== option)
            : [...prev.selectedOptions, option];
          const next = { ...prev, selectedOptions: newSelected };
          persist({ flightInfo: next, shipInfo, trainInfo, specialText });
          return next;
        });
      }
    } else if (category === 'ship') {
      if (action === 'toggleDropdown') {
        setShipInfo(prev => ({ ...prev, showDropdown: !prev.showDropdown }));
      } else if (action === 'selectOption') {
        setShipInfo(prev => {
          const newSelected = prev.selectedOptions.includes(option)
            ? prev.selectedOptions.filter(opt => opt !== option)
            : [...prev.selectedOptions, option];
          const next = { ...prev, selectedOptions: newSelected };
          persist({ flightInfo, shipInfo: next, trainInfo, specialText });
          return next;
        });
      }
    } else if (category === 'train') {
      if (action === 'toggleDropdown') {
        setTrainInfo(prev => ({ ...prev, showDropdown: !prev.showDropdown }));
      } else if (action === 'selectOption') {
        setTrainInfo(prev => {
          const newSelected = prev.selectedOptions.includes(option)
            ? prev.selectedOptions.filter(opt => opt !== option)
            : [...prev.selectedOptions, option];
          const next = { ...prev, selectedOptions: newSelected };
          persist({ flightInfo, shipInfo, trainInfo: next, specialText });
          return next;
        });
      }
    }
  };

  const handleSaveConfiguration = () => {
    persist({ flightInfo, shipInfo, trainInfo, specialText });
    alert('Configuration saved successfully!');
    onClose();
  };

  const handleBack = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 rounded-t-xl">
            <div className="flex justify-between items-center">
              {/* Left side - Logo and Navigation */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center">
                  <img 
                    src="/assets/logo.jpg" 
                    alt="TripsAdora Logo" 
                    className="h-8 w-auto"
                  />
                </div>
                
                <nav className="hidden md:flex space-x-4">
                  <a href="#" className="text-[#1d236b] font-medium relative">
                    Home
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]"></span>
                  </a>
                  <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">FAQs</a>
                  <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Support</a>
                </nav>
              </div>
              
              {/* Right side - User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-xs text-gray-600">
                  Available Balance <span className="font-semibold text-gray-900">${profile.balance}</span>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt={`${profile.name} Profile`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-700">{profile.initials}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600">ID {profile.id}</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Page Title */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Traveller Section</h1>
              <p className="text-lg text-gray-700">
                Would you like to request any additional details from travelers?
              </p>
            </div>

            {/* Form Container with Border */}
            <div className="border border-gray-300 bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Choose the arrival and departure details you require:
                </h2>

                {/* Flight Information */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-800">Flight Information</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => handleToggle('flight', 'toggleDropdown')}
                        className={`px-3 py-2 rounded-lg border-2 text-xs transition-colors ${
                          flightInfo.selectedOptions.length > 0
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-gray-100 text-gray-700'
                        }`}
                      >
                        choose to select
                        <FiChevronDown className="inline-block ml-1" size={12} />
                      </button>
                      
                      {flightInfo.showDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                          <div className="py-2">
                            <button
                              onClick={() => handleToggle('flight', 'selectOption', 'Departure Flight Details')}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                                flightInfo.selectedOptions.includes('Departure Flight Details')
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              Departure Flight Details
                            </button>
                            <button
                              onClick={() => handleToggle('flight', 'selectOption', 'Arrival Flight Details')}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                                flightInfo.selectedOptions.includes('Arrival Flight Details')
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              Arrival Flight Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Display selected options */}
                    {flightInfo.selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {flightInfo.selectedOptions.length === 2 ? (
                          <span className="px-3 py-2 rounded-lg border-2 border-blue-500 bg-blue-500 text-white text-xs">
                            All selected
                          </span>
                        ) : (
                          flightInfo.selectedOptions.map((option, index) => (
                            <span key={index} className="px-3 py-2 rounded-lg border-2 border-blue-500 bg-blue-500 text-white text-xs">
                              {option}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ship Information */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-800">Ship Information</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => handleToggle('ship', 'toggleDropdown')}
                        className={`px-3 py-2 rounded-lg border-2 text-xs transition-colors ${
                          shipInfo.selectedOptions.length > 0
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-gray-100 text-gray-700'
                        }`}
                      >
                        choose to select
                        <FiChevronDown className="inline-block ml-1" size={12} />
                      </button>
                      
                      {shipInfo.showDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                          <div className="py-2">
                            <button
                              onClick={() => handleToggle('ship', 'selectOption', 'Departure Ship Details')}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                                shipInfo.selectedOptions.includes('Departure Ship Details')
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              Departure Ship Details
                            </button>
                            <button
                              onClick={() => handleToggle('ship', 'selectOption', 'Arrival Ship Details')}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                                shipInfo.selectedOptions.includes('Arrival Ship Details')
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              Arrival Ship Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Display selected options */}
                    {shipInfo.selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {shipInfo.selectedOptions.length === 2 ? (
                          <span className="px-3 py-2 rounded-lg border-2 border-blue-500 bg-blue-500 text-white text-xs">
                            All selected
                          </span>
                        ) : (
                          shipInfo.selectedOptions.map((option, index) => (
                            <span key={index} className="px-3 py-2 rounded-lg border-2 border-blue-500 bg-blue-500 text-white text-xs">
                              {option}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Train Information */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-800">Train Information</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => handleToggle('train', 'toggleDropdown')}
                        className={`px-3 py-2 rounded-lg border-2 text-xs transition-colors ${
                          trainInfo.selectedOptions.length > 0
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-gray-100 text-gray-700'
                        }`}
                      >
                        choose to select
                        <FiChevronDown className="inline-block ml-1" size={12} />
                      </button>
                      
                      {trainInfo.showDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                          <div className="py-2">
                            <button
                              onClick={() => handleToggle('train', 'selectOption', 'Departure Train Details')}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                                trainInfo.selectedOptions.includes('Departure Train Details')
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              Departure Train Details
                            </button>
                            <button
                              onClick={() => handleToggle('train', 'selectOption', 'Arrival Train Details')}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                                trainInfo.selectedOptions.includes('Arrival Train Details')
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              Arrival Train Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Display selected options */}
                    {trainInfo.selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {trainInfo.selectedOptions.length === 2 ? (
                          <span className="px-3 py-2 rounded-lg border-2 border-blue-500 bg-blue-500 text-white text-xs">
                            All selected
                          </span>
                        ) : (
                          trainInfo.selectedOptions.map((option, index) => (
                            <span key={index} className="px-3 py-2 rounded-lg border-2 border-blue-500 bg-blue-500 text-white text-xs">
                              {option}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Text for Traveller */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-800">Special Text for traveller</h3>
                  <p className="text-xs text-blue-600">
                    (This message will remain constant to every traveller or product)
                  </p>
                  <textarea
                    value={specialText}
                    onChange={(e) => setSpecialText(e.target.value)}
                    placeholder="Write here"
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  />
                </div>
              </div>

              {/* Right Column - Information Boxes */}
              <div className="space-y-6">
                {/* Top Information Box */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <FiInfo className="text-orange-600 mt-0.5 flex-shrink-0" size={14} />
                    <div>
                      <p className="text-orange-800 font-medium mb-1 text-xs">
                        Here's what we'll automatically collect:
                      </p>
                      <ul className="space-y-0.5 text-orange-700 text-xs">
                        <li>• Lead Traveller's Name (First and Last)</li>
                        <li>• Phone Number (with country code)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Information Box */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <FiInfo className="text-orange-600 mt-0.5 flex-shrink-0" size={14} />
                    <div>
                      <p className="text-orange-800 font-medium text-xs">
                        This vehicle configuration is optional. You can also add a new vehicle to display in your listed cars for this product. This section is not mandatory.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleBack}
                className="px-6 py-2"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveConfiguration}
                className="px-6 py-2"
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravellerSectionModal;
