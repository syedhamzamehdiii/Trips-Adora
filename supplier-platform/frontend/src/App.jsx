import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Import pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import GoogleCallback from './pages/Auth/GoogleCallback'
import Dashboard from './pages/Dashboard/Dashboard'
import CreateProduct from './pages/Products/CreateProduct'
import AddItinerary from './pages/Products/AddItinerary'

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
          element={isAuthenticated ? <div className="p-8"><h1 className="text-2xl font-bold">Active Product Listings</h1><p>Your active product listings will be displayed here.</p></div> : <Navigate to="/login" />} 
        />
        <Route 
          path="/products/create" 
          element={isAuthenticated ? <CreateProduct /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/products/add-itinerary" 
          element={isAuthenticated ? <AddItinerary /> : <Navigate to="/login" />} 
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