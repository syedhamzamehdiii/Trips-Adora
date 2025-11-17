import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
      let isHandled = false;
      let timeoutId = null;
      
      const handleCallback = async () => {
        if (isHandled) return;
        isHandled = true;
        
        // Set a timeout to prevent hanging
        timeoutId = setTimeout(() => {
          if (!isHandled) {
            console.log('Google authentication timeout');
            navigate('/login', { replace: true });
          }
        }, 10000); // 10 second timeout
        
        try {
          // Get the code from URL
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          const error = urlParams.get('error');

        if (error) {
          // Silent error handling - just navigate to login
          console.log('Google authentication was cancelled');
          clearTimeout(timeoutId);
          navigate('/login', { replace: true });
          return;
        }

        if (!code) {
          // Silent error handling - just navigate to login
          console.log('No authorization code received');
          clearTimeout(timeoutId);
          navigate('/login', { replace: true });
          return;
        }

        // Exchange code for token via backend
        // Use the exact redirect URI that was used in the initial OAuth request
        const redirectUri = window.location.origin + '/auth/google/callback';
        const response = await authService.googleLoginWithCode(code, redirectUri);
        
        clearTimeout(timeoutId);
        
        if (response.success) {
          updateUser(response.user);
          // Success - navigate to dashboard (no alert)
          navigate('/dashboard', { replace: true });
        } else {
          // Silent error handling
          console.log('Google authentication failed');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        // Silent error handling - log but don't show alert
        console.error('Google callback error:', error);
        // Navigate to login without showing error dialog
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate, updateUser]); // Include dependencies

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

