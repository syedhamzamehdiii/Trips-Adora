import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import { 
  FiBook, FiUsers, FiCalendar, FiDollarSign, FiMessageSquare, 
  FiShield, FiSettings, FiHelpCircle, FiStar, FiMail, FiSend,
  FiCheckCircle, FiAlertCircle, FiInfo, FiClock, FiTrendingUp, FiX
} from 'react-icons/fi';

const SupportPage = () => {
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = form;
    const emailSubject = subject || 'Support Request';
    const emailBody = `From: ${name} <${email}>\n\n${message}`;
    const mailtoLink = `mailto:support@tripadora.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    // Open default email client
    window.location.href = mailtoLink;

    // Persist a copy locally and raise a notification
    try {
      const saved = JSON.parse(localStorage.getItem('support_messages') || '[]');
      saved.push({ id: Date.now(), name, email, subject, message, createdAt: new Date().toISOString() });
      localStorage.setItem('support_messages', JSON.stringify(saved));
      if (window.addNotification) {
        window.addNotification({
          type: 'system',
          title: 'Support message prepared',
          message: 'Your email draft to support@tripadora.com has been opened.'
        });
      }
    } catch (_) {}

    setShowSuccessMessage(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Success Message Notification */}
      {showSuccessMessage && (
        <div className="fixed top-8 right-8 z-50 slide-in-right">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-500 p-6 flex items-start space-x-4 max-w-md">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Message Sent Successfully!</h3>
              <p className="text-sm text-gray-600">
                Thank you for reaching out. Our support team will get back to you within 24 hours.
              </p>
            </div>
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <Header activePage="support" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1d236b] rounded-full mb-6">
            <FiHelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Trip Adora - Supplier Support Center
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Welcome to the Trip Adora Supplier Support Center.
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-left space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We're here to help you manage your business smoothly and successfully. Whether you're just getting started, adding new products, or handling bookings and payments, this guide covers everything you need to know as a valued partner of Trip Adora.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our mission is simple: to help suppliers like you reach more travelers, deliver outstanding experiences, and grow your business with confidence.
            </p>
          </div>
        </div>

        {/* Main Content - Supplier Guide */}
        <div className="space-y-12">
          {/* 1. Getting Started */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <FiBook className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">1. Getting Started with Trip Adora</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Account Creation & Profile Verification</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Complete your supplier profile with accurate business information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Upload required documents (business license, insurance, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Verify your contact information and bank details</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiStar className="w-5 h-5 text-yellow-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Adding Your First Product</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm"><strong>Title:</strong> Create compelling, descriptive titles</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm"><strong>Description:</strong> Write detailed descriptions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm"><strong>Photos:</strong> Upload high-quality images (minimum 5)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm"><strong>Pricing:</strong> Set competitive prices with clear inclusions</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiShield className="w-5 h-5 text-blue-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Content Standards</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Use professional, engaging language</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Include all relevant safety information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Ensure accuracy in all descriptions and pricing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. Managing Your Listings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Managing Your Listings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiSettings className="w-5 h-5 text-blue-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Editing Products</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Update availability, pricing, and descriptions anytime</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Add seasonal variations and special offers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Upload new photos to keep listings fresh</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiCalendar className="w-5 h-5 text-green-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Seasonal Availability</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Set opening/closing times for different seasons</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Block blackout dates when services aren't available</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Update capacity limits based on demand</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiStar className="w-5 h-5 text-yellow-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Extra Options</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Add pickup points and transportation options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Specify available languages and guides</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Create add-on services and upgrades</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiTrendingUp className="w-5 h-5 text-purple-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Quality Control</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Regularly update your listings with current information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Respond to customer reviews professionally</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Monitor your listing performance and make improvements</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Bookings & Cancellations */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                <FiCalendar className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. Bookings & Cancellations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Receiving Bookings</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">You'll receive instant notifications for new bookings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Review booking details and confirm availability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Contact customers directly through our messaging system</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiClock className="w-5 h-5 text-red-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Handling Customer No-Shows</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Wait 15 minutes after scheduled start time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Attempt to contact the customer via phone/message</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Report no-show through the platform for refund processing</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiAlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Supplier Cancellations</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Only cancel in case of emergency or weather conditions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Provide at least 24 hours notice when possible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Offer alternative dates or full refunds</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiInfo className="w-5 h-5 text-blue-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Refund & Cancellation Policy</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Free cancellation up to 24 hours before start time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">50% refund for cancellations within 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">No refund for no-shows or cancellations after start time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Payments & Invoices */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Payments & Invoices</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiClock className="w-5 h-5 text-blue-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Payout Schedule</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Weekly payouts every Tuesday</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Minimum payout threshold: $50</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Payment processed to your registered bank account</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiTrendingUp className="w-5 h-5 text-purple-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Currencies & Exchange Rates</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Payments made in your local currency</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Exchange rates updated daily</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">All fees and commissions clearly displayed</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiBook className="w-5 h-5 text-indigo-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Invoice Management</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Download detailed reports from your dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Track all transactions and commissions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Export data for accounting purposes</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiInfo className="w-5 h-5 text-orange-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Commission & Fees</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Standard commission: 15% per booking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Payment processing fees: 2.9% + $0.30</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">No hidden fees or surprise charges</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5. Customer Communication */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <FiMessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">5. Customer Communication</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiMessageSquare className="w-5 h-5 text-blue-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Built-in Messaging</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Use our secure messaging system for all communication</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Share photos, documents, and important updates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Maintain professional communication at all times</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiClock className="w-5 h-5 text-green-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Response Guidelines</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Respond to messages within 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Use polite, helpful language</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Provide clear answers and next steps</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiStar className="w-5 h-5 text-yellow-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Special Requests</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Accommodate reasonable special requests when possible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Communicate any additional costs clearly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Update booking details if changes are made</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 6. Policies & Compliance */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                <FiShield className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">6. Policies & Compliance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiShield className="w-5 h-5 text-blue-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Licensing & Insurance</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Maintain valid business licenses and permits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Keep insurance coverage up to date</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Provide proof of compliance when requested</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Safety Standards</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Regular safety checks and equipment maintenance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Follow all local safety guidelines and regulations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Provide safety briefings to customers</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-4">
                  <FiUsers className="w-5 h-5 text-purple-500 mr-3" />
                  <h3 className="font-semibold text-gray-900">Supplier Code of Conduct</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Treat all customers with respect and professionalism</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Maintain high standards of service delivery</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Report any issues or concerns immediately</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 7. Technical Support */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                <FiSettings className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">7. Technical Support</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiAlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  Account Login Issues
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Use the "Forgot Password" feature to reset your password</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Clear your browser cache and cookies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Contact support if issues persist</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiDollarSign className="w-4 h-4 text-green-500 mr-2" />
                  Updating Payment Information
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Go to Account Settings &gt; Payment Methods</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Update bank account details securely</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Verify changes with a test transaction</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiHelpCircle className="w-4 h-4 text-orange-500 mr-2" />
                  Reporting System Bugs
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Use our bug report form with detailed descriptions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Attach screenshots or error messages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Include your browser and device information</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 8. FAQs & Tutorials */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                <FiHelpCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">8. FAQs & Tutorials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiBook className="w-4 h-4 text-blue-500 mr-2" />
                  Step-by-Step Guides
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Creating your first listing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Setting up availability and pricing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Managing bookings and customer communication</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiMail className="w-4 h-4 text-green-500 mr-2" />
                  Contact Support
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700"><strong>Live Chat:</strong> Available 24/7 for urgent issues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700"><strong>Email Support:</strong> support@tripadora.com</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700"><strong>Submit a Request Form:</strong> For detailed inquiries</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 9. Best Practices for Success */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                <FiTrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">9. Best Practices for Success</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiStar className="w-4 h-4 text-yellow-500 mr-2" />
                  Keep Your Listings Updated
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Regularly refresh photos and descriptions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Update pricing based on season and demand</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Add new features and improvements</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiClock className="w-4 h-4 text-green-500 mr-2" />
                  Respond Quickly
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Answer customer questions within hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Confirm bookings promptly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Provide helpful recommendations</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiUsers className="w-4 h-4 text-purple-500 mr-2" />
                  Encourage Reviews
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Ask satisfied customers to leave reviews</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Respond to all reviews professionally</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Use feedback to improve your services</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiCheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                  Maintain Professional Behavior
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Always be courteous and helpful</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Deliver what you promise</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">Handle problems with grace and solutions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Send Us a Message Form */}
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
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email address</label>
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Subject</label>
              <input 
                type="text" 
                required
                value={form.subject}
                onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent transition-all"
                placeholder="What's this about?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Tell us more about your inquiry or feedback...</label>
              <textarea 
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent transition-all resize-none"
                placeholder="Describe your question or feedback in detail..."
              ></textarea>
            </div>
            
            <div className="text-center pt-4">
              <button 
                type="submit"
                className="bg-[#1d236b] text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 mx-auto"
              >
                <FiSend className="w-5 h-5" />
                <span>Send message</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SupportPage;
