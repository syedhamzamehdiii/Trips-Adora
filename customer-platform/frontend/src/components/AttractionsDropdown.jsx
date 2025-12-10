import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin } from 'react-icons/fi'

const AttractionsDropdown = ({ isOpen, onClose, triggerRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const calculatePosition = useCallback(() => {
    if (!isOpen || !triggerRef?.current) return
    
    const rect = triggerRef.current.getBoundingClientRect()
    const padding = 16
    const dropdownWidth = Math.min(400, window.innerWidth - padding * 2)
    
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
      left: left,
      width: dropdownWidth
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

  const navigate = useNavigate()
  if (!isOpen) return null

  const attractions = [
    { name: 'Mount Fuji', description: "Japan's Sacred mountain and UNESCO site", to: '/our-plans' },
    { name: 'Tokyo Sky-tree', description: 'Tallest structure in Japan with an observation deck', to: '/attractions/tokyo-skytree' },
    { name: 'Tokyo Tower', description: "Japan's Eiffel Tower-style landmark", to: '/attractions/tokyo-tower' },
    { name: 'Arashiyama Bamboo Grove', description: 'Magical bamboo forest walk', to: '/attractions/arashiyama-bamboo-grove' }
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
        style={{ top: `${position.top}px`, left: `${position.left}px`, width: `${position.width || 400}px` }}
      >
        <div className="bg-white rounded-[20px] shadow-2xl w-full pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-center gap-2">
            <FiMapPin className="text-red-600 text-xl" />
            <h2 className="text-xl font-bold text-black">Japan's Iconic Attractions</h2>
          </div>

          {/* Attractions List */}
          <div className="px-6 pb-5">
            {attractions.map((attraction, index) => (
              <div
                key={index}
                className="py-3 cursor-pointer hover:bg-gray-50 -mx-6 px-6 transition-colors"
                onClick={() => {
                  try { onClose && onClose() } catch (_) {}
                  if (attraction.to) {
                    navigate(attraction.to)
                  }
                }}
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

