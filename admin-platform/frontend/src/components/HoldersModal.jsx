import React, { useState, useEffect } from 'react';
import subAdminService from '../services/subAdminService';
import RoleManagementModal from './RoleManagementModal';

const HoldersModal = ({ isOpen, onClose, onUpdate }) => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSubAdmins();
    }
  }, [isOpen]);

  const loadSubAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subAdminService.listSubAdmins(1, 100);
      setSubAdmins(data.sub_admins || []);
    } catch (err) {
      setError(err.message || 'Failed to load sub-admins');
      console.error('Error loading sub-admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (subAdmin) => {
    if (!window.confirm(`Are you sure you want to remove ${subAdmin.email}?`)) {
      return;
    }

    try {
      // Try to get the ID - handle both _id and id formats
      const subAdminId = subAdmin.id || subAdmin._id || subAdmin.email;
      if (!subAdminId) {
        throw new Error('Sub-admin ID not found');
      }
      
      await subAdminService.deleteSubAdmin(subAdminId);
      // Reload list to show updated state
      await loadSubAdmins();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error removing sub-admin:', err);
      alert(err.message || 'Failed to remove sub-admin. Please try again.');
    }
  };

  const handleEditPermissions = (subAdmin) => {
    setEditingPermissions(subAdmin);
    setIsRoleModalOpen(true);
  };

  const handleRoleSelected = async (permissions) => {
    if (!editingPermissions) return;

    try {
      const subAdminId = editingPermissions.id || editingPermissions._id;
      if (!subAdminId) {
        throw new Error('Sub-admin ID not found');
      }
      
      await subAdminService.updatePermissions(subAdminId, permissions);
      // Reload list immediately to show updated permissions in real-time
      await loadSubAdmins();
      setIsRoleModalOpen(false);
      setEditingPermissions(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.message || 'Failed to update permissions');
    }
  };

  const getInitials = (email) => {
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getPermissionLabels = (permissions) => {
    const labels = [];
    if (permissions.productsManagement) labels.push('Products');
    if (permissions.customersFeedbacks) labels.push('Customers');
    if (permissions.finance) labels.push('Finance');
    return labels.length > 0 ? labels.join(', ') : 'No permissions';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right - Properly Aligned - Hidden when role modal is open */}
        {!isRoleModalOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-[100] flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg shadow-lg transition-all"
            aria-label="Close modal"
            type="button"
            style={{ lineHeight: '1', padding: 0 }}
          >
            ×
          </button>
        )}

        <h2 className="font-bold text-gray-900 mb-2 text-center pr-10" style={{ fontSize: '24px' }}>
          No. of Holders added
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Manage sub-admin permissions and access.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading sub-admins...</p>
          </div>
        ) : subAdmins.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No sub-admins added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subAdmins.map((subAdmin) => (
              <div
                key={subAdmin.id || subAdmin._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                  style={{ backgroundColor: '#3B69E2' }}
                >
                  {getInitials(subAdmin.email)}
                </div>

                {/* Name and Email */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm">{subAdmin.email}</h3>
                  <p className="text-xs truncate" style={{ color: '#8C8B8B' }}>
                    {getPermissionLabels(subAdmin.permissions || {})}
                  </p>
                </div>

                {/* Edit Permissions Button */}
                <button
                  onClick={() => handleEditPermissions(subAdmin)}
                  className="px-3 py-1.5 rounded-lg flex-shrink-0 text-xs font-semibold text-white"
                  style={{ backgroundColor: '#3B69E2' }}
                >
                  Edit
                </button>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(subAdmin);
                  }}
                  className="px-4 py-1.5 rounded-lg flex-shrink-0"
                  style={{ 
                    backgroundColor: '#FF8484',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Management Modal for Editing */}
      {editingPermissions && (
        <RoleManagementModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            setEditingPermissions(null);
          }}
          onRoleSelected={handleRoleSelected}
          initialPermissions={editingPermissions.permissions || {}}
        />
      )}
    </div>
  );
};

export default HoldersModal;
