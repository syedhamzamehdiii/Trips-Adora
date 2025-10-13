import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

const IncludedExcludedModal = ({ isOpen, onClose, onSave }) => {
  const [includedItems, setIncludedItems] = useState(['']);
  const [excludedItems, setExcludedItems] = useState(['']);

  if (!isOpen) return null;

  const addIncludedItem = () => {
    setIncludedItems([...includedItems, '']);
  };

  const addExcludedItem = () => {
    setExcludedItems([...excludedItems, '']);
  };

  const removeIncludedItem = (index) => {
    setIncludedItems(includedItems.filter((_, i) => i !== index));
  };

  const removeExcludedItem = (index) => {
    setExcludedItems(excludedItems.filter((_, i) => i !== index));
  };

  const updateIncludedItem = (index, value) => {
    const newItems = [...includedItems];
    newItems[index] = value;
    setIncludedItems(newItems);
  };

  const updateExcludedItem = (index, value) => {
    const newItems = [...excludedItems];
    newItems[index] = value;
    setExcludedItems(newItems);
  };

  const handleSave = () => {
    onSave({
      included: includedItems.filter(item => item.trim() !== '').join(', '),
      excluded: excludedItems.filter(item => item.trim() !== '').join(', ')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">What's Included & Excluded</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
          {/* Included Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Included</h3>
              <button
                onClick={addIncludedItem}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <FiPlus size={16} />
                <span>Add Item</span>
              </button>
            </div>
            <div className="space-y-3">
              {includedItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateIncludedItem(index, e.target.value)}
                    placeholder="e.g., Hotel pickup and drop-off"
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {includedItems.length > 1 && (
                    <button
                      onClick={() => removeIncludedItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Excluded Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Excluded</h3>
              <button
                onClick={addExcludedItem}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <FiPlus size={16} />
                <span>Add Item</span>
              </button>
            </div>
            <div className="space-y-3">
              {excludedItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateExcludedItem(index, e.target.value)}
                    placeholder="e.g., Food and drinks"
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {excludedItems.length > 1 && (
                    <button
                      onClick={() => removeExcludedItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncludedExcludedModal;
