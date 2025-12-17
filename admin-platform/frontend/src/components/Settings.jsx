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

  // Commission settings (persisted via admin backend)
  const [commissionPercent, setCommissionPercent] = useState(25);
  const [payoutSchedule, setPayoutSchedule] = useState('Bi-Weekly');
  const [savingPayments, setSavingPayments] = useState(false);
  const [paymentsSaved, setPaymentsSaved] = useState(false);
  
  // Refund Policy Modal state
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [editingRefund, setEditingRefund] = useState(null);
  const [refundForm, setRefundForm] = useState({
    percentage: '',
    days: '',
  });
  
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
    navigator.clipboard.writeText('https://tripsadora.com');
    alert('URL copied to clipboard!');
  };

  const handleEditRefund = (percentage, days) => {
    setEditingRefund({ percentage, days });
    setRefundForm({
      percentage: percentage,
      days: days,
    });
    setIsRefundModalOpen(true);
  };

  const handleSaveRefund = () => {
    // Handle save logic here
    setIsRefundModalOpen(false);
    setEditingRefund(null);
  };

  // Load commission settings once (applies to admin finance + supplier payouts)
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const s = await platformSettingsService.getPlatformSettings();
        if (!active) return;
        if (typeof s?.commission_percent === 'number') setCommissionPercent(s.commission_percent);
        else if (typeof s?.commission_rate === 'number') setCommissionPercent(Math.round(s.commission_rate * 100));
        if (s?.payout_schedule) setPayoutSchedule(s.payout_schedule);
      } catch (_) {
        // keep defaults
      }
    };
    load();
    return () => { active = false; };
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
                  <input
                    type="text"
                    defaultValue="Trip Adora"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Platform URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue="https://tripsadora.com"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                  <input
                    type="email"
                    defaultValue="support@tripsadora.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Contact no. */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact no.
                  </label>
                  <input
                    type="text"
                    defaultValue="92+12345678-8"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                      value={commissionPercent}
                      onChange={(e) => { setCommissionPercent(e.target.value); setPaymentsSaved(false); }}
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

              {/* Supplier payout schedule */}
              <div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Supplier payout schedule
                  </label>
                  <div className="relative">
                    <select
                      className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      style={{ minWidth: '150px' }}
                      value={payoutSchedule}
                      onChange={(e) => { setPayoutSchedule(e.target.value); setPaymentsSaved(false); }}
                    >
                      <option>Bi-Weekly</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Policy */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Refund Policy</h2>
            <div className="flex gap-4">
              {/* 100% Refund */}
              <div className="flex-1" style={{ maxWidth: '33.33%' }}>
                <div className="flex items-center gap-2">
                  <div className="p-4 border border-gray-200 rounded-lg bg-white flex-1">
                    <span className="text-lg font-semibold" style={{ color: '#3B69E2' }}>100%</span>
                  </div>
                  <button 
                    onClick={() => handleEditRefund('100%', '03')}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm mt-2 text-gray-500">03 days before Tour</p>
              </div>

              {/* 50% Refund */}
              <div className="flex-1" style={{ maxWidth: '33.33%' }}>
                <div className="flex items-center gap-2">
                  <div className="p-4 border border-gray-200 rounded-lg bg-white flex-1">
                    <span className="text-lg font-semibold" style={{ color: '#3B69E2' }}>50%</span>
                  </div>
                  <button 
                    onClick={() => handleEditRefund('50%', '01')}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm mt-2 text-gray-500">01 days before Tour</p>
              </div>

              {/* 0% Refund */}
              <div className="flex-1" style={{ maxWidth: '33.33%' }}>
                <div className="flex items-center gap-2">
                  <div className="p-4 border border-gray-200 rounded-lg bg-white flex-1">
                    <span className="text-lg font-semibold" style={{ color: '#3B69E2' }}>0%</span>
                  </div>
                  <button 
                    onClick={() => handleEditRefund('0%', '0')}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm mt-2 text-gray-500">On the day of tour</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Settings Button */}
      {activeTab === 'Platform info' && (
        <div className="flex justify-end mt-8">
          <button
            className="px-8 py-3 rounded-lg text-white font-bold text-sm"
            style={{ backgroundColor: '#3B69E2' }}
          >
            Update settings
          </button>
        </div>
      )}
      
      {activeTab === 'Payments' && (
        <div className="flex justify-end mt-8">
          <button
            onClick={async () => {
              try {
                setSavingPayments(true);
                setPaymentsSaved(false);
                await platformSettingsService.updatePlatformSettings({
                  commissionPercent,
                  payoutSchedule,
                });
                setPaymentsSaved(true);
              } finally {
                setSavingPayments(false);
              }
            }}
            disabled={savingPayments}
            className="px-8 py-3 rounded-lg text-white font-bold text-sm"
            style={{ backgroundColor: '#3B69E2' }}
          >
            {savingPayments ? 'Saving…' : (paymentsSaved ? 'Saved' : 'Update settings')}
          </button>
        </div>
      )}

      {/* Refund Policy Edit Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setIsRefundModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Edit Refund Policy</h3>
            
            <div className="space-y-5">
              {/* Percentage Deduct */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Percentage deduct:
                </label>
                <input
                  type="text"
                  value={refundForm.percentage}
                  onChange={(e) => setRefundForm({ ...refundForm, percentage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ color: '#3B69E2' }}
                />
              </div>

              {/* Days Within */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Days within:
                </label>
                <input
                  type="text"
                  value={refundForm.days}
                  onChange={(e) => setRefundForm({ ...refundForm, days: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ color: '#3B69E2' }}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveRefund}
                className="w-full px-6 py-3 rounded-lg text-white font-bold text-sm"
                style={{ backgroundColor: '#3B69E2' }}
              >
                SAVE
              </button>
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
      />
    </div>
  );
};

export default Settings;

