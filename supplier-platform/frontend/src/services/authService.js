// Authentication Service
import axios from 'axios'
import { config } from '@/config'
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
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
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
        business_name: userData.businessName || userData.fullName,
        phone: userData.phone || null,
        address: userData.address || null,
        country: userData.country || null
      }

      const response = await api.post('/auth/register', backendData)
      const { token, refresh_token, user } = response.data

      // Store tokens
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refresh_token)

      return {
        success: true,
        user,
        token
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      )
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

      return {
        success: true,
        user,
        token: token
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Login failed. Please check your credentials.'
      )
    }
  }

  // Google login with authorization code
  async googleLoginWithCode(code, redirectUri) {
    try {
      const response = await api.post('/auth/google/callback', {
        code,
        redirect_uri: redirectUri
      })

      const { token, refresh_token, user } = response.data

      // Store tokens
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refresh_token)

      return {
        success: true,
        user,
        token: token
      }
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear tokens regardless of API call success
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('access_token')
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem('access_token')
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
        error.response?.data?.message || 
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
        error.response?.data?.message || 
        'Invalid verification code. Please try again.'
      )
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
        error.response?.data?.message || 
        'Failed to send password reset email. Please try again.'
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
        error.response?.data?.message || 
        'Failed to reset password. Please try again.'
      )
    }
  }
}

const authService = new AuthService()
export default authService
