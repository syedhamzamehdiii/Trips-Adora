import React from 'react';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const PublishProductModal = ({ isOpen, onClose, onPublish }) => {
  if (!isOpen) return null;

  const handlePublish = () => {
    onPublish();
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Publish & Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishProductModal;