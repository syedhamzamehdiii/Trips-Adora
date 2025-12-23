// Configuration file for the admin platform
export const config = {
  // API Configuration
  // In production these must always point to the public API gateway URLs
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://admin.tripsadora.com/api',
  SUPPLIER_API_BASE_URL: import.meta.env.VITE_SUPPLIER_API_BASE_URL || 'https://supplier.tripsadora.com/api',
  SUPPLIER_ADMIN_TOKEN: import.meta.env.VITE_SUPPLIER_ADMIN_TOKEN || '',
  
  // App Configuration
  APP_NAME: 'Trips Adora Admin Platform',
  APP_VERSION: '1.0.0',
  
  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
};
