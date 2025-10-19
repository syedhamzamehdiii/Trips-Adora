import React from 'react';
import { FiX, FiCheck, FiXCircle } from 'react-icons/fi';

const ImageTipsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Images Tips</h2>
              <p className="text-gray-600 text-lg">Upload clean, non-blurry images</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-10">
          <div className="flex space-x-8">
            {/* Good Example */}
            <div className="flex-1">
              <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img 
                  src="/assets/WhatsApp Image 2025-10-13 at 4.52.46 PM (1).jpeg" 
                  alt="Good example - Mount Fuji landscape" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-3" size={24} />
                <span className="text-gray-700 font-medium text-lg">Clear, sharp image</span>
              </div>
            </div>

            {/* Bad Example */}
            <div className="flex-1">
              <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img 
                  src="/assets/5e20accba877ebca3f7fd7f0a8f642697330bd69.png" 
                  alt="Bad example - Blurry torii gate" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center">
                <FiXCircle className="text-red-500 mr-3" size={24} />
                <span className="text-gray-700 font-medium text-lg">Blurry, unclear image</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-10 py-8 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-lg font-medium"
          >
            Back
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageTipsModal;
