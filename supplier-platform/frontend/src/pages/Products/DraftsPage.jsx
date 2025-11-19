import React, { useState, useRef, useEffect } from 'react';
import { FiClock, FiEdit3, FiMoreVertical, FiSearch, FiFilter, FiTrendingUp, FiFileText, FiTrash2, FiSave, FiDownload, FiSettings, FiFlag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import CreateProductComponent from '@/components/products/CreateProductComponent';
import productService from '@/services/productService';

const DraftsPage = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState(null); // Track which draft is being edited
  const [draftData, setDraftData] = useState(null);
  const [draftProducts, setDraftProducts] = useState([]);
  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    revenue: 0
  });
  const dropdownRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          if (showDropdown === parseInt(key)) {
            setShowDropdown(null);
          }
        }
      });
    };

    if (showDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Load draft data and product stats from database (no constant polling)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load draft info from localStorage (for current draft being edited)
        const savedDraft = localStorage.getItem('product_draft_current_draft');
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            // Check if it's a lightweight reference (has storageKey but no full data)
            if (parsed.storageKey && !parsed.productTitle) {
              // It's a reference - load the actual draft from the storage key
              const actualDraft = localStorage.getItem(parsed.storageKey);
              if (actualDraft) {
                const actualParsed = JSON.parse(actualDraft);
                setDraftData(actualParsed);
              } else {
                // Fallback to the reference itself
                setDraftData(parsed);
              }
            } else {
              // It's the full draft data
              setDraftData(parsed);
            }
          } catch (parseError) {
            console.warn('Unable to parse current draft data:', parseError);
          }
        }
        
        // Load all products from database using lightweight summary
        const response = await productService.getMyProducts({ page: 1, page_size: 50, summary: true });
        const { transformApiProductsList } = await import('@/utils/productTransform');
        const allProducts = transformApiProductsList(response);
        
        // Deduplicate by id (primary key) - keep first occurrence only
        const uniqMap = new Map();
        allProducts.forEach(p => {
          const key = p.id != null ? String(p.id) : (p.referenceCode ?? p.name);
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
        const drafts = relevantProducts.filter(p => p.status === 'Draft');
        const totalRevenue = relevantProducts
          .filter(p => p.status === 'Published')
          .reduce((sum, p) => sum + (typeof p.revenue === 'number' ? p.revenue : 0), 0);
        
        setDraftProducts(drafts);
        setProductStats({
          total: relevantProducts.length, // Published + Draft only
          active: published,
          draft: drafts.length,
          revenue: totalRevenue
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    
    // Revalidate when tab becomes visible
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
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
            <div className="text-4xl font-bold text-gray-900 mb-2">{productStats.total}</div>
            <div className="text-gray-600">Total Products</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{String(productStats.active).padStart(2, '0')}</div>
            <div className="text-gray-600">Active Products</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{productStats.draft}</div>
            <div className="text-gray-600">Draft products</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">${productStats.revenue.toLocaleString()}</div>
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
            <span className="ml-2 w-5 h-5 bg-white text-blue-600 text-xs rounded-full flex items-center justify-center">{productStats.draft}</span>
          </button>
        </div>

        {/* Draft Products Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiClock className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Draft Products</h2>
          </div>
          <p className="text-gray-600 mb-6">Complete these draft Products to make them available for booking</p>

          {/* No Drafts Message */}
          {draftProducts.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <FiClock className="text-gray-400 mx-auto mb-3" size={48} />
              <p className="text-gray-600">No draft products found. Create a new product to get started!</p>
            </div>
          )}

          {/* Draft Product Cards */}
          <div className="space-y-4">
            {draftProducts.map((draft) => (
              <div key={draft.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {draft.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Reference Code:</span> {draft.referenceCode}
                      </div>
                      <div>
                        <span className="font-medium">Revenue:</span> ${draft.revenue.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {draft.creationDate}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> <span className="text-orange-600 font-semibold">{draft.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => {
                        setEditingDraftId(draft.id); // Set which draft is being edited
                        setShowCreateProduct(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FiEdit3 size={16} />
                      <span>Continue Editing</span>
                    </button>
                    <div className="relative" ref={(el) => (dropdownRefs.current[draft.id] = el)}>
                      <button 
                        onClick={() => setShowDropdown(showDropdown === draft.id ? null : draft.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiMoreVertical size={20} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {showDropdown === draft.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="py-2">
                            <button 
                              onClick={async () => {
                                const confirmed = window.confirm(`Are you sure you want to delete "${draft.name}"?`);
                                if (confirmed) {
                                  try {
                                    // Delete from database
                                    await productService.deleteProduct(draft.dbProductId || draft.id);
                                    
                                    // Remove images from localStorage
                                    localStorage.removeItem(`product_draft_${draft.id}`);
                                    
                                    // Reload drafts from database using lightweight summary
                                    const response = await productService.getMyProducts({ status: 'draft', page: 1, page_size: 50, summary: true });
                                    const { transformApiProductsList } = await import('@/utils/productTransform');
                                    const allProducts = transformApiProductsList(response);
                                    const drafts = allProducts.filter(p => p.status === 'Draft');
                                    setDraftProducts(drafts);
                                    
                                    setShowDropdown(null);
                                    alert('Draft deleted successfully!');
                                  } catch (error) {
                                    console.error('Error deleting draft:', error);
                                    alert(`Failed to delete draft: ${error.message}`);
                                  }
                                }
                              }}
                              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center space-x-3"
                            >
                              <FiTrash2 size={16} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Product Component */}
      {showCreateProduct && (
        <CreateProductComponent 
          onClose={() => {
            setShowCreateProduct(false);
            setEditingDraftId(null); // Reset editing draft ID when closing
          }} 
          draftId={editingDraftId || "current_draft"} // Use the specific draft ID or fallback to current_draft
        />
      )}
    </div>
  );
};

export default DraftsPage;