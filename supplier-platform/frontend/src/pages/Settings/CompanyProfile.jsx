// Frontend/src/pages/Settings/CompanyProfile.jsx
import { useState } from 'react';
import { FiInfo, FiUpload, FiArrowUp } from 'react-icons/fi';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const CompanyProfile = () => {
  const [activeTab, setActiveTab] = useState('company-details');
  
  // Form state
  const [formData, setFormData] = useState({
    legalStatus: 'individual',
    legalName: '',
    contactInfo: '',
    emergencyContact: '',
    businessLicenseNumber: '',
    address: '',
    individualName: '',
    companyName: '',
    description: '',
    website: '',
    socialMediaLinks: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFieldValue = (field) => {
    const value = formData[field];
    return value && value.trim() !== '' ? value : 'Not Specific';
  };

  const getFieldClassName = (field) => {
    const value = formData[field];
    return value && value.trim() !== '' ? '' : 'text-red-600';
  };

  const tabs = [
    { id: 'company-details', label: 'Company details' },
    { id: 'legal-requirements', label: 'Legal requirements' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company profile</h1>
        <p className="text-gray-600">
          Maintain accurate company records to keep your profile professional and trustworthy
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-300 bg-gray-50 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Verify your business details
              </h3>
              <p className="text-sm text-blue-800">
                Complete information about our legal registration, contact details, and verified business credentials.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm">
            Verify Now
          </Button>
        </div>
      </div>

      {/* Company Details Tab Content */}
      {activeTab === 'company-details' && (
        <div className="space-y-8">
          {/* Company Details Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Company details</h2>
            <p className="text-gray-600 mb-6">
              Your registered business information that ensures transparency and builds customer trust. 
              These details appear on your TravelMate activity provider profile, allowing travelers to confirm 
              your legitimacy as a commercial tourism company.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Legal status
                    <FiInfo className="h-4 w-4 text-gray-400" />
                  </label>
                  <select
                    value={formData.legalStatus}
                    onChange={(e) => handleInputChange('legalStatus', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="individual">Registered as Individual</option>
                    <option value="other">Other</option>
                  </select>
                  {formData.legalStatus === 'other' && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Verification Required:</strong> Please provide additional documentation to verify your legal status.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Legal Name
                  </label>
                  <Input
                    value={formData.legalName}
                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                    placeholder="Enter legal name"
                    className={getFieldClassName('legalName')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Contact Info
                  </label>
                  <Input
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    placeholder="Enter contact information"
                    className={getFieldClassName('contactInfo')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Emergency Contact Number
                  </label>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Enter emergency contact"
                    className={getFieldClassName('emergencyContact')}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Verification status
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                    Not yet verified
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Business License Number
                  </label>
                  <Input
                    value={formData.businessLicenseNumber}
                    onChange={(e) => handleInputChange('businessLicenseNumber', e.target.value)}
                    placeholder="Enter business license number"
                    className={getFieldClassName('businessLicenseNumber')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Address
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter business address"
                    className={getFieldClassName('address')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Individual Name
                  </label>
                  <Input
                    value={formData.individualName}
                    onChange={(e) => handleInputChange('individualName', e.target.value)}
                    placeholder="Enter individual name"
                    className={getFieldClassName('individualName')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Public Profile Information Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Public Profile Information</h2>
            <p className="text-gray-600 mb-6">
              This information will be displayed on Your Company page
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Company Name
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                    className={getFieldClassName('companyName')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </label>
                  <textarea
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getFieldClassName('description')}`}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter company description"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="Enter website URL"
                    className={getFieldClassName('website')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Social Media Links
                  </label>
                  <Input
                    value={formData.socialMediaLinks}
                    onChange={(e) => handleInputChange('socialMediaLinks', e.target.value)}
                    placeholder="Enter social media links"
                    className={getFieldClassName('socialMediaLinks')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Company Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FiUpload className="h-8 w-8 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-600">Upload logo</span>
                      <FiArrowUp className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal Requirements Tab Content */}
      {activeTab === 'legal-requirements' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Requirements</h2>
          <p className="text-gray-600">Legal requirements content will go here.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
