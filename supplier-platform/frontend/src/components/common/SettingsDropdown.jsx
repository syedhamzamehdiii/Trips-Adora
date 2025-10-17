// Frontend/src/components/common/SettingsDropdown.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FiChevronRight, FiUser, FiSettings, FiKey, FiUserPlus, FiLogOut } from 'react-icons/fi';
import { ROUTES } from '@/utils/constants';

const SettingsDropdown = ({ isOpen, onClose, profileRef, onNestedDropdownChange, onOpenFromTravellerModal, onOpenFromSupplierModal }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const dropdownRef = useRef(null);
  const [showKeyInfoDropdown, setShowKeyInfoDropdown] = useState(false);
  const nestedDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          profileRef.current && !profileRef.current.contains(event.target)) {
        onClose();
        setShowKeyInfoDropdown(false); // Also close nested dropdown
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, profileRef]);

  // Close nested dropdown when clicking outside
  useEffect(() => {
    const handleNestedClickOutside = (event) => {
      if (nestedDropdownRef.current && !nestedDropdownRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowKeyInfoDropdown(false);
      }
    };

    if (showKeyInfoDropdown) {
      document.addEventListener('mousedown', handleNestedClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleNestedClickOutside);
    };
  }, [showKeyInfoDropdown]);

  // Notify parent when nested dropdown state changes
  useEffect(() => {
    if (onNestedDropdownChange) {
      onNestedDropdownChange(showKeyInfoDropdown);
    }
  }, [showKeyInfoDropdown, onNestedDropdownChange]);

  const handleMenuItemClick = (route) => {
    if (route === 'logout') {
      logout();
    } else if (route === ROUTES.SETTINGS_KEY_INFORMATION) {
      // Toggle the nested dropdown for Key information
      setShowKeyInfoDropdown(!showKeyInfoDropdown);
    } else {
      navigate(route);
      onClose();
    }
  };

  const menuItems = [
    { 
      label: 'Company Profile', 
      icon: <FiUser size={16} />, 
      route: ROUTES.SETTINGS_COMPANY_PROFILE,
      hasChevron: true 
    },
    { 
      label: 'Account Setting', 
      icon: <FiSettings size={16} />, 
      route: ROUTES.SETTINGS_ACCOUNT,
      hasChevron: false 
    },
    { 
      label: 'Key information', 
      icon: <FiKey size={16} />, 
      route: ROUTES.SETTINGS_KEY_INFORMATION,
      hasChevron: true 
    },
    { 
      label: 'Invite Partner', 
      icon: <FiUserPlus size={16} />, 
      route: ROUTES.SETTINGS_INVITE_PARTNER,
      hasChevron: true 
    },
    { 
      label: 'Sign out', 
      icon: <FiLogOut size={16} />, 
      route: 'logout',
      hasChevron: false,
      isDanger: true 
    },
  ];

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 text-center">Settings</h3>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => (
            <div key={index} className="relative">
              <button
                onClick={() => handleMenuItemClick(item.route)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  item.isDanger 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-gray-900 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon && (
                    <span className={item.isDanger ? 'text-red-600' : 'text-gray-500'}>
                      {item.icon}
                    </span>
                  )}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.hasChevron && (
                  <FiChevronRight 
                    size={16} 
                    className={`${item.isDanger ? 'text-red-600' : 'text-gray-400'}`} 
                  />
                )}
              </button>
              
              {/* Nested Dropdown for Key Information */}
              {item.route === ROUTES.SETTINGS_KEY_INFORMATION && showKeyInfoDropdown && (
                <div ref={nestedDropdownRef} className="absolute top-full left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-[60] mt-1">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        if (onOpenFromTravellerModal) {
                          onOpenFromTravellerModal();
                        }
                        setShowKeyInfoDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 text-gray-900 hover:text-gray-700"
                    >
                      <span className="text-sm font-medium">From Traveller</span>
                      <FiChevronRight size={16} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenFromSupplierModal) {
                          onOpenFromSupplierModal();
                        }
                        setShowKeyInfoDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 text-gray-900 hover:text-gray-700"
                    >
                      <span className="text-sm font-medium">By Supplier</span>
                      <FiChevronRight size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
    </div>
  );
};

export default SettingsDropdown;
