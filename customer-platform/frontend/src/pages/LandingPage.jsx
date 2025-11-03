import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
  const location = useLocation()

  useEffect(() => {
    try { localStorage.setItem('tripsadora_mode', 'customer') } catch (_) {}
  }, [])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [location.hash])

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
      <div id="about-us">
        <SupplierPromo />
      </div>
      <div id="careers">
        <TopCountriesSection />
      </div>
      <div id="contact-us">
        <NewsletterSection />
      </div>
      <Footer />
    </div>
  )
}

export default LandingPage
