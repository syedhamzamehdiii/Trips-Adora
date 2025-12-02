import React, { useState, useEffect } from 'react';
import { FiUpload, FiPlus, FiFilter, FiSearch, FiTruck, FiPower, FiCalendar, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import Footer from '@/components/common/Footer';
import Calendar from '@/components/common/Calendar';
import productService from '@/services/productService';

const AvailabilityCalendar = () => {
  // Real-time data states
  const [productOptions, setProductOptions] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [tourOptions, setTourOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [totalSelectedProducts, setTotalSelectedProducts] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [inactiveProducts, setInactiveProducts] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [availableVehicles, setAvailableVehicles] = useState(0);

  // View mode: 'product' or 'vehicle'
  const [viewMode, setViewMode] = useState('product');

  // Filter states
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [showTourDropdown, setShowTourDropdown] = useState(false);

  // Selected options state
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedTours, setSelectedTours] = useState([]);

  // Calendar modal state
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 7;

  // Build and download CSV for current schedules (real-time)
  const handleExportSchedule = async () => {
    try {
      // Fetch products from API (real-time data)
      const response = await productService.getMyProducts({
        page: 1,
        page_size: 100,
        summary: false
      });
      const allProducts = Array.isArray(response?.items) ? response.items : (Array.isArray(response) ? response : []);

      // Helper to collect time slots from multiple sources
      const collectTimeSlots = (p) => {
        const slots = new Set();
        if (Array.isArray(p?.vehicleTimeAllocations)) {
          p.vehicleTimeAllocations.forEach(a => a?.time && slots.add(a.time));
        }
        if (p?.timeSlots && typeof p.timeSlots === 'object') {
          Object.values(p.timeSlots).forEach(dayArr => {
            if (Array.isArray(dayArr)) dayArr.forEach(t => typeof t === 'string' && slots.add(t));
          });
        }
        // Optional fallbacks (full/draft payloads)
        const fullKey = p.id ? `product_full_${p.id}` : null;
        if (fullKey && localStorage.getItem(fullKey)) {
          try {
            const full = JSON.parse(localStorage.getItem(fullKey));
            if (Array.isArray(full?.vehicleTimeAllocations)) full.vehicleTimeAllocations.forEach(a => a?.time && slots.add(a.time));
            if (full?.timeSlots && typeof full.timeSlots === 'object') {
              Object.values(full.timeSlots).forEach(dayArr => Array.isArray(dayArr) && dayArr.forEach(t => typeof t === 'string' && slots.add(t)));
            }
          } catch (_) {}
        }
        const draftKey = p.id ? `product_draft_${p.id}` : null;
        if (draftKey && localStorage.getItem(draftKey)) {
          try {
            const draft = JSON.parse(localStorage.getItem(draftKey));
            if (Array.isArray(draft?.vehicleTimeAllocations)) draft.vehicleTimeAllocations.forEach(a => a?.time && slots.add(a.time));
            if (draft?.timeSlots && typeof draft.timeSlots === 'object') {
              Object.values(draft.timeSlots).forEach(dayArr => Array.isArray(dayArr) && dayArr.forEach(t => typeof t === 'string' && slots.add(t)));
            }
          } catch (_) {}
        }
        return Array.from(slots).sort();
      };

      // Use products state to respect the current filters in UI
      const idsToExport = new Set(products.map(fp => fp.id));

      const rows = [];
      // Header row
      rows.push(['Product Name','Status','Vehicle(s)','Time Slots','Inactive Dates'].join(','));

      allProducts
        .filter(p => idsToExport.size === 0 || idsToExport.has(p.id || p.referenceCode))
        .forEach(p => {
          const name = p.name || p.title || 'Product';
          const status = (p.status === 'Published') ? 'Active' : 'Inactive';
          const vehicles = Array.isArray(p.vehicles) && p.vehicles.length > 0
            ? p.vehicles.map(v => getVehicleDisplayName(v)).join(' | ')
            : 'N/A';
          const timeSlots = collectTimeSlots(p).join(' | ');
          const inactiveKey = `product_inactive_dates_${p.id || p.referenceCode}`;
          let inactiveDates = [];
          try {
            const saved = localStorage.getItem(inactiveKey);
            if (saved) inactiveDates = JSON.parse(saved);
          } catch (_) {}
          const inactiveStr = Array.isArray(inactiveDates) && inactiveDates.length > 0
            ? inactiveDates.join(' | ')
            : '';

          // Escape commas in fields by wrapping with quotes
          const safe = (val) => `"${String(val || '').replace(/"/g,'""')}"`;
          rows.push([safe(name), safe(status), safe(vehicles), safe(timeSlots), safe(inactiveStr)].join(','));
        });

      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `availability_schedule_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export schedule:', e);
    }
  };

  // Helper: derive a user-friendly vehicle name (title > model > type)
  const getVehicleDisplayName = (vehicle) => {
    if (!vehicle) return 'Vehicle';
    const title = typeof vehicle.title === 'string' ? vehicle.title.trim() : '';
    const model = typeof vehicle.model === 'string' ? vehicle.model.replace('-', ' ').trim() : '';
    const type = typeof vehicle.type === 'string' ? vehicle.type.trim() : '';
    return title || model || type || 'Vehicle';
  };

  // Load real-time data from API on component mount
  useEffect(() => {
    loadRealTimeData();
  }, []);

  const loadRealTimeData = async () => {
    try {
      setIsRefreshing(true);
      console.log('🔄 Loading real-time data for Availability page from API...');
      
      // Fetch products from API (real-time data)
      const response = await productService.getMyProducts({
        page: 1,
        page_size: 100, // Get all products
        summary: false // Get full product data including vehicles and time slots
      });
      
      // Extract products from API response - API returns { products: [...], total, page, etc. }
      const allProducts = Array.isArray(response?.products) 
        ? response.products 
        : (Array.isArray(response?.items) 
          ? response.items 
          : (Array.isArray(response) ? response : []));
      console.log('📦 Fetched products from API:', allProducts.length);
      console.log('📦 Sample product status:', allProducts[0]?.status);
      
      // Show BOTH Published and Draft products in Availability (never hide drafts)
      // Status can be: "published", "draft", "PUBLISHED", "DRAFT", or ProductStatus enum value
      const relevantProducts = allProducts.filter(product => {
        if (!product) return false;
        const status = typeof product.status === 'string' 
          ? product.status.toLowerCase() 
          : String(product.status || '').toLowerCase();
        return status === 'published' || status === 'draft';
      });
      console.log('📦 Found products for availability (Published + Draft):', relevantProducts.length);

      // Build product options and helper maps
      const productNameById = {};
      const productOptionsArray = relevantProducts.map((product, index) => {
        const id = product.id || `product-${index + 1}`;
        const name = product.name || product.title || `Product ${index + 1}`;
        productNameById[id] = name;
        return { id, name };
      });

      // Build vehicle list and filter options directly from products (and their saved payloads)
      const allVehiclesForView = [];
      const uniqueVehicleNames = new Map();

      relevantProducts.forEach((product, index) => {
        const productId = product.id || `product-${index + 1}`;
        const productName = productNameById[productId];

        // Prefer vehicles saved on the product (from backend)
        let vehiclesArray = Array.isArray(product.vehicles) ? product.vehicles : [];

        // Fallback: look into full/draft payloads saved in localStorage
        if (!vehiclesArray.length) {
          const fullKey = product.id ? `product_full_${product.id}` : null;
          const draftKey = product.id ? `product_draft_${product.id}` : null;
          let payload = null;
          try {
            if (fullKey && localStorage.getItem(fullKey)) {
              payload = JSON.parse(localStorage.getItem(fullKey));
            } else if (draftKey && localStorage.getItem(draftKey)) {
              payload = JSON.parse(localStorage.getItem(draftKey));
            }
          } catch (_) {
            payload = null;
          }

          if (payload && Array.isArray(payload.vehicles)) {
            vehiclesArray = payload.vehicles;
          }
        }

        const vehicleInactiveMap = product.vehicle_inactive_dates || product.vehicleInactiveDates || {};

        if (Array.isArray(vehiclesArray) && vehiclesArray.length > 0) {
          vehiclesArray.forEach((vehicle, vIndex) => {
            const displayName = getVehicleDisplayName(vehicle);
            if (!displayName) return;

            const vId = vehicle.id || vehicle._id || `${productId}-vehicle-${vIndex + 1}`;
            const inactiveDates = vehicleInactiveMap[String(vId)] || [];
            const isVehicleActive = !(Array.isArray(inactiveDates) && inactiveDates.length > 0);

            // Add to flattened vehicle list
            allVehiclesForView.push({
              id: vId,
              name: displayName,
              type: vehicle.type || vehicle.vehicle_type || 'Vehicle',
              model: vehicle.model || vehicle.model_name || '',
              capacity: vehicle.capacity || null,
              productId,
              productName,
              isActive: isVehicleActive,
            });

            // Track unique names for Vehicle Type filter
            const key = displayName.toLowerCase();
            if (!uniqueVehicleNames.has(key)) {
              uniqueVehicleNames.set(key, {
                id: key,
                name: displayName,
              });
            }
          });
        }
      });

      const vehicleOptionsArray = Array.from(uniqueVehicleNames.values());
      const tourOptionsArray = []; // Tours filter currently unused

      // Set filter options
      setProductOptions(productOptionsArray);
      setVehicleOptions(vehicleOptionsArray);
      setTourOptions(tourOptionsArray);

      // Create product list for display (product-centric view)
      // Pre-compute vehicle counts per product
      const vehicleCountByProductId = allVehiclesForView.reduce((acc, vehicle) => {
        const pid = vehicle.productId;
        if (!pid) return acc;
        acc[pid] = (acc[pid] || 0) + 1;
        return acc;
      }, {});

      const productList = relevantProducts.map((product, index) => {
        const productId = product.id || `product-${index + 1}`;
        const vehicleCount = vehicleCountByProductId[productId] || 0;
        const categoryLabel = product.category || 'Tour';
        
        // Check status (handle both string and enum values) and backend inactive_dates
        const statusStr = typeof product.status === 'string' 
          ? product.status 
          : String(product.status || '');
        const isPublished = statusStr.toLowerCase() === 'published';
        const hasInactiveDates = Array.isArray(product.inactive_dates || product.inactiveDates) &&
          (product.inactive_dates || product.inactiveDates).length > 0;
        const isAvailable = isPublished && !hasInactiveDates;
        
        return {
          id: productId,
          name: productNameById[productId],
          status: isAvailable ? 'Active' : 'Inactive',
          // Show only high-level product info in the Availability list;
          // detailed vehicle info is handled in the product preview/editor.
          details: categoryLabel,
          vehicles: vehicleCount > 0 ? `${vehicleCount} vehicle${vehicleCount > 1 ? 's' : ''}` : 'No vehicles',
          isActive: isAvailable,
          vehiclesRaw: [] // Detailed vehicle info handled in vehicle view
        };
      });

      setProducts(productList);

      setVehiclesList(allVehiclesForView);

      // Update stats
      const totalCount = productList.length;
      const activeCount = productList.filter(p => p.isActive).length;
      const inactiveCount = productList.filter(p => !p.isActive).length;
      const totalVehiclesCount = allVehiclesForView.length;

      setTotalSelectedProducts(totalCount);
      setActiveProducts(activeCount);
      setInactiveProducts(inactiveCount);
      setTotalVehicles(totalVehiclesCount);
      setAvailableVehicles(totalVehiclesCount);

      console.log('✅ Real-time data loaded successfully!');
      console.log('📊 Stats:', {
        products: totalCount,
        vehicles: vehicleOptionsArray.length,
        tours: tourOptionsArray.length,
      });
    } catch (error) {
      console.error('❌ Error loading real-time data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper functions for handling selections
  const handleSelectAll = (options, setter, currentSelection) => {
    if (currentSelection.length === options.length) {
      setter([]);
    } else {
      setter(options.map(option => option.id));
    }
  };

  const handleOptionToggle = (optionId, currentSelection, setter) => {
    if (currentSelection.includes(optionId)) {
      setter(currentSelection.filter(id => id !== optionId));
    } else {
      setter([...currentSelection, optionId]);
    }
  };

  const getDisplayText = (options, selectedIds, defaultText) => {
    if (selectedIds.length === 0) return defaultText;
    if (selectedIds.length === options.length) return `All ${defaultText.split(' ')[1]}`;
    if (selectedIds.length === 1) {
      const option = options.find(opt => opt.id === selectedIds[0]);
      return option ? option.name : defaultText;
    }
    return `${selectedIds.length} selected`;
  };

  // In vehicle view, narrow the product list to only products that actually
  // contain the currently selected vehicle(s). This makes the "Product Name"
  // filter context-aware, so suppliers can first choose a vehicle and then
  // pick from only those products that use that vehicle.
  const visibleProductOptions = React.useMemo(() => {
    // In product mode, or when no specific vehicles are selected, show all products
    if (viewMode === 'product' || selectedVehicles.length === 0) {
      return productOptions;
    }

    try {
      // Map selected vehicle option ids -> lowercase names
      const selectedVehicleNames = new Set(
        selectedVehicles
          .map(id => {
            const opt = vehicleOptions.find(o => o.id === id);
            return opt?.name ? opt.name.toLowerCase() : null;
          })
          .filter(Boolean)
      );
      if (selectedVehicleNames.size === 0) return productOptions;

      // Collect productIds that have at least one of the selected vehicles
      const productIdsWithSelectedVehicles = new Set(
        vehiclesList
          .filter(v => v.name && selectedVehicleNames.has(String(v.name).toLowerCase()))
          .map(v => v.productId)
          .filter(Boolean)
      );
      if (productIdsWithSelectedVehicles.size === 0) return productOptions;

      return productOptions.filter(p => productIdsWithSelectedVehicles.has(p.id));
    } catch {
      return productOptions;
    }
  }, [viewMode, selectedVehicles, productOptions, vehiclesList, vehicleOptions]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowProductDropdown(false);
        setShowVehicleDropdown(false);
        setShowTourDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProducts, selectedVehicles, selectedTours]);

  const handleToggleProduct = (productId, nextActive = null) => {
    // Determine next state
    const current = products.find(p => p.id === productId);
    if (!current) return;
    const willBeActive = nextActive !== null ? nextActive : !current.isActive;

    // Update UI state immediately
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, isActive: willBeActive, status: willBeActive ? 'Active' : 'Inactive' }
        : product
    );
    setProducts(updatedProducts);

    // Recompute counters
    setActiveProducts(updatedProducts.filter(p => p.isActive).length);
    setInactiveProducts(updatedProducts.filter(p => !p.isActive).length);

    // Persist product availability to backend:
    // - When activating: clear inactive_dates so product is available again
    // - When deactivating: actual inactive dates are set via the calendar modal's onApply handler
    if (willBeActive && productId) {
      productService.updateAvailability(productId, { inactive_dates: [] }).catch(() => {});
    }
  };

  // Apply filters to products
  const filteredProducts = products.filter(product => {
    // Product name filter
    if (selectedProducts.length > 0) {
      const productNameMatch = productOptions.find(opt => opt.id === product.id);
      if (!selectedProducts.includes(product.id)) {
        return false;
      }
    }

    // Vehicle type filter
    if (selectedVehicles.length > 0) {
      const vehicleMatch = vehicleOptions.some(opt => 
        selectedVehicles.includes(opt.id) && product.details?.includes(opt.name)
      );
      if (!vehicleMatch) {
        return false;
      }
    }

    // Tour options filter
    if (selectedTours.length > 0) {
      const tourMatch = tourOptions.some(opt => 
        selectedTours.includes(opt.id) && product.details?.includes(opt.name)
      );
      if (!tourMatch) {
        return false;
      }
    }

    return true;
  });

  // Apply filters to vehicles (vehicle-centric view)
  const filteredVehicles = vehiclesList.filter(vehicle => {
    // Filter by selected products (which products' vehicles to show)
    if (selectedProducts.length > 0 && !selectedProducts.includes(vehicle.productId)) {
      return false;
    }

    // Filter by selected vehicle types/names
    if (selectedVehicles.length > 0) {
      const vehicleMatch = vehicleOptions.some(opt =>
        selectedVehicles.includes(opt.id) &&
        vehicle.name?.toLowerCase().includes(opt.name.toLowerCase())
      );
      if (!vehicleMatch) {
        return false;
      }
    }

    return true;
  });

  // Pagination functions
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBulkActivate = () => {
    if (viewMode === 'product') {
      // PRODUCT MODE: activate all products
      setProducts(prevProducts => {
        const updated = prevProducts.map(product => ({
          ...product,
          isActive: true,
          status: 'Active'
        }));

        // Persist to backend: clear inactive_dates for each product
        updated.forEach(p => {
          if (p.id) {
            productService.updateAvailability(p.id, { inactive_dates: [] }).catch(() => {});
          }
        });

        // Update counts
        setActiveProducts(updated.length);
        setInactiveProducts(0);
        return updated;
      });
    } else {
      // VEHICLE MODE: activate all vehicles
      setVehiclesList(prevVehicles => {
        const idsToAffect = new Set(filteredVehicles.map(v => v.id));
        const updated = prevVehicles.map(v =>
          idsToAffect.has(v.id) ? { ...v, isActive: true } : v
        );

        // Persist to backend: clear vehicle_inactive_dates only for filtered vehicles
        updated.forEach(v => {
          if (idsToAffect.has(v.id) && v.productId && v.id) {
            productService
              .updateAvailability(v.productId, {
                vehicle_id: v.id,
                vehicle_inactive_dates: [],
              })
              .catch(() => {});
          }
        });

        // Refresh vehicle availability stats (overall active count)
        setAvailableVehicles(updated.filter(v => v.isActive).length);
        return updated;
      });
    }
  };

  const handleBulkDeactivate = () => {
    if (viewMode === 'product') {
      // PRODUCT MODE: deactivate all products, but let supplier choose the dates
      // using the shared calendar. We apply the selected dates to all currently
      // filtered products.
      const idsInScope = filteredProducts.map(p => p.id).filter(Boolean);
      if (idsInScope.length === 0) return;

      // Stash ids for calendar onApply handler
      window.__bulkInactiveProductIds = idsInScope;
      setShowCalendarModal(true);
    } else {
      // VEHICLE MODE: deactivate all vehicles in scope via calendar dates
      const vehiclesInScope = filteredVehicles
        .filter(v => v.id && v.productId)
        .map(v => ({ id: v.id, productId: v.productId }));
      if (!vehiclesInScope.length) return;

      window.__bulkInactiveVehicles = vehiclesInScope;
      setShowCalendarModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Actions */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Availability Calendar</h1>
            <p className="text-gray-600">Manage product availability and booking capacity</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleExportSchedule} className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <FiUpload className="w-4 h-4" />
              <span>Export Schedule</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-[#1d236b] text-white rounded-lg hover:bg-[#151a4a] transition-colors">
              <FiPlus className="w-4 h-4" />
              <span>Add Availability</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">{String(totalSelectedProducts).padStart(2, '0')}</div>
            <div className="text-gray-600">Total Products</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">{String(vehicleOptions.length).padStart(2, '0')}</div>
            <div className="text-gray-600">Total Vehicles</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">{String(activeProducts).padStart(2, '0')}</div>
            <div className="text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center">
            <div className="text-center">
              <button 
                onClick={loadRealTimeData} 
                disabled={isRefreshing}
                className="hover:scale-110 transition-transform disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRefreshCw 
                  className={`w-8 h-8 text-[#1d236b] mx-auto mb-2 transition-all duration-300 ${isRefreshing ? 'animate-spin' : ''}`} 
                />
              </button>
              <div className="text-gray-600">
                {isRefreshing ? 'Refreshing...' : 'Availability'}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Selection Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Selection Filters</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode('product');
                  // Clear vehicle filters when switching back to product mode
                  setSelectedVehicles([]);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  viewMode === 'product'
                    ? 'bg-[#1d236b] text-white border-[#1d236b]'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('vehicle');
                  // Clear product filters when switching to vehicle mode
                  setSelectedProducts([]);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  viewMode === 'vehicle'
                    ? 'bg-[#1d236b] text-white border-[#1d236b]'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Vehicles
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Product Name Filter */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <div className="relative">
                <button
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1d236b] focus:border-transparent bg-white border-gray-300 hover:border-gray-400"
                >
                  <div className="flex items-center space-x-2">
                    <FiSearch className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {getDisplayText(productOptions, selectedProducts, "All Product")}
                    </span>
                  </div>
                  <FiChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {showProductDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      {visibleProductOptions.length > 0 ? (
                        <>
                      <label 
                        className="flex items-center px-3 py-2 bg-gray-100 text-sm font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSelectAll(visibleProductOptions, setSelectedProducts, selectedProducts)}
                      >
                        <input 
                          type="checkbox" 
                          className="mr-3 text-[#1d236b] focus:ring-[#1d236b]"
                          checked={selectedProducts.length === visibleProductOptions.length && visibleProductOptions.length > 0}
                          onChange={() => {}} // Handled by onClick
                        />
                        <span>Select All ({productOptions.length})</span>
                      </label>
                      {visibleProductOptions.map((option) => (
                        <label key={option.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="mr-3 text-[#1d236b] focus:ring-[#1d236b]"
                            checked={selectedProducts.includes(option.id)}
                            onChange={() => handleOptionToggle(option.id, selectedProducts, setSelectedProducts)}
                          />
                          <span className="text-sm text-gray-700">{option.name}</span>
                        </label>
                      ))}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-center text-gray-500 text-sm">
                          No published products yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Type Filter (only in Vehicles mode) */}
            {viewMode === 'vehicle' && (
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <div className="relative">
                  <button
                    onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1d236b] focus:border-transparent bg-white border-gray-300 hover:border-gray-400"
                  >
                    <div className="flex items-center space-x-2">
                      <FiTruck className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {getDisplayText(vehicleOptions, selectedVehicles, "All Vehicles")}
                      </span>
                    </div>
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showVehicleDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        {vehicleOptions.length > 0 ? (
                          <>
                        <label 
                          className="flex items-center px-3 py-2 bg-gray-100 text-sm font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleSelectAll(vehicleOptions, setSelectedVehicles, selectedVehicles)}
                        >
                          <input 
                            type="checkbox" 
                            className="mr-3 text-[#1d236b] focus:ring-[#1d236b]"
                            checked={selectedVehicles.length === vehicleOptions.length}
                            onChange={() => {}} // Handled by onClick
                          />
                          <span>Select All ({vehicleOptions.length})</span>
                        </label>
                        {vehicleOptions.map((option) => (
                          <label key={option.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="mr-3 text-[#1d236b] focus:ring-[#1d236b]"
                              checked={selectedVehicles.includes(option.id)}
                              onChange={() => handleOptionToggle(option.id, selectedVehicles, setSelectedVehicles)}
                            />
                            <span className="text-sm text-gray-700">{option.name}</span>
                          </label>
                        ))}
                          </>
                        ) : (
                          <div className="px-3 py-4 text-center text-gray-500 text-sm">
                            No vehicles available
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tour Options Filter - removed per requirements */}

            {/* Group Size and Time Slots filters removed per requirements */}
          </div>
        </div>

        {/* Selected Status Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {viewMode === 'product' ? 'Selected Products Status' : 'Selected Vehicles Status'}
              </h3>
              <p className="text-gray-600">
                {viewMode === 'product'
                  ? `Manage availability for ${totalSelectedProducts} selected products.`
                  : `Manage availability for ${filteredVehicles.length} selected vehicles.`}
              </p>
            </div>
            <div className="flex space-x-2">
              {(() => {
                // In product mode use product-level counters.
                // In vehicle mode derive counts from the current filteredVehicles list.
                const activeCount =
                  viewMode === 'product'
                    ? activeProducts
                    : filteredVehicles.filter(v => v.isActive).length;
                const inactiveCount =
                  viewMode === 'product'
                    ? inactiveProducts
                    : filteredVehicles.filter(v => !v.isActive).length;

                return (
                  <>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active {activeCount}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      In Active {inactiveCount}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Actions</h3>
            
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBulkActivate}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-base flex-1"
            >
              <FiPower className="w-5 h-5" />
              <span>Activate all</span>
            </button>
            <button 
              onClick={handleBulkDeactivate}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-base flex-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Deactivate All</span>
            </button>
          </div>
        </div>

        {/* Individual Product control (product mode) */}
        {viewMode === 'product' && (selectedProducts.length > 0 || selectedVehicles.length > 0 || 
          selectedTours.length > 0) && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Individual Product control</h3>
              <span className="text-gray-600">{filteredProducts.length} Products</span>
            </div>
          <div className="space-y-4">
            {currentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">Status</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <FiPower className={`w-4 h-4 ${product.isActive ? 'text-green-600' : 'text-red-600'}`} />
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={product.isActive}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              // Opening calendar to choose inactive dates
                              setShowCalendarModal(true);
                              // Temporarily flip UI; final persist in onApply below
                              handleToggleProduct(product.id, false);
                              // Stash pending product id on window for simplicity
                              window.__pendingInactiveProductId = product.id;
                            } else {
                              handleToggleProduct(product.id, true);
                            }
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1d236b]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1d236b]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
              </div>
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-[#1d236b] text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Individual Vehicle control (vehicle mode) */}
        {viewMode === 'vehicle' && filteredVehicles.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Individual Vehicle control</h3>
              <span className="text-gray-600">{filteredVehicles.length} Vehicles</span>
            </div>
            <div className="space-y-4">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                        {vehicle.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {vehicle.model && <span className="mr-2">{vehicle.model}</span>}
                      {vehicle.capacity && <span>{vehicle.capacity} pax</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      Product: {vehicle.productName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">Status</div>
                      <div className="flex items-center space-x-2 mt-1">
                      <FiPower className={`w-4 h-4 ${vehicle.isActive ? 'text-green-600' : 'text-red-600'}`} />
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={vehicle.isActive}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                // User is deactivating this vehicle:
                                // 1) Open calendar for selecting inactive dates
                                // 2) Optimistically flip UI to OFF
                                // 3) Store pending ids so onApply/onClose know what to persist / revert
                                setShowCalendarModal(true);
                                window.__pendingInactiveVehicleId = vehicle.id;
                                window.__pendingInactiveVehicleProductId = vehicle.productId;

                                // Optimistically mark this vehicle as inactive in the UI
                                setVehiclesList(prev =>
                                  prev.map(v =>
                                    v.id === vehicle.id ? { ...v, isActive: false } : v
                                  )
                                );
                              } else {
                                // User is re-activating this vehicle for all dates:
                                // 1) Flip UI to ON
                                // 2) Clear vehicle_inactive_dates in backend so it becomes available again
                                setVehiclesList(prev =>
                                  prev.map(v =>
                                    v.id === vehicle.id ? { ...v, isActive: true } : v
                                  )
                                );

                                if (vehicle.productId && vehicle.id) {
                                  productService
                                    .updateAvailability(vehicle.productId, {
                                      vehicle_id: vehicle.id,
                                      vehicle_inactive_dates: [],
                                    })
                                    .catch(() => {});
                                }
                              }
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1d236b]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1d236b]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Summary */}
        <div className="bg-[#1d236b]/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Summary</h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">Active Products</div>
              <div className="text-2xl font-bold text-gray-900">{activeProducts} of {totalSelectedProducts}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Total Vehicles</div>
              <div className="text-2xl font-bold text-gray-900">{availableVehicles} / {totalVehicles} Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Calendar Modal */}
      <Calendar 
        isOpen={showCalendarModal} 
        onClose={() => {
          try {
            const pendingVehicleId = window.__pendingInactiveVehicleId;
            const pendingVehicleProductId = window.__pendingInactiveVehicleProductId;
            const pendingProductId = window.__pendingInactiveProductId;
            const bulkProductIds = window.__bulkInactiveProductIds;
            const bulkVehicles = window.__bulkInactiveVehicles;

            // If user closes the calendar without applying for a vehicle,
            // restore the previous "active" state so the toggle doesn't stay OFF.
            if (pendingVehicleId && pendingVehicleProductId) {
              setVehiclesList(prev =>
                prev.map(v =>
                  v.id === pendingVehicleId ? { ...v, isActive: true } : v
                )
              );
              delete window.__pendingInactiveVehicleId;
              delete window.__pendingInactiveVehicleProductId;
            }

            // For product-level pending id we don't change state here because
            // product toggle is only flipped in handleToggleProduct, which is
            // called explicitly before opening the calendar.
            if (pendingProductId) {
              delete window.__pendingInactiveProductId;
            }

            if (bulkProductIds) {
              delete window.__bulkInactiveProductIds;
            }

            if (bulkVehicles) {
              delete window.__bulkInactiveVehicles;
            }
          } catch (e) {}

          setShowCalendarModal(false);
        }} 
        onApply={(dates) => {
          try {
            const productId = window.__pendingInactiveProductId;
            const vehicleId = window.__pendingInactiveVehicleId;
            const vehicleProductId = window.__pendingInactiveVehicleProductId;
            const bulkProductIds = window.__bulkInactiveProductIds;
            const bulkVehicles = window.__bulkInactiveVehicles;

            if (productId) {
              // Persist product-level inactive dates to backend
              productService.updateAvailability(productId, { inactive_dates: dates }).catch(() => {});
              delete window.__pendingInactiveProductId;
            }

            if (Array.isArray(bulkProductIds) && bulkProductIds.length > 0) {
              // Apply the same inactive dates to all selected products in scope
              bulkProductIds.forEach(pid => {
                productService.updateAvailability(pid, { inactive_dates: dates }).catch(() => {});
              });

              // Update UI state for all affected products and recompute counters
              setProducts(prev => {
                const updated = prev.map(p =>
                  bulkProductIds.includes(p.id)
                    ? { ...p, isActive: false, status: 'Inactive' }
                    : p
                );
                setActiveProducts(updated.filter(p => p.isActive).length);
                setInactiveProducts(updated.filter(p => !p.isActive).length);
                return updated;
              });

              delete window.__bulkInactiveProductIds;
            }

            if (vehicleId && vehicleProductId) {
              // Persist vehicle-level inactive dates to backend
              productService
                .updateAvailability(vehicleProductId, {
                  vehicle_id: vehicleId,
                  vehicle_inactive_dates: dates,
                })
                .catch(() => {});
              delete window.__pendingInactiveVehicleId;
              delete window.__pendingInactiveVehicleProductId;

              // Mark this vehicle as inactive in UI
              setVehiclesList(prev =>
                prev.map(v =>
                  v.id === vehicleId ? { ...v, isActive: false } : v
                )
              );
            }

            if (Array.isArray(bulkVehicles) && bulkVehicles.length > 0) {
              // Apply the same inactive dates to all selected vehicles in scope
              bulkVehicles.forEach(({ id: vid, productId: pid }) => {
                productService
                  .updateAvailability(pid, {
                    vehicle_id: vid,
                    vehicle_inactive_dates: dates,
                  })
                  .catch(() => {});
              });

              // Mark these vehicles as inactive in UI and recompute availability stats
              setVehiclesList(prev => {
                const idsSet = new Set(bulkVehicles.map(v => v.id));
                const updated = prev.map(v =>
                  idsSet.has(v.id) ? { ...v, isActive: false } : v
                );
                setAvailableVehicles(updated.filter(v => v.isActive).length);
                return updated;
              });

              delete window.__bulkInactiveVehicles;
            }
          } catch (e) {}
          setShowCalendarModal(false);
        }}
      />
    </div>
  );
};

export default AvailabilityCalendar;
