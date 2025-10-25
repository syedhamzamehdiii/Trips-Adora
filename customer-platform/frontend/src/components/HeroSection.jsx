import React from 'react'

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Original without blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assests/bg.jpg)',
          filter: 'none'
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center">
        <div className="w-full flex items-center justify-between">
          {/* Left Side - Text Content */}
          <div className="text-white space-y-8 flex-1">
            {/* Main Title - Staggered Layout */}
            <div className="space-y-0">
              <h1 className="text-8xl lg:text-9xl font-bold leading-none">
                <span className="block text-left text-white">MEET</span>
                <span className="block text-center text-custom-blue ml-12">VOYAGE</span>
                <span className="block text-right text-white">STORIES</span>
              </h1>
            </div>
            
            {/* Descriptive Text */}
            <div className="space-y-1 text-xl lg:text-2xl max-w-lg">
              <p>Discover</p>
              <p>unforgettable</p>
              <p>journeys, unique</p>
              <p>experiences, and</p>
              <p>meaningful</p>
              <p>connections</p>
              <p>all in one place.</p>
            </div>
            
            {/* Call to Action Button */}
            <div className="pt-6">
              <button className="bg-custom-blue text-white px-10 py-5 rounded-xl text-xl font-medium hover:bg-opacity-90 transition-all duration-200 shadow-lg">
                Start exploring the world and create stories worth telling.
              </button>
            </div>
            
            {/* Bottom Text */}
            <div className="pt-8">
              <p className="text-sm text-gray-300">
                Powered by the world's largest travel site by a group
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
