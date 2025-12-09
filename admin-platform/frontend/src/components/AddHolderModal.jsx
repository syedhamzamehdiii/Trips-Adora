import React, { useState } from 'react';
import RoleManagementModal from './RoleManagementModal';

const SUPPLIER_API_BASE_URL = import.meta.env.VITE_SUPPLIER_API_BASE_URL || 'http://localhost:8000/api/v1';

const AddHolderModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('Select Role');
  const [selectedPermissions, setSelectedPermissions] = useState({
    productsManagement: false,
    customersFeedbacks: false,
    finance: false,
  });
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRoleSelected = (permissions) => {
    setSelectedPermissions(permissions);
    // Update role display text based on selected permissions
    const activeRoles = Object.entries(permissions)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => {
        if (key === 'productsManagement') return 'Products Management';
        if (key === 'customersFeedbacks') return 'Customers & Feedbacks';
        if (key === 'finance') return 'Finance';
        return key;
      });
    setSelectedRole(activeRoles.length > 0 ? activeRoles.join(', ') : 'Select Role');
  };

  const handleSendInvite = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (selectedRole === 'Select Role') {
      setError('Please select at least one role');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Extract name from email (or use email as name)
      const fullName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      // Note: This requires authentication. In production, admin should be authenticated
      // For now, we'll use grant-access endpoint which creates invitation and sends email
      const response = await fetch(`${SUPPLIER_API_BASE_URL}/auth/grant-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In production, add Authorization header with admin token
          // 'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          email: email,
          permissions: selectedPermissions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send invite');
      }

      setSuccess(true);
      // Show success message with invitation link
      const invitationInfo = data.invitation_link 
        ? `Invitation email sent to ${data.email}!\n\nInvitation Link: ${data.invitation_link}\n\n(Share this link if email was not sent)`
        : `Invitation sent to ${data.email}!`;
      
      alert(invitationInfo);
      
      // Reset form
    setEmail('');
    setMessage('');
      setSelectedRole('Select Role');
      setSelectedPermissions({
        productsManagement: false,
        customersFeedbacks: false,
        finance: false,
      });
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to send invite. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right - Very Visible */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 z-[100] flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xl shadow-lg transition-all"
          aria-label="Close modal"
          type="button"
          style={{ lineHeight: '1' }}
        >
          ×
        </button>

        {/* Title and Subtitle */}
        <div className="mb-6 pr-12">
          <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">Add a new user profile</h2>
          <p className="text-sm text-gray-500 text-center">Continue by entering an email address</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            User invited successfully!
          </div>
        )}

        <div className="space-y-5">
          {/* Role Selection */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="px-6 py-2 rounded-full text-white font-bold text-sm shadow-sm"
              style={{ backgroundColor: '#3B69E2' }}
            >
              {selectedRole}
            </button>
          </div>

          {/* Email Address */}
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Personal Message (Optional) */}
          <div>
            <input
              type="text"
              placeholder="Personal message (Optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Send Invite Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSendInvite}
              disabled={isLoading}
              className="px-8 py-3 rounded-lg text-white font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#3B69E2' }}
            >
              {isLoading ? 'Sending...' : 'Send invite to access'}
            </button>
          </div>
        </div>
      </div>

      {/* Role Management Modal */}
      <RoleManagementModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onRoleSelected={handleRoleSelected}
      />
    </div>
  );
};

export default AddHolderModal;

