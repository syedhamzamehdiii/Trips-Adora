import React, { useState } from 'react';
import { 
  FiX, 
  FiCopy, 
  FiDownload,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiMessageCircle
} from 'react-icons/fi';

const ShareTripModal = ({ isOpen, onClose, tripData }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tripData?.link || 'https://tripadore.com/trips/mount-fuji-day-trip');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    // QR code download functionality would go here
    console.log('Download QR code');
  };

  const handleSocialShare = (platform) => {
    const url = tripData?.link || 'https://tripadore.com/trips/mount-fuji-day-trip';
    const text = `Check out this amazing trip: ${tripData?.title || 'Mount Fuji Day Trip'}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard! You can paste it in your Instagram story or post.');
        return;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Share this tips</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trip Information Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex space-x-4">
              {/* Trip Image */}
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                <img 
                  src="/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png" 
                  alt="Mount Fuji Day Trip"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Trip Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Mount fuji day trip
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Experirnce the majestic beauty of mount fuji with guided hiking, traditional lunch, and......
                </p>
                <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium inline-block">
                  TRP-MT-FUJI-001
                </div>
              </div>
            </div>
          </div>

          {/* Share on Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share on social media</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => handleSocialShare('facebook')}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <FiFacebook size={20} className="text-white" />
              </button>
              <button
                onClick={() => handleSocialShare('instagram')}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <FiInstagram size={20} className="text-white" />
              </button>
              <button
                onClick={() => handleSocialShare('twitter')}
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
              >
                <FiTwitter size={20} className="text-white" />
              </button>
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <FiMessageCircle size={20} className="text-white" />
              </button>
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
              >
                <FiLinkedin size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Copy link</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tripData?.link || "https://tripadore.com/trips/mount-fuji-day-trip"}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FiCopy size={16} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* QR Code for Sharing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code for sharing</h3>
            <div className="flex space-x-2 mb-4">
              <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <span className="text-sm text-gray-600">QR Code</span>
              </div>
              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FiDownload size={16} />
                <span>Download</span>
              </button>
            </div>
            
            {/* QR Code Display */}
            <div className="bg-white border border-gray-300 rounded-lg p-8 flex items-center justify-center">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                {/* Actual QR Code Image */}
                <img 
                  src="/assets/qr code.png" 
                  alt="QR Code for sharing"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareTripModal;
