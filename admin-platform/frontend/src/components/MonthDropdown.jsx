import React, { useEffect, useRef, useState } from 'react';

const MonthDropdown = ({ value, onChange, options = ['October', 'September', 'August', 'July'] }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (btnRef.current && !btnRef.current.parentElement.contains(e.target)) setOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white flex items-center gap-2 hover:bg-gray-50"
      >
        {value}
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg p-2 z-50">
          <ul className="space-y-2">
            {options.map((opt) => {
              const selected = opt === value;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 text-left"
                  >
                    <span className="text-sm text-gray-900">{opt}</span>
                    <span className={`w-5 h-5 rounded border flex items-center justify-center ${selected ? 'bg-[#284078] border-[#284078]' : 'border-gray-300'}`}>
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MonthDropdown;


