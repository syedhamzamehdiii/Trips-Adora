import React, { useEffect, useMemo, useState } from 'react';
import { Mountain, Camera, Car, Globe, MapPin, Clock, Users, Package, CheckCircle, XCircle, HelpCircle, Eye, Utensils, Star, RefreshCw } from 'lucide-react';
import { getSupplierProductById, updateSupplierProductById } from '../services/supplierService';
import adminProductService from '../services/adminProductService';
import platformSettingsService from '../services/platformSettingsService';


const TourDetailPage = ({ productId, onBack, fromRequestToApprove = false }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [approvalSaving, setApprovalSaving] = useState(false);
  const [platformRefundPolicy, setPlatformRefundPolicy] = useState(null);
  const [usePlatformPolicy, setUsePlatformPolicy] = useState(true);

  // Load platform refund policy
  useEffect(() => {
    let active = true;
    const loadPolicy = async () => {
      try {
        const settings = await platformSettingsService.getPlatformSettings();
        if (!active) return;
        if (settings?.refund_policy) {
          setPlatformRefundPolicy(settings.refund_policy);
        }
      } catch (e) {
        console.error('Failed to load platform refund policy:', e);
      }
    };
    loadPolicy();
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      if (active) {
        loadPolicy();
      }
    }, 10000);
    
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Load full product from supplier backend so this matches supplier preview.
  useEffect(() => {
    if (!productId) return;
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSupplierProductById(productId);
        if (!active) return;
        setProduct(data);
        
        // Check if product has custom cancellation policy
        if (data?.cancellation_policy) {
          setUsePlatformPolicy(false);
        }
      } catch (e) {
        if (!active) return;
        console.error('Failed to load product detail', e);
        setError('Unable to load product detail right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [productId]);

  // Whenever we have a product, initialise the edit form snapshot
  useEffect(() => {
    if (!product) return;
    const gallery = Array.isArray(product.gallery_images)
      ? product.gallery_images
      : Array.isArray(product.images)
      ? product.images
      : [];

    const incExc = product.included_excluded || {};
    const pickupDrop = product.pickup_dropoff || {};

    // Convert platform refund policy to cancellation policy format if needed
    const cancellationPolicy = product.cancellation_policy || null;
    let cancellationPolicyForm = null;
    
    if (cancellationPolicy) {
      // Product has custom policy
      cancellationPolicyForm = {
        freeCancellationText: cancellationPolicy.free_cancellation_text || cancellationPolicy.freeCancellationText || '',
        schedule: (cancellationPolicy.schedule || []).map(tier => ({
          label: tier.label || '',
          percentage: tier.percentage || 0,
          note: tier.note || ''
        })),
        notes: cancellationPolicy.notes || []
      };
    }

    setEditForm({
      title: product.title || '',
      subtitle: product.tagline || '',
      description: product.description || '',
      tourDescription: product.description || '',
      heroImage: product.hero_image || gallery[0] || '',
      galleryImagesText: gallery.join('\n'),
      duration: product.duration || '',
      pickupLocation: pickupDrop.pickup_location || '',
      dropoffLocation: pickupDrop.dropoff_location || '',
      guideType: product.guide_type || '',
      activityType: product.activity_type || '',
      thingsToCarry: (product.things_to_carry || []).join(', '),
      languages: (product.languages || []).join(', '),
      includedItems: (incExc.included || []).join('\n'),
      excludedItems: (incExc.excluded || []).join('\n'),
      availableDays: ((pickupDrop.available_days || [])).join(', '),
      timeSlots: ((pickupDrop.available_time_slots || pickupDrop.time_slots_by_day && Object.values(pickupDrop.time_slots_by_day || {}).flat()) || []).join(', '),
      price: product.price != null ? String(product.price) : '',
      priceUnit: product.price_unit || '',
      cancellationPolicy: cancellationPolicyForm,
      usePlatformPolicy: !cancellationPolicy,
    });
  }, [product, platformRefundPolicy]);

  const splitComma = (value) =>
    value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

  const splitLines = (value) =>
    value
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean);

  const handleSaveEdits = async () => {
    if (!product || !editForm) return;
    try {
      setEditSaving(true);
      setError(null);

      const updated = { ...product };

      updated.title = editForm.title.trim();
      updated.tagline = editForm.subtitle.trim();
      updated.description = editForm.description.trim();

      // Images
      const galleryImages = splitLines(editForm.galleryImagesText || '');
      updated.hero_image = editForm.heroImage || galleryImages[0] || updated.hero_image || '';
      updated.gallery_images = galleryImages;

      // Duration
      updated.duration = editForm.duration.trim() || updated.duration;

      // Pickup / dropoff
      updated.pickup_dropoff = {
        ...(updated.pickup_dropoff || {}),
        pickup_location: editForm.pickupLocation.trim(),
        dropoff_location: editForm.dropoffLocation.trim(),
        available_days: splitComma(editForm.availableDays || ''),
        available_time_slots: splitComma(editForm.timeSlots || ''),
      };

      // Guide / activity / languages / things to carry
      updated.guide_type = editForm.guideType.trim();
      updated.activity_type = editForm.activityType.trim();
      updated.languages = splitComma(editForm.languages || '');
      updated.things_to_carry = splitComma(editForm.thingsToCarry || '');

      // Included / excluded
      updated.included_excluded = {
        ...(updated.included_excluded || {}),
        included: splitLines(editForm.includedItems || ''),
        excluded: splitLines(editForm.excludedItems || ''),
      };

      // Pricing
      const priceNum = parseFloat(editForm.price);
      updated.price = Number.isFinite(priceNum) ? priceNum : updated.price;
      updated.price_unit = editForm.priceUnit.trim() || updated.price_unit;

      // Cancellation/Refund Policy
      if (editForm.usePlatformPolicy && platformRefundPolicy) {
        // Convert platform refund policy to cancellation policy format
        updated.cancellation_policy = {
          free_cancellation_text: platformRefundPolicy.free_cancellation_until 
            ? `Free cancellation until ${platformRefundPolicy.free_cancellation_until}`
            : null,
          schedule: (platformRefundPolicy.tiers || []).map(tier => ({
            label: tier.label || `${tier.percentage}% Refund`,
            percentage: tier.percentage || 0,
            note: tier.label || ''
          })),
          notes: platformRefundPolicy.notes || []
        };
      } else if (editForm.cancellationPolicy) {
        // Use custom cancellation policy
        updated.cancellation_policy = {
          free_cancellation_text: editForm.cancellationPolicy.freeCancellationText || null,
          schedule: (editForm.cancellationPolicy.schedule || []).filter(tier => tier.percentage !== undefined || tier.label),
          notes: editForm.cancellationPolicy.notes || []
        };
      } else if (!editForm.usePlatformPolicy) {
        // Clear cancellation policy if not using platform and no custom policy
        updated.cancellation_policy = null;
      }

      const saved = await updateSupplierProductById(product.id, updated);
      setProduct(saved);
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save product edits', e);
      setError('Failed to save changes. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  const {
    title,
    subtitle,
    mainImg,
    rightTopImg,
    rightBottomImg,
    description,
    tourDescription,
    highlights,
    galleryImages,
    tripDetails,
    included,
    excluded,
    duration,
    priceLabel,
    pickup,
    dropoff,
    pickupTime,
    dropoffSameAsPickup,
    availableDays,
    selectedDay,
    timeSlots,
    faqs,
    vehicleDetails,
    itinerary,
    commissionPercentLabel,
    adminEarningsLabel,
  } = useMemo(() => {
    if (!product) {
      return {
        title: '',
        subtitle: '',
        mainImg: '',
        rightTopImg: '',
        rightBottomImg: '',
        description: '',
        tourDescription: '',
        highlights: [],
        galleryImages: [],
        tripDetails: {
          guideType: '',
          accessibility: '',
          thingsToCarry: [],
          activityType: '',
          languages: '',
        },
        included: [],
        excluded: [],
        duration: '',
        priceLabel: '',
        pickup: '',
        dropoff: '',
        availableDays: [],
        timeSlots: [],
        faqs: [],
        vehicleDetails: '',
        itinerary: [],
        commissionPercentLabel: '',
        adminEarningsLabel: '-',
      };
    }

    const customFields = product.custom_fields || {};
    const imgs =
      (Array.isArray(product.gallery_images) && product.gallery_images.length
        ? product.gallery_images
        : Array.isArray(product.images)
        ? product.images
        : []) || [];
    const hero = product.hero_image || imgs[0] || '';
    const rightTop = imgs[1] || imgs[0] || hero;
    const rightBottom = imgs[2] || imgs[1] || hero;

    const incExc = product.included_excluded || customFields.included_excluded || {};
    const pickupDrop = product.pickup_dropoff || {};

    // Derive pickup / dropoff / days / time slots similar to supplier preview logic.
    // Support both snake_case (stored on Product.pickup_dropoff) and camelCase keys
    // that may live under custom_fields (e.g. pickupLocations, dropoffLocations).
    const cfPickupLocs =
      (Array.isArray(customFields.pickup_locations) && customFields.pickup_locations.length
        ? customFields.pickup_locations
        : Array.isArray(customFields.pickupLocations) && customFields.pickupLocations.length
        ? customFields.pickupLocations
        : []) || [];

    const cfDropoffLocs =
      (Array.isArray(customFields.dropoff_locations) && customFields.dropoff_locations.length
        ? customFields.dropoff_locations
        : Array.isArray(customFields.dropoffLocations) && customFields.dropoffLocations.length
        ? customFields.dropoffLocations
        : []) || [];

    let pickupLocations =
      (cfPickupLocs.length
        ? cfPickupLocs
        : Array.isArray(pickupDrop.pickup_locations) && pickupDrop.pickup_locations.length
        ? pickupDrop.pickup_locations
        : Array.isArray(pickupDrop.pickupLocations) && pickupDrop.pickupLocations.length
        ? pickupDrop.pickupLocations
        : pickupDrop.pickup_location
        ? [pickupDrop.pickup_location]
        : []) || [];

    let dropoffLocations =
      (cfDropoffLocs.length
        ? cfDropoffLocs
        : Array.isArray(pickupDrop.dropoff_locations) && pickupDrop.dropoff_locations.length
        ? pickupDrop.dropoff_locations
        : Array.isArray(pickupDrop.dropoffLocations) && pickupDrop.dropoffLocations.length
        ? pickupDrop.dropoffLocations
        : pickupDrop.dropoff_location
        ? [pickupDrop.dropoff_location]
        : pickupLocations) || [];

    // Fallback: derive locations from pickup_configurations if still empty
    if ((!pickupLocations || pickupLocations.length === 0) && Array.isArray(pickupDrop.pickup_configurations)) {
      const locs = [];
      const seen = new Set();
      pickupDrop.pickup_configurations.forEach((config) => {
        if (Array.isArray(config.pickupLocations) && config.pickupLocations.length) {
          config.pickupLocations.forEach((loc) => {
            if (loc && !seen.has(loc)) {
              seen.add(loc);
              locs.push(loc);
            }
          });
        } else if (typeof config.pickup_location === 'string' && config.pickup_location.trim()) {
          const parts = config.pickup_location
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
          parts.forEach((loc) => {
            if (!seen.has(loc)) {
              seen.add(loc);
              locs.push(loc);
            }
          });
        }
      });
      if (locs.length) {
        pickupLocations = locs;
      }
    }

    if ((!dropoffLocations || dropoffLocations.length === 0) && Array.isArray(pickupDrop.pickup_configurations)) {
      const locs = [];
      const seen = new Set();
      pickupDrop.pickup_configurations.forEach((config) => {
        let raw = null;
        if (Array.isArray(config.dropoffLocations) && config.dropoffLocations.length) {
          raw = config.dropoffLocations;
        } else if (typeof config.dropoff_location === 'string' && config.dropoff_location.trim()) {
          raw = config.dropoff_location
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
        }
        if (!raw || raw.length === 0) {
          // fallback: use pickup locations
          raw = Array.isArray(config.pickupLocations) && config.pickupLocations.length
            ? config.pickupLocations
            : typeof config.pickup_location === 'string'
            ? config.pickup_location.split(',').map((p) => p.trim()).filter(Boolean)
            : [];
        }
        raw.forEach((loc) => {
          if (loc && !seen.has(loc)) {
            seen.add(loc);
            locs.push(loc);
          }
        });
      });
      if (locs.length) {
        dropoffLocations = locs;
      }
    }

    const availableDays =
      (Array.isArray(customFields.available_days) && customFields.available_days.length
        ? customFields.available_days
        : Array.isArray(customFields.availableDays) && customFields.availableDays.length
        ? customFields.availableDays
        : Array.isArray(pickupDrop.available_days)
        ? pickupDrop.available_days
        : Array.isArray(pickupDrop.availableDays)
        ? pickupDrop.availableDays
        : []) || [];

    let timeSlots = [];
    const cfTimeSlots = customFields.time_slots || customFields.timeSlots;
    if (cfTimeSlots) {
      if (Array.isArray(cfTimeSlots)) {
        timeSlots = cfTimeSlots;
      } else if (typeof cfTimeSlots === 'object') {
        timeSlots = Object.values(cfTimeSlots).flat();
      }
    } else if (Array.isArray(pickupDrop.available_time_slots)) {
      timeSlots = pickupDrop.available_time_slots;
    } else if (Array.isArray(pickupDrop.timeSlots)) {
      timeSlots = pickupDrop.timeSlots;
    }

    // Guide type: from product or custom fields
    const guideType =
      product.guide_type ||
      customFields.guideType ||
      customFields.selectedGuideType ||
      '';

    // Activity type: from product or custom fields
    const activityType =
      product.activity_type ||
      customFields.activityType ||
      customFields.selectedActivityType ||
      '';

    // Languages: prefer product.languages, fall back to custom fields or legacy single language
    const rawLanguages =
      (Array.isArray(product.languages) && product.languages.length
        ? product.languages
        : Array.isArray(customFields.selectedLanguages) && customFields.selectedLanguages.length
        ? customFields.selectedLanguages
        : Array.isArray(customFields.languages) && customFields.languages.length
        ? customFields.languages
        : product.language
        ? [product.language]
        : []) || [];
    const languagesLabel = rawLanguages.join(', ');

    // Things to carry: prefer product.things_to_carry, fall back to custom fields
    const rawThingsToCarry =
      (Array.isArray(product.things_to_carry) && product.things_to_carry.length
        ? product.things_to_carry
        : Array.isArray(customFields.selectedThingsToCarry) && customFields.selectedThingsToCarry.length
        ? customFields.selectedThingsToCarry
        : Array.isArray(customFields.things_to_carry) && customFields.things_to_carry.length
        ? customFields.things_to_carry
        : []) || [];

    // Build display string like "Camera, Shoes, +2 more"
    let thingsToCarryLabel = '';
    if (rawThingsToCarry.length <= 3) {
      thingsToCarryLabel = rawThingsToCarry.join(', ');
    } else {
      const head = rawThingsToCarry.slice(0, 3).join(', ');
      const remaining = rawThingsToCarry.length - 3;
      thingsToCarryLabel = `${head}, +${remaining} more`;
    }

    // Accessibility: derive human readable text from flags / toggles.
    // If supplier did not publish any accessibility info, leave this EMPTY (no placeholder),
    // so the admin view only shows real data.
    const acc = product.accessibility || customFields.accessibility || customFields.accessibilityToggles;
    let accessibilityLabel = '';
    if (acc && typeof acc === 'object') {
      const parts = [];
      if (acc.wheelchair_accessible || acc.wheelchair) parts.push('Wheelchair accessible');
      if (acc.stroller_friendly || acc.stroller) parts.push('Stroller friendly');
      if (acc.service_animals_allowed || acc.serviceAnimals) parts.push('Service animals allowed');
      if (acc.infant_seat_available || acc.infantSeat) parts.push('Infant seat available');
      accessibilityLabel = parts.length ? parts.join(', ') : '';
    } else if (acc) {
      // For legacy string/boolean values, show a generic label, but only if something truthy exists
      accessibilityLabel = 'Accessible';
    } else {
      accessibilityLabel = '';
    }

    // Derive pickup time like supplier preview
    let pickupTime = '';
    const cfPickupTime = customFields.pickup_time || customFields.pickupTime;
    if (cfPickupTime) {
      pickupTime = cfPickupTime;
    } else if (Array.isArray(pickupDrop.pickup_configurations) && pickupDrop.pickup_configurations.length > 0) {
      pickupTime = pickupDrop.pickup_configurations[0].pickup_time || '';
    } else if (pickupDrop.pickup_time) {
      pickupTime = pickupDrop.pickup_time;
    }

    const dropoffSameAsPickup = !dropoffLocations[0] || dropoffLocations[0] === pickupLocations[0];

    // Itinerary: prefer full itineraries from custom_fields, else product.itinerary
    const rawItinerary =
      (Array.isArray(customFields.itineraries_full) && customFields.itineraries_full.length
        ? customFields.itineraries_full
        : Array.isArray(product.itinerary)
        ? product.itinerary
        : []) || [];

    // Vehicle details: prefer full vehicles list from custom_fields
    const vehiclesFull = Array.isArray(customFields.vehicles_full) && customFields.vehicles_full.length
      ? customFields.vehicles_full
      : null;
    const primaryVehicle = vehiclesFull ? vehiclesFull[0] : null;

    let vehicleDetailsLabel = '';
    let vehicleDurationLabel = product.duration || '';
    if (primaryVehicle) {
      const parts = [];
      if (primaryVehicle.title || primaryVehicle.model) {
        parts.push(primaryVehicle.title || primaryVehicle.model);
      }
      if (primaryVehicle.year) {
        parts.push(`${primaryVehicle.year} model`);
      }
      if (primaryVehicle.description) {
        parts.push(primaryVehicle.description);
      }
      if (primaryVehicle.capacity) {
        parts.push(`Best for up to ${primaryVehicle.capacity} travelers`);
      }
      vehicleDetailsLabel = parts.join(' • ');
      if (primaryVehicle.duration) {
        vehicleDurationLabel = primaryVehicle.duration;
      }
    } else if (product.vehicle_details) {
      const vd = product.vehicle_details;
      const parts = [];
      if (vd.vehicle_model) parts.push(vd.vehicle_model);
      if (vd.vehicle_year) parts.push(`${vd.vehicle_year} model`);
      if (vd.capacity) parts.push(`Best for up to ${vd.capacity} travelers`);
      vehicleDetailsLabel = parts.join(' • ');
    }

    const selectedDay = availableDays[0] || '';

    // Commission: admin earns 25%, supplier keeps 75%
    const COMMISSION_RATE = 0.25;
    const commissionPercentLabel = `${Math.round(COMMISSION_RATE * 100)}%`;
    const basePrice = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
    const adminEarningsLabel =
      basePrice && !Number.isNaN(basePrice)
        ? `$${(basePrice * COMMISSION_RATE).toFixed(2)} Per Booking`
        : '-';

    return {
      title: product.title || '',
      subtitle: product.tagline || '',
      mainImg: hero,
      rightTopImg: rightTop,
      rightBottomImg: rightBottom,
      description: product.description || '',
      tourDescription: product.description || '',
      highlights: (product.highlights || []).map((h) => h.text || h),
      galleryImages: imgs,
      tripDetails: {
        guideType,
        accessibility: accessibilityLabel,
        thingsToCarry: rawThingsToCarry,
        thingsToCarryLabel,
        activityType,
        languages: languagesLabel,
      },
      included:
        (Array.isArray(incExc?.included) && incExc.included.length
          ? incExc.included
          : Array.isArray(customFields?.includedItems)
          ? customFields.includedItems
          : Array.isArray(customFields?.included)
          ? customFields.included
          : []),
      excluded:
        (Array.isArray(incExc?.excluded) && incExc.excluded.length
          ? incExc.excluded
          : Array.isArray(customFields?.excludedItems)
          ? customFields.excludedItems
          : Array.isArray(customFields?.excluded)
          ? customFields.excluded
          : []),
      duration: vehicleDurationLabel,
      priceLabel: product.price
        ? `$ ${product.price.toFixed(2)} ${product.price_unit || ''}`.trim()
        : '',
      pickup: pickupLocations[0] || '',
      dropoff: dropoffLocations[0] || '',
      pickupTime,
      dropoffSameAsPickup,
      availableDays,
      selectedDay,
      timeSlots,
      faqs: (product.faqs || []).map((f) => ({ q: f.question, a: f.answer })),
      vehicleDetails: vehicleDetailsLabel,
      itinerary: rawItinerary,
      commissionPercentLabel,
      adminEarningsLabel,
    };
  }, [product]);

  return (
    <>
    <div className="min-h-screen bg-gray-50 px-0 py-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="mx-auto">
        {/* Top bar: Back (left) + action buttons (right) */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {onBack && (
              <button onClick={onBack} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100">Back</button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {fromRequestToApprove && (
              <>
                <button
                  className="px-6 py-2.5 rounded-full text-white font-medium text-sm"
                  style={{ backgroundColor: '#284078', opacity: approvalSaving ? 0.7 : 1 }}
                  disabled={approvalSaving || !productId}
                  onClick={async () => {
                    if (!productId) return;
                    setApprovalSaving(true);
                    try {
                      await adminProductService.approveProduct(productId);
                      alert('✅ Product approved. It will now appear on the customer platform.');
                      if (onBack) onBack();
                    } catch (e) {
                      console.error('Approve failed', e);
                      alert('Failed to approve product.');
                    } finally {
                      setApprovalSaving(false);
                    }
                  }}
                >
                  {approvalSaving ? 'Approving…' : 'Approve'}
                </button>
                <button
                  className="px-6 py-2.5 rounded-full text-white font-medium text-sm"
                  style={{ backgroundColor: '#b91c1c', opacity: approvalSaving ? 0.7 : 1 }}
                  disabled={approvalSaving || !productId}
                  onClick={async () => {
                    if (!productId) return;
                    const reason = window.prompt('Rejection reason (optional):') || '';
                    setApprovalSaving(true);
                    try {
                      await adminProductService.rejectProduct(productId, reason);
                      alert('✅ Product rejected. It will not appear on the customer platform.');
                      if (onBack) onBack();
                    } catch (e) {
                      console.error('Reject failed', e);
                      alert('Failed to reject product.');
                    } finally {
                      setApprovalSaving(false);
                    }
                  }}
                >
                  {approvalSaving ? 'Working…' : 'Reject'}
                </button>
              </>
            )}
            {product && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm rounded-lg border border-green-600 text-green-700 hover:bg-green-50"
              >
                Edit content
              </button>
            )}
            {product && isEditing && (
              <button
                onClick={handleSaveEdits}
                disabled={editSaving}
                className="px-4 py-2 text-sm rounded-lg border border-green-600 text-white"
                style={{ backgroundColor: '#16a34a', opacity: editSaving ? 0.7 : 1 }}
              >
                {editSaving ? 'Saving…' : 'Done'}
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb + static header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-green-700 text-xl">
            <span className="font-medium">Suppliers</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800">{product?.supplier_id || ''}</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800">Products</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800">Detail</span>
          </div>
        </div>

        {loading && (
          <div className="mb-4 text-sm text-gray-500">Loading product details...</div>
        )}
        {error && !loading && (
          <div className="mb-4 text-sm text-red-500">{error}</div>
        )}

        {!isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Left Column (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                {/* Main Large Image */}
                <div className="row-span-2">
                  <img 
                    src={mainImg}
                    alt={title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                {/* Top Right Image */}
                <div>
                  <img 
                    src={rightTopImg}
                    alt={title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
                {/* Bottom Right Image */}
                <div>
                  <img 
                    src={rightBottomImg}
                    alt={title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              </div>
              {/* Description Box */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-800">{description}</p>
              </div>
            </div>

            {/* Tour Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Mountain className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Tour Description</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{tourDescription}</p>
            </div>

            {/* Tour Highlights */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900">Tour Highlights</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {highlights.map((highlight, idx) => {
                  const icons = [Mountain, Camera, Car, Globe];
                  const colors = [
                    { bg: 'bg-red-50', text: 'text-red-500' },
                    { bg: 'bg-green-50', text: 'text-green-500' },
                    { bg: 'bg-orange-50', text: 'text-orange-500' },
                    { bg: 'bg-blue-50', text: 'text-blue-500' }
                  ];
                  const Icon = icons[idx % icons.length];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center ${color.bg} rounded-lg flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color.text}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{highlight}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Camera className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Photo Gallery</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {galleryImages.map((src, i) => (
                  <img key={i} src={src} alt={`Gallery ${i+1}`} className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Mountain className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Trip Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-8">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Guide Type</h3>
                    <p className="text-sm text-gray-600">{tripDetails.guideType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Accessibility</h3>
                    <p className="text-sm text-gray-600">{tripDetails.accessibility}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Things to Carry</h3>
                    <div className="flex flex-wrap gap-2">
                      {(tripDetails.thingsToCarry || []).map((t) => (
                        <span key={t} className="text-xs text-gray-600">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Activity Type</h3>
                    <p className="text-sm text-gray-600">{tripDetails.activityType}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-8">
                <Globe className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Languages</h3>
                  <p className="text-sm text-gray-600">{tripDetails.languages}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Included</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {included.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Excluded</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {excluded.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Vehicle & Pricing */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Car className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Vehicle & Pricing</h2>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Vehicle Details</h3>
                    <p className="text-sm text-gray-600">{vehicleDetails}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Duration</h3>
                      <p className="text-sm text-gray-600">{duration}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Pricing</h3>
                    <p className="text-xl font-bold text-green-600">{priceLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pick-up & Drop-off */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-gray-900">Pick-up & Drop-off Location</h2>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Pick-up</h3>
                  <p className="text-sm text-gray-600 mb-1">• {pickup || '—'}</p>
                  <p className="text-sm text-gray-500">Time: {pickupTime || '--:--'}</p>
                  <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-3">Drop-off</h3>
                  <p className="text-sm text-gray-600">• {dropoffSameAsPickup ? 'Same as Pick-up' : (dropoff || '—')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Days</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {availableDays.length > 0 ? (
                      availableDays.map((day, idx) => (
                        <span
                          key={idx}
                          className={`px-4 py-2 text-sm rounded-lg font-medium ${
                            day === selectedDay
                              ? 'bg-blue-900 text-white'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {day}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No day selected</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Days</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {availableDays.map((day, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 text-sm rounded-lg font-medium bg-gray-100 text-gray-600"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Time Slots{selectedDay ? ` (${selectedDay})` : ''}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((time) => (
                      <span
                        key={time}
                        className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-6">
                {faqs.map((faq, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-sm text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Ready to Go Live Card */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-green-700">Ready to Go Live</h3>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-700">All requirements met</span>
                <span className="text-sm font-semibold text-green-700">{commissionPercentLabel}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-700">Commission Rate</span>
                <span className="text-sm font-semibold text-green-700">{commissionPercentLabel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Your Earnings</span>
                <span className="text-sm font-semibold text-green-700">{adminEarningsLabel}</span>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-purple-700">Next Steps</h3>
              </div>
              <ul className="space-y-2">
                <li className="text-sm text-purple-700">• Review all details above</li>
                <li className="text-sm text-purple-700">• Use Quick Actions to proceed</li>
                <li className="text-sm text-purple-700">• Monitor performance after publishing</li>
              </ul>
            </div>

            {/* Cancellation & Refund Policy Card */}
            {(product?.cancellation_policy || (platformRefundPolicy && !product?.cancellation_policy)) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Cancellation & Refund Policy</h3>
                </div>
                {(() => {
                  const policy = product?.cancellation_policy || (platformRefundPolicy ? {
                    free_cancellation_text: platformRefundPolicy.free_cancellation_until 
                      ? `Free cancellation until ${platformRefundPolicy.free_cancellation_until}`
                      : null,
                    schedule: (platformRefundPolicy.tiers || []).map(tier => ({
                      label: tier.label || `${tier.percentage}% Refund`,
                      percentage: tier.percentage || 0,
                      note: tier.label || ''
                    })),
                    notes: platformRefundPolicy.notes || []
                  } : null);
                  
                  if (!policy) return null;
                  
                  return (
                    <div className="space-y-4">
                      {policy.free_cancellation_text && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-semibold text-green-700">{policy.free_cancellation_text}</p>
                        </div>
                      )}
                      
                      {Array.isArray(policy.schedule) && policy.schedule.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Refund Schedule</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {policy.schedule.map((tier, idx) => (
                              <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                  {tier.percentage}%
                                </div>
                                <div className="text-xs font-semibold text-gray-900">{tier.label || 'Refund'}</div>
                                {tier.note && (
                                  <div className="text-xs text-gray-600 mt-1">{tier.note}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {Array.isArray(policy.notes) && policy.notes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Policy Notes</h4>
                          <ul className="space-y-1">
                            {policy.notes.map((note, idx) => (
                              <li key={idx} className="text-sm text-gray-600">• {note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {!product?.cancellation_policy && platformRefundPolicy && (
                        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500">
                          Using platform default policy (updates automatically)
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Itinerary Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Itinerary</h3>
              </div>
              {(!itinerary || itinerary.length === 0) ? (
                <p className="text-sm text-gray-500">No itinerary added for this product.</p>
              ) : (
                <div className="space-y-4">
                  {itinerary.map((item, idx) => {
                    const timeLabel = item.time || item.timeSpent || `Stop ${idx + 1}`;
                    // Prefer placeName like supplier preview, then title, then location
                    const titleLabel = item.placeName || item.title || item.location || `Experience ${idx + 1}`;
                    const descLabel = item.description || '';
                    const attraction = item.attractionType || '';
                    const isFree = item.isFree;
                    const durationLabel = item.timeSpent || '';

                    return (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-300 overflow-hidden bg-blue-100">
                            <span className="text-blue-600 text-xs font-bold">{timeLabel}</span>
                    </div>
                    <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{titleLabel}</h4>
                            </div>
                            {descLabel && (
                              <p className="text-gray-600 text-xs mt-1 mb-1">{descLabel}</p>
                            )}
                            {attraction && (
                              <p className="text-gray-500 text-xs mb-2">{attraction}</p>
                            )}
                            <div className="flex items-center space-x-2">
                              {isFree !== undefined && (
                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                                  {isFree ? 'Free' : 'Paid'}
                                </span>
                              )}
                              {durationLabel && (
                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                                  {durationLabel}
                      </span>
                              )}
                            </div>
                          </div>
                    </div>
                  </div>
                    );
                  })}
              </div>
              )}
            </div>
          </div>
        </div>
        )}

        {isEditing && editForm && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 mt-4 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Edit All Content</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Main Title</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.subtitle}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                  <textarea
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Main Image URL</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.heroImage}
                    onChange={(e) => setEditForm({ ...editForm, heroImage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Gallery Images (one URL per line)</label>
                  <textarea
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    value={editForm.galleryImagesText}
                    onChange={(e) => setEditForm({ ...editForm, galleryImagesText: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Duration</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Pick-up Location</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.pickupLocation}
                    onChange={(e) => setEditForm({ ...editForm, pickupLocation: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Drop-off Location</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.dropoffLocation}
                    onChange={(e) => setEditForm({ ...editForm, dropoffLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Guide Type</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.guideType}
                    onChange={(e) => setEditForm({ ...editForm, guideType: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Activity Type</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.activityType}
                    onChange={(e) => setEditForm({ ...editForm, activityType: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Things to Carry (comma separated)</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.thingsToCarry}
                    onChange={(e) => setEditForm({ ...editForm, thingsToCarry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.languages}
                    onChange={(e) => setEditForm({ ...editForm, languages: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Included Items (one per line)</label>
                  <textarea
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.includedItems}
                    onChange={(e) => setEditForm({ ...editForm, includedItems: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Excluded Items (one per line)</label>
                  <textarea
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.excludedItems}
                    onChange={(e) => setEditForm({ ...editForm, excludedItems: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Available Days (comma separated)</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.availableDays}
                    onChange={(e) => setEditForm({ ...editForm, availableDays: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Time Slots (comma separated)</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={editForm.timeSlots}
                    onChange={(e) => setEditForm({ ...editForm, timeSlots: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Price</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Price Unit (e.g. "Per Person")</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={editForm.priceUnit}
                      onChange={(e) => setEditForm({ ...editForm, priceUnit: e.target.value })}
                    />
                  </div>
                </div>

                {/* Cancellation & Refund Policy Section */}
                <div className="col-span-2 mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Cancellation & Refund Policy</h3>
                  
                  {/* Use Platform Policy Toggle */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.usePlatformPolicy}
                        onChange={(e) => {
                          setEditForm({
                            ...editForm,
                            usePlatformPolicy: e.target.checked,
                            cancellationPolicy: e.target.checked ? null : (editForm.cancellationPolicy || {
                              freeCancellationText: '',
                              schedule: [],
                              notes: []
                            })
                          });
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Use Platform Default Policy
                      </span>
                    </label>
                    {editForm.usePlatformPolicy && platformRefundPolicy && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium mb-2">Current Platform Policy:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {platformRefundPolicy.tiers?.map((tier, idx) => (
                            <div key={idx} className="text-xs text-blue-600">
                              <span className="font-semibold">{tier.percentage}%</span> - {tier.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom Policy Editor */}
                  {!editForm.usePlatformPolicy && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Free Cancellation Text (optional)
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          value={editForm.cancellationPolicy?.freeCancellationText || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            cancellationPolicy: {
                              ...(editForm.cancellationPolicy || { schedule: [], notes: [] }),
                              freeCancellationText: e.target.value
                            }
                          })}
                          placeholder="e.g., Free cancellation until 24 hours before tour"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Policy Notes (one per line)
                        </label>
                        <textarea
                          rows={3}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                          value={(editForm.cancellationPolicy?.notes || []).join('\n')}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            cancellationPolicy: {
                              ...(editForm.cancellationPolicy || { freeCancellationText: '', schedule: [] }),
                              notes: e.target.value.split('\n').filter(n => n.trim())
                            }
                          })}
                          placeholder="Enter policy notes, one per line"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">
                          Refund Schedule Tiers
                        </label>
                        <div className="space-y-2">
                          {(editForm.cancellationPolicy?.schedule || []).map((tier, idx) => (
                            <div key={idx} className="flex gap-2 items-center p-2 border rounded">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-20 border rounded px-2 py-1 text-sm"
                                value={tier.percentage || 0}
                                onChange={(e) => {
                                  const newSchedule = [...(editForm.cancellationPolicy?.schedule || [])];
                                  newSchedule[idx] = { ...tier, percentage: parseInt(e.target.value) || 0 };
                                  setEditForm({
                                    ...editForm,
                                    cancellationPolicy: {
                                      ...(editForm.cancellationPolicy || { freeCancellationText: '', notes: [] }),
                                      schedule: newSchedule
                                    }
                                  });
                                }}
                                placeholder="%"
                              />
                              <input
                                type="text"
                                className="flex-1 border rounded px-2 py-1 text-sm"
                                value={tier.label || ''}
                                onChange={(e) => {
                                  const newSchedule = [...(editForm.cancellationPolicy?.schedule || [])];
                                  newSchedule[idx] = { ...tier, label: e.target.value };
                                  setEditForm({
                                    ...editForm,
                                    cancellationPolicy: {
                                      ...(editForm.cancellationPolicy || { freeCancellationText: '', notes: [] }),
                                      schedule: newSchedule
                                    }
                                  });
                                }}
                                placeholder="Label (e.g., 03 days before Tour)"
                              />
                              <button
                                onClick={() => {
                                  const newSchedule = (editForm.cancellationPolicy?.schedule || []).filter((_, i) => i !== idx);
                                  setEditForm({
                                    ...editForm,
                                    cancellationPolicy: {
                                      ...(editForm.cancellationPolicy || { freeCancellationText: '', notes: [] }),
                                      schedule: newSchedule
                                    }
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              setEditForm({
                                ...editForm,
                                cancellationPolicy: {
                                  ...(editForm.cancellationPolicy || { freeCancellationText: '', notes: [] }),
                                  schedule: [...(editForm.cancellationPolicy?.schedule || []), { percentage: 0, label: '', note: '' }]
                                }
                              });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Add Tier
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
   
    </div>
       
    </>
  );
};

export default TourDetailPage;

