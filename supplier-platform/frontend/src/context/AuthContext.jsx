// Frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import authService from '@/services/authService'
import googleAuthService from '@/services/googleAuthService'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Initialize Google Auth
      await googleAuthService.initGoogleAuth()
      
      // Check if user is already authenticated
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Failed to get current user:', error)
          // Token might be invalid, clear it
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      const result = await authService.login(credentials)
      
      if (result.success) {
        setUser(result.user)
        return { success: true }
      }
      
      throw new Error('Login failed')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const result = await authService.register(userData)
      
      if (result.success) {
        setUser(result.user)
        return { success: true }
      }
      
      throw new Error('Registration failed')
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async () => {
    // Use OAuth redirect flow (simpler and more reliable)
    // Use the exact redirect URI that's configured in Google Cloud Console
    const redirectUri = 'http://localhost:5173/auth/google/callback';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleAuthService.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=offline`;
    
    // Redirect to Google OAuth
    window.location.href = googleAuthUrl;
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
