import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FiCheck, FiBriefcase, FiUser, FiShield, FiInfo, FiSearch, FiBarChart2 } from 'react-icons/fi';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { config } from '../config';
import { SupplierPortalHeader, SupplierPortalFooter } from '../components/SupplierPortalChrome';
import supplierOnboardingService from '../services/supplierOnboardingService';
import { useAuth } from '../context/AuthContext';

const SupplierRegistrationPage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth(); // Get user from AuthContext
  
  // State for user info
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  
  // Get user info from auth context or localStorage
  useEffect(() => {
    const fetchUserInfo = async () => {
      let info = { name: '', email: '' };
      
      // Try to get from AuthContext first (customer platform)
      if (authUser) {
        info = {
          name: authUser.full_name || authUser.name || authUser.business_name || '',
          email: authUser.email || ''
        };
      } else {
        // Fallback to localStorage (customer platform)
        try {
          const storedName = localStorage.getItem('customer_profile_name');
          const storedEmail = localStorage.getItem('customer_profile_email');
          if (storedName || storedEmail) {
            info = {
              name: storedName || '',
              email: storedEmail || ''
            };
          }
        } catch (_) {}
        
        // Try to get from supplier platform API if logged in there
        if (!info.email) {
          try {
            const supplierInfo = await supplierOnboardingService.getSupplierUserInfo();
            if (supplierInfo) {
              info = supplierInfo;
            }
          } catch (_) {
            // Ignore errors
          }
        }
      }
      
      setUserInfo(info);
    };
    
    fetchUserInfo();
  }, [authUser]);

  // Pre-fill business email with user's email if available and business email is empty
  useEffect(() => {
    if (userInfo.email && !formData.businessEmail.trim()) {
      setFormData(prev => ({
        ...prev,
        businessEmail: userInfo.email
      }));
    }
  }, [userInfo.email]); // Only depend on userInfo.email, not formData to avoid loops
  
  const initialSupplierStatus = useMemo(() => {
    try {
      const stored =
        localStorage.getItem('supplier_onboarding_status') ||
        sessionStorage.getItem('supplier_onboarding_status');

      if (stored === 'verified') {
        return 'verified';
      }

      localStorage.setItem('supplier_onboarding_status', 'verified');
      sessionStorage.setItem('supplier_onboarding_status', 'verified');
      localStorage.setItem('supplier_requires_self_verification', 'false');
      sessionStorage.setItem('supplier_requires_self_verification', 'false');
      return 'verified';
    } catch (_) {
      return 'verified';
    }
  }, []);
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
  const [submissionTimestamp, setSubmissionTimestamp] = useState(null);
  const [supplierMode, setSupplierMode] = useState(true);
  const [supplierStatus, setSupplierStatus] = useState(initialSupplierStatus);
  const [showDashboardView, setShowDashboardView] = useState(initialSupplierStatus === 'pending_verification');
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(initialSupplierStatus === 'onboarding');
  const [needsSelfVerification, setNeedsSelfVerification] = useState(() => {
    try {
      return localStorage.getItem('supplier_requires_self_verification') === 'true';
    } catch (_) {
      return false;
    }
  });

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

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

  const getGreetingName = () => {
    const trimmedBusiness = formData.businessName?.trim();
    if (trimmedBusiness) return trimmedBusiness;
    const trimmedPerson = formData.personCountry?.trim();
    if (trimmedPerson) return trimmedPerson.split(',')[0];
    return 'User';
  };

  useEffect(() => {
    try {
      localStorage.setItem('supplier_onboarding_status', supplierStatus);
    } catch (_) {}

    setShowWelcomeScreen(supplierStatus === 'onboarding');
    setShowDashboardView(supplierStatus === 'pending_verification');

    if (supplierStatus === 'verified') {
      window.location.href = `${config.SUPPLIER_APP_URL}/dashboard`;
    }
  }, [supplierStatus]);

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
    if (currentStep === 1) {
      // If solo is selected, skip step 2 and go directly to step 3
      if (selectedBusinessType === 'solo') {
        setCurrentStep(3);
        return;
      }
    }
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
      
      // Submit all data to backend
      handleSubmitRegistration();
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, stepsConfig.length));
  };

  const handleBack = () => {
    // If on step 3 and solo is selected, go back to step 1 (skip step 2)
    if (currentStep === 3 && selectedBusinessType === 'solo') {
      setCurrentStep(1);
      return;
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      // Prepare all form data
      const completeFormData = {
        selectedBusinessType,
        employeeCount,
        ...formData,
        requiresBackImage,
        user_name: userInfo.name,
        user_email: userInfo.email
      };

      // Prepare all files
      const files = {
        logoFile: selectedBusinessType !== 'solo' ? logoFile : null,
        insuranceFile: selectedBusinessType !== 'solo' ? insuranceFile : null,
        documentFile: selectedBusinessType !== 'solo' ? documentFile : null,
        idFrontFile,
        idBackFile: requiresBackImage ? idBackFile : null
      };

      // Submit to backend
      const response = await supplierOnboardingService.submitCompleteRegistration(
        completeFormData,
        files
      );

      // Success - show summary
      setSubmissionTimestamp(new Date());
      setShowSubmissionSummary(true);
      
      // Store onboarding ID for reference
      if (response?.id) {
        localStorage.setItem('supplier_onboarding_id', response.id);
      }
      
      // Update status
      setSupplierStatus('pending_verification');
      localStorage.setItem('supplier_onboarding_status', 'pending_verification');
      
    } catch (error) {
      console.error('Error submitting registration:', error);
      setSubmissionError(error.message || 'Failed to submit registration. Please try again.');
      setErrors(prev => ({ ...prev, submission: error.message }));
    } finally {
      setIsSubmitting(false);
    }
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
              accept="image/*,application/pdf"
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
                disabled={isSubmitting}
                className={`bg-[#1d236b] text-white px-8 py-3 rounded-full font-medium hover:bg-[#151a4a] transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Save &amp; Continue'}
              </button>
              {submissionError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submissionError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const updateSelfVerificationFlag = (value) => {
    setNeedsSelfVerification(value);
    try {
      if (value) {
        localStorage.setItem('supplier_requires_self_verification', 'true');
      } else {
        localStorage.removeItem('supplier_requires_self_verification');
      }
    } catch (_) {}
  };

  const handleStartVerification = () => {
    updateSelfVerificationFlag(false);
    setSupplierStatus('registering');
    setShowDashboardView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToDashboard = () => {
    updateSelfVerificationFlag(true);
    setSupplierStatus('pending_verification');
  };

  const handleSummaryBack = () => {
    setShowSubmissionSummary(false);
  };

  const handleDashboardRedirect = () => {
    setShowSubmissionSummary(false);
    setSupplierStatus('pending_verification');
  };

  const handleVerificationMessage = () => {
    alert('Your supplier account is pending admin verification. Listings, bookings, finance, and product creation stay locked until an admin approves your documents.');
  };

  const handleSupplierModeToggle = () => {
    const nextMode = !supplierMode;
    setSupplierMode(nextMode);
    navigate('/', { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const renderWelcomeScreen = () => {
    const greetingName = getGreetingName();

    return (
      <div className="min-h-screen bg-[#c6dbfa] flex flex-col">
    <header className="w-full bg-white shadow">
  <div className="flex items-center justify-start py-4 px-6 w-full">
    <img
      src="/assests/logo1.png"
      alt="TripsAdora Logo"
      className="h-10 w-auto"
    />
  </div>
</header>



        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white rounded-[40px] shadow-[0_25px_65px_rgba(26,32,117,0.15)] border border-white max-w-3xl w-full p-12 space-y-10">
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">Hi {greetingName},</p>
              <p className="text-3xl font-extrabold text-gray-900">Welcome to TripsAdora!</p>
              <p className="text-lg text-gray-600">Thank you for creating an account on TripsAdora.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={handleStartVerification}
                className="bg-[#1d236b] text-white rounded-[32px] px-8 py-6 text-left shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <FiSearch className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">Verify Your account</p>
                    <p className="text-sm text-white/80 mt-2">Complete your verification to unlock your dashboard.</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleContinueToDashboard}
                className="bg-white rounded-[32px] px-8 py-6 text-left border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#1d236b]">
                    <FiBarChart2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900">Continue to Dashboard</p>
                    <p className="text-sm text-gray-600 mt-2">Go straight to your dashboard and manage your business profile.</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <p className="text-gray-900 font-semibold">Kind Regards,</p>
              <p className="text-gray-500 text-lg">TripsAdora Development Team</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPendingDashboard = () => {
    const heroImage = "/assests/49f555cdd6a046078f7f2a1e0a835fc0c68a4e3a.jpg";
    const businessName = formData.businessName?.trim() || 'TripsAdora';
    const locationDisplay = [formData.city, formData.personCountry].filter(Boolean).join(', ');
    const greetingName = getGreetingName();
    const requiresSelfVerification = needsSelfVerification && supplierStatus === 'pending_verification';
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


    return (
      <div className="min-h-screen bg-white text-[#1d236b] relative">
        <SupplierPortalHeader />

        {/* Static Dashboard Navigation */}
        <div className="max-w-4xl mx-auto px-6 mt-8">
          <div className="bg-[#f6f6f8] rounded-full px-6 py-3 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-[#1d1c23]">
            {[
              { label: 'Dashboard', active: true },
              { label: 'Listings', active: false },
              { label: 'Availability', active: false },
              { label: 'Bookings', active: false },
              { label: 'Insights', active: false },
              { label: 'Finance', active: false }
            ].map(tab => (
              <button
                key={tab.label}
                type="button"
                onClick={!tab.active ? handleVerificationMessage : undefined}
                className={`px-5 py-1.5 rounded-full border border-[#c7c1c1] cursor-pointer ${
                  tab.active
                    ? 'bg-[#1d2a6f] text-white border-[#1d2a6f]'
                    : 'text-[#1d1c23] hover:opacity-80 transition-opacity'
                }`}
                disabled={tab.active}
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
                backgroundSize: '120% auto',
                backgroundPosition: 'left center',
                backgroundRepeat: 'no-repeat',
                minHeight: '460px',
                height: 'calc(100vh - 400px)',
                maxHeight: '800px'
              }}
            >
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />
              <div className="relative z-10 p-10 space-y-6 text-left text-[#1d1c23] flex flex-col items-start max-w-3xl">
                <div className="space-y-3 text-left w-full">
                  <p className="text-sm font-semibold text-gray-500">
                    Hi {greetingName}!{' '}
                    <span className="text-gray-600">
                    
                    </span>
                  </p>
                  <h2 className="text-3xl font-extrabold text-[#1b1b1f]">Welcome to TripsAdora!</h2>
                  <p className="text-lg text-gray-600">
                     
                  </p>
                </div>

                {supplierStatus === 'pending_verification' && (
                  <div className="bg-white/80 border border-[#cfd5ff] rounded-2xl p-4 flex items-start gap-3 text-sm text-gray-700 text-left w-full">
                    <FiShield className="text-[#1d236b] mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-[#1d1c23]">
                        {requiresSelfVerification ? 'Verify yourself first' : 'Verification pending'}
                      </p>
                      <p>
                        {requiresSelfVerification
                          ? 'Please verify your business details to create your first product and unlock the full dashboard.'
                          : 'All dashboard modules remain read-only until an admin approves your business. We’ll notify you as soon as you can add listings.'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-left w-full">
                  <p className="font-semibold text-[#1b1b1f]">Your product setup progress</p>
                  <div className="h-3 bg-white border border-[#c5cbe8] rounded-full overflow-hidden">
                    <div className="h-full w-5 bg-[#1d236b]" />
                  </div>
                  <span className="text-sm text-gray-500">0%</span>
                </div>

                <div className="space-y-4 text-gray-600 leading-relaxed text-left w-full">
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

                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={handleVerificationMessage}
                    disabled={requiresSelfVerification}
                    className={`px-6 py-3 rounded-full font-semibold shadow-md w-fit self-start ${
                      requiresSelfVerification
                        ? 'bg-[#1d236b]/50 text-white cursor-not-allowed'
                        : 'bg-[#1d236b] text-white hover:opacity-90 transition-opacity'
                    }`}
                  >
                    Click to Add first Product
                  </button>
                  {requiresSelfVerification && (
                    <button
                      type="button"
                      onClick={handleStartVerification}
                      className="px-5 py-3 rounded-full border border-[#1d236b] text-[#1d236b] font-semibold hover:bg-[#1d236b] hover:text-white transition-colors"
                    >
                      Start Verification
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blue Sidebar - positioned absolutely to extreme right, ends before footer */}
        <div 
          className="absolute right-0 top-0 w-80 bg-[#14255c] text-white shadow-2xl flex flex-col z-40" 
          style={{
            top: '0px',
            bottom: '600px',
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
                <p className="text-sm font-semibold text-white">{businessName}</p>
                <p className="text-xs text-white/80 mt-1">
                  {locationDisplay ? locationDisplay : 'Country, City'}
                </p>
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

        <SupplierPortalFooter />
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

  if (showWelcomeScreen) {
    return renderWelcomeScreen();
  }

  if (showDashboardView && supplierStatus !== 'verified') {
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
