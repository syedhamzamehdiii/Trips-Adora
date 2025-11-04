import React, { useEffect, useMemo } from 'react'
import HeaderLandingPage from '../components/HeaderLandingPage'
import BottomNavigationBar from '../components/BottomNavigationBar'
import Footer from '../components/Footer'

const ContactUsPage = () => {
  useEffect(() => {
    try { localStorage.setItem('tripsadora_mode', 'customer') } catch (_) {}
  }, [])

  const supportItems = useMemo(() => ([
    { title: '24/7 Support', desc: 'Our team is here around the clock to help with bookings, changes, or questions.' },
    { title: 'Trusted by Travelers', desc: 'Millions of trips planned with care, safety, and transparent pricing.' },
    { title: 'Fast Response', desc: 'Average first response time under 2 hours during business hours.' },
  ]), [])

  const offices = useMemo(() => ([
    { city: 'Tokyo HQ', address: '1-1 Chiyoda, Chiyoda City, Tokyo 100-8111, Japan', phone: '+81 3 1234 5678' },
    { city: 'Kyoto', address: '68-2 Gokōmachi-dori, Nakagyō Ward, Kyoto, 604-0000, Japan', phone: '+81 75 234 5678' },
  ]), [])

  const faqs = useMemo(() => ([
    { q: 'How quickly will you reply?', a: 'We reply within 2 hours on business days and within 24 hours on weekends and holidays.' },
    { q: 'Can I change or cancel a booking?', a: 'Yes. Message us with your booking ID. Change and cancellation policies vary by experience.' },
    { q: 'Do you offer custom itineraries?', a: 'Absolutely. Share your dates, budget, and interests and our experts will craft a plan.' },
  ]), [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Placeholder for real submission. Integrate with your backend or a form provider.
    alert('Thank you! Your message has been sent.')
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <HeaderLandingPage />
      <BottomNavigationBar />
      
      {/* Hero */}
      <section
        className="relative h-[520px] w-full bg-gray-200"
        style={{
          backgroundImage: "url('/assests/contactus.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </section>

      {/* Page Intro (moved below hero) */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-gray-600 text-base md:text-lg">
            We'd love to hear from you. Reach out for support, partnerships, or media.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Get in touch</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <div className="text-gray-500">Email</div>
                  <a className="text-blue-900 font-medium" href="mailto:support@tripsadora.com">support@tripsadora.com</a>
                </div>
                <div>
                  <div className="text-gray-500">Phone</div>
                  <a className="text-blue-900 font-medium" href="tel:+1800TRAVEL">+1-800-TRAVEL</a>
                </div>
                <div>
                  <div className="text-gray-500">Live chat</div>
                  <div className="text-gray-800">Available 24/7 in your account dashboard</div>
                </div>
                <div>
                  <div className="text-gray-500">Business hours</div>
                  <div className="text-gray-800">Mon–Fri 9:00–18:00 (JST) • Weekend emergency support</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why travelers choose us</h3>
              <ul className="space-y-3 text-sm">
                {supportItems.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#1d236b' }}></span>
                    <div>
                      <div className="font-semibold text-gray-900">{s.title}</div>
                      <div className="text-gray-600">{s.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Our offices</h3>
              <ul className="space-y-4 text-sm">
                {offices.map((o, i) => (
                  <li key={i}>
                    <div className="font-semibold text-gray-900">{o.city}</div>
                    <div className="text-gray-600">{o.address}</div>
                    <a className="text-blue-900" href={`tel:${o.phone.replace(/[^+\d]/g,'')}`}>{o.phone}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">First name</label>
                  <input required type="text" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last name</label>
                  <input required type="text" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input required type="email" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone (optional)</label>
                  <input type="tel" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Subject</label>
                  <input required type="text" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Message</label>
                  <textarea required rows={6} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2 flex items-start gap-2 text-sm text-gray-600">
                  <input id="consent" type="checkbox" className="mt-1" required />
                  <label htmlFor="consent">I agree to the processing of my personal data according to the Privacy Policy.</label>
                </div>
              </div>
              <div className="mt-6">
                <button type="submit" className="px-5 py-3 rounded-lg text-white font-semibold shadow" style={{ backgroundColor: '#1d236b' }}>
                  Send message
                </button>
              </div>
            </form>

            {/* FAQs */}
            <div className="mt-10 bg-white rounded-2xl shadow p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently asked questions</h3>
              <div className="divide-y divide-gray-200">
                {faqs.map((f, i) => (
                  <details key={i} className="py-4 group">
                    <summary className="cursor-pointer list-none flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{f.q}</span>
                      <span className="text-gray-400 group-open:rotate-180 transition">▾</span>
                    </summary>
                    <p className="mt-2 text-gray-600 text-sm">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-2xl overflow-hidden shadow">
          <iframe
            title="TripsAdora Japan Office Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.648534038628!2d139.7530524764903!3d35.67589237259021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188c0baf3f3a0f%3A0x2b4adf1aa6b0d6b3!2sChiyoda%20City%2C%20Tokyo%20100-8111%2C%20Japan!5e0!3m2!1sen!2sjp!4v1700000000000!5m2!1sen!2sjp"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[320px]"
          />
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ContactUsPage


