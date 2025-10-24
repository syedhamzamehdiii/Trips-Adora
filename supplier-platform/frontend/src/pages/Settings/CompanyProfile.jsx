// Frontend/src/pages/Settings/CompanyProfile.jsx
import { useState } from 'react';
import { FiInfo, FiUpload, FiArrowUp, FiX, FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
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

  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('not-verified');
  const [fieldErrors, setFieldErrors] = useState({});

  // Legal requirements state
  const [legalStep, setLegalStep] = useState(1);
  const [legalFormData, setLegalFormData] = useState({
    coiFile: null,
    coiPreview: null,
    coiUploadStatus: 'not-uploaded', // 'not-uploaded', 'uploading', 'uploaded', 'under-review', 'approved', 'rejected'
    coiRejectionReason: '',
    termsAccepted: false,
    privacyAccepted: false,
    dataProcessingAccepted: false
  });
  const [isCompletingLegal, setIsCompletingLegal] = useState(false);

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

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
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

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    // Simulate upload completion
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsUploading(false);
    setUploadProgress(0);
    
    // Here you would typically make an API call to upload the file
    console.log('Logo uploaded successfully:', logoFile);
    alert('Logo uploaded successfully!');
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setUploadProgress(0);
  };

  const validateCompanyDetails = () => {
    const errors = {};
    const requiredFields = [
      'legalName',
      'contactInfo', 
      'emergencyContact',
      'businessLicenseNumber',
      'address',
      'individualName'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = 'This field is required';
      }
    });

    // Validate email format for contact info
    if (formData.contactInfo && formData.contactInfo.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      
      if (!emailRegex.test(formData.contactInfo) && !phoneRegex.test(formData.contactInfo.replace(/\s/g, ''))) {
        errors.contactInfo = 'Please enter a valid email or phone number';
      }
    }

    // Validate emergency contact (should be phone number)
    if (formData.emergencyContact && formData.emergencyContact.trim() !== '') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.emergencyContact.replace(/\s/g, ''))) {
        errors.emergencyContact = 'Please enter a valid phone number';
      }
    }

    // Validate business license number (should be alphanumeric)
    if (formData.businessLicenseNumber && formData.businessLicenseNumber.trim() !== '') {
      const licenseRegex = /^[A-Za-z0-9\-]+$/;
      if (!licenseRegex.test(formData.businessLicenseNumber.trim())) {
        errors.businessLicenseNumber = 'Business license number should contain only letters, numbers, and hyphens';
      }
    }

    return errors;
  };

  const handleVerification = async () => {
    setIsVerifying(true);
    setFieldErrors({});

    // Validate all fields
    const errors = validateCompanyDetails();

    if (Object.keys(errors).length > 0) {
      // There are validation errors
      setFieldErrors(errors);
      setIsVerifying(false);
      
      // Scroll to first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      
      return;
    }

    // Simulate verification process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // All fields are valid, verification successful
      setVerificationStatus('verified');
      setFieldErrors({});
      
      // Update verification status display
      alert('Company details verified successfully!');
      
    } catch (error) {
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getVerificationStatusText = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending verification';
      default:
        return 'Not yet verified';
    }
  };

  const getVerificationStatusColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleLegalInputChange = (field, value) => {
    setLegalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextToLegal = () => {
    setActiveTab('legal-requirements');
  };

  const handleLegalStepNext = () => {
    if (legalStep < 2) {
      setLegalStep(legalStep + 1);
    }
  };

  const handleLegalStepPrevious = () => {
    if (legalStep > 1) {
      setLegalStep(legalStep - 1);
    }
  };

  const handleCOIUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, JPEG, or PNG file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setLegalFormData(prev => ({
      ...prev,
      coiFile: file,
      coiUploadStatus: 'uploading'
    }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLegalFormData(prev => ({
          ...prev,
          coiPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }

    // Simulate upload process
    simulateCOIUpload(file);
  };

  const simulateCOIUpload = (file) => {
    setTimeout(() => {
      setLegalFormData(prev => ({
        ...prev,
        coiUploadStatus: 'uploaded'
      }));
      
      // Simulate admin review process
      setTimeout(() => {
        setLegalFormData(prev => ({
          ...prev,
          coiUploadStatus: 'under-review'
        }));
      }, 1000);
    }, 2000);
  };

  const removeCOI = () => {
    setLegalFormData(prev => ({
      ...prev,
      coiFile: null,
      coiPreview: null,
      coiUploadStatus: 'not-uploaded',
      coiRejectionReason: ''
    }));
  };

  const getCOIStatusText = () => {
    switch (legalFormData.coiUploadStatus) {
      case 'not-uploaded':
        return 'No certificate uploaded';
      case 'uploading':
        return 'Uploading certificate...';
      case 'uploaded':
        return 'Certificate uploaded successfully';
      case 'under-review':
        return 'Under admin review';
      case 'approved':
        return 'Certificate approved ✓';
      case 'rejected':
        return 'Certificate rejected';
      default:
        return 'Unknown status';
    }
  };

  const getCOIStatusColor = () => {
    switch (legalFormData.coiUploadStatus) {
      case 'not-uploaded':
        return 'text-gray-500';
      case 'uploading':
        return 'text-blue-500';
      case 'uploaded':
        return 'text-green-500';
      case 'under-review':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-600 font-semibold';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleCompleteLegal = async () => {
    if (!legalFormData.termsAccepted || !legalFormData.privacyAccepted || !legalFormData.dataProcessingAccepted) {
      alert('Please accept all terms and conditions to continue.');
      return;
    }

    if (legalFormData.coiUploadStatus !== 'approved') {
      alert('Please upload and get your Certificate of Insurance approved before proceeding.');
      return;
    }

    setIsCompletingLegal(true);
    
    // Simulate completion process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to dashboard (you would use navigate from react-router-dom)
    alert('Legal requirements completed! Redirecting to dashboard...');
    setIsCompletingLegal(false);
    
    // In a real app, you would use:
    // navigate('/dashboard');
  };

  const tabs = [
    { id: 'company-details', label: 'Company details' },
    { id: 'legal-requirements', label: 'Legal requirements' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Company profile</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Maintain accurate company records to keep your profile professional and trustworthy
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="-mb-px flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8">
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
      <div className={`border rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 ${
        verificationStatus === 'verified' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start justify-between space-y-3 sm:space-y-0">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {verificationStatus === 'verified' ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <FiInfo className="h-5 w-5 text-blue-600 mt-0.5" />
              )}
            </div>
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${
                verificationStatus === 'verified' ? 'text-green-900' : 'text-blue-900'
              }`}>
                {verificationStatus === 'verified' 
                  ? 'Business details verified' 
                  : 'Verify your business details'
                }
              </h3>
              <p className={`text-xs sm:text-sm ${
                verificationStatus === 'verified' ? 'text-green-800' : 'text-blue-800'
              }`}>
                {verificationStatus === 'verified'
                  ? 'Your business information has been successfully verified and is now active.'
                  : 'Complete information about our legal registration, contact details, and verified business credentials.'
                }
              </p>
            </div>
          </div>
          {verificationStatus !== 'verified' && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleVerification}
              loading={isVerifying}
              disabled={isVerifying}
              className="w-full sm:w-auto"
            >
              {isVerifying ? 'Verifying...' : 'Verify Now'}
            </Button>
          )}
        </div>
      </div>

      {/* Company Details Tab Content */}
      {activeTab === 'company-details' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Company Details Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Company details</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Your registered business information that ensures transparency and builds customer trust. 
              These details appear on your TravelMate activity provider profile, allowing travelers to confirm 
              your legitimacy as a commercial tourism company.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                    name="legalName"
                    value={formData.legalName}
                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                    placeholder="Enter legal name"
                    className={`${getFieldClassName('legalName')} ${fieldErrors.legalName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.legalName && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.legalName}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Contact Info
                  </label>
                  <Input
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    placeholder="Enter email or phone number"
                    className={`${getFieldClassName('contactInfo')} ${fieldErrors.contactInfo ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.contactInfo && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.contactInfo}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Emergency Contact Number
                  </label>
                  <Input
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Enter phone number"
                    className={`${getFieldClassName('emergencyContact')} ${fieldErrors.emergencyContact ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.emergencyContact && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.emergencyContact}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Verification status
                  </label>
                  <div className={`px-3 py-2 border rounded-lg ${getVerificationStatusColor()}`}>
                    {getVerificationStatusText()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Business License Number
                  </label>
                  <Input
                    name="businessLicenseNumber"
                    value={formData.businessLicenseNumber}
                    onChange={(e) => handleInputChange('businessLicenseNumber', e.target.value)}
                    placeholder="Enter business license number"
                    className={`${getFieldClassName('businessLicenseNumber')} ${fieldErrors.businessLicenseNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.businessLicenseNumber && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.businessLicenseNumber}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Address
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter business address"
                    className={`${getFieldClassName('address')} ${fieldErrors.address ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.address && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.address}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Individual Name
                  </label>
                  <Input
                    name="individualName"
                    value={formData.individualName}
                    onChange={(e) => handleInputChange('individualName', e.target.value)}
                    placeholder="Enter individual name"
                    className={`${getFieldClassName('individualName')} ${fieldErrors.individualName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.individualName && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.individualName}</p>
                  )}
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
                  
                  {logoPreview ? (
                    // Preview Mode
                    <div className="relative">
                      <div className="border-2 border-gray-300 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{logoFile?.name}</p>
                            <p className="text-xs text-gray-500">
                              {(logoFile?.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {isUploading && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Uploading... {uploadProgress}%
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            {!isUploading && (
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={simulateUpload}
                              >
                                Upload
                              </Button>
                            )}
                            <button
                              onClick={removeLogo}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              disabled={isUploading}
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Upload Mode
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
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
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end mt-8">
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleNextToLegal}
              icon={<FiArrowRight size={20} />}
            >
              Next: Legal Requirements
            </Button>
          </div>
        </div>
      )}

      {/* Legal Requirements Tab Content */}
      {activeTab === 'legal-requirements' && (
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Legal Requirements</h2>
            <p className="text-gray-600 mb-6">
              Complete the legal requirements to finalize your business setup and start operating on our platform.
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= legalStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < legalStep ? <FiCheck size={16} /> : step}
                  </div>
                  <div className="ml-2 text-sm">
                    <div className={`font-medium ${
                      step <= legalStep ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {step === 1 && 'Insurance & Compliance'}
                      {step === 2 && 'Terms & Conditions'}
                    </div>
                  </div>
                  {step < 2 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      step < legalStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>


          {/* Step 1: Insurance & Compliance */}
          {legalStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Insurance & Compliance</h3>
              
              <div className="space-y-6">
                {/* Certificate of Insurance Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Certificate of Insurance (COI)
                  </label>
                  
                  {!legalFormData.coiFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUpload size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Upload Certificate of Insurance</p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, PNG, or JPG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          onChange={handleCOIUpload}
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          id="coi-upload"
                        />
                        <label
                          htmlFor="coi-upload"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          <FiUpload size={16} className="mr-2" />
                          Choose File
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {legalFormData.coiPreview ? (
                            <img
                              src={legalFormData.coiPreview}
                              alt="COI Preview"
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                              <span className="text-red-600 font-semibold text-xs">PDF</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {legalFormData.coiFile.name}
                            </p>
                            <p className={`text-xs ${getCOIStatusColor()}`}>
                              {getCOIStatusText()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {legalFormData.coiUploadStatus === 'rejected' && (
                            <div className="text-xs text-red-600 max-w-xs">
                              {legalFormData.coiRejectionReason || 'Certificate was rejected. Please upload a new one.'}
                            </div>
                          )}
                          <button
                            onClick={removeCOI}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Remove file"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* COI Status Information */}
                  <div className="mt-3 text-xs text-gray-600">
                    <p>• Your certificate will be reviewed by our admin team</p>
                    <p>• Processing typically takes 1-2 business days</p>
                    <p>• You'll receive an email notification once reviewed</p>
                  </div>

                  {/* Admin Test Buttons (Remove in production) */}
                  {legalFormData.coiUploadStatus === 'under-review' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Admin Test Actions:</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setLegalFormData(prev => ({ ...prev, coiUploadStatus: 'approved' }))}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Approve COI
                        </button>
                        <button
                          onClick={() => setLegalFormData(prev => ({ 
                            ...prev, 
                            coiUploadStatus: 'rejected',
                            coiRejectionReason: 'Document is not clear or invalid. Please upload a higher quality image.'
                          }))}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Reject COI
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Step 2: Terms & Conditions */}
          {legalStep === 2 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
              
              <div className="space-y-6">
                {/* Terms of Service */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Terms of Service</h4>
                  <div className="max-h-40 overflow-y-auto text-sm text-gray-600 space-y-2 mb-4">
                    <p>
                      By using our platform, you agree to provide accurate business information, 
                      maintain professional standards, and comply with all applicable laws and regulations.
                    </p>
                    <p>
                      You are responsible for the quality and safety of your services, and must 
                      maintain adequate insurance coverage as specified in our requirements.
                    </p>
                    <p>
                      We reserve the right to suspend or terminate accounts that violate our 
                      terms of service or engage in fraudulent activities.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={legalFormData.termsAccepted}
                      onChange={(e) => handleLegalInputChange('termsAccepted', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      I have read and agree to the Terms of Service
                    </span>
                  </div>
                </div>

                {/* Privacy Policy */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Privacy Policy</h4>
                  <div className="max-h-40 overflow-y-auto text-sm text-gray-600 space-y-2 mb-4">
                    <p>
                      We collect and process your business information to provide our services, 
                      verify your identity, and ensure platform safety.
                    </p>
                    <p>
                      Your data is protected according to our privacy policy and applicable 
                      data protection regulations.
                    </p>
                    <p>
                      We may share necessary information with relevant authorities as required by law.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={legalFormData.privacyAccepted}
                      onChange={(e) => handleLegalInputChange('privacyAccepted', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      I have read and agree to the Privacy Policy
                    </span>
                  </div>
                </div>

                {/* Data Processing Agreement */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Data Processing Agreement</h4>
                  <div className="max-h-40 overflow-y-auto text-sm text-gray-600 space-y-2 mb-4">
                    <p>
                      You consent to the processing of your business and customer data 
                      as necessary to provide our platform services.
                    </p>
                    <p>
                      This includes data storage, processing for bookings, customer 
                      communication, and platform analytics.
                    </p>
                    <p>
                      You retain ownership of your customer data and can request 
                      data deletion according to our policies.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={legalFormData.dataProcessingAccepted}
                      onChange={(e) => handleLegalInputChange('dataProcessingAccepted', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      I consent to the data processing as described
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {legalStep > 1 && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleLegalStepPrevious}
                  icon={<FiArrowLeft size={20} />}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div>
              {legalStep < 2 ? (
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleLegalStepNext}
                  icon={<FiArrowRight size={20} />}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleCompleteLegal}
                  loading={isCompletingLegal}
                  disabled={isCompletingLegal}
                  icon={<FiCheck size={20} />}
                >
                  {isCompletingLegal ? 'Completing...' : 'Complete & Go to Dashboard'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
