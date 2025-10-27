import React from 'react'
import Header from '../components/Header'
import BottomNavigationBar from '../components/BottomNavigationBar'
import HeroSection from '../components/HeroSection'
import SearchSection from '../components/SearchSection'
import TopPicksSection from '../components/TopPicksSection'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <BottomNavigationBar />
      <HeroSection />
      <SearchSection />
      <TopPicksSection />
    </div>
  )
}

export default LandingPage
