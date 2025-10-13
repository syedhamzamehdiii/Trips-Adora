// Frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

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
    // For development/testing, always start with no user to show login screen first
    // In production, you would validate the stored token with the backend
    setUser(null)
    // Clear any existing tokens for fresh start
    localStorage.removeItem('access_token')
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      // Mock login - in real app, this would call your API
      console.log('Login attempt:', credentials)
      
      // Mock login for now - will connect to real backend later
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful login
      const mockUser = {
        id: 'user_123',
        email: credentials.email,
        name: 'Test Supplier',
        role: 'supplier'
      }
      
      setUser(mockUser)
      localStorage.setItem('access_token', 'mock_token_123')
      
      return { success: true }
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
      
      // Mock registration for now - will connect to real backend later
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = {
        id: 'user_123',
        email: userData.email,
        name: userData.fullName,
        role: 'supplier'
      }
      
      setUser(mockUser)
      localStorage.setItem('access_token', 'mock_token_123')
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async () => {
    // Use OAuth redirect flow (simpler and more reliable)
    // Use the current frontend origin for redirect URI
    const redirectUri = window.location.origin + '/auth/google/callback';
    
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
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
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
