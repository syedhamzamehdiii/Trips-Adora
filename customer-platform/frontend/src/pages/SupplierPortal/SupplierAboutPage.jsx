import React from 'react'
import { FiUsers, FiGlobe, FiAward, FiCheckCircle } from 'react-icons/fi'

const milestones = [
  { year: '2019', title: 'Our Beginning', description: 'TripsAdora Partner Network launches with 50 boutique tour operators across Asia.' },
  { year: '2021', title: 'Global Expansion', description: 'We crossed 2,000 verified suppliers and opened offices in Dubai, Singapore, and London.' },
  { year: '2024', title: 'Trusted Marketplace', description: '10M+ travellers served with 96% satisfaction and industry-leading payouts.' }
]

const pillars = [
  { icon: <FiUsers className="w-6 h-6" />, title: 'Human-first partnership', description: 'Dedicated success managers, weekly insight calls, and on-demand product coaching.' },
  { icon: <FiGlobe className="w-6 h-6" />, title: 'Borderless reach', description: 'List once and sell across 180+ markets with built-in translations, FX, and localized pricing.' },
  { icon: <FiAward className="w-6 h-6" />, title: 'Quality & compliance', description: 'Every supplier is vetted for safety, sustainability, and service excellence before going live.' },
  { icon: <FiCheckCircle className="w-6 h-6" />, title: 'Actionable insights', description: 'Demand heatmaps, competitor benchmarks, and smart recommendations in real time.' }
]

const SupplierAboutPage = () => {
  return (
    <main className="min-h-screen bg-[#f5f7ff]">
      <section className="bg-gradient-to-br from-[#111b5e] to-[#1d2a73] text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="uppercase tracking-[0.4em] text-sm text-white/70">About TripsAdora Suppliers</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
            Building the most trusted destination<br />for curated experiences.
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-3xl">
            We are a travel technology collective empowering local hosts, boutique DMCs, and specialist tour operators to grow with transparency, 
            fair economics, and beautifully crafted tools. Your stories power our marketplace.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="grid md:grid-cols-4 gap-6">
          {pillars.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="w-12 h-12 rounded-full bg-[#eef1ff] text-[#1d236b] flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-[#1b1f3b]">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-[#1d236b] font-semibold mb-2">Our Commitment</p>
            <h2 className="text-2xl font-bold text-[#0d133a] mb-4">Designed with partners, for partners.</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              From instant payouts to curated marketing labs, we obsess over giving creators control. We co-build releases with our supplier council, 
              run quarterly design sprints, and publish transparent product roadmaps so you always know what's next.
            </p>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-[#1d236b] mt-1" />
                <span>Bi-weekly settlement cycle with optional instant payouts in 20+ currencies.</span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-[#1d236b] mt-1" />
                <span>Marketing grants, studio support, and performance coaching for launch collections.</span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-[#1d236b] mt-1" />
                <span>Unified inbox for traveller messages, operations alerts, and partner success guidance.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#101c63] text-white rounded-3xl p-8 flex flex-col justify-center shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-3">Our Reach</p>
            <h2 className="text-3xl font-semibold mb-6">10M+ travellers, 85 countries, 4k+ live products</h2>
            <p className="text-white/80 leading-relaxed">
              Our marketplace blends the craftsmanship of local operators with the reach of a global brand. Whether you run desert safaris in Dubai 
              or culinary residencies in Kyoto, we help you scale responsibly while staying true to your signature.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1d236b] font-semibold mb-2">Milestones</p>
          <div className="space-y-8">
            {milestones.map((m) => (
              <div key={m.year} className="flex flex-col md:flex-row md:items-center md:gap-8">
                <div className="text-2xl font-bold text-[#1d236b] w-24">{m.year}</div>
                <div className="flex-1 bg-[#f5f7ff] rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-xl font-semibold text-[#10153a] mb-2">{m.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default SupplierAboutPage

