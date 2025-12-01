import React, { useState } from 'react';

const RoleManagementModal = ({ isOpen, onClose, onRoleSelected }) => {
  const [roleAccess, setRoleAccess] = useState({
    productsManagement: false,
    customersFeedbacks: false,
    finance: false,
  });

  const handleToggle = (key) => {
    setRoleAccess({ ...roleAccess, [key]: !roleAccess[key] });
  };

  const handleUpdate = () => {
    // Return selected roles to parent
    if (onRoleSelected) {
      onRoleSelected(roleAccess);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-2">Role and login access</h2>
        <p className="text-sm text-gray-500 mb-6">Enable this option to give access to holders.</p>

        <div className="space-y-6">
          {/* Products Management and Suppliers */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Products Management and Suppliers.</h3>
              <p className="text-sm text-gray-500">
                The holder can access only Suppliers and their product management.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={roleAccess.productsManagement}
                onChange={() => handleToggle('productsManagement')}
              />
              <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                roleAccess.productsManagement ? 'bg-blue-600' : 'bg-gray-200'
              }`} style={roleAccess.productsManagement ? { backgroundColor: '#3B69E2' } : {}}></div>
            </label>
          </div>

          {/* Customers, Feedbacks and contact */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Customers, Feedbacks and contact.</h3>
              <p className="text-sm text-gray-500">
                The holder can access only Customers, Feedback & reviews and their massages & contact responses.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={roleAccess.customersFeedbacks}
                onChange={() => handleToggle('customersFeedbacks')}
              />
              <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                roleAccess.customersFeedbacks ? 'bg-blue-600' : 'bg-gray-200'
              }`} style={roleAccess.customersFeedbacks ? { backgroundColor: '#3B69E2' } : {}}></div>
            </label>
          </div>

          {/* Finance */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Finance</h3>
              <p className="text-sm text-gray-500">
                The holder can access only Finance, transitions, payouts to supplier etc.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={roleAccess.finance}
                onChange={() => handleToggle('finance')}
              />
              <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                roleAccess.finance ? 'bg-blue-600' : 'bg-gray-200'
              }`} style={roleAccess.finance ? { backgroundColor: '#3B69E2' } : {}}></div>
            </label>
          </div>
        </div>

        {/* Update Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpdate}
            className="px-8 py-3 rounded-lg text-white font-medium text-sm"
            style={{ backgroundColor: '#3B69E2' }}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementModal;

