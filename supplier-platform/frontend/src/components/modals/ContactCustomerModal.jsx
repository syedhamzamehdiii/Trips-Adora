import React, { useState } from 'react';
import { 
  FiX, 
  FiMail,
  FiSend,
  FiCopy,
  FiLoader,
  FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import bookingService from '@/services/bookingService';

const ContactCustomerModal = ({ isOpen, onClose, bookingData, supplierEmail, supplierName }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      // Clear form when opening
      setSubject('');
      setMessage('');
      setSending(false);
      setEmailSent(false);
      setEmailCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const customerEmail = bookingData?.customer_email || '';
  const customerName = bookingData?.customer_name || 'Customer';

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!customerEmail) {
      toast.error('Customer email not available');
      return;
    }

    if (!supplierEmail) {
      toast.error('Your email is not available. Please ensure you are logged in with Google.');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!bookingData?.id) {
      toast.error('Booking ID not found');
      return;
    }

    setSending(true);
    try {
      const response = await bookingService.contactCustomer(
        bookingData.id,
        subject.trim(),
        message.trim()
      );

      if (response.data?.success) {
        // Show success state on button
        setEmailSent(true);
        setSubject('');
        setMessage('');
        
        // Reset after 3 seconds and close modal
        setTimeout(() => {
          setEmailSent(false);
          onClose();
        }, 3000);
      } else {
        toast.warning(response.data?.message || 'Email may not have been sent. Please check SMTP configuration.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.detail || 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCopyEmail = () => {
    if (customerEmail) {
      navigator.clipboard.writeText(customerEmail).then(() => {
        setEmailCopied(true);
        toast.success('Email address copied to clipboard!');
        setTimeout(() => {
          setEmailCopied(false);
        }, 2000);
      }).catch(() => {
        toast.error('Failed to copy email address');
      });
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiMail size={24} className="text-[#1d236b]" />
            <h2 className="text-xl font-bold text-gray-900">Contact Customer</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSendEmail} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">To</p>
                <p className="text-sm font-semibold text-gray-900">{customerName}</p>
                <p className="text-sm text-gray-700 break-all">{customerEmail}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                  emailCopied
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {emailCopied ? (
                  <>
                    <FiCheckCircle size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FiCopy size={14} />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* From Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">From</p>
            <p className="text-sm font-semibold text-gray-900">{supplierName || 'Supplier'}</p>
            <p className="text-sm text-gray-700 break-all">{supplierEmail || 'N/A'}</p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent"
              placeholder="Enter email subject"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1d236b] focus:border-transparent resize-none"
              placeholder="Type your message here..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || emailSent || !subject.trim() || !message.trim()}
              className={`flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed ${
                emailSent
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-[#1d236b] text-white hover:bg-[#151a4a] disabled:opacity-50'
              }`}
            >
              {sending ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  <span>Sending...</span>
                </>
              ) : emailSent ? (
                <>
                  <FiCheckCircle size={16} />
                  <span>Sent!</span>
                </>
              ) : (
                <>
                  <FiSend size={16} />
                  <span>Send Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactCustomerModal;
