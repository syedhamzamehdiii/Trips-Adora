import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SupplierRegistrationPage from './pages/SupplierRegistrationPage'
import AboutUsPage from './pages/AboutUsPage'
import ProductDetails from './components/ProductDetails'
import OurPlans from './components/OurPlans'
import TokyoPage from './pages/attractions/TokyoPage'
import KyotoPage from './pages/attractions/KyotoPage'
import OsakaPage from './pages/attractions/OsakaPage'
import FukuokaPage from './pages/attractions/FukuokaPage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/supplier-registration" element={<SupplierRegistrationPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/product-details" element={<ProductDetails />} />
        <Route path="/our-plans" element={<OurPlans />} />
        <Route path="/top-attractions/tokyo" element={<TokyoPage />} />
        <Route path="/top-attractions/kyoto" element={<KyotoPage />} />
        <Route path="/top-attractions/osaka" element={<OsakaPage />} />
        <Route path="/top-attractions/fukuoka" element={<FukuokaPage />} />
      </Routes>
    </div>
  )
}

export default App
