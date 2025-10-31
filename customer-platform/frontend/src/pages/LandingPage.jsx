import React, { useEffect } from 'react'
import Header from '../components/Header'
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
  useEffect(() => {
    try { localStorage.setItem('tripsadora_mode', 'customer') } catch (_) {}
  }, [])

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
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
      <div id="our-plans">
        <OurPlans/>
      </div>

    </div>
  )
}

export default LandingPage
