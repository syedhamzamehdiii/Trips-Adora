import React, { useEffect, useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const DestinationsDropdown = ({ isOpen, onClose, triggerRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const dropdownWidth = 400

      let left = rect.left

      if (left + dropdownWidth > window.innerWidth - 20) {
        left = window.innerWidth - dropdownWidth - 20
      }

      setPosition({
        top: rect.bottom + 5,
        left: left
      })
    }
  }, [isOpen, triggerRef])

  if (!isOpen) return null

  const destinations = [
    { name: 'Mount Fuji', description: "Japan's Sacred mountain and UNESCO site", to: '/our-plans' },
    { name: 'Tokyo Sky-tree', description: 'Tallest structure in Japan with an observation deck', to: '/attractions/tokyo-skytree' },
    { name: 'Tokyo Tower', description: "Japan's Eiffel Tower-style landmark", to: '/attractions/tokyo-tower' },
    { name: 'Arashiyama Bamboo Grove', description: 'Magical bamboo forest walk', to: '/attractions/arashiyama-bamboo-grove' }
  ]

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <div 
        className="fixed z-50 pointer-events-none"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="bg-white rounded-[20px] shadow-2xl w-[400px] pointer-events-auto overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex items-center gap-2">
            <FiMapPin className="text-red-600 text-xl" />
            <h2 className="text-xl font-bold text-black">Japan's Iconic Attractions</h2>
          </div>

          <div className="px-6 pb-5">
            {destinations.map((destination, index) => (
              <div
                key={index}
                onClick={() => { if (destination.to) { navigate(destination.to); onClose?.() } }}
                className="py-3 cursor-pointer hover:bg-gray-50 -mx-6 px-6 transition-colors"
              >
                <p className="text-base font-semibold text-black">{destination.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{destination.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default DestinationsDropdown


