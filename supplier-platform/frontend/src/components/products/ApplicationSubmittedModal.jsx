import React from 'react';
import { FiCheckCircle, FiClock, FiMail, FiHome, FiX, FiArrowRight, FiDownload } from 'react-icons/fi';

const ApplicationSubmittedModal = ({ isOpen, onClose, onReturnToDashboard }) => {
  if (!isOpen) return null;

  const handleReturnToDashboard = () => {
    onReturnToDashboard();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Top White Bar with Logo */}
        <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <img 
              src="/assets/logo.jpg" 
              alt="TripsAdora Logo" 
              className="w-40 h-15 "
            />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex min-h-[80vh]">
          {/* Left Sidebar */}
          <div className="w-80 relative overflow-hidden bg-gray-100">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url("/assets/WhatsApp Image 2025-10-13 at 4.19.02 PM.jpeg")'
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-900 bg-opacity-40"></div>
            
            {/* Sidebar Content */}
            <div className="relative z-10 p-6">
              {/* Sidebar Text */}
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-black leading-tight">
                    Product<br />Submission
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 space-y-6">
            {/* Application Submitted Successfully Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="text-green-600" size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Application Submitted Successfully
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Thank you for submitting your product application. We have received all your information and documentation.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
                    <span className="text-blue-700 font-medium">Application ID: #PA-2024-9243</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Process Card */}
            <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiClock className="text-orange-600" size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Review Process
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Our team will review your application within the next 48 hours. We will carefully examine all submitted documents and product information.
                  </p>
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 inline-block">
                    <span className="text-yellow-800 font-medium">Expected Review Completion: Friday, September 26, 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens Next Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What Happens Next
              </h2>
              
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 font-medium">
                    <span className="text-blue-600 font-bold mr-2">1</span>
                    Our product review team will validate your submission and documentation
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 font-medium">
                    <span className="text-blue-600 font-bold mr-2">2</span>
                    We will notify you via email about the review status within 48 hours
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 font-medium">
                    <span className="text-blue-600 font-bold mr-2">3</span>
                    If approved, you'll receive onboarding instructions and access to your supplier dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Questions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMail className="text-gray-600" size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Questions about your Application
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-600 font-medium">Trip-Adora Team</p>
                    <a 
                      href="mailto:tripadora@support.com" 
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      tripadora@support.com
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiDownload size={16} />
                  <span>Download Receipt</span>
                </button>
                
                <button 
                  onClick={handleReturnToDashboard}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
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
    </div>
  );
};

export default ApplicationSubmittedModal;