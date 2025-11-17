import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

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
          alert('Google authentication was cancelled');
          navigate('/login');
          return;
        }

        if (!code) {
          alert('No authorization code received');
          navigate('/login');
          return;
        }

        // Exchange code for token via backend
        const response = await authService.googleLoginWithCode(code, 'http://localhost:5174/auth/google/callback');
        
        if (response.success) {
          updateUser(response.user);
          alert('Successfully signed in with Google!');
          navigate('/dashboard');
        } else {
          alert('Google authentication failed');
          navigate('/login');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Google authentication failed';
        alert(errorMessage);
        navigate('/login');
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

