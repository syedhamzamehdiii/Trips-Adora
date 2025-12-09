import React, { useMemo, useState, useEffect, useCallback } from 'react';
import supplierService from '../services/supplierService';
import { checkSupplierToken } from '../services/api';

// Generate 18 dummy suppliers for approval
const generatePendingSuppliers = () => {
  const supplierNames = [
    'Aurora Tours', 'BluePeak Adventures', 'Evergreen Stays', 'CityCruise Co.',
    'SkyLine Transport', 'Desert Dunes', 'Mountain View Tours', 'Ocean Breeze',
    'Sunset Travels', 'Golden Gate Tours', 'Emerald Escapes', 'Crystal Clear',
    'Starlight Adventures', 'Wilderness Explorers', 'Urban Discoveries',
    'Coastal Cruises', 'Heritage Tours', 'Nature Trails'
  ];
  
  const locations = [
    'Tokyo, Japan', 'Dubai, UAE', 'Paris, France', 'New York, USA',
    'London, UK', 'Sydney, Australia', 'Singapore', 'Bangkok, Thailand',
    'Barcelona, Spain', 'Rome, Italy', 'Amsterdam, Netherlands', 'Berlin, Germany',
    'Vienna, Austria', 'Prague, Czech Republic', 'Istanbul, Turkey',
    'Cairo, Egypt', 'Mumbai, India', 'Seoul, South Korea'
  ];
  
  const accountTypes = ['company', 'solo', 'private'];
  
  const emails = [
    'supplier1@example.com', 'supplier2@example.com', 'supplier3@example.com',
    'supplier4@example.com', 'supplier5@example.com', 'supplier6@example.com',
    'supplier7@example.com', 'supplier8@example.com', 'supplier9@example.com',
    'supplier10@example.com', 'supplier11@example.com', 'supplier12@example.com',
    'supplier13@example.com', 'supplier14@example.com', 'supplier15@example.com',
    'supplier16@example.com', 'supplier17@example.com', 'supplier18@example.com'
  ];
  
  const phoneNumbers = [
    '+1-555-0101', '+1-555-0102', '+1-555-0103', '+1-555-0104',
    '+1-555-0105', '+1-555-0106', '+1-555-0107', '+1-555-0108',
    '+1-555-0109', '+1-555-0110', '+1-555-0111', '+1-555-0112',
    '+1-555-0113', '+1-555-0114', '+1-555-0115', '+1-555-0116',
    '+1-555-0117', '+1-555-0118'
  ];
  
  return supplierNames.map((name, i) => {
    const accountType = accountTypes[i % accountTypes.length];
    const isSolo = accountType === 'solo';
    
    return {
      id: `#TA-${1000000 + i}`,
      name,
      email: emails[i],
      phone: phoneNumbers[i] || null,
      location: locations[i],
      accountType,
      submittedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      // Solo supplier fields
      ...(isSolo ? {
        supplierName: name,
        supplierEmail: emails[i],
        supplierPhone: phoneNumbers[i] || null,
        supplierLocation: locations[i],
        numberOfEmployees: Math.floor(Math.random() * 5) + 1,
        identification: i % 3 === 0 ? null : 'https://via.placeholder.com/400x300?text=ID+Document',
      } : {
        // Business/Private supplier fields
        businessName: name,
        businessEmail: emails[i],
        businessPhone: phoneNumbers[i] || null,
        businessLocation: locations[i],
        businessBio: i % 2 === 0 ? `We are a leading ${accountType} travel service provider offering exceptional experiences.` : null,
        social: i % 3 === 0 ? null : {
          facebook: 'https://facebook.com/example',
          instagram: 'https://instagram.com/example',
          twitter: 'https://twitter.com/example'
        },
        businessWebsite: i % 2 === 0 ? 'https://www.example.com' : null,
        companyLogo: i % 4 === 0 ? null : 'https://via.placeholder.com/200x200?text=Logo',
        businessInsurance: i % 3 === 0 ? null : 'https://via.placeholder.com/400x600?text=Insurance+Doc',
        businessRegistration: i % 2 === 0 ? null : 'https://via.placeholder.com/400x600?text=Registration+Doc',
        supplierName: `Contact Person ${i + 1}`,
        supplierEmail: `contact${i + 1}@example.com`,
        supplierPhone: phoneNumbers[(i + 1) % phoneNumbers.length] || null,
        supplierLocation: locations[(i + 1) % locations.length],
        numberOfEmployees: Math.floor(Math.random() * 50) + 10,
        identification: i % 3 === 0 ? null : 'https://via.placeholder.com/400x300?text=ID+Document',
      })
    };
  });
};

