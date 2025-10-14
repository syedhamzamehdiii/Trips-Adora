import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiX, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const CreateProductModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [showSellingPointsModal, setShowSellingPointsModal] = useState(false);
  const [selectedSellingPoints, setSelectedSellingPoints] = useState([]);
  
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => {
    if (step === 1) {
      onClose();
      navigate('/dashboard');
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const sellingPointsOptions = [
    'Unique selling points',
    'History',
    'Food & dining',
    'Outdoor & sports activities',
    'Transport experience',
    'Shopping experience',
    'Others'
  ];

  const toggleSellingPoint = (point) => {
    setSelectedSellingPoints(prev => 
      prev.includes(point) 
        ? prev.filter(p => p !== point)
        : [...prev, point]
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 4 && (
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
              <div className="relative">
                <button
                  onClick={() => setShowSellingPointsModal(true)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between"
                >
                  <span className="text-gray-500">Choose Style</span>
                  <FiChevronDown className="text-gray-400" />
                </button>
              </div>
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
                {[1, 2, 3, 4, 5].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 4 && (
                      <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <h2 className="text-xl font-bold text-black mb-4">Add highlights & Description</h2>
            
            {/* Warning Box */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <FiInfo className="text-red-600 mr-3 mt-1" size={20} />
              <p className="text-red-700 text-sm">Please add highlights and description for your product.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Highlights</label>
                <textarea
                  placeholder="Enter key highlights of your product..."
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  placeholder="Enter detailed description of your product..."
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 4 && (
                      <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <h2 className="text-xl font-bold text-black mb-4">Add Photos</h2>
            
            <div className="space-y-6">
              {/* Featured Image */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Featured Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Drag and drop your featured image here</p>
                      <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Images</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500">Add image {i}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-green-700 mb-2">Do's</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Use high-quality, clear images</li>
                    <li>• Show different angles of your product</li>
                    <li>• Include lifestyle shots</li>
                    <li>• Use good lighting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-700 mb-2">Don'ts</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Don't use blurry or low-quality images</li>
                    <li>• Don't include watermarks</li>
                    <li>• Don't use stock photos</li>
                    <li>• Don't overcrowd the image</li>
                  </ul>
                </div>
              </div>

              {/* Examples Button */}
              <div className="text-center">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Examples of great photos
                </button>
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
                {[1, 2, 3, 4, 5].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 4 && (
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

            <h2 className="text-xl font-bold text-black mb-6">Trip Preferences</h2>
            
            <div className="space-y-6">
              {/* Guide & Activity Type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Guide & Activity Type</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Guide Type</label>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white">
                          Driver
                        </button>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                          Guide
                        </button>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                          Both
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Activity Type</label>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white">
                          Private
                        </button>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                          Group
                        </button>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
                          Shared
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Language</h3>
                  
                  <div className="space-y-3">
                    {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese'].map((lang) => (
                      <button
                        key={lang}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          lang === 'English' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accessibility & Comfort */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility & Comfort</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Wheelchair Accessible</span>
                    <button className="w-12 h-6 rounded-full transition-colors bg-blue-600">
                      <div className="w-5 h-5 bg-white rounded-full transition-transform translate-x-6" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Service Animals</span>
                    <button className="w-12 h-6 rounded-full transition-colors bg-gray-300">
                      <div className="w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Infant Seat</span>
                    <button className="w-12 h-6 rounded-full transition-colors bg-blue-600">
                      <div className="w-5 h-5 bg-white rounded-full transition-transform translate-x-6" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Stroller</span>
                    <button className="w-12 h-6 rounded-full transition-colors bg-blue-600">
                      <div className="w-5 h-5 bg-white rounded-full transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Included & Excluded */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Included & Excluded</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">What's Included</label>
                    <textarea
                      placeholder="List what's included in your service..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">What's Excluded</label>
                    <textarea
                      placeholder="List what's not included in your service..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20"
                    />
                  </div>
                  
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
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
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5].map((s, index) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 4 && (
                      <div className={`w-12 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
              <FiInfo className="text-blue-600 mr-3 mt-1" size={20} />
              <p className="text-gray-700 text-sm">Fill in the details to set up your option.</p>
            </div>

            <h2 className="text-xl font-bold text-black mb-4">Vehicle & Pricing Details</h2>
            
            <div className="space-y-4">
              {/* Title Section */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Title to your Option</label>
                <input
                  type="text"
                  defaultValue="Mount Fuji tour by private car"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Form Fields Grid */}
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

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Pricing Type</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Type</option>
                    <option value="per-person">Per Person</option>
                    <option value="per-group">Per Group</option>
                    <option value="fixed">Fixed Price</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Make & Variant</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Make</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="nissan">Nissan</option>
                    <option value="mercedes">Mercedes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Number of travellers</label>
                  <input
                    type="text"
                    defaultValue="03"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Currency</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Currency</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Enter the amount of your product</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <h2 className="text-white text-3xl font-bold leading-tight">
                Create your Product
              </h2>
            </div>

            {/* Vertical Progress Steps - Only Circles */}
            <div className="flex-1 flex items-center">
              <div className="space-y-8">
                {[1, 2, 3, 4, 5].map((s, index) => (
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
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 4 && (
                      <div className="ml-5 w-0.5 h-8 bg-white"></div>
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
              {step < 5 ? (
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

      {/* Selling Points Modal */}
      {showSellingPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">What are some selling points of this tour?</h3>
              <button
                onClick={() => setShowSellingPointsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-2">
              {sellingPointsOptions.map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSellingPoints.includes(option)}
                    onChange={() => toggleSellingPoint(option)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSellingPointsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSellingPointsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProductModal;