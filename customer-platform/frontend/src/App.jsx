import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SupplierRegistrationPage from './pages/SupplierRegistrationPage'
import AboutUsPage from './pages/AboutUsPage'
import ProductDetails from './components/ProductDetails'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/supplier-registration" element={<SupplierRegistrationPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/product-details" element={<ProductDetails />} />
      </Routes>
    </div>
  )
}

export default App
