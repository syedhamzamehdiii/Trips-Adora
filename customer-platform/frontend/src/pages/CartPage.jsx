import React, { useState, useEffect } from 'react'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiMapPin, FiClock, FiUsers, FiArrowLeft, FiTrash2 } from 'react-icons/fi'

const CartPage = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      // Ensure each item has a quantity (default 1)
      const parsed = JSON.parse(savedCart)
      const withQty = parsed.map(i => ({ ...i, quantity: typeof i.quantity === 'number' && i.quantity > 0 ? i.quantity : 1 }))
      setCartItems(withQty)
      localStorage.setItem('cart', JSON.stringify(withQty))
    }
  }, [])

  const handleRemoveFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const updateQuantity = (itemId, delta) => {
    setCartItems(prev => {
      const next = prev.map(item => {
        if (item.id !== itemId) return item
        const nextQty = Math.max(1, (item.quantity || 1) + delta)
        return { ...item, quantity: nextQty }
      })
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
  }

  const totalItems = () => cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0
      const qty = item.quantity || 1
      return sum + price * qty
    }, 0)
  }

  return (
    <div className="bg-gray-50">
      <MainHeader />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Title */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <FiShoppingCart className="w-6 h-6" style={{ color: '#1d236b' }} />
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <div className="w-16"></div> {/* Spacer */}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <FiShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600">Start adding items to your cart to begin booking!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                  <div className="p-6 flex gap-6">
                    {/* Image */}
                    <div className="w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                            <FiMapPin className="w-4 h-4" />
                            <span>{item.location || 'Japan'}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveFromCart(item.id)} 
                          className="p-2 hover:bg-red-50 rounded-full transition"
                        >
                          <FiTrash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-400">★★★★★</span>
                        <span className="text-sm text-gray-700">{item.rating || 4.8}</span>
                        <span className="text-sm text-gray-500">({item.reviews || '384'})</span>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          <span>{item.duration || '8 hours'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{item.groupSize || 'Up to 12'}</span>
                        </div>
                      </div>

                      {/* Price + Quantity */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          {item.oldPrice && (
                            <span className="text-sm text-gray-400 line-through mr-2">{item.oldPrice}</span>
                          )}
                          <span className="text-2xl font-bold" style={{ color: '#1d236b' }}>{item.price}</span>
                        </div>
                        {/* Quantity control */}
                        <div className="flex items-center text-white rounded-full px-4 py-1.5 gap-4" style={{ backgroundColor: '#1d236b' }}>
                          <button onClick={() => updateQuantity(item.id, +1)} className="w-7 h-7 rounded-full border border-white/50 grid place-items-center text-lg leading-none">+</button>
                          <span className="min-w-[18px] text-center text-base font-semibold">{item.quantity || 1}</span>
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full border border-white/50 grid place-items-center text-lg leading-none">−</button>
                        </div>
                      </div>

                      {/* Check Availability Button */}
                      <div className="flex justify-center">
                        <button 
                          onClick={() => navigate('/check-availability', { state: { ...item, from: 'cart' } })}
                          className="text-white px-8 py-2 rounded-lg font-semibold transition" 
                          style={{ backgroundColor: '#1d236b' }}
                        >
                          Check Availability
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})</span>
                    <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Service Fee</span>
                    <span className="font-semibold">$0</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-gray-900">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-lg">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Link to="/search" className="block w-full text-center font-medium" style={{ color: '#1d236b' }}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
      
      <Footer />
    </div>
  )
}

export default CartPage