// Supplier Profile View Component
const SupplierProfileView = ({ supplier, onBack, onApprove, onReject }) => {
  const isSolo = supplier.accountType === 'solo';
  
  const InfoField = ({ label, value, isImage = false, isLink = false }) => {
    const isPdf =
      typeof value === 'string' &&
      value.toLowerCase().trim().endsWith('.pdf');

    return (
      <div className="py-3 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</div>
        {!value || value === null ? (
          <div className="text-sm text-gray-400 italic">Not provided</div>
        ) : isImage ? (
          isPdf ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Open PDF
            </a>
          ) : (
            <div className="mt-2 space-y-2">
              <img 
                src={value} 
                alt={label} 
                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                style={{ maxHeight: '300px' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Open document
              </a>
            </div>
          )
        ) : isLink ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {value}
          </a>
        ) : (
          <div className="text-sm text-gray-800 font-medium">{value}</div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="mb-4 px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center gap-2 w-fit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Approvals
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-[#2c7a4b] tracking-tight">Supplier Profile</h1>
              <p className="text-sm text-gray-500 mt-1">{supplier.id} • {supplier.accountType.charAt(0).toUpperCase() + supplier.accountType.slice(1)} Account</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                supplier.status === 'approved' 
                  ? 'bg-green-100 text-green-700'
                  : supplier.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {supplier.status === 'approved' && '✓ Approved'}
                {supplier.status === 'rejected' && '✗ Rejected'}
                {supplier.status === 'pending' && '⏳ Pending'}
              </span>
              {supplier.status !== 'approved' && (
                <button
                  onClick={() => onApprove(supplier.id)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                >
                  {supplier.status === 'rejected' ? 'Approve' : 'Approve'}
                </button>
              )}
              {supplier.status !== 'rejected' && (
                <button
                  onClick={() => onReject(supplier.id)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                >
                  {supplier.status === 'approved' ? 'Reject' : 'Reject'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rejection Reason Alert */}
        {supplier.status === 'rejected' && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 mb-1">Rejection Reason</h3>
                {supplier.rejection_reason ? (
                  <p className="text-sm text-red-800">{supplier.rejection_reason}</p>
                ) : (
                  <p className="text-sm text-red-600 italic">No rejection reason provided.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-2xl border-2 border-[#284078] shadow-lg overflow-hidden">
          {isSolo ? (
            // Solo Supplier Profile
            <div className="p-6 md:p-8">
              <div className="mb-6 pb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#1c2a4f] text-white flex items-center justify-center text-2xl font-semibold">
                    {supplier.initials}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{supplier.supplierName || supplier.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">Solo Supplier Account</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <InfoField label="Supplier Name" value={supplier.supplierName || supplier.name || supplier.user_name} />
                  <InfoField label="Supplier Email" value={supplier.supplierEmail || supplier.email || supplier.user_email} />
                  <InfoField label="Supplier Phone No" value={supplier.supplierPhone || supplier.phone || supplier.person_contact} />
                  <InfoField label="Supplier Location" value={supplier.supplierLocation || supplier.location} />
                  <InfoField label="Number of Employees" value={supplier.numberOfEmployees?.toString() || supplier.employee_count?.toString()} />
                </div>
                <div className="space-y-1">
                  {supplier.idType && (
                    <InfoField label="ID Type" value={supplier.idType} />
                  )}
                  <InfoField label="Identification Document (Front)" value={supplier.identification} isImage={!!supplier.identification} />
                  {supplier.identificationBack && (
                    <InfoField label="Identification Document (Back)" value={supplier.identificationBack} isImage={!!supplier.identificationBack} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Business/Private Supplier Profile
            <div className="p-6 md:p-8">
              {/* Business Information Section */}
              <div className="mb-8 pb-6 border-b-2 border-gray-200">
                <h3 className="text-xl font-bold text-[#284078] mb-6">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <InfoField label="Business Name" value={supplier.businessName || supplier.name} />
                    <InfoField label="Business Email" value={supplier.businessEmail || supplier.email} />
                    <InfoField label="Business Phone" value={supplier.businessPhone || supplier.phone} />
                    <InfoField label="Business Location" value={supplier.businessLocation || supplier.location} />
                    <InfoField label="Business Bio" value={supplier.businessBio} />
                  </div>
                  <div className="space-y-1">
                    {supplier.socialLinks && supplier.socialLinks.length > 0 ? (
                      <div className="py-3 border-b border-gray-100">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Social Media</div>
                        <div className="space-y-2">
                          {supplier.socialLinks.map((link, index) => (
                            <a 
                              key={index}
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block text-sm text-blue-600 hover:text-blue-800"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <InfoField label="Social Media" value={null} />
                    )}
                    <InfoField 
                      label="Business Website" 
                      value={supplier.businessWebsite ? (supplier.businessWebsite.startsWith('http') ? supplier.businessWebsite : `https://${supplier.businessWebsite}`) : null} 
                      isLink={!!supplier.businessWebsite} 
                    />
                    <InfoField label="Company Logo" value={supplier.companyLogo} isImage={!!supplier.companyLogo} />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField label="Business Insurance" value={supplier.businessInsurance} isImage={!!supplier.businessInsurance} />
                  <InfoField label="Business Registration Document" value={supplier.businessRegistration} isImage={!!supplier.businessRegistration} />
                  {supplier.businessRegistrationNumber && (
                    <InfoField label="Business Registration Number" value={supplier.businessRegistrationNumber} />
                  )}
                </div>
              </div>

              {/* Supplier Contact Information Section */}
              <div>
                <h3 className="text-xl font-bold text-[#284078] mb-6">Supplier Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <InfoField label="Supplier Name" value={supplier.supplierName} />
                    <InfoField label="Supplier Email" value={supplier.supplierEmail} />
                    <InfoField label="Supplier Phone No" value={supplier.supplierPhone} />
                    <InfoField label="Supplier Location" value={supplier.supplierLocation} />
                    <InfoField label="Number of Employees" value={supplier.numberOfEmployees?.toString()} />
                  </div>
                  <div className="space-y-1">
                    {supplier.idType && (
                      <InfoField label="ID Type" value={supplier.idType} />
                    )}
                    <InfoField label="Identification Document (Front)" value={supplier.identification} isImage={!!supplier.identification} />
                    {supplier.identificationBack && (
                      <InfoField label="Identification Document (Back)" value={supplier.identificationBack} isImage={!!supplier.identificationBack} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageSupplierApprovals = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [pendingSuppliers, setPendingSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [supplierToReject, setSupplierToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const pageSize = 8;

  const mapOnboardingToSupplier = (item) => {
    const name = item.business_name || item.user_name || item.email;
    const businessLocationParts = [item.business_city, item.business_country].filter(Boolean);
    const personLocationParts = [item.person_city, item.person_country].filter(Boolean);
    const personLocation = personLocationParts.length > 0 
      ? personLocationParts.join(', ') 
      : item.person_address || null;
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    // Map snake_case API fields to camelCase component fields
    return {
      id: item.id,
      name,
      email: item.email || item.user_email,
      phone: item.business_phone || item.person_contact || null,
      location: businessLocationParts.join(', ') || personLocation || '—',
      accountType: item.business_type,
      submittedDate: item.submitted_at,
      initials,
      // Business fields
      businessName: item.business_name,
      businessEmail: item.business_email || item.email,
      businessPhone: item.business_phone,
      businessLocation: businessLocationParts.join(', ') || null,
      businessWebsite: item.business_website,
      businessBio: item.short_bio,
      companyLogo: item.logo_url,
      businessInsurance: item.insurance_document_url,
      businessRegistration: item.business_document_url,
      businessRegistrationNumber: item.business_registration,
      // Supplier/Person fields
      supplierName: item.user_name,
      supplierEmail: item.user_email || item.email,
      supplierPhone: item.person_contact,
      supplierLocation: personLocation,
      numberOfEmployees: item.employee_count,
      identification: item.id_front_url,
      identificationBack: item.id_back_url,
      idType: item.id_type,
      // Social links
      socialLinks: item.social_links || [],
      // Status and rejection reason
      status: item.status,
      rejection_reason: item.rejection_reason,
      // Keep all original fields for backward compatibility
      ...item,
    };
  };

  const fetchPending = useCallback(async (status = 'pending') => {
    setLoading(true);
    setError(null);
    try {
      const data = await supplierService.getPendingOnboardings(status);
      const list = (data?.onboardings || data || []).map(mapOnboardingToSupplier);
      setPendingSuppliers(list);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load suppliers', err);
      if (err?.response?.status === 401 || err?.message?.includes('401')) {
        setError('Authentication failed: Token expired or invalid. Please generate a new token using: python supplier-platform/backend/create_admin_user.py');
      } else {
        setError(err?.message || 'Unable to load suppliers');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check token status on mount
    checkSupplierToken();
    fetchPending(statusFilter);
  }, [fetchPending, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(pendingSuppliers.length / pageSize));
  
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return pendingSuppliers.slice(start, start + pageSize);
  }, [currentPage, pendingSuppliers]);

  const handleApprove = async (supplierId) => {
    try {
      // Clear rejection reason when approving
      await supplierService.updateOnboardingStatus(supplierId, 'approved', null);
      await fetchPending(statusFilter);
      if (viewingSupplier) {
        setViewingSupplier(null);
      }
    } catch (err) {
      setError(err?.message || 'Failed to approve supplier');
    }
  };

  const handleRejectClick = (supplierId) => {
    const supplier = pendingSuppliers.find(s => s.id === supplierId);
    setSupplierToReject(supplier);
    setRejectionReason('');
    setError(null); // Clear any previous errors
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!supplierToReject) return;
    
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await supplierService.updateOnboardingStatus(
        supplierToReject.id, 
        'rejected', 
        rejectionReason.trim()
      );
      setShowRejectModal(false);
      setSupplierToReject(null);
      setRejectionReason('');
      await fetchPending(statusFilter);
      if (viewingSupplier) {
        setViewingSupplier(null);
      }
    } catch (err) {
      setError(err?.message || 'Failed to reject supplier');
    }
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setSupplierToReject(null);
    setRejectionReason('');
    setError(null); // Clear any errors
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleView = (supplierId) => {
    const supplier = pendingSuppliers.find(s => s.id === supplierId);
    setViewingSupplier(supplier);
  };

  // Show profile view if viewing a supplier
  if (viewingSupplier) {
    return (
      <SupplierProfileView 
        supplier={viewingSupplier}
        onBack={() => setViewingSupplier(null)}
        onApprove={handleApprove}
        onReject={handleRejectClick}
      />
    );
  }

  return (
    <div className="w-full h-full text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {onBack && (
              <button 
                onClick={onBack}
                className="mb-4 px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            )}
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2c7a4b] tracking-tight">Manage Supplier Approvals</h1>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => handleFilterChange('pending')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-[#284078] text-white shadow-md'
                : 'bg-white text-[#284078] border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleFilterChange('approved')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'approved'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-green-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => handleFilterChange('rejected')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-red-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Suppliers Table */}
        <div className="mt-6 rounded-2xl border-2 border-[#284078] bg-white shadow-sm">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <div className="text-[15px] font-semibold text-[#284078]">
              {statusFilter === 'pending' && 'Pending Supplier Approvals'}
              {statusFilter === 'approved' && 'Approved Suppliers'}
              {statusFilter === 'rejected' && 'Rejected Suppliers'}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {statusFilter === 'pending' && 'Review and approve or reject supplier registration requests.'}
              {statusFilter === 'approved' && 'List of suppliers that have been approved.'}
              {statusFilter === 'rejected' && 'List of suppliers that have been rejected.'}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[#284078] bg-[#A9B3C9]/20">
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Supplier ID</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Location</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Account Type</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Submitted</th>
                  <th className="text-center px-3 md:px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-3 md:px-4 py-6 text-center text-gray-500">
                      Loading suppliers...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="px-3 md:px-4 py-6 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-3 md:px-4 py-6 text-center text-gray-500">
                      {statusFilter === 'pending' && 'No pending supplier approvals.'}
                      {statusFilter === 'approved' && 'No approved suppliers.'}
                      {statusFilter === 'rejected' && 'No rejected suppliers.'}
                    </td>
                  </tr>
                ) : (
                  pageSlice.map((supplier) => (
                    <tr key={supplier.id} className="bg-white hover:bg-gray-50">
                      <td className="px-3 md:px-4 py-3 text-gray-700 font-medium">{supplier.id}</td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1c2a4f] text-white flex items-center justify-center text-xs font-semibold">
                            {supplier.initials}
                          </div>
                          <span className="text-gray-800 font-medium">{supplier.name}</span>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700">{supplier.email}</td>
                      <td className="px-3 md:px-4 py-3 text-gray-700">{supplier.location}</td>
                      <td className="px-3 md:px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                          {supplier.accountType}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          supplier.status === 'approved' 
                            ? 'bg-green-100 text-green-700' 
                            : supplier.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {supplier.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-600 text-xs">
                        {supplier.submittedDate ? new Date(supplier.submittedDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(supplier.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            aria-label="View"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.6" className="w-4 h-4">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                              <circle cx="12" cy="12" r="2.5"/>
                            </svg>
                          </button>
                          {supplier.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(supplier.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                              title={supplier.status === 'rejected' ? 'Approve this rejected supplier' : 'Approve supplier'}
                            >
                              Approve
                            </button>
                          )}
                          {supplier.status !== 'rejected' && (
                            <button
                              onClick={() => handleRejectClick(supplier.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                              title={supplier.status === 'approved' ? 'Reject this approved supplier' : 'Reject supplier'}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2 text-[#284078]">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-full border border-gray-300 text-[#284078] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ‹
            </button>
            {totalPages <= 7 ? (
              // Show all pages if 7 or fewer
              Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button 
                  key={n} 
                  onClick={() => setCurrentPage(n)} 
                  className={`w-8 h-8 rounded-full border text-sm ${
                    currentPage === n 
                      ? 'bg-[#1c2a4f] text-white border-[#1c2a4f]' 
                      : 'border-gray-300 text-[#284078] hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))
            ) : (
              <>
                {/* Show first 3 pages */}
                {[1, 2, 3].map(n => (
                  <button 
                    key={n} 
                    onClick={() => setCurrentPage(n)} 
                    className={`w-8 h-8 rounded-full border text-sm ${
                      currentPage === n 
                        ? 'bg-[#1c2a4f] text-white border-[#1c2a4f]' 
                        : 'border-gray-300 text-[#284078] hover:bg-gray-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button disabled className="w-8 h-8 rounded-full border border-gray-300 text-[#284078] cursor-default">
                  …
                </button>
                {/* Show last 3 pages */}
                {[totalPages - 2, totalPages - 1, totalPages].map(n => (
                  <button 
                    key={n} 
                    onClick={() => setCurrentPage(n)} 
                    className={`w-8 h-8 rounded-full border text-sm ${
                      currentPage === n 
                        ? 'bg-[#1c2a4f] text-white border-[#1c2a4f]' 
                        : 'border-gray-300 text-[#284078] hover:bg-gray-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </>
            )}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-full border border-gray-300 text-[#284078] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ›
            </button>
            <button className="ml-2 px-3 h-8 rounded-full border border-gray-300 text-[#284078] text-xs inline-flex items-center gap-1">
              {`${currentPage}\\${totalPages}`}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#284078" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Rejection Reason Modal */}
        {showRejectModal && supplierToReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reject Supplier</h2>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting <strong>{supplierToReject.name || supplierToReject.email}</strong>. 
                This reason will be stored and shown to the supplier.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  required
                />
                {error && error.includes('reason') && (
                  <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleRejectCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSupplierApprovals;
