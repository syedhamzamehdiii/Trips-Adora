import React, { useEffect, useRef } from 'react'
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
import OurPlans from '../components/OurPlans'



const LandingPage = () => {
  const location = useLocation()
  const ourPlansRef = useRef(null)

  useEffect(() => {
    try { localStorage.setItem('tripsadora_mode', 'customer') } catch (_) {}
  }, [])

  useEffect(() => {
    if (location.hash === '#our-plans' && ourPlansRef.current) {
      try {
        ourPlansRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch (_) {}
    }
  }, [location])

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
      {location.hash === '#our-plans' && (
        <div id="our-plans" ref={ourPlansRef}>
          <OurPlans/>
        </div>
      )}

    </div>
  )
}

export default LandingPage
