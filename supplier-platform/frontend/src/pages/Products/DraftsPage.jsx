import React, { useState, useRef, useEffect } from 'react';
import { FiClock, FiEdit3, FiMoreVertical, FiSearch, FiFilter, FiTrendingUp, FiFileText, FiTrash2, FiSave, FiDownload, FiSettings, FiFlag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CreateProductComponent from '@/components/products/CreateProductComponent';

const DraftsPage = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={() => navigate('/products')}
            className="flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            <FiTrendingUp className="mr-2 text-green-600" size={16} />
            Active Products
          </button>
          <button className="flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors bg-blue-600 text-white">
            <FiFileText className="mr-2 text-white" size={16} />
            Drafts
            <span className="ml-2 w-5 h-5 bg-white text-blue-600 text-xs rounded-full flex items-center justify-center">1</span>
          </button>
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
                <button 
                  onClick={() => setShowCreateProduct(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FiEdit3 size={16} />
                  <span>Continue Editing</span>
                </button>
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <FiMoreVertical size={20} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                          <FiTrash2 size={16} />
                          <span>Delete</span>
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                          <FiSave size={16} />
                          <span>Save</span>
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                          <FiDownload size={16} />
                          <span>Download</span>
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                          <FiSettings size={16} />
                          <span>Setting</span>
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center space-x-3">
                          <FiFlag size={16} />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Product Component */}
      {showCreateProduct && (
        <CreateProductComponent onClose={() => setShowCreateProduct(false)} />
      )}
    </div>
  );
};

export default DraftsPage;