import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ExperienceCard from './ExperienceCard'

const TopCountriesSection = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('destinations')

  useEffect(() => {
    if (location.hash === '#top-destinations') {
      setActiveTab('destinations')
      // Small delay to ensure tab switch completes before scrolling
      setTimeout(() => {
        const el = document.getElementById('top-countries-section')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
    } else if (location.hash === '#top-attractions') {
      setActiveTab('attractions')
      // Small delay to ensure tab switch completes before scrolling
      setTimeout(() => {
        const el = document.getElementById('top-countries-section')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
    }
  }, [location.hash])

  // Top Destinations data (same as DestinationsDropdown)
  const destinations = [
    { id: 1, name: 'Mount Fuji', description: "Japan's Sacred mountain and UNESCO site", to: '/our-plans', image: '/assests/mount fuji.jpg', price: '$119/person' },
    { id: 2, name: 'Tokyo Sky-tree', description: 'Tallest structure in Japan with an observation deck', to: '/attractions/tokyo-skytree', image: '/assests/Screenshot 2025-11-03 at 12.08.32 PM.png', price: '$119/person' },
    { id: 3, name: 'Tokyo Tower', description: "Japan's Eiffel Tower-style landmark", to: '/attractions/tokyo-tower', image: '/assests/Screenshot 2025-11-03 at 12.12.27 PM.png', price: '$119/person' },
    { id: 4, name: 'Arashiyama Bamboo Grove', description: 'Magical bamboo forest walk', to: '/attractions/arashiyama-bamboo-grove', image: '/assests/Screenshot 2025-11-03 at 12.13.07 PM.png', price: '$119/person' },
  ]

  // Top Attractions data (same as AttractionsDropdown)
  const attractions = [
    { id: 5, name: 'Tokyo', description: 'Capital city, tech hub, and entertainment center', to: '/top-attractions/tokyo', image: '/assests/golden-pavilion-kinkakuji-temple-kyoto-japan 1.png', price: '$119/person' },
    { id: 6, name: 'Kyoto', description: 'Ancient temples, shrines, and traditional culture', to: '/top-attractions/kyoto', image: '/assests/woman-traveler-with-backpack-fushimi-inari-taisha-shrine-kyoto-japan.jpg', price: '$119/person' },
    { id: 7, name: 'Osaka', description: 'Known for street food, nightlife, and Osaka Castle', to: '/top-attractions/osaka', image: '/assests/matsumoto-castle-osaka-japan.jpg', price: '$119/person' },
    { id: 8, name: 'Fukuoka', description: 'Coastal city famous for beaches and ramen', to: '/top-attractions/fukuoka', image: '/assests/Fukuoka.jpg', price: '$119/person' },
  ]

  const currentCards = activeTab === 'destinations' ? destinations : attractions

  return (
    <section id="top-countries-section" className="py-12 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => setActiveTab('destinations')}
            className={`px-4 py-1.5 rounded-full text-sm shadow transition ${
              activeTab === 'destinations' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Top Destinations
          </button>
          <button 
            onClick={() => setActiveTab('attractions')}
            className={`px-4 py-1.5 rounded-full text-sm shadow transition ${
              activeTab === 'attractions' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Top Attractions
          </button>
        </div>
        <div id="top-destinations" style={{ display: activeTab === 'destinations' ? 'block' : 'none' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((c, idx) => (
              <div 
                key={c.id}
                onClick={() => navigate(c.to)}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
              >
                <ExperienceCard 
                  image={c.image} 
                  title={`${c.name} ${c.description ? '- ' + c.description : ''}`} 
                  price={c.price} 
                  liked={idx % 2 === 0}
                  id={c.id}
                />
              </div>
            ))}
          </div>
        </div>
        <div id="top-attractions" style={{ display: activeTab === 'attractions' ? 'block' : 'none' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {attractions.map((c, idx) => (
            <div 
              key={c.id}
              onClick={() => navigate(c.to)}
              className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
            >
              <ExperienceCard 
                image={c.image} 
                title={`${c.name} ${c.description ? '- ' + c.description : ''}`} 
                price={c.price} 
                liked={idx % 2 === 0}
                id={c.id}
              />
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TopCountriesSection


