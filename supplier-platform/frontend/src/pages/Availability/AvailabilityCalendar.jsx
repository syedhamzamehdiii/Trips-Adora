import React, { useState, useEffect } from 'react';
import { FiUpload, FiPlus, FiFilter, FiSearch, FiTruck, FiMapPin, FiUsers, FiClock, FiPower, FiCalendar, FiRefreshCw, FiChevronDown, FiCheck } from 'react-icons/fi';
import Footer from '@/components/common/Footer';
import Calendar from '@/components/common/Calendar';
import productService from '@/services/productService';

const AvailabilityCalendar = () => {
  // Real-time data states
  const [productOptions, setProductOptions] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [tourOptions, setTourOptions] = useState([]);
  const [groupSizeOptions, setGroupSizeOptions] = useState([]);
  const [timeSlotOptions, setTimeSlotOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [totalSelectedProducts, setTotalSelectedProducts] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [inactiveProducts, setInactiveProducts] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [availableVehicles, setAvailableVehicles] = useState(0);

  // Filter states
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [showTourDropdown, setShowTourDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // Selected options state
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedTours, setSelectedTours] = useState([]);
  const [selectedGroupSizes, setSelectedGroupSizes] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

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

      // Extract unique data for filters
      const uniqueVehicles = new Map();
      const uniqueTours = new Map();
      const uniqueGroupSizes = new Set();
      const uniqueTimeSlots = new Set();

      relevantProducts.forEach((product, index) => {
        // Product names for product filter
        // (handled separately below)

        // Extract vehicles (use title/model/type for display)
        const addVehiclesToSet = (vehiclesArr) => {
          vehiclesArr.forEach(vehicle => {
            const displayName = getVehicleDisplayName(vehicle);
            if (displayName) {
              const key = displayName.toLowerCase();
              if (!uniqueVehicles.has(key)) {
                uniqueVehicles.set(key, {
                  id: `vehicle-${uniqueVehicles.size + 1}`,
                  name: displayName,
                });
              }
            }
          });
        };

        // Extract vehicles from vehicle_details.vehicles or product.vehicles
        const vehiclesArray = product.vehicle_details?.vehicles || product.vehicles || [];
        if (Array.isArray(vehiclesArray) && vehiclesArray.length > 0) {
          addVehiclesToSet(vehiclesArray);
        } else {
          // Fallback: check if there is a full draft payload for this product id
          const draftKey = product.id ? `product_draft_${product.id}` : null;
          if (draftKey && localStorage.getItem(draftKey)) {
            try {
              const draftPayload = JSON.parse(localStorage.getItem(draftKey));
              const draftVehicles = draftPayload?.vehicle_details?.vehicles || draftPayload?.vehicles || [];
              if (Array.isArray(draftVehicles) && draftVehicles.length > 0) {
                addVehiclesToSet(draftVehicles);
              }
            } catch (e) {
              console.warn('Unable to parse draft payload for vehicles', e);
            }
          }
        }

        // Extract tours (product titles/categories)
        if (product.name || product.title) {
          const tourKey = product.name || product.title;
          if (!uniqueTours.has(tourKey)) {
            uniqueTours.set(tourKey, {
              id: `tour-${uniqueTours.size + 1}`,
              name: tourKey
            });
          }
        }

        // Extract group sizes (from vehicle capacity)
        const vehiclesForGroupSize = product.vehicle_details?.vehicles || product.vehicles || [];
        if (Array.isArray(vehiclesForGroupSize)) {
          vehiclesForGroupSize.forEach(vehicle => {
            if (vehicle.capacity) {
              uniqueGroupSizes.add(`${vehicle.capacity} Person`);
            }
          });
        }

        // Extract time slots helpers
        const addTimeSlots = (allocations) => {
          allocations.forEach(allocation => {
            if (allocation && allocation.time) {
              uniqueTimeSlots.add(allocation.time);
            }
          });
        };
        const addTimeSlotsFromGenerated = (timeSlotsObj) => {
          if (!timeSlotsObj || typeof timeSlotsObj !== 'object') return;
          Object.values(timeSlotsObj).forEach(dayArr => {
            if (Array.isArray(dayArr)) {
              dayArr.forEach(t => {
                if (typeof t === 'string' && t.trim()) {
                  uniqueTimeSlots.add(t.trim());
                }
              });
            }
          });
        };

        // Extract time slots from multiple possible locations
        // 1) From pickup_dropoff.available_time_slots (if stored there)
        const pickupDropoff = product.pickup_dropoff || product.pickupDropoff;
        if (Array.isArray(pickupDropoff?.available_time_slots) && pickupDropoff.available_time_slots.length > 0) {
          pickupDropoff.available_time_slots.forEach(slot => {
            if (typeof slot === 'string' && slot.trim()) {
              uniqueTimeSlots.add(slot.trim());
            }
          });
        }
        // Also check for time_slots object format
        if (pickupDropoff?.time_slots && typeof pickupDropoff.time_slots === 'object') {
          addTimeSlotsFromGenerated(pickupDropoff.time_slots);
        }
        // 2) From vehicle-time allocations saved on publish (custom_fields or direct)
        if (Array.isArray(product.vehicleTimeAllocations) && product.vehicleTimeAllocations.length > 0) {
          addTimeSlots(product.vehicleTimeAllocations);
        }
        // 3) From generated timeSlots stored on the product (if any)
        if (product.timeSlots) {
          addTimeSlotsFromGenerated(product.timeSlots);
        }
        // 4) From custom_fields (might store time slots)
        if (product.custom_fields?.timeSlots) {
          addTimeSlotsFromGenerated(product.custom_fields.timeSlots);
        }
        if (Array.isArray(product.custom_fields?.vehicleTimeAllocations)) {
          addTimeSlots(product.custom_fields.vehicleTimeAllocations);
        }
        // 5) Fallbacks to localStorage for backward compatibility
        if (uniqueTimeSlots.size === 0) {
          const fullKey = product.id ? `product_full_${product.id}` : null;
          if (fullKey && localStorage.getItem(fullKey)) {
            try {
              const full = JSON.parse(localStorage.getItem(fullKey));
              if (full && Array.isArray(full.vehicleTimeAllocations) && full.vehicleTimeAllocations.length > 0) {
                addTimeSlots(full.vehicleTimeAllocations);
              }
              if (full && full.timeSlots) {
                addTimeSlotsFromGenerated(full.timeSlots);
              }
            } catch (e) {
              console.warn('Unable to parse full published payload for time slots', e);
            }
          }
          const draftKeyTs = product.id ? `product_draft_${product.id}` : null;
          if (draftKeyTs && localStorage.getItem(draftKeyTs)) {
            try {
              const draft = JSON.parse(localStorage.getItem(draftKeyTs));
              if (draft && Array.isArray(draft.vehicleTimeAllocations) && draft.vehicleTimeAllocations.length > 0) {
                addTimeSlots(draft.vehicleTimeAllocations);
              }
              if (draft && draft.timeSlots) {
                addTimeSlotsFromGenerated(draft.timeSlots);
              }
            } catch (e) {
              console.warn('Unable to parse draft payload for time slots', e);
            }
          }
        }
      });

      // Convert to arrays for display
      const productOptionsArray = relevantProducts.map((product, index) => ({
        id: product.id || `product-${index + 1}`,
        name: product.name || product.title || `Product ${index + 1}`
      }));

      const vehicleOptionsArray = Array.from(uniqueVehicles.values());
      const tourOptionsArray = Array.from(uniqueTours.values());
      const groupSizeOptionsArray = Array.from(uniqueGroupSizes).map((size, index) => ({
        id: `group-${index + 1}`,
        name: size
      }));
      const timeSlotOptionsArray = Array.from(uniqueTimeSlots).sort().map((time, index) => ({
        id: `time-${index + 1}`,
        name: time
      }));

      // Set filter options
      setProductOptions(productOptionsArray);
      setVehicleOptions(vehicleOptionsArray);
      setTourOptions(tourOptionsArray);
      setGroupSizeOptions(groupSizeOptionsArray);
      setTimeSlotOptions(timeSlotOptionsArray);

      // Create product list for display (respect real status)
      const productList = relevantProducts.map((product, index) => {
        // Extract vehicles from vehicle_details if available
        const vehicleDetails = product.vehicle_details;
        const vehiclesArray = vehicleDetails?.vehicles || product.vehicles || [];
        const vehicleCount = Array.isArray(vehiclesArray) ? vehiclesArray.length : 0;
        const vehicleType = vehiclesArray?.[0] ? getVehicleDisplayName(vehiclesArray[0]) : 'N/A';
        const groupSize = vehiclesArray?.[0]?.capacity ? `1-${vehiclesArray[0].capacity} People` : 'N/A';
        
        // Check status (handle both string and enum values)
        const statusStr = typeof product.status === 'string' 
          ? product.status 
          : String(product.status || '');
        const isPublished = statusStr.toLowerCase() === 'published';
        
        return {
          id: product.id || `product-${index + 1}`,
          name: product.name || product.title || `Product ${index + 1}`,
          status: isPublished ? 'Active' : 'Inactive',
          details: `${vehicleType} > ${product.category || 'Tour'} > ${groupSize}`,
          vehicles: `${vehicleCount}/${vehicleCount} available`,
          isActive: isPublished,
          vehiclesRaw: Array.isArray(vehiclesArray) ? vehiclesArray : []
        };
      });

      setProducts(productList);

      // Update stats
      const totalCount = productList.length;
      const activeCount = productList.filter(p => p.isActive).length;
      const inactiveCount = productList.filter(p => !p.isActive).length;
      const totalVehiclesCount = relevantProducts.reduce((sum, p) => {
        const vehicles = p.vehicle_details?.vehicles || p.vehicles || [];
        return sum + (Array.isArray(vehicles) ? vehicles.length : 0);
      }, 0);

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
        groupSizes: groupSizeOptionsArray.length,
        timeSlots: timeSlotOptionsArray.length
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowProductDropdown(false);
        setShowVehicleDropdown(false);
        setShowTourDropdown(false);
        setShowGroupDropdown(false);
        setShowTimeDropdown(false);
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
  }, [selectedProducts, selectedVehicles, selectedTours, selectedGroupSizes, selectedTimeSlots]);

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

    // Persist status change into all_products
    try {
      const allProductsData = localStorage.getItem('all_products');
      const all = allProductsData ? JSON.parse(allProductsData) : [];
      const idx = all.findIndex(p => (p.id || p.referenceCode) === productId || (p.id === productId));
      if (idx !== -1) {
        // Persist as Draft when inactive; Published when active
        all[idx] = { ...all[idx], status: willBeActive ? 'Published' : 'Draft' };
        localStorage.setItem('all_products', JSON.stringify(all));
      }
      // Store inactive dates per product
      const inactiveKey = `product_inactive_dates_${productId}`;
      const existing = localStorage.getItem(inactiveKey);
      if (willBeActive) {
        // do nothing here; dates are preserved for history
      } else {
        // If turning inactive without dates supplied, ensure key exists
        if (!existing) localStorage.setItem(inactiveKey, JSON.stringify([]));
      }
    } catch (e) {
      console.warn('Failed to persist product status:', e);
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

    // Group size filter
    if (selectedGroupSizes.length > 0) {
      const groupMatch = groupSizeOptions.some(opt => 
        selectedGroupSizes.includes(opt.id) && product.details?.includes(opt.name.replace(' Person', ''))
      );
      if (!groupMatch) {
        return false;
      }
    }

    // Time slots filter (would need to be added to product data)
    // For now, we'll skip this as time slots aren't in the product details
    
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
    setProducts(prevProducts => 
      prevProducts.map(product => ({
        ...product,
        isActive: true,
        status: "Active"
      }))
    );
    
    // Update counts
    setActiveProducts(products.length);
    setInactiveProducts(0);
  };

  const handleBulkDeactivate = () => {
    setProducts(prevProducts => 
      prevProducts.map(product => ({
        ...product,
        isActive: false,
        status: "Inactive"
      }))
    );
    
    // Update counts
    setActiveProducts(0);
    setInactiveProducts(products.length);
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
          <div className="flex items-center space-x-2 mb-4">
            <FiFilter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Bulk Selection Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Product Name Filter */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <div className="relative">
                <button
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-[#1d236b] focus:border-transparent bg-white"
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
                      {productOptions.length > 0 ? (
                        <>
                      <label 
                        className="flex items-center px-3 py-2 bg-gray-100 text-sm font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSelectAll(productOptions, setSelectedProducts, selectedProducts)}
                      >
                        <input 
                          type="checkbox" 
                          className="mr-3 text-[#1d236b] focus:ring-[#1d236b]"
                          checked={selectedProducts.length === productOptions.length}
                          onChange={() => {}} // Handled by onClick
                        />
                        <span>Select All ({productOptions.length})</span>
                      </label>
                      {productOptions.map((option) => (
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

            {/* Vehicle Type Filter */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <div className="relative">
                <button
                  onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-[#1d236b] focus:border-transparent bg-white"
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

            {/* Tour Options Filter - removed per requirements */}

            {/* Group Size Filter */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
              <div className="relative">
                <button
                  onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-[#1d236b] focus:border-transparent bg-white"
                >
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {getDisplayText(groupSizeOptions, selectedGroupSizes, "All Size")}
                    </span>
                  </div>
                  <FiChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {showGroupDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      {groupSizeOptions.length > 0 ? (
                        <>
                      <label 
                        className="flex items-center px-3 py-2 bg-gray-100 text-sm font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSelectAll(groupSizeOptions, setSelectedGroupSizes, selectedGroupSizes)}
                      >
                        <input 
                          type="checkbox" 
                          className="mr-3 text-[#1d236b] focus:ring-[#1d236b]"
                          checked={selectedGroupSizes.length === groupSizeOptions.length}
                          onChange={() => {}} // Handled by onClick
                        />
                        <span>Select All ({groupSizeOptions.length})</span>
                      </label>
                      {groupSizeOptions.map((option) => (
                        <label key={option.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="mr-3 text-[#1d236b] focus:ring-[#1d236b]"
                            checked={selectedGroupSizes.includes(option.id)}
                            onChange={() => handleOptionToggle(option.id, selectedGroupSizes, setSelectedGroupSizes)}
                          />
                          <span className="text-sm text-gray-700">{option.name}</span>
                        </label>
                      ))}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-center text-gray-500 text-sm">
                          No group sizes available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Slots Filter */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Slots</label>
              <div className="relative">
                <button
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-[#1d236b] focus:border-transparent bg-white"
                >
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {getDisplayText(timeSlotOptions, selectedTimeSlots, "All Time")}
                    </span>
                  </div>
                  <FiChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {showTimeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      {timeSlotOptions.length > 0 ? (
                        <>
                      <label 
                        className="flex items-center px-3 py-2 bg-gray-100 text-sm font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSelectAll(timeSlotOptions, setSelectedTimeSlots, selectedTimeSlots)}
                      >
                        <input 
                          type="checkbox" 
                          className="mr-3 text-[#1d236b] focus:ring-[#1d236b]"
                          checked={selectedTimeSlots.length === timeSlotOptions.length}
                          onChange={() => {}} // Handled by onClick
                        />
                        <span>Select All ({timeSlotOptions.length})</span>
                      </label>
                      {timeSlotOptions.map((option) => (
                        <label key={option.id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="mr-3 text-[#1d236b] focus:ring-[#1d236b]"
                            checked={selectedTimeSlots.includes(option.id)}
                            onChange={() => handleOptionToggle(option.id, selectedTimeSlots, setSelectedTimeSlots)}
                          />
                          <span className="text-sm text-gray-700">{option.name}</span>
                        </label>
                      ))}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-center text-gray-500 text-sm">
                          No time slots available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Products Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Selected Products Status</h3>
              <p className="text-gray-600">Manage availability for {totalSelectedProducts} selected products.</p>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active {activeProducts}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                In Active {inactiveProducts}
              </span>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Actions</h3>
            <button 
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              <FiCalendar className="w-4 h-4" />
              <span>Manage Calendar</span>
            </button>
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

        {/* Individual Product Control - Only show if filters are selected */}
        {(selectedProducts.length > 0 || selectedVehicles.length > 0 || 
          selectedTours.length > 0 || selectedGroupSizes.length > 0 || 
          selectedTimeSlots.length > 0) && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Individual Product control</h3>
            <span className="text-gray-600">{filteredProducts.length} Products</span>
          </div>
          <div className="space-y-4">
            {currentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{product.details}</p>
                  <p className="text-xs text-gray-500">Vehicles: {product.vehicles}</p>
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
        onClose={() => setShowCalendarModal(false)} 
        onApply={(dates) => {
          try {
            const productId = window.__pendingInactiveProductId;
            if (productId) {
              localStorage.setItem(`product_inactive_dates_${productId}`, JSON.stringify(dates));
              delete window.__pendingInactiveProductId;
            }
          } catch (e) {}
          setShowCalendarModal(false);
        }}
      />
    </div>
  );
};

export default AvailabilityCalendar;
