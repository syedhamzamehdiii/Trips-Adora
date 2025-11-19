import React from 'react'
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi'

const contactCards = [
  {
    icon: <FiPhone className="w-6 h-6" />,
    title: 'Partner Hotline',
    detail: '+1-800-TRIPS (24/7)',
    caption: 'Immediate assistance for verifications, payouts, or live traveller escalations.'
  },
  {
    icon: <FiMail className="w-6 h-6" />,
    title: 'Success Desk',
    detail: 'success@tripsadora.com',
    caption: 'Strategic coaching, merchandising tips, and marketing collaborations.'
  },
  {
    icon: <FiMapPin className="w-6 h-6" />,
    title: 'Regional Studios',
    detail: 'Dubai • Singapore • London • São Paulo',
    caption: 'Book in-person audits, shoots, or co-creation days with our team.'
  }
]

const SupplierContactPage = () => {
  return (
    <main className="min-h-screen bg-[#f4f6ff]">
      <section className="bg-gradient-to-br from-[#111a5f] to-[#1f2c76] text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <p className="uppercase tracking-[0.4em] text-xs text-white/70">Contact Supplier Success</p>
          <h1 className="text-4xl font-extrabold">We’re here for every launch, traveller, and milestone.</h1>
          <p className="text-white/80 text-lg">
            Drop a note, call our hotline, or book a studio slot. Our dedicated partner success crew responds within 12 business hours.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {contactCards.map((card) => (
          <div key={card.title} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-[#eef1ff] text-[#1d236b] flex items-center justify-center">
              {card.icon}
            </div>
            <h3 className="text-lg font-semibold text-[#10163c]">{card.title}</h3>
            <p className="text-xl font-bold text-[#1d236b]">{card.detail}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{card.caption}</p>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-lg p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.35em] text-[#1d236b] font-semibold">Send us a message</p>
            <h2 className="text-2xl font-bold text-[#10153a]">Let’s co-create your next launch.</h2>
            <p className="text-slate-600 leading-relaxed">
              Share as much context as possible. We route every request to a vertical specialist, whether you manage day tours,
              extended expeditions, or niche wellness retreats.
            </p>
            <div className="bg-[#f6f7ff] rounded-2xl p-4 flex items-center gap-3 text-sm text-slate-600">
              <FiClock className="text-[#1d236b]" />
              <span>Response time: under 12 business hours (urgent cases within 1 hour).</span>
            </div>
          </div>

          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Full name" className="rounded-2xl border border-slate-200 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#1d236b]/40" required />
              <input type="email" placeholder="Work email" className="rounded-2xl border border-slate-200 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#1d236b]/40" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Company name" className="rounded-2xl border border-slate-200 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#1d236b]/40" required />
              <input type="text" placeholder="Preferred phone" className="rounded-2xl border border-slate-200 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#1d236b]/40" />
            </div>
            <select className="rounded-2xl border border-slate-200 px-4 py-3 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#1d236b]/40" defaultValue="">
              <option value="" disabled>Topic</option>
              <option value="verification">Verification & compliance</option>
              <option value="payouts">Payouts & finance</option>
              <option value="marketing">Marketing collaboration</option>
              <option value="ops">Day-to-day operations</option>
            </select>
            <textarea rows="4" placeholder="Share details, links, or traveller references..." className="rounded-2xl border border-slate-200 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#1d236b]/40" required />
            <button type="submit" className="w-full rounded-2xl bg-[#1d236b] text-white py-3 font-semibold hover:bg-[#11194f] transition-colors">
              Submit request
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default SupplierContactPage

