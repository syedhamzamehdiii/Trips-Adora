import { useState } from 'react';
import { FiUpload, FiEdit, FiUserPlus, FiLock, FiAlertCircle, FiCheck, FiInfo, FiEye, FiEyeOff, FiSettings } from 'react-icons/fi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const AccountSettings = () => {
  // User profile data
  const [profileData, setProfileData] = useState({
    publicName: 'Suneel Pirkash',
    legalName: 'SUMEIL PIRKASH',
    email: 'suneelpikash@gmail.com',
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

  // File uploads
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [businessLicense, setBusinessLicense] = useState(null);
  const [businessLicensePreview, setBusinessLicensePreview] = useState(null);
  const [liabilityInsurance, setLiabilityInsurance] = useState(null);
  const [liabilityInsurancePreview, setLiabilityInsurancePreview] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Profile completion data
  const [profileCompletion] = useState({
    percentage: 70,
    items: [
      { name: 'Personal info', completed: true, percentage: 10 },
      { name: 'Setup account', completed: true, percentage: 20 },
      { name: 'Upload your photo', completed: true, percentage: 10 },
      { name: 'Notifications', completed: false, percentage: 10 },
      { name: 'Location', completed: false, percentage: 10 },
      { name: 'Biography', completed: false, percentage: 30 },
      { name: 'Bank details', completed: false, percentage: 10 }
    ]
  });

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
          setProfilePhotoPreview(e.target.result);
          break;
        case 'businessLicense':
          setBusinessLicense(file);
          setBusinessLicensePreview(e.target.result);
          break;
        case 'liabilityInsurance':
          setLiabilityInsurance(file);
          setLiabilityInsurancePreview(e.target.result);
          break;
        case 'logo':
          setLogo(file);
          setLogoPreview(e.target.result);
          break;
        default:
          break;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggle = (section, key) => {
    if (section === 'notifications') {
      setNotifications(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    } else if (section === 'reports') {
      setReports(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    } else if (section === 'twoFactor') {
      setTwoFactor(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Profile Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Profile Photo and Info */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview}
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
                <h2 className="text-2xl font-bold text-gray-900">Edward William</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  <FiEdit size={14} className="mr-1" />
                  Edit
                </button>
              </div>
              <p className="text-gray-600">Notting Hill, London</p>
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
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
              <FiAlertCircle size={16} className="mr-2" />
              Account verification
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <FiUserPlus size={16} className="mr-2" />
              Add a new user
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <FiLock size={16} className="mr-2" />
              Login access
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Your Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Your information</h3>
          
          <div className="space-y-4">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account type</label>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {profileData.accountType}
              </div>
            </div>

            {/* Public Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Public name</label>
              <Input
                value={profileData.publicName}
                onChange={(e) => handleInputChange('publicName', e.target.value)}
                placeholder="Enter public name"
              />
            </div>

            {/* Legal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Legal name</label>
              <Input
                value={profileData.legalName}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                placeholder="Enter legal name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email"
              />
            </div>
          </div>
        </div>

        {/* Middle Column - Office Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Office information</h3>
          
          <div className="space-y-4">
            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street address</label>
              <Input
                value={profileData.streetAddress}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                placeholder="Enter street address"
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip/Post code</label>
              <Input
                value={profileData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="Enter zip code"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <Input
                value={profileData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <Input
                value={profileData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter state"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <Input
                value={profileData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Enter country"
              />
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact information</label>
              <div className="flex space-x-2">
                <select
                  value={profileData.contactType}
                  onChange={(e) => handleInputChange('contactType', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DG number">DG number</option>
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
                <Input
                  value={profileData.contactValue}
                  onChange={(e) => handleInputChange('contactValue', e.target.value)}
                  placeholder="Enter contact"
                  className="flex-2"
                />
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                Add more
              </button>
            </div>

            {/* Business Operation License */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business operation license</label>
              <div className="flex items-center space-x-3">
                {businessLicensePreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={businessLicensePreview}
                      alt="Business license preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileUpload('businessLicense', e)}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  id="business-license-upload"
                />
                <label
                  htmlFor="business-license-upload"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <FiUpload size={14} className="mr-1" />
                  Upload new photo
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                JPG or PNG, max 5MB
              </p>
            </div>

            {/* Public Liability Insurance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Public liability insurance</label>
              <div className="flex items-center space-x-3">
                {liabilityInsurancePreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={liabilityInsurancePreview}
                      alt="Insurance preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileUpload('liabilityInsurance', e)}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  id="insurance-upload"
                />
                <label
                  htmlFor="insurance-upload"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <FiUpload size={14} className="mr-1" />
                  Upload new photo
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                JPG or PNG, max 5MB
              </p>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex items-center space-x-3">
                {logoPreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileUpload('logo', e)}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <FiUpload size={14} className="mr-1" />
                  Upload new photo
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                JPG or PNG, max 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Complete Your Profile */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Complete your profile</h3>
          
          {/* Progress Circle */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${profileCompletion.percentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{profileCompletion.percentage}%</span>
              </div>
            </div>
          </div>

          {/* Progress Items */}
          <div className="space-y-3">
            {profileCompletion.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {item.completed ? (
                      <FiCheck className="text-green-500" size={16} />
                    ) : (
                      <FiInfo className="text-gray-400" size={16} />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm text-gray-500">+{item.percentage}%</span>
              </div>
            ))}
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
  );
};

export default AccountSettings;