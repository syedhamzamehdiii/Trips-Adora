import React from 'react'

const ExperienceCard = ({ image, title, price, liked=false }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white">
      <div className="h-72">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      {/* Bottom overlay like screenshot */}
      <div className="absolute left-3 right-3 bottom-3">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[11px] text-gray-900 font-semibold truncate">{title}</div>
            <div className="text-[10px] text-gray-600">{price}</div>
          </div>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 border border-gray-300">
            <span className={`text-xs ${liked ? 'text-red-500' : 'text-gray-500'}`}>♥</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExperienceCard


