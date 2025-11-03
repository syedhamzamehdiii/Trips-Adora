import React from 'react'
import MainHeader from '../components/MainHeader'
import OurPlans from '../components/OurPlans'
import Footer from '../components/Footer'

const OurPlansPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      <div className="pt-4">
        <OurPlans />
      </div>
      <Footer />
    </div>
  )
}

export default OurPlansPage

