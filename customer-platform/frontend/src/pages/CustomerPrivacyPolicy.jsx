import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMessageCircle, FiMail, FiPhone } from 'react-icons/fi'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'

const CustomerPrivacyPolicy = () => {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)

  const handleSaveAndContinue = () => {
    if (agreed) navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <MainHeader />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <svg className="w-10 h-10 text-white transform -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-700 font-medium mb-2">Your privacy matters to us.</p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">We are committed to protecting your personal information and being transparent about how we use it.</p>
            <div className="inline-block mt-6 px-6 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">Effective Date: 4 November 2025</div>
          </div>

          {/* Overview */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed">At Trip Adora, your privacy and trust mean everything to us. We’re committed to protecting your personal information and ensuring your travel experience remains secure, transparent, and enjoyable. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website, mobile app, or any of our services.</p>
          </section>

          {/* Information We Collect */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>
            </div>
            <p className="mb-6 text-gray-600 text-lg">We collect information to help improve your experience and deliver better services:</p>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500">
                <h3 className="font-bold text-gray-900 mb-3">a. Personal Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>Name, email address, and phone number</li>
                  <li>Payment and billing details (processed securely)</li>
                  <li>Travel preferences and booking history</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500">
                <h3 className="font-bold text-gray-900 mb-3">b. Technical Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>IP address, browser type, and device information</li>
                  <li>Cookies and analytics data to improve performance</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-3">c. Communication Data</h3>
                <p className="text-gray-700">When you chat with tour operators or our support team, we may store those messages for service quality and dispute resolution.</p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>To process and confirm your bookings</li>
              <li>To send updates, reminders, and confirmations</li>
              <li>To improve our platform’s performance and user experience</li>
              <li>To respond to inquiries and offer support</li>
              <li>To detect, prevent, and address fraud or misuse</li>
            </ul>
            <p className="mt-4 text-gray-700 font-medium">We never sell, rent, or trade your personal data to any third party.</p>
          </section>

          {/* Payment Security */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">4. Payment Security</h2>
            <p className="text-gray-700">All transactions made on Trip Adora are encrypted and processed through trusted third-party gateways. We do not store your full card details on our servers.</p>
          </section>

          {/* Sharing Information */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">5. Sharing Your Information</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>With tour or activity providers to complete your booking</li>
              <li>With payment processors for secure transactions</li>
              <li>With law enforcement if legally required</li>
            </ul>
            <p className="mt-4 text-gray-700">Every partner we work with follows strict data protection standards.</p>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">6. Cookies & Tracking</h2>
            <p className="text-gray-700">Cookies help us remember your preferences and personalize your experience. You can choose to disable cookies in your browser, but some site features may not work properly without them.</p>
          </section>

          {/* Data Retention */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">7. Data Retention</h2>
            <p className="text-gray-700">We keep your information only as long as it’s needed for legal or business purposes — such as completing bookings, resolving disputes, or fulfilling financial record-keeping requirements.</p>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 mb-3">You have full control over your information. At any time, you can:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Access or download your personal data</li>
              <li>Update or correct profile details</li>
              <li>Request deletion of your account</li>
              <li>Manage email and notification preferences</li>
            </ul>
            <p className="mt-4 text-gray-700">To exercise these rights, contact us at <span className="font-semibold">privacy@tripadora.com</span>.</p>
          </section>

          {/* Third-Party Links */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">9. Third-Party Links</h2>
            <p className="text-gray-700">Trip Adora may include links to other travel or partner websites. We are not responsible for their content or privacy practices, so we encourage you to read their policies before sharing your information.</p>
          </section>

          {/* Children */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">10. Children’s Privacy</h2>
            <p className="text-gray-700">Trip Adora services are intended for users aged 18 and above. We do not knowingly collect information from minors.</p>
          </section>

          {/* Updates */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">11. Updates to This Policy</h2>
            <p className="text-gray-700">We may update this Privacy Policy from time to time. All changes will be posted here with the latest revision date, and continued use of our platform means you accept the updated version.</p>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">12. Contact Us</h2>
            <p className="text-gray-700">If you have any questions or privacy concerns, reach us at <span className="font-semibold">privacy@tripadora.com</span>. Support Hours: 9:00 AM – 9:00 PM (local time).</p>
          </section>

          {/* Questions CTA */}
          <div className="mt-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <FiMessageCircle className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Questions about our policies?</h3>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">If you have any questions about our Privacy Policy or Terms & Conditions, please don't hesitate to contact us.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <button onClick={() => navigate('/support')} className="flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg">
                  <FiMessageCircle size={20} />
                  <span>Start Live Chat</span>
                </button>
                <a href="mailto:info@tripsadora.com" className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                  <FiMail size={20} />
                  <span>info@tripsadora.com</span>
                </a>
                <a href="tel:+15551234456" className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                  <FiPhone size={20} />
                  <span>+1 (555) 123-456</span>
                </a>
              </div>
            </div>
          </div>

          {/* Agreement */}
          <div className="mt-10 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <label className="flex items-start space-x-4 cursor-pointer group">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-6 h-6 text-blue-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer" />
              <span className="text-base text-gray-700 leading-relaxed">
                By continuing, you agree to the{' '}
                <button onClick={() => navigate('/terms')} className="text-blue-600 font-semibold underline hover:text-blue-700 transition-colors">Terms and conditions</button>{' '}and{' '}
                <button onClick={() => navigate('/privacy')} className="text-blue-600 font-semibold underline hover:text-blue-700 transition-colors">Privacy Policy</button>.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5 pb-8">
            <button onClick={() => navigate(-1)} className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-md">← Back</button>
            <button onClick={handleSaveAndContinue} disabled={!agreed} className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg ${agreed ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'}`}>Save & Continue →</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default CustomerPrivacyPolicy


