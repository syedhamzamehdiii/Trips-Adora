import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import TourCard from './TourCard'

const TopPicksSection = () => {
  const navigate = useNavigate()
  const destinations = [
    {
      id: 1,
      name: "Mount Fuji, Japan",
      image: "/assests/bg.jpg", // Using bg.jpg as placeholder
      rating: 4.5,
      reviews: "1.2k reviews",
      price: "$120/person",
      isNew: true
    },
    {
      id: 2,
      name: "Arashiyama Bamboo Forest, Japan",
      image: "/assests/bg.jpg",
      rating: 4.8,
      reviews: "856 reviews",
      price: "$95/person",
      isNew: false
    },
    {
      id: 3,
      name: "Santorini, Greece",
      image: "/assests/bg.jpg",
      rating: 4.7,
      reviews: "2.1k reviews",
      price: "$180/person",
      isNew: true
    },
    {
      id: 4,
      name: "Bali, Indonesia",
      image: "/assests/bg.jpg",
      rating: 4.6,
      reviews: "1.8k reviews",
      price: "$150/person",
      isNew: false
    }
  ]

  return (
    <section className="py-16 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Top picks for you...</h2>
          <a href="#" className="text-custom-blue hover:text-blue-600 font-medium">
            View All
          </a>
        </div>
        
        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <TourCard key={destination.id} onClick={() => {
              if (destination.name.includes('Mount Fuji')) {
                navigate('/dashboard#our-plans')
              }
            }} tour={{
              name: destination.name,
              image: destination.image,
              duration: `${destination.reviews}`,
              price: destination.price
            }} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TopPicksSection
