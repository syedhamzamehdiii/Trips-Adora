import React from 'react';

const SupplierPerformanceTable = () => {
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Top supplier performance</h2>
        <p className="text-gray-500 text-sm mt-1">
          Complete breakdown of booking metrics and product preferences by country.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Supplier ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Bookings</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Earnings</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Reviews</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700">{supplier.id}</td>
                <td className="py-3 px-4 text-gray-600">{supplier.email}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{supplier.name}</td>
                <td className="py-3 px-4 text-gray-700">{supplier.bookings.toLocaleString()}</td>
                <td className={`py-3 px-4 font-semibold ${supplier.earningsColor}`}>
                  {supplier.earnings}
                </td>
                <td className="py-3 px-4 text-gray-700">{supplier.reviews}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${supplier.performance}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{supplier.performance}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierPerformanceTable;

