import { useState, useEffect } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const FromSupplierModal = ({ isOpen, onClose }) => {
  // Toggle settings state
  const [toggleSettings, setToggleSettings] = useState({
    driverContact: true,
    currentLocation: true,
    instantBooking: true
  });

  // Load saved values
  useEffect(() => {
    try {
      const raw = localStorage.getItem('supplier_keys');
      if (raw) {
        const data = JSON.parse(raw);
        setToggleSettings(prev => ({ ...prev, ...data }));
      }
    } catch (_) {}
  }, [isOpen]);

  const persist = (next) => {
    try {
      localStorage.setItem('supplier_keys', JSON.stringify(next));
      window.dispatchEvent(new Event('supplierKeysUpdated'));
    } catch (_) {}
  };

  const handleToggleSetting = (setting) => {
    setToggleSettings(prev => {
      const next = { ...prev, [setting]: !prev[setting] };
      persist(next);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl">
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Driver Contact */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">Driver contact</h4>
                  <FiAlertCircle className="text-blue-500" size={14} />
                </div>
                <p className="text-xs text-gray-600">
                  Show the driver's active contact number with the customer to ensure smooth communication and easy coordination during the trip.
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => handleToggleSetting('driverContact')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    toggleSettings.driverContact ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      toggleSettings.driverContact ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Current Location */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Current Location</h4>
                <p className="text-xs text-gray-600">
                  After confirming the departure details, please make sure to turn on your location. This will help the traveller track your vehicle easily and ensure smooth coordination throughout the trip.
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => handleToggleSetting('currentLocation')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    toggleSettings.currentLocation ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      toggleSettings.currentLocation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Instant Booking */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">Instant booking</h4>
                  <FiAlertCircle className="text-blue-500" size={14} />
                </div>
                <p className="text-xs text-gray-600">
                  Show the driver's active contact number with the customer to ensure smooth communication and easy coordination during the trip.
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => handleToggleSetting('instantBooking')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    toggleSettings.instantBooking ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      toggleSettings.instantBooking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FromSupplierModal;
