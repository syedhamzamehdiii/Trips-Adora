// Frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'
import googleAuthService from '../services/googleAuthService'
import profileService from '../services/profileService'

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

  const warmProfileCaches = async (userId) => {
    if (!userId) return
    
    try {
      await Promise.allSettled([
        profileService.getProfileSummary(userId, false),
        profileService.getProfile(userId, false)
      ])
    } catch (error) {
      console.warn('Profile prefetch failed:', error)
    }
  }

  const resolveUserId = (userData) => {
    return (
      userData?.id ||
      userData?.email?.replace('@', '-').replace('.', '-') ||
      localStorage.getItem('customer_profile_user_id') ||
      'customer-user'
    )
  }

  const initializeAuth = async () => {
    const maxTimeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    try {
      const googleInitPromise = googleAuthService.initGoogleAuth().catch(err => {
        console.warn('Google Auth initialization failed:', err)
      })
      const googleInitTimeout = new Promise(resolve => setTimeout(resolve, 3000))
      await Promise.race([googleInitPromise, googleInitTimeout])

      const token = localStorage.getItem('access_token')
      if (token && authService.isAuthenticated()) {
        try {
          const userDataPromise = authService.getCurrentUser()
          const apiTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('API request timeout')), 3000)
          )
          const userData = await Promise.race([userDataPromise, apiTimeout]).catch(err => {
            console.warn('Current user request failed:', err)
            return null
          })

          if (userData) {
            const userId = resolveUserId(userData)
              localStorage.setItem('customer_profile_user_id', userId)
            setUser(userData)
            warmProfileCaches(userId)
          } else {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('customer_profile_user_id')
            setUser(null)
          }
        } catch (error) {
          console.error('Failed to get current user:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('customer_profile_user_id')
          setUser(null)
        }
      } else {
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

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)
      
      if (response.success) {
        const userId = resolveUserId(response.user)
          localStorage.setItem('customer_profile_user_id', userId)
        setUser(response.user)
        warmProfileCaches(userId)
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
      const response = await authService.register(userData)
      
      if (response.success) {
        const userId = resolveUserId(response.user)
          localStorage.setItem('customer_profile_user_id', userId)
        setUser(response.user)
        warmProfileCaches(userId)
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
    // Use dynamic redirect URI based on current origin
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
      await authService.logout()
      googleAuthService.signOut()
      setUser(null)
      localStorage.removeItem('customer_profile_user_id')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      sessionStorage.clear()
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
    isAuthenticated: !!user,
    prefetchProfileData: warmProfileCaches
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

