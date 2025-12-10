import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Download, Eye } from 'lucide-react';

const SupplierDocsModal = ({ isOpen, onClose, anchorRect, documents = [] }) => {
  const [openPreviewId, setOpenPreviewId] = useState(null);
  const containerRef = useRef(null);

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

  const handleDownload = (doc) => {
    if (!doc.url) return;
    
    // Generate proper filename
    const getFilename = (url, label) => {
      if (!url) return label.replace(/\s+/g, '_');
      // Check if it's a PDF (Cloudinary raw file or ends with .pdf)
      const isPdf = url.toLowerCase().includes('.pdf') || 
                   (url.includes('cloudinary.com') && url.includes('/raw/'));
      const extension = isPdf ? '.pdf' : 
                       url.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || '';
      const sanitizedLabel = label
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
      return `${sanitizedLabel}${extension}`;
    };
    
    const a = document.createElement('a');
    a.href = doc.url;
    a.download = getFilename(doc.url, doc.label);
    document.body.appendChild(a);
    a.click();
    a.remove();
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
          {documents.length === 0 && (
            <div className="text-sm text-gray-500">No documents uploaded.</div>
          )}
          {documents.map((doc) => (
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
                  <button type="button" className="hover:text-gray-900" aria-label="Download" onClick={() => handleDownload(doc)}>
                    <Download className="w-4 h-4" />
                  </button>
                  {doc.url && (
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      download={(() => {
                        const isPdf = doc.url.toLowerCase().includes('.pdf') || 
                                     (doc.url.includes('cloudinary.com') && doc.url.includes('/raw/'));
                        const extension = isPdf ? '.pdf' : 
                                         doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || '';
                        const sanitizedLabel = doc.label
                          .replace(/[^a-zA-Z0-9\s]/g, '')
                          .replace(/\s+/g, '_')
                          .toLowerCase();
                        return `${sanitizedLabel}${extension}`;
                      })()}
                      className="hover:text-gray-900" 
                      aria-label="View"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  {!doc.url && (
                    <span className="text-xs text-gray-400">No file</span>
                  )}
                </div>
              </div>
              {openPreviewId === doc.id && doc.url && (
                <div className="mt-2 ml-2 mr-2 p-3 rounded-lg bg-gray-50 border text-xs text-gray-700" style={{ borderColor: '#E5E7EB' }}>
                  <p className="font-semibold mb-1">{doc.label}</p>
                  <p className="break-all">{doc.url}</p>
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


