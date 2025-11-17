// Authentication Service for Customer Platform
import axios from 'axios'
import { config } from '../config'
import googleAuthService from './googleAuthService'

const API_BASE_URL = config.API_BASE_URL

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken
          })

          const { access_token, refresh_token: newRefreshToken } = response.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', newRefreshToken)

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('customer_profile_user_id')
      }
    }

    return Promise.reject(error)
  }
)

class AuthService {
  // Initialize Google OAuth
  async initGoogleAuth() {
    try {
      await googleAuthService.initGoogleAuth()
      return true
    } catch (error) {
      console.error('Failed to initialize Google OAuth:', error)
      return false
    }
  }

  // Register user
  async register(userData) {
    try {
      // Transform frontend data to backend format
      const backendData = {
        email: userData.email,
        password: userData.password,
        full_name: userData.fullName,
        phone: userData.phone || null,
        address: userData.address || null,
        country: userData.country || null
      }

      const response = await api.post('/auth/register', backendData)
      const { token, refresh_token, user } = response.data

      // Store tokens
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refresh_token)
      
      // Store user ID for profile
      if (user?.id || user?.email) {
        const userId = user.id || user.email?.replace('@', '-').replace('.', '-') || 'customer-user'
        localStorage.setItem('customer_profile_user_id', userId)
      }

      return {
        success: true,
        user,
        token
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle validation errors from backend
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        
        // If it's an array of validation errors
        if (Array.isArray(detail)) {
          const errorMessages = detail.map(err => err.msg || err.message).join(', ')
          throw new Error(errorMessages)
        }
        
        // If it's a string
        if (typeof detail === 'string') {
          throw new Error(detail)
        }
      }
      
      throw new Error('Registration failed. Please try again.')
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, refresh_token, user } = response.data

      // Store tokens
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refresh_token)
      
      // Store user ID for profile
      if (user?.id || user?.email) {
        const userId = user.id || user.email?.replace('@', '-').replace('.', '-') || 'customer-user'
        localStorage.setItem('customer_profile_user_id', userId)
      }

      return {
        success: true,
        user,
        token
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(
        error.response?.data?.detail || 
        'Login failed. Please check your credentials.'
      )
    }
  }

  // Google OAuth login with JWT credential
  async googleLogin(credential) {
    try {
      const response = await api.post('/auth/google', {
        credential
      })
      const { token, refresh_token, user } = response.data

      // Store tokens
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refresh_token)
      
      // Store user ID for profile
      if (user?.id || user?.email) {
        const userId = user.id || user.email?.replace('@', '-').replace('.', '-') || 'customer-user'
        localStorage.setItem('customer_profile_user_id', userId)
      }

      return {
        success: true,
        user,
        token
      }
    } catch (error) {
      console.error('Google login error:', error)
      throw new Error(
        error.response?.data?.detail || 
        'Google login failed. Please try again.'
      )
    }
  }

  // Google OAuth login with authorization code
  async googleLoginWithCode(code, redirectUri = null) {
    try {
      const response = await api.post('/auth/google/callback', {
        code,
        redirect_uri: redirectUri || window.location.origin + '/auth/google/callback'
      })
      const { token, refresh_token, user } = response.data

      // Store tokens
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refresh_token)
      
      // Store user ID for profile
      if (user?.id || user?.email) {
        const userId = user.id || user.email?.replace('@', '-').replace('.', '-') || 'customer-user'
        localStorage.setItem('customer_profile_user_id', userId)
      }

      return {
        success: true,
        user,
        token
      }
    } catch (error) {
      console.error('Google code exchange error:', error)
      throw new Error(
        error.response?.data?.detail || 
        'Google authentication failed. Please try again.'
      )
    }
  }

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear tokens and Google auth
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('customer_profile_user_id')
      googleAuthService.signOut()
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      console.error('Get current user error:', error)
      
      // Handle network errors gracefully
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        console.warn('Network error - backend may not be running')
        return null
      }
      
      // Handle 401 errors (unauthorized)
      if (error.response?.status === 401) {
        console.warn('User not authenticated')
        return null
      }
      
      throw error
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      })

      const { access_token, refresh_token } = response.data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)

      return { access_token, refresh_token }
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      console.error('Forgot password error:', error)
      throw new Error(
        error.response?.data?.detail || 
        'Failed to send reset email. Please try again.'
      )
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword
      })
      return response.data
    } catch (error) {
      console.error('Reset password error:', error)
      throw new Error(
        error.response?.data?.detail || 
        'Failed to reset password. Please try again.'
      )
    }
  }

  // Send verification code
  async sendVerificationCode(email) {
    try {
      const response = await api.post('/auth/send-verification-code', { email })
      return response.data
    } catch (error) {
      console.error('Send verification code error:', error)
      throw new Error(
        error.response?.data?.detail || 
        'Failed to send verification code. Please try again.'
      )
    }
  }

  // Verify code
  async verifyCode(email, code) {
    try {
      const response = await api.post('/auth/verify-code', { email, code })
      return response.data
    } catch (error) {
      console.error('Verify code error:', error)
      throw new Error(
        error.response?.data?.detail || 
        'Invalid verification code. Please try again.'
      )
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('access_token')
    return !!token
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('access_token')
  }

  // Get stored refresh token
  getRefreshToken() {
    return localStorage.getItem('refresh_token')
  }
}

export default new AuthService()

