import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import subAdminService from '../services/subAdminService';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid invite link. Missing token or email.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }

    // Auto-login with token
    const autoLogin = async () => {
      try {
        const data = await subAdminService.login(email, token);
        
        if (data.access_token) {
          // Store token and user info
          localStorage.setItem('sub_admin_token', data.access_token);
          localStorage.setItem('sub_admin_user', JSON.stringify(data.user));
          
          setStatus('success');
          setMessage('Access granted! Redirecting to dashboard...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          throw new Error('No access token received');
        }
      } catch (error) {
        console.error('Auto-login error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to accept invite. The link may be expired or invalid.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    autoLogin();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Accepting Invitation...</h2>
            <p className="text-gray-600">Please wait while we grant you access.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Granted!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
