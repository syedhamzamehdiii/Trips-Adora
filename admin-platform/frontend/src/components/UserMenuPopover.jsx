import React, { useEffect } from 'react';

export default function UserMenuPopover({ isOpen, onClose, anchorRect, onSettings, onSignout }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    function onClick(e) {
      if (!isOpen) return;
      if (e.target.closest('#user-menu-popover')) return;
      onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen, onClose]);

  if (!isOpen || !anchorRect) return null;

  const style = {
    position: 'fixed',
    top: anchorRect.bottom + 8,
    left: Math.min(window.innerWidth - 220, Math.max(8, anchorRect.right - 180)),
    zIndex: 70,
  };

  return (
    <div id="user-menu-popover" style={style} className="w-[200px] bg-[#FBF7F6] rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onSettings}
        className="w-full text-center py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
      >
        Settings
      </button>
      <div className="h-px bg-gray-300 mx-3" />
      <button
        onClick={onSignout}
        className="w-full text-center py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
      >
        Signout
      </button>
      <div className="h-px bg-gray-300 mx-3" />
    </div>
  );
}


