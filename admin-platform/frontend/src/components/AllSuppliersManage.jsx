import React, { useMemo, useState } from 'react';
import ManageSupplierApprovals from './ManageSupplierApprovals';

const baseSuppliers = [
  { id: 'SUP-001', name: 'Aurora Tours', category: 'Tours', rating: 4.7, bookings: 842, status: 'Active' },
  { id: 'SUP-002', name: 'BluePeak Adventures', category: 'Adventure', rating: 4.4, bookings: 530, status: 'Pending' },
  { id: 'SUP-003', name: 'Evergreen Stays', category: 'Hotels', rating: 4.9, bookings: 1210, status: 'Active' },
  { id: 'SUP-004', name: 'CityCruise Co.', category: 'Cruise', rating: 4.2, bookings: 312, status: 'Paused' },
  { id: 'SUP-005', name: 'SkyLine Transport', category: 'Transport', rating: 4.5, bookings: 618, status: 'Active' },
  { id: 'SUP-006', name: 'Desert Dunes', category: 'Desert Safari', rating: 4.1, bookings: 287, status: 'Pending' },
];

// Generate a larger mock list for pagination demo
const generateSuppliers = (count = 112) => {
  const list = [];
  for (let i = 0; i < count; i++) {
    const tpl = baseSuppliers[i % baseSuppliers.length];
    list.push({
      ...tpl,
      id: `SUP-${(i + 1).toString().padStart(3, '0')}`,
      bookings: tpl.bookings + i * 3,
      rating: (4 + ((i % 10) / 10)).toFixed(1),
    });
  }
  return list;
};

