import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SupplierRegistrationPage from './pages/SupplierRegistrationPage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/supplier-registration" element={<SupplierRegistrationPage />} />
      </Routes>
    </div>
  )
}

export default App
