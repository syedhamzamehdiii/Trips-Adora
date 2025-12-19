import React, { useEffect, useState } from 'react';
import AddHolderModal from './AddHolderModal';
import HoldersModal from './HoldersModal';
import platformSettingsService from '../services/platformSettingsService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Platform info');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  // Toggle states for Payment Gateways
  const [paymentGateways, setPaymentGateways] = useState({
    stripe: true,
    paypal: true,
  });

  // Platform Information state
  const [platformName, setPlatformName] = useState('Trip Adora');
  const [platformUrl, setPlatformUrl] = useState('https://tripsadora.com');
  const [supportEmail, setSupportEmail] = useState('support@tripsadora.com');
  const [contactNumber, setContactNumber] = useState('92+12345678-8');
  const [savingPlatformInfo, setSavingPlatformInfo] = useState(false);
  const [platformInfoSaved, setPlatformInfoSaved] = useState(false);
  const [platformInfoError, setPlatformInfoError] = useState(null);

  // Commission settings (persisted via admin backend)
  const [commissionPercent, setCommissionPercent] = useState(25);
  const [savingPayments, setSavingPayments] = useState(false);
  const [paymentsSaved, setPaymentsSaved] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  // Refund Policy state
  const [refundPolicy, setRefundPolicy] = useState({
    tiers: [
      { percentage: 100, days: 3, label: "03 days before Tour" },
      { percentage: 50, days: 1, label: "01 days before Tour" },
      { percentage: 0, days: 0, label: "On the day of tour" }
    ],
    notes: [
      "Guests can cancel any time before check-in and receive a full refund if they cancel at least 24 hours before check-in.",
      "If guests cancel less than 24 hours before check-in, they will not receive a refund",
      "This policy applies to all bookings made after the policy update date"
    ],
    free_cancellation_until: null
  });
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [editingRefund, setEditingRefund] = useState(null);
  const [refundForm, setRefundForm] = useState({
    percentage: '',
    days: '',
  });
  const [savingRefundPolicy, setSavingRefundPolicy] = useState(false);
  const [refundPolicySaved, setRefundPolicySaved] = useState(false);
  const [refundPolicyError, setRefundPolicyError] = useState(null);
  
  // Holder Modals state
  const [isAddHolderModalOpen, setIsAddHolderModalOpen] = useState(false);
  const [isHoldersModalOpen, setIsHoldersModalOpen] = useState(false);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(platformUrl);
    alert('URL copied to clipboard!');
  };

  const handleSavePlatformInfo = async () => {
    try {
      setSavingPlatformInfo(true);
      setPlatformInfoError(null);
      
      await platformSettingsService.updatePlatformSettings({
        platformName: platformName,
        platformUrl: platformUrl,
        supportEmail: supportEmail,
        contactNumber: contactNumber,
      });
      
      setPlatformInfoSaved(true);
      setTimeout(() => setPlatformInfoSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update platform information:', error);
      setPlatformInfoError(error?.response?.data?.detail || error?.message || 'Failed to update platform information.');
    } finally {
      setSavingPlatformInfo(false);
    }
  };

  const getRefundLabel = (percentage, days) => {
    if (days === 0) {
      return "On the day of tour";
    }
    return `${String(days).padStart(2, '0')} days before Tour`;
  };

  const getRefundTypeLabel = (percentage) => {
    if (percentage === 100) return "Full Refund";
    if (percentage === 0) return "No Refund";
    if (percentage >= 50) return "Partial Refund";
    return "Small Refund";
  };

  const handleEditRefund = (tierIndex) => {
    const tier = refundPolicy.tiers[tierIndex];
    setEditingRefund({ tierIndex, originalPercentage: tier.percentage, originalDays: tier.days });
    setRefundForm({
      percentage: tier.percentage.toString(),
      days: tier.days.toString(),
    });
    setIsRefundModalOpen(true);
  };

  const handleSaveRefund = async () => {
    try {
      // Parse percentage - handle both string and number
      let percentage = refundForm.percentage;
      if (typeof percentage === 'string') {
        percentage = percentage.replace('%', '').trim();
      }
      percentage = parseInt(percentage) || 0;
      
      // Parse days - handle both string and number
      let days = refundForm.days;
      if (typeof days === 'string') {
        days = days.trim();
      }
      days = parseInt(days) || 0;
      
      // Clamp percentage to 0-100
      percentage = Math.max(0, Math.min(100, percentage));
      
      // Update the specific tier by index
      const updatedTiers = refundPolicy.tiers.map((tier, index) => {
        if (index === editingRefund.tierIndex) {
          return {
            ...tier,
            percentage: percentage,
            days: days,
            label: getRefundLabel(percentage, days)
          };
        }
        return tier;
      });
      
      const updatedPolicy = {
        ...refundPolicy,
        tiers: updatedTiers
      };
      
      setSavingRefundPolicy(true);
      setRefundPolicyError(null);
      
      await platformSettingsService.updatePlatformSettings({
        refundPolicy: updatedPolicy
      });
      
      setRefundPolicy(updatedPolicy);
      setRefundPolicySaved(true);
      setIsRefundModalOpen(false);
      setEditingRefund(null);
      setTimeout(() => setRefundPolicySaved(false), 3000);
    } catch (error) {
      console.error('Failed to update refund policy:', error);
      setRefundPolicyError(error?.response?.data?.detail || error?.message || 'Failed to update refund policy.');
    } finally {
      setSavingRefundPolicy(false);
    }
  };

  // Load platform settings (commission + refund policy + platform info)
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const s = await platformSettingsService.getPlatformSettings();
        if (!active) return;
        if (typeof s?.commission_percent === 'number') {
          setCommissionPercent(s.commission_percent);
        } else if (typeof s?.commission_rate === 'number') {
          setCommissionPercent(Math.round(s.commission_rate * 100));
        }
        if (s?.refund_policy) {
          setRefundPolicy(s.refund_policy);
        }
        if (s?.platform_name) setPlatformName(s.platform_name);
        if (s?.platform_url) setPlatformUrl(s.platform_url);
        if (s?.support_email) setSupportEmail(s.support_email);
        if (s?.contact_number) setContactNumber(s.contact_number);
      } catch (error) {
        console.error('Failed to load platform settings:', error);
        // keep defaults
      }
    };
    load();
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      if (active) {
        load();
      }
    }, 10000);
    
    return () => { 
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[36px] font-normal" style={{ color: '#27804A' }}>
          Settings
        </h1>
        {activeTab === 'Platform info' && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddHolderModalOpen(true)}
              className="px-4 py-2 rounded-lg text-white font-medium text-sm"
              style={{ backgroundColor: '#3B69E2' }}
            >
              Add Holder
            </button>
            <button
              onClick={() => setIsHoldersModalOpen(true)}
              className="px-4 py-2 rounded-lg text-white font-medium text-sm"
              style={{ backgroundColor: '#3B69E2' }}
            >
              Holders
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveTab('Platform info')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition ${
            activeTab === 'Platform info'
              ? 'text-white shadow-sm'
              : 'bg-gray-100 text-gray-600'
          }`}
          style={activeTab === 'Platform info' ? { backgroundColor: '#284078' } : {}}
        >
          Platform info
        </button>
        <button
          onClick={() => setActiveTab('Payments')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition ${
            activeTab === 'Payments'
              ? 'text-white shadow-sm'
              : 'bg-gray-100 text-gray-600'
          }`}
          style={activeTab === 'Payments' ? { backgroundColor: '#284078' } : {}}
        >
          Payments
        </button>
      </div>

      {activeTab === 'Platform info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Platform Information */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Platform Information</h2>
              <div className="space-y-5">
                {/* Platform name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => {
                        setPlatformName(e.target.value);
                        setPlatformInfoSaved(false);
                        setPlatformInfoError(null);
                      }}
                      onBlur={handleSavePlatformInfo}
                      disabled={savingPlatformInfo}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                    {savingPlatformInfo && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform URL
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={platformUrl}
                        onChange={(e) => {
                          setPlatformUrl(e.target.value);
                          setPlatformInfoSaved(false);
                          setPlatformInfoError(null);
                        }}
                        onBlur={handleSavePlatformInfo}
                        disabled={savingPlatformInfo}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                      {savingPlatformInfo && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium border border-blue-500"
                      style={{ color: '#3B69E2', backgroundColor: 'rgba(59, 105, 226, 0.1)' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Support email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => {
                        setSupportEmail(e.target.value);
                        setPlatformInfoSaved(false);
                        setPlatformInfoError(null);
                      }}
                      onBlur={handleSavePlatformInfo}
                      disabled={savingPlatformInfo}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                    {savingPlatformInfo && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact no. */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact no.
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => {
                        setContactNumber(e.target.value);
                        setPlatformInfoSaved(false);
                        setPlatformInfoError(null);
                      }}
                      onBlur={handleSavePlatformInfo}
                      disabled={savingPlatformInfo}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                    {savingPlatformInfo && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Privacy & Security</h2>
              <p className="text-sm text-gray-600 mb-4">Edit your password</p>
              <a href="#" className="text-sm" style={{ color: '#3B69E2' }}>
                Edit
              </a>
              
              <div className="mt-6 space-y-5">
                {/* Current password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword.current ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword.new ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm new password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm new password
                  </label>
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP
                  </label>
                  <div className="flex gap-2 mb-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-semibold border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Put your 6 digits O.T.P here to update password
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Two-Factor Authentication section removed per requirement */}
          </div>
        </div>
      )}

      {activeTab === 'Payments' && (
        <div className="space-y-8">
          {/* Connected Payment Gateways */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Connected Payment Gateways</h2>
            <div className="space-y-4">
              {/* Stripe */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Stripe</h3>
                  <p className="text-sm text-gray-500">Connected</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={paymentGateways.stripe}
                      onChange={(e) => setPaymentGateways({ ...paymentGateways, stripe: e.target.checked })}
                    />
                    <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      paymentGateways.stripe ? 'bg-blue-600' : 'bg-gray-200'
                    }`} style={paymentGateways.stripe ? { backgroundColor: '#3B69E2' } : {}}></div>
                  </label>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Configure
                  </button>
                </div>
              </div>

              {/* Paypal */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Paypal</h3>
                  <p className="text-sm text-gray-500">Connected</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={paymentGateways.paypal}
                      onChange={(e) => setPaymentGateways({ ...paymentGateways, paypal: e.target.checked })}
                    />
                    <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      paymentGateways.paypal ? 'bg-blue-600' : 'bg-gray-200'
                    }`} style={paymentGateways.paypal ? { backgroundColor: '#3B69E2' } : {}}></div>
                  </label>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Configure
                  </button>
                </div>
              </div>

              {/* Square */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Square</h3>
                  <p className="text-sm text-gray-500">Not connected</p>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>

          {/* Commission Settings */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Commission Settings</h2>
            <div className="space-y-6">
              {/* Platform commission rate */}
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Platform commission rate
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={commissionPercent}
                      onChange={(e) => { 
                        const inputValue = e.target.value;
                        // Allow empty string for editing, but convert to number when valid
                        if (inputValue === '') {
                          setCommissionPercent('');
                        } else {
                          const numValue = parseFloat(inputValue);
                          if (!isNaN(numValue)) {
                            setCommissionPercent(numValue);
                          }
                        }
                        setPaymentsSaved(false);
                        setPaymentError(null);
                      }}
                      onBlur={(e) => {
                        // Ensure we have a valid number when input loses focus
                        if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                          setCommissionPercent(25); // Reset to default if invalid
                        }
                      }}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      style={{ width: '90px' }}
                    />
                    <div className="px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: '#E3F2FD', color: '#3B69E2' }}>
                      %
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Default commission rate applied to all bookings
                </p>
              </div>
            </div>
          </div>

          {/* Refund Policy */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Refund Policy</h2>
            <div className="flex gap-4">
              {refundPolicy.tiers.map((tier, index) => (
                <div key={index} className="flex-1" style={{ maxWidth: '33.33%' }}>
                  <div className="flex items-center gap-2">
                    <div className="p-4 border border-gray-200 rounded-lg bg-white flex-1">
                      <span className="text-lg font-semibold" style={{ color: '#3B69E2' }}>{tier.percentage}%</span>
                    </div>
                    <button 
                      onClick={() => handleEditRefund(index)}
                      className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm mt-2 text-gray-500">{tier.label}</p>
                  <p className="text-xs mt-1 text-gray-400">{getRefundTypeLabel(tier.percentage)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Update Settings Button */}
      {activeTab === 'Platform info' && (
        <div className="flex flex-col items-end gap-2 mt-8">
          {platformInfoError && (
            <div className="text-sm text-red-600 mb-2">
              {platformInfoError}
            </div>
          )}
          {platformInfoSaved && (
            <div className="text-sm text-green-600 mb-2">
              Platform information saved successfully!
            </div>
          )}
          {refundPolicyError && (
            <div className="text-sm text-red-600 mb-2">
              {refundPolicyError}
            </div>
          )}
          {refundPolicySaved && (
            <div className="text-sm text-green-600 mb-2">
              Refund policy updated successfully! Suppliers have been notified.
            </div>
          )}
          <button
            onClick={async () => {
              try {
                setSavingRefundPolicy(true);
                setRefundPolicyError(null);
                await platformSettingsService.updatePlatformSettings({
                  refundPolicy: refundPolicy
                });
                setRefundPolicySaved(true);
                setTimeout(() => setRefundPolicySaved(false), 3000);
              } catch (error) {
                console.error('Failed to update refund policy:', error);
                setRefundPolicyError(error?.response?.data?.detail || error?.message || 'Failed to update refund policy.');
              } finally {
                setSavingRefundPolicy(false);
              }
            }}
            disabled={savingRefundPolicy}
            className={`px-8 py-3 rounded-lg text-white font-bold text-sm transition-opacity ${
              savingRefundPolicy ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
            }`}
            style={{ backgroundColor: '#3B69E2' }}
          >
            {savingRefundPolicy ? 'Saving…' : (refundPolicySaved ? 'Saved ✓' : 'Update Settings')}
          </button>
        </div>
      )}
      
      {activeTab === 'Payments' && (
        <div className="flex flex-col items-end gap-2 mt-8">
          {paymentError && (
            <div className="text-sm text-red-600 mb-2">
              {paymentError}
            </div>
          )}
          <button
            onClick={async () => {
              try {
                // Validate commission percent
                let commissionValue;
                if (typeof commissionPercent === 'number') {
                  commissionValue = commissionPercent;
                } else if (commissionPercent === '' || commissionPercent === null || commissionPercent === undefined) {
                  setPaymentError('Please enter a commission rate');
                  return;
                } else {
                  commissionValue = parseFloat(commissionPercent);
                }
                
                if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
                  setPaymentError('Commission rate must be between 0 and 100');
                  return;
                }

                setSavingPayments(true);
                setPaymentsSaved(false);
                setPaymentError(null);
                
                await platformSettingsService.updatePlatformSettings({
                  commissionPercent: commissionValue,
                });
                
                setPaymentsSaved(true);
                // Clear error message after 3 seconds
                setTimeout(() => setPaymentsSaved(false), 3000);
              } catch (error) {
                console.error('Failed to update platform settings:', error);
                setPaymentError(error?.response?.data?.detail || error?.message || 'Failed to update settings. Please try again.');
              } finally {
                setSavingPayments(false);
              }
            }}
            disabled={savingPayments}
            className={`px-8 py-3 rounded-lg text-white font-bold text-sm transition-opacity ${
              savingPayments ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
            }`}
            style={{ backgroundColor: '#3B69E2' }}
          >
            {savingPayments ? 'Saving…' : (paymentsSaved ? 'Saved ✓' : 'Update settings')}
          </button>
        </div>
      )}

      {/* Refund Policy Edit Modal */}
      {isRefundModalOpen && editingRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => {
          setIsRefundModalOpen(false);
          setEditingRefund(null);
          setRefundPolicyError(null);
        }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Edit Refund Policy</h3>
            
            <div className="space-y-5">
              {/* Percentage Deduct */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Refund Percentage (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={refundForm.percentage}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRefundForm({ ...refundForm, percentage: value });
                    setRefundPolicyError(null);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ color: '#3B69E2' }}
                  placeholder="0-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {refundForm.percentage && !isNaN(parseInt(refundForm.percentage)) 
                    ? getRefundTypeLabel(parseInt(refundForm.percentage))
                    : 'Enter percentage (0-100)'}
                </p>
              </div>

              {/* Days Within */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Days Before Tour:
                </label>
                <input
                  type="number"
                  min="0"
                  value={refundForm.days}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRefundForm({ ...refundForm, days: value });
                    setRefundPolicyError(null);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ color: '#3B69E2' }}
                  placeholder="0 or more"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {refundForm.days && !isNaN(parseInt(refundForm.days))
                    ? getRefundLabel(
                        parseInt(refundForm.percentage) || 0,
                        parseInt(refundForm.days)
                      )
                    : 'Enter number of days before tour'}
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveRefund}
                disabled={savingRefundPolicy}
                className={`w-full px-6 py-3 rounded-lg text-white font-bold text-sm transition-opacity ${
                  savingRefundPolicy ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
                }`}
                style={{ backgroundColor: '#3B69E2' }}
              >
                {savingRefundPolicy ? 'Saving…' : 'SAVE'}
              </button>
              {refundPolicyError && (
                <div className="text-sm text-red-600 mt-2">
                  {refundPolicyError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Holder Modal */}
      <AddHolderModal
        isOpen={isAddHolderModalOpen}
        onClose={() => setIsAddHolderModalOpen(false)}
      />

      {/* Holders Modal */}
      <HoldersModal
        isOpen={isHoldersModalOpen}
        onClose={() => setIsHoldersModalOpen(false)}
        onUpdate={() => {
          // Refresh data if needed
          console.log('Sub-admins updated');
        }}
      />
    </div>
  );
};

export default Settings;

