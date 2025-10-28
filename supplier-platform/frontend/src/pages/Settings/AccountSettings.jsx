import { useState, useEffect, useRef, useMemo } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiUpload, FiEdit, FiUserPlus, FiLock, FiAlertCircle, FiCheck, FiInfo, FiEye, FiEyeOff, FiSettings } from 'react-icons/fi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const AccountSettings = () => {
  // User profile data
  const [profileData, setProfileData] = useState({
    publicName: 'Your Public Name',
    legalName: 'Your Legal Name',
    email: 'you@gmail.com',
    location: 'Notting Hill, London',
    accountType: 'Private individual',
    streetAddress: '1 Chome-1 Nishi-Shinjuku, Shinjuku City, Tokyo',
    zipCode: '160-0022',
    city: 'Shinjuku',
    state: 'Tokyo Prefecture',
    country: 'Japan',
    contactType: 'DG number',
    contactValue: '87654320'
  });

  // Contact information state for multiple phone numbers
  const [contactNumbers, setContactNumbers] = useState([
    {
      id: 1,
      type: 'QQ Number',
      value: '876543210'
    }
  ]);

  // File uploads
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [businessLicense, setBusinessLicense] = useState(null);
  const [businessLicensePreview, setBusinessLicensePreview] = useState(null);
  const [liabilityInsurance, setLiabilityInsurance] = useState(null);
  const [liabilityInsurancePreview, setLiabilityInsurancePreview] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Global user photo state for all instances
  const [globalUserPhoto, setGlobalUserPhoto] = useState(null);

  // Image crop modal state (for profile photo)
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 80, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  // hydration flag to avoid overwriting saved data with defaults on first mount
  const [isHydrated, setIsHydrated] = useState(false);

  // Persist helper (writes immediately)
  const persistSettings = (next = {}) => {
    try {
      const payloadRaw = {
        profileData,
        contactNumbers,
        notifications,
        reports,
        twoFactor,
        passwordData,
        editableInfo,
        globalUserPhoto,
        // store heavy images only as data URLs and truncate if too large
        businessLicensePreview,
        liabilityInsurancePreview,
        logoPreview,
        ...next
      };
      // compress by removing huge images if exceeding ~4.5MB budget
      let payload = { ...payloadRaw };
      let json = JSON.stringify(payload);
      const limit = 4.5 * 1024 * 1024; // ~4.5MB string size budget
      if (json.length > limit) {
        payload.businessLicensePreview = null;
        json = JSON.stringify(payload);
      }
      if (json.length > limit) {
        payload.liabilityInsurancePreview = null;
        json = JSON.stringify(payload);
      }
      if (json.length > limit) {
        payload.logoPreview = null;
        json = JSON.stringify(payload);
      }
      localStorage.setItem('account_settings', json);
      window.dispatchEvent(new Event('account_settings_updated'));
      window.dispatchEvent(new Event('accountSettingsUpdated'));
    } catch (_) {}
  };
  
  // Settings states
  const [notifications, setNotifications] = useState({
    billingAccounting: true,
    newBookings: true,
    faqs: false
  });
  
  const [reports, setReports] = useState({
    weekly: true,
    monthly: true,
    emailInsights: true
  });
  
  const [twoFactor, setTwoFactor] = useState({
    smsAuth: true,
    emailAuth: true,
    authApp: true
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  


  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Contact number management functions
  const addContactNumber = () => {
    const newId = Math.max(...contactNumbers.map(c => c.id), 0) + 1;
    const updated = [
      ...contactNumbers,
      { id: newId, type: 'WhatsApp number', value: '' }
    ];
    setContactNumbers(updated);
    persistSettings({ contactNumbers: updated });
  };

  const removeContactNumber = (id) => {
    if (contactNumbers.length > 1) {
      const updated = contactNumbers.filter(contact => contact.id !== id);
      setContactNumbers(updated);
      persistSettings({ contactNumbers: updated });
    }
  };

  const updateContactNumber = (id, field, value) => {
    const updated = contactNumbers.map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    );
    setContactNumbers(updated);
    persistSettings({ contactNumbers: updated });
  };

  // User management modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showLoginAccessModal, setShowLoginAccessModal] = useState(false);
  const [userAccess, setUserAccess] = useState({
    allowLogin: true,
    roles: {
      administration: false,
      finance: false,
      manageBooking: false,
      travelQueries: false
    }
  });

  // Track if a user has been added (one-time button)
  const [hasAddedUser, setHasAddedUser] = useState(false);
  const [addedUserEmail, setAddedUserEmail] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const infoSectionRef = useRef(null);
  const [showAccountVerification, setShowAccountVerification] = useState(false);
  const [editableInfo, setEditableInfo] = useState({
    publicName: 'Your Public Name',
    legalName: 'Your Legal Name',
    email: 'example@gmail.com',
    streetAddress: '1 Chome-1 Nishi-Shinjuku, Shinjuku City, Tokyo',
    zipCode: '160-0022',
    city: 'Shinjuku',
    state: 'Tokyo Prefecture',
    country: 'Japan'
  });

  // Derived profile completion (computed from current state)
  const computeCompletion = () => {
    const items = [
      { name: 'Personal Info', completed: Boolean(editableInfo.publicName && editableInfo.legalName && editableInfo.email), percentage: 10 },
      { name: 'Setup account', completed: true, percentage: 20 },
      { name: 'Upload your photo', completed: Boolean(globalUserPhoto), percentage: 10 },
      { name: 'Notifications', completed: notifications.billingAccounting || notifications.newBookings || notifications.faqs, percentage: 10 },
      { name: 'Location', completed: Boolean(editableInfo.city && editableInfo.country), percentage: 10 },
      { name: 'Biography', completed: false, percentage: 30 },
      { name: 'Bank details', completed: true, percentage: 10 },
    ];
    const percentage = items.reduce((sum, i) => sum + (i.completed ? i.percentage : 0), 0);
    return { percentage, items };
  };
  const profileCompletion = useMemo(() => computeCompletion(), [editableInfo, notifications, globalUserPhoto]);

  // Required document validation flags
  const [docErrors, setDocErrors] = useState({ business: false, liability: false, logo: false });
  const [fieldErrors, setFieldErrors] = useState({});

  // Get enabled roles for display
  const getEnabledRoles = () => {
    const enabledRoles = [];
    if (userAccess.roles.administration) enabledRoles.push('Administration');
    if (userAccess.roles.finance) enabledRoles.push('Finance');
    if (userAccess.roles.manageBooking) enabledRoles.push('Manage Booking');
    if (userAccess.roles.travelQueries) enabledRoles.push('Travel Queries');
    return enabledRoles;
  };


  const handleUserAccessToggle = (role) => {
    setUserAccess(prev => {
      const updated = { ...prev, roles: { ...prev.roles, [role]: !prev.roles[role] } };
      try {
        const saved = localStorage.getItem('account_settings');
        const base = saved ? JSON.parse(saved) : {};
        localStorage.setItem('account_settings', JSON.stringify({ ...base, userAccess: updated, hasAddedUser, addedUserEmail }));
      } catch (_) {}
      return updated;
    });
  };

  const handleLoginToggle = () => {
    setUserAccess(prev => {
      const updated = { ...prev, allowLogin: !prev.allowLogin };
      try {
        const saved = localStorage.getItem('account_settings');
        const base = saved ? JSON.parse(saved) : {};
        localStorage.setItem('account_settings', JSON.stringify({ ...base, userAccess: updated, hasAddedUser, addedUserEmail }));
      } catch (_) {}
      return updated;
    });
  };

  const handleRemoveUser = () => {
    setHasAddedUser(false);
    setAddedUserEmail('');
    setShowRemoveConfirm(false);
    try {
      const saved = localStorage.getItem('account_settings');
      const base = saved ? JSON.parse(saved) : {};
      localStorage.setItem('account_settings', JSON.stringify({ ...base, hasAddedUser: false, addedUserEmail: '', userAccess }));
    } catch (_) {}
  };

  const handleEditInfo = () => {
    setIsEditingInfo(true);
    if (infoSectionRef.current) {
      infoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveInfo = () => {
    // Validate all required text fields
    const errors = {};
    if (!editableInfo.publicName?.trim()) errors.publicName = true;
    if (!editableInfo.legalName?.trim()) errors.legalName = true;
    if (!editableInfo.email?.trim()) errors.email = true;
    if (!editableInfo.streetAddress?.trim()) errors.streetAddress = true;
    if (!editableInfo.zipCode?.trim()) errors.zipCode = true;
    if (!editableInfo.city?.trim()) errors.city = true;
    if (!editableInfo.state?.trim()) errors.state = true;
    if (!editableInfo.country?.trim()) errors.country = true;

    // Enforce mandatory document uploads
    const missingBusiness = !businessLicensePreview;
    const missingLiability = !liabilityInsurancePreview;
    const missingLogo = !logoPreview;
    setDocErrors({ business: missingBusiness, liability: missingLiability, logo: missingLogo });
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0 || missingBusiness || missingLiability || missingLogo) {
      alert('Please complete all required fields and upload all documents before saving.');
      return;
    }
    // Persist immediately on save to avoid losing office info when navigating fast
    try {
      const payload = {
        profileData,
        contactNumbers,
        notifications,
        reports,
        twoFactor,
        passwordData,
        editableInfo,
        globalUserPhoto,
        businessLicensePreview,
        liabilityInsurancePreview,
        logoPreview
      };
      localStorage.setItem('account_settings', JSON.stringify(payload));
      window.dispatchEvent(new Event('account_settings_updated'));
    } catch (_) {}
    setIsEditingInfo(false);
  };

  const handleCancelEdit = () => {
    setIsEditingInfo(false);
    // Reset to original values if needed
  };

  const handleInfoChange = (field, value) => {
    const next = { ...editableInfo, [field]: value };
    setEditableInfo(next);
    // do not persist per keystroke for large text fields; debounce by using confirm button
  };

  const handleFileUpload = (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a JPG or PNG file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      switch (type) {
        case 'profile':
          setProfilePhoto(file);
          setImageToCrop(e.target.result);
          setShowCropModal(true);
          break;
        case 'businessLicense':
          setBusinessLicense(file);
          setBusinessLicensePreview(e.target.result);
          persistSettings({ businessLicensePreview: e.target.result });
          break;
        case 'liabilityInsurance':
          setLiabilityInsurance(file);
          setLiabilityInsurancePreview(e.target.result);
          persistSettings({ liabilityInsurancePreview: e.target.result });
          break;
        case 'logo':
          setLogo(file);
          setLogoPreview(e.target.result);
          persistSettings({ logoPreview: e.target.result });
          break;
        default:
          break;
      }
    };
    reader.readAsDataURL(file);
  };

  // Crop helpers
  const getCroppedImg = (image, cropArea) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const width = cropArea.width * scaleX;
    const height = cropArea.height * scaleY;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      width,
      height,
      0,
      0,
      width,
      height
    );
    return canvas.toDataURL('image/jpeg');
  };

  const applyCrop = () => {
    if (completedCrop && imgRef.current) {
      const cropped = getCroppedImg(imgRef.current, completedCrop);
      setProfilePhotoPreview(cropped);
      setGlobalUserPhoto(cropped);
      setShowCropModal(false);
      setImageToCrop(null);
    }
  };

  // Persist and load settings in real-time
  useEffect(() => {
    try {
      let saved = localStorage.getItem('account_settings');
      if (!saved) {
        saved = sessionStorage.getItem('account_settings');
      }
      if (saved) {
        const data = JSON.parse(saved);
        if (data.profileData) setProfileData(data.profileData);
        if (data.contactNumbers) setContactNumbers(data.contactNumbers);
        if (data.notifications) setNotifications(data.notifications);
        if (data.reports) setReports(data.reports);
        if (data.twoFactor) setTwoFactor(data.twoFactor);
        if (data.passwordData) setPasswordData(data.passwordData);
        if (data.editableInfo) setEditableInfo(data.editableInfo);
        if (data.globalUserPhoto) {
          setGlobalUserPhoto(data.globalUserPhoto);
          setProfilePhotoPreview(data.globalUserPhoto);
        }
        if (data.businessLicensePreview) setBusinessLicensePreview(data.businessLicensePreview);
        if (data.liabilityInsurancePreview) setLiabilityInsurancePreview(data.liabilityInsurancePreview);
        if (data.logoPreview) setLogoPreview(data.logoPreview);
        if (typeof data.hasAddedUser === 'boolean') setHasAddedUser(data.hasAddedUser);
        if (data.addedUserEmail) setAddedUserEmail(data.addedUserEmail);
        if (data.userAccess) setUserAccess(data.userAccess);
      }
      setIsHydrated(true);
    } catch (_) {}
  }, []);

  // Manual save function (via button)
  const handleConfirmAndSaveAll = () => {
    const payloadRaw = {
      profileData,
      contactNumbers,
      notifications,
      reports,
      twoFactor,
      passwordData,
      editableInfo,
      globalUserPhoto,
      businessLicensePreview,
      liabilityInsurancePreview,
      logoPreview,
      hasAddedUser,
      addedUserEmail,
      userAccess
    };
    try {
      let payload = { ...payloadRaw };
      let json = JSON.stringify(payload);
      const limit = 4.5 * 1024 * 1024;
      if (json.length > limit) { payload.businessLicensePreview = null; json = JSON.stringify(payload); }
      if (json.length > limit) { payload.liabilityInsurancePreview = null; json = JSON.stringify(payload); }
      if (json.length > limit) { payload.logoPreview = null; json = JSON.stringify(payload); }
      localStorage.setItem('account_settings', json);
      // fire both events to satisfy all listeners
      window.dispatchEvent(new Event('account_settings_updated'));
      window.dispatchEvent(new Event('accountSettingsUpdated'));
      alert('All account settings saved successfully!');
    } catch (err) {
      try {
        sessionStorage.setItem('account_settings', JSON.stringify(payloadRaw));
        window.dispatchEvent(new Event('account_settings_updated'));
        window.dispatchEvent(new Event('accountSettingsUpdated'));
        alert('All account settings saved successfully!');
      } catch (e) {
        console.error('Save error:', e);
        alert('Failed to save settings. Please try again.');
      }
    }
  };

  const handleToggle = (section, key) => {
    if (section === 'notifications') {
      setNotifications(prev => {
        const updated = { ...prev, [key]: !prev[key] };
        persistSettings({ notifications: updated });
        return updated;
      });
    } else if (section === 'reports') {
      setReports(prev => {
        const updated = { ...prev, [key]: !prev[key] };
        persistSettings({ reports: updated });
        return updated;
      });
    } else if (section === 'twoFactor') {
      setTwoFactor(prev => {
        const updated = { ...prev, [key]: !prev[key] };
        persistSettings({ twoFactor: updated });
        return updated;
      });
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOTPChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOTP = passwordData.otp.split('');
      newOTP[index] = value;
      setPasswordData(prev => ({
        ...prev,
        otp: newOTP.join('')
      }));
    }
  };

  const handleUpdateSettings = (section) => {
    // Data is already persisted via handleToggle; this is a success indicator
    alert(`${section} settings updated successfully!`);
  };

  const handlePasswordUpdate = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    if (passwordData.otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP.');
      return;
    }

    alert('Password updated successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      otp: ''
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* Top Profile Card */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Profile Photo and Info */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {globalUserPhoto || profilePhotoPreview ? (
                    <img
                      src={globalUserPhoto || profilePhotoPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <FiUserPlus className="text-gray-500" size={40} />
                    </div>
                  )}
                </div>
              <input
                type="file"
                onChange={(e) => handleFileUpload('profile', e)}
                accept=".jpg,.jpeg,.png"
                className="hidden"
                id="profile-upload"
              />
              <label
                htmlFor="profile-upload"
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <FiUpload size={16} />
              </label>
            </div>
            <div className="text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{editableInfo.publicName || 'Edward William'}</h2>
                <button onClick={handleEditInfo} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  <FiEdit size={14} className="mr-1" />
                  Edit
                </button>
              </div>
              <p className="text-gray-600">{editableInfo.city && editableInfo.country ? `${editableInfo.city}, ${editableInfo.country}` : (profileData.location || 'Notting Hill, London')}</p>
            </div>
          </div>

          {/* Middle: Supplier ID and Upload */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 mb-2">Supplier ID 00032123</div>
            <input
              type="file"
              onChange={(e) => handleFileUpload('profile', e)}
              accept=".jpg,.jpeg,.png"
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors mb-2"
            >
              <FiUpload size={16} className="mr-2" />
              Upload new photo
            </label>
            <p className="text-xs text-gray-500">
              JPG or PNG, max 5MB
            </p>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-col space-y-3 w-full lg:w-auto">
            <button 
              onClick={handleConfirmAndSaveAll}
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <FiCheck size={16} className="mr-2" />
              Confirm & Save All Settings
            </button>
            <button 
              onClick={() => setShowAccountVerification(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <FiAlertCircle size={16} className="mr-2" />
              Account verification
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-sm border border-gray-200 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section - Main Content */}
        <div className="lg:col-span-2 space-y-8 pr-8 border-r border-gray-200">
          {/* Your Information */}
          <section ref={infoSectionRef}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Your information
              </h2>
              {!isEditingInfo ? (
                <button
                  onClick={handleEditInfo}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  <FiEdit size={14} className="mr-1" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveInfo}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <span className="font-medium w-36 inline-block">Account type:</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  Private individual
                </span>
              </p>
              <p>
                <span className="font-medium w-36 inline-block">Public name:</span>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={editableInfo.publicName}
                    onChange={(e) => handleInfoChange('publicName', e.target.value)}
                    className={`px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.publicName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  editableInfo.publicName
                )}
              </p>
              <p>
                <span className="font-medium w-36 inline-block">Legal name:</span>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={editableInfo.legalName}
                    onChange={(e) => handleInfoChange('legalName', e.target.value)}
                    className={`px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.legalName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  editableInfo.legalName
                )}
              </p>
              <p>
                <span className="font-medium w-36 inline-block">Email:</span>
                {isEditingInfo ? (
                  <input
                    type="email"
                    value={editableInfo.email}
                    onChange={(e) => handleInfoChange('email', e.target.value)}
                    className={`px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  editableInfo.email
                )}
              </p>
            </div>
          </section>

          {/* Office Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Office information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-medium mb-1">Street address:</p>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={editableInfo.streetAddress}
                    onChange={(e) => handleInfoChange('streetAddress', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.streetAddress ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">{editableInfo.streetAddress}</p>
                )}
              </div>
              <div>
                <p className="font-medium mb-1">Zip/Post code:</p>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={editableInfo.zipCode}
                    onChange={(e) => handleInfoChange('zipCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">{editableInfo.zipCode}</p>
                )}
              </div>
              <div>
                <p className="font-medium mb-1">City:</p>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={editableInfo.city}
                    onChange={(e) => handleInfoChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">{editableInfo.city}</p>
                )}
              </div>
              <div>
                <p className="font-medium mb-1">State:</p>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={editableInfo.state}
                    onChange={(e) => handleInfoChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.state ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">{editableInfo.state}</p>
                )}
              </div>
              <div>
                <p className="font-medium mb-1">Country:</p>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={editableInfo.country}
                    onChange={(e) => handleInfoChange('country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.country ? 'border-red-500' : 'border-gray-300'}`}
                  />
                ) : (
                  <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">{editableInfo.country}</p>
                )}
              </div>
              <div>
                <p className="font-medium mb-1">Contact information:</p>
                <div className="space-y-2">
                  {contactNumbers.map((contact, index) => (
                    <div key={contact.id} className="flex items-center justify-between border rounded-lg w-full">
                      <select 
                        className="bg-gray-100 text-gray-700 text-sm px-2 py-2 border-r outline-none max-w-[180px]"
                        value={contact.type}
                        onChange={(e) => updateContactNumber(contact.id, 'type', e.target.value)}
                      >
                        <option value="WhatsApp number">WhatsApp number</option>
                        <option value="IMO number">IMO number</option>
                        <option value="QQ Number">QQ Number</option>
                        <option value="DingTalk Number">DingTalk Number</option>
                        <option value="Rakuten Viber">Rakuten Viber</option>
                      </select>
                      <input
                        type="text"
                        value={contact.value}
                        onChange={(e) => updateContactNumber(contact.id, 'value', e.target.value)}
                        placeholder="Enter contact number"
                        className="flex-1 px-3 py-2 outline-none bg-gray-50 text-gray-600 min-w-0"
                      />
                      {contactNumbers.length > 1 && (
                        <button
                          onClick={() => removeContactNumber(contact.id)}
                          className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors focus:outline-none flex-shrink-0"
                          title="Remove contact number"
                          aria-label="Remove contact number"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addContactNumber}
                  className="text-blue-500 text-xs mt-1 inline-block hover:underline"
                >
                  Add more
                </button>
              </div>
            </div>
          </section>

          {/* Upload Sections */}
          <section className="space-y-6 text-sm">
            {/* Business operation license */}
            <div>
              <p className="font-medium mb-2">Business operation license:</p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                id="upload-business-license"
                onChange={(e) => handleFileUpload('businessLicense', e)}
              />
              <label htmlFor="upload-business-license" className="inline-flex border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 items-center cursor-pointer">
                <FiUpload size={16} className="mr-2" />
                Upload new photo
              </label>
              {businessLicensePreview ? (
                <div className="mt-2 flex items-center space-x-3">
                  <img src={businessLicensePreview} alt="Business License" className="w-16 h-16 object-cover rounded border" />
                  <span className="text-green-600 text-xs font-medium">Provided by you</span>
                </div>
              ) : (
                <p className={`text-xs mt-1 ${docErrors.business ? 'text-red-600 font-semibold' : 'text-red-400'}`}>Not yet Provided by you</p>
              )}
            </div>

            {/* Public liability insurance */}
            <div>
              <p className="font-medium mb-2">Public liability insurance:</p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                id="upload-liability"
                onChange={(e) => handleFileUpload('liabilityInsurance', e)}
              />
              <label htmlFor="upload-liability" className="inline-flex border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 items-center cursor-pointer">
                <FiUpload size={16} className="mr-2" />
                Upload new photo
              </label>
              {liabilityInsurancePreview ? (
                <div className="mt-2 flex items-center space-x-3">
                  <img src={liabilityInsurancePreview} alt="Liability" className="w-16 h-16 object-cover rounded border" />
                  <span className="text-green-600 text-xs font-medium">Provided by you</span>
                </div>
              ) : (
                <p className={`text-xs mt-1 ${docErrors.liability ? 'text-red-600 font-semibold' : 'text-red-400'}`}>Not yet Provided by you</p>
              )}
            </div>

            {/* Logo */}
            <div>
              <p className="font-medium mb-2">Logo:</p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                id="upload-logo"
                onChange={(e) => handleFileUpload('logo', e)}
              />
              <label htmlFor="upload-logo" className="inline-flex border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 items-center cursor-pointer">
                <FiUpload size={16} className="mr-2" />
                Upload new photo
              </label>
              {logoPreview ? (
                <div className="mt-2 flex items-center space-x-3">
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 object-cover rounded border" />
                  <span className="text-green-600 text-xs font-medium">Provided by you</span>
                </div>
              ) : (
                <p className={`text-xs mt-1 ${docErrors.logo ? 'text-red-600 font-semibold' : 'text-red-400'}`}>Not yet Provided by you</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Section - Complete Your Profile */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <svg
              className="w-24 h-24 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#22c55e"
                strokeWidth="8"
                fill="none"
                strokeDasharray="282.6"
                strokeDashoffset={`${282.6 - (282.6 * profileCompletion.percentage) / 100}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-800">
              {profileCompletion.percentage}%
            </span>
          </div>

          <h3 className="text-gray-800 font-medium mb-4">Complete your profile</h3>

          <ul className="space-y-2 text-sm text-left">
            {profileCompletion.items.map((item, idx) => (
              <li
                key={`${item.name}-${idx}`}
                className="flex justify-between items-center"
              >
                <span
                  className={`flex items-center gap-2 ${
                    item.completed ? "text-green-600" : "text-gray-700"
                  }`}
                >
                  {item.completed ? "✔️" : "⚠️"} {item.name}
                </span>
                <span
                  className={`${
                    item.completed ? "text-green-600" : "text-gray-700"
                  } font-medium`}
                >
                  +{item.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-sm border border-gray-200 p-8 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">User Management</h2>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - User Information */}
          <div className="flex-1">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Current User Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-24">Email:</span>
                  <span className="text-sm text-gray-900">
                    {hasAddedUser ? addedUserEmail : 'No user added'}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm font-medium text-gray-700 w-24 mt-1">Role access:</span>
                  <div className="flex flex-wrap gap-2">
                    {hasAddedUser ? (
                      getEnabledRoles().length > 0 ? (
                        getEnabledRoles().map((role, index) => (
                          <span
                            key={`${role}-${index}`}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 italic">No roles accessible</span>
                      )
                    ) : (
                      <span className="text-sm text-gray-500 italic">No roles</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Action Buttons */}
          <div className="lg:w-80">
            <div className="space-y-4">
              {!hasAddedUser ? (
                <button 
                  onClick={() => setShowUserModal(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full"
                >
                  <FiUserPlus size={16} className="mr-2" />
                  Add a new user
                </button>
              ) : (
                <button 
                  onClick={() => setShowRemoveConfirm(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove user
                </button>
              )}
              
              <button 
                onClick={() => setShowLoginAccessModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full"
              >
                <FiLock size={16} className="mr-2" />
                Login access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>
            
            <div className="space-y-6">
              {/* Billing & Accounting */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Billing & Accounting</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Booking and revenue summary every week.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggle('notifications', 'billingAccounting')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.billingAccounting ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.billingAccounting ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* New Bookings */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">New Bookings</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Detailed monthly performance reports.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggle('notifications', 'newBookings')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.newBookings ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.newBookings ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* FAQs */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">FAQs</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Get insights from questions or regarding their questions. This option can only be enabled for one account.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggle('notifications', 'faqs')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.faqs ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.faqs ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Warning Message */}
              {!notifications.faqs && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <FiAlertCircle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={16} />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Important Notice</p>
                      <p className="mt-1">
                        This option cannot be turned off, as all travel accounts must be available for customer communication. 
                        To disable it here, please enable customer questions in another account.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Security</h2>
            
            <div className="space-y-6">
              {/* Edit Password Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Edit your password</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Edit
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      placeholder="Current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? (
                        <FiEyeOff className="text-gray-400" size={16} />
                      ) : (
                        <FiEye className="text-gray-400" size={16} />
                      )}
                    </button>
                  </div>

                  {/* New Password */}
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? (
                        <FiEyeOff className="text-gray-400" size={16} />
                      ) : (
                        <FiEye className="text-gray-400" size={16} />
                      )}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? (
                        <FiEyeOff className="text-gray-400" size={16} />
                      ) : (
                        <FiEye className="text-gray-400" size={16} />
                      )}
                    </button>
                  </div>

                  {/* OTP Input */}
                  <div>
                    <p className="text-sm text-gray-700 mb-2">
                      Put your 6 digits O.T.P here to update password
                    </p>
                    <div className="flex space-x-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          value={passwordData.otp[index] || ''}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Reports */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Reports</h2>
            
            <div className="space-y-6">
              {/* Weekly */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Weekly</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Booking and revenue summary every week.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggle('reports', 'weekly')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      reports.weekly ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reports.weekly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Monthly */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Monthly</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Detailed monthly performance reports.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggle('reports', 'monthly')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      reports.monthly ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reports.monthly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Email Insights */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Email Insights</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive emails about insights and optimization, plus quality checks for new products and edits.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggle('reports', 'emailInsights')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      reports.emailInsights ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reports.emailInsights ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => handleUpdateSettings('Reports')}
                className="w-full"
                icon={<FiSettings size={16} />}
              >
                Update settings
              </Button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Two-Factor Authentication</h2>
            
            <div className="space-y-6">
              {/* SMS Authentication */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">SMS Authentication</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive OPT via WhatsApp or SMS.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggle('twoFactor', 'smsAuth')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      twoFactor.smsAuth ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        twoFactor.smsAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Email Authentication */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Email Authentication</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive OPT via Email.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggle('twoFactor', 'emailAuth')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      twoFactor.emailAuth ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        twoFactor.emailAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Authentication App */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Authentication app</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    An authentication app generates secure verification codes to confirm your identity when logging in.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggle('twoFactor', 'authApp')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      twoFactor.authApp ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        twoFactor.authApp ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => handleUpdateSettings('Two-Factor Authentication')}
                className="w-full"
                icon={<FiSettings size={16} />}
              >
                Update settings
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Add New User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Add a new user profile</h3>
              <p className="text-sm text-gray-600">Continue by entering an email address</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Personal message (Optional)"
                  rows={3}
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  if (newUserEmail.trim()) {
                    // Set the added user email and mark as added
                    setAddedUserEmail(newUserEmail.trim());
                    setHasAddedUser(true);
                    // Reset form
                    setNewUserEmail('');
                    setPersonalMessage('');
                    // Close modal
                    setShowUserModal(false);
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                Send invite to access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[700px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">Crop Profile Photo</h2>
              <button onClick={() => setShowCropModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img ref={imgRef} src={imageToCrop} alt="Crop" style={{ maxWidth: '100%', maxHeight: '400px' }} />
                </ReactCrop>
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">Drag to adjust the circular crop area. The photo will be displayed in a circle.</p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button onClick={() => setShowCropModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={applyCrop} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Apply Crop</button>
            </div>
          </div>
        </div>
      )}

      {/* Login Access Modal */}
      {showLoginAccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Role and login access</h3>
              <button
                onClick={() => setShowLoginAccessModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                {/* Administration */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Administration</h4>
                    <p className="text-sm text-gray-600">All access, including adding/removing users</p>
                  </div>
                  <button
                    onClick={() => handleUserAccessToggle('administration')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userAccess.roles.administration ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        userAccess.roles.administration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Finance */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Finance</h4>
                    <p className="text-sm text-gray-600">Has access to financial information only.</p>
                  </div>
                  <button
                    onClick={() => handleUserAccessToggle('finance')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userAccess.roles.finance ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        userAccess.roles.finance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Manage Booking */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Manage booking</h4>
                    <p className="text-sm text-gray-600">Can access financial info only.</p>
                  </div>
                  <button
                    onClick={() => handleUserAccessToggle('manageBooking')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userAccess.roles.manageBooking ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        userAccess.roles.manageBooking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Travel Queries */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Travel Queries</h4>
                    <p className="text-sm text-gray-600">Can access financial info only.</p>
                  </div>
                  <button
                    onClick={() => handleUserAccessToggle('travelQueries')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userAccess.roles.travelQueries ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        userAccess.roles.travelQueries ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  // The roles are already updated in state, just close the modal
                  setShowLoginAccessModal(false);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove User Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to remove the user <span className="font-medium">{addedUserEmail}</span>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Verification Modal */}
      {showAccountVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Account verification</h3>
              <p className="text-sm text-gray-600 mb-6">
                In order to comply with regulatory requirements, you must verify your account to accept bookings on our platform and receive payments.
              </p>
              
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Verification holder:</span>
                  <span className="text-sm text-gray-700">Uzair Ahmad</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Account status:</span>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      unverified
                    </span>
                    <button className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                      <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setShowAccountVerification(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#1d236b] text-white py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Know About us */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Know About us</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">About us</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Careers</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Explore */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Destinations</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Experiences</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Tours</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Activities</a></li>
              </ul>
            </div>
            
            {/* Help & Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Contact Support</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Refund Policy</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Safety Guidelines</a></li>
              </ul>
            </div>

            {/* Payments & Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payments & Settings</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-gray-800 font-bold text-xs">AMEX</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-gray-800 font-bold text-xs">Master</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-gray-800 font-bold text-xs">Visa</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-gray-800 font-bold text-xs">Apple</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-gray-800 font-bold text-xs">PayPal</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-gray-800 font-bold text-xs">Google</span>
                </div>
              </div>
            </div>
            
            {/* Stay Connected */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
              <div className="space-y-4">
                <p className="text-white">Get travel deals & inspiration</p>
                <div className="flex max-w-xs">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-lg transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Follow Us</h4>
                    <div className="flex space-x-3">
                      {/* Instagram */}
                      <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      {/* LinkedIn */}
                      <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      {/* Facebook */}
                      <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      {/* Twitter */}
                      <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Language</h4>
                    <button className="bg-white text-black px-3 py-2 rounded flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">US English</span>
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Currency</h4>
                    <button className="bg-white text-black px-3 py-2 rounded flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">$ USD - US Dollar</span>
                </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer Bar */}
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-white mb-4 md:mb-0">
                ©2025 TripAdora. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm text-white">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Booking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span>10M+ Travels</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>+1-800-Travel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AccountSettings;