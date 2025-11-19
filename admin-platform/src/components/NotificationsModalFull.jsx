import React, { useState, useRef, useEffect } from 'react';

const NotificationsModalFull = ({ isOpen, onClose }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOption, setFilterOption] = useState('All Notification');
  const filterButtonRef = useRef(null);

  const notifications = [
    {
      id: 1,
      initial: 'S',
      title: 'Platform Reminder',
      date: 'August 2025',
      tag: 'Payout',
      tagColor: 'purple',
      message:
        'You can no longer sign in to Envato | API #12353 | API #12353 | API #12353 | AP...',
    },
    {
      id: 2,
      initial: 'S',
      name: 'Sarah Jhonson',
      date: 'August 2025',
      reference: '#TA-1002484',
      tag: 'Supplier',
      tagColor: 'green',
      message: 'Hi,Admin is a great platform to work with! It is so nice, the...',
    },
    {
      id: 3,
      initial: 'S',
      name: 'Sarah Jhonson',
      date: 'August 2025',
      reference: '#TA-1002484',
      tag: 'Customer',
      tagColor: 'orange',
      message: 'Hi,Admin is a great platform to work with! It is so nice, the...',
    },
  ];

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterSelect = (option) => {
    setFilterOption(option);
    setIsFilterOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen && filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 pt-16">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-blue-600">Notifications</h2>
          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Close icon */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            {/* Filter Button with Dropdown */}
            <div className="relative" ref={filterButtonRef}>
              <button
                onClick={handleFilterClick}
                className="px-4 py-1.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                {filterOption}
              </button>
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-56 z-10">
                  <button
                    onClick={() => handleFilterSelect('All Notification')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    All messages
                  </button>
                  <button
                    onClick={() => handleFilterSelect('Suppliers Only')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    By suppliers only
                  </button>
                  <button
                    onClick={() => handleFilterSelect('Customers Only')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    By customers only
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="px-6 py-4 space-y-4 max-h-[500px] overflow-y-auto">
          {notifications.map((notification) => (
            <div key={notification.id} className="pb-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-base">{notification.initial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {notification.title || notification.name}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{notification.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2.5">
                    {notification.reference && (
                      <span className="text-xs text-gray-600 font-medium">{notification.reference}</span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        notification.tagColor === 'purple'
                          ? 'bg-purple-100 text-purple-700'
                          : notification.tagColor === 'green'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {notification.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModalFull;


