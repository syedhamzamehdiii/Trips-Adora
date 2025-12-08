import React, { useMemo, useState } from 'react';

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
  
  return supplierNames.map((name, i) => ({
    id: `#TA-${1000000 + i}`,
    name,
    email: emails[i],
    location: locations[i],
    accountType: accountTypes[i % accountTypes.length],
    submittedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }));
};

const ManageSupplierApprovals = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const allSuppliers = useMemo(() => generatePendingSuppliers(), []);
  const totalPages = Math.ceil(allSuppliers.length / pageSize);
  
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allSuppliers.slice(start, start + pageSize);
  }, [currentPage, allSuppliers]);

  const handleApprove = (supplierId) => {
    console.log('Approve supplier:', supplierId);
    // Functionality will be added later
  };

  const handleReject = (supplierId) => {
    console.log('Reject supplier:', supplierId);
    // Functionality will be added later
  };

  const handleView = (supplierId) => {
    console.log('View supplier:', supplierId);
    // Functionality will be added later
  };

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

        {/* Suppliers Table */}
        <div className="mt-6 rounded-2xl border-2 border-[#284078] bg-white shadow-sm">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <div className="text-[15px] font-semibold text-[#284078]">Pending Supplier Approvals</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Review and approve or reject supplier registration requests.</div>
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
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Submitted</th>
                  <th className="text-center px-3 md:px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageSlice.map((supplier) => (
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
                    <td className="px-3 md:px-4 py-3 text-gray-600 text-xs">{supplier.submittedDate}</td>
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
                        <button
                          onClick={() => handleApprove(supplier.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(supplier.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
      </div>
    </div>
  );
};

export default ManageSupplierApprovals;
