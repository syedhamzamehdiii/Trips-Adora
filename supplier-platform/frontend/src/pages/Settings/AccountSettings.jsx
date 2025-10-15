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
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8">
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

      {/* Profile Information Section */}
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-sm border border-gray-200 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section - Main Content */}
        <div className="lg:col-span-2 space-y-8 pr-8 border-r border-gray-200">
          {/* Your Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your information
            </h2>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <span className="font-medium w-36 inline-block">Account type:</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  Private individual
                </span>
              </p>
              <p>
                <span className="font-medium w-36 inline-block">Public name:</span>
                Suneel Pirkash
              </p>
              <p>
                <span className="font-medium w-36 inline-block">Legal name:</span>
                SUNEEL PIRKASH
              </p>
              <p>
                <span className="font-medium w-36 inline-block">Email:</span>
                suneelpirkash@gmail.com
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
                <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">1 Chome-1 Nishi-Shinjuku, Shinjuku City, Tokyo</p>
              </div>
              <div>
                <p className="font-medium mb-1">Zip/Post code:</p>
                <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">160-0022</p>
              </div>
              <div>
                <p className="font-medium mb-1">City:</p>
                <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">Shinjuku</p>
              </div>
              <div>
                <p className="font-medium mb-1">State:</p>
                <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">Tokyo Prefecture</p>
              </div>
              <div>
                <p className="font-medium mb-1">Country:</p>
                <p className="bg-gray-50 px-3 py-2 rounded border text-gray-600">Japan</p>
              </div>
              <div>
                <p className="font-medium mb-1">Contact information:</p>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <select className="bg-gray-100 text-gray-700 text-sm px-2 py-2 border-r outline-none">
                    <option>WhatsApp number</option>
                    <option>IMO number</option>
                    <option selected>QQ Number</option>
                    <option>DingTalk Number</option>
                    <option>Rakuten Viber</option>
                  </select>
                  <input
                    type="text"
                    value="876543210"
                    className="flex-1 px-3 py-2 outline-none bg-gray-50 text-gray-600"
                    readOnly
                  />
                </div>
                <a
                  href="#"
                  className="text-blue-500 text-xs mt-1 inline-block hover:underline"
                >
                  Add more
                </a>
              </div>
            </div>
          </section>

          {/* Upload Sections */}
          <section className="space-y-6 text-sm">
            {[
              "Business operation license",
              "Public liability insurance",
              "Logo",
            ].map((item) => (
              <div key={item}>
                <p className="font-medium mb-2">{item}:</p>
                <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                  <FiUpload size={16} className="mr-2" />
                  Upload new photo
                </button>
                <p className="text-red-400 text-xs mt-1">Not yet Provided by you</p>
              </div>
            ))}
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
                strokeDashoffset="170"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-800">
              40%
            </span>
          </div>

          <h3 className="text-gray-800 font-medium mb-4">Complete your profile</h3>

          <ul className="space-y-2 text-sm text-left">
            {[
              { label: "Personal Info", value: "+10%", done: false },
              { label: "Setup account", value: "+20%", done: true },
              { label: "Upload your photo", value: "+10%", done: true },
              { label: "Notifications", value: "+10%", done: false },
              { label: "Location", value: "+10%", done: false },
              { label: "Biography", value: "+30%", done: false },
              { label: "Bank details", value: "+10%", done: true },
            ].map((item) => (
              <li
                key={item.label}
                className="flex justify-between items-center"
              >
                <span
                  className={`flex items-center gap-2 ${
                    item.done ? "text-green-600" : "text-gray-700"
                  }`}
                >
                  {item.done ? "✔️" : "⚠️"} {item.label}
                </span>
                <span
                  className={`${
                    item.done ? "text-green-600" : "text-gray-700"
                  } font-medium`}
                >
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
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

      <footer className="bg-[#1d236b] text-white py-16">
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