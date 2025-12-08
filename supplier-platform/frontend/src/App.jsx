import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { useLoadScript } from '@react-google-maps/api'
import ScrollToTop from './components/common/ScrollToTop'

// Google Maps libraries configuration (defined once to prevent re-loading)
const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry']
const GOOGLE_MAPS_API_KEY = "AIzaSyCVM4pEynAGwWoPR4Nqg76jSXze_9_GE-c"

// Suppress duplicate custom element warnings from Google Maps Platform
if (typeof window !== 'undefined') {
  // Filter out Google Maps Platform duplicate element warnings
  const originalError = console.error;
  console.error = function(...args) {
    const message = args[0]?.toString() || '';
    // Suppress the "Element with name" warnings from Google Maps
    if (message.includes('Element with name') && message.includes('already defined')) {
      return; // Suppress these warnings
    }
    originalError.apply(console, args);
  };

  // Also wrap customElements.define to prevent duplicate registrations
  const originalDefine = window.customElements.define;
  window.customElements.define = function(name, constructor, options) {
    if (!customElements.get(name)) {
      try {
        originalDefine.call(customElements, name, constructor, options);
      } catch (error) {
        // Ignore duplicate definition errors
        if (!error.message?.includes('already been defined')) {
          throw error;
        }
      }
    }
  };
}

// Import pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import GoogleCallback from './pages/Auth/GoogleCallback'
import InvitationAcceptance from './pages/Auth/InvitationAcceptance'
import Dashboard from './pages/Dashboard/Dashboard'
import CreateProductComponent from './components/products/CreateProductComponent'
import Products from './pages/Products/Products'
import DraftsPage from './pages/Products/DraftsPage'
import AddItinerary from './pages/Products/AddItinerary'
import CompanyProfile from './pages/Settings/CompanyProfile'
import AccountSettings from './pages/Settings/AccountSettings'
import InvitePartnerComponent from './components/modals/InvitePartnerComponent'
import ApplicationSubmitted from './pages/Products/ApplicationSubmitted'
import BookingsPage from './pages/Bookings/BookingsPage'
import InsightsPage from './pages/Insights/InsightsPage'
import SupportPage from './pages/Support/SupportPage'
import AvailabilityCalendar from './pages/Availability/AvailabilityCalendar'
import FinancePage from './pages/Finance/FinancePage'
import FAQPage from './pages/FAQPage'
import TermsOfService from './pages/TermsOfService'
import SafetyGuidelinesPage from './pages/SafetyGuidelinesPage'
import DashboardLayout from './layouts/DashboardLayout'
import GlobalCacheSync from './components/GlobalCacheSync'
import ChatPage from './pages/Chat/ChatPage'

// Protected route component that checks verification status
function VerifiedRoute({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  
  useEffect(() => {
    if (isAuthenticated && user && !user.is_verified) {
      const currentUrl = window.location.href
      const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL || 'http://localhost:5174'
      const email = user?.email || ''
      // Pass email as URL parameter so customer platform can access it
      const registrationUrl = email 
        ? `${customerAppUrl}/supplier-registration?email=${encodeURIComponent(email)}`
        : `${customerAppUrl}/supplier-registration`
      
      // Redirect if we're not already on customer platform
      if (!currentUrl.includes('5174') && !currentUrl.includes('supplier-registration')) {
        setShouldRedirect(true)
        window.location.href = registrationUrl
      }
    }
  }, [isAuthenticated, user])
  
  // If not authenticated, let the normal auth guard handle it
  if (!isAuthenticated) {
    return children
  }
  
  // If redirecting, show loading state
  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to registration...</p>
        </div>
      </div>
    )
  }
  
  return children
}

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Check if authenticated user is not verified and redirect
  // Use useEffect to prevent redirect on every render
  useEffect(() => {
    if (isAuthenticated && user && !user.is_verified) {
      const currentUrl = window.location.href
      const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL || 'http://localhost:5174'
      const email = user?.email || ''
      // Pass email as URL parameter so customer platform can access it
      const registrationUrl = email 
        ? `${customerAppUrl}/supplier-registration?email=${encodeURIComponent(email)}`
        : `${customerAppUrl}/supplier-registration`
      
      // Redirect if we're not already on customer platform
      if (!currentUrl.includes('5174') && !currentUrl.includes('supplier-registration')) {
        window.location.href = registrationUrl
      }
    }
  }, [isAuthenticated, user])

  return (
    <div className="App">
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
        />
        <Route 
          path="/forgot-password" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />} 
        />
        <Route 
          path="/reset-password" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword />} 
        />
        <Route 
          path="/auth/google/callback" 
          element={<GoogleCallback />} 
        />
        <Route 
          path="/auth/invitation/:token" 
          element={<InvitationAcceptance />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <Dashboard />
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/products" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/products/drafts" 
          element={isAuthenticated ? (
            <DashboardLayout>
              <DraftsPage />
            </DashboardLayout>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/products/create" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <CreateProductComponent onClose={() => window.history.back()} />
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/products/add-itinerary" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <DashboardLayout>
                <AddItinerary />
              </DashboardLayout>
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/products/application-submitted" 
          element={isAuthenticated ? <ApplicationSubmitted /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings/company-profile" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <DashboardLayout>
                <CompanyProfile />
              </DashboardLayout>
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings/account" 
          element={isAuthenticated ? (
            <DashboardLayout>
              <AccountSettings />
            </DashboardLayout>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings/invite-partner" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <InvitePartnerComponent isOpen={true} onClose={() => window.history.back()} />
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/bookings" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <DashboardLayout>
                <BookingsPage />
              </DashboardLayout>
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/chat" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <ChatPage />
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/insights" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <DashboardLayout>
                <InsightsPage />
              </DashboardLayout>
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/support" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <SupportPage />
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/faq" 
          element={<FAQPage />} 
        />
        <Route 
          path="/terms" 
          element={<TermsOfService />} 
        />
        <Route 
          path="/privacy" 
          element={<TermsOfService />} 
        />
        <Route 
          path="/safety-guidelines" 
          element={<SafetyGuidelinesPage />} 
        />
        <Route 
          path="/availability" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <DashboardLayout>
                <AvailabilityCalendar />
              </DashboardLayout>
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/finance" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <DashboardLayout>
                <FinancePage />
              </DashboardLayout>
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        {/* Homepage renders Dashboard */}
        <Route 
          path="/" 
          element={isAuthenticated ? (
            <VerifiedRoute>
              <Dashboard />
            </VerifiedRoute>
          ) : <Navigate to="/login" />} 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading Google Maps</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <GlobalCacheSync />
        <AppRoutes />
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App