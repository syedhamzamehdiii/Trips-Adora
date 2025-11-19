import React, { useEffect, useRef, useState } from 'react';

const sampleMessages = [
  { id: 1, initial: 'S', name: 'Sarah Jhonson', date: 'August 2025', reference: '#TA-1002484', tag: 'Supplier', message: 'Trip Adora is a great platform to work with a few features lie...' },
  { id: 2, initial: 'S', name: 'Sarah Jhonson', date: 'August 2025', reference: '#TA-1002484', tag: 'Supplier', message: 'Trip Adora is a great platform to work with a few features lie...' },
  { id: 3, initial: 'S', name: 'Sarah Jhonson', date: 'August 2025', reference: '#TA-1002484', tag: 'Customer', message: 'Trip Adora is a great platform to work with a few features lie...' },
];

export default function MessagesPopover({ isOpen, onClose, anchorRect, messages = sampleMessages }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const filterBtnRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    function onClick(e) {
      if (!isOpen) return;
      if (e.target.closest('#messages-popover')) return;
      onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen, onClose]);

  if (!isOpen || !anchorRect) return null;

  const style = {
    position: 'fixed',
    top: anchorRect.bottom + 8,
    left: Math.max(8, Math.min(window.innerWidth - 480, anchorRect.right - 360)),
    zIndex: 60,
  };

  const tagClass = (t) => (t === 'Supplier' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700');

  return (
    <div id="messages-popover" style={style} className="w-[420px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 relative">
        <h3 className="text-blue-600 font-semibold">Messages</h3>
        <div className="relative" ref={filterBtnRef}>
          <button onClick={() => setIsFilterOpen((v) => !v)} className="px-3 py-1 border border-gray-300 rounded-full text-xs text-gray-700">{selectedFilter}</button>
          {isFilterOpen && (
            <div className="absolute right-0 top-9 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-10 p-2">
              {['All','By suppliers only','By customers only'].map((opt) => {
                const isActive = selectedFilter === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => { setSelectedFilter(opt); setIsFilterOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="text-sm text-gray-700 text-left">{opt}</span>
                    <span className={`w-3.5 h-3.5 rounded-sm border ${isActive ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}`}></span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className="pb-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-semibold">{m.initial}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-gray-900 font-semibold">{m.name}</h4>
                  <span className="text-xs text-gray-500">{m.date}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-gray-600">{m.reference}</span>
                  <span className={`px-3 py-0.5 rounded-full text-xs ${tagClass(m.tag)}`}>{m.tag}</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block text-xs text-gray-700 bg-white rounded-full px-3 py-1 border border-gray-200">{m.message}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


