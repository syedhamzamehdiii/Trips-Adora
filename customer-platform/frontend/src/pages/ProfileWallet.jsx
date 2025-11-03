import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
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

const Badge = ({ children, color }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{children}</span>
)

const ProfileWallet = () => {
  const navigate = useNavigate()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [method, setMethod] = useState('paypal')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [payoneerEmail, setPayoneerEmail] = useState('')
  const [bank, setBank] = useState({
    holder: '',
    bankName: '',
    accountNumber: '',
    swift: '',
    routing: '',
    country: '',
    currency: ''
  })
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

        <h2 className="text-lg font-semibold text-gray-900 mb-2">My Wallet</h2>
        <p className="text-sm text-gray-600 mb-4">Manage your balance, payment history, and banking information</p>

        {/* Balance banner */}
        <div className="bg-gray-100 rounded-xl p-4 border mb-4">
          <div className="text-xs font-semibold text-gray-900 mb-2">Insufficient Balance</div>
          <div className="text-xs text-gray-600">
            Your current balance (<span className="font-semibold">$695.50</span>) is insufficient for the pending payment of <span className="font-semibold">$750.00</span>. Please add funds to your wallet or contact support.
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
            <div className="text-xs text-gray-600 mb-2">Total Balance</div>
            <div className="text-lg font-semibold text-gray-900">$695.50</div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
            <div className="text-xs text-gray-600 mb-2">Refund Balance</div>
            <div className="text-lg font-semibold text-green-600">+ $820.50</div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
            <div className="text-xs text-gray-600 mb-2">Penalty</div>
            <div className="text-lg font-semibold text-red-600">- $125.00</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-gray-700 bg-gray-100 border rounded-lg px-4 py-2">Simulated Payment Amount: $750.00</div>
          <button onClick={() => navigate('/profile/wallet/settings')} className="px-4 py-2 rounded-lg bg-[#1f3661] text-white text-sm">Add Payment method</button>
        </div>

        {/* Bank accounts */}
        <div className="bg-white rounded-2xl border shadow-sm mb-6">
            <div className="flex items-center justify-between p-4 border-b">
            <div className="text-gray-900 font-semibold">Bank Accounts</div>
              <button onClick={() => setIsAddOpen(true)} className="px-4 py-1.5 rounded-lg bg-[#1f3661] text-white text-sm">+ Add New Bank</button>
          </div>
          <div className="p-4 space-y-3">
            {["Chase Bank De", "Bank of Japan", "Chase Bank De"].map((bank, idx) => (
              <div key={idx} className="border rounded-xl p-3 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900">{bank}</div>
                <div className="text-xs text-gray-600">John Doe</div>
                <div className="text-xs text-gray-600">•••• •••• •••• 1234</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment history */}
        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="p-4 border-b text-gray-900 font-semibold">Payment History</div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-600">
                <tr>
                  <th className="py-2 pr-4">Booking ID</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                <tr className="border-t">
                  <td className="py-2 pr-4">BK-2024-001</td>
                  <td className="py-2 pr-4">2024-10-10</td>
                  <td className="py-2 pr-4">Hotel Booking Grand Plaza</td>
                  <td className="py-2 pr-4"><Badge color="bg-green-100 text-green-700">Confirmed</Badge></td>
                  <td className="py-2">-$750.00</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 pr-4">BK-2024-001</td>
                  <td className="py-2 pr-4">2024-10-10</td>
                  <td className="py-2 pr-4">Flight Cancellation Refund</td>
                  <td className="py-2 pr-4"><Badge color="bg-purple-100 text-purple-700">Refund</Badge></td>
                  <td className="py-2">+$320.50</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 pr-4">BK-2024-001</td>
                  <td className="py-2 pr-4">2024-10-10</td>
                  <td className="py-2 pr-4">Hotel Booking Grand Plaza</td>
                  <td className="py-2 pr-4"><Badge color="bg-yellow-100 text-yellow-700">Pending</Badge></td>
                  <td className="py-2">+$320.50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddOpen(false)} />
          <div className="relative bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl p-5">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg mb-4">
              {/* Card icon */}
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="2" width="22" height="14" rx="3" stroke="#1f3661" strokeWidth="1.5"/>
                <rect x="3" y="6" width="18" height="2" fill="#1f3661"/>
                <rect x="3" y="11" width="6" height="2" fill="#9AA7B2"/>
              </svg>
              Add Payment Method
            </div>

            <div className="text-sm text-gray-900 font-semibold mb-2">Select Payment Method</div>

            <div className="space-y-2 mb-4">
              {[{id:'paypal', title:'Paypal', desc:'Receive Payments via PayPal'},
                {id:'bank', title:'Bank Transfer', desc:'Direct bank account transfer'},
                {id:'payoneer', title:'Payoneer', desc:'Get directly in Payoneer'}].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMethod(opt.id)}
                  className={`w-full text-left border rounded-xl px-4 py-3 hover:bg-gray-50 flex items-start gap-3 ${method===opt.id ? 'ring-2 ring-[#1f3661] bg-white' : ''}`}
                >
                  <span className={`mt-1 inline-block w-4 h-4 rounded-full border ${method===opt.id ? 'bg-[#1f3661] border-[#1f3661]' : 'border-gray-400'}`} />
                  {/* Provider logo */}
                  {opt.id === 'paypal' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                      <path d="M8 19l2-14h6.5a3.5 3.5 0 010 7H13l-.5 3H11l-.5 4H8z" stroke="#E15241" strokeWidth="1.5" fill="none"/>
                    </svg>
                  )}
                  {opt.id === 'bank' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                      <path d="M4 10h16M5 10V8l7-4 7 4v2M5 10v8m14-8v8M3 18h18" stroke="#21A366" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  {opt.id === 'payoneer' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
                      <rect x="3" y="6" width="18" height="12" rx="2" stroke="#2F6BFF" strokeWidth="1.5"/>
                      <rect x="5" y="10" width="6" height="2" fill="#2F6BFF"/>
                      <rect x="13" y="10" width="6" height="2" fill="#2F6BFF"/>
                    </svg>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{opt.title}</div>
                    <div className="text-xs text-gray-600">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {method === 'paypal' && (
              <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900 mb-2">PayPal Account Details</div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="PayPal Email Address"
                    value={paypalEmail}
                    onChange={(e)=>setPaypalEmail(e.target.value)}
                  />
                  <button className="px-3 py-2 rounded-lg border text-xs">Verify Email</button>
                </div>
                <ul className="text-xs text-gray-600 list-disc ml-4 space-y-1">
                  <li>Upto 1 Business day</li>
                  <li>Fees may apply</li>
                </ul>
              </div>
            )}

            {method === 'bank' && (
              <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900 mb-2">Bank Account Details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Account holder name</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="John Doe"
                      value={bank.holder}
                      onChange={(e)=>setBank({...bank, holder:e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bank name</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Chase Bank"
                      value={bank.bankName}
                      onChange={(e)=>setBank({...bank, bankName:e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Account Number / IBAN</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="DE89 3704 0044 0532 0130 00"
                      value={bank.accountNumber}
                      onChange={(e)=>setBank({...bank, accountNumber:e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">SWIFT / BIC</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="CHASUS33XXX"
                      value={bank.swift}
                      onChange={(e)=>setBank({...bank, swift:e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Routing Number (US)</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="021000021"
                      value={bank.routing}
                      onChange={(e)=>setBank({...bank, routing:e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Country</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="United States"
                      value={bank.country}
                      onChange={(e)=>setBank({...bank, country:e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Currency</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="USD"
                      value={bank.currency}
                      onChange={(e)=>setBank({...bank, currency:e.target.value})}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-2">Instructions:</div>
                <ul className="text-xs text-gray-600 list-disc ml-4 space-y-1">
                  <li>Ensure the account holder name exactly matches your legal name or business name.</li>
                  <li>IBAN required for EU/UK transfers; SWIFT/BIC required for international transfers.</li>
                  <li>Routing number is required for US domestic transfers only.</li>
                  <li>Transfers typically arrive in 1–3 business days. Bank fees may apply.</li>
                </ul>
              </div>
            )}

            {method === 'payoneer' && (
              <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900 mb-2">Payoneer Account Details</div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Payoneer Email Address"
                    value={payoneerEmail}
                    onChange={(e)=>setPayoneerEmail(e.target.value)}
                  />
                  <button className="px-3 py-2 rounded-lg border text-xs">Verify Email</button>
                </div>
                <ul className="text-xs text-gray-600 list-disc ml-4 space-y-1">
                  <li>Transfers to Payoneer are typically instant</li>
                  <li>Fees may apply depending on your plan</li>
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm w-full">Cancel</button>
              <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-lg bg-[#1f3661] text-white text-sm w-full">Add method</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ProfileWallet


