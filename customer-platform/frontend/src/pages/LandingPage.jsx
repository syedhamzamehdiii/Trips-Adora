import React from 'react'
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
import ProductDetails from '../components/ProductDetails'


const LandingPage = () => {
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
      <ProductDetails/>

    </div>
  )
}

export default LandingPage
