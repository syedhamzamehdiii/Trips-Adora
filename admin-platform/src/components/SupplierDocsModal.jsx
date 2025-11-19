import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Download, Eye } from 'lucide-react';

const SupplierDocsModal = ({ isOpen, onClose, anchorRect }) => {
  const [openPreviewId, setOpenPreviewId] = useState(null);
  const containerRef = useRef(null);

  const docs = [
    { id: 1, label: 'Insurance Doc.' },
    { id: 2, label: 'Driving license Doc.' },
    { id: 3, label: 'Logo Uploaded' },
  ];

  // Calculate position near anchor, with viewport clamping
  const gap = 8;
  const left = anchorRect
    ? Math.min(Math.max(8, anchorRect.left), window.innerWidth - 320 - 8)
    : 0;
  const top = anchorRect
    ? Math.min(Math.max(8, anchorRect.bottom + gap), window.innerHeight - 220 - 8)
    : 0;

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [isOpen, onClose]);

  const handleDownload = (label) => {
    const content = `Dummy ${label} contents for download.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !anchorRect) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={containerRef}
        className="absolute w-[320px] bg-white rounded-2xl shadow-xl p-5 border transition-all duration-200 ease-out"
        style={{ left: `${left}px`, top: `${top}px`, borderColor: '#E5E7EB' }}
      >
        <div className="space-y-4">
          {docs.map((doc) => (
            <div key={doc.id} className="">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 border rounded-full px-4 py-2">
                    <span className="inline-flex w-5 h-5 items-center justify-center rounded border">
                      <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
                    </span>
                    <span className="text-sm text-gray-800 whitespace-nowrap">{doc.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-gray-700">
                  <button type="button" className="hover:text-gray-900" aria-label="Download" onClick={() => handleDownload(doc.label)}>
                    <Download className="w-4 h-4" />
                  </button>
                  <button type="button" className="hover:text-gray-900" aria-label="View" onClick={() => setOpenPreviewId(openPreviewId === doc.id ? null : doc.id)}>
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {openPreviewId === doc.id && (
                <div className="mt-2 ml-2 mr-2 p-3 rounded-lg bg-gray-50 border text-xs text-gray-700" style={{ borderColor: '#E5E7EB' }}>
                  <p className="font-semibold mb-1">{doc.label} Preview</p>
                  <p>Holder: Karvaan Tours</p>
                  <p>Issued: 2024-01-15</p>
                  <p>Ref: DOC-{String(doc.id).padStart(4, '0')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierDocsModal;


