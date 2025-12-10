import React, { useEffect, useRef, useState } from 'react';

export default function NotificationsPopover({ isOpen, onClose, anchorRect, notifications = [] }) {
  const filterBtnRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    function onClick(e) {
      if (!isOpen) return;
      if (e.target.closest('#notifications-popover')) return;
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

  const tagClass = (c) =>
    c === 'purple' ? 'bg-purple-100 text-purple-700' : c === 'green' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';

  return (
    <div id="notifications-popover" style={style} className="w-[420px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 relative">
        <h3 className="text-blue-600 font-semibold">Notifications</h3>
      </div>
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        {notifications.map((n) => (
          <div key={n.id} className="pb-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-base">{n.initial || 'S'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-semibold text-gray-900 text-base">{n.title || n.name}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{n.date}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {n.reference && <span className="text-xs text-gray-600 font-medium">{n.reference}</span>}
                  {n.tag && <span className={`px-3 py-1 rounded-full text-xs font-medium ${tagClass(n.tagColor)}`}>{n.tag}</span>}
                </div>
                {n.message && (
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">{n.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


