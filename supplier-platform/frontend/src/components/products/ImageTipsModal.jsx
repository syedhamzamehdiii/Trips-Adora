import React from 'react';
import { FiX } from 'react-icons/fi';

const ImageTipsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const exampleImages = [
    '/assets/WhatsApp Image 2025-10-13 at 4.52.46 PM (1).jpeg',
    '/assets/WhatsApp Image 2025-10-13 at 4.52.43 PM (1).jpeg'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Examples of Great Photos</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exampleImages.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Example ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Example {index + 1}: High quality, well-lit photo
                </p>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Pro Tips:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Use natural lighting when possible
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Show different angles and perspectives
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Keep the background clean and uncluttered
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Highlight unique features and details
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageTipsModal;
