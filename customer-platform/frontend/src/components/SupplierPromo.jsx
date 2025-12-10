import React from 'react'
import { FiUsers, FiGlobe, FiBriefcase, FiTrendingUp, FiArrowRight } from 'react-icons/fi'

const StatBox = ({ icon, title, value }) => {
  return (
    <div className="flex items-center gap-3 bg-white/40 rounded-xl px-4 py-3 border border-white/40">
      <div className="text-gray-900">{icon}</div>
      <div>
        <div className="text-xs text-gray-900">{title}</div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
      </div>
    </div>
  )
}

const SupplierPromo = () => {
  const goToSupplier = () => {
    try {
      localStorage.setItem('tripsadora_mode', 'supplier')
    } catch (_) {}
    const supplierBase = import.meta?.env?.VITE_SUPPLIER_APP_URL || 'http://localhost:5173'
    const loginUrl = `${supplierBase.replace(/\/$/, '')}/login`
    window.location.assign(loginUrl)
  }

  return (
    <section className="py-10 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#C6DBFA] p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {/* Left image card */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div className="relative h-64 sm:h-72 md:h-full">
              <img src="/assests/richp.jpg" alt="Become a supplier" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white rounded-lg px-4 py-3 text-sm font-semibold">
                BECOME A RICH PANDA SUPPLIER
              </div>
            </div>
          </div>

          {/* Right content card */}
          <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-2xl bg-[#ffb200] p-5 sm:p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Become a Supplier</h3>
              <p className="text-sm text-gray-900 mb-2">Join our growing network of travel partners and reach millions of travelers worldwide.</p>
              <p className="text-sm text-gray-900 mb-4">Grow your business with our powerful platform</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <StatBox icon={<FiUsers className="w-4 h-4" />} title="Active Users" value="10M+" />
                <StatBox icon={<FiGlobe className="w-4 h-4" />} title="Countries" value="150+" />
                <StatBox icon={<FiBriefcase className="w-4 h-4" />} title="Partners" value="5000+" />
                <StatBox icon={<FiTrendingUp className="w-4 h-4" />} title="Avg. growth" value="30%" />
              </div>
              <button onClick={goToSupplier} className="w-full flex items-center justify-center gap-2 bg-[#2e3a67] text-white rounded-full py-2 font-medium shadow">
                Get Started Now
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl bg-[#ffb200] p-5 sm:p-6 shadow-lg">
              <ul className="space-y-4 text-sm text-gray-900">
                <li>✓ Zero commission for the first 3 months</li>
                <li>✓ Access to millions of potential customers</li>
                <li>✓ Easy-to-use dashboard and analytics</li>
                <li>✓ 24/7 dedicated support team</li>
                <li>✓ Marketing and promotional tools</li>
              </ul>
              <div className="mt-6 bg-white/70 rounded-lg px-4 py-3 text-sm text-gray-900">
                Join 5000+ partners who are already growing their business with us
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SupplierPromo


