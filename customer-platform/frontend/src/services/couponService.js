const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tripsadora.com/api/v1';

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to validate coupon');
  }
  return response.json();
};

/**
 * Validate a coupon code
 * @param {string} couponCode - The coupon code to validate
 * @param {number} totalAmount - The total amount before discount (optional, for validation)
 * @returns {Promise<Object>} - Returns coupon details with discount information
 */
export const validateCoupon = async (couponCode, totalAmount = null) => {
  if (!couponCode || !couponCode.trim()) {
    throw new Error('Coupon code is required');
  }

  try {
    // Try to validate via API if backend endpoint exists
    const response = await fetch(
      `${API_BASE_URL}/coupons/validate?code=${encodeURIComponent(couponCode.trim())}${totalAmount ? `&amount=${totalAmount}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // If API endpoint exists and returns success, use it
    if (response.ok) {
      return await handleResponse(response);
    }

    // Fallback to mock validation if API doesn't exist
    return validateCouponMock(couponCode, totalAmount);
  } catch (error) {
    // If API endpoint doesn't exist, use mock validation
    console.warn('Coupon API not available, using mock validation:', error.message);
    return validateCouponMock(couponCode, totalAmount);
  }
};

/**
 * Mock coupon validation (can be replaced with actual API call)
 * This is a fallback when backend API is not available
 */
const validateCouponMock = (couponCode, totalAmount = null) => {
  const code = couponCode.trim().toUpperCase();
  
  // Mock coupon codes - Replace this with actual API call
  const mockCoupons = {
    'WELCOME10': {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minAmount: 0,
      maxDiscount: 50,
      description: '10% off your first booking'
    },
    'SAVE20': {
      code: 'SAVE20',
      discountType: 'percentage',
      discountValue: 20,
      minAmount: 100,
      maxDiscount: 100,
      description: '20% off on orders over $100'
    },
    'FLAT50': {
      code: 'FLAT50',
      discountType: 'fixed',
      discountValue: 50,
      minAmount: 100,
      maxDiscount: null,
      description: '$50 off on orders over $100'
    },
    'SUMMER25': {
      code: 'SUMMER25',
      discountType: 'percentage',
      discountValue: 25,
      minAmount: 0,
      maxDiscount: 200,
      description: '25% off summer special'
    }
  };

  const coupon = mockCoupons[code];

  if (!coupon) {
    throw new Error('Invalid coupon code. Please check and try again.');
  }

  // Validate minimum amount if specified
  if (totalAmount !== null && coupon.minAmount > 0 && totalAmount < coupon.minAmount) {
    throw new Error(`This coupon requires a minimum purchase of $${coupon.minAmount}`);
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (totalAmount || 0) * (coupon.discountValue / 100);
    // Apply max discount if specified
    if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = Math.min(coupon.discountValue, totalAmount || 0);
  }

  return {
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      description: coupon.description,
      minAmount: coupon.minAmount,
      maxDiscount: coupon.maxDiscount
    }
  };
};

export default {
  validateCoupon,
};

