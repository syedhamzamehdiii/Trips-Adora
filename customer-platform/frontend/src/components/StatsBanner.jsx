import React from 'react'

const StatCard = ({ value, label }) => (
  <div className="backdrop-blur-sm bg-white/60 rounded-xl px-6 py-5 text-center shadow">
    <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
    <div className="text-sm text-gray-700 leading-snug">{label}</div>
  </div>
)

const StatsBanner = () => {
  return (
    <div className="w-full overflow-hidden rounded-2xl shadow relative h-64 md:h-80 lg:h-96">
      <img
        src="/assests/images.jpg"
        alt="Travel stats"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/10" />

      <div className="absolute inset-0 flex items-end md:items-center justify-center gap-4 md:gap-6 lg:gap-8 p-6">
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <StatCard value="3.0k+" label={"Satisfied\ntravellers"} />
          <StatCard value="96%" label={"Urge to travel\nagain"} />
          <StatCard value="300+" label={"Savings with\nearly booking"} />
        </div>
      </div>
    </div>
  )
}

export default StatsBanner


