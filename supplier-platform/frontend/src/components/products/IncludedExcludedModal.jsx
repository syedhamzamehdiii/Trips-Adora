import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const IncludedExcludedModal = ({ isOpen, onClose, onSave }) => {
  const [included, setIncluded] = useState('');
  const [excluded, setExcluded] = useState('');

  const handleSave = () => {
    onSave({ included, excluded });
    setIncluded('');
    setExcluded('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's Included</h2>
              <p className="text-gray-600">Clearly list everything covered in the price so customers know exactly what they'll receive.</p>
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
        <div className="p-8 space-y-8">
          {/* What's Included */}
          <div>
            <textarea
              value={included}
              onChange={(e) => setIncluded(e.target.value)}
              placeholder="Clearly list the services or items covered in the price, such as entry tickets, meals, or equipment, so customers know exactly what they're paying for."
              rows="4"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* What's Excluded */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">What's Excluded</h3>
            <p className="text-gray-600 mb-4">Clearly list everything covered in the price so customers know exactly what they'll receive.</p>
            <textarea
              value={excluded}
              onChange={(e) => setExcluded(e.target.value)}
              placeholder="Clearly list the services or items NOT covered in the price, such as entry tickets, meals, or equipment, so customers know exactly what they're paying for."
              rows="4"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncludedExcludedModal;
