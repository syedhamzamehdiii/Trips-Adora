import React, { useState, useRef, useEffect } from 'react';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiFilter, 
  FiDownload, 
  FiPlus,
  FiShare2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CreateProductComponent from '@/components/products/CreateProductComponent';

const BookingsPage = () => {
  const navigate = useNavigate();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    productName: '',
    travelDateStart: '',
    travelDateEnd: '',
    purchaseDateStart: '',
    purchaseDateEnd: '',
    referenceCode: '',
    status: 'All Status'
  });

  const bookingStats = [
    { number: '52', label: 'Total Bookings' },
    { number: '03', label: 'Upcoming Trips' },
    { number: '13', label: 'Refund/Dispute' },
    { number: '04', label: 'Cancelled' }
  ];

  const bookings = [
    {
      id: 1,
      referenceCode: 'TK-FD-240114-002',
      productId: 'ID: PROD-001',
      booking: 'Mount Fuji Tokyo Day Trip',
      customerName: 'John Anders',
      customerEmail: 'john.anderson@gmail.com',
      bookedOn: 'Jan 13, 2024',
      travelDate: 'Jan 20, 2024',
      status: 'Confirmed',
      amount: '$305'
    },
    {
      id: 2,
      referenceCode: 'TK-FD-240114-003',
      productId: 'ID: PROD-002',
      booking: 'Tokyo City Tour',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.johnson@gmail.com',
      bookedOn: 'Jan 14, 2024',
      travelDate: 'Jan 22, 2024',
      status: 'Confirmed',
      amount: '$250'
    },
    {
      id: 3,
      referenceCode: 'TK-FD-240114-004',
      productId: 'ID: PROD-003',
      booking: 'Kyoto Cultural Experience',
      customerName: 'Michael Brown',
      customerEmail: 'michael.brown@gmail.com',
      bookedOn: 'Jan 15, 2024',
      travelDate: 'Jan 25, 2024',
      status: 'Pending',
      amount: '$180'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Bookings Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">YOUR BOOKINGS</h1>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <FiDownload size={16} />
            <span>Export Bookings</span>
          </button>
          <button 
            onClick={() => setShowCreateProduct(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus size={16} />
            <span>Create New Product</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {bookingStats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 max-w-md relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <FiRefreshCw size={20} />
          </button>
          <button 
            onClick={() => setShowFilterModal(true)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiFilter size={20} />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name of Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booked on
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.referenceCode}</div>
                    <div className="text-sm text-gray-500">{booking.productId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.booking}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.bookedOn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.travelDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      {booking.id === 1 ? <FiShare2 size={16} /> : <FiTrash2 size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FiChevronLeft size={16} />
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
          <button className="px-3 py-1 text-gray-600 hover:text-gray-900 rounded text-sm">2</button>
          <button className="px-3 py-1 text-gray-600 hover:text-gray-900 rounded text-sm">3</button>
          <span className="px-2 text-gray-500">...</span>
          <button className="px-3 py-1 text-gray-600 hover:text-gray-900 rounded text-sm">12</button>
          <button className="px-3 py-1 text-gray-600 hover:text-gray-900 rounded text-sm">13</button>
          <button className="px-3 py-1 text-gray-600 hover:text-gray-900 rounded text-sm">14</button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FiChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">1/10</span>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Here"
                  value={filters.productName}
                  onChange={(e) => setFilters({...filters, productName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* By Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  By Date
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Travel Date</label>
                    <div className="flex space-x-2">
                      <select
                        value={filters.travelDateStart}
                        onChange={(e) => setFilters({...filters, travelDateStart: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Start</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this-week">This Week</option>
                      </select>
                      <select
                        value={filters.travelDateEnd}
                        onChange={(e) => setFilters({...filters, travelDateEnd: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">End</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this-week">This Week</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Date of Purchase</label>
                    <div className="flex space-x-2">
                      <select
                        value={filters.purchaseDateStart}
                        onChange={(e) => setFilters({...filters, purchaseDateStart: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Start</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="this-week">This Week</option>
                      </select>
                      <select
                        value={filters.purchaseDateEnd}
                        onChange={(e) => setFilters({...filters, purchaseDateEnd: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">End</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="this-week">This Week</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Code
                </label>
                <input
                  type="text"
                  placeholder="Enter Here"
                  value={filters.referenceCode}
                  onChange={(e) => setFilters({...filters, referenceCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All Status">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Canceled">Canceled</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Apply filters logic here
                  setShowFilterModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Component */}
      {showCreateProduct && (
        <CreateProductComponent onClose={() => setShowCreateProduct(false)} />
      )}
    </div>
  );
};

export default BookingsPage;