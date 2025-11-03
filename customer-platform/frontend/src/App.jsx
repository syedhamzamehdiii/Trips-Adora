import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SupplierRegistrationPage from './pages/SupplierRegistrationPage'
import AboutUsPage from './pages/AboutUsPage'
import ProductDetails from './components/ProductDetails'
import OurPlansPage from './pages/OurPlansPage'
import TokyoPage from './pages/attractions/TokyoPage'
import KyotoPage from './pages/attractions/KyotoPage'
import OsakaPage from './pages/attractions/OsakaPage'
import FukuokaPage from './pages/attractions/FukuokaPage'
import TokyoSkytreePage from './pages/attractions/TokyoSkytreePage'
import TokyoTowerPage from './pages/attractions/TokyoTowerPage'
import ArashiyamaBambooGrovePage from './pages/attractions/ArashiyamaBambooGrovePage'
import SearchResultsPage from './pages/SearchResultsPage'
import ProfilePage from './pages/ProfilePage'
import ComparisonPage from './pages/ComparisonPage'
import WishlistPage from './pages/WishlistPage'
import CartPage from './pages/CartPage'
import BookingsPage from './pages/BookingsPage'
import CheckAvailabilityPage from './pages/CheckAvailabilityPage'
import ChooseVehiclePage from './pages/ChooseVehiclePage'
import PaymentDetailsPage from './pages/PaymentDetailsPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import BookingDetailsPage from './pages/BookingDetailsPage'
import ShareReviewPage from './pages/ShareReviewPage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/booking-details" element={<BookingDetailsPage />} />
        <Route path="/share-review" element={<ShareReviewPage />} />
        <Route path="/check-availability" element={<CheckAvailabilityPage />} />
        <Route path="/choose-vehicle" element={<ChooseVehiclePage />} />
        <Route path="/payment-details" element={<PaymentDetailsPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
        <Route path="/comparison/detail/:ids" element={<ProductComparisonDetail />} />
        <Route path="/supplier-registration" element={<SupplierRegistrationPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/product-details" element={<ProductDetails />} />
        <Route path="/product-details/:id" element={<ProductDetails />} />
        <Route path="/our-plans" element={<OurPlansPage />} />
        <Route path="/top-attractions/tokyo" element={<TokyoPage />} />
        <Route path="/top-attractions/kyoto" element={<KyotoPage />} />
        <Route path="/top-attractions/osaka" element={<OsakaPage />} />
        <Route path="/top-attractions/fukuoka" element={<FukuokaPage />} />
        <Route path="/attractions/tokyo-skytree" element={<TokyoSkytreePage />} />
        <Route path="/attractions/tokyo-tower" element={<TokyoTowerPage />} />
        <Route path="/attractions/arashiyama-bamboo-grove" element={<ArashiyamaBambooGrovePage />} />
      </Routes>
    </div>
  )
}

export default App
