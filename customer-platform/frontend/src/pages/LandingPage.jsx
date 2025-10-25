import React from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import SearchSection from '../components/SearchSection'
import TopPicksSection from '../components/TopPicksSection'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <SearchSection />
      <TopPicksSection />
    </div>
  )
}

export default LandingPage
