import React, { useMemo, useState, useEffect, useRef } from 'react'
import Footer from '@/components/common/Footer'
import { FiDownload, FiSearch } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import dashboardService from '@/services/dashboardService'

const FinancePage = () => {
  // Real-time finance data derived from bookings in storage
  const [bookings, setBookings] = useState([])
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({ totalEarning: 0, pendingPayout: 0, lossFromCancellation: 0, paidThisMonth: 0 })
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const parseAmount = (v) => {
    if (typeof v === 'number') return v
    if (typeof v === 'string') return parseFloat(v.replace(/[^0-9.]/g, '')) || 0
    return 0
  }

  const formatCurrency = (n) => {
    return `$ ${Math.round(n).toLocaleString()}`
  }

  const toMonthKey = (dateStr) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'Unknown'
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  }

  const monthLabel = (key) => {
    const [y, m] = key.split('-').map(Number)
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const overview = await dashboardService.getOverview()
        if (!isMounted) return

        const bookingItems = Array.isArray(overview?.bookings?.items)
          ? overview.bookings.items
          : []
        setBookings(bookingItems)
      } catch (err) {
        if (!isMounted) return
        setBookings([])
        setError(err?.message || 'Unable to load finance data.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    const handleRefresh = () => load()
    window.addEventListener('bookings_updated', handleRefresh)
    window.addEventListener('products_updated', handleRefresh)

    return () => {
      isMounted = false
      window.removeEventListener('bookings_updated', handleRefresh)
      window.removeEventListener('products_updated', handleRefresh)
    }
  }, [])

  // Derive finance rows, summary, and chart from bookings
  useEffect(() => {
    // Table rows (bookings for payout)
    const derivedRows = (bookings || []).map((b, idx) => {
      const retail = parseAmount(b.amount)
      const net = Math.max(0, retail * 0.8)
      const payable = net
      const payoutStatus = b.payoutStatus || ((b.status === 'Confirmed' || b.status === 'Completed' || b.status === 'Pending') ? 'Ready for Payout' : (b.status === 'Refund/Dispute' || b.status === 'Refund' ? 'Refund' : 'Paid'))
      return {
        bookingRef: b.referenceCode || `BK-${idx+1}`,
        leadTraveller: b.customerName || 'N/A',
        productCode: String(b.productId || b.productCode || '').replace('ID: ','') || 'N/A',
        activityDate: b.travelDate || b.bookedOn || '—',
        retailPrice: `$${retail.toFixed(0)}`,
        netPrice: `$${net.toFixed(0)}`,
        netPayable: `$${payable.toFixed(0)}`,
        status: payoutStatus === 'Paid' ? 'Paid' : 'Ready for Payout',
      }
    })
    setRows(derivedRows)

    // Summary cards
    const totals = (bookings || []).reduce((acc, b) => {
      const amt = parseAmount(b.amount)
      const monthKey = toMonthKey(b.bookedOn || b.travelDate)
      if (b.status === 'Canceled' || b.status === 'Cancelled' || b.status === 'Refund/Dispute' || b.status === 'Refund') {
        acc.lossFromCancellation += amt
      }
      const paid = (b.payoutStatus === 'Paid')
      const ready = !paid && (b.status === 'Confirmed' || b.status === 'Completed' || b.status === 'Pending')
      if (ready) acc.pendingPayout += amt * 0.8
      if (paid) acc.totalPaid += amt * 0.8
      acc.totalEarning += amt
      acc.byMonth[monthKey] = acc.byMonth[monthKey] || { paid: 0, ready: 0 }
      if (paid) acc.byMonth[monthKey].paid += amt * 0.8
      else if (ready) acc.byMonth[monthKey].ready += amt * 0.8
      return acc
    }, { totalEarning: 0, pendingPayout: 0, totalPaid: 0, lossFromCancellation: 0, byMonth: {} })

    // Paid this month
    const now = new Date()
    const currentKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
    const currentMonth = totals.byMonth[currentKey] || { paid: 0 }

    setSummary({
      totalEarning: totals.totalEarning,
      pendingPayout: totals.pendingPayout,
      lossFromCancellation: totals.lossFromCancellation,
      paidThisMonth: currentMonth.paid,
    })

    // Chart for last 4 months
    const keys = Object.keys(totals.byMonth).sort().slice(-4)
    const data = keys.map(k => ({ month: monthLabel(k), series1: Math.round(totals.byMonth[k].ready), series2: Math.round(totals.byMonth[k].paid) }))
    setChartData(data.length ? data : [
      { month: 'Oct', series1: 0, series2: 0 },
      { month: 'Nov', series1: 0, series2: 0 },
      { month: 'Dec', series1: 0, series2: 0 },
      { month: 'Jan', series1: 0, series2: 0 },
    ])
  }, [bookings])

  const [searchTerm, setSearchTerm] = useState('')
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows
    const q = searchTerm.trim().toLowerCase()
    return rows.filter(r =>
      r.bookingRef.toLowerCase().includes(q) ||
      r.leadTraveller.toLowerCase().includes(q) ||
      r.productCode.toLowerCase().includes(q) ||
      r.activityDate.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    )
  }, [rows, searchTerm])

  // Selection state
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const isAllSelected = useMemo(() => {
    if (filteredRows.length === 0) return false
    return filteredRows.every(r => selectedIds.has(r.bookingRef))
  }, [filteredRows, selectedIds])

  const toggleRow = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      const allVisibleIds = filteredRows.map(r => r.bookingRef)
      const allSelected = allVisibleIds.every(id => next.has(id))
      if (allSelected) {
        allVisibleIds.forEach(id => next.delete(id))
      } else {
        allVisibleIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  // Tabs
  const tabs = [
    { id: 'bookings', label: 'Bookings for Payout' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'confirmation', label: 'Payment Confirmation' },
    { id: 'settings', label: 'Payment Setting' },
  ]
  const [activeTab, setActiveTab] = useState('bookings')

  // Invoices from storage (fallback derived from bookings)
  const [invoices, setInvoices] = useState([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('invoices') || sessionStorage.getItem('invoices')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setInvoices(parsed)
      } else {
        const derived = (bookings || []).slice(0, 4).map((b, i) => ({
          date: b.bookedOn || b.travelDate || new Date().toDateString(),
          invoiceNo: `INV-${new Date().getFullYear()}-${String(i+1).padStart(3,'0')}`,
          amount: `$${parseAmount(b.amount).toFixed(1)}`,
          dueDate: b.travelDate || b.bookedOn || new Date().toDateString(),
          status: (b.payoutStatus === 'Paid') ? 'Paid' : 'Pending'
        }))
        setInvoices(derived)
      }
    } catch (_) {}
  }, [bookings])

  // Payment confirmations from storage (fallbacks)
  const [confirmations, setConfirmations] = useState([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('payment_confirmations') || sessionStorage.getItem('payment_confirmations')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setConfirmations(parsed)
      } else {
        // derive basic confirmations from paid bookings
        const derived = (bookings || [])
          .filter(b => b.payoutStatus === 'Paid')
          .slice(0, 5)
          .map((b, i) => ({
            date: b.bookedOn || new Date().toDateString(),
            paymentId: `PAY-${new Date().getFullYear()}-${String(i+1).padStart(3,'0')}`,
            amount: `$${parseAmount(b.amount).toFixed(1)}`,
            method: 'Bank Transfer',
            status: 'Completed'
          }))
        setConfirmations(derived)
      }
    } catch (_) {}
  }, [bookings])

  // PDF helpers (open printable window; user can save as PDF)
  const openPdfWindow = (title, headers, rows) => {
    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body{font-family: Arial, sans-serif; padding:24px;}
        h1{font-size:18px;margin:0 0 12px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ccc;padding:6px;text-align:left}
        th{background:#f5f5f5}
      </style>
    </head><body>
      <h1>${title}</h1>
      <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map(r=>`<tr>${r.map(c=>`<td>${String(c ?? '')}</td>`).join('')}</tr>`).join('')}
      </tbody></table>
      <script>window.onload=()=>window.print()</script>
    </body></html>`
    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(html)
      w.document.close()
    }
  }

  const handleDownloadInvoicesPdf = () => {
    openPdfWindow(
      'Invoices',
      ['Date','Invoice #','Amount','Due Date','Status'],
      (invoices || []).map(i => [i.date, i.invoiceNo, i.amount, i.dueDate, i.status])
    )
  }

  const handleDownloadConfirmationsPdf = () => {
    openPdfWindow(
      'Payment Confirmations',
      ['Date','Payment ID','Amount','Method','Status'],
      (confirmations || []).map(c => [c.date, c.paymentId, c.amount, c.method, c.status])
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Finance & Payouts</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Loading the latest finance data…
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">Total Earning</div>
            <div className="text-xl font-semibold text-gray-900">{formatCurrency(summary.totalEarning)}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">Pending Payout</div>
            <div className="text-xl font-semibold text-gray-900">{formatCurrency(summary.pendingPayout)}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">Loss from cancellation</div>
            <div className="text-xl font-semibold text-gray-900">{formatCurrency(summary.lossFromCancellation)}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">Paid This Month</div>
            <div className="text-xl font-semibold text-gray-900">{formatCurrency(summary.paidThisMonth)}</div>
          </div>
        </div>

        {/* Finance Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fill: '#666' }} axisLine={{ stroke: '#ccc' }} />
                <YAxis tick={{ fill: '#666' }} axisLine={{ stroke: '#ccc' }} ticks={[0,1500,3000,4500,6000]} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }} />
                <Legend />
                <Bar dataKey="series1" fill="#7c7fdb" name="Ready for Payout" radius={[4,4,0,0]} />
                <Bar dataKey="series2" fill="#5eb89e" name="Paid" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-4">
          {tabs.map((t) => (
            <button 
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 rounded-full text-xs border ${activeTab===t.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bookings for Payout */}
        {activeTab === 'bookings' && (
          <>
            {/* Search */}
            <div className="flex items-center justify-between mb-3">
              <form className="relative w-80" onSubmit={(e) => e.preventDefault()}>
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="w-10 px-3 py-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300"
                        checked={isAllSelected}
                        onChange={toggleSelectAllVisible}
                      />
                    </th>
                    <th 
                      className="text-left font-medium px-4 py-3 cursor-pointer select-none"
                      title="Click to select all"
                      onClick={toggleSelectAllVisible}
                    >
                      Booking Reference
                    </th>
                    <th className="text-left font-medium px-4 py-3">Lead Traveler</th>
                    <th className="text-left font-medium px-4 py-3">Product Code</th>
                    <th className="text-left font-medium px-4 py-3">Activity Date</th>
                    <th className="text-left font-medium px-4 py-3">Retail Price</th>
                    <th className="text-left font-medium px-4 py-3">Net Price</th>
                    <th className="text-left font-medium px-4 py-3">Net Payable</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.bookingRef} className="border-t border-gray-100">
                      <td className="px-3 py-3">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300"
                          checked={selectedIds.has(r.bookingRef)}
                          onChange={() => toggleRow(r.bookingRef)}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-900">{r.bookingRef}</td>
                      <td className="px-4 py-3 text-gray-700">{r.leadTraveller}</td>
                      <td className="px-4 py-3 text-gray-700">{r.productCode}</td>
                      <td className="px-4 py-3 text-gray-700">{r.activityDate}</td>
                      <td className="px-4 py-3 text-gray-700">{r.retailPrice}</td>
                      <td className="px-4 py-3 text-gray-700">{r.netPrice}</td>
                      <td className="px-4 py-3 text-gray-700">{r.netPayable}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${r.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Invoices */}
        {activeTab === 'invoices' && (
          <div className="bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
              <button onClick={handleDownloadInvoicesPdf} className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-[#1d236b] hover:bg-[#1a1f5a] text-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V3z"/></svg>
                Download PDF
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Date</th>
                    <th className="text-left font-medium px-4 py-3">Invoice #</th>
                    <th className="text-left font-medium px-4 py-3">Amount</th>
                    <th className="text-left font-medium px-4 py-3">Due Date</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                    <th className="text-left font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.invoiceNo} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">{inv.date}</td>
                      <td className="px-4 py-3 text-gray-900">{inv.invoiceNo}</td>
                      <td className="px-4 py-3 text-gray-700">{inv.amount}</td>
                      <td className="px-4 py-3 text-gray-700">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">{inv.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            View
                          </button>
                          <button onClick={handleDownloadInvoicesPdf} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V3z"/></svg>
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <button className="px-2 py-1 text-gray-500">‹</button>
              <button className="w-8 h-8 rounded-full bg-[#1d236b] text-white text-sm">1</button>
              <button className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 text-sm">2</button>
              <button className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 text-sm">3</button>
              <span className="text-gray-500">…</span>
              <button className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 text-sm">12</button>
              <button className="px-2 py-1 text-gray-500">›</button>
            </div>
          </div>
        )}

        {/* Payment Confirmation */}
        {activeTab === 'confirmation' && (
          <div className="bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payment Confirmations</h2>
              <button onClick={handleDownloadConfirmationsPdf} className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-[#1d236b] hover:bg-[#1a1f5a] text-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V3z"/></svg>
                Download PDF
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Date</th>
                    <th className="text-left font-medium px-4 py-3">Payment ID</th>
                    <th className="text-left font-medium px-4 py-3">Amount</th>
                    <th className="text-left font-medium px-4 py-3">Method</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                    <th className="text-left font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmations.map((c, idx) => (
                    <tr key={`${c.paymentId}-${idx}`} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">{c.date}</td>
                      <td className="px-4 py-3 text-gray-900">{c.paymentId}</td>
                      <td className="px-4 py-3 text-gray-700">{c.amount}</td>
                      <td className="px-4 py-3 text-gray-700">{c.method}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${c.status === 'Completed' ? 'bg-green-100 text-green-700' : c.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            View
                          </button>
                          <button onClick={handleDownloadConfirmationsPdf} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V3z"/></svg>
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <button className="px-2 py-1 text-gray-500">‹</button>
              <button className="w-8 h-8 rounded-full bg-[#1d236b] text-white text-sm">1</button>
              <button className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 text-sm">2</button>
              <button className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 text-sm">3</button>
              <span className="text-gray-500">…</span>
              <button className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 text-sm">12</button>
              <button className="px-2 py-1 text-gray-500">›</button>
            </div>
          </div>
        )}

        {/* Payment Setting */}
        {activeTab === 'settings' && (
          <PaymentSettingsFirstTime />
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default FinancePage
 
// First-time Payment Settings modal
const PaymentSettingsFirstTime = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [hasExisting, setHasExisting] = useState(false)
  const [method, setMethod] = useState('paypal')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [payoneerEmail, setPayoneerEmail] = useState('')
  const [bank, setBank] = useState({
    holder: '', account: '', swift: '', city: '', bankName: '', country: '', address: ''
  })
  const dialogRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('payment_settings_exists')
    if (saved === 'true') {
      setHasExisting(true)
      setIsOpen(false)
    }
  }, [])

  const save = () => {
    // Persist a simple flag; real app would save full details via API
    localStorage.setItem('payment_settings_exists', 'true')
    setHasExisting(true)
    setIsOpen(false)
  }

  if (!isOpen) {
    if (hasExisting) {
      return <PaymentSettingsPanel />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div ref={dialogRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-gray-800 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 7h20M2 12h20M2 17h20"/></svg>
          <h3 className="text-base font-semibold text-gray-900">Add Payment Method</h3>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Select Payment Method</div>
          <div className="space-y-3">
            <button onClick={() => setMethod('paypal')} className={`w-full text-left px-4 py-3 rounded-lg border ${method==='paypal' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300'} `}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Paypal</div>
                  <div className="text-xs text-gray-500">Receive Payments via PayPal</div>
                </div>
                <span className={`w-4 h-4 rounded-full border ${method==='paypal' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></span>
              </div>
            </button>

            <button onClick={() => setMethod('bank')} className={`w-full text-left px-4 py-3 rounded-lg border ${method==='bank' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300'} `}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Bank Transfer</div>
                  <div className="text-xs text-gray-500">Direct bank account transfer</div>
                </div>
                <span className={`w-4 h-4 rounded-full border ${method==='bank' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></span>
              </div>
            </button>

            <button onClick={() => setMethod('payoneer')} className={`w-full text-left px-4 py-3 rounded-lg border ${method==='payoneer' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300'} `}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Payoneer</div>
                  <div className="text-xs text-gray-500">Get directly in Payoneer</div>
                </div>
                <span className={`w-4 h-4 rounded-full border ${method==='payoneer' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Details sections */}
        {method === 'paypal' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="text-sm font-semibold text-gray-900 mb-2">PayPal Account Details</div>
            <div className="flex items-center space-x-2 mb-2">
              <input value={paypalEmail} onChange={(e)=>setPaypalEmail(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="PayPal Email Address" />
              <button className="px-3 py-2 bg-[#1d236b] text-white rounded-lg text-xs">Verify Email</button>
            </div>
            <ul className="text-xs text-gray-500 list-disc pl-4">
              <li>Upto 1 Business day</li>
              <li>Fees may apply</li>
            </ul>
          </div>
        )}

        {method === 'payoneer' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="text-sm font-semibold text-gray-900 mb-2">Payoneer Account Details</div>
            <div className="flex items-center space-x-2 mb-2">
              <input value={payoneerEmail} onChange={(e)=>setPayoneerEmail(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Payoneer Email Address" />
              <button className="px-3 py-2 bg-[#1d236b] text-white rounded-lg text-xs">Verify Email</button>
            </div>
            <ul className="text-xs text-gray-500 list-disc pl-4">
              <li>Upto 1 Business day</li>
              <li>Fees may apply</li>
            </ul>
          </div>
        )}

        {method === 'bank' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="text-sm font-semibold text-gray-900 mb-3">Bank Account Details</div>
            <div className="grid grid-cols-2 gap-3">
              <input value={bank.holder} onChange={(e)=>setBank({...bank, holder:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm col-span-2" placeholder="Account Holder Name / Title" />
              <input value={bank.account} onChange={(e)=>setBank({...bank, account:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Account Number" />
              <input value={bank.bankName} onChange={(e)=>setBank({...bank, bankName:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Bank Name" />
              <input value={bank.swift} onChange={(e)=>setBank({...bank, swift:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Swift Code" />
              <input value={bank.country} onChange={(e)=>setBank({...bank, country:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Country" />
              <input value={bank.city} onChange={(e)=>setBank({...bank, city:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="City" />
              <input value={bank.address} onChange={(e)=>setBank({...bank, address:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm col-span-2" placeholder="Bank Address" />
            </div>
            <ul className="text-xs text-gray-500 list-disc pl-4 mt-2">
              <li>Up to 3 Business day</li>
              <li>Fees may apply</li>
              <li>Fund will be converted to your local currency</li>
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={()=>setIsOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-[#1d236b] text-white">Add method</button>
        </div>
      </div>
    </div>
  )
}

const PaymentSettingsPanel = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Payment & Tax Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment & Tax Details</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Payment Method</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Paypal</option>
              <option>Bank Transfer</option>
              <option>Payoneer</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Payment Setting</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Once per month</option>
              <option>Monthly (On 5th date)</option>
              <option>Twice per month (2% extra fee will be applied)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Payment Frequency</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Annually</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Commission Rate</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
              Fixed (12%)
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Currency</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option>$ US Dollar</option>
              <option>€ Euro</option>
              <option>¥ Japanese Yen</option>
              <option>Rs Pakistani Rupee</option>
            </select>
          </div>

          {/* Linked payment methods */}
          <div className="mt-2 space-y-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-900">Paypal Account</div>
                  <div className="text-[11px] text-gray-500">username@company.com</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                  <button className="text-[11px] text-gray-600 hover:text-gray-900">Edit</button>
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-900">Bank Account</div>
                  <div className="text-[11px] text-gray-500">Chase Bank • ****5678</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                  <button className="text-[11px] text-gray-600 hover:text-gray-900">Set as Default</button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button className="px-4 py-2 rounded-lg bg-[#1d236b] text-white text-sm">Save Setting</button>
          </div>
        </div>
      </div>

      {/* Right: Payment Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Total bookings</span><span>4</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Gross Revenue</span><span>$ 1,024</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Net Earning</span><span>$ 760.5</span></div>
        </div>
        <div className="mt-4 border border-gray-200 rounded-lg p-3">
          <div className="text-sm font-semibold text-gray-900 mb-1">Next Payment</div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>Due: November 12, 2025</li>
            <li>$ 333.32</li>
            <li>2 Bookings ready for payouts</li>
          </ul>
        </div>
        <div className="mt-4 border border-gray-200 rounded-lg p-3">
          <div className="text-sm font-semibold text-gray-900 mb-1">Recent Activity</div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>Last Month: 12 payments</li>
            <li>Last Payment: $ 2,450.5</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


