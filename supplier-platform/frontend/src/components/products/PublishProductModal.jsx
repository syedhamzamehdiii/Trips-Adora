import React from 'react';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const PublishProductModal = ({ isOpen, onClose, onPublish, isPublishing = false }) => {
  if (!isOpen) return null;

  const handlePublish = () => {
    if (!isPublishing) {
      onPublish();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Publish Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-3 mb-6">
            <FiAlertCircle className="text-amber-500 mt-1" size={20} />
            <div>
              <p className="text-gray-700 leading-relaxed">
                This will make your product live and visible to customers.<br />
                Make sure all information is correct. Do you want to publish?
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Stay on This Page
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isPublishing ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish & Submit</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishProductModal;