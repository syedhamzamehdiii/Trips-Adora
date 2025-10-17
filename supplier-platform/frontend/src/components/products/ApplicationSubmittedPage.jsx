import React from 'react';
import { FiCheckCircle, FiClock, FiMail, FiHome, FiArrowRight, FiDownload } from 'react-icons/fi';

const ApplicationSubmittedPage = ({ onReturnToDashboard }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/assets/logo.jpg" 
            alt="TripsAdora Logo" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <h1 className="text-xl font-bold text-gray-900">TripsAdora</h1>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <div className="w-80 relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url("/assets/WhatsApp Image 2025-10-13 at 4.19.02 PM.jpeg")'
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gray-900 bg-opacity-40"></div>
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-5xl font-bold text-white leading-tight">
                Product<br />Submission
              </h2>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 space-y-8">
          {/* Application Submitted Successfully Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-green-600" size={40} />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
              Thank you for submitting your product application. We have received all your information and documentation.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <span className="text-blue-700 font-medium text-lg">Application ID: #PA-2024-9243</span>
            </div>
          </div>

          {/* Review Process Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <FiClock className="text-orange-600" size={40} />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Review Process
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
              Our team will review your application within the next 48 hours. We will carefully examine all submitted documents and product information.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
              <span className="text-yellow-800 font-medium">Expected Review Completion: Friday, September 26, 2025</span>
            </div>
          </div>

          {/* What Happens Next Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What Happens Next
            </h2>
            
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Our product review team will validate your submission and documentation
                </p>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We will notify you via email about the review status within 48 hours
                </p>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  If approved, you'll receive onboarding instructions and access to your supplier dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Questions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FiMail className="text-blue-600" size={24} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Questions about your Application
            </h2>
            
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Trip-Adora Team</span>
              </p>
              <a 
                href="mailto:tripadora@support.com" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                tripadora@support.com
              </a>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <FiDownload size={16} />
                <span>Download Receipt</span>
              </button>
              
              <button 
                onClick={onReturnToDashboard}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiHome size={16} />
                <span>Return to Dashboard</span>
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center text-gray-500 text-sm">
            Keep this confirmation for your records. You will also receive an email confirmation shortly.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSubmittedPage;