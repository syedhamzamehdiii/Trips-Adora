import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SupplierRegistrationPage from './pages/SupplierRegistrationPage'
import AboutUsPage from './pages/AboutUsPage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/supplier-registration" element={<SupplierRegistrationPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
      </Routes>
    </div>
  )
}

export default App
