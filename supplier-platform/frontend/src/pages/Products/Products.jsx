import React from 'react';
import { FiPlus, FiEdit, FiEye, FiTrash2, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const products = [
    {
      id: 1,
      title: "Mount Fuji Private Tour",
      category: "Tour",
      status: "Active",
      price: "$299",
      bookings: 24,
      image: "/assets/49f555cdd6a046078f7f2a1e0a835fc0c68a4e3a.jpg"
    },
    {
      id: 2,
      title: "Tokyo City Exploration",
      category: "Tour", 
      status: "Draft",
      price: "$199",
      bookings: 0,
      image: "/assets/49f555cdd6a046078f7f2a1e0a835fc0c68a4e3a.jpg"
    },
    {
      id: 3,
      title: "Luxury Hotel Package",
      category: "Hotel",
      status: "Active",
      price: "$499",
      bookings: 12,
      image: "/assets/49f555cdd6a046078f7f2a1e0a835fc0c68a4e3a.jpg"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Listings</h1>
              <p className="text-gray-600 mt-1">Manage your active product listings</p>
            </div>
            <button
              onClick={() => navigate('/products/create')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" size={16} />
              Create New Product
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm">
                <option>All Categories</option>
                <option>Tour</option>
                <option>Hotel</option>
                <option>Rent a Car</option>
              </select>
              <FiChevronDown className="absolute right-2 top-3 text-gray-400" size={16} />
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm">
                <option>All Status</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Under Review</option>
              </select>
              <FiChevronDown className="absolute right-2 top-3 text-gray-400" size={16} />
            </div>

            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full max-w-md bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{product.category}</span>
                  <span>{product.bookings} bookings</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-gray-900">{product.price}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiEye className="mr-1" size={14} />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiEdit className="mr-1" size={14} />
                    Edit
                  </button>
                  <button className="px-3 py-2 border border-red-300 rounded-lg text-sm text-red-700 hover:bg-red-50 transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiPlus className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">Create your first product listing to get started</p>
            <button
              onClick={() => navigate('/products/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
