import React, { useState, useEffect, useRef } from 'react';
import { FiTrendingUp, FiFileText, FiRefreshCw, FiArchive, FiSearch, FiFilter, FiMoreVertical, FiChevronDown, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '@/components/common/Footer';

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    productName: '',
    minRevenue: 0,
    maxRevenue: 100000,
    status: 'All Status'
  });
  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    revenue: 0
  });
  const dropdownRefs = useRef({});
  const dropdownMenuRefs = useRef({});
  const filtersRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Handle URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab === 'drafts') {
      setActiveTab('drafts');
    }
  }, [location.search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close action dropdowns - check both button AND dropdown menu
      if (openDropdown !== null) {
        const buttonElement = dropdownRefs.current[openDropdown];
        const menuElement = dropdownMenuRefs.current[openDropdown];
        
        const clickedInsideButton = buttonElement && buttonElement.contains(event.target);
        const clickedInsideMenu = menuElement && menuElement.contains(event.target);
        
        if (!clickedInsideButton && !clickedInsideMenu) {
          console.log('👆 Clicked outside dropdown, closing...');
          setOpenDropdown(null);
        } else {
          console.log('👆 Clicked inside dropdown or button, keeping open');
        }
      }

      // Close filters modal
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }

      // Close status dropdown (used in filters modal)
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

  // Load products from localStorage and update stats
  useEffect(() => {
    const loadProducts = () => {
      try {
        const allProductsData = localStorage.getItem('all_products');
        let loadedProducts = [];
        
        if (allProductsData) {
          loadedProducts = JSON.parse(allProductsData);
        } else {
          // Start with empty products list
          loadedProducts = [];
          localStorage.setItem('all_products', JSON.stringify(loadedProducts));
        }
        
        // Deduplicate by id (primary key) - keep first occurrence only
        const uniqMap = new Map();
        loadedProducts.forEach(p => {
          // Use id as primary key (should always exist), fallback to referenceCode then name
          const key = p.id != null ? String(p.id) : (p.referenceCode ?? p.name);
          // Only keep first occurrence if duplicate
          if (!uniqMap.has(key)) {
            uniqMap.set(key, p);
          }
        });
        const deduped = Array.from(uniqMap.values());

        // Calculate stats - only count Published and Draft products (excluding Under Review)
        const relevantProducts = deduped.filter(p => 
          p.status === 'Published' || 
          p.status === 'Draft'
        );
        
        const published = relevantProducts.filter(p => p.status === 'Published').length;
        const draft = relevantProducts.filter(p => p.status === 'Draft').length;
        
        // Debug logging
        console.log('📊 Product Stats Calculation:', {
          totalLoaded: loadedProducts.length,
          totalDeduped: deduped.length,
          totalRelevant: relevantProducts.length,
          published,
          draft,
          breakdown: relevantProducts.map(p => ({ id: p.id, name: p.name, status: p.status }))
        });
        const totalRevenue = relevantProducts
          .filter(p => p.status === 'Published')
          .reduce((sum, p) => sum + (typeof p.revenue === 'number' ? p.revenue : 0), 0);
        
        // Store deduplicated products to avoid issues elsewhere
        // Only update state if data has changed (prevent unnecessary re-renders)
        setProducts(prevProducts => {
          const hasChanged = JSON.stringify(prevProducts) !== JSON.stringify(deduped);
          return hasChanged ? deduped : prevProducts;
        });
        
        setProductStats({
          total: relevantProducts.length, // This should now be published + draft only
          active: published,
          draft: draft,
          revenue: totalRevenue
        });
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    
    // Initial load
    loadProducts();
    
    // Refresh every 5 seconds to show real-time updates (reduced from 2 seconds)
    const interval = setInterval(loadProducts, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter products based on active tab, search query, and filters
  const displayedProducts = products.filter(product => {
    // Tab filter
    let matchesTab = true;
    if (activeTab === 'drafts') {
      // Drafts tab only shows drafts
      matchesTab = product.status === 'Draft';
    } else if (activeTab === 'active') {
      // Active tab shows Published and Draft (inactive) per requirement
      matchesTab = product.status === 'Published' || product.status === 'Draft';
    }
    
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Product name filter
    const matchesProductName = filters.productName === '' ||
      product.name.toLowerCase().includes(filters.productName.toLowerCase());
    
    // Revenue filter
    const matchesRevenue = product.revenue >= filters.minRevenue && 
      product.revenue <= filters.maxRevenue;
    
    // Status filter
    const matchesStatus = filters.status === 'All Status' || 
      product.status === filters.status;
    
    return matchesTab && matchesSearch && matchesProductName && matchesRevenue && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'text-green-600';
      case 'Rejected':
        return 'text-red-600';
      case 'Draft':
        // Show drafts in red per requirement
        return 'text-red-600';
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
    if (selectedProducts.length === displayedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(displayedProducts.map(p => p.id));
    }
  };

  const toggleDropdown = (productId) => {
    console.log('⋮ Dropdown toggle clicked for product:', productId);
    const newState = openDropdown === productId ? null : productId;
    console.log('Dropdown state changing from', openDropdown, 'to', newState);
    setOpenDropdown(newState);
  };

  const handleAction = (action, productId) => {
    console.log(`🎬 ACTION TRIGGERED: ${action} for product ID: ${productId}`);
    setOpenDropdown(null);
    
    if (action === 'edit') {
      console.log('📝 Edit action started');
      // Find the product
      const product = products.find(p => p.id === productId);
      if (product) {
        if (product.status === 'Draft') {
          // Navigate to drafts page to continue editing
          console.log('📝 Opening draft for editing:', product.name);
          navigate('/products/drafts');
        } else if (product.status === 'Published') {
          alert('📌 This product is already published.\n\nTo make changes:\n• Use "Clone" to create an editable copy\n• Or create a new version of this product');
        } else if (product.status === 'Rejected') {
          alert('❌ This product was rejected.\n\nPlease contact support or create a new product.');
        } else {
          alert('⚠️ This product cannot be edited at this time.');
        }
      }
    } else if (action === 'clone') {
      console.log('📋 Clone action started');
      // Clone the product as a new draft
      const product = products.find(p => p.id === productId);
      console.log('Product found for cloning:', product);
      if (product) {
        const confirmed = window.confirm(`📋 Clone "${product.name}"?\n\nThis will create a duplicate draft that you can edit.`);
        console.log('User confirmation for clone:', confirmed);
        
        if (confirmed) {
          const newDraftId = Date.now();
          const clonedProduct = {
            ...product,
            id: newDraftId,
            name: `${product.name} (Copy)`,
            referenceCode: `T-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'Draft',
            bookings: 0,
            creationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
          };
          
          // Add to products
          const updatedProducts = [...products, clonedProduct];
          localStorage.setItem('all_products', JSON.stringify(updatedProducts));
          setProducts(updatedProducts);
          
          // Try to clone full draft data if it exists, otherwise pull from full published payload
          let parsedData = null;
          const originalDraftData = localStorage.getItem(`product_draft_${productId}`);
          if (originalDraftData) {
            parsedData = JSON.parse(originalDraftData);
          } else {
            const fullPub = localStorage.getItem(`product_full_${productId}`);
            if (fullPub) {
              parsedData = JSON.parse(fullPub);
            }
          }
          if (parsedData) {
            const clonedDraftData = {
              ...parsedData,
              draftId: newDraftId,
              productTitle: `${parsedData.productTitle || product.name} (Copy)`,
              lastModified: new Date().toISOString()
            };
            localStorage.setItem(`product_draft_${newDraftId}`, JSON.stringify(clonedDraftData));
          }
          
          console.log('✅ Product cloned successfully:', clonedProduct);
          alert(`✅ Product cloned successfully!\n\n"${clonedProduct.name}" is now in your drafts.`);
        }
      }
    } else if (action === 'share') {
      console.log('🔗 Share action started');
      // Share the product
      const product = products.find(p => p.id === productId);
      console.log('Product found for sharing:', product);
      if (product) {
        if (product.status === 'Published') {
          // Generate shareable link
          const shareUrl = `${window.location.origin}/preview/${product.referenceCode}`;
          
          // Try to copy to clipboard
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl)
              .then(() => {
                alert(`🔗 Link copied to clipboard!\n\n${shareUrl}\n\nShare this link with your customers.`);
              })
              .catch(() => {
                // Fallback if clipboard API fails
                prompt('📋 Copy this link to share:', shareUrl);
              });
          } else {
            // Fallback for browsers that don't support clipboard API
            prompt('📋 Copy this link to share:', shareUrl);
          }
          console.log('🔗 Share link generated:', shareUrl);
        } else {
          alert(`⚠️ Only published products can be shared.\n\nCurrent status: ${product.status}\n\nPlease publish this product first.`);
        }
      }
    } else if (action === 'unarchive') {
      // Restore archived product back to Published
      const product = products.find(p => p.id === productId);
      if (product && product.status === 'Archived') {
        const updatedProducts = products.map(p =>
          p.id === productId ? { ...p, status: 'Published' } : p
        );
        localStorage.setItem('all_products', JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
        alert('✅ Product restored from archive.');
      }
    } else if (action === 'delete') {
      console.log('🗑️ Delete action started');
      // Delete the product
      const product = products.find(p => p.id === productId);
      console.log('Product found for deletion:', product);
      const productName = product ? product.name : 'this product';
      const confirmed = window.confirm(`⚠️ Delete "${productName}"?\n\nThis action cannot be undone!`);
      console.log('User confirmation for delete:', confirmed);
      
      if (confirmed) {
        const updatedProducts = products.filter(p => p.id !== productId);
        localStorage.setItem('all_products', JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
        
        // Also remove draft data if it's a draft being deleted
        if (product && product.status === 'Draft') {
          // Remove the full draft data
          localStorage.removeItem(`product_draft_${product.id}`);
          console.log(`🗑️ Deleted full draft data: product_draft_${product.id}`);
          
          // Also check if this is the current draft
          const draftData = localStorage.getItem('product_draft_current_draft');
          if (draftData) {
            const parsedDraft = JSON.parse(draftData);
            if (parsedDraft.productTitle === product.name) {
              localStorage.removeItem('product_draft_current_draft');
            }
          }
        }
        
        console.log('✅ Product deleted successfully');
        alert('✅ Product deleted successfully!');
      }
    }
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

  const handleResetFilters = () => {
    setFilters({
      productName: '',
      minRevenue: 0,
      maxRevenue: 100000,
      status: 'All Status'
    });
    setSearchQuery('');
  };

  const handleRefresh = () => {
    console.log('🔄 Refresh button clicked');
    try {
      const allProductsData = localStorage.getItem('all_products');
      if (allProductsData) {
        const loadedProducts = JSON.parse(allProductsData);
        
        // Recalculate stats - only count Published and Draft products (excluding Under Review)
        const uniqMap = new Map();
        loadedProducts.forEach(p => {
          // Use id as primary key (should always exist), fallback to referenceCode then name
          const key = p.id != null ? String(p.id) : (p.referenceCode ?? p.name);
          // Only keep first occurrence if duplicate
          if (!uniqMap.has(key)) {
            uniqMap.set(key, p);
          }
        });
        const deduped = Array.from(uniqMap.values());

        const relevantProducts = deduped.filter(p => 
          p.status === 'Published' || 
          p.status === 'Draft'
        );
        
        const published = relevantProducts.filter(p => p.status === 'Published').length;
        const draft = relevantProducts.filter(p => p.status === 'Draft').length;
        
        // Debug logging
        console.log('🔄 Refresh Product Stats:', {
          totalLoaded: loadedProducts.length,
          totalDeduped: deduped.length,
          totalRelevant: relevantProducts.length,
          published,
          draft
        });
        const totalRevenue = relevantProducts
          .filter(p => p.status === 'Published')
          .reduce((sum, p) => sum + (typeof p.revenue === 'number' ? p.revenue : 0), 0);
        
        setProducts(deduped);
        setProductStats({
          total: relevantProducts.length, // This should now be published + draft only
          active: published,
          draft: draft,
          revenue: totalRevenue
        });
        
        console.log('✅ Refresh completed:', {
          totalProducts: relevantProducts.length,
          published,
          draft,
          revenue: totalRevenue
        });
        
        // Optional: Show brief success message
        const refreshBtn = document.querySelector('button[title="Refresh"]');
        if (refreshBtn) {
          refreshBtn.classList.add('animate-spin');
          setTimeout(() => {
            refreshBtn.classList.remove('animate-spin');
          }, 500);
        }
      } else {
        console.log('⚠️ No products found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error during refresh:', error);
      alert('Error refreshing products. Please try again.');
    }
  };

  const handleArchive = () => {
    if (selectedProducts.length === 0) return;
    
    const updatedProducts = products.map(product => {
      if (selectedProducts.includes(product.id)) {
        return { ...product, status: 'Archived' };
      }
      return product;
    });
    
    localStorage.setItem('all_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    setSelectedProducts([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="text-3xl font-bold text-gray-900 mb-2">{productStats.total}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{String(productStats.active).padStart(2, '0')}</div>
            <div className="text-sm text-gray-600">Active Products</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{productStats.draft}</div>
            <div className="text-sm text-gray-600">Draft products</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">${productStats.revenue.toLocaleString()}</div>
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
            <span className="ml-2 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">{productStats.draft}</span>
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

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search.."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw size={20} />
            </button>
            {selectedProducts.length > 0 && (
              <>
                <span className="text-sm text-gray-600">{selectedProducts.length} Selected</span>
                <button 
                  onClick={handleArchive}
                  className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
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
                {displayedProducts.map((product) => (
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
                      ${typeof product.revenue === 'number' ? product.revenue.toLocaleString() : product.revenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.creationDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.ratings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="relative" ref={el => dropdownRefs.current[product.id] = el}>
                        <button 
                          onClick={() => toggleDropdown(product.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FiMoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Dropdowns - Rendered outside table to avoid overflow issues */}
        {openDropdown !== null && displayedProducts.map((product) => {
          if (openDropdown !== product.id) return null;
          
          const buttonElement = dropdownRefs.current[product.id];
          if (!buttonElement) return null;
          
          const rect = buttonElement.getBoundingClientRect();
          
          return (
            <div
              key={product.id}
              ref={(el) => (dropdownMenuRefs.current[product.id] = el)}
              className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50"
              style={{
                top: `${rect.bottom + 4}px`,
                right: `${window.innerWidth - rect.right}px`
              }}
            >
              <ul className="divide-y divide-gray-100">
                <li>
                  <button
                    onClick={(e) => {
                      console.log('✅ Edit button CLICKED in dropdown');
                      e.preventDefault();
                      e.stopPropagation();
                      handleAction('edit', product.id);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </li>
                {product.status === 'Archived' ? (
                  <li>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAction('unarchive', product.id);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
                    >
                      Undo Archive
                    </button>
                  </li>
                ) : null}
                <li>
                  <button
                    onClick={(e) => {
                      console.log('✅ Clone button CLICKED in dropdown');
                      e.preventDefault();
                      e.stopPropagation();
                      handleAction('clone', product.id);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Clone
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      console.log('✅ Share button CLICKED in dropdown');
                      e.preventDefault();
                      e.stopPropagation();
                      handleAction('share', product.id);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Share product
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      console.log('✅ Delete button CLICKED in dropdown');
                      e.preventDefault();
                      e.stopPropagation();
                      handleAction('delete', product.id);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          );
        })}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
              <FiChevronLeft size={20} />
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md">2</button>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md">3</button>
            <span className="px-2 text-gray-500">...</span>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md">12</button>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md">13</button>
            <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md">14</button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <FiChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">1 \\ 10</span>
            <button className="p-1 text-gray-600 hover:text-gray-900">
              <FiChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={filtersRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
              <button
                onClick={toggleFilters}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={filters.productName}
                  onChange={(e) => handleFilterChange('productName', e.target.value)}
                  placeholder="Enter Here"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-4">
                  By Revenue
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-gray-200 rounded text-sm font-medium">${filters.minRevenue}</span>
                      <span className="text-gray-500 text-sm">To</span>
                      <span className="px-3 py-1 bg-gray-200 rounded text-sm font-medium">${filters.maxRevenue.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-gray-400">Shows all</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    value={filters.minRevenue}
                    onChange={(e) => handleFilterChange('minRevenue', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Status
                </label>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <span className="text-gray-500">{filters.status}</span>
                  <FiChevronDown size={16} className="text-gray-400" />
                </button>

                {showStatusDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {['All Status', 'Published', 'Draft', 'Rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          handleFilterChange('status', status);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                          filters.status === status ? 'bg-gray-100' : ''
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  handleResetFilters();
                  toggleFilters();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={toggleFilters}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Products;
