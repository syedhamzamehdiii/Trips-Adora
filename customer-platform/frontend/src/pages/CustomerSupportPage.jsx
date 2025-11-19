import React, { useState, useEffect } from 'react'
import { FiBook, FiUsers, FiCalendar, FiDollarSign, FiMessageSquare, FiShield, FiHelpCircle, FiStar, FiMail, FiSend, FiCheckCircle, FiAlertCircle, FiInfo, FiClock, FiTrendingUp, FiX, FiSettings } from 'react-icons/fi'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'

const CustomerSupportPage = () => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

  const handleSubmit = (e) => {
    e.preventDefault()
    const { name, email, subject, message } = form
    const emailSubject = subject || 'Support Request'
    const emailBody = `From: ${name} <${email}>\n\n${message}`
    const mailtoLink = `mailto:support@tripadora.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.location.href = mailtoLink
    try {
      const saved = JSON.parse(localStorage.getItem('support_messages') || '[]')
      saved.push({ id: Date.now(), name, email, subject, message, createdAt: new Date().toISOString() })
      localStorage.setItem('support_messages', JSON.stringify(saved))
    } catch (_) {}
    setShowSuccessMessage(true)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-white">
      {showSuccessMessage && (
        <div className="fixed top-8 right-8 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-500 p-6 flex items-start space-x-4 max-w-md">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Message Sent Successfully!</h3>
              <p className="text-sm text-gray-600">Thank you for reaching out. Our support team will get back to you within 24 hours.</p>
            </div>
            <button onClick={() => setShowSuccessMessage(false)} className="text-gray-400 hover:text-gray-600">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <MainHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1d236b] rounded-full mb-6">
            <FiHelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Trip Adora – Customer Help & Support Guide</h1>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 text-left space-y-4 max-w-4xl mx-auto">
            <p className="text-gray-700 leading-relaxed">We’re here to make your travel experience smooth, safe, and unforgettable. Whether you’re booking your first tour, managing a trip, or requesting a refund, this guide will help you every step of the way as a valued traveler on Trip Adora.</p>
            <p className="text-gray-700 leading-relaxed">Our mission is simple: to help you discover amazing destinations, enjoy trusted experiences, and travel with total confidence.</p>
          </div>
        </div>

        {/* 1. Getting Started */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow mb-10">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
              <FiBook className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">1. Getting Started with Trip Adora</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-3">a. Creating Your Account</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Sign up easily using your email or social account.</li>
                <li>Verify your email and mobile number for booking updates.</li>
                <li>Complete your profile for faster checkouts and personalized recommendations.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-3">b. Account Verification</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Verified profiles build trust and make bookings easier.</li>
                <li>Keep your details accurate to avoid issues during check-in or payments.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-3">c. Booking Your First Experience</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Browse tours, attractions, and private transfers with detailed descriptions.</li>
                <li>View real photos and reviews before confirming.</li>
                <li>Check pricing, inclusions, exclusions, and cancellation terms before you book.</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">d. Quality Assurance</h3>
            <p className="text-sm text-gray-700">Trip Adora ensures all experiences meet our quality standards. Listings are reviewed for accuracy, pricing, and availability so you can book confidently every time.</p>
          </div>
        </div>

        {/* 2. Managing Your Bookings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow mb-10">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">2. Managing Your Bookings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">a. Editing or Canceling a Booking</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>View and manage your bookings anytime from your Trip Adora dashboard.</li>
                <li>Modify your date, guest count, or cancel before the policy deadline.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">b. Seasonal Availability</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Some tours or attractions operate only in certain months (e.g., April–November).</li>
                <li>Check opening hours, holidays, or maintenance blackout dates before confirming.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">c. Extra Options</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Choose pickup points, language preferences, or add-ons like meals and tickets.</li>
                <li>See all optional costs clearly before payment.</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">d. Booking Accuracy</h3>
            <p className="text-sm text-gray-700">Trip Adora keeps listings regularly updated to avoid confusion. You can always check the latest information, reviews, and ratings before you go.</p>
          </div>
        </div>

        {/* 3. Cancellations & Refunds */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow mb-10">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
              <FiCalendar className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">3. Cancellations & Refunds</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">a. Confirming Your Booking</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>You’ll receive instant confirmation via email or the app once your booking is complete.</li>
                <li>View your ticket and details anytime in “My Bookings.”</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">b. No-Shows</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>If you miss your activity, refunds depend on the specific provider’s no-show policy.</li>
                <li>Contact support immediately if something unexpected happens.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">c. Trip Adora or Partner Cancellations</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>In rare cases, your tour operator may cancel due to weather or operational reasons.</li>
                <li>You’ll be notified instantly and can choose between a refund or reschedule.</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">d. Refund Policy</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Many experiences offer free cancellation until a certain date.</li>
              <li>After that, a partial refund or credit may apply.</li>
              <li>Refunds are processed quickly and can be tracked from your account.</li>
            </ul>
          </div>
        </div>

        {/* 4. Payments & Invoices */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow mb-10">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">4. Payments & Invoices</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">a. Payment Security</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>All payments are securely processed via Trip Adora’s trusted gateway.</li>
                <li>You’ll receive a receipt and booking confirmation instantly.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">b. Multiple Currencies</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Prices are displayed in your local currency with real-time exchange rates.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">c. Invoices & Records</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>Download invoices anytime from your account.</li>
                <li>Monthly summaries of your bookings are available in PDF format.</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">d. Fees & Charges</h3>
            <p className="text-sm text-gray-700">The total price shown at checkout includes all taxes and service fees—no hidden costs.</p>
          </div>
        </div>

        {/* 5. Communication & Support */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow mb-10">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
              <FiMessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">5. Communication & Support</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6"><h3 className="font-semibold text-gray-900 mb-3">a. Built-in Messaging</h3><ul className="space-y-2 text-sm text-gray-700"><li>Contact your tour operator directly through Trip Adora’s secure chat.</li><li>Avoid sharing personal phone numbers or emails for your safety.</li></ul></div>
            <div className="bg-gray-50 rounded-xl p-6"><h3 className="font-semibold text-gray-900 mb-3">b. Response Time</h3><ul className="space-y-2 text-sm text-gray-700"><li>Expect replies within 24 hours or faster during working hours.</li></ul></div>
            <div className="bg-gray-50 rounded-xl p-6"><h3 className="font-semibold text-gray-900 mb-3">c. Special Requests</h3><ul className="space-y-2 text-sm text-gray-700"><li>You can request extras like meals, additional stops, or accessibility support.</li><li>Operators will confirm only if available.</li></ul></div>
          </div>
        </div>

        {/* 6. Safety & Policies */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow mb-10">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
              <FiShield className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">6. Safety & Policies</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6"><h3 className="font-semibold text-gray-900 mb-3">a. Licensed Partners</h3><p className="text-sm text-gray-700">Trip Adora works only with verified, licensed, and insured tour operators.</p></div>
            <div className="bg-gray-50 rounded-xl p-6"><h3 className="font-semibold text-gray-900 mb-3">b. Health & Safety</h3><p className="text-sm text-gray-700">All partners follow local safety regulations and hygiene standards.</p></div>
            <div className="bg-gray-50 rounded-xl p-6"><h3 className="font-semibold text-gray-900 mb-3">c. Traveller Code of Conduct</h3><p className="text-sm text-gray-700">Treat your guides and fellow travelers respectfully. Any misuse, abuse, or damage may affect future bookings.</p></div>
          </div>
        </div>

        {/* 7. Technical Help */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow mb-10">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
              <FiSettings className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">7. Technical Help</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-4"><p className="font-semibold text-gray-900 mb-3 flex items-center"><FiAlertCircle className="w-4 h-4 text-red-500 mr-2" />Account Login Issues</p><ul className="space-y-2 ml-6 text-sm text-gray-700 list-disc"><li>Reset your password anytime from the login page.</li><li>Contact our support team if you can’t access your account.</li></ul></div>
            <div className="bg-gray-50 rounded-xl p-4"><p className="font-semibold text-gray-900 mb-3 flex items-center"><FiDollarSign className="w-4 h-4 text-green-500 mr-2" />Payment Issues</p><ul className="space-y-2 ml-6 text-sm text-gray-700 list-disc"><li>Update your card or payment details easily under “Settings.”</li><li>Reach out to support if a transaction fails or is delayed.</li></ul></div>
            <div className="bg-gray-50 rounded-xl p-4"><p className="font-semibold text-gray-900 mb-3 flex items-center"><FiHelpCircle className="w-4 h-4 text-orange-500 mr-2" />Reporting Errors</p><ul className="space-y-2 ml-6 text-sm text-gray-700 list-disc"><li>Use the “Report a Problem” form and attach screenshots for faster help.</li></ul></div>
          </div>
        </div>

        {/* 9. Tips for the Best Experience */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
              <FiTrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">8. Tips for the Best Experience</h2>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
            <li className="bg-gray-50 rounded-xl p-4">Book early for better prices and availability.</li>
            <li className="bg-gray-50 rounded-xl p-4">Check reviews and ratings before choosing your tour.</li>
            <li className="bg-gray-50 rounded-xl p-4">Stay in touch with your operator before the trip.</li>
            <li className="bg-gray-50 rounded-xl p-4">Leave a review after your experience to help future travelers.</li>
          </ul>
        </div>

        {/* Send Us a Message */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mt-16 shadow-lg border border-blue-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1d236b] rounded-full mb-4">
              <FiSend className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h3>
            <p className="text-lg text-gray-600">We'd love to hear about your experience or answer any questions</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent transition-all" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email address</label>
                <input type="email" required value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent transition-all" placeholder="your.email@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Subject</label>
              <input type="text" required value={form.subject} onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent transition-all" placeholder="What's this about?" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tell us more about your inquiry or feedback...</label>
              <textarea rows={5} required value={form.message} onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent transition-all resize-none" placeholder="Describe your question or feedback in detail..."></textarea>
            </div>
            <div className="text-center pt-4">
              <button type="submit" className="bg-[#1d236b] text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 mx-auto">
                <FiSend className="w-5 h-5" />
                <span>Send message</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default CustomerSupportPage


