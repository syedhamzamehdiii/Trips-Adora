// Supplier Onboarding Service
// Handles supplier registration/onboarding data submission
import axios from 'axios';
import { config } from '../config';
import imageService from './imageService';

// Supplier onboarding endpoints are on supplier platform backend (port 8000)
// Customer platform backend is on port 8001
const SUPPLIER_API_BASE_URL = import.meta.env.VITE_SUPPLIER_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = config.API_BASE_URL; // For image uploads (customer platform)

// Create axios instance for supplier platform API (onboarding endpoints)
const supplierApi = axios.create({
  baseURL: `${SUPPLIER_API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
});

// Create axios instance for customer platform API (image uploads)
const customerApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
});

class SupplierOnboardingService {
  /**
   * Upload a file to Cloudinary via supplier platform backend
   * @param {File} file - The file to upload
   * @param {string} folder - Cloudinary folder (e.g., 'supplier/onboarding')
   * @returns {Promise<string>} - Cloudinary URL
   */
  async uploadFile(file, folder = 'supplier/onboarding') {
    try {
      // Use supplier platform API for onboarding file uploads
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('access_token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Don't set Content-Type - let axios set it automatically with boundary for FormData
      // Create a temporary axios instance without default Content-Type for file uploads
      const uploadApi = axios.create({
        baseURL: `${SUPPLIER_API_BASE_URL}/api/v1`,
        timeout: 30000
      });
      
      const response = await uploadApi.post(`/images/upload?folder=${encodeURIComponent(folder)}`, formData, {
        headers: headers
      });
      
      return response.data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to upload file';
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload multiple files to Cloudinary
   * @param {File[]} files - Array of files to upload
   * @param {string} folder - Cloudinary folder
   * @returns {Promise<string[]>} - Array of Cloudinary URLs
   */
  async uploadFiles(files, folder = 'supplier/onboarding') {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error(`Failed to upload files: ${error.message}`);
    }
  }

  /**
   * Submit supplier onboarding data
   * @param {Object} onboardingData - Complete onboarding data
   * @returns {Promise<Object>} - Response from API
   */
  async submitOnboarding(onboardingData) {
    try {
      // Add auth token if available
      const token = localStorage.getItem('access_token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};
      
      console.log('Submitting onboarding with payload:', { ...onboardingData, id_front_url: onboardingData.id_front_url ? '[URL]' : null, id_back_url: onboardingData.id_back_url ? '[URL]' : null });
      
      const response = await supplierApi.post('/supplier-onboarding', onboardingData, config);
      return response.data;
    } catch (error) {
      console.error('Error submitting onboarding:', error?.response?.data || error);
      const errorMessage =
        error.response?.data?.detail ||
        (Array.isArray(error.response?.data?.detail) ? error.response.data.detail.map(e => e.msg || e).join(', ') : null) ||
        (typeof error.response?.data === 'object' ? JSON.stringify(error.response.data) : null) ||
        error.message ||
        'Failed to submit onboarding data';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get onboarding data by email
   * @param {string} email - Email address
   * @returns {Promise<Object>} - Onboarding data
   */
  async getOnboardingByEmail(email) {
    try {
      const response = await supplierApi.get(`/supplier-onboarding/email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No onboarding found
      }
      console.error('Error getting onboarding:', error);
      throw new Error('Failed to get onboarding data');
    }
  }

  /**
   * Get current user info from supplier platform (if logged in)
   * @returns {Promise<Object|null>} - User info or null
   */
  async getSupplierUserInfo() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No access token found in localStorage');
        return null;
      }
      
      // Try to get user info from supplier platform
      const response = await supplierApi.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        const userInfo = {
          name: response.data.full_name || response.data.business_name || response.data.name || '',
          email: response.data.email || ''
        };
        console.log('Retrieved user info from supplier platform:', userInfo);
        return userInfo;
      }
      console.log('No user data in response');
      return null;
    } catch (error) {
      console.error('Error getting supplier user info:', error?.response?.data || error);
      // Try to decode JWT token as fallback
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Simple JWT decode (without verification - just to get email)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          if (decoded.email || decoded.sub) {
            console.log('Decoded email from JWT token');
            return {
              name: decoded.name || decoded.full_name || '',
              email: decoded.email || ''
            };
          }
        }
      } catch (decodeError) {
        console.error('Failed to decode JWT token:', decodeError);
      }
      return null;
    }
  }

  /**
   * Submit complete supplier registration with file uploads
   * @param {Object} formData - Form data from registration page
   * @param {Object} files - File objects (logoFile, insuranceFile, etc.)
   * @returns {Promise<Object>} - Response from API
   */
  async submitCompleteRegistration(formData, files) {
    try {
      const {
        selectedBusinessType,
        employeeCount,
        businessName,
        businessPhone,
        businessPhoneCode,
        businessEmail,
        businessWebsite,
        businessRegistration,
        country,
        city,
        zipCode,
        shortBio,
        socialLinks,
        personCountry,
        personCity,
        personAddress,
        personZipCode,
        personPhoneCode,
        personContact,
        idType,
        requiresBackImage,
        user_name,
        user_email
      } = formData;

      // Upload files to Cloudinary
      const uploadPromises = [];
      const fileKeys = [];

      // Business Identity files (only for non-solo)
      if (selectedBusinessType !== 'solo') {
        if (files.logoFile) {
          uploadPromises.push(this.uploadFile(files.logoFile, 'supplier/onboarding/logo'));
          fileKeys.push('logo');
        }
        if (files.insuranceFile) {
          uploadPromises.push(this.uploadFile(files.insuranceFile, 'supplier/onboarding/insurance'));
          fileKeys.push('insurance');
        }
        if (files.documentFile) {
          uploadPromises.push(this.uploadFile(files.documentFile, 'supplier/onboarding/documents'));
          fileKeys.push('document');
        }
      }

      // ID Verification files
      if (files.idFrontFile) {
        uploadPromises.push(this.uploadFile(files.idFrontFile, 'supplier/onboarding/id'));
        fileKeys.push('idFront');
      }
      if (files.idBackFile && requiresBackImage) {
        uploadPromises.push(this.uploadFile(files.idBackFile, 'supplier/onboarding/id'));
        fileKeys.push('idBack');
      }

      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);

      // Map URLs to their respective fields
      let urlIndex = 0;
      const urlMap = {};
      fileKeys.forEach(key => {
        urlMap[key] = uploadedUrls[urlIndex++];
      });

      // Determine the email to use - prioritize user_email, then businessEmail, then fallback
      // Also try to get from token if not provided
      let primaryEmail = user_email || businessEmail || formData.email || '';
      
      // If still no email, try to get from supplier platform token
      if (!primaryEmail) {
        try {
          const supplierInfo = await this.getSupplierUserInfo();
          if (supplierInfo?.email) {
            primaryEmail = supplierInfo.email;
            console.log('Retrieved email from supplier platform:', primaryEmail);
          }
        } catch (err) {
          console.warn('Could not retrieve email from supplier platform:', err);
        }
      }
      
      if (!primaryEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primaryEmail)) {
        console.error('Email validation failed. user_email:', user_email, 'businessEmail:', businessEmail, 'formData.email:', formData.email);
        throw new Error('Please provide a valid email for registration. If you signed in with Google, please ensure you are properly authenticated.');
      }
      
      // Prepare onboarding payload
      const onboardingPayload = {
        email: primaryEmail,
        user_name: user_name || null,
        user_email: user_email || null,
        business_type: selectedBusinessType,
        employee_count: employeeCount || 0,
      };

      // Business Identity (only for non-solo)
      if (selectedBusinessType !== 'solo') {
        onboardingPayload.business_name = businessName || '';
        onboardingPayload.business_phone = businessPhone || '';
        onboardingPayload.business_phone_code = businessPhoneCode || '';
        if (businessEmail) {
          onboardingPayload.business_email = businessEmail;
        }
        onboardingPayload.business_website = businessWebsite || '';
        onboardingPayload.business_registration = businessRegistration || '';
        onboardingPayload.business_country = country || '';
        onboardingPayload.business_city = city || '';
        onboardingPayload.business_zip_code = zipCode || '';
        onboardingPayload.short_bio = shortBio || '';
        onboardingPayload.social_links = socialLinks?.filter(link => link && link.trim()) || [];
        onboardingPayload.logo_url = urlMap.logo || null;
        onboardingPayload.insurance_document_url = urlMap.insurance || null;
        onboardingPayload.business_document_url = urlMap.document || null;
      }

      // ID Verification (always required)
      onboardingPayload.person_country = personCountry || '';
      onboardingPayload.person_city = personCity || '';
      onboardingPayload.person_address = personAddress || '';
      onboardingPayload.person_zip_code = personZipCode || '';
      onboardingPayload.person_phone_code = personPhoneCode || '';
      onboardingPayload.person_contact = personContact || '';
      onboardingPayload.id_type = idType || '';
      onboardingPayload.id_front_url = urlMap.idFront || null;
      onboardingPayload.id_back_url = urlMap.idBack || null;

      // Submit to API
      const response = await this.submitOnboarding(onboardingPayload);
      return response;
    } catch (error) {
      console.error('Error in complete registration:', error);
      throw error;
    }
  }
}

export default new SupplierOnboardingService();
