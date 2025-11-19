import React, { useState, useEffect, useMemo } from 'react';
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
import { QRCodeSVG } from 'qrcode.react';
import productService from '@/services/productService';

const ShareTripModal = ({ isOpen, onClose, tripData }) => {
  const [copied, setCopied] = useState(false);
  const [productData, setProductData] = useState(null);

  // Fetch product data in background (non-blocking) - only if we need more details
  useEffect(() => {
    if (!isOpen || !tripData?.productId) {
      setProductData(null);
      return;
    }

    // Only fetch if booking doesn't have enough data (title, description, image)
    const hasEnoughData = tripData?.title || tripData?.tour_name || tripData?.booking;
    if (hasEnoughData && tripData?.hero_image) {
      // Booking already has what we need, skip fetch
      return;
    }

    // Fetch in background without blocking UI
    const fetchProduct = async () => {
      try {
        const product = await productService.getProduct(tripData.productId);
        setProductData(product);
      } catch (err) {
        console.warn('Could not fetch product details for sharing (using booking data):', err);
        // Don't set error - just use booking data
      }
    };

    fetchProduct();
  }, [isOpen, tripData?.productId]);

  // Generate product URL - use booking title immediately, enhance with product title later
  const productUrl = useMemo(() => {
    if (!tripData?.productId) {
      return 'https://tripadore.com/trips/mount-fuji-day-trip';
    }
    
    // Use product title if available, otherwise use booking title, fallback to ID
    const title = productData?.title || tripData?.title || tripData?.tour_name || tripData?.booking || tripData.productId;
    const productSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    return `https://tripadore.com/trips/${productSlug}?id=${tripData.productId}`;
  }, [tripData?.productId, tripData?.title, tripData?.tour_name, tripData?.booking, productData?.title]);

  // Get product display data - use booking data immediately, enhance with product data when available
  const displayData = useMemo(() => {
    // Prefer product data if available, otherwise use booking data
    const title = productData?.title || tripData?.title || tripData?.tour_name || tripData?.booking || 'Trip';
    const description = productData?.description 
      ? productData.description.substring(0, 100) + (productData.description.length > 100 ? '...' : '')
      : (tripData?.description || 'Experience an amazing trip');
    const image = productData?.hero_image || productData?.images?.[0] || tripData?.hero_image || '/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png';
    const productId = productData?.id || tripData?.productId || tripData?.referenceCode || 'TRP-MT-FUJI-001';
    
    return {
      title,
      description,
      image,
      productId,
      link: productUrl
    };
  }, [productData, tripData, productUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(displayData.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    try {
      // Get the QR code SVG element
      const qrElement = document.getElementById('share-qr-code');
      if (!qrElement) {
        console.error('QR code element not found');
        return;
      }

      // Create a canvas to render the SVG
      const svg = qrElement.querySelector('svg');
      if (!svg) {
        console.error('SVG element not found');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-code-${displayData.productId}-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const handleSocialShare = (platform) => {
    const url = displayData.link;
    const text = `Check out this amazing trip: ${displayData.title}`;
    
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
                  src={displayData.image}
                  alt={displayData.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png';
                  }}
                />
              </div>
              
              {/* Trip Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {displayData.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {displayData.description}
                </p>
                <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium inline-block">
                  {displayData.productId}
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
                title="Share on Facebook"
              >
                <FiFacebook size={20} className="text-white" />
              </button>
              <button
                onClick={() => handleSocialShare('instagram')}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors"
                title="Share on Instagram"
              >
                <FiInstagram size={20} className="text-white" />
              </button>
              <button
                onClick={() => handleSocialShare('twitter')}
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
                title="Share on Twitter/X"
              >
                <FiTwitter size={20} className="text-white" />
              </button>
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                title="Share on WhatsApp"
              >
                <FiMessageCircle size={20} className="text-white" />
              </button>
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                title="Share on LinkedIn"
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
                value={displayData.link}
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
              <div id="share-qr-code" className="w-48 h-48 flex items-center justify-center">
                <QRCodeSVG
                  value={displayData.link}
                  size={192}
                  level="H"
                  includeMargin={true}
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
