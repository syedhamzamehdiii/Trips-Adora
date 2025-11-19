// Configuration file for the customer platform
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '353190546831-i9oc4kvu61gs3po363k3u646jnbt0mv4.apps.googleusercontent.com',
  GOOGLE_REDIRECT_URI: window.location.origin + '/auth/google/callback',
  
  // App Configuration
  APP_NAME: 'Trips Adora Customer Platform',
  APP_VERSION: '1.0.0',
  
  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  
  // Supplier Platform URL
  SUPPLIER_APP_URL: import.meta.env.VITE_SUPPLIER_APP_URL || 'http://localhost:5173',
}

// Google OAuth configuration
export const googleConfig = {
  clientId: config.GOOGLE_CLIENT_ID,
  redirectUri: config.GOOGLE_REDIRECT_URI,
  scope: 'openid profile email',
  authorizedOrigins: [
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://yourdomain.com'
  ],
  authorizedRedirectUris: [
    'http://localhost:5174',
    'http://localhost:5174/auth/google/callback',
    'http://127.0.0.1:5174',
    'https://yourdomain.com',
    'https://yourdomain.com/auth/google/callback'
  ]
}

