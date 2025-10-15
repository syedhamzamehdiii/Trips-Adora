import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Import pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import GoogleCallback from './pages/Auth/GoogleCallback'
import Dashboard from './pages/Dashboard/Dashboard'
import CreateProduct from './pages/Products/CreateProduct'
import Products from './pages/Products/Products'
import AddItinerary from './pages/Products/AddItinerary'
import CompanyProfile from './pages/Settings/CompanyProfile'
import AccountSettings from './pages/Settings/AccountSettings'
import DashboardLayout from './layouts/DashboardLayout'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

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

  return (
    <div className="App">
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
          path="/auth/google/callback" 
          element={<GoogleCallback />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/products" 
          element={isAuthenticated ? (
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/products/create" 
          element={isAuthenticated ? <CreateProduct /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/products/add-itinerary" 
          element={isAuthenticated ? (
            <DashboardLayout>
              <AddItinerary />
            </DashboardLayout>
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings/company-profile" 
          element={isAuthenticated ? (
            <DashboardLayout>
              <CompanyProfile />
            </DashboardLayout>
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
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App