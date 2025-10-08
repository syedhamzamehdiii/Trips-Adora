// Route constants
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCTS_CREATE: '/products/create',
  PRODUCTS_EDIT: '/products/edit',
  PRODUCTS_DETAIL: '/products/detail',
  ORDERS: '/orders',
  MESSAGES: '/messages',
  SETTINGS: '/settings',
  PARTNERS: '/partners',
}

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8000',
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

