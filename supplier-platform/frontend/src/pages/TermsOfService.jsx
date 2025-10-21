import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiMail, FiPhone } from 'react-icons/fi';
import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';

const TermsOfService = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleSaveAndContinue = () => {
    if (agreed) {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <Header activePage="" />
      
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
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-700 font-medium mb-2">Your privacy matters to us.</p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We are committed to protecting your personal information and being transparent about how we use it.
          </p>
          <div className="inline-block mt-6 px-6 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            Effective Date: 11-09-2025
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Information We Collect */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <p className="mb-6 text-gray-600 text-lg">We collect various types of information to provide and improve our travel booking services:</p>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Personal Information:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><span>Name, email address, phone number, and postal address</span></li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><span>Payment information including credit card details (processed securely through our payment partners)</span></li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><span>Government-issued ID information when required for certain activities</span></li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><span>Travel preferences and special requirements</span></li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2">•</span><span>Date of birth for age-restricted activities</span></li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Booking Information:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start"><span className="text-green-500 mr-2">•</span><span>Activity selections, dates, and participant details</span></li>
                  <li className="flex items-start"><span className="text-green-500 mr-2">•</span><span>Communication history with our support team</span></li>
                  <li className="flex items-start"><span className="text-green-500 mr-2">•</span><span>Reviews and feedback you provide</span></li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Technical Information:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start"><span className="text-purple-500 mr-2">•</span><span>IP address, browser type, and device information</span></li>
                  <li className="flex items-start"><span className="text-purple-500 mr-2">•</span><span>Website usage data and analytics</span></li>
                  <li className="flex items-start"><span className="text-purple-500 mr-2">•</span><span>Cookies and similar tracking technologies</span></li>
                  <li className="flex items-start"><span className="text-purple-500 mr-2">•</span><span>Location data (with your permission) to suggest nearby activities</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-gray-700 flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>We only collect information that is necessary to provide our services and improve your experience. You can control what information you share with us through your account settings.</span>
              </p>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Data</h2>
            </div>
            <p className="mb-6 text-gray-600 text-lg">We use your information for the following purposes:</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Service Delivery
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start"><span className="text-blue-600 mr-2">✓</span><span>Processing and confirming your bookings</span></li>
                  <li className="flex items-start"><span className="text-blue-600 mr-2">✓</span><span>Communicating with activity providers on your behalf</span></li>
                  <li className="flex items-start"><span className="text-blue-600 mr-2">✓</span><span>Sending booking confirmations, tickets, and important updates</span></li>
                  <li className="flex items-start"><span className="text-blue-600 mr-2">✓</span><span>Providing customer support and assistance</span></li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Service Improvement
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start"><span className="text-green-600 mr-2">✓</span><span>Analyzing usage patterns to improve our website and services</span></li>
                  <li className="flex items-start"><span className="text-green-600 mr-2">✓</span><span>Personalizing recommendations based on your preferences</span></li>
                  <li className="flex items-start"><span className="text-green-600 mr-2">✓</span><span>Conducting surveys and research to enhance user experience</span></li>
                  <li className="flex items-start"><span className="text-green-600 mr-2">✓</span><span>Developing new features and services</span></li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                  <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Communication
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start"><span className="text-orange-600 mr-2">✓</span><span>Sending important service-related notifications</span></li>
                  <li className="flex items-start"><span className="text-orange-600 mr-2">✓</span><span>Marketing communications (with your consent)</span></li>
                  <li className="flex items-start"><span className="text-orange-600 mr-2">✓</span><span>Safety alerts and travel advisories</span></li>
                  <li className="flex items-start"><span className="text-orange-600 mr-2">✓</span><span>Newsletter and promotional offers (you can opt out anytime)</span></li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Legal and Security
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start"><span className="text-red-600 mr-2">✓</span><span>Complying with legal obligations and regulations</span></li>
                  <li className="flex items-start"><span className="text-red-600 mr-2">✓</span><span>Preventing fraud and ensuring platform security</span></li>
                  <li className="flex items-start"><span className="text-red-600 mr-2">✓</span><span>Resolving disputes and enforcing our terms</span></li>
                  <li className="flex items-start"><span className="text-red-600 mr-2">✓</span><span>Protecting the rights and safety of our users</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm text-gray-700 flex items-start">
                <svg className="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>We never use your data for purposes beyond what we've disclosed, and we always ask for your consent when required by law.</span>
              </p>
            </div>
          </section>
        </div>

        {/* Questions Section */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 text-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                <FiMessageCircle className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Questions about our policies?</h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              If you have any questions about our Privacy Policy or Terms & Conditions,
              please don't hesitate to contact us.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button 
                onClick={() => navigate('/support')}
                className="flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FiMessageCircle size={20} />
                <span>Start Live Chat</span>
              </button>
              
              <a 
                href="mailto:info@tripsadora.com"
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                <FiMail size={20} />
                <span>info@tripsadora.com</span>
              </a>
              
              <a 
                href="tel:+15551234456"
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                <FiPhone size={20} />
                <span>+1 (555) 123-456</span>
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-block">
              <p className="text-sm text-white/90">
                <span className="font-semibold">⚡ Fast Response:</span> We typically respond within 48 hours<br />
                <span className="font-semibold">🔒 Urgent Concerns:</span> Call our support line for immediate assistance
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <label className="flex items-start space-x-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-6 h-6 text-blue-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-base text-gray-700 leading-relaxed">
              By continuing, you agree to the{' '}
              <button onClick={() => navigate('/terms')} className="text-blue-600 font-semibold underline hover:text-blue-700 transition-colors">
                Terms and conditions
              </button>
              {' '}and{' '}
              <button onClick={() => navigate('/privacy')} className="text-blue-600 font-semibold underline hover:text-blue-700 transition-colors">
                Privacy Policy
              </button>
              .
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            ← Back
          </button>
          <button
            onClick={handleSaveAndContinue}
            disabled={!agreed}
            className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
              agreed
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            Save & Continue →
          </button>
        </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TermsOfService;

