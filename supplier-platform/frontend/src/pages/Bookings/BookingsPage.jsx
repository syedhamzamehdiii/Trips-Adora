import React, { useState, useRef, useEffect } from 'react';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiFilter, 
  FiDownload, 
  FiPlus,
  FiChevronDown,
  FiShare2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const BookingsPage = () => {
  const [language, setLanguage] = useState('EN');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    productName: '',
    travelDateStart: '',
    travelDateEnd: '',
    purchaseDateStart: '',
    purchaseDateEnd: '',
    referenceCode: '',
    status: 'All Status'
  });
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const languageRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showNotifications || showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showLanguageDropdown]);

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
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 relative transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <img 
                src="/assets/logo.jpg" 
                alt="TripsAdora Logo" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Center - Main Site Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-[#1d236b] font-medium relative">
                Home
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]"></span>
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">FAQs</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Support</a>
            </nav>
            
            {/* Right side - Profile Section */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">New booking received</p>
                            <p className="text-xs text-gray-600">Mount Fuji tour - 2 guests</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Payment received</p>
                            <p className="text-xs text-gray-600">$240 for Tokyo City Tour</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Review received</p>
                            <p className="text-xs text-gray-600">5 stars for Kyoto Temple Tour</p>
                            <p className="text-xs text-gray-500">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <button className="w-full mt-3 text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Language Dropdown */}
              <div className="relative" ref={languageRef}>
                <button 
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span className="text-sm">EN</span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Language Dropdown Menu */}
                {showLanguageDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 flex items-center space-x-2">
                        <span className="font-medium">EN</span>
                        <span>English</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <span className="font-medium">ES</span>
                        <span>Español</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <span className="font-medium">FR</span>
                        <span>Français</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <span className="font-medium">DE</span>
                        <span>Deutsch</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                        <span className="font-medium">JA</span>
                        <span>日本語</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Profile Button */}
              <div className="flex items-center space-x-3">
                <button className="bg-[#1d236b] text-white px-4 py-2 rounded-lg flex items-center space-x-3 hover:bg-[#1a1f5c] transition-colors">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">EW</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">Edward William</div>
                    <div className="text-xs text-gray-300">ID 00032123</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-2">
            {['Dashboard', 'Listings', 'Availability', 'Bookings', 'Insights', 'Finance'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'Dashboard') {
                    navigate('/dashboard');
                  } else if (tab === 'Listings') {
                    navigate('/products');
                  }
                  // Add other navigation logic as needed
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'Bookings'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
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
              onClick={() => navigate('/products/create')}
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
            <span className="text-sm text-gray-600">1\10</span>
          </div>
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
    </div>
  );
};

export default BookingsPage;
