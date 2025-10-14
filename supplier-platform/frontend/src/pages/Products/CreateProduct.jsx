import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo } from 'react-icons/fi';

const CreateProduct = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
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
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Selling Points</label>
                <p className="text-sm text-gray-600 mb-3">Choose the overall look, design, or concept that best represents your product.</p>
                <div className="flex space-x-4">
                  <div className="relative flex-1">
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
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-24 h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="w-20 h-12 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs text-blue-600 font-medium">Style</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tagline</label>
                <p className="text-sm text-gray-600 mb-3">This description will appear under your activity title. Start with a short intro (2-3 sentences), then describe the full experience in order.</p>
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
              <div className="flex items-center space-x-4">
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

            <h2 className="text-2xl font-bold text-black mb-4">Add Photos</h2>
            
            {/* Info Box */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 flex items-start">
              <FiInfo className="text-blue-600 mr-2 mt-1" size={20} />
              <p className="text-gray-700 text-sm">Upload at least 4 images to help customers visualize your activity and set clear expectations.</p>
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Photos</h3>
                <ul className="text-sm text-gray-700 space-y-2 mb-4">
                  <li>• Upload 6+ high-quality photos you own, featuring real people and important details. Keep them bright, clear, and consistent to attract more visitors.</li>
                  <li>• Avoid blurry, dark, or stock photos. Don't use screenshots, watermarks, collages, or edits that mislead customers.</li>
                </ul>
                <button className="bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                  Upload Photo
                </button>
                <span className="text-sm text-gray-500 ml-2">Only JPG, PNG, SVG (3MB Max)</span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Image</h3>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-gray-500 mb-2">📷</div>
                  <p className="text-gray-600">Upload your cover image</p>
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
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar - Progress Indicator */}
      <div className="w-80 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/assets/WhatsApp Image 2025-10-13 at 4.19.02 PM.jpeg')`,
            filter: 'blur(2px)'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 p-8 h-full flex flex-col">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-white mb-2">Create your Product</h1>
          </div>
          
          {/* Progress Steps */}
          <div className="flex-1 flex items-center">
            <div className="w-full">
              {[1, 2, 3, 4].map((s, index) => (
                <div key={s} className="flex items-center mb-8">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${s === step ? 'bg-white text-blue-800' : s < step ? 'bg-green-400 text-white' : 'bg-gray-500 text-white'}`}
                    >
                      {s < step ? <FiCheckCircle size={16} /> : s}
                    </div>
                    {index < 3 && (
                      <div className={`w-0.5 h-16 mt-4 ${s < step ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-white font-medium">Step {s}</div>
                    <div className="text-blue-200 text-sm">
                      {s === 1 && 'Basic Information'}
                      {s === 2 && 'Photos & Media'}
                      {s === 3 && 'Details & Pricing'}
                      {s === 4 && 'Review & Publish'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/assets/logo.jpg" 
                alt="TripsAdora" 
                className="h-8 w-auto"
              />
            </div>
            <div className="text-sm text-gray-600">
              Step {step} of 6
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white border-t border-gray-200 px-8 py-6">
          <div className="max-w-4xl mx-auto flex justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="mr-2" /> Back
            </button>
            
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue <FiChevronRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;