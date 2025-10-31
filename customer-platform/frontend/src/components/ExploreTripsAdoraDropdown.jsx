import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiInfo, FiMail } from 'react-icons/fi'

const ExploreTripsAdoraDropdown = ({ isOpen, onClose, triggerRef }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const dropdownWidth = 560

      let left = rect.left
      if (left + dropdownWidth > window.innerWidth - 20) {
        left = window.innerWidth - dropdownWidth - 20
      }

      setPosition({ top: rect.bottom + 5, left })
    }
  }, [isOpen, triggerRef])

  if (!isOpen) return null

  const leftColumn = [
    { title: 'Our Story', desc: 'How we started', to: '/about-us#our-story' },
    { title: 'Our Team', desc: 'Meet the experts', to: '/about-us#our-team' },
    { title: 'Careers', desc: 'Join our team', to: '/about-us#careers' }
  ]

  const rightColumn = [
    { title: 'Customer Support', desc: '24/7 assistance' },
    { title: 'Help Center', desc: 'FAQs and guides' },
    { title: 'Feedback', desc: 'Share your thoughts' }
  ]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="fixed z-50 pointer-events-none"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="bg-white rounded-[20px] shadow-2xl w-[560px] pointer-events-auto overflow-hidden">
          <div className="grid grid-cols-2 gap-6 px-6 pt-5 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiInfo className="text-blue-600 text-xl" />
                <h3 className="text-lg font-semibold text-black">About Us</h3>
              </div>
              {leftColumn.map((item, idx) => (
                <div key={idx} onClick={() => { if (item.to) { navigate(item.to); onClose?.() } }} className="py-3 -mx-3 px-3 rounded hover:bg-gray-50 cursor-pointer">
                  <p className="text-base font-semibold text-black">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FiMail className="text-blue-600 text-xl" />
                <h3 className="text-lg font-semibold text-black">Contact Us</h3>
              </div>
              {rightColumn.map((item, idx) => (
                <div key={idx} className="py-3 -mx-3 px-3 rounded hover:bg-gray-50 cursor-pointer">
                  <p className="text-base font-semibold text-black">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ExploreTripsAdoraDropdown


