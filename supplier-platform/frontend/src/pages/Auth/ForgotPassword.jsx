import { useState } from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '@/components/auth/ForgotPassword';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to your email address.
          </p>
          <Link to={ROUTES.LOGIN} className="btn btn-primary">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
        <p className="text-gray-600 mt-2">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <div className="card">
        <ForgotPasswordForm onSubmit={handleSubmit} loading={isLoading} />

        <div className="mt-6 text-center">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;