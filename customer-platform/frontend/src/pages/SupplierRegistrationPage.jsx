import React, { useEffect, useState, useRef } from 'react';
import { FiCheck, FiBriefcase, FiUser, FiShield, FiInfo, FiMessageSquare, FiChevronDown } from 'react-icons/fi';
import { FaPlus, FaMinus } from 'react-icons/fa';

const SupplierRegistrationPage = () => {
  const [selectedBusinessType, setSelectedBusinessType] = useState('company');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessPhone: '',
    businessPhoneCode: '+1',
    businessEmail: '',
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
    personPhoneCode: '+1',
    idType: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSubmissionSummary, setShowSubmissionSummary] = useState(false);
  const [showDashboardView, setShowDashboardView] = useState(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState(null);
  const [supplierMode, setSupplierMode] = useState(true);

  const logoInputRef = useRef(null);
  const insuranceInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const idFrontInputRef = useRef(null);
  const idBackInputRef = useRef(null);
  const dashboardProfileRef = useRef(null);
  const [showSocialInfo, setShowSocialInfo] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showBusinessCodeSuggestions, setShowBusinessCodeSuggestions] = useState(false);
  const [showPersonCodeSuggestions, setShowPersonCodeSuggestions] = useState(false);
  const [showPersonCountrySuggestions, setShowPersonCountrySuggestions] = useState(false);
  const [showPersonCitySuggestions, setShowPersonCitySuggestions] = useState(false);
  const [showIdTypeDropdown, setShowIdTypeDropdown] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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
  const cities = [
    'New York','Los Angeles','London','Manchester','Toronto','Vancouver','Sydney','Melbourne','Auckland','Tokyo','Osaka','Beijing','Shanghai','Karachi','Lahore','Berlin','Munich','Paris','Madrid','Barcelona','Rome','Milan','Cape Town','Johannesburg','Sao Paulo','Rio de Janeiro','Mexico City','Singapore','Dubai','Abu Dhabi','Riyadh','Jeddah','Kuala Lumpur','Jakarta','Bangkok'
  ];
  const countryDialCodes = {
    'United States': '+1',
    'United Kingdom': '+44',
    Canada: '+1',
    Australia: '+61',
    'New Zealand': '+64',
    Japan: '+81',
    China: '+86',
    India: '+91',
    Pakistan: '+92',
    Germany: '+49',
    France: '+33',
    Spain: '+34',
    Italy: '+39',
    'South Africa': '+27',
    Brazil: '+55',
    Mexico: '+52',
    Singapore: '+65',
    'United Arab Emirates': '+971',
    'Saudi Arabia': '+966',
    Malaysia: '+60',
    Indonesia: '+62',
    Thailand: '+66'
  };
  const phoneCodeOptions = countries.map(country => ({
    country,
    code: countryDialCodes[country] || ''
  }));

  const filteredCountries = countries
    .filter(country => country.toLowerCase().includes(formData.country.toLowerCase()))
    .slice(0, 6);
  const filteredCities = cities
    .filter(city => city.toLowerCase().includes(formData.city.toLowerCase()))
    .slice(0, 6);
  const filteredPersonCountries = countries
    .filter(country => country.toLowerCase().includes(formData.personCountry.toLowerCase()))
    .slice(0, 6);
  const filteredPersonCities = cities
    .filter(city => city.toLowerCase().includes(formData.personCity.toLowerCase()))
    .slice(0, 6);
  const filteredBusinessCodeOptions = phoneCodeOptions
    .filter(option =>
      option.country.toLowerCase().includes(formData.businessPhoneCode.toLowerCase()) ||
      option.code.toLowerCase().includes(formData.businessPhoneCode.toLowerCase())
    )
    .slice(0, 6);
  const filteredPersonCodeOptions = phoneCodeOptions
    .filter(option =>
      option.country.toLowerCase().includes(formData.personPhoneCode.toLowerCase()) ||
      option.code.toLowerCase().includes(formData.personPhoneCode.toLowerCase())
    )
    .slice(0, 6);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+\d][\d\s-]{6,}$/;
  const idTypes = ['Passport', 'National ID', 'Driver License', 'Residence Permit'];
  const [requiresBackImage, setRequiresBackImage] = useState(true);
  useEffect(() => {
    const needsBack = formData.idType && formData.idType !== 'Passport';
    setRequiresBackImage(!!needsBack);
    if (!needsBack) {
      setIdBackFile(null);
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.idBack;
        return updated;
      });
    }
  }, [formData.idType]);

  const handleCountrySelect = (country) => {
    setFormData(prev => ({
      ...prev,
      country,
      businessPhoneCode: countryDialCodes[country] || prev.businessPhoneCode
    }));
    setShowCountrySuggestions(false);
  };
  const handleCitySelect = (city) => {
    handleInputChange('city', city);
    setShowCitySuggestions(false);
  };
  const handlePersonCountrySelect = (country) => {
    setFormData(prev => ({
      ...prev,
      personCountry: country,
      personPhoneCode: countryDialCodes[country] || prev.personPhoneCode
    }));
    setShowPersonCountrySuggestions(false);
  };
  const handlePersonCitySelect = (city) => {
    handleInputChange('personCity', city);
    setShowPersonCitySuggestions(false);
  };
  const handlePhoneCodeSelect = (field, code) => {
    handleInputChange(field, code);
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    if (field === 'businessPhoneCode') {
      setShowBusinessCodeSuggestions(false);
    } else {
      setShowPersonCodeSuggestions(false);
    }
  };

  const handleTermsToggle = (checked) => {
    setTermsAccepted(checked);
    setErrors(prev => {
      const updated = { ...prev };
      delete updated.termsAccepted;
      return updated;
    });
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
    if (!formData.businessPhoneCode.trim()) newErrors.businessPhoneCode = 'Code is required';
    else if (!/^\+\d{1,4}$/.test(formData.businessPhoneCode.trim())) newErrors.businessPhoneCode = 'Enter a valid code';
    if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required';
    else if (!phoneRegex.test(formData.businessPhone.trim())) newErrors.businessPhone = 'Enter a valid phone number';
    if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business email is required';
    else if (!emailRegex.test(formData.businessEmail.trim())) newErrors.businessEmail = 'Enter a valid email address';
    if (!formData.businessWebsite.trim()) newErrors.businessWebsite = 'Business website is required';
    else {
      try {
        const urlValue = formData.businessWebsite.startsWith('http')
          ? formData.businessWebsite
          : `https://${formData.businessWebsite}`;
        new URL(urlValue);
      } catch {
        newErrors.businessWebsite = 'Enter a valid website URL';
      }
    }
    if (!formData.businessRegistration.trim()) newErrors.businessRegistration = 'Registration / License number is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!formData.shortBio.trim()) newErrors.shortBio = 'Short bio is required';
    formData.socialLinks.forEach((link, index) => {
      if (link && !link.trim()) {
        newErrors[`social-${index}`] = 'Please enter a valid link or leave it blank.';
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
    if (!formData.personPhoneCode.trim()) newErrors.personPhoneCode = 'Code is required';
    else if (!/^\+\d{1,4}$/.test(formData.personPhoneCode.trim())) newErrors.personPhoneCode = 'Enter a valid code';
    if (!formData.personContact.trim()) newErrors.personContact = 'Contact number is required';
    else if (!phoneRegex.test(formData.personContact.trim())) newErrors.personContact = 'Enter a valid contact number';
    if (!formData.idType.trim()) newErrors.idType = 'ID type is required';
    if (!idFrontFile) newErrors.idFront = 'Front side document is required';
    if (requiresBackImage && !idBackFile) newErrors.idBack = 'Back side document is required';
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
    if (currentStep === 4) {
      if (!termsAccepted) {
        setErrors(prev => ({ ...prev, termsAccepted: 'Please agree to continue.' }));
        return;
      }
      setSubmissionTimestamp(new Date());
      setShowSubmissionSummary(true);
      console.log('Supplier registration payload', {
        formData,
        employeeCount,
        selectedBusinessType
      });
      return;
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
          <div className="relative">
            <input
              type="text"
              placeholder="Country"
              value={formData.personCountry}
              onChange={(e) => {
                handleInputChange('personCountry', e.target.value);
                setShowPersonCountrySuggestions(true);
              }}
              onFocus={() => setShowPersonCountrySuggestions(true)}
              onBlur={() => setTimeout(() => setShowPersonCountrySuggestions(false), 150)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.personCountry ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {showPersonCountrySuggestions && formData.personCountry && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 max-h-56 overflow-y-auto">
                {filteredPersonCountries.length > 0 ? (
                  filteredPersonCountries.map(country => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => handlePersonCountrySelect(country)}
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
            {errors.personCountry && <p className="text-sm text-red-500 mt-1">{errors.personCountry}</p>}
        </div>
          <div className="relative">
            <input
              type="text"
              placeholder="City"
              value={formData.personCity}
              onChange={(e) => {
                handleInputChange('personCity', e.target.value);
                setShowPersonCitySuggestions(true);
              }}
              onFocus={() => setShowPersonCitySuggestions(true)}
              onBlur={() => setTimeout(() => setShowPersonCitySuggestions(false), 150)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.personCity ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {showPersonCitySuggestions && formData.personCity && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 max-h-56 overflow-y-auto">
                {filteredPersonCities.length > 0 ? (
                  filteredPersonCities.map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handlePersonCitySelect(city)}
                      className="w-full text-left px-4 py-2 hover:bg-[#f1f3ff] text-gray-800"
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No matches</div>
                )}
      </div>
            )}
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
            <div className="flex items-center gap-3">
              <div className="relative w-28">
                <input
                  type="text"
                  placeholder="+1"
                  value={formData.personPhoneCode}
                  onChange={(e) => {
                    handleInputChange('personPhoneCode', e.target.value);
                    setShowPersonCodeSuggestions(true);
                  }}
                  onFocus={() => setShowPersonCodeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPersonCodeSuggestions(false), 150)}
                  className={`w-full rounded-full border px-3 py-3 focus:outline-none focus:ring-2 ${errors.personPhoneCode ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
                />
                {showPersonCodeSuggestions && formData.personPhoneCode && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 max-h-48 overflow-y-auto">
                    {filteredPersonCodeOptions.length > 0 ? (
                      filteredPersonCodeOptions.map(option => (
                        <button
                          key={option.country}
                          type="button"
                          onClick={() => handlePhoneCodeSelect('personPhoneCode', option.code)}
                          className="w-full text-left px-3 py-2 hover:bg-[#f1f3ff]"
                        >
                          {option.country} ({option.code})
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.personContact}
                  onChange={(e) => handleInputChange('personContact', e.target.value)}
                  className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.personContact ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
                />
              </div>
            </div>
            {errors.personPhoneCode && <p className="text-sm text-red-500 mt-1">{errors.personPhoneCode}</p>}
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
          {requiresBackImage && (
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
          )}
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
            <div className="flex items-center gap-3">
              <div className="relative w-28">
                <input
                  type="text"
                  placeholder="+1"
                  value={formData.businessPhoneCode}
                  onChange={(e) => {
                    handleInputChange('businessPhoneCode', e.target.value);
                    setShowBusinessCodeSuggestions(true);
                  }}
                  onFocus={() => setShowBusinessCodeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowBusinessCodeSuggestions(false), 150)}
                  className={`w-full rounded-full border px-3 py-3 focus:outline-none focus:ring-2 ${errors.businessPhoneCode ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
                />
                {showBusinessCodeSuggestions && formData.businessPhoneCode && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 max-h-48 overflow-y-auto">
                    {filteredBusinessCodeOptions.length > 0 ? (
                      filteredBusinessCodeOptions.map(option => (
                        <button
                          key={option.country}
                          type="button"
                          onClick={() => handlePhoneCodeSelect('businessPhoneCode', option.code)}
                          className="w-full text-left px-3 py-2 hover:bg-[#f1f3ff]"
                        >
                          {option.country} ({option.code})
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="tel"
                  placeholder="Business Phone"
                  value={formData.businessPhone}
                  onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                  className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.businessPhone ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
                />
              </div>
            </div>
            {errors.businessPhoneCode && <p className="text-sm text-red-500 mt-1">{errors.businessPhoneCode}</p>}
            {errors.businessPhone && <p className="text-sm text-red-500 mt-1">{errors.businessPhone}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Business Email"
              value={formData.businessEmail}
              onChange={(e) => handleInputChange('businessEmail', e.target.value)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.businessEmail ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {errors.businessEmail && <p className="text-sm text-red-500 mt-1">{errors.businessEmail}</p>}
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
          <div className="relative">
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => {
                handleInputChange('city', e.target.value);
                setShowCitySuggestions(true);
              }}
              onFocus={() => setShowCitySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
              className={`w-full rounded-full border px-4 py-3 focus:outline-none focus:ring-2 ${errors.city ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1d236b]'}`}
            />
            {showCitySuggestions && formData.city && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 max-h-56 overflow-y-auto">
                {filteredCities.length > 0 ? (
                  filteredCities.map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="w-full text-left px-4 py-2 hover:bg-[#f1f3ff] text-gray-800"
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No matches</div>
                )}
              </div>
            )}
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
                  placeholder="Link your Social account (Optional)"
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

  const renderStepFour = () => {
    const sections = [
      {
        title: 'Welcome to TripsAdora!',
        items: [
          'TripsAdora acts as a digital marketplace connecting travelers with local suppliers. We facilitate bookings but do not directly provide the services.',
          'Suppliers are fully responsible for the safety, compliance, and delivery of the experiences they list.',
          'Travelers must review booking details, cancellation policies, and supplier instructions before reserving.',
          'All payments are processed securely. Pricing, availability, and taxes may vary by region.',
          'TripAdora may update these Terms & Conditions at any time; continued use means you accept the updated terms.'
        ]
      },
      {
        title: 'Acceptance of Terms',
        items: [
          'By using TripsAdora’s website or services, you acknowledge that you have read, understood, and agree to these Terms & Conditions.',
          'If you disagree with any part of these terms, please discontinue use of our platform.',
          'These terms apply to all users and visitors who access our services or content.',
          'Updates or modifications to these terms may be issued at any time. Continued use signifies acceptance.'
        ]
      },
      {
        title: 'Booking Terms & Conditions',
        items: [
          'Bookings are subject to availability and confirmation by the activity provider.',
          'You are responsible for providing accurate participant information, special requirements, and contact details.',
          'Certain activities have minimum age requirements or special terms; please review them before booking.',
          'Group bookings or modifications may require special arrangements or additional fees depending on the provider.'
        ]
      },
      {
        title: 'Cancellations & Refunds',
        items: [
          'Each activity carries its own cancellation policy, visible during checkout and in your confirmation email.',
          'Customer cancellations must follow the specific activity’s timeline and may result in partial refunds or credits.',
          'If a provider cancels due to weather or operational reasons, you will receive a full refund or a rescheduled option.',
          'Refunds typically process within 5–10 business days. Bank timelines may vary.',
          'In extraordinary circumstances (force majeure), TripsAdora will work with providers to offer alternatives whenever possible.'
        ]
      }
    ];

    const contactOptions = [
      { label: 'Start Live Chat', type: 'chat' },
      { label: 'info@tripsadora.com', type: 'mail' },
      { label: '+1 (555) 123-456', type: 'phone' }
    ];

    return (
      <>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 sm:px-10 py-10 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-gray-900">Terms and Conditions</h2>
              <p className="text-gray-600 text-sm">
                By using our services, you agree to these terms. Please read them carefully.
              </p>
              <p className="text-xs text-gray-500 font-medium">Effective Date: 11-09-2025</p>
            </div>

            <div className="space-y-6">
              {sections.map(section => (
                <div key={section.title} className="rounded-2xl border border-gray-200 bg-[#f9f9ff] p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-[#0f1b4c]">{section.title}</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => handleTermsToggle(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1d236b] focus:ring-[#1d236b]"
                />
                <span>
                  By continuing, you agree to the{' '}
                  <a href="#" className="text-[#1d236b] underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#1d236b] underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {errors.termsAccepted && <p className="text-sm text-red-500">{errors.termsAccepted}</p>}
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
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
                Save &amp; Continue
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const handleSummaryBack = () => {
    setShowSubmissionSummary(false);
  };

  const handleDashboardRedirect = () => {
    setShowSubmissionSummary(false);
    setShowDashboardView(true);
  };

  const handleVerificationMessage = () => {
    alert('You can add your product after verification. Please wait for admin verification to access this feature.');
  };

  const handleSupplierModeToggle = () => {
    setSupplierMode(!supplierMode);
  };

  const renderSubmissionSummary = () => {
    const documentStatuses = [
      { label: 'Front side of ID', uploaded: !!idFrontFile },
      { label: 'Back side of ID', uploaded: requiresBackImage ? !!idBackFile : true },
      { label: 'Profile Picture', uploaded: !!documentFile },
      { label: 'Company Logo', uploaded: !!logoFile }
    ];

    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 sm:p-12 space-y-10">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Submitted on {submissionTimestamp ? submissionTimestamp.toLocaleDateString() : new Date().toLocaleDateString()}
          </p>
          <h2 className="text-3xl font-bold text-gray-900">Documents Submitted for Approval</h2>
          <p className="text-gray-600 text-sm">
            Your documents have been received. We're reviewing them to keep your account secure.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4 bg-[#f5f6ff] px-4 py-4 rounded-2xl border border-[#cfd5ff]">
              <div className="text-4xl">⚠️</div>
              <div>
                <p className="text-lg font-semibold text-gray-900">Your documents are under review</p>
                <p className="text-sm text-gray-600">Estimate time 24–36 hours</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Submitted Documents</h3>
              <div className="space-y-2">
                {documentStatuses.map(doc => (
                  <div key={doc.label} className="flex items-center justify-between border rounded-2xl px-4 py-3">
                    <span className="text-gray-800 font-medium">{doc.label}</span>
                    <span
                      className={`flex items-center gap-2 text-sm font-semibold ${
                        doc.uploaded ? 'text-green-600' : 'text-orange-500'
                      }`}
                    >
                      {doc.uploaded ? <FiCheck /> : '⏳'}
                      {doc.uploaded ? 'Uploaded' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 border border-gray-200 rounded-2xl p-5 space-y-3 bg-gray-50">
            <h4 className="text-lg font-semibold text-gray-900">Next Steps</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>We’ll review your documents within 24–36 hours.</li>
              <li>You will receive an email once your verification is complete.</li>
              <li>If additional documents are needed, we’ll notify you.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={handleSummaryBack}
            className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleDashboardRedirect}
            className="bg-[#1d236b] text-white px-8 py-3 rounded-full font-medium hover:bg-[#151a4a] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  };

  const renderPendingDashboard = () => {
    const heroImage = "/assests/49f555cdd6a046078f7f2a1e0a835fc0c68a4e3a.jpg";
    const businessName = formData.businessName?.trim() || 'Karwan Tours';
    const locationDisplay = [formData.city, formData.personCountry].filter(Boolean).join(', ') || 'Notting Hill, London';
    const greetingName = businessName || formData.personCountry || 'Suneel';
    const businessInitials = businessName
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'EW';

    const tabs = ['Dashboard', 'Listings', 'Availability', 'Bookings', 'Insights', 'Finance'];
    const pendingSidebarProfile = {
      name: businessName || 'Edward William',
      location: 'Notting Hill, London',
      id: '00032123'
    };

    const renderSupplierHeader = () => (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <img
                src="/assests/logo1.png"
                alt="TripsAdora Logo"
                className="h-12 w-auto"
              />
            </div>

            <nav className="hidden md:flex space-x-8 text-sm font-medium">
              <button 
                onClick={handleVerificationMessage}
                className="text-[#1d236b] relative cursor-pointer hover:opacity-80 transition-opacity"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1d236b]" />
              </button>
              <button 
                onClick={handleVerificationMessage}
                className="text-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
              >
                FAQs
              </button>
              <button 
                onClick={handleVerificationMessage}
                className="text-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
              >
                Support
              </button>
            </nav>

            <div className="flex items-center space-x-6">
              <button 
                onClick={handleVerificationMessage}
                className="relative p-2 text-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <FiMessageSquare className="w-6 h-6" />
              </button>

              <button 
                onClick={handleVerificationMessage}
                className="relative p-2 text-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              <div className="flex items-center space-x-2 text-gray-700">
                <span className="text-sm font-medium">EN</span>
                <FiChevronDown size={14} />
              </div>

              <div className="flex items-center space-x-3 bg-[#1d236b] text-white px-4 py-2 rounded-full">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1d236b] font-semibold">
                  {businessInitials}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold">{businessName}</p>
                  <p className="text-xs text-blue-200">
                    {locationDisplay} • ID 00032123
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );

    const renderSupplierFooter = () => (
      <footer className="bg-[#1d236b] text-white py-16 relative z-60 w-full left-0 right-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
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
              </ul>
            </div>
            
            {/* Help & Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">FAQ</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 transition-colors">Contact Support</a></li>
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
                  <span className="text-[#1d236b] font-bold text-xs">AMEX</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">Master</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">Visa</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">Apple</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">PayPal</span>
                </div>
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center">
                  <span className="text-[#1d236b] font-bold text-xs">Google</span>
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
                    className="flex-1 px-3 py-2 bg-gray-400 text-white placeholder-white border border-gray-400 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-gray-400 hover:bg-gray-500 rounded-r-lg transition-colors">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
        </div>
        
        {/* Bottom Footer Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-white mb-4 md:mb-0">
              ©2025 TripsAdora. All rights reserved.
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
      </footer>
    );

    return (
      <div className="min-h-screen bg-white text-[#1d236b] relative">
        {renderSupplierHeader()}

        {/* Static Dashboard Navigation */}
        <div className="max-w-4xl mx-auto px-6 mt-8">
          <div className="bg-[#f6f6f8] rounded-full px-6 py-3 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-[#1d1c23]">
            {[
              { label: 'Dashboard', active: true },
              { label: 'Listings' },
              { label: 'Availability' },
              { label: 'Bookings' },
              { label: 'Insights' },
              { label: 'Finance' }
            ].map(tab => (
              <button
                key={tab.label}
                onClick={handleVerificationMessage}
                className={`px-5 py-1.5 rounded-full border border-[#c7c1c1] cursor-pointer hover:opacity-80 transition-opacity ${
                  tab.active ? 'bg-[#1d2a6f] text-white border-[#1d2a6f]' : 'text-[#1d1c23]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <section className="mt-10">
          {/* Hero Card */}
          <div className="w-full px-6" style={{ paddingRight: 'calc(320px + 2rem)', paddingLeft: '1.5rem' }}>
            <div
              className="rounded-[32px] overflow-hidden shadow-2xl relative w-full"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: '80% auto',
                backgroundPosition: 'left center',
                backgroundRepeat: 'no-repeat',
                minHeight: '460px',
                height: 'calc(100vh - 400px)',
                maxHeight: '800px'
              }}
            >
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />
              <div className="relative z-10 p-10 space-y-6 text-[#1d1c23]">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-500">Hi {greetingName},</p>
                  <h2 className="text-3xl font-extrabold text-[#1b1b1f]">Welcome to TripsAdora!</h2>
                  <p className="text-lg text-gray-600">
                    Thank you for creating an account on TripsAdora.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="font-semibold text-[#1b1b1f]">Your product setup progress</p>
                  <div className="h-3 bg-white border border-[#c5cbe8] rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-[#1d236b]" />
                  </div>
                  <span className="text-sm text-gray-500">0%</span>
                </div>

                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Upload your first product to showcase your services to thousands of travellers searching for unique
                    experiences. Include key details like description, pricing, photos, and highlights.
                  </p>
                  <p>
                    A complete product listing builds trust, boosts visibility, and helps you start earning faster.
                  </p>
                  <p className="italic font-medium text-gray-700">
                    Get started now and make the most of your presence on our platform!
                  </p>
                </div>

                <button 
                  onClick={handleVerificationMessage}
                  className="px-6 py-3 rounded-full bg-[#1d236b] text-white font-semibold shadow-md w-fit cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Click to Add first Product
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Blue Sidebar - positioned absolutely to extreme right, from header to before footer */}
        <div 
          className="absolute right-0 top-0 w-80 bg-[#14255c] text-white shadow-2xl flex flex-col z-50" 
          style={{
            top: '0px',
            bottom: '0px',
            borderLeft: '1px solid rgba(20, 37, 92, 0.5)'
          }}
        >
          {/* Available Balance and Profile */}
          <div className="bg-[#0f1c4a] px-6 py-6 border-b border-white/10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs text-white/70">Available Balance</p>
                <p className="text-2xl font-semibold">$0</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-white">
                  <img src={heroImage} alt="Supplier profile" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs mt-2">ID 00032123</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Supplier Mode Toggle */}
            <div className="bg-[#1f3270] rounded-full px-4 py-2 flex items-center justify-between text-sm font-medium">
              <span>Supplier mode</span>
              <button
                onClick={handleSupplierModeToggle}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                  supplierMode ? 'bg-green-500' : 'bg-[#0f1c4a]'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  supplierMode ? 'right-0.5' : 'left-0.5'
                }`}></div>
              </button>
            </div>

            {/* User Profile */}
            <div className="bg-[#1f3270] rounded-3xl p-5 space-y-4 border border-white/10">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">{businessName || 'Supplier'}</p>
                <p className="text-xs text-white/80 mt-1">{locationDisplay}</p>
              </div>
              <div className="flex items-center mb-4">
                <span className="text-xs text-white">{businessName || 'TripsAdora'}</span>
                <FiCheck className="ml-2 text-green-400" size={12} />
              </div>
              
              {/* Divider */}
              <div className="border-t border-white/20 mb-4"></div>
              
              {/* Booking Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-white/80 mb-2">Today's bookings</p>
                  <p className="text-lg font-bold text-white mb-1">0</p>
                  <p className="text-xs text-green-400">Active</p>
                </div>
                <div>
                  <p className="text-xs text-white/80 mb-2">Tomorrow's bookings</p>
                  <p className="text-lg font-bold text-white mb-1">0</p>
                  <p className="text-xs text-green-400">Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderSupplierFooter()}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      case 4:
        return renderStepFour();
      default:
        return null;
    }
  };

  if (showDashboardView) {
    return renderPendingDashboard();
  }

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
      <div className="p-4 mt-8 flex justify-center">
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

      {showSubmissionSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleSummaryBack}
          ></div>
          <div className="relative z-50 w-full max-w-3xl">
            {renderSubmissionSummary()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierRegistrationPage;
