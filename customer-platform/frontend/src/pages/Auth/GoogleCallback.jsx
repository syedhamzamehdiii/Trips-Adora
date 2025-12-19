import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { updateUser, prefetchProfileData } = useAuth();

  useEffect(() => {
      let isHandled = false;
      const codeKey = 'google_oauth_code_used'; // Key for tracking used codes
      
      const handleCallback = async () => {
        if (isHandled) return;
      isHandled = true;
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
      const finishAndNavigate = (path) => {
        // Remove code from URL immediately to prevent reuse
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate(path, { replace: true });
      };

          if (error) {
            console.log('Google authentication was cancelled');
        finishAndNavigate('/login');
            return;
          }

          if (!code) {
            console.log('No authorization code received');
        finishAndNavigate('/login');
            return;
          }

      // Check if this code was already processed (prevent React StrictMode double-call)
      const usedCode = sessionStorage.getItem(codeKey);
      if (usedCode === code) {
        console.log('Authorization code already processed, skipping duplicate call');
        finishAndNavigate('/login');
        return;
      }

      try {
          // Mark code as being processed immediately
          sessionStorage.setItem(codeKey, code);
          
          const redirectUri = window.location.origin + '/auth/google/callback';
          const response = await authService.googleLoginWithCode(code, redirectUri);
          
          // Remove code from URL and sessionStorage after successful processing
          window.history.replaceState({}, document.title, window.location.pathname);
          sessionStorage.removeItem(codeKey);
          
          if (response && response.success) {
            updateUser(response.user);

          const resolvedUserId =
            response.user?.id ||
            localStorage.getItem('customer_profile_user_id');
          if (resolvedUserId) {
            prefetchProfileData(resolvedUserId);
          }

            const needsProfile =
              typeof window !== 'undefined' &&
              localStorage.getItem('customer_profile_complete') !== '1';
            navigate(needsProfile ? '/profile/complete-profile' : '/dashboard', { replace: true });
          } else {
            console.log('Google authentication failed');
            navigate('/login', { replace: true });
          }
      } catch (err) {
        console.error('Google callback error:', err);
          // Remove code from URL and sessionStorage on error
          window.history.replaceState({}, document.title, window.location.pathname);
          sessionStorage.removeItem(codeKey);
          navigate('/login', { replace: true });
        }
      };

      handleCallback();
  }, [navigate, prefetchProfileData, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Connecting to Google...</p>
        <p className="mt-1 text-sm text-gray-500">This should only take a moment.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

