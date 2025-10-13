import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiX, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ImageTipsModal from './ImageTipsModal';
import IncludedExcludedModal from './IncludedExcludedModal';

const CreateProductModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [showImageTips, setShowImageTips] = useState(false);
  const [showIncludedExcluded, setShowIncludedExcluded] = useState(false);
  const [accessibilityOptions, setAccessibilityOptions] = useState({
    wheelchair: true,
    serviceAnimals: false,
    infantSeat: true,
    stroller: true
  });
  const [includedExcludedData, setIncludedExcludedData] = useState({
    included: '',
    excluded: ''
  });
  const [guideType, setGuideType] = useState('driver');
  const [activityType, setActivityType] = useState('private');
  const [language, setLanguage] = useState('english');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  // Step 5 - Vehicle & Pricing states
  const [vehicleData, setVehicleData] = useState({
    title: 'Mount Fuji tour by private car',
    transportationType: '',
    vehicleAttributes: '',
    pricingType: '',
    makeVariant: '',
    numberOfTravellers: '03',
    amount: '',
    modelOfVehicle: '2008',
    currency: '',
    duration: '8h'
  });
  
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => {
    if (step === 1) {
      onClose(); // Close the modal first
      navigate('/dashboard'); // Then navigate to dashboard
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const toggleAccessibility = (option) => {
    setAccessibilityOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleSaveIncludedExcluded = (data) => {
    setIncludedExcludedData(data);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 5 && (
                      <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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

            <h2 className="text-xl font-bold text-black mb-4">Product Title</h2>
            <p className="text-gray-600 mb-2">Enter a clear and descriptive name for your product or service. (title should be minimum 30 characters)</p>
            <input
              type="text"
              defaultValue="Mount fuji, Tokoyo"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Category</h3>
              <p className="text-gray-600 mb-4">Select the category that best matches your product or service. Choose from Tour, Hotel, or Rent a Car.</p>
              <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Category</option>
                <option value="tour">Tour</option>
                <option value="hotel">Hotel</option>
                <option value="rental">Rent a Car</option>
              </select>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Selling Points</h3>
              <p className="text-gray-600 mb-4">Choose the overall look, design, or concept that best represents your product.</p>
              <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Choose Style</option>
                <option value="culture">Culture & history</option>
                <option value="nature">Nature</option>
                <option value="food">Food & dining</option>
                <option value="local">Local & dining</option>
                <option value="outdoor">Outdoor & sports activities</option>
                <option value="nightlife">Nightlife experience</option>
                <option value="wildlife">Wildlife & exploration</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tagline</h3>
              <p className="text-gray-600 mb-4">This description will appear under your activity title. Start with a short intro (2-3 sentences), then describe the full experience in order.</p>
              <textarea
                rows={6}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please write atleast 50 Characters."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 5 && (
                      <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <FiInfo className="text-red-600 mr-3 mt-1" size={20} />
              <p className="text-red-700 text-sm">Your highlights define what makes this product unique. Please review carefully.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 mb-4">Describe your product or service clearly, highlighting key features and benefits in detail.</p>
              <textarea
                rows={6}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please write at least 500 Characters."
              />
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Highlights</h3>
              <p className="text-gray-600 mb-4">Describe in 3-5 sentences what makes your activity unique and different from others. Highlight the special features or experiences that set it apart, so customers can easily compare and see why yours is the best choice.</p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    defaultValue="Churelto Pagoda and Lake Kawaguchi."
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">0/30</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    defaultValue="Churelto Pagoda and Lake Kawaguchi."
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">0/30</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    defaultValue="Churelto Pagoda and Lake Kawaguchi."
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">0/30</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    defaultValue="Churelto Pagoda and Lake Kawaguchi."
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">0/30</span>
                </div>
              </div>
              
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-3">
                Add another highlights
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 5 && (
                      <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
              <FiInfo className="text-blue-600 mr-3 flex-shrink-0" size={20} />
              <p className="text-blue-700 text-sm">Upload at least 4 images to help customers visualize your activity and set clear expectations.</p>
            </div>

            <h2 className="text-xl font-bold text-black mb-4">Add Photos</h2>
            <p className="text-gray-600 mb-4">Upload 6+ high-quality photos you own, featuring real people and important details. Keep them bright, clear, and consistent to attract more visitors.</p>
            <p className="text-gray-600 mb-6">Avoid blurry, dark, or stock photos. Don't use screenshots, watermarks, collages, or edits that mislead customers.</p>
            
            <div className="space-y-6">
              {/* Upload Button */}
              <div className="flex items-center space-x-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload Photo</span>
                </button>
                <span className="text-sm text-gray-500">Only JPG, PNG, SVG (3MB Max)</span>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-3">Do:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Include 6+ photos
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Only use photos you own
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Add candid traveler photos
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3">Don't:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Screenshots, Watermarks, Collages
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Add blurry or dark photos
                    </li>
                  </ul>
                </div>
              </div>

              {/* Examples Button */}
              <div>
                <button
                  onClick={() => setShowImageTips(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Examples of great photos
                </button>
              </div>

              {/* Cover Image Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Cover Image</h3>
                <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Upload your cover image</p>
                  </div>
                </div>
              </div>

              {/* You can also change cover image */}
              <div>
                <p className="text-sm text-gray-600 mb-3">You can also change cover image</p>
                <div className="flex space-x-3">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="text-xs text-gray-500 border-t pt-4">
                All images used in this content are protected by copyright. Unauthorized use, reproduction, or distribution of these images without prior permission is strictly prohibited. TripsAdora Supplier Agreement & TripsAdora's Terms of Use.
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 5 && (
                      <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
              <FiInfo className="text-blue-600 mr-3 flex-shrink-0" size={20} />
              <p className="text-blue-700 text-sm">Set up your trip preferences to personalize your travel experience</p>
            </div>

            <h2 className="text-xl font-bold text-black mb-6">Trip Details</h2>
            
            <div className="space-y-6">
              {/* Guide & Activity Type and Language - Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Guide & Activity Type */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Guide & Activity Type</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Guide Type</label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setGuideType('driver')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            guideType === 'driver' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Driver
                        </button>
                        <button
                          onClick={() => setGuideType('guide')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            guideType === 'guide' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Guide
                        </button>
                        <button
                          onClick={() => setGuideType('both')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            guideType === 'both' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Both
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setActivityType('private')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activityType === 'private' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Private
                        </button>
                        <button
                          onClick={() => setActivityType('customised')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activityType === 'customised' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Customised
                        </button>
                        <button
                          onClick={() => setActivityType('shared')}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activityType === 'shared' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Shared
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Language */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Language</h3>
                  <p className="text-sm text-gray-600 mb-4">Select the language your tour guide will use during the trip.</p>
                  
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => setLanguage('arabic')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        language === 'arabic' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Arabic
                    </button>
                    <button
                      onClick={() => setLanguage('french')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        language === 'french' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      French
                    </button>
                    <button
                      onClick={() => setLanguage('english')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        language === 'english' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      English
                    </button>
                  </div>

                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Language</option>
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="italian">Italian</option>
                    <option value="arabic">Arabic</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="korean">Korean</option>
                  </select>
                </div>
              </div>

              {/* Accessibility & Comfort */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Accessibility & Comfort</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Wheelchair accessible</span>
                    <button
                      onClick={() => toggleAccessibility('wheelchair')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        accessibilityOptions.wheelchair ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          accessibilityOptions.wheelchair ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Service animals allowed</span>
                    <button
                      onClick={() => toggleAccessibility('serviceAnimals')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        accessibilityOptions.serviceAnimals ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          accessibilityOptions.serviceAnimals ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Infant seat available</span>
                    <button
                      onClick={() => toggleAccessibility('infantSeat')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        accessibilityOptions.infantSeat ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          accessibilityOptions.infantSeat ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Stroller friendly</span>
                    <button
                      onClick={() => toggleAccessibility('stroller')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        accessibilityOptions.stroller ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          accessibilityOptions.stroller ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Included & Excluded */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Included & Excluded</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Included</label>
                    <textarea
                      rows={3}
                      value={includedExcludedData.included}
                      onChange={(e) => setIncludedExcludedData(prev => ({ ...prev, included: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="What's included in this experience..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excluded</label>
                    <textarea
                      rows={3}
                      value={includedExcludedData.excluded}
                      onChange={(e) => setIncludedExcludedData(prev => ({ ...prev, excluded: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="What's not included in this experience..."
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowIncludedExcluded(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Click to add
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1">
              {/* Steps Indicator */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3">
                  {[1, 2, 3, 4, 5, 6].map((s, index) => (
                    <React.Fragment key={s}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {s < step ? <FiCheckCircle size={16} /> : s}
                      </div>
                      {index < 5 && (
                        <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
                <FiInfo className="text-blue-600 mr-3 flex-shrink-0" size={20} />
                <p className="text-blue-700 text-sm">Set your pricing and vehicle details</p>
              </div>

              <h2 className="text-xl font-bold text-black mb-4">Vehicle & Pricing Details</h2>
              
              <div className="space-y-4">
                {/* Title and Duration Container - Side by Side */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title to your Option</label>
                    <input
                      type="text"
                      value={vehicleData.title}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="w-64">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total duration</label>
                        <input
                          type="text"
                          value={vehicleData.duration}
                          onChange={(e) => setVehicleData(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Brief description..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transportation Type</label>
                    <select
                      value={vehicleData.transportationType}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, transportationType: e.target.value }))}
                      className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="car">Car</option>
                      <option value="van">Van</option>
                      <option value="bus">Bus</option>
                      <option value="train">Train</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Attributes</label>
                    <select
                      value={vehicleData.vehicleAttributes}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, vehicleAttributes: e.target.value }))}
                      className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Attributes</option>
                      <option value="luxury">Luxury</option>
                      <option value="standard">Standard</option>
                      <option value="economy">Economy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type</label>
                    <select
                      value={vehicleData.pricingType}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, pricingType: e.target.value }))}
                      className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="per-person">Per Person</option>
                      <option value="per-group">Per Group</option>
                      <option value="fixed">Fixed Price</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Make & Variant</label>
                    <select
                      value={vehicleData.makeVariant}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, makeVariant: e.target.value }))}
                      className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Make</option>
                      <option value="toyota">Toyota</option>
                      <option value="honda">Honda</option>
                      <option value="nissan">Nissan</option>
                      <option value="mercedes">Mercedes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of travellers</label>
                    <input
                      type="text"
                      value={vehicleData.numberOfTravellers}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, numberOfTravellers: e.target.value }))}
                      className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={vehicleData.currency}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Currency</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="JPY">JPY</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter the amount of your product</label>
                    <input
                      type="number"
                      value={vehicleData.amount}
                      onChange={(e) => setVehicleData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {/* Commission Information */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-2">Commission Information</h3>
                  <p className="text-sm text-yellow-700">
                    Our platform commission is <span className="font-semibold">12%</span> of your listed price. 
                    You will receive <span className="font-semibold">88%</span> of the total amount.
                  </p>
                </div>

                {/* Existing Product Listings */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Product Listings</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-medium text-gray-800">Benz A-Class</h4>
                          <p className="text-sm text-gray-600">Luxury sedan • Up to 4 passengers</p>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-medium text-gray-800">Coster J3-400</h4>
                          <p className="text-sm text-gray-600">Mini bus • Up to 8 passengers</p>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 6:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        s === step
                          ? 'bg-blue-600 text-white'
                          : s < step
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 5 && (
                      <div className="w-12 h-0.5 bg-gray-300"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
              <FiInfo className="text-blue-600 mr-3 flex-shrink-0" size={20} />
              <p className="text-sm text-blue-800">Review all product details before publishing</p>
            </div>

            <h2 className="text-xl font-bold text-black mb-4">Pick-up & Drop-off</h2>

            <div className="space-y-6">
              {/* Set Pick-up & Drop-off locations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Set Pick-up & Drop-off locations</h3>
                <p className="text-sm text-gray-600 mb-4">Select where you want to be picked-up and dropped-off for you activity</p>
                
                <div className="flex justify-end mb-4">
                  <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Locations</option>
                    <option value="hotel">Hotel Pick-up</option>
                    <option value="airport">Airport Pick-up</option>
                    <option value="custom">Custom Location</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Pick-up locations */}
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Pick-up locations</span>
                    </div>
                    
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Search or enter pick-up locations"
                        className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <svg className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Map placeholder */}
                    <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">Map View</p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
                        Drag to choose the area you wants to deal
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Add another area
                      </button>
                    </div>
                  </div>

                  {/* Drop-off locations */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">Use same pick-up location for drop-off</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">We will detect your location automatically</p>

                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Drop-off locations</span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search or enters drop-off locations"
                        className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <svg className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pick-up time */}
              <div>
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-semibold text-gray-800">Pick-up time</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Please specify the exact time you will be available to pick up your customer from the designated location.</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time to Pick-up</label>
                    <div className="flex space-x-2">
                      <input type="text" defaultValue="06" className="w-16 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center" />
                      <span className="flex items-center">:</span>
                      <input type="text" defaultValue="00" className="w-16 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Add new time
                    </button>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">Starting date: 01 Oct</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Apply the same for all days</span>
                    </div>
                    <select className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm">
                      <option value="">week days</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="all">All Days</option>
                    </select>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Select Vehicle
                  </button>
                </div>

                {/* Time slots grid */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Monday</h4>
                    <div className="grid grid-cols-8 gap-2">
                      {['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'].map((time, index) => (
                        <button
                          key={index}
                          className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                            ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'].includes(time)
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tuesday</h4>
                    <div className="grid grid-cols-8 gap-2">
                      {['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'].map((time, index) => (
                        <button
                          key={index}
                          className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                            ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'].includes(time)
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time interval settings */}
                <div className="flex justify-end space-x-4 mt-4">
                  <div className="text-center">
                    <div className="flex space-x-2 mb-1">
                      <input type="text" defaultValue="06:00" className="w-16 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-center" />
                      <span className="text-xs">-</span>
                      <input type="text" defaultValue="20:30" className="w-16 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-center" />
                    </div>
                    <p className="text-xs text-gray-500">You can add starting and ending time with the auto intervals of time.</p>
                  </div>
                  <div className="text-center">
                    <input type="text" defaultValue="00:30" className="w-16 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-center mb-1" />
                    <p className="text-xs text-gray-500">Duration between the time in minutes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            <h2 className="text-xl font-bold text-black mb-4">Step {step}</h2>
            <p className="text-gray-600">Content for step {step}</p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[70vh] flex overflow-hidden">
        {/* Left Sidebar - Progress Indicator */}
        <div className="w-56 relative overflow-hidden rounded-l-2xl">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/assets/WhatsApp Image 2025-10-13 at 4.19.02 PM.jpeg')`,
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gray-900 bg-opacity-20"></div>
          
          {/* Progress Steps */}
          <div className="relative z-10 p-8 h-full flex flex-col">
            {/* Step Title */}
            <div className="mb-16">
              <h2 className="text-black text-3xl font-bold leading-tight">
                Create your Product
              </h2>
            </div>

            {/* Vertical Progress Steps - Only Circles */}
            <div className="flex-1 flex items-center">
              <div className="space-y-8">
                {[1, 2, 3, 4, 5, 6].map((s, index) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        s === step
                          ? 'bg-blue-600 text-white'
                          : s < step
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border-2 border-gray-400 text-gray-600'
                      }`}
                    >
                      {s}
                    </div>
                    {index < 5 && (
                      <div className="ml-5 w-0.5 h-8 bg-black"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              className="flex items-center space-x-2 px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiChevronLeft size={20} />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {step < 6 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Continue</span>
                  <FiChevronRight size={20} />
                </button>
              ) : (
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Create Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Tips Modal */}
      <ImageTipsModal 
        isOpen={showImageTips} 
        onClose={() => setShowImageTips(false)}
      />

      {/* Included & Excluded Modal */}
      <IncludedExcludedModal 
        isOpen={showIncludedExcluded} 
        onClose={() => setShowIncludedExcluded(false)}
        onSave={handleSaveIncludedExcluded}
      />
    </div>
  );
};

export default CreateProductModal;
