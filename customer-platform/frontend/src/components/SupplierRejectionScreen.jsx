import React, { useMemo } from 'react';
import { SupplierPortalHeader, SupplierPortalFooter } from './SupplierPortalChrome';

const SupplierRejectionScreen = ({ rejectionReason, supplierId }) => {
  // Create Gmail compose link with pre-filled email
  const gmailLink = useMemo(() => {
    const recipient = 'support@tripsadora.com';
    const subject = encodeURIComponent('Supplier Application Rejection Inquiry');
    
    // Build email body
    let body = 'This is my SUPP-ID: ' + (supplierId || 'N/A');
    if (rejectionReason) {
      body += '\n\nThe reason for rejection is this: ' + rejectionReason;
    }
    body += '\n\n';
    
    const bodyEncoded = encodeURIComponent(body);
    
    // Gmail compose URL format
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${subject}&body=${bodyEncoded}`;
  }, [supplierId, rejectionReason]);

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <SupplierPortalHeader />
      
      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Warning Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-16 h-16 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Unsuccessful
          </h1>

          {/* Rejection Message */}
          <div className="space-y-4 mb-8">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Thanks for reaching out to partner with us! Unfortunately, we can't move forward with your application right now.
            </p>
            {rejectionReason && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-semibold text-red-900 mb-2">Reason for rejection:</p>
                <p className="text-sm text-red-800">{rejectionReason}</p>
              </div>
            )}
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              However, we'll be in touch if we decide to resume with your application later.
            </p>
          </div>

          {/* Contact Support Button */}
          <div className="mt-10">
            <a
              href={gmailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[#1d236b] text-white rounded-lg font-medium hover:bg-[#151a4a] transition-colors no-underline cursor-pointer"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <SupplierPortalFooter />
    </div>
  );
};

export default SupplierRejectionScreen;

