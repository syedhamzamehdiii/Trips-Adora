import React from 'react'
import ExperienceCard from './ExperienceCard'

const TopCountriesSection = () => {
  const cards = [
    { id: 1, image: '/assests/tc1.jpg', title: 'Mount Fuji Highlights & Hidden Gems Tour', price: '$119/person' },
    { id: 2, image: '/assests/tc2.jpg', title: 'Hakone Highlights & Hidden Gems Tour', price: '$119/person' },
    { id: 3, image: '/assests/tc3.jpg', title: 'Tokyo Highlights & Hidden Gems Tour', price: '$119/person' },
    { id: 4, image: '/assests/tc4.jpg', title: 'Burj khalifa Highlights & Hidden Gems Tour', price: '$119/person' },
  ]

  return (
    <section className="py-12 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs header */}
        <div className="flex items-center gap-3 mb-6">
          <button className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm shadow">Top Countries</button>
          <button className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm shadow">Top Destinations</button>
          <button className="px-4 py-1.5 rounded-full bg-white text-gray-700 text-sm shadow">Top Attractions</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, idx) => (
            <ExperienceCard key={c.id} image={c.image} title={c.title} price={c.price} liked={idx % 2 === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TopCountriesSection


