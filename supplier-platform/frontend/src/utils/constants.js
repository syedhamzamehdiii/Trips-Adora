// Route constants
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCTS_EDIT: '/products/edit',
  PRODUCTS_DETAIL: '/products/detail',
  ORDERS: '/orders',
  MESSAGES: '/messages',
  SETTINGS: '/settings',
  SETTINGS_COMPANY_PROFILE: '/settings/company-profile',
  SETTINGS_ACCOUNT: '/settings/account',
  SETTINGS_KEY_INFORMATION: '/settings/key-information',
  SETTINGS_KEY_INFO_FROM_TRAVELLER: '/settings/key-information/from-traveller',
  SETTINGS_KEY_INFO_BY_SUPPLIER: '/settings/key-information/by-supplier',
  SETTINGS_INVITE_PARTNER: '/settings/invite-partner',
  PARTNERS: '/partners',
  INSIGHTS: '/insights',
  FINANCE: '/finance',
  AVAILABILITY: '/availability',
  BOOKINGS: '/bookings',
}

// API endpoints
export const API_ENDPOINTS = {
  // In production this must point to the public supplier API gateway URL
  BASE_URL: 'https://supplier.tripsadora.com/api',
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    PROFILE: '/api/v1/auth/me',
  },
  PRODUCTS: '/api/v1/products',
  ORDERS: '/api/v1/orders',
  MESSAGES: '/api/v1/messages',
}

// Countries list
export const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'RU', label: 'Russia' },
  { value: 'KR', label: 'South Korea' },
]

// Product categories
export const PRODUCT_CATEGORIES = [
  'Tour',
  'Hotel',
  'Transportation',
  'Rent-A Car',
]

// Attraction types
export const ATTRACTION_TYPES = [
  'Sightseeing & Photography',
  'Cultural Visits',
  'Food & Dining',
  'Adventure & Sports',
  'Shopping',
  'Museum & Galleries',
  'Nature & Wildlife',
  'Historical Tour',
]