const StatCard = ({ title, value, bgColor = '#DBFCE7' }) => (
  <div
    className="rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center px-6 py-6"
    style={{ backgroundColor: bgColor }}
  >
    <div className="text-[36px] font-semibold" style={{ color: '#284078' }}>{value}</div>
    <div className="mt-2 text-[21px] font-medium" style={{ color: '#284078' }}>{title}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Active: { bg: 'bg-[#E3FFE4]', text: 'text-[#284078]', ring: 'ring-[#78F37E]' },
    Pending: { bg: 'bg-[#E5E267]', text: 'text-[#284078]', ring: 'ring-[#A9B3C9]' },
    Paused: { bg: 'bg-[#FFE3E3]', text: 'text-[#284078]', ring: 'ring-[#FA9E9E]' },
  };
  const c = map[status] || map.Active;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${c.bg} ${c.text} ring-1 ${c.ring}/30`}>{status}</span>
  );
};

const Card = ({ supplier }) => (
  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
    <div className="p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base md:text-lg font-semibold text-gray-800">{supplier.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{supplier.category} • {supplier.id}</div>
        </div>
        <StatusBadge status={supplier.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3 bg-[#E3FFE4]">
          <div className="text-[10px] text-[#284078]">Bookings</div>
          <div className="text-sm font-semibold text-[#284078]">{supplier.bookings}</div>
        </div>
        <div className="rounded-xl p-3 bg-[#A9B3C9]/30">
          <div className="text-[10px] text-[#284078]">Rating</div>
          <div className="text-sm font-semibold text-[#284078]">{supplier.rating}</div>
        </div>
        <div className="rounded-xl p-3 bg-[#E5E267]">
          <div className="text-[10px] text-[#284078]">Category</div>
          <div className="text-sm font-semibold text-[#284078]">{supplier.category}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button className="h-10 px-4 rounded-[14px] text-sm font-medium text-white bg-[#284078] hover:opacity-90">View</button>
        <button className="h-10 px-4 rounded-[14px] text-sm font-medium text-[#284078] bg-[#FFE3E3] hover:bg-[#FA9E9E]/60">Pause</button>
        <button className="ml-auto h-10 px-4 rounded-[14px] text-sm font-medium text-[#284078] bg-[#A9B3C9]/30 hover:bg-[#A9B3C9]/50">Edit</button>
      </div>
    </div>
  </div>
);

const AllSuppliersManage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // matches screenshot rows
  const totalPages = 14; // to display 12,13,14 in pager like mock
  const suppliersMock = useMemo(() => generateSuppliers(pageSize * totalPages), []);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return suppliersMock.slice(start, start + pageSize);
  }, [currentPage, suppliersMock]);
  const [selected, setSelected] = useState(null);
  const [showManageApprovals, setShowManageApprovals] = useState(false);

  const openModal = (payload) => setSelected(payload);
  const closeModal = () => setSelected(null);

  const initialsOf = (fullName) => {
    const parts = String(fullName || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '');
    return (parts[0] || '') + (parts[1] || '');
  };
  return (
    <div className="w-full h-full text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showManageApprovals ? (
          <ManageSupplierApprovals onBack={() => setShowManageApprovals(false)} />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-4xl font-semibold text-[#2c7a4b] tracking-tight">Manage All Suppliers</h1>
              <button 
                onClick={() => setShowManageApprovals(true)}
                className="relative inline-flex items-center gap-2 rounded-full text-sm shadow"
                style={{ backgroundColor: '#284078', color: '#fff', height: '44px', paddingInline: '20px' }}>
                Request to approve
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] leading-none flex items-center justify-center">15</span>
              </button>
            </div>

        {/* KPI Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 ">
          <StatCard title="Total Suppliers" value="2,058" bgColor="#DBFCE7" />
          <StatCard title="Active" value="1,826" bgColor="#A9B3C9" />
          <StatCard title="Verification Pending" value="12" bgColor="#FEF9C2" />
          <StatCard title="Total earnings" value="$2.6M" bgColor="#FFD4CE" />
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative max-w-xl">
            <input className="w-full h-11 rounded-full border border-gray-300 bg-white px-5 pr-12 text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#284078]" placeholder="Search by name or ref. number" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8  bg-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>
        </div>

        {/* Cards Grid — not in mock, omitted for exact match */}

        {/* Table */}
        <div className="mt-4 rounded-2xl border-2 border-[#284078] bg-white shadow-sm">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <div className="text-[15px] font-semibold text-[#284078]">Supplier</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Complete breakdown of booking metrics and product preferences by country.</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[#284078] bg-[#A9B3C9]/20">
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Supplier ID</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Total Tours</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Revenue</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Rating</th>
                  <th className="text-center px-3 md:px-4 py-2 font-medium"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageSlice.map((s, idx) => {
                  const globalIndex = (currentPage - 1) * pageSize + idx;
                  const isDown = globalIndex % 7 === 4 || globalIndex % pageSize === pageSize - 1;
                  const revenue = (isDown ? 4.1 - (idx * 0.3) : 5.4 - (idx * 0.2)).toFixed(1);
                  return (
                    <tr key={s.id} className="bg-white">
                      <td className="px-3 md:px-4 py-2 text-gray-700">#TA-{1002484 + globalIndex}</td>
                      <td className="px-3 md:px-4 py-2 text-gray-700">asdhjuhh233@gmail.com</td>
                      <td className="px-3 md:px-4 py-2 text-gray-700">{24 + (globalIndex*3)%90}</td>
                      <td className="px-3 md:px-4 py-2 text-gray-800">{s.name}</td>
                      <td className="px-3 md:px-4 py-2 text-gray-700">Active</td>
                      <td className="px-3 md:px-4 py-2">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${isDown ? 'bg-[#FFE3E3] text-[#b33939]' : 'bg-[#E3FFE4] text-[#2c7a4b]'}`}>
                          ${revenue}k
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2 text-gray-700">{s.rating}</td>
                      <td className="px-3 md:px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            openModal({
                              id: `#TA-${1002484 + globalIndex}`,
                              name: s.name,
                              email: 'asdhjuhh233@gmail.com',
                              totalTours: 24 + (globalIndex * 3) % 90,
                              rating: s.rating,
                              earnings: `${revenue}k`,
                              active: true,
                              verified: true,
                              initials: initialsOf(s.name),
                              completionRate: `${90 + (globalIndex % 10)}%`,
                              responseTime: `${(1 + (globalIndex % 3) * 0.6).toFixed(1)} hours`,
                              satisfaction: `${(4.5 + (globalIndex % 5) * 0.1).toFixed(1)}/5.0`,
                            })
                          }
                          className="inline-flex items-center justify-center w-7 h-7  hover:bg-gray-50"
                          aria-label="View"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.6" className="w-4 h-4">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                            <circle cx="12" cy="12" r="2.5"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2 text-[#284078]">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="w-8 h-8 rounded-full border border-gray-300 text-[#284078]">‹</button>
            {[1,2,3].map(n => (
              <button key={n} onClick={() => setCurrentPage(n)} className={`w-8 h-8 rounded-full border text-sm ${currentPage===n ? 'bg-[#1c2a4f] text-white border-[#1c2a4f]' : 'border-gray-300 text-[#284078]'}`}>{n}</button>
            ))}
            <button disabled className="w-8 h-8 rounded-full border border-gray-300 text-[#284078] cursor-default">…</button>
            {[12,13,14].map(n => (
              <button key={n} onClick={() => setCurrentPage(n)} className={`w-8 h-8 rounded-full border text-sm ${currentPage===n ? 'bg-[#1c2a4f] text-white border-[#1c2a4f]' : 'border-gray-300 text-[#284078]'}`}>{n}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} className="w-8 h-8 rounded-full border border-gray-300 text-[#284078]">›</button>
            <button className="ml-2 px-3 h-8 rounded-full border border-gray-300 text-[#284078] text-xs inline-flex items-center gap-1"> {currentPage}\10
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#284078" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={closeModal} />
            <div role="dialog" aria-modal="true" className="relative w-[92vw] max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-300 p-6 md:p-8">
              <button onClick={closeModal} className="absolute top-3 right-3 w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close">✕</button>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#1c2a4f] text-white flex items-center justify-center text-xl font-semibold">{selected.initials}</div>
                  <div>
                    <div className="text-xl font-semibold text-[#1f2937]">{selected.name}</div>
                    <div className="text-sm text-gray-600">{selected.email}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#E3FFE4] text-[#2c7a4b] font-medium">Active</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#E3FFE4] text-[#2c7a4b] font-medium">Verified</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { if (window && window.location) { window.location.hash = '#supplier-profile'; } closeModal(); }}
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="rounded-xl border border-gray-300 p-5 text-center">
                  <div className="text-2xl font-semibold text-gray-800">{selected.totalTours}</div>
                  <div className="text-xs text-gray-500 mt-1">Total Tours</div>
                </div>
                <div className="rounded-xl border border-gray-300 p-5 text-center">
                  <div className="text-2xl font-semibold text-gray-800">{selected.rating}</div>
                  <div className="text-xs text-gray-500 mt-1">Rating</div>
                </div>
                <div className="rounded-xl border border-gray-300 p-5 text-center">
                  <div className="text-2xl font-semibold text-gray-800">{'$' + selected.earnings}</div>
                  <div className="text-xs text-gray-500 mt-1">Earnings</div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-lg font-semibold text-gray-800">Performance Insights</div>
                <div className="mt-4 space-y-4 text-sm">
                  <div className="flex items-center justify-between"><span className="text-gray-700">Booking Completion Rate</span><span className="text-gray-900 font-medium">{selected.completionRate}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-700">Average Response Time</span><span className="text-gray-900 font-medium">{selected.responseTime}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-700">Customer Satisfaction</span><span className="text-gray-900 font-medium">{selected.satisfaction}</span></div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="flex-1 px-5 py-3 rounded-full bg-[#1c2a4f] text-white text-sm">Send Message</button>
                <button
                  onClick={() => { if (window && window.location) { window.location.hash = '#supplier-profile'; } closeModal(); }}
                  className="flex-1 px-5 py-3 rounded-full border border-gray-300 text-gray-700 text-sm bg-white"
                >
                  View Payout Details
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllSuppliersManage;
