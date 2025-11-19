import React, { useEffect } from 'react';
import PayoutDetail from './PayoutDetail';

const PayoutDetailModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[80vh]">
          <div className="flex justify-end p-3">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="px-5 pb-5 overflow-auto max-h-[70vh]">
            <PayoutDetail />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutDetailModal;


