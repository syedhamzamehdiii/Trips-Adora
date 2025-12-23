import React from 'react'
import { Link } from 'react-router-dom'

const PlaceCard = ({ title, subtitle, image, price }) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg bg-white group">
      <div className="relative h-52 sm:h-60 lg:h-64">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition">❤</button>
        <div className="absolute bottom-3 left-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
          <h4 className="text-white text-sm font-semibold truncate">{title}</h4>
          {subtitle && <div className="text-gray-200 text-xs truncate">{subtitle}</div>}
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <span className="text-base font-bold text-custom-blue">{price}</span>
        <button className="text-sm px-3 py-2 rounded-lg bg-custom-blue text-white hover:bg-opacity-90">Book</button>
      </div>
    </div>
  )
}

const PlacesSection = () => {
  const places = [
    { id: 1, title: 'Fushimi Inari Shrine', subtitle: 'Kyoto, Japan', image: '/images/place-1.jpg', price: '$349/person' },
    { id: 2, title: 'Gion Historic District', subtitle: 'Kyoto, Japan', image: '/images/place-2.jpg', price: '$329/person' },
    { id: 3, title: 'Kiyomizu-dera Temple', subtitle: 'Kyoto, Japan', image: '/images/place-3.jpg', price: '$359/person' }
  ]

  return (
    <section id="places" className="py-10 sm:py-12 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl text-gray-900">An experience You'll never forget</h3>
          <Link to="/search" className="text-sm text-gray-600 hover:text-gray-800">See more</Link>
        </div>
        {/* Mobile swipe */}
        <div className="sm:hidden flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory">
          {places.map((p) => (
            <div key={p.id} className="min-w-[220px] snap-start">
              <PlaceCard {...p} />
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {places.map((p) => (
            <PlaceCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PlacesSection


