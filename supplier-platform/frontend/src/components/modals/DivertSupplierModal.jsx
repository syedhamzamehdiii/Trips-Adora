import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiMail,
  FiLoader,
  FiCheck,
  FiUser
} from 'react-icons/fi';
import teamService from '@/services/teamService';
import bookingService from '@/services/bookingService';
import { toast } from 'react-toastify';

const DivertSupplierModal = ({ isOpen, onClose, bookingData, onSuccess }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await teamService.getTeamMembersWithBookingAccess();
      if (response.data && response.data.team_members) {
        setTeamMembers(response.data.team_members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDivert = async () => {
    if (!selectedSupplier) {
      toast.error('Please select a supplier');
      return;
    }

    if (!bookingData?.id) {
      toast.error('Booking ID not found');
      return;
    }

    setSending(true);
    try {
      await bookingService.divertBooking(
        bookingData.id,
        selectedSupplier.email,
        selectedSupplier.full_name || selectedSupplier.business_name || selectedSupplier.email,
        reason.trim() || 'Booking diversion requested'
      );
      
      toast.success('Booking diversion request sent successfully');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error diverting booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to send diversion request');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiMail size={24} className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Divert to Supplier</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
            <p className="text-sm font-semibold text-gray-900">
              {bookingData?.id ? bookingData.id.slice(-8).toUpperCase() : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 mt-2 mb-1">Tour/Product</p>
            <p className="text-sm font-semibold text-gray-900">
              {bookingData?.title || bookingData?.tour_name || 'N/A'}
            </p>
          </div>

          {/* Team Members List */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">
              Select Supplier *
            </label>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <FiLoader className="animate-spin text-gray-400" size={24} />
                <span className="ml-2 text-gray-600">Loading team members...</span>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No team members with booking management access found. 
                  Please add users with "Manage Booking" or "Administration" access in User Management.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedSupplier(member)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedSupplier?.id === member.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-green-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {member.full_name || member.business_name || 'Supplier'}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      {selectedSupplier?.id === member.id && (
                        <FiCheck className="text-green-600" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reason (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              Reason for Diversion (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you're diverting this booking..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDivert}
            disabled={!selectedSupplier || sending || teamMembers.length === 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {sending ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FiMail size={16} />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DivertSupplierModal;

