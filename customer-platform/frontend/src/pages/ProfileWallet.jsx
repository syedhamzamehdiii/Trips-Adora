import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import {
  addBankAccount,
  addPaymentMethod,
  getWallet,
  removeBankAccount,
  removePaymentMethod
} from '../services/walletService'

const DEFAULT_PROFILE_USER_ID = import.meta.env.VITE_CUSTOMER_PROFILE_USER_ID || 'john-doe'

const TabBar = () => {
  const location = useLocation()
  const tabs = [
    { label: 'Profile', to: '/profile' },
    { label: 'Wallet', to: '/profile/wallet' },
    { label: 'Setting', to: '/profile/settings' }
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

const formatDate = (value) => {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (err) {
    return ''
  }
}

const formatAmountLabel = (transaction) => {
  const amount = Number(transaction?.amount || 0)
  const currency = transaction?.currency || 'USD'
  const formatted = formatCurrency(Math.abs(amount), currency)
  return transaction?.direction === 'credit' ? `+${formatted}` : `-${formatted}`
}

const ProfileWallet = () => {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [method, setMethod] = useState('bank')
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [bank, setBank] = useState({
    holder: '',
    bankName: '',
    accountNumber: '',
    swift: '',
    routing: '',
    country: '',
    currency: ''
  })
  const [paypalEmail, setPaypalEmail] = useState('')
  const [payoneerEmail, setPayoneerEmail] = useState('')

  // Compute userId synchronously for initial state
  const userId = localStorage.getItem('customer_profile_user_id') || DEFAULT_PROFILE_USER_ID

  const hasLoadedOnceRef = useRef(false)

  // Load cached wallet immediately on mount (synchronous)
  const [initialWallet] = useState(() => {
    try {
      const cached = localStorage.getItem(`customer_wallet_cache_${userId}`);
      const timestamp = localStorage.getItem(`customer_wallet_cache_ts_${userId}`);
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < 5 * 60 * 1000) { // 5 minutes
          return JSON.parse(cached);
        }
      }
    } catch (_) {
      // Ignore cache errors
    }
    return null;
  })

  // Set initial wallet from cache if available
  useEffect(() => {
    if (initialWallet) {
      setWallet(initialWallet)
      setLoading(false)
      hasLoadedOnceRef.current = true
    }
  }, [initialWallet])

  const fetchWallet = useCallback(async () => {
    // Only show loading if we don't have cached data
    if (!initialWallet) {
      setLoading(true)
    }
    setError(null)
    try {
      const data = await getWallet(userId, true) // Use cache
      setWallet(data)
      hasLoadedOnceRef.current = true
    } catch (err) {
      // Only show error if we don't have cached data
      if (!initialWallet) {
        setError(err?.message || 'Unable to load wallet information.')
      }
    } finally {
      setLoading(false)
    }
  }, [userId, initialWallet])

  useEffect(() => {
    // If we have cached data, fetch fresh in background
    if (initialWallet) {
      fetchWallet() // This will fetch in background
    } else {
      // No cache, fetch immediately
      fetchWallet()
    }
  }, []) // Only run once on mount

  useEffect(() => {
    const handler = () => fetchWallet()
    window.addEventListener('customer_wallet_updated', handler)
    return () => window.removeEventListener('customer_wallet_updated', handler)
  }, [fetchWallet])

  const resetModalState = () => {
    setBank({
      holder: '',
      bankName: '',
      accountNumber: '',
      swift: '',
      routing: '',
      country: '',
      currency: ''
    })
    setPaypalEmail('')
    setPayoneerEmail('')
    setSubmitError(null)
    setSubmitting(false)
  }

  const handleAddMethod = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      if (method === 'bank') {
        if (!bank.holder.trim() || !bank.bankName.trim() || !bank.accountNumber.trim()) {
          throw new Error('Please fill in the account holder, bank name, and account number.')
        }
        const payload = {
          account_holder: bank.holder.trim(),
          bank_name: bank.bankName.trim(),
          account_number: bank.accountNumber.replace(/\s+/g, ''),
          country: bank.country.trim() || undefined,
          currency: bank.currency.trim() || 'USD',
          swift: bank.swift.trim() || undefined,
          routing_number: bank.routing.trim() || undefined
        }
        const data = await addBankAccount(userId, payload)
        setWallet(data)
      } else if (method === 'paypal') {
        const email = paypalEmail.trim()
        if (!email) {
          throw new Error('Please enter the PayPal email address.')
        }
        const data = await addPaymentMethod(userId, {
          method_type: 'paypal',
          brand: 'paypal',
          label: 'PayPal',
          account_identifier: email,
          metadata: { email }
        })
        setWallet(data)
      } else if (method === 'payoneer') {
        const email = payoneerEmail.trim()
        if (!email) {
          throw new Error('Please enter the Payoneer email address.')
        }
        const data = await addPaymentMethod(userId, {
          method_type: 'payoneer',
          brand: 'payoneer',
          label: 'Payoneer',
          account_identifier: email,
          metadata: { email }
        })
        setWallet(data)
      } else {
        throw new Error('Unsupported method type selected.')
      }

      setIsAddOpen(false)
      resetModalState()
      window.dispatchEvent(new CustomEvent('customer_wallet_updated'))
    } catch (err) {
      setSubmitError(err?.message || 'Failed to save payout method.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveBank = async (accountId) => {
    if (!accountId) return
    const confirmRemove = window.confirm('Remove this bank account from your wallet?')
    if (!confirmRemove) return
    try {
      const data = await removeBankAccount(userId, accountId)
      setWallet(data)
      window.dispatchEvent(new CustomEvent('customer_wallet_updated'))
    } catch (err) {
      alert(err?.message || 'Failed to remove bank account.')
    }
  }

const handleRemoveDigital = async (method) => {
  if (!method?.id) return
  const confirmRemove = window.confirm(
    `Remove this ${method.method_type === 'paypal' ? 'PayPal' : 'Payoneer'} account?`
  )
  if (!confirmRemove) return
  try {
    const data = await removePaymentMethod(userId, method.id)
    setWallet(data)
    window.dispatchEvent(new CustomEvent('customer_wallet_updated'))
  } catch (err) {
    alert(err?.message || 'Failed to remove payout method.')
  }
}

  const balances = wallet?.balances
  const preferences = wallet?.preferences
  const bankAccounts = wallet?.bank_accounts || []
  const paymentMethods = wallet?.payment_methods || []
  const digitalMethods = useMemo(
    () =>
      paymentMethods.filter((method) =>
        ['paypal', 'payoneer'].includes((method.method_type || '').toLowerCase())
      ),
    [paymentMethods]
  )
  const paymentHistory = wallet?.payment_history || []

  const balanceCurrency = balances?.currency || 'USD'

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

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 mb-6">
            <p className="font-semibold mb-3">We couldn&apos;t load your wallet data.</p>
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
            Loading wallet information...
          </div>
        ) : (
          <>
            <div className="bg-gray-100 rounded-xl p-4 border mb-4">
              <div className="text-xs font-semibold text-gray-900 mb-2">Balance Overview</div>
              <div className="text-xs text-gray-600">
                Your current balance ({' '}
                <span className="font-semibold">
                  {formatCurrency(balances?.total_balance, balanceCurrency)}
                </span>{' '}
                ) {preferences?.show_prices_in_selected_currency ? 'is displayed in your selected currency' : 'is shown in default currency'}.
                {balances?.simulated_payment_amount ? (
                  <>
                    {' '}Pending payment amount:{' '}
                    <span className="font-semibold">
                      {formatCurrency(balances.simulated_payment_amount, balanceCurrency)}
                    </span>
                    . Please ensure sufficient funds are available.
                  </>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
                <div className="text-xs text-gray-600 mb-2">Total Balance</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(balances?.total_balance, balanceCurrency)}
                </div>
              </div>
              <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
                <div className="text-xs text-gray-600 mb-2">Refund Balance</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(balances?.refund_balance, balanceCurrency)}
                </div>
              </div>
              <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
                <div className="text-xs text-gray-600 mb-2">Penalty</div>
                <div className="text-lg font-semibold text-red-600">
                  {formatCurrency(balances?.penalty ? -Math.abs(balances.penalty) : 0, balanceCurrency)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              {balances?.simulated_payment_amount ? (
                <div className="text-xs text-gray-700 bg-gray-100 border rounded-lg px-4 py-2">
                  Simulated Payment Amount:{' '}
                  {formatCurrency(balances.simulated_payment_amount, balanceCurrency)}
                </div>
              ) : <div />}
              <button
                onClick={() => navigate('/profile/wallet/settings')}
                className="px-4 py-2 rounded-lg bg-[#1f3661] text-white text-sm"
              >
                Manage Payment Methods
              </button>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm mb-6">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="text-gray-900 font-semibold">Bank Accounts</div>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-1.5 rounded-lg bg-[#1f3661] text-white text-sm"
                >
                  + Add New Bank
                </button>
              </div>
              <div className="p-4 space-y-3">
                {bankAccounts.length === 0 ? (
                  <div className="text-sm text-gray-600 text-center py-6">
                    No bank accounts added yet.
                  </div>
                ) : (
                  bankAccounts.map((account) => (
                    <div key={account.id} className="border rounded-xl p-4 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{account.bank_name}</div>
                        <div className="text-xs text-gray-600">{account.account_holder}</div>
                        {account.last4 && (
                          <div className="text-xs text-gray-600">Account •••• {account.last4}</div>
                        )}
                        {account.routing_number_last4 && (
                          <div className="text-xs text-gray-500">Routing •••• {account.routing_number_last4}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 text-right">
                          {account.country && <div>{account.country}</div>}
                          <div>{(account.currency || 'USD').toUpperCase()} account</div>
                        </div>
                        <button
                          onClick={() => handleRemoveBank(account.id)}
                          className="px-3 py-1.5 rounded-lg text-xs text-red-600 border border-red-200 hover:bg-red-50"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm mb-6">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="text-gray-900 font-semibold">Digital Payout Accounts</div>
              </div>
              <div className="p-4 space-y-3">
                {digitalMethods.length === 0 ? (
                  <div className="text-sm text-gray-600 text-center py-6">
                    No PayPal or Payoneer accounts added yet.
                  </div>
                ) : (
                  digitalMethods.map((method) => (
                    <div
                      key={method.id}
                      className="border rounded-xl p-4 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {method.label || method.method_type.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-600">
                          {method.account_identifier || method.metadata?.email || 'Email not available'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 text-right">
                          {method.method_type === 'paypal' ? 'PayPal account' : 'Payoneer account'}
                        </div>
                        <button
                          onClick={() => handleRemoveDigital(method)}
                          className="px-3 py-1.5 rounded-lg text-xs text-red-600 border border-red-200 hover:bg-red-50"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm">
              <div className="p-4 border-b text-gray-900 font-semibold">Payment History</div>
              <div className="p-4 overflow-x-auto">
                {paymentHistory.length === 0 ? (
                  <div className="text-sm text-gray-600 text-center py-6">
                    No wallet transactions recorded yet.
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-600">
                      <tr>
                        <th className="py-2 pr-4">Booking ID</th>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Description</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {paymentHistory.map((transaction) => (
                        <tr key={transaction.id} className="border-t">
                          <td className="py-2 pr-4">{transaction.booking_id || 'N/A'}</td>
                          <td className="py-2 pr-4">{formatDate(transaction.occurred_at)}</td>
                          <td className="py-2 pr-4">{transaction.title}</td>
                          <td className="py-2 pr-4">
                            <Badge
                              color={
                                transaction.status === 'refund'
                                  ? 'bg-purple-100 text-purple-700'
                                  : transaction.direction === 'credit'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }
                            >
                              {transaction.status
                                ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                                : transaction.direction === 'credit'
                                ? 'Credit'
                                : 'Debit'}
                            </Badge>
                          </td>
                          <td className={`py-2 text-right ${transaction.direction === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatAmountLabel(transaction)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddOpen(false)} />
          <div className="relative bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl p-5">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg mb-4">
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="2" width="22" height="14" rx="3" stroke="#1f3661" strokeWidth="1.5" />
                <rect x="3" y="6" width="18" height="2" fill="#1f3661" />
                <rect x="3" y="11" width="6" height="2" fill="#9AA7B2" />
              </svg>
              Add Payout Method
            </div>

            <div className="text-sm text-gray-900 font-semibold mb-2">Select Method</div>

            <div className="space-y-2 mb-4">
              {[
                { id: 'bank', title: 'Bank Transfer', desc: 'Direct bank account transfer' },
                { id: 'paypal', title: 'PayPal', desc: 'Receive payments via PayPal' },
                { id: 'payoneer', title: 'Payoneer', desc: 'Get paid via Payoneer' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setMethod(opt.id)
                    setSubmitError(null)
                  }}
                  className={`w-full text-left border rounded-xl px-4 py-3 hover:bg-gray-50 flex items-start gap-3 ${
                    method === opt.id ? 'ring-2 ring-[#1f3661] bg-white' : ''
                  }`}
                  type="button"
                >
                  <span
                    className={`mt-1 inline-block w-4 h-4 rounded-full border ${
                      method === opt.id ? 'bg-[#1f3661] border-[#1f3661]' : 'border-gray-400'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{opt.title}</div>
                    <div className="text-xs text-gray-600">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

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
                      onChange={(e) => setBank({ ...bank, holder: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bank name</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Chase Bank"
                      value={bank.bankName}
                      onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Account Number / IBAN</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="DE89 3704 0044 0532 0130 00"
                      value={bank.accountNumber}
                      onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">SWIFT / BIC</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="CHASUS33XXX"
                      value={bank.swift}
                      onChange={(e) => setBank({ ...bank, swift: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Routing Number (US)</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="021000021"
                      value={bank.routing}
                      onChange={(e) => setBank({ ...bank, routing: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Country</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="United States"
                      value={bank.country}
                      onChange={(e) => setBank({ ...bank, country: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Currency</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="USD"
                      value={bank.currency}
                      onChange={(e) => setBank({ ...bank, currency: e.target.value })}
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

            {method === 'paypal' && (
              <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900 mb-2">PayPal Account</div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="PayPal Email Address"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                  />
                </div>
                <ul className="text-xs text-gray-600 list-disc ml-4 space-y-1">
                  <li>Ensure this email matches your PayPal account.</li>
                  <li>Transfers typically complete within minutes.</li>
                </ul>
              </div>
            )}

            {method === 'payoneer' && (
              <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900 mb-2">Payoneer Account</div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Payoneer Email Address"
                    value={payoneerEmail}
                    onChange={(e) => setPayoneerEmail(e.target.value)}
                  />
                </div>
                <ul className="text-xs text-gray-600 list-disc ml-4 space-y-1">
                  <li>Use the primary email associated with your Payoneer account.</li>
                  <li>Transfer times depend on your Payoneer plan.</li>
                </ul>
              </div>
            )}

            {submitError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setIsAddOpen(false)
                  resetModalState()
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm w-full"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMethod}
                className="px-4 py-2 rounded-lg bg-[#1f3661] text-white text-sm w-full disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Add method'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default ProfileWallet

