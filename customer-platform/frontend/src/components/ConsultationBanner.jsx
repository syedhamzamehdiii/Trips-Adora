import React from 'react'
import { FiMessageSquare, FiPhone, FiClock } from 'react-icons/fi'

const Feature = ({ title, subtitle }) => (
  <div className="flex items-start gap-3">
    <span className="mt-1 text-gray-900">◎</span>
    <div>
      <div className="text-sm text-gray-900">{title}</div>
      {subtitle && <div className="text-xs text-gray-700">{subtitle}</div>}
    </div>
  </div>
)

const ConsultationBanner = () => {
  return (
    <section id="consultation" className="py-12 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-2xl md:max-w-none mx-auto rounded-3xl overflow-hidden bg-[#ffb200]">
          <div className="mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] min-h-[360px] md:min-h-[360px]">
            {/* Left copy */}
            <div className="p-5 sm:p-6 md:p-8 lg:p-10 bg-[#ffb200]/90 flex flex-col justify-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Free Travel Consultation</h3>
              <p className="text-base text-gray-900 mb-5 sm:mb-6">Our expert travel consultants are here to help you plan the perfect trip. From destination selection to customized itineraries, we've got you covered.</p>
              <div className="space-y-3 mb-5 sm:mb-6">
                <Feature title="Personalized recommendations" />
                <Feature title="Flexible scheduling" />
                <Feature title="24/7 support available" />
              </div>
              <button className="bg-gray-900 text-white text-sm px-6 py-2.5 sm:py-3 rounded-lg w-full sm:w-auto">Book Free Consultation</button>
            </div>
            {/* Right visual panel */}
            <div className="relative h-56 sm:h-64 md:h-auto min-h-[220px] md:min-h-[340px]">
              <img src="/assests/image2.jpg" alt="Consultation" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-6 bg-[#ffb200]/90 rounded-xl p-4 md:w-70 space-y-3 shadow-lg ring-1 ring-black/10">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-800"><FiMessageSquare className="w-4 h-4" /></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Live Chat</div>
                    <div className="text-xs text-gray-600">Available now</div>
                  </div>
                </div>
                <div className="h-px bg-black/10" />
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-800"><FiPhone className="w-4 h-4" /></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Call Us</div>
                    <div className="text-xs text-gray-600">Pick your time</div>
                  </div>
                </div>
                <div className="h-px bg-black/10" />
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-800"><FiClock className="w-4 h-4" /></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Schedule a Call</div>
                    <div className="text-xs text-gray-600">+1 (555) 123-4567</div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
          </div>
        
      </div>
    </section>
  )
}

export default ConsultationBanner


