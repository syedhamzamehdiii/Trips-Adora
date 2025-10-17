import React from 'react';
import { FiClock, FiEdit3, FiMoreVertical, FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const DraftsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/assets/logo.jpg" alt="TripsAdora Logo" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold text-gray-800">TripsAdora</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-800">Home</button>
          <button className="text-gray-600 hover:text-gray-800">FAQs</button>
          <button className="text-gray-600 hover:text-gray-800">Support</button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Available Balance $1850</span>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">EW</span>
            </div>
            <span className="text-xs text-gray-500">ID 00032123</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-6">
          <button className="text-gray-600 hover:text-gray-800">Dashboard</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Listings</button>
          <button className="text-gray-600 hover:text-gray-800">Availability</button>
          <button className="text-gray-600 hover:text-gray-800">Bookings</button>
          <button className="text-gray-600 hover:text-gray-800">Insights</button>
          <button className="text-gray-600 hover:text-gray-800">Finance</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Management</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">5</div>
            <div className="text-gray-600">Total Products</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">03</div>
            <div className="text-gray-600">Active Products</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">1</div>
            <div className="text-gray-600">Draft products</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">$71,570</div>
            <div className="text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => navigate('/products')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <span>Active Products</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
            <span>Drafts</span>
            <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FiFilter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Draft Products Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiClock className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Draft Products</h2>
          </div>
          <p className="text-gray-600 mb-6">Complete these draft Products to make them available for booking</p>

          {/* Draft Product Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Osake Castle & Gardens</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Category:</span> Historical
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> $75
                  </div>
                  <div>
                    <span className="font-medium">Modified:</span> 2024-01-10
                  </div>
                  <div>
                    <span className="font-medium">Creator:</span> Emily Davis
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FiEdit3 size={16} />
                  <span>Continue Editing</span>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <FiMoreVertical size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftsPage;
