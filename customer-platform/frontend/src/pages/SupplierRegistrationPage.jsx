import React, { useState, useRef } from 'react';
import { FiCheck, FiBriefcase, FiUser, FiShield, FiInfo } from 'react-icons/fi';
import { FaPlus, FaMinus } from 'react-icons/fa';

const SupplierRegistrationPage = () => {
  const [selectedBusinessType, setSelectedBusinessType] = useState('company');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessPhone: '',
    businessWebsite: '',
    businessRegistration: '',
    country: '',
    city: '',
    zipCode: '',
    shortBio: '',
    socialLinks: [''],
    personCountry: '',
    personCity: '',
    personAddress: '',
    personZipCode: '',
    personContact: '',
    idType: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [errors, setErrors] = useState({});

  const logoInputRef = useRef(null);
  const insuranceInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const idFrontInputRef = useRef(null);
  const idBackInputRef = useRef(null);
  const [showSocialInfo, setShowSocialInfo] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [showIdTypeDropdown, setShowIdTypeDropdown] = useState(false);

  const businessTypes = [
    {
      id: 'company',
      title: 'Company',
      description: 'A registered business entity such as a private limited company, partnership, or corporation.',
      icon: FiBriefcase
    },
    {
      id: 'solo',
      title: 'Solo Trader',
      description: 'A single person operating independently, like a freelancer.',
      icon: FiUser
    },
    {
      id: 'private',
      title: 'Private',
      description: 'A charity, NGO, or educational institution that operates without profit motive.',
      icon: FiShield
    }
  ];

  const stepsConfig = [
    { id: 1, title: 'Business Type' },
    { id: 2, title: 'Business Identity' },
    { id: 3, title: 'ID Verification' },
    { id: 4, title: 'Terms & Conditions' }
  ];

  const steps = stepsConfig.map(step => ({
    ...step,
    completed: step.id < currentStep,
    current: step.id === currentStep
  }));

  const handleEmployeeCountChange = (increment) => {
    if (increment) {
      setEmployeeCount(prev => prev + 1);
    } else {
      setEmployeeCount(prev => Math.max(0, prev - 1));
    }
  };

  const countries = [
    'United States','United Kingdom','Canada','Australia','New Zealand','Japan','China','India','Pakistan','Germany','France','Spain','Italy','South Africa','Brazil','Mexico','Singapore','United Arab Emirates','Saudi Arabia','Malaysia','Indonesia','Thailand'
  ];

  const filteredCountries = countries
    .filter(country => country.toLowerCase().includes(formData.country.toLowerCase()))
    .slice(0, 6);
  const idTypes = ['Passport', 'National ID', 'Driver License', 'Residence Permit'];

  const handleCountrySelect = (country) => {
    handleInputChange('country', country);
    setShowCountrySuggestions(false);
  };

  const handleFileChange = (file, setter, errorKey) => {
    if (!file) {
      setter(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setter(null);
      setErrors(prev => ({ ...prev, [errorKey]: 'File must be less than 10MB' }));
      return;
    }
    setter(file);
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[errorKey];
      return updated;
    });
  };

  const handleInputChange = (field, value, index = null) => {
    if (field === 'socialLinks' && index !== null) {
      setFormData(prev => {
        const updated = [...prev.socialLinks];
        updated[index] = value;
        return { ...prev, socialLinks: updated };
      });
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSocialLink = () => {
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, ''] }));
  };

  const validateStepTwo = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required';
    if (!formData.businessWebsite.trim()) newErrors.businessWebsite = 'Business website is required';
    if (!formData.businessRegistration.trim()) newErrors.businessRegistration = 'Registration / License number is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!formData.shortBio.trim()) newErrors.shortBio = 'Short bio is required';
    formData.socialLinks.forEach((link, index) => {
      if (!link.trim()) {
        newErrors[`social-${index}`] = 'Social link is required';
      }
    });
    if (!logoFile) newErrors.logo = 'Logo is required';
    if (!insuranceFile) newErrors.insurance = 'Insurance document is required';
    if (!documentFile) newErrors.document = 'Business document is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepThree = () => {
    const newErrors = {};
    if (!formData.personCountry.trim()) newErrors.personCountry = 'Country is required';
    if (!formData.personCity.trim()) newErrors.personCity = 'City is required';
    if (!formData.personAddress.trim()) newErrors.personAddress = 'Address is required';
    if (!formData.personZipCode.trim()) newErrors.personZipCode = 'Zip code is required';
    if (!formData.personContact.trim()) newErrors.personContact = 'Contact number is required';
    if (!formData.idType.trim()) newErrors.idType = 'ID type is required';
    if (!idFrontFile) newErrors.idFront = 'Front side document is required';
    if (!idBackFile) newErrors.idBack = 'Back side document is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!validateStepTwo()) return;
    }
    if (currentStep === 3) {
      if (!validateStepThree()) return;
    }
    setCurrentStep(prev => Math.min(prev + 1, stepsConfig.length));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepOne = () => (
    <>
      <h2 className="text-2xl font-bold text-black mb-2">How do you run your business?</h2>
      <p className="text-black mb-8">Select the business type the best describe your operations</p>

      {/* Business Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {businessTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = selectedBusinessType === type.id;

          return (
            <div
              key={type.id}
              onClick={() => setSelectedBusinessType(type.id)}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-[#e9ecff] border-[#1d236b]'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-[#d8ddff]' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`text-xl ${
                    isSelected ? 'text-[#1d236b]' : 'text-black'
                  }`} />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  isSelected ? 'text-[#1d236b]' : 'text-black'
                }`}>{type.title}</h3>
                <p className={`text-sm ${
                  isSelected ? 'text-[#1d236b]' : 'text-black'
                }`}>{type.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee Count Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-black mb-2">Add No. of Employees</h3>
        <p className="text-black mb-4">Enter the total number of people working in your business, including yourself.</p>

        <div className="flex items-center justify-center">
          <button
            onClick={() => handleEmployeeCountChange(false)}
            className="w-10 h-10 bg-[#1d236b] text-white rounded-full flex items-center justify-center hover:bg-[#151a4a] transition-colors"
          >
            <FaMinus className="text-sm" />
          </button>

          <div className="mx-6 bg-white border-2 border-gray-200 rounded-lg px-6 py-3 min-w-[80px] text-center">
            <span className="text-xl font-semibold text-black">{employeeCount}</span>
          </div>

          <button
            onClick={() => handleEmployeeCountChange(true)}
            className="w-10 h-10 bg-[#1d236b] text-white rounded-full flex items-center justify-center hover:bg-[#151a4a] transition-colors"
          >
            <FaPlus className="text-sm" />
          </button>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="bg-[#1d236b] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#151a4a] transition-colors"
        >
          Continue
        </button>
      </div>
    </>
  );

  const renderStepThree = () => (
    <>
      <h2 className="text-2xl font-bold text-black mb-2">Person Verification</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Country"
              value={formData.personCountry}
              onChange={(e) => handleInputChange('personCountry', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.personCountry ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.personCountry && <p className="text-sm text-red-500 mt-1">{errors.personCountry}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="City"
              value={formData.personCity}
              onChange={(e) => handleInputChange('personCity', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.personCity ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.personCity && <p className="text-sm text-red-500 mt-1">{errors.personCity}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Address"
              value={formData.personAddress}
              onChange={(e) => handleInputChange('personAddress', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.personAddress ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.personAddress && <p className="text-sm text-red-500 mt-1">{errors.personAddress}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Zip Code"
              value={formData.personZipCode}
              onChange={(e) => handleInputChange('personZipCode', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.personZipCode ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.personZipCode && <p className="text-sm text-red-500 mt-1">{errors.personZipCode}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Contact Number"
              value={formData.personContact}
              onChange={(e) => handleInputChange('personContact', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.personContact ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.personContact && <p className="text-sm text-red-500 mt-1">{errors.personContact}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowIdTypeDropdown(prev => !prev)}
              onBlur={() => setTimeout(() => setShowIdTypeDropdown(false), 150)}
              className={`w-full flex items-center justify-between rounded-full border px-4 py-3 text-left focus:outline-none ${errors.idType ? 'border-red-400' : 'border-gray-200'}`}
            >
              <span className={formData.idType ? 'text-gray-900' : 'text-gray-400'}>
                {formData.idType || 'ID Type'}
              </span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showIdTypeDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30">
                {idTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      handleInputChange('idType', type);
                      setShowIdTypeDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#f1f3ff]"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
            {errors.idType && <p className="text-sm text-red-500 mt-1">{errors.idType}</p>}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Upload Front</p>
            <button
              type="button"
              onClick={() => idFrontInputRef.current?.click()}
              className={`flex items-center space-x-2 px-4 py-3 border rounded-full text-sm font-medium transition-colors ${errors.idFront ? 'border-red-400 text-red-500' : 'border-gray-300 hover:border-[#1d236b]'}`}
            >
              <span role="img" aria-label="upload">📄</span>
              <span>{idFrontFile ? idFrontFile.name : 'Upload Front'}</span>
            </button>
            <p className="text-xs text-gray-500 mt-1">(Only JPG, PNG, PDF accepted. Max 10MB)</p>
            <input
              ref={idFrontInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0], setIdFrontFile, 'idFront')}
            />
            {errors.idFront && <p className="text-sm text-red-500 mt-1">{errors.idFront}</p>}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Upload Back</p>
            <button
              type="button"
              onClick={() => idBackInputRef.current?.click()}
              className={`flex items-center space-x-2 px-4 py-3 border rounded-full text-sm font-medium transition-colors ${errors.idBack ? 'border-red-400 text-red-500' : 'border-gray-300 hover:border-[#1d236b]'}`}
            >
              <span role="img" aria-label="upload">📄</span>
              <span>{idBackFile ? idBackFile.name : 'Upload Back'}</span>
            </button>
            <p className="text-xs text-gray-500 mt-1">(Only JPG, PNG, PDF accepted. Max 10MB)</p>
            <input
              ref={idBackInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0], setIdBackFile, 'idBack')}
            />
            {errors.idBack && <p className="text-sm text-red-500 mt-1">{errors.idBack}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <button
          onClick={handleBack}
          className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-[#1d236b] text-white px-8 py-3 rounded-full font-medium hover:bg-[#151a4a] transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </>
  );

  const renderStepTwo = () => (
    <>
      <h2 className="text-2xl font-bold text-black mb-2">Company Detail Form</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Business Name"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.businessName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.businessName && <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Business Phone"
              value={formData.businessPhone}
              onChange={(e) => handleInputChange('businessPhone', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.businessPhone ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.businessPhone && <p className="text-sm text-red-500 mt-1">{errors.businessPhone}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Business Website"
              value={formData.businessWebsite}
              onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.businessWebsite ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.businessWebsite && <p className="text-sm text-red-500 mt-1">{errors.businessWebsite}</p>}
          </div>
          <p className="text-sm text-gray-600">
            You can add a website where your business has already been rated (e.g., Google Maps, TripAdvisor, or your own website)
          </p>
          <div>
            <textarea
              rows={3}
              placeholder="Business Registration / License Number"
              value={formData.businessRegistration}
              onChange={(e) => handleInputChange('businessRegistration', e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 ${errors.businessRegistration ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.businessRegistration && <p className="text-sm text-red-500 mt-1">{errors.businessRegistration}</p>}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Upload your business logo to display on your profile.</p>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className={`flex items-center space-x-2 px-4 py-3 border rounded-full text-sm font-medium transition-colors ${errors.logo ? 'border-red-400 text-red-500' : 'border-gray-300 hover:border-[#1d236b]'}`}
            >
              <span role="img" aria-label="image">🖼️</span>
              <span>{logoFile ? logoFile.name : 'Upload Logo'}</span>
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0], setLogoFile, 'logo')}
            />
            {errors.logo && <p className="text-sm text-red-500 mt-1">{errors.logo}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Business Registered Country"
              value={formData.country}
              onChange={(e) => {
                handleInputChange('country', e.target.value);
                setShowCountrySuggestions(true);
              }}
              onFocus={() => setShowCountrySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 150)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.country ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {showCountrySuggestions && formData.country && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 max-h-56 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map(country => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full text-left px-4 py-2 hover:bg-[#f1f3ff] text-gray-800"
                    >
                      {country}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No matches</div>
                )}
              </div>
            )}
            {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.city ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Zip Code"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.zipCode ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.zipCode && <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Short Bio"
              value={formData.shortBio}
              onChange={(e) => handleInputChange('shortBio', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.shortBio ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.shortBio && <p className="text-sm text-red-500 mt-1">{errors.shortBio}</p>}
          </div>
          <div className="space-y-3">
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="relative">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Link your Social account"
                    value={link}
                    onChange={(e) => handleInputChange('socialLinks', e.target.value, index)}
                    className={`flex-1 rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors[`social-${index}`] ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          socialLinks: prev.socialLinks.filter((_, i) => i !== index)
                        }));
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors"
                      aria-label="Remove social link"
                    >
                      ✕
                    </button>
                  )}
                  {index === 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSocialInfo(prev => !prev)}
                      onBlur={() => setShowSocialInfo(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1d236b] text-[#1d236b] hover:bg-[#1d236b] hover:text-white transition-colors"
                      aria-label="Why do we ask for social account?"
                    >
                      <FiInfo />
                    </button>
                  )}
                </div>
                {errors[`social-${index}`] && <p className="text-sm text-red-500 mt-1">{errors[`social-${index}`]}</p>}
                {index === 0 && showSocialInfo && (
                  <div
                    className="absolute z-20 right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-gray-200 p-4 text-sm text-gray-800"
                    onMouseLeave={() => setShowSocialInfo(false)}
                  >
                    By linking your social account, we can easily gather your business information to help you complete your profile setup quickly and accurately.
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddSocialLink} className="text-sm text-[#1d236b] font-semibold">
              Add more
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Attach a valid insurance document to verify coverage.</p>
            <button
              type="button"
              onClick={() => insuranceInputRef.current?.click()}
              className={`flex items-center space-x-2 px-4 py-3 border rounded-full text-sm font-medium transition-colors ${errors.insurance ? 'border-red-400 text-red-500' : 'border-gray-300 hover:border-[#1d236b]'}`}
            >
              <span role="img" aria-label="upload">📄</span>
              <span>{insuranceFile ? insuranceFile.name : 'Upload Insurance'}</span>
            </button>
            <input
              ref={insuranceInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0], setInsuranceFile, 'insurance')}
            />
            {errors.insurance && <p className="text-sm text-red-500 mt-1">{errors.insurance}</p>}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Provide additional <span className="font-semibold">business registration</span> documents, such as trade license, incorporation certificate, or tax registration.
            </p>
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              className={`flex items-center space-x-2 px-4 py-3 border rounded-full text-sm font-medium transition-colors ${errors.document ? 'border-red-400 text-red-500' : 'border-gray-300 hover:border-[#1d236b]'}`}
            >
              <span role="img" aria-label="upload">📄</span>
              <span>{documentFile ? documentFile.name : 'Upload document'}</span>
            </button>
            <input
              ref={documentInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0], setDocumentFile, 'document')}
            />
            {errors.document && <p className="text-sm text-red-500 mt-1">{errors.document}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <button
          onClick={handleBack}
          className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-[#1d236b] text-white px-8 py-3 rounded-full font-medium hover:bg-[#151a4a] transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </>
  );

  const renderPlaceholder = (title) => (
    <div className="text-center py-20">
      <h2 className="text-2xl font-semibold mb-4 text-[#1d236b]">{title}</h2>
      <p className="text-gray-600">This step will be available soon.</p>
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={handleBack}
          className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-[#1d236b] text-white px-8 py-3 rounded-full font-medium hover:bg-[#151a4a] transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      case 4:
        return renderPlaceholder('Terms & Conditions');
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#c6dbfa' }}>
      {/* Header Section */}
      <div className="bg-white py-6 px-8">
        <div className="flex items-center relative">
          <div className="flex items-center">
            <img 
              src="/assests/loggo2.jpg" 
              alt="TripsAdora Logo" 
              className="w-[10rem] h-15"
            />
          </div>
          <h1 className="text-3xl font-bold text-black absolute left-1/2 transform -translate-x-1/2">Join us as a supplier partner</h1>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex items-center justify-center p-4 mt-8">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-8">

          {/* Progress Stepper */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-[#1d236b]' : step.current ? 'bg-[#1d236b]' : 'bg-gray-300'
                  }`}>
                    {step.completed ? (
                      <FiCheck className="text-white text-sm" />
                    ) : (
                      <span className={`text-sm font-medium ${
                        step.completed || step.current ? 'text-white' : 'text-gray-600'
                      }`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-medium mt-2 ${
                    step.completed ? 'text-[#1d236b]' : step.current ? 'text-[#1d236b]' : 'text-black'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed || step.current ? 'bg-[#1d236b]' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierRegistrationPage;
