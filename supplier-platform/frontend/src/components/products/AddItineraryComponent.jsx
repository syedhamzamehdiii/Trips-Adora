import React, { useState } from 'react';
import { FiClock } from 'react-icons/fi';

const AddItineraryComponent = ({ onClose, onBack }) => {
  const [selectedTourType, setSelectedTourType] = useState('One day Tour');

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex overflow-hidden">
        {/* Left Sidebar - Background Image */}
        <div className="w-1/3 relative overflow-hidden rounded-l-2xl">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/assets/WhatsApp Image 2025-10-13 at 4.19.02 PM.jpeg')`,
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gray-900 bg-opacity-40"></div>
          
          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-center">
            <h1 className="text-white text-4xl font-bold leading-tight mb-8">
              Add Itinerary
            </h1>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center">
              <img 
                src="/assets/logo.jpg" 
                alt="TripsAdora Logo" 
                className="h-12 w-auto"
              />
            </div>
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
                          ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                      >
                        {step}
                      </div>
                      {index < 5 && (
                        <div className="w-8 h-0.5 bg-gray-200"></div>
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

                {/* Tour Type Selector */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 gap-4">
                    {tourTypes.map((tour) => (
                      <button
                        key={tour.id}
                        onClick={() => handleTourTypeSelect(tour)}
                        className={`p-4 rounded-lg border transition-all ${
                          selectedTourType === tour.name
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                            selectedTourType === tour.name ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {tour.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-bold text-gray-900">{tour.name}</h3>
                            <p className="text-sm text-gray-500">({tour.timeRange})</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="bg-white border-t border-gray-200 px-8 py-6">
            <div className="max-w-4xl mx-auto flex justify-end space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={() => {
                  alert('Itinerary created successfully!');
                  onClose();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItineraryComponent;