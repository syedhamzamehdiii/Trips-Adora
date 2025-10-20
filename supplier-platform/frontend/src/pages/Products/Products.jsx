import React, { useState, useEffect, useRef } from 'react';
import { FiTrendingUp, FiFileText, FiRefreshCw, FiArchive, FiSearch, FiFilter, FiMoreVertical, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [filters, setFilters] = useState({
    productName: '',
    minRevenue: 50,
    maxRevenue: 885,
    status: 'All Status'
  });
  const dropdownRefs = useRef({});
  const filtersRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close action dropdowns
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          if (openDropdown === parseInt(key)) {
            setOpenDropdown(null);
          }
        }
      });

      // Close filters modal
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }

      // Close status dropdown
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    if (openDropdown !== null || showFilters || showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown, showFilters, showStatusDropdown]);

  // Mock data for demonstration
  const products = [
    {
      id: 1,
      name: "Mount Fuji Day Trip",
      referenceCode: "T-4003",
      status: "Published",
      bookings: 243,
      revenue: "$36,207",
      creationDate: "15-10-2025",
      ratings: "4.5/5"
    },
    {
      id: 2,
      name: "Mount Fuji Day Trip",
      referenceCode: "T-4003",
      status: "Rejected",
      bookings: 243,
      revenue: "$36,207",
      creationDate: "15-10-2025",
      ratings: "4.5/5"
    },
    {
      id: 3,
      name: "Mount Fuji Day Trip",
      referenceCode: "T-4003",
      status: "Draft",
      bookings: 243,
      revenue: "$36,207",
      creationDate: "15-10-2025",
      ratings: "4.5/5"
    },
    {
      id: 4,
      name: "Mount Fuji Day Trip",
      referenceCode: "T-4003",
      status: "Published",
      bookings: 243,
      revenue: "$36,207",
      creationDate: "15-10-2025",
      ratings: "4.5/5"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'text-green-600';
      case 'Rejected':
        return 'text-red-600';
      case 'Draft':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const toggleDropdown = (productId) => {
    setOpenDropdown(openDropdown === productId ? null : productId);
  };

  const handleAction = (action, productId) => {
    console.log(`${action} product ${productId}`);
    setOpenDropdown(null);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">5</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">03</div>
            <div className="text-sm text-gray-600">Active Products</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">1</div>
            <div className="text-sm text-gray-600">Draft products</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">$71,570</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className="flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors bg-blue-600 text-white"
          >
            <FiTrendingUp className="mr-2 text-white" size={16} />
            Active Products
          </button>
          <button
            onClick={() => navigate('/products/drafts')}
            className="flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            <FiFileText className="mr-2 text-green-600" size={16} />
            Drafts
            <span className="ml-2 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">1</span>
          </button>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleFilters}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <FiFilter size={20} />
            </button>
            
            {/* Status Filter Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button 
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                {filters.status}
                <FiChevronDown className="ml-1" size={14} />
              </button>
              
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {[
                      { value: 'All Status', label: 'All Status', color: 'bg-gray-400' },
                      { value: 'Active', label: 'Active', color: 'bg-green-500' },
                      { value: 'Draft', label: 'Draft', color: 'bg-gray-500' },
                      { value: 'Pending', label: 'Pending', color: 'bg-yellow-500' },
                      { value: 'Rejected', label: 'Rejected', color: 'bg-red-500' },
                      { value: 'Archived', label: 'Archived', color: 'bg-gray-700' }
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          handleFilterChange('status', status.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          filters.status === status.value ? 'bg-gray-100' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                        <span>{status.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <FiRefreshCw size={20} />
            </button>
            {selectedProducts.length > 0 && (
              <>
                <span className="text-sm text-gray-600">{selectedProducts.length} Selected</span>
                <button className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <FiArchive className="mr-2" size={16} />
                  Archive
                </button>
              </>
            )}
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creation Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ratings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.referenceCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.revenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.creationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.ratings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                      <div ref={el => dropdownRefs.current[product.id] = el}>
                        <button 
                          onClick={() => toggleDropdown(product.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiMoreVertical size={16} />
                        </button>
                        
                        {/* Action Dropdown */}
                        {openDropdown === product.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="py-1">
                              <button
                                onClick={() => handleAction('edit', product.id)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleAction('clone', product.id)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Clone
                              </button>
                              <button
                                onClick={() => handleAction('share', product.id)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Share product
                              </button>
                              <button
                                onClick={() => handleAction('delete', product.id)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
            <button className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
              ←
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-gray-600 hover:text-gray-900">2</button>
            <button className="px-3 py-1 text-gray-600 hover:text-gray-900">3</button>
            <span className="text-gray-600">...</span>
            <button className="px-3 py-1 text-gray-600 hover:text-gray-900">12</button>
            <button className="px-3 py-1 text-gray-600 hover:text-gray-900">13</button>
            <button className="px-3 py-1 text-gray-600 hover:text-gray-900">14</button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              →
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <select className="px-3 py-1 border border-gray-300 rounded text-sm">
              <option>1 \ 10</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div 
            ref={filtersRef}
            className="bg-white rounded-lg shadow-lg p-6 w-80"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
            
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Product Name</label>
                <input
                  type="text"
                  placeholder="Enter Here"
                  value={filters.productName}
                  onChange={(e) => handleFilterChange('productName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* By Revenue */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">By Revenue</label>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-600">$</span>
                  <input
                    type="number"
                    value={filters.minRevenue}
                    onChange={(e) => handleFilterChange('minRevenue', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-600">To</span>
                  <span className="text-sm text-gray-600">$</span>
                  <input
                    type="number"
                    value={filters.maxRevenue}
                    onChange={(e) => handleFilterChange('maxRevenue', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="text-xs text-gray-500 mb-3">Max-fixed</div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.minRevenue}
                  onChange={(e) => handleFilterChange('minRevenue', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Apply filters:', filters);
                  setShowFilters(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;