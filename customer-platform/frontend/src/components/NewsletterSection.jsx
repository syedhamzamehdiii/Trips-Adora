import React from 'react'

const NewsletterSection = () => {
  return (
    <section id="choose-your-path" className="py-12 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-white shadow p-6 md:p-10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left content */}
            <div>
              <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">CHOOSE YOUR PATH!</h2>
              <p className="text-gray-700 text-base mb-6">Get exclusive travel deals, destination guides, and insider tips delivered straight to your inbox.</p>

              <div className="flex items-center gap-3 mb-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-full border border-gray-300 px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-custom-blue"
                />
                <button className="rounded-full bg-[#2e3a67] text-white px-6 py-2.5 text-sm font-medium">Subscribe</button>
              </div>

              <div className="text-sm text-gray-600">Join <span className="font-bold">50,000+</span> travellers. Unsubscribe anytime.</div>
            </div>

            {/* Right image */}
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-80 h-80 md:w-96 md:h-96 rounded-full bg-[#e7f0ff] blur-3xl" />
              <img src="/assests/kalaa.png" alt="Happy subscriber" className="relative w-auto h-72 md:h-80 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection


