import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'

const SettingsModal = ({ isOpen, onClose, profileRef }) => {
  const navigate = useNavigate()
  const [supplierMode, setSupplierMode] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  // Initialize supplier mode from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('tripsadora_mode')
      if (savedMode === 'supplier') {
        setSupplierMode(true)
      } else if (savedMode === 'customer') {
        setSupplierMode(false)
      }
    } catch (_) {}
  }, [])

  // Re-sync when modal opens and on cross-tab storage changes
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const savedMode = localStorage.getItem('tripsadora_mode')
        setSupplierMode(savedMode === 'supplier')
      } catch (_) {}
    }

    if (isOpen) {
      syncFromStorage()
    }

    window.addEventListener('storage', syncFromStorage)
    return () => window.removeEventListener('storage', syncFromStorage)
  }, [isOpen])

  // Position modal relative to profile button
  useEffect(() => {
    if (isOpen && profileRef?.current) {
      const rect = profileRef.current.getBoundingClientRect()
      const modalWidth = 330
      
      // Position modal below profile icon, right-aligned with the icon
      let left = rect.right - modalWidth
      
      // Ensure modal doesn't go off the left edge
      if (left < 10) {
        left = 10
      }
      
      setPosition({
        top: rect.bottom + 10,
        left: left
      })
    }
  }, [isOpen, profileRef])

  if (!isOpen) return null

  const menuItems = [
    { label: 'My Account' },
    { label: 'My Wallet' },
    { label: 'Your opinion' },
    { label: 'Settings' },
    { label: 'Support' }
  ]

  function handleSupplierToggle() {
    const next = !supplierMode
    setSupplierMode(next)

    try {
      if (next) {
        localStorage.setItem('tripsadora_mode', 'supplier')
        const supplierUrl = import.meta?.env?.VITE_SUPPLIER_APP_URL || 'http://localhost:5173'
        if (supplierUrl) {
          if (onClose) onClose()
          setTimeout(() => {
            window.location.assign(supplierUrl)
          }, 0)
        }
      } else {
        localStorage.setItem('tripsadora_mode', 'customer')
      }
    } catch (_) {}
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#7A6F68]/20 z-50"
        onClick={onClose}
      />
      
      {/* Modal positioned below profile icon */}
      <div 
        className="fixed z-50 pointer-events-none"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="bg-white rounded-[24px] shadow-xl w-[330px] pointer-events-auto">
          {/* Header */}
          <div className="px-5 pt-6 pb-4">
            <h2 className="text-[26px] font-bold text-black">Settings</h2>
          </div>

          {/* Menu Items */}
          <div>
            {/* Supplier Mode */}
            <div className="flex items-center justify-between px-5 py-[14px] border-b border-gray-200/60">
              <span className="text-[15px] font-medium text-black">Supplier mode</span>
              <button
                onClick={handleSupplierToggle}
                className={`relative inline-flex h-[21px] w-[42px] items-center rounded-full transition-colors ${
                  supplierMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-[17px] w-[17px] transform rounded-full bg-white shadow transition-transform ${
                    supplierMode ? 'translate-x-[20px]' : 'translate-x-[4px]'
                  }`}
                />
              </button>
            </div>

            {/* Other Menu Items */}
            {menuItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-5 py-[14px] border-b border-gray-200/60 cursor-pointer active:bg-gray-50 transition-colors"
                onClick={() => {
                  if (item.label === 'My Account') {
                    if (onClose) onClose()
                    navigate('/profile')
                  } else if (item.label === 'My Wallet') {
                    if (onClose) onClose()
                    navigate('/profile/wallet')
                  } else if (item.label === 'Settings') {
                    if (onClose) onClose()
                    navigate('/profile/settings')
                  }
                }}
              >
                <span className="text-[15px] font-medium text-black">{item.label}</span>
                <FiChevronRight className="text-gray-500 text-[18px]" />
              </div>
            ))}
          </div>

          {/* Sign Out Button */}
          <div className="px-5 pt-4 pb-6">
            <button
              onClick={() => {
                // Handle sign out
                console.log('Sign out clicked')
                onClose()
              }}
              className="w-full py-3 text-center text-[#EF3C3C] font-semibold text-[16px] active:bg-red-50/30 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsModal

