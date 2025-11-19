import React, { useState } from 'react';
import RoleManagementModal from './RoleManagementModal';

const AddHolderModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('Role');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const handleSendInvite = () => {
    // Handle send invite logic here
    console.log('Sending invite:', { role: selectedRole, email, message });
    onClose();
    setEmail('');
    setMessage('');
    setSelectedRole('Role');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">Add a new holder</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">First Select the Role of holder.</p>

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
              className="px-8 py-3 rounded-lg text-white font-bold text-sm shadow-sm"
              style={{ backgroundColor: '#3B69E2' }}
            >
              Send invite to access
            </button>
          </div>
        </div>
      </div>

      {/* Role Management Modal */}
      <RoleManagementModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </div>
  );
};

export default AddHolderModal;

