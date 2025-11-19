import React, { useState } from 'react';

const SupplierPerformanceTable = () => {
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const suppliers = [
    {
      id: '#TA-1002484',
      email: 'asdhjhu233@gmail.com',
      name: 'Karvan',
      bookings: 1250,
      earnings: '$5.4k',
      earningsColor: 'text-green-600',
      reviews: 342,
      performance: 87
    },
    {
      id: '#TA-1002485',
      email: 'supplier2@example.com',
      name: 'Suneel',
      bookings: 980,
      earnings: '$4.6k',
      earningsColor: 'text-green-600',
      reviews: 289,
      performance: 65
    },
    {
      id: '#TA-1002486',
      email: 'supplier3@example.com',
      name: 'Uzair',
      bookings: 850,
      earnings: '$4.4k',
      earningsColor: 'text-green-600',
      reviews: 256,
      performance: 70
    },
    {
      id: '#TA-1002487',
      email: 'supplier4@example.com',
      name: 'Salmon',
      bookings: 720,
      earnings: '$4.2k',
      earningsColor: 'text-green-600',
      reviews: 198,
      performance: 50
    },
    {
      id: '#TA-1002488',
      email: 'supplier5@example.com',
      name: 'Supplier5',
      bookings: 650,
      earnings: '$4.1k',
      earningsColor: 'text-green-600',
      reviews: 175,
      performance: 40
    },
    {
      id: '#TA-1002489',
      email: 'supplier6@example.com',
      name: 'Supplier6',
      bookings: 580,
      earnings: '$3.8k',
      earningsColor: 'text-red-600',
      reviews: 142,
      performance: 20
    },
    {
      id: '#TA-1002490',
      email: 'supplier7@example.com',
      name: 'Supplier7',
      bookings: 520,
      earnings: '$3.5k',
      earningsColor: 'text-red-600',
      reviews: 128,
      performance: 30
    },
    {
      id: '#TA-1002491',
      email: 'supplier8@example.com',
      name: 'Supplier8',
      bookings: 450,
      earnings: '$3.1k',
      earningsColor: 'text-red-600',
      reviews: 98,
      performance: 10
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-6">
      <div className="mb-2">
        <h2 className="text-2xl font-semibold text-gray-900">Top supplier performance</h2>
        <p className="text-gray-500 text-sm mt-1">
          Complete breakdown of booking metrics and product preferences by country.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Bookings</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Earnings</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Reviews</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Performance</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier, index) => {
              const positive = supplier.earningsColor.includes('green');
              return (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-800">{supplier.id}</td>
                  <td className="py-4 px-4 text-gray-700">{supplier.email}</td>
                  <td className="py-4 px-4 text-gray-800 font-medium">{supplier.name}</td>
                  <td className="py-4 px-4 text-gray-800">{supplier.bookings.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {supplier.earnings}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-800">{supplier.reviews}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: `${supplier.performance}%` }} />
                      </div>
                      <span className="text-gray-500 text-xs w-10 text-right">{supplier.performance}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                      style={{ backgroundColor: '#FF6F6F' }}
                      onClick={() => setIsBlockOpen(true)}
                    >
                      Block
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isBlockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsBlockOpen(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <p className="text-sm text-gray-900 mb-4">Do you really want to block this supplier?</p>
            <div className="flex items-center gap-3 mb-5">
              <button
                type="button"
                className="px-5 py-1.5 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: '#FF6F6F' }}
              >
                Block
              </button>
              <button
                type="button"
                className="px-5 py-1.5 rounded-full text-gray-700 text-sm font-medium border"
                onClick={() => setIsBlockOpen(false)}
              >
                Cancel
              </button>
            </div>

            <p className="text-sm text-gray-900 mb-2">Please provide a reason before blocking this supplier. ( Optional )</p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full min-h-[72px] rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none"
              placeholder=""
            />

            <div className="flex items-center justify-between mt-5">
              <button
                type="button"
                className="px-5 py-2 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: '#284078' }}
              >
                Contact to Supplier
              </button>
              <button
                type="button"
                className="px-5 py-2 rounded-full text-gray-400 text-sm font-semibold border bg-gray-50 cursor-not-allowed"
                disabled
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPerformanceTable;

