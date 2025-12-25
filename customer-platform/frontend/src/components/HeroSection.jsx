import React from 'react'

const HeroSection = () => {
  return (
<section
  id="hero"
  className="relative h-[70vh] sm:h-screen flex items-center justify-center overflow-hidden pb-20 sm:pb-0"
>
  {/* Background */}
  <div
    className="
      absolute inset-0 
      bg-no-repeat 
      bg-cover 
      bg-center 
    "
    style={{ backgroundImage: "url(/images/bg.jpg)" }}
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-black bg-opacity-40" />

  {/* Content */}
  <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Title */}
    <div className="absolute left-1/4 right-10 top-28 sm:top-10 pt-16 sm:pt-40">
      <div className="max-w-2xl text-white">
        <h1 className="text-4xl sm:text-6xl font-bold leading-none flex flex-col">
          <span className="text-left">MEET</span>
          <span className="text-center text-custom-blue">VOYAGE</span>
          <span className="text-right">STORIES</span>
        </h1>
      </div>
    </div>

    {/* Text Bottom */}
    <div className="w-full h-full flex items-end justify-start pb-8 sm:pb-16 pl-6 sm:pl-8">
      <div className="max-w-xs sm:max-w-xl text-white space-y-6">

      <div className="hidden sm:block space-y-1 text-sm lg:text-base">
  <p>Discover unforgettable journeys,</p>
  <p>unique experiences,</p>
  <p>and meaningful connections</p>
  <p>all in one place.</p>
</div>


        <div className="hidden sm:block pt-3 sm:pt-6">
          <div className="bg-custom-blue text-white px-6 py-3 rounded-xl text-sm sm:text-base font-medium shadow-lg">
            Start exploring the world and create stories worth telling. ✈️
          </div>
        </div>

      </div>
    </div>

  </div>
</section>

  )
}

export default HeroSection
