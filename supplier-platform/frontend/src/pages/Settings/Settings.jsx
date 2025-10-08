import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiLock, FiCreditCard, FiBell, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { COUNTRIES } from '@/utils/constants';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      businessName: user?.businessName || '',
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      country: user?.country || '',
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser size={18} /> },
    { id: 'security', label: 'Security', icon: <FiLock size={18} /> },
    { id: 'banking', label: 'Banking', icon: <FiCreditCard size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell size={18} /> },
  ];

  const onSubmitProfile = async (data) => {
    setIsLoading(true);
    try {
      // TODO: API call to update profile
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-0 overflow-hidden">
            <nav className="flex lg:flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="card">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Business Name"
                      placeholder="Enter business name"
                      error={errors.businessName?.message}
                      {...register('businessName')}
                    />
                    <Input
                      label="Full Name"
                      placeholder="Enter full name"
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Enter email"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="Enter phone"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>

                  <Input
                    label="Address"
                    placeholder="Enter address"
                    error={errors.address?.message}
                    {...register('address')}
                  />

                  <div>
                    <label className="form-label">Country</label>
                    <select className="input" {...register('country')}>
                      <option value="">Select country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isLoading}
                      icon={<FiSave size={18} />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                <form className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                  />

                  <div className="flex justify-end pt-4">
                    <Button variant="primary" icon={<FiSave size={18} />}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Banking Tab */}
            {activeTab === 'banking' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Banking Details</h2>
                <form className="space-y-4">
                  <Input
                    label="Bank Name"
                    placeholder="Enter bank name"
                  />
                  <Input
                    label="Account Holder Name"
                    placeholder="Enter account holder name"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Account Number"
                      placeholder="Enter account number"
                    />
                    <Input
                      label="Routing Number"
                      placeholder="Enter routing number"
                    />
                  </div>
                  <Input
                    label="SWIFT/BIC Code"
                    placeholder="Enter SWIFT/BIC code"
                  />

                  <div className="flex justify-end pt-4">
                    <Button variant="primary" icon={<FiSave size={18} />}>
                      Save Banking Details
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Order Updates</p>
                      <p className="text-sm text-gray-600">Receive notifications about new orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Product Messages</p>
                      <p className="text-sm text-gray-600">Get notified when customers message you</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Weekly Reports</p>
                      <p className="text-sm text-gray-600">Receive weekly performance reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Receive promotional and marketing emails</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button variant="primary" icon={<FiSave size={18} />}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;