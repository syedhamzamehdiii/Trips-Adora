import React, { useMemo, useState } from 'react';
import CustomerProfileModal from './CustomerProfileModal';

const baseCustomers = [
  { id: 'CUS-001', name: 'Karvan', email: 'asdhjjuhh233@gmail.com', bookings: 24, status: 'Active', reviews: 8 },
  { id: 'CUS-002', name: 'Suneel', email: 'asdhjjuhh233@gmail.com', bookings: 45, status: 'Active', reviews: 8 },
  { id: 'CUS-003', name: 'Uzair', email: 'asdhjjuhh233@gmail.com', bookings: 24, status: 'Active', reviews: 5 },
  { id: 'CUS-004', name: 'Salman', email: 'asdhjjuhh233@gmail.com', bookings: 55, status: 'Active', reviews: 6 },
  { id: 'CUS-005', name: 'Karvan', email: 'asdhjjuhh233@gmail.com', bookings: 87, status: 'Active', reviews: 8 },
  { id: 'CUS-006', name: 'Suneel', email: 'asdhjjuhh233@gmail.com', bookings: 52, status: 'Active', reviews: 8 },
  { id: 'CUS-007', name: 'Uzair', email: 'asdhjjuhh233@gmail.com', bookings: 54, status: 'Active', reviews: 5 },
  { id: 'CUS-008', name: 'Salman', email: 'asdhjjuhh233@gmail.com', bookings: 32, status: 'Active', reviews: 11 },
];

const generateCustomers = (count = 112) => {
  const list = [];
  for (let i = 0; i < count; i++) {
    const t = baseCustomers[i % baseCustomers.length];
    list.push({
      ...t,
      id: `CUS-${(i + 1).toString().padStart(3, '0')}`,
      bookings: t.bookings,
      spendingK: (5.4 - (i % 8) * 0.3).toFixed(1),
    });
  }
  return list;
};

const StatCard = ({ value, label, bg, sub }) => (
  <div className={`rounded-xl p-5 ${bg} flex flex-col items-center justify-center text-center`}>
    <div className="text-3xl font-semibold text-[#284078]">{value}</div>
    <div className="mt-1 text-[14px] text-[#284078] opacity-90">{label}</div>
    {sub && <div className="mt-3 text-[11px] text-[#284078] opacity-80 inline-flex items-center justify-center gap-2">{sub}</div>}
  </div>
);

const ManageAllCustomers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = 14;
  const customers = useMemo(() => generateCustomers(pageSize * totalPages), []);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return customers.slice(start, start + pageSize);
  }, [currentPage, customers]);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const initialsOf = (name) => {
    const parts = String(name || '').trim().split(/\s+/);
    return `${(parts[0]?.[0] || '').toUpperCase()}${(parts[1]?.[0] || '').toUpperCase()}` || (parts[0]?.[0] || '').toUpperCase();
  };

  return (
    <div className="w-full h-full text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2c7a4b]">Manage All Customer</h1>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard value="2,058" label="Total Customers" bg="bg-[#E3FFE4] text-[#284078] font-semibold" sub={<span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#78F37E]"></span>12.5% <span className="opacity-60">This Month</span></span>} />
          <StatCard value="1,826" label="Active" bg="bg-[#A9B3C9]/50 text-[#284078] font-semibold" sub={<span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#78F37E]"></span>12.5% <span className="opacity-60">This Month</span></span>} />
          <StatCard value="12" label="Vip Customer" bg="bg-[#FEF9C2] text-[#284078] font-semibold" sub={<span className="text-[11px] text-[#284078] ">250+ Bookings completed</span>} />
          <StatCard value="$862" label="Avg. spendings" bg="bg-[#FFD4CE]/90 text-[#284078] font-semibold" sub={<span className="inline-flex items-center gap-2 text-[#284078] font-semibold"><span className="w-2 h-2 rounded-full bg-[#FA9E9E]"></span>-2% <span className="opacity-60">Last month</span></span>} />
        </div>

        <div className="mt-6">
          <div className="relative max-w-xl">
            <input className="w-full h-9 rounded-full border border-gray-300 bg-white px-4 pr-10 text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#284078]" placeholder="Search by name or ref. number" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 bg-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-300 bg-white shadow-sm">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <div className="text-[15px] font-semibold text-[#284078]">Customer</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Complete breakdown of booking metrics and product preferences by country.</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[#284078] bg-[#A9B3C9]/20">
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Customer ID</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Bookings</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Total spendings</th>
                  <th className="text-left px-3 md:px-4 py-2 font-medium">Reviews</th>
                  <th className="text-center px-3 md:px-4 py-2 font-medium"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageSlice.map((c, idx) => {
                  const globalIndex = (currentPage - 1) * pageSize + idx;
                  const isDown = globalIndex % 7 === 4 || globalIndex % pageSize === pageSize - 1;
                  const spending = (isDown ? 4.1 - (idx * 0.3) : 5.4 - (idx * 0.2)).toFixed(1);
                  return (
                    <tr key={c.id} className="bg-white">
                      <td className="px-3 md:px-4 py-2 text-gray-700">#CU-{1002484 + globalIndex}</td>
                      <td className="px-3 md:px-4 py-2 text-gray-700">{c.email}</td>
                      <td className="px-3 md:px-4 py-2 text-gray-700">{c.bookings}</td>
                      <td className="px-3 md:px-4 py-2 text-gray-800">{c.name}</td>
                      <td className="px-3 md:px-4 py-2 text-gray-700">{c.status}</td>
                      <td className="px-3 md:px-4 py-2">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${isDown ? 'bg-[#FFE3E3] text-[#b33939]' : 'bg-[#E3FFE4] text-[#2c7a4b]'}`}>
                          ${spending}k
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2 text-gray-700">{c.reviews}</td>
                      <td className="px-3 md:px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomer({
                              name: c.name,
                              email: c.email,
                              initial: initialsOf(c.name) || 'C',
                              customerId: `CTA-${String(568 + globalIndex).padStart(5,'0')}`,
                            });
                            setShowProfile(true);
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-50"
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

        <CustomerProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          customer={selectedCustomer}
        />
      </div>
    </div>
  );
};

export default ManageAllCustomers;

