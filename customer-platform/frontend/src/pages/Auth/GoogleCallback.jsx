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
        // Prevent double execution (React StrictMode in dev)
        if (isHandled) return;
        
        // Get the code from URL first
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        // Check if this code has already been processed
        const processedCodeKey = `google_auth_code_${code}`;
        if (code && sessionStorage.getItem(processedCodeKey)) {
          console.log('Authorization code already processed, redirecting...');
          navigate('/login', { replace: true });
          return;
        }
        
        // Mark as handled immediately to prevent double execution
        isHandled = true;
        
        // Set a timeout to prevent hanging
        timeoutId = setTimeout(() => {
          console.log('Google authentication timeout');
          navigate('/login', { replace: true });
        }, 15000); // 15 second timeout
        
        try {
          if (error) {
            // Silent error handling - just navigate to login
            console.log('Google authentication was cancelled');
            clearTimeout(timeoutId);
            // Clear URL params to prevent reuse
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/login', { replace: true });
            return;
          }

          if (!code) {
            // Silent error handling - just navigate to login
            console.log('No authorization code received');
            clearTimeout(timeoutId);
            // Clear URL params to prevent reuse
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/login', { replace: true });
            return;
          }

          // Mark this code as being processed immediately (before API call)
          // This prevents duplicate requests if component re-renders
          sessionStorage.setItem(processedCodeKey, 'processing');
          
          // Exchange code for token via backend
          // Use the exact redirect URI that was used in the initial OAuth request
          const redirectUri = window.location.origin + '/auth/google/callback';
          const response = await authService.googleLoginWithCode(code, redirectUri);
          
          clearTimeout(timeoutId);
          
          // Mark code as successfully processed
          sessionStorage.setItem(processedCodeKey, 'success');
          
          // Clear URL params to prevent page refresh from reusing the code
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (response && response.success) {
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
          
          // Handle specific error cases
          if (error.message && (error.message.includes('expired') || error.message.includes('already used'))) {
            // Code was already used or expired - clear it
            if (code) {
              sessionStorage.setItem(processedCodeKey, 'failed');
            }
            console.error('Google OAuth code expired or already used:', error.message);
          } else {
            // Other errors
            console.error('Google callback error:', error);
          }
          
          // Clear URL params to prevent reuse
          window.history.replaceState({}, document.title, window.location.pathname);
          
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

