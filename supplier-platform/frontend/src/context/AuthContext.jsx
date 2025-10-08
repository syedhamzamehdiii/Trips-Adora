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
      
      // Simulate API call
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
    }
  }

  const register = async (userData) => {
    try {
      // Mock registration - in real app, this would call your API
      console.log('Registration attempt:', userData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful registration
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
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('access_token')
  }

  // Temporary function to clear auth state for testing
  const clearAuth = () => {
    setUser(null)
    localStorage.removeItem('access_token')
    console.log('Authentication cleared - you should now see the login screen')
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    clearAuth,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
