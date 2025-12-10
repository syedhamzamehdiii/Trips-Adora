import React, { useEffect, useRef, useState } from 'react';

const notifications = [];

const ModalCard = ({ item }) => {
  const tagColor =
    item.tagColor === 'purple'
      ? 'bg-purple-100 text-purple-700'
      : item.tagColor === 'green'
      ? 'bg-green-100 text-green-700'
      : 'bg-orange-100 text-orange-700';

  return (
    <div className="pb-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 font-semibold text-base">{item.initial || 'S'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 text-base">{item.title || item.name}</h4>
            <span className="text-xs text-gray-500 whitespace-nowrap">{item.date}</span>
          </div>
          <div className="flex items-center gap-2 mb-2.5">
            {item.reference && (
              <span className="text-xs text-gray-600 font-medium">{item.reference}</span>
            )}
            {item.tag && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${tagColor}`}>{item.tag}</span>
            )}
          </div>
          {item.message && (
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              {item.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationsModal = ({ isOpen, onClose }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All messages');
  const filterBtnRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', onKey);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const closeOnOutside = (e) => {
    if (isFilterOpen && filterBtnRef.current && !filterBtnRef.current.contains(e.target)) {
      setIsFilterOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [isFilterOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 pt-16">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 relative">
          <h2 className="text-xl font-bold text-blue-600">Notifications</h2>
        </div>
        <div className="px-6 py-4 space-y-4 max-h-[500px] overflow-y-auto">
          {notifications.map((n) => (
            <ModalCard key={n.id} item={n} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
