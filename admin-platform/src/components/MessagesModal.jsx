import React, { useEffect } from 'react';

const messages = [
  {
    id: 1,
    initial: 'S',
    name: 'Sarah Jhonson',
    date: 'August 2025',
    reference: '#TA-1002484',
    tag: 'Supplier',
    message: 'Trip Adora is a great platform to work with a few features lie...'
  },
  {
    id: 2,
    initial: 'S',
    name: 'Sarah Jhonson',
    date: 'August 2025',
    reference: '#TA-1002484',
    tag: 'Supplier',
    message: 'Trip Adora is a great platform to work with a few features lie...'
  },
  {
    id: 3,
    initial: 'S',
    name: 'Sarah Jhonson',
    date: 'August 2025',
    reference: '#TA-1002484',
    tag: 'Customer',
    message: 'Trip Adora is a great platform to work with a few features lie...'
  }
];

const Row = ({ item }) => {
  const tagColor = item.tag === 'Supplier' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
  return (
    <div className="bg-[#F3F4F6] rounded-2xl p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-semibold">{item.initial}</div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-gray-900 font-semibold tracking-tight">{item.name}</h4>
              <span className="text-xs text-gray-500 ml-3">{item.date}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-600">{item.reference}</span>
              <span className={`px-3 py-0.5 rounded-full text-xs ${tagColor}`}>{item.tag}</span>
            </div>
            <div className="mt-2">
              <span className="inline-block text-xs text-gray-700 bg-white rounded-full px-3 py-1 border border-gray-200">
                {item.message}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessagesModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 pt-16">
      <div className="bg-white rounded-[22px] shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-[#2563EB] font-semibold">Messages</h3>
          <button onClick={onClose} className="text-xs rounded-full border px-3 py-1 text-gray-700">All</button>
        </div>
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {messages.map((m) => (
            <React.Fragment key={m.id}>
              <Row item={m} />
              <div className="h-px bg-gray-200" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessagesModal;


