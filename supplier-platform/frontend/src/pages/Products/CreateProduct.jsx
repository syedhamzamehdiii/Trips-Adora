import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { ROUTES } from '@/utils/constants';

const CreateProduct = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-black mb-4">Create your Product</h2>
            
            {/* Info Box */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 flex items-start">
              <FiInfo className="text-blue-600 mr-2 mt-1" size={20} />
              <p className="text-gray-700 text-sm">Your choices set up your product, please review carefully.</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Product Title</label>
                <p className="text-sm text-gray-600 mb-3">Enter a clear and descriptive name for your product or service. (title should be minimum 30 characters)</p>
                <input
                  type="text"
                  placeholder="Mount fuji, Tokoyo"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                <p className="text-sm text-gray-600 mb-3">Select the category that best matches your product or service. Choose from Tour, Hotel, or Rent a Car.</p>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Category</option>
                  <option>Tour</option>
                  <option>Hotel</option>
                  <option>Transportation</option>
                  <option>Rent-A Car</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Selling Points</label>
                <p className="text-sm text-gray-600 mb-3">Choose the overall look, design, or concept that best represents your product.</p>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Choose Style</option>
                  <option>Art, Design, & Fashion</option>
                  <option>Entertainment</option>
                  <option>Food & Drink</option>
                  <option>Health & Fitness</option>
                  <option>History & Culture</option>
                  <option>Travel</option>
                  <option>Holidays</option>
                </select>
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
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-black mb-4">Add highlights & Description</h2>
            
            {/* Warning Box */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <span className="text-red-600 mr-2 mt-1">⚠️</span>
              <p className="text-red-700 text-sm">Your highlights define what makes this product unique. Please review carefully.</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <p className="text-sm text-gray-600 mb-3">Describe your product or service clearly, highlighting key features and benefits in detail.</p>
                <textarea
                  rows="6"
                  placeholder="Please write atleast 500 Characters."
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Highlights</label>
                <p className="text-sm text-gray-600 mb-3">Describe in 3-5 sentences what makes your activity unique and different from others. Highlight the special features or experiences that set it apart, so customers can easily compare and see why yours is the best choice.</p>
                
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        placeholder="Chureito Pagoda and Lake Kawaguchi."
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">0/30</span>
                    </div>
                  ))}
                </div>
                
                <button className="text-blue-600 hover:text-blue-700 underline mt-2">
                  Add another highlights
                </button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold text-black mb-4">Review & Publish</h2>
            <p className="text-gray-600 mb-6">Review your product details and publish.</p>
            
            {/* Review Content */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="text-gray-900">Mount Fuji Tokyo Day Trip</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="text-gray-900">Tour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600">Ready to Publish</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* TripsAdora Logo */}
              <img 
                src="/assets/logo.jpg" 
                alt="TripsAdora" 
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                  ${s === step ? 'bg-blue-600' : s < step ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                {s < step ? <FiCheckCircle size={20} /> : s}
              </div>
              <span className="mt-2 text-sm text-gray-600">Step {s}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white"
            >
              <FiChevronLeft className="mr-2" /> Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto"
            >
              Continue <FiChevronRight className="ml-2" />
            </button>
          ) : (
            <button
              onClick={() => alert('Product Created!')}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-auto"
            >
              <FiCheckCircle className="mr-2" /> Publish Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;