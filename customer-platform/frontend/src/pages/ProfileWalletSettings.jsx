import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import {
  addPaymentMethod,
  getWallet,
  removePaymentMethod,
  setDefaultPaymentMethod,
  updateWallet
} from '../services/walletService'

const DEFAULT_PROFILE_USER_ID = import.meta.env.VITE_CUSTOMER_PROFILE_USER_ID || 'john-doe'

const formatCurrency = (value = 0, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(value || 0)
  } catch (err) {
    return `$${Number(value || 0).toFixed(0)}`
  }
}

const WalletSettings = () => {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingCard, setAddingCard] = useState(false)
  const [preferencesUpdating, setPreferencesUpdating] = useState(false)
  const [prefError, setPrefError] = useState(null)
  const [cardsError, setCardsError] = useState(null)
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })

  const userId = useMemo(
    () => localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID,
    []
  )

  const hasLoadedOnceRef = useRef(false)

  const fetchWallet = useCallback(async () => {
    setLoading(!hasLoadedOnceRef.current)
    setError(null)
    try {
      const data = await getWallet(userId)
      setWallet(data)
      hasLoadedOnceRef.current = true
    } catch (err) {
      setError(err?.message || 'Unable to load wallet settings.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  useEffect(() => {
    const handler = () => fetchWallet()
    window.addEventListener('customer_wallet_updated', handler)
    return () => window.removeEventListener('customer_wallet_updated', handler)
  }, [fetchWallet])

  const preferences = wallet?.preferences || {
    show_prices_in_selected_currency: true,
    show_personalized_recommendations: true,
    save_search_history: true
  }

  const paymentMethods = (wallet?.payment_methods || []).filter((method) => method.method_type === 'card')
  const digitalMethods = (wallet?.payment_methods || []).filter((method) =>
    ['paypal', 'payoneer'].includes(method.method_type)
  )

  const handlePreferencesToggle = async (key) => {
    setPrefError(null)
    setPreferencesUpdating(true)
    try {
      const updated = await updateWallet(userId, {
        preferences: {
          ...preferences,
          [key]: !preferences[key]
        }
      })
      setWallet(updated)
      window.dispatchEvent(new CustomEvent('customer_wallet_updated'))
    } catch (err) {
      setPrefError(err?.message || 'Unable to update preferences right now.')
    } finally {
      setPreferencesUpdating(false)
    }
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
    }
    return v
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setCardForm({ ...cardForm, cardNumber: formatted })
  }

  const handleAddCard = async () => {
    if (!cardForm.cardNumber || !cardForm.cardholderName || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) {
      setCardsError('Please fill in all card details.')
      return
    }
    setCardsError(null)
    setAddingCard(true)
    try {
      const digits = cardForm.cardNumber.replace(/\s/g, '')
      const last4 = digits.slice(-4)
      const firstDigit = digits?.[0]
      let brand = 'visa'
      if (firstDigit === '5' || firstDigit === '2') {
        brand = 'mastercard'
      } else if (firstDigit === '3') {
        brand = 'amex'
      }
      const payload = {
        method_type: 'card',
        brand,
        label: brand.toUpperCase(),
        last4,
        exp_month: Number(cardForm.expiryMonth),
        exp_year: Number(cardForm.expiryYear),
        cardholder: cardForm.cardholderName.trim(),
        is_default: paymentMethods.length === 0
      }
      const updated = await addPaymentMethod(userId, payload)
      setWallet(updated)
      setIsAddCardOpen(false)
      setCardForm({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      })
      window.dispatchEvent(new CustomEvent('customer_wallet_updated'))
    } catch (err) {
      setCardsError(err?.message || 'Unable to add card at the moment.')
    } finally {
      setAddingCard(false)
    }
  }

  const handleRemoveCard = async (methodId) => {
    if (!methodId) return
    const confirmRemove = window.confirm('Remove this card from your wallet?')
    if (!confirmRemove) return
    try {
      const updated = await removePaymentMethod(userId, methodId)
      setWallet(updated)
      window.dispatchEvent(new CustomEvent('customer_wallet_updated'))
    } catch (err) {
      alert(err?.message || 'Unable to remove card right now.')
    }
  }

  const handleSetDefault = async (methodId) => {
    if (!methodId) return
    try {
      const updated = await setDefaultPaymentMethod(userId, methodId)
      setWallet(updated)
      window.dispatchEvent(new CustomEvent('customer_wallet_updated'))
    } catch (err) {
      alert(err?.message || 'Unable to set this card as default right now.')
    }
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Wallet Settings</h2>
            <p className="text-sm text-gray-600">Manage payment methods and how prices are displayed.</p>
          </div>
          <button
            onClick={() => navigate('/profile/wallet')}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm"
          >
            Back to Wallet
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
            <p className="font-semibold mb-3">We couldn&apos;t load your wallet settings.</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchWallet}
              className="px-4 py-2 bg-[#1f3661] text-white rounded-lg text-sm"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center text-gray-500">
            Loading wallet settings...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <div className="text-gray-900 font-semibold mb-3">Recent Transactions</div>
              <div className="space-y-2">
                {(wallet?.recent_transactions || []).length === 0 ? (
                  <div className="text-sm text-gray-600 text-center py-6">No recent transactions recorded.</div>
                ) : (
                  wallet.recent_transactions.slice(0, 6).map((txn) => {
                    const debit = txn.direction !== 'credit'
                    return (
                      <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{txn.title}</div>
                          <div className="text-xs text-gray-600">{new Date(txn.occurred_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                        <div className={`text-sm font-semibold ${debit ? 'text-red-600' : 'text-green-600'}`}>
                          {debit ? '-' : '+'}
                          {formatCurrency(Math.abs(txn.amount), txn.currency || 'USD')}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-gray-900 font-semibold">Payment Methods</div>
                  <button
                    onClick={() => {
                      setIsAddCardOpen(true)
                      setCardsError(null)
                    }}
                    className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    + Add Card
                  </button>
                </div>
                <div className="space-y-3">
                  {cardsError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {cardsError}
                    </div>
                  )}
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">No cards added yet</div>
                  ) : (
                  paymentMethods.map((method) => {
                    const brandKey = (method.brand || '').toLowerCase()
                    const palette = {
                      visa: { bg: 'bg-[#0e2c6d]', badge: 'VISA' },
                      mastercard: { bg: 'bg-[#c81d24]', badge: 'MC' },
                      amex: { bg: 'bg-[#0086b3]', badge: 'AMEX' }
                    }
                    const swatch = palette[brandKey] || { bg: 'bg-[#1f3661]', badge: (method.brand || 'CARD').slice(0, 4).toUpperCase() }
                    const identifier = `•••• ${method.last4 || method.id?.slice(-4)}`
                    const expiry =
                      method.exp_month && method.exp_year
                        ? `${String(method.exp_month).padStart(2, '0')}/${String(method.exp_year).slice(-2)}`
                        : null

                    return (
                      <div
                        key={method.id}
                        className={`rounded-2xl border ${method.is_default ? 'border-blue-100 bg-blue-50' : 'border-gray-200 bg-white'} shadow-sm px-5 py-4 flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-8 rounded-lg text-white text-xs font-bold uppercase flex items-center justify-center ${swatch.bg}`}>
                            {swatch.badge}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{identifier}</div>
                            {expiry && <div className="text-xs text-gray-600">Expires {expiry}</div>}
                            {method.cardholder && <div className="text-xs text-gray-500 mt-1">{method.cardholder}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.is_default ? (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                              Default
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleSetDefault(method.id)}
                                className="px-2 py-1 rounded border text-xs text-gray-700 hover:bg-gray-50"
                                type="button"
                              >
                                Set Default
                              </button>
                              <button
                                onClick={() => handleRemoveCard(method.id)}
                                className="px-2 py-1 rounded text-xs text-red-600 hover:bg-red-50"
                                type="button"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                  )}
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl p-4">
                <div className="text-gray-900 font-semibold text-lg mb-1">Display Preferences</div>
                <div className="text-xs text-gray-600 mb-3">Adjust how prices and recommendations are shown to you.</div>
                {prefError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                    {prefError}
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Show Prices in Selected Currency</div>
                      <div className="text-xs text-gray-600">Convert all prices to your preferred currency</div>
                    </div>
                    <button
                      onClick={() => handlePreferencesToggle('show_prices_in_selected_currency')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                        preferences.show_prices_in_selected_currency ? 'bg-blue-600' : 'bg-gray-300'
                      } ${preferencesUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={preferencesUpdating}
                      type="button"
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          preferences.show_prices_in_selected_currency ? 'translate-x-6' : 'translate-x-1'
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
                      onClick={() => handlePreferencesToggle('show_personalized_recommendations')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                        preferences.show_personalized_recommendations ? 'bg-blue-600' : 'bg-gray-300'
                      } ${preferencesUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={preferencesUpdating}
                      type="button"
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          preferences.show_personalized_recommendations ? 'translate-x-6' : 'translate-x-1'
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
                      onClick={() => handlePreferencesToggle('save_search_history')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                        preferences.save_search_history ? 'bg-blue-600' : 'bg-gray-300'
                      } ${preferencesUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={preferencesUpdating}
                      type="button"
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          preferences.save_search_history ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddCardOpen(false)} />
          <div className="relative bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="2" width="22" height="14" rx="3" stroke="#1f3661" strokeWidth="1.5" />
                  <rect x="3" y="6" width="18" height="2" fill="#1f3661" />
                  <rect x="3" y="11" width="6" height="2" fill="#9AA7B2" />
                </svg>
                Add New Card
              </div>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
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
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
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
                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((year) => (
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
                    onChange={(e) =>
                      setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })
                    }
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddCardOpen(false)
                  setCardsError(null)
                }}
                className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-800 text-sm font-medium w-full hover:bg-gray-200"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                className="px-4 py-2.5 rounded-lg bg-[#1f3661] text-white text-sm font-medium w-full hover:bg-[#1a2d4f] disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                disabled={addingCard}
              >
                {addingCard ? 'Adding...' : 'Add Card'}
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

