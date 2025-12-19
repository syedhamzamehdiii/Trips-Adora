import React, { useState, useEffect } from 'react';

const RoleManagementModal = ({ isOpen, onClose, onRoleSelected, initialPermissions = {} }) => {
  const [roleAccess, setRoleAccess] = useState({
    productsManagement: false,
    customersFeedbacks: false,
    finance: false,
  });

  // Update state only when modal opens, not on every initialPermissions change
  useEffect(() => {
    if (isOpen) {
      setRoleAccess({
        productsManagement: Boolean(initialPermissions?.productsManagement),
        customersFeedbacks: Boolean(initialPermissions?.customersFeedbacks),
        finance: Boolean(initialPermissions?.finance),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleToggle = (key) => {
    setRoleAccess(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleUpdate = () => {
    // Return selected roles to parent immediately (real-time update)
    if (onRoleSelected) {
      onRoleSelected(roleAccess);
      // Close modal after updating
      onClose();
    } else {
      // If no callback, just close
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
      onClick={onClose}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative z-[101]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right - Single Button Only */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-[102] flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg shadow-lg transition-all cursor-pointer"
          aria-label="Close modal"
          type="button"
          style={{ lineHeight: '1', padding: 0 }}
        >
          ×
        </button>
        
        <h2 className="text-lg font-bold text-gray-900 mb-2 pr-10">Role and login access</h2>
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
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle('productsManagement');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                roleAccess.productsManagement ? 'bg-[#3B69E2]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  roleAccess.productsManagement ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Customers, Feedbacks and contact */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Customers, Feedbacks and contact.</h3>
              <p className="text-sm text-gray-500">
                The holder can access only Customers, Feedback & reviews and their massages & contact responses.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle('customersFeedbacks');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                roleAccess.customersFeedbacks ? 'bg-[#3B69E2]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  roleAccess.customersFeedbacks ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Finance */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Finance</h3>
              <p className="text-sm text-gray-500">
                The holder can access only Finance, transitions, payouts to supplier etc.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle('finance');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                roleAccess.finance ? 'bg-[#3B69E2]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  roleAccess.finance ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Update Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpdate}
            className="px-8 py-3 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity"
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
