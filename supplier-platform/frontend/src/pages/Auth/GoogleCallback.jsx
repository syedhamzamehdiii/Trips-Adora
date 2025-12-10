import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import { toast } from 'react-toastify';
import { ROUTES } from '@/utils/constants';
import { redirectToSupplierOnboarding } from '@/utils/onboardingRedirect';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
      let isHandled = false;
      
      const handleCallback = async () => {
        if (isHandled) return;
        isHandled = true;
        try {
          // Get the code from URL
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          const error = urlParams.get('error');

        if (error) {
          toast.error('Google authentication was cancelled');
          navigate(ROUTES.LOGIN);
          return;
        }

        if (!code) {
          toast.error('No authorization code received');
          navigate(ROUTES.LOGIN);
          return;
        }

        // Exchange code for token via backend
        const response = await authService.googleLoginWithCode(code, 'http://localhost:5173/auth/google/callback');
        
        if (response.success) {
          updateUser(response.user);
          toast.success('Successfully signed in with Google!');
          // Check if user is verified, if not redirect to customer platform registration
          if (!response.user?.is_verified) {
            const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL || 'http://localhost:5174'
            const email = response.user?.email || ''
            // Pass email as URL parameter so customer platform can access it
            const redirectUrl = email 
              ? `/supplier-registration?email=${encodeURIComponent(email)}`
              : `/supplier-registration`
            window.location.href = redirectUrl
            return
          }
          if (!redirectToSupplierOnboarding()) {
          navigate(ROUTES.DASHBOARD);
          }
        } else {
          toast.error('Google authentication failed');
          navigate(ROUTES.LOGIN);
        }
      } catch (error) {
        console.error('Google callback error:', error);
        
        // Provide more helpful error messages
        let errorMessage = 'Google authentication failed';
        
        if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
          errorMessage = 'Request timed out. Please check if the backend server is running at http://localhost:8000';
        } else if (error.message?.includes('Network error') || error.message?.includes('ERR_NETWORK')) {
          errorMessage = 'Cannot connect to the server. Please ensure the backend is running at http://localhost:8000';
        } else {
          errorMessage = error.response?.data?.detail || error.message || 'Google authentication failed';
        }
        
        toast.error(errorMessage);
        navigate(ROUTES.LOGIN);
      }
    };

    handleCallback();
  }, []); // Empty dependency array to run only once

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google Sign-In...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

