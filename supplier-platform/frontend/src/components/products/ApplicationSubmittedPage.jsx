import React from 'react';
import { FiCheckCircle, FiClock, FiMail, FiArrowRight, FiDownload, FiX } from 'react-icons/fi';

const ApplicationSubmittedPage = ({ isOpen, onClose, onReturnToDashboard }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex overflow-hidden relative">
        {/* Navbar with Logo */}
        <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/logo.jpg" 
              alt="TripsAdora Logo" 
              className="h-8 w-auto"
            />
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex w-full pt-16">
          {/* Left Sidebar */}
          <div className="w-80 relative overflow-hidden bg-gray-200">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: 'url("/assets/WhatsApp Image 2025-10-13 at 4.19.02 PM.jpeg")'
              }}
            />
            
            {/* Content */}
            <div className="relative z-10 flex items-start justify-center h-full pt-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                  Product<br />Submission
                </h2>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex justify-center overflow-y-auto">
            <div className="w-full max-w-4xl p-8 space-y-6">
          {/* Application Submitted Successfully Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-green-600" size={32} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
              Thank you for submitting your product application. We have received all your information and documentation.
            </p>
            
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block">
              <span className="font-medium">Application ID: #PA-2024-9243</span>
            </div>
          </div>

          {/* Review Process Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <FiClock className="text-orange-600" size={32} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Review Process
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
              Our team will review your application within the next 48 hours. We will carefully examine all submitted documents and product information.
            </p>
            
            <div className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg inline-block">
              <span className="font-medium">Expected Review Completion: Friday, September 26, 2025</span>
            </div>
          </div>

          {/* What Happens Next Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What Happens Next
            </h2>
            
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-gray-700 font-bold text-sm">1</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Our product review team will validate your submission and documentation
                </p>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-gray-700 font-bold text-sm">2</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  We will notify you via email about the review status within 48 hours
                </p>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-gray-700 font-bold text-sm">3</span>
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiMail className="text-blue-600" size={20} />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Questions about your Application
            </h2>
            
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-2">
                <span className="font-bold">Trip-Adora Team</span>
              </p>
              <a 
                href="mailto:tripadora@support.com" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                tripadora@support.com
              </a>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <FiDownload size={16} />
                <span>Download Receipt</span>
              </button>
              
              <button 
                onClick={onReturnToDashboard}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Return to Dashboard</span>
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-left text-gray-500 text-sm">
            Keep this confirmation for your records. You will also receive an email confirmation shortly.
          </div>
             </div>
           </div>
         </div>
       </div>
     </div>
  );
};

export default ApplicationSubmittedPage;