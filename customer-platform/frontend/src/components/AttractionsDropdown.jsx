import React, { useEffect, useState } from 'react'
import { FiMapPin } from 'react-icons/fi'

const AttractionsDropdown = ({ isOpen, onClose, triggerRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const dropdownWidth = 400
      
      // Position dropdown below the link
      let left = rect.left
      
      // Ensure dropdown doesn't go off the right edge
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

  const attractions = [
    { name: "Tokyo Skytree", description: "Iconic tower offering panoramic city views" },
    { name: "Shibuya Crossing", description: "World's busiest pedestrian crossing" },
    { name: "Tokyo Tower", description: "Red and white communication tower landmark" },
    { name: "Imperial Palace", description: "Historic residence of Japanese Emperor" },
    { name: "Senso-ji Temple", description: "Tokyo's oldest temple in Asakusa" }
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown positioned below link */}
      <div 
        className="fixed z-50 pointer-events-none"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="bg-white rounded-[20px] shadow-2xl w-[400px] pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-center gap-2">
            <FiMapPin className="text-red-600 text-xl" />
            <h2 className="text-xl font-bold text-black">Top Attractions</h2>
          </div>

          {/* Attractions List */}
          <div className="px-6 pb-5">
            {attractions.map((attraction, index) => (
              <div
                key={index}
                className="py-3 cursor-pointer hover:bg-gray-50 -mx-6 px-6 transition-colors"
              >
                <p className="text-base font-semibold text-black">{attraction.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{attraction.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default AttractionsDropdown

