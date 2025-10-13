import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import { ROUTES } from '@/utils/constants';
import { toast } from 'react-toastify';

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
        const response = await authService.googleLoginWithCode(code, 'http://localhost:5177/auth/google/callback');
        
        if (response.success) {
          updateUser(response.user);
          toast.success('Successfully signed in with Google!');
          navigate(ROUTES.DASHBOARD);
        } else {
          toast.error('Google authentication failed');
          navigate(ROUTES.LOGIN);
        }
      } catch (error) {
        console.error('Google callback error:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Google authentication failed';
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
        <p className="mt-4 text-gray-700">Authenticating with Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
