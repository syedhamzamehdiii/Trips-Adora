import React, { useEffect } from 'react'
import HeaderLandingPage from '../components/HeaderLandingPage'
import BottomNavigationBar from '../components/BottomNavigationBar'
import HeroSection from '../components/HeroSection'
import SearchSection from '../components/SearchSection'
import TopPicksSection from '../components/TopPicksSection'
import ToursSection from '../components/ToursSection'
import ConsultationBanner from '../components/ConsultationBanner'
import PlacesSection from '../components/PlacesSection'
import SupplierPromo from '../components/SupplierPromo'
import TopCountriesSection from '../components/TopCountriesSection'
import NewsletterSection from '../components/NewsletterSection'
import Footer from '../components/Footer'



const LandingPage = () => {
  useEffect(() => {
    try { localStorage.setItem('tripsadora_mode', 'customer') } catch (_) {}
  }, [])

  return (
    <div className="min-h-screen bg-gray-200">
     
      <HeaderLandingPage />
      <BottomNavigationBar />
      <HeroSection />
      <SearchSection />
      <TopPicksSection />
      <ToursSection />
      <ConsultationBanner />
      <PlacesSection />
      <SupplierPromo />
      <TopCountriesSection />
      <NewsletterSection />
      <Footer />
    </div>
  )
}

export default LandingPage
