import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'

const TabBar = () => {
  const location = useLocation()
  const tabs = [
    { label: 'Profile', to: '/profile' },
    { label: 'Wallet', to: '/profile/wallet' },
    { label: 'Setting', to: '/profile/settings' },
  ]
  return (
    <div className="mb-6">
      <div className="w-full bg-gray-100 rounded-[14px] p-1 flex items-center justify-between">
        {tabs.map((t) => (
          <Link
            key={t.label}
            to={t.to}
            className={`px-5 py-2 rounded-[10px] text-[13px] text-center flex-1 mx-1 ${
              location.pathname === t.to ? 'bg-[#1f3661] text-white shadow-sm' : 'text-gray-800'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

const WalletSettings = () => {
  const navigate = useNavigate()
  const [prefUSD, setPrefUSD] = useState(true)
  const [prefPersonalized, setPrefPersonalized] = useState(true)
  const [prefSaveSearch, setPrefSaveSearch] = useState(true)
  const [cards, setCards] = useState([
    { id: '4242', brand: 'visa', expires: '12/25', default: true },
    { id: '8888', brand: 'mastercard', expires: '06/26', default: false }
  ])

  return (
    <div className="min-h-screen bg-white font-poppins">
      <MainHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <span className="w-4 h-4">←</span>
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
        <p className="text-gray-600 mb-6">Your Profile and Travel Journey</p>

        <TabBar />

        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Wallet Settings</h2>
            <p className="text-sm text-gray-600">Manage payment methods and how prices are displayed.</p>
          </div>
          <button onClick={() => navigate('/profile/wallet')} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm">Back to Wallet</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Display Preferences */}
          <div className="bg-gray-100 rounded-2xl p-6">
            <div className="text-gray-900 font-semibold text-lg mb-2">Display Preferences</div>
            <div className="text-xs text-gray-600 mb-4">Adjust how prices and recommendations are shown to you.</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Show Prices in Selected Currency</div>
                  <div className="text-xs text-gray-600">Convert all prices to USD</div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={prefUSD} onChange={(e)=>setPrefUSD(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition" />
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Show Personalized recommendations</div>
                  <div className="text-xs text-gray-600">Based on your browsing and booking history</div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={prefPersonalized} onChange={(e)=>setPrefPersonalized(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition" />
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Save search history</div>
                  <div className="text-xs text-gray-600">Quick access to recent searches</div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={prefSaveSearch} onChange={(e)=>setPrefSaveSearch(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition" />
                </label>
              </div>
            </div>
          </div>

          {/* Payment Methods & Recent Transactions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-gray-900 font-semibold">Payment Methods</div>
                <Link to="/profile/wallet" className="px-3 py-1.5 rounded-lg border text-sm">+ Add Card</Link>
              </div>
              <div className="space-y-3">
                {cards.map((c)=> (
                  <div key={c.id} className={`flex items-center justify-between p-3 rounded-xl border ${c.default ? 'bg-blue-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-6 rounded ${c.default ? 'bg-blue-200' : 'bg-red-200'}`} />
                      <div>
                        <div className="text-sm font-semibold">•••• •••• •••• {c.id}</div>
                        <div className="text-xs text-gray-600">Expires {c.expires}</div>
                      </div>
                    </div>
                    <div className="text-xs">{c.default ? 'Default' : <button className="text-red-600">Remove</button>}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <div className="text-gray-900 font-semibold mb-3">Recent Transactions</div>
              <div className="space-y-2">
                {[{t:'Rome Ancient wonders Tour', a:'+ $349'}, {t:'Bali Temples Day Trip', a:'- $89'}, {t:'Dubai Desert Safari', a:'- $119'}].map((r, idx)=> (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                    <div className="text-sm">{r.t}</div>
                    <div className={`text-sm ${r.a.includes('+') ? 'text-green-600' : 'text-red-600'}`}>{r.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default WalletSettings


