import React from 'react'

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 "
        style={{
          backgroundImage: 'url(/assests/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'none',
          transform: 'scale(1.0)',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
        {/* MEET VOYAGE STORIES - Positioned Lower */}
        <div className="absolute left-1/4 right-10 top-10 pt-40">
          <div className="max-w-2xl">
            <div className="text-white">
              <div className="space-y-0">
                <h1 className="text-5xl lg:text-6xl font-bold leading-none flex flex-col">
                  <span className="text-left text-white mb-[-0.5rem]">MEET</span>
                  <span className="text-center text-custom-blue">VOYAGE</span>
                  <span className="text-right text-white mt-[-0.5rem]">STORIES</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
        
        {/* Other Text Content - Left Aligned, Where Picture Ends */}
        <div className="w-full h-full flex items-end justify-start pb-16 pl-8">
          <div className="max-w-xl pt-12">
            <div className="text-white space-y-8">
              {/* Descriptive Text */}
              <div className="space-y-1 text-sm lg:text-base">
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
                <div className="bg-custom-blue text-white px-8 py-3 rounded-xl text-base font-medium hover:bg-opacity-100 transparency-50 transition-all duration-200 shadow-lg">
                  Start exploring the world and create stories worth telling.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
