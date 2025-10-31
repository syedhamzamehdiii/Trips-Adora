import React, { useEffect } from 'react'
import Header from '../components/Header'
import BottomNavigationBar from '../components/BottomNavigationBar'
import AUImage from '../../assests/AU.jpg'
import OurStoryImage from '../../assests/image.png'
import CoreValuesImage from '../../assests/core values.jpg'
import { FiHeadphones, FiPhone, FiClock, FiMessageCircle } from 'react-icons/fi'

const AboutUsPage = () => {
  useEffect(() => {
    try { localStorage.setItem('tripsadora_mode', 'customer') } catch (_) {}
  }, [])

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      <BottomNavigationBar />
      
      {/* Hero Section with About Us Content */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-32">
        {/* Background Image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${AUImage})`,
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
        <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 w-full h-full">
          {/* Breadcrumbs - Top Left */}
          <div className="absolute left-4 top-8 pt-20">
            <nav className="text-white text-sm font-light">
              <span className="hover:opacity-80 cursor-pointer">Home</span>
              <span className="mx-2">/</span>
              <span className="opacity-80">About Us</span>
            </nav>
          </div>
          
          {/* Main Content - Lower Left Quadrant */}
          <div className="w-1/2 h-full flex items-end justify-start pb-16 pl-0">
            <div className="max-w-2xl pt-12">
              <div className="text-white/90 space-y-6">
                {/* Main Heading */}
                <h1 className="text-5xl lg:text-6xl font-bold uppercase leading-tight">
                  ABOUT US
                </h1>
                
                {/* Subheading */}
                <h2 className="text-3xl lg:text-4xl font-bold uppercase leading-tight pt-2">
                  DISCOVER THE MAGIC OF JAPAN
                </h2>
                
                {/* Descriptive Text */}
                <p className="text-base lg:text-lg font-light leading-relaxed pt-4 max-w-xl">
                  Experience authentic Japanese culture, breathtaking landscapes, and unforgettable memories with TripsAdora!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Story Card */}
      <section className="relative z-10 -mt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#EDEADE] rounded-3xl shadow-xl border border-black/5 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-500">
                OUR STORY
              </h3>
              <div className="relative mt-6">
                {/* <div className="absolute -top-6 left-6 bg-white rounded-2xl px-5 py-2 shadow border border-black/5">
                  <p className="text-2xl font-extrabold tracking-tight text-gray-500">HOW WE STARTED</p>
                </div> */}
                <img
                  src={OurStoryImage}
                //   alt="Our Story"
                //   className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story and Team Section */}
      <section className="relative z-10 pb-20 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: TripsAdora Story */}
            <div className="relative">

              
              {/* Story Text */}
              <div className="pt-12 pb-20">
                <p className="text-gray-500 text-base leading-relaxed mb-4">
                  Founded in 2015 by Yuki Tanaka, TripsAdora was born from a simple yet profound dream: to share the beauty and wonder of Japan with the world. What started as a passion project has grown into a trusted platform guiding international visitors through hidden gems, ancient traditions, and modern marvels.
                </p>
                <p className="text-gray-500 text-base leading-relaxed mb-4">
                  Beginning as small group tours, we've expanded into a comprehensive travel platform that curates authentic Japanese experiences. Our mission is to connect travelers with the heart of Japan - its rich culture, exquisite cuisine, stunning landscapes, and warm hospitality. We focus on sustainable tourism that respects local communities and preserves cultural heritage.
                </p>
                <p className="text-gray-500 text-base leading-relaxed">
                  Today, TripsAdora offers curated experiences across Japan, from the bustling streets of Tokyo to the serene temples of Kyoto, the snow-covered landscapes of Hokkaido, and the tropical paradise of Okinawa.
                </p>
              </div>
                            
              {/* Award Banner */}
              <div className="relative mt-8 h-24 rounded-lg overflow-hidden" style={{
                background: 'linear-gradient(to right, #9333ea, #556b2f)'
              }}>
                <div className="h-full flex items-center px-6">
                  {/* Trophy Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative w-14 h-14">
                      {/* Trophy cup */}
                      <svg className="absolute inset-0 w-full h-full text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v3c0 3.55 2.86 6.5 6.5 6.93V19H8v2h8v-2h-2.5v-2.07C18.14 16.5 21 13.55 21 10V7c0-1.1-.9-2-2-2zm-7 12c-2.76 0-5-2.24-5-5V7h10v5c0 2.76-2.24 5-5 5z"/>
                      </svg>
                      {/* Star overlay */}
                      <svg className="absolute inset-0 w-full h-full text-yellow-300" fill="currentColor" viewBox="0 0 24 24" style={{transform: 'scale(0.5)', transformOrigin: 'center'}}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Award Text */}
                  <div className="ml-4 text-white">
                    <div className="text-xl font-bold uppercase leading-tight">3RD TIMES</div>
                    <div className="text-xl font-bold uppercase leading-tight">WINNER ASIA TOURISM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Our Team */}
            <div className="bg-blue-900 rounded-tl-3xl rounded-tr-none rounded-br-none rounded-bl-none lg:rounded-tr-3xl p-8 lg:p-12 flex flex-col items-center justify-center text-center">
              <h4 className="text-5xl lg:text-6xl font-bold text-white uppercase leading-tight mb-8">
                <div>OUR</div>
                <div>TEAM</div>
              </h4>
              <p className="text-white text-base leading-relaxed max-w-2xl">
                At Tripadora, our expert Japan travel team is dedicated to crafting unforgettable journeys for every traveler. Led by <span className="font-bold text-blue-300">Yuki Tanaka</span>, our <span className="font-semibold">Founder & CEO</span> with over 20 years of experience in Japan's tourism industry, we bring deep local knowledge and passion to every itinerary. <span className="font-bold text-blue-300">Sakura Yamamoto</span>, our <span className="font-semibold">Head of Operations</span>, ensures each tour is rich in cultural insight and authentic experiences, while <span className="font-bold text-blue-300">Hiroshi Sato</span>, our <span className="font-semibold">Travel Coordinator</span>, specializes in designing personalized and seamless travel plans across Japan. Together, we combine expertise, creativity, and a love for travel to make every trip extraordinary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics and Mission/Vision Section */}
      <section className="relative z-10 pb-20 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Statistics Bar */}
          <div 
            className="rounded-3xl p-8 mb-12 border border-black/20"
            style={{
              background: 'linear-gradient(to right, #f3f4f6, #f3f4f6 50%, #f3f4f6 80%, #e9d5ff)'
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Happy Travellers */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-bold text-black mb-2">500K</div>
                <div className="text-sm md:text-base text-black font-normal text-center">Happy Travellers</div>
              </div>
              
              {/* Destinations */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-px h-16 bg-black/30"></div>
                <div className="text-4xl md:text-5xl font-bold text-black mb-2">150+</div>
                <div className="text-sm md:text-base text-black font-normal text-center">Destinations</div>
              </div>
              
              {/* Awards Won */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-px h-16 bg-black/30"></div>
                <div className="text-4xl md:text-5xl font-bold text-black mb-2">25+</div>
                <div className="text-sm md:text-base text-black font-normal text-center">Awards Won</div>
              </div>
              
              {/* Average Rating */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-px h-16 bg-black/30"></div>
                <div className="text-4xl md:text-5xl font-bold text-black mb-2">4.9/5</div>
                <div className="text-sm md:text-base text-black font-normal text-center">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Our Mission Card */}
            <div className="relative bg-blue-900 rounded-2xl p-8 md:p-10 overflow-hidden">
              {/* Decorative Circle in Top-Right */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600 rounded-full -mr-10 -mt-10"></div>
              
              <h5 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4">OUR MISSION</h5>
              <p className="text-white text-base leading-relaxed">
                To make authentic, high-quality travel experiences accessible to everyone while promoting sustainable tourism that benefits local communities and preserves cultural heritage.
              </p>
            </div>

            {/* Our Vision Card */}
            <div className="relative bg-purple-600 rounded-2xl p-8 md:p-10 overflow-hidden">
              {/* Decorative Circle in Top-Right */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400 rounded-full -mr-10 -mt-10"></div>
              
              <h5 className="text-3xl md:text-4xl font-bold text-white uppercase mb-4">OUR VISION</h5>
              <p className="text-white text-base leading-relaxed">
                To become the world's most trusted travel platform, known for transformative experiences that connect people across cultures and create lasting positive impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Core Values Section */}
      <section className="relative z-10 pb-20 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Combined Container */}
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our core values</h3>
          <div
            className="rounded-2xl p-6 md:p-8 shadow-lg flex flex-col lg:flex-row items-stretch gap-8"
            style={{ backgroundColor: '#FDCB5B' }}
          >
            {/* Left Content Block */}
            <div className="flex-1">
              {/* Top Row - Value Pills */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="bg-white rounded-full px-5 py-2.5">
                  <span className="text-sm md:text-base font-medium text-gray-900 whitespace-nowrap">Cultural Respect</span>
                </div>
                <div className="bg-white rounded-full px-5 py-2.5">
                  <span className="text-sm md:text-base font-medium text-gray-900 whitespace-nowrap">Trust & Safety</span>
                </div>
                <div className="bg-white rounded-full px-5 py-2.5">
                  <span className="text-sm md:text-base font-medium text-gray-900 whitespace-nowrap">Passion for Travel</span>
                </div>
              </div>

              {/* Bottom Row - Combined Label + Description */}
              <div
                className="rounded-xl p-4 md:p-5 flex items-center gap-4 mt-8 md:mt-10"
                style={{ backgroundColor: '#FDF8ED' }}
              >
                <div className="bg-white rounded-full px-5 py-2.5 flex-shrink-0 shadow-sm">
                  <span className="text-sm md:text-base font-medium text-gray-900 whitespace-nowrap">Quality Excellence</span>
                </div>
                <p className="text-sm md:text-base text-gray-900 leading-relaxed">
                  We live and breathe travel. Every itinerary is crafted with genuine passion to create unforgettable experiences that transform our travelers' perspectives and enrich their lives.
                </p>
              </div>
            </div>

            {/* Right Image Block Inside Same Container */}
            <div className="rounded-2xl overflow-hidden shadow-md lg:w-2/5 self-center">
              <img
                src={CoreValuesImage}
                alt="Core Values"
                className="w-full h-full object-cover min-h-[220px] lg:min-h-[280px] max-h-[340px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section id="careers" className="relative z-10 pb-20 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-8 md:p-12 lg:p-14 shadow-lg"
            style={{ backgroundColor: '#EAD7B5' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              {/* Left Intro */}
              <div className="lg:col-span-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Careers</h3>
                <p className="text-sm uppercase tracking-wide text-gray-700 mb-4">Join Our Team</p>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Are you passionate about Japanese culture and travel? Do you want to help others discover the wonders of Japan?
                  We’re always looking for talented individuals to join our growing team.
                </p>
              </div>

              {/* Roles */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="flex flex-col">
                  <div className="rounded-2xl p-6 border border-black/10 shadow-sm" style={{ backgroundColor: '#F3CF7A' }}>
                    <div className="text-sm font-semibold text-gray-900">Travel Coordinator</div>
                    <div className="text-xs text-gray-700 mb-2">Tokyo, Japan</div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      Help design and coordinate custom travel experiences for our clients across Japan.
                    </p>
                  </div>
                  <button className="mt-4 self-center bg-blue-900 text-white text-sm px-6 py-2.5 rounded-full shadow">
                    Apply now!
                  </button>
                </div>

                {/* Card 2 */}
                <div className="flex flex-col">
                  <div className="rounded-2xl p-6 border border-black/10 shadow-sm" style={{ backgroundColor: '#F3CF7A' }}>
                    <div className="text-sm font-semibold text-gray-900">Customer Support Specialist</div>
                    <div className="text-xs text-gray-700 mb-2">Remote</div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      Provide exceptional support to our travellers before, during, and after their trips.
                    </p>
                  </div>
                  <button className="mt-4 self-center bg-blue-900 text-white text-sm px-6 py-2.5 rounded-full shadow">
                    Apply now!
                  </button>
                </div>

                {/* Card 3 */}
                <div className="flex flex-col">
                  <div className="rounded-2xl p-6 border border-black/10 shadow-sm" style={{ backgroundColor: '#F3CF7A' }}>
                    <div className="text-sm font-semibold text-gray-900">Content Creator</div>
                    <div className="text-xs text-gray-700 mb-2">Kyoto, Japan</div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      Create engaging content showcasing Japan’s destinations, culture, and experiences.
                    </p>
                  </div>
                  <button className="mt-4 self-center bg-blue-900 text-white text-sm px-6 py-2.5 rounded-full shadow">
                    Apply now!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="relative z-10 pb-20 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Combined White Card (Heading + Support + 3 Cards) */}
          <div className="bg-white rounded-3xl border border-black/10 shadow p-8 md:p-12">
            {/* Main Heading */}
            <div className="mb-6 text-center">
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Contact Us</h3>
              <p className="text-gray-600 text-base md:text-lg">
                We're here to help you plan your perfect Japanese adventure
              </p>
            </div>

            {/* Central Customer Support Block */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <FiHeadphones className="w-10 h-10 text-blue-900" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-1">Customer Support</h4>
              <h5 className="text-2xl font-bold text-gray-900 mb-4">24/7 Assistance</h5>
              <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
                Our dedicated support team is available around the clock to assist you with any questions or concerns
              </p>
            </div>
            {/* Three Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Phone Support Card */}
            <div className="bg-gray-100 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-center mb-4">
                <FiPhone className="w-6 h-6 text-gray-700" />
              </div>
              <h5 className="text-lg font-bold text-gray-900 mb-4 text-center">Phone Support</h5>
              <div className="space-y-3 text-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">International</p>
                  <p className="text-base font-bold text-gray-900">+81-3-1234-5678</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">USA/Canada</p>
                  <p className="text-base font-bold text-gray-900">1-800-TRIPS-JP</p>
                </div>
              </div>
            </div>

            {/* Email Support Card */}
            <div className="bg-gray-100 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-center mb-4">
                <FiClock className="w-6 h-6 text-gray-700" />
              </div>
              <h5 className="text-lg font-bold text-gray-900 mb-4 text-center">Email Support</h5>
              <div className="space-y-3 text-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">General Inquiries</p>
                  <p className="text-base font-bold text-gray-900">info@tripsadora.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Booking Support</p>
                  <p className="text-base font-bold text-gray-900">bookings@tripsadora.com</p>
                </div>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="bg-gray-100 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-center mb-4">
                <FiMessageCircle className="w-6 h-6 text-gray-700" />
              </div>
              <h5 className="text-lg font-bold text-gray-900 mb-4 text-center">Office Hours</h5>
              <div className="space-y-3 text-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Japan Time (JST)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Office</p>
                  <p className="text-base font-bold text-gray-900">Mon-Fri: 9AM-6PM</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Additional content sections can be added here */}
    </div>
  )
}

export default AboutUsPage
