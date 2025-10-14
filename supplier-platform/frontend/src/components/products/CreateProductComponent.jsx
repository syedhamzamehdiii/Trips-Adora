import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiX, FiChevronDown, FiUpload } from 'react-icons/fi';

const CreateProductComponent = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [showImageTipsModal, setShowImageTipsModal] = useState(false);
  const [showIncludedExcludedModal, setShowIncludedExcludedModal] = useState(false);
  
  // Step 4 state management
  const [selectedGuideType, setSelectedGuideType] = useState('Driver');
  const [selectedActivityType, setSelectedActivityType] = useState('Private');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

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
                {[1, 2, 3, 4, 5].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 4 && (
                      <div className={`w-8 h-0.5 border-t-2 border-dashed ${s < step ? 'border-green-500' : 'border-gray-300'}`}></div>
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
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => setSelectedGuideType('Driver')}
                        className={`px-6 py-3 rounded-full font-medium transition-colors ${
                          selectedGuideType === 'Driver' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Driver
                      </button>
                      <button 
                        onClick={() => setSelectedGuideType('Guide')}
                        className={`px-6 py-3 rounded-full font-medium transition-colors ${
                          selectedGuideType === 'Guide' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Guide
                      </button>
                      <button 
                        onClick={() => setSelectedGuideType('Both')}
                        className={`px-6 py-3 rounded-full font-medium transition-colors ${
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
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => setSelectedActivityType('Private')}
                        className={`px-6 py-3 rounded-full font-medium transition-colors ${
                          selectedActivityType === 'Private' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Private
                      </button>
                      <button 
                        onClick={() => setSelectedActivityType('Customised')}
                        className={`px-6 py-3 rounded-full font-medium transition-colors ${
                          selectedActivityType === 'Customised' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Customised
                      </button>
                      <button 
                        onClick={() => setSelectedActivityType('Shared')}
                        className={`px-6 py-3 rounded-full font-medium transition-colors ${
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
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setSelectedLanguage('Arabic')}
                      className={`px-6 py-3 rounded-full font-medium transition-colors ${
                        selectedLanguage === 'Arabic' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Arabic
                    </button>
                    <button 
                      onClick={() => setSelectedLanguage('French')}
                      className={`px-6 py-3 rounded-full font-medium transition-colors ${
                        selectedLanguage === 'French' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      French
                    </button>
                    <button 
                      onClick={() => setSelectedLanguage('English')}
                      className={`px-6 py-3 rounded-full font-medium transition-colors ${
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
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                      <option value="French">French</option>
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
                  {['Wheelchair', 'Service Animals', 'Infant Seat', 'Stroller'].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{item}</span>
                      <div className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="sr-only" defaultChecked />
                        <div className="w-12 h-6 bg-blue-600 rounded-full shadow-inner"></div>
                        <div className="absolute w-5 h-5 bg-white rounded-full shadow top-0.5 right-0.5 transition-transform"></div>
                      </div>
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
                      <option>Sunscreen</option>
                      <option>Water Bottle</option>
                      <option>Comfortable Shoes</option>
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
      case 5:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 4 && (
                      <div className={`w-8 h-0.5 border-t-2 border-dashed ${s < step ? 'border-green-500' : 'border-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-black mb-4">Vehicle & Pricing Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Title to your Option</label>
                <input
                  type="text"
                  defaultValue="Mount Fuji tour by private car"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Transportation Type</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Type</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Vehicle Attributes</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Attributes</option>
                    <option value="luxury">Luxury</option>
                    <option value="standard">Standard</option>
                    <option value="economy">Economy</option>
                  </select>
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
                 step === 5 ? 'Vehicle & Pricing' : 'Create your Product'}
              </h1>
            </div>
            
            {/* Progress Steps - Vertical List - Centered */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-8">
                {[1, 2, 3, 4].map((stepNumber, index) => (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${stepNumber === step 
                          ? 'bg-blue-600 text-white' 
                          : stepNumber < step 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border-2 border-gray-800 text-gray-800'}`}
                    >
                      {stepNumber < step ? <FiCheckCircle size={16} /> : stepNumber}
                    </div>
                    {index < 3 && (
                      <div className={`w-0.5 h-8 mt-2 ${stepNumber < step ? 'bg-blue-600' : 'bg-gray-800'}`}></div>
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
              <button
                onClick={prevStep}
                className="flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white transition-colors"
              >
                <FiChevronLeft className="mr-2" size={20} />
                Back
              </button>
              
              <button
                onClick={step < 5 ? nextStep : () => {
                  alert('Product created successfully!');
                  onClose();
                }}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {step < 5 ? 'Continue' : 'Create Product'}
                <FiChevronRight className="ml-2" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Tips Modal */}
      {showImageTipsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Images Tips</h2>
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
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                  <img 
                    src="/assets/WhatsApp Image 2025-10-13 at 4.52.46 PM (1).jpeg" 
                    alt="Clear example" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <FiCheckCircle className="text-green-600 mr-1" size={16} />
                  <span className="text-sm text-gray-700">Clear, sharp image</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                  <img 
                    src="/assets/WhatsApp Image 2025-10-13 at 4.19.02 PM.jpeg" 
                    alt="Blurry example" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-red-600 mr-1 font-bold">✗</span>
                  <span className="text-sm text-gray-700">Blurry, unclear image</span>
                </div>
              </div>
            </div>

            {/* Modal Navigation Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowImageTipsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setShowImageTipsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    </div>
  );
};

export default CreateProductComponent;