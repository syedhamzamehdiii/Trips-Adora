// Frontend/src/pages/Settings/AccountSettings.jsx
import { useState } from 'react';
import { FiUpload, FiEye, FiEyeOff, FiAlertTriangle, FiSettings } from 'react-icons/fi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const AccountSettings = () => {
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

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

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

  const handleLogoUpload = (event) => {
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

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleUpdateSettings = (section) => {
    // Simulate API call
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

    // Simulate password update
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account preferences and security settings</p>
      </div>

      {/* Logo Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Logo</h2>
            <p className="text-sm text-gray-600">
              {logoFile ? 'Logo uploaded successfully' : 'Not yet provided by you.'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {logoPreview && (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <input
              type="file"
              onChange={handleLogoUpload}
              accept=".jpg,.jpeg,.png"
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <FiUpload size={16} className="mr-2" />
              Upload new photo
            </label>
            {logoFile && (
              <button
                onClick={removeLogo}
                className="text-red-600 hover:text-red-700 p-1"
                title="Remove logo"
              >
                <FiEyeOff size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    Get emails from customers or regarding their questions. This option can only be enabled for one account.
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
                    <FiAlertTriangle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={16} />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Important Notice</p>
                      <p className="mt-1">
                        This option cannot be turned off, as at least one account must be available for customer communication. 
                        To disable it here, please enable customer questions on another account.
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
                      placeholder="Current password."
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
                      placeholder="New Password."
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
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="Confirm new password."
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  />

                  {/* OTP Input */}
                  <div>
                    <p className="text-sm text-gray-700 mb-2">
                      Put your 6 digits O.T.P here to update password.
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

                  {/* Update Password Button */}
                  <Button
                    variant="primary"
                    onClick={handlePasswordUpdate}
                    className="w-full"
                  >
                    Update Password
                  </Button>
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

