// Admin Auth Service - Simple authentication with hardcoded credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'sirzubair123';
const ADMIN_TOKEN_KEY = 'admin_access_token';

class AdminAuthService {
  // Login with email and password
  async login(email, password) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://admin.tripsadora.com/api';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Invalid email or password');
      }

      const data = await response.json();
      
      // Store token and user info
      if (data.access_token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      }

      return {
        success: true,
        token: data.access_token,
        user: data.user
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Check if user is logged in
  isAuthenticated() {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    return !!token;
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Logout
  logout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('admin_user');
  }

  // Get token
  getToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }
}

const authService = new AdminAuthService();
export default authService;

