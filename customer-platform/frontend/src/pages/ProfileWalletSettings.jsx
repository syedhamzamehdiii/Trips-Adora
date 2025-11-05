import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'

const WalletSettings = () => {
  const navigate = useNavigate()
  const [prefUSD, setPrefUSD] = useState(true)
  const [prefPersonalized, setPrefPersonalized] = useState(true)
  const [prefSaveSearch, setPrefSaveSearch] = useState(true)
  const [cards, setCards] = useState([
    { id: '4242', brand: 'visa', expires: '12/25', default: true, cardholder: 'John Doe' },
    { id: '8888', brand: 'mastercard', expires: '06/26', default: false, cardholder: 'John Doe' }
  ])
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })

  const handleAddCard = () => {
    if (!cardForm.cardNumber || !cardForm.cardholderName || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) {
      alert('Please fill in all card details')
      return
    }

    // Extract last 4 digits
    const lastFour = cardForm.cardNumber.replace(/\s/g, '').slice(-4)
    
    // Determine card brand based on first digit
    let brand = 'visa'
    const firstDigit = cardForm.cardNumber.replace(/\s/g, '')[0]
    if (firstDigit === '5' || firstDigit === '2') {
      brand = 'mastercard'
    } else if (firstDigit === '3') {
      brand = 'amex'
    }

    // Format expiry date
    const expires = `${cardForm.expiryMonth}/${cardForm.expiryYear.slice(-2)}`

    // Add new card (set as default if it's the first card, otherwise not default)
    const newCard = {
      id: lastFour,
      brand: brand,
      expires: expires,
      default: cards.length === 0,
      cardholder: cardForm.cardholderName
    }

    // If this is set as default, remove default from other cards
    let updatedCards = [...cards, newCard]
    if (cards.length > 0 && !cards.some(c => c.default)) {
      updatedCards = updatedCards.map(c => 
        c.id === newCard.id ? { ...c, default: true } : { ...c, default: false }
      )
    }

    setCards(updatedCards)
    
    // Reset form and close modal
    setCardForm({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    })
    setIsAddCardOpen(false)
  }

  const handleRemoveCard = (cardId) => {
    if (window.confirm('Are you sure you want to remove this card?')) {
      const updatedCards = cards.filter(c => c.id !== cardId)
      // If removed card was default and there are other cards, set first one as default
      const removedWasDefault = cards.find(c => c.id === cardId)?.default
      if (removedWasDefault && updatedCards.length > 0) {
        updatedCards[0].default = true
      }
      setCards(updatedCards)
    }
  }

  const handleSetDefault = (cardId) => {
    setCards(cards.map(c => ({ ...c, default: c.id === cardId })))
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setCardForm({ ...cardForm, cardNumber: formatted })
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Wallet Settings</h2>
            <p className="text-sm text-gray-600">Manage payment methods and how prices are displayed.</p>
          </div>
          <button onClick={() => navigate('/profile/wallet')} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm">Back to Wallet</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <div className="text-gray-900 font-semibold mb-3">Recent Transactions</div>
            <div className="space-y-2">
              {[
                {t:'Rome Ancient wonders Tour', d:'Sep 15, 2025', a:'-$349'},
                {t:'Bali Temples Day Trip', d:'Aug 10, 2025', a:'-$89'},
                {t:'Dubai Desert Safari', d:'Jul 05, 2025', a:'-$119'},
                {t:'Paris City Tour', d:'Jun 20, 2025', a:'-$225'},
                {t:'Tokyo Cultural Experience', d:'May 12, 2025', a:'-$180'},
                {t:'London Historical Walk', d:'Apr 08, 2025', a:'-$95'}
              ].map((r, idx)=> (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{r.t}</div>
                    <div className="text-xs text-gray-600">{r.d}</div>
                  </div>
                  <div className={`text-sm font-semibold ${r.a.includes('+') ? 'text-green-600' : 'text-red-600'}`}>{r.a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Payment Methods & Display Preferences */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-gray-900 font-semibold">Payment Methods</div>
                <button onClick={() => setIsAddCardOpen(true)} className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">+ Add Card</button>
              </div>
              <div className="space-y-3">
                {cards.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">No cards added yet</div>
                ) : (
                  cards.map((c)=> (
                    <div key={c.id} className={`flex items-center justify-between p-3 rounded-xl border ${c.default ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-7 rounded flex items-center justify-center ${c.default ? 'bg-blue-600' : c.brand === 'visa' ? 'bg-blue-900' : c.brand === 'mastercard' ? 'bg-red-600' : 'bg-gray-800'}`}>
                          {c.brand === 'visa' && (
                            <span className="text-white text-xs font-bold">VISA</span>
                          )}
                          {c.brand === 'mastercard' && (
                            <span className="text-white text-xs font-bold">MC</span>
                          )}
                          {c.brand === 'amex' && (
                            <span className="text-white text-xs font-bold">AMEX</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">•••• •••• •••• {c.id}</div>
                          <div className="text-xs text-gray-600">Expires {c.expires}</div>
                          {c.cardholder && <div className="text-xs text-gray-500">{c.cardholder}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.default ? (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Default</span>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleSetDefault(c.id)}
                              className="px-2 py-1 rounded border text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Set Default
                            </button>
                            <button 
                              onClick={() => handleRemoveCard(c.id)}
                              className="px-2 py-1 rounded text-xs text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Display Preferences */}
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="text-gray-900 font-semibold text-lg mb-1">Display Preferences</div>
              <div className="text-xs text-gray-600 mb-3">Adjust how prices and recommendations are shown to you.</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Show Prices in Selected Currency</div>
                    <div className="text-xs text-gray-600">Convert all prices to USD</div>
                  </div>
                  <button
                    onClick={() => setPrefUSD(!prefUSD)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      prefUSD ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        prefUSD ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Show Personalized recommendations</div>
                    <div className="text-xs text-gray-600">Based on your browsing and booking history</div>
                  </div>
                  <button
                    onClick={() => setPrefPersonalized(!prefPersonalized)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      prefPersonalized ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        prefPersonalized ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Save search history</div>
                    <div className="text-xs text-gray-600">Quick access to recent searches</div>
                  </div>
                  <button
                    onClick={() => setPrefSaveSearch(!prefSaveSearch)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      prefSaveSearch ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        prefSaveSearch ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddCardOpen(false)} />
          <div className="relative bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="2" width="22" height="14" rx="3" stroke="#1f3661" strokeWidth="1.5"/>
                  <rect x="3" y="6" width="18" height="2" fill="#1f3661"/>
                  <rect x="3" y="11" width="6" height="2" fill="#9AA7B2"/>
                </svg>
                Add New Card
              </div>
              <button 
                onClick={() => setIsAddCardOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Card Number</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1f3661] focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                  value={cardForm.cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1f3661] focus:border-transparent"
                  placeholder="John Doe"
                  value={cardForm.cardholderName}
                  onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Month</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1f3661] focus:border-transparent"
                    value={cardForm.expiryMonth}
                    onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value })}
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={String(month).padStart(2, '0')}>
                        {String(month).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#1f3661] focus:border-transparent"
                    value={cardForm.expiryYear}
                    onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value })}
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">CVV</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1f3661] focus:border-transparent"
                    placeholder="123"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-6">
              <button 
                onClick={() => setIsAddCardOpen(false)} 
                className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium w-full hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCard}
                className="px-4 py-2.5 rounded-lg bg-[#1f3661] text-white text-sm font-medium w-full hover:bg-[#1a2d4f]"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default WalletSettings


