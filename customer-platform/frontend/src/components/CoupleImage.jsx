import React from 'react'

const CoupleImage = () => {
  return (
    <div className="relative w-80 h-96">
      {/* Background Image with couple - positioned to show the couple */}
      <div 
        className="absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/bg.jpg)',
          backgroundPosition: 'center right',
          backgroundSize: 'cover',
          filter: 'brightness(1.2) contrast(1.3) saturate(1.1)',
        }}
      />
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-black bg-opacity-5 rounded-2xl"></div>
      
      {/* Couple silhouette overlay to enhance the couple visibility */}
      <div className="absolute inset-0 rounded-2xl">
        {/* This creates a subtle frame effect */}
        <div className="absolute inset-2 border-2 border-white border-opacity-20 rounded-xl"></div>
      </div>
    </div>
  )
}

export default CoupleImage
