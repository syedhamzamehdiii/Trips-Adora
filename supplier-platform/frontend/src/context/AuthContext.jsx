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
    // Set a maximum timeout to ensure loading always resolves
    const maxTimeout = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing loading to false')
      setLoading(false)
    }, 5000) // 5 second maximum timeout

    try {
      // Initialize Google Auth with timeout (non-blocking)
      // Don't wait for it if it takes too long - it's not critical for initial load
      const googleAuthPromise = googleAuthService.initGoogleAuth().catch(err => {
        console.warn('Google Auth initialization failed or timed out:', err)
        // Continue without Google Auth - it's not critical for initial load
      })
      
      // Wait max 3 seconds for Google Auth, then continue
      const googleAuthTimeout = new Promise((resolve) => setTimeout(resolve, 3000))
      await Promise.race([googleAuthPromise, googleAuthTimeout])
      
      // Check if user is already authenticated
      const token = localStorage.getItem('access_token')
      if (token && authService.isAuthenticated()) {
        try {
          // Add timeout to API call to prevent hanging
          const userDataPromise = authService.getCurrentUser()
          const apiTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API request timeout')), 3000)
          )
          
          const userData = await Promise.race([userDataPromise, apiTimeout])
          
          if (userData) {
            persistSupplierId(userData?.supplier_code)
            setUser(userData)
          } else {
            // No user data returned, clear tokens
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            setUser(null)
          }
        } catch (error) {
          console.error('Failed to get current user:', error)
          // Token might be invalid or backend is down, clear it
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setUser(null)
        }
      } else {
        // No token, set user to null
        setUser(null)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setUser(null)
    } finally {
      clearTimeout(maxTimeout)
      setLoading(false)
    }
  }

  const persistSupplierId = (incomingSupplierId) => {
    try {
      let supplierId = (incomingSupplierId || '').trim()
      if (!supplierId) {
        supplierId = localStorage.getItem('supplier_id') || sessionStorage.getItem('supplier_id') || ''
      }
      if (!supplierId) {
        const saved = localStorage.getItem('account_settings') || sessionStorage.getItem('account_settings')
        if (saved) {
          try {
            const data = JSON.parse(saved)
            supplierId =
              data?.profileData?.supplierCode ||
              data?.profileData?.contactValue ||
              ''
          } catch (_) {
            supplierId = ''
          }
        }
      }
      if (!supplierId) {
        return
      }

      localStorage.setItem('supplier_id', supplierId)
      sessionStorage.setItem('supplier_id', supplierId)

      const saved = localStorage.getItem('account_settings') || sessionStorage.getItem('account_settings')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          const updated = {
            ...data,
            profileData: {
              ...(data?.profileData || {}),
              supplierCode: supplierId,
              contactValue: supplierId,
              contactLabel: data?.profileData?.contactLabel || 'Supplier ID'
            }
          }
          const serialized = JSON.stringify(updated)
          localStorage.setItem('account_settings', serialized)
          sessionStorage.setItem('account_settings', serialized)
          window.dispatchEvent(new Event('account_settings_updated'))
        } catch (_) {}
      }
    } catch (_) {}
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      const result = await authService.login(credentials)
      
      if (result.success) {
        persistSupplierId(result.user?.supplier_code)
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
        persistSupplierId(result.user?.supplier_code)
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
      localStorage.removeItem('supplier_id')
      sessionStorage.removeItem('supplier_id')
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
