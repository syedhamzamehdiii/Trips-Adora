import React, { useEffect, useState, useCallback } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const DestinationsDropdown = ({ isOpen, onClose, triggerRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const navigate = useNavigate()

  const calculatePosition = useCallback(() => {
    if (!isOpen || !triggerRef?.current) return
    
    const rect = triggerRef.current.getBoundingClientRect()
    const dropdownWidth = 400
    const padding = 20
    
    // Position dropdown below the link, aligned to left edge of trigger
    let left = rect.left
    
    // Ensure dropdown doesn't go off the right edge
    if (left + dropdownWidth > window.innerWidth - padding) {
      left = window.innerWidth - dropdownWidth - padding
    }
    
    // Ensure dropdown doesn't go off the left edge
    if (left < padding) {
      left = padding
    }
    
    setPosition({
      top: rect.bottom + 5,
      left: left
    })
  }, [isOpen, triggerRef])

  useEffect(() => {
    if (isOpen) {
      // Calculate position immediately
      calculatePosition()
      
      // Recalculate on scroll and resize
      const handleUpdate = () => {
        requestAnimationFrame(calculatePosition)
      }
      
      window.addEventListener('scroll', handleUpdate, true)
      window.addEventListener('resize', handleUpdate)
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true)
        window.removeEventListener('resize', handleUpdate)
      }
    }
  }, [isOpen, calculatePosition])

  if (!isOpen) return null

  const destinations = [
    { name: 'Tokyo', description: 'Capital city, tech hub, and entertainment center', to: '/top-attractions/tokyo' },
    { name: 'Kyoto', description: 'Ancient temples, shrines, and traditional culture', to: '/top-attractions/kyoto' },
    { name: 'Osaka', description: 'Known for street food, nightlife, and Osaka Castle', to: '/top-attractions/osaka' },
    { name: 'Fukuoka', description: 'Coastal city famous for beaches and ramen', to: '/top-attractions/fukuoka' }
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
            <h2 className="text-xl font-bold text-black">Japan's Top Cities</h2>
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


