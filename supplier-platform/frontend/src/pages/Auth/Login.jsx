// Frontend/src/pages/Auth/Login.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image - Japanese Landscape */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png')`,
          }}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Header - Navbar with Logo */}
      <div className="relative z-10 h-20 flex items-center px-6 bg-white">
        <div className="flex items-center">
          {/* TripsAdora Logo */}
          <img 
            src="/assets/logo.jpg" 
            alt="TripsAdora Logo" 
            className="h-12 w-auto"
          />
        </div>
      </div>

      {/* Content - Centered Login Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 -mt-20">
        <div className="w-full max-w-xs sm:max-w-sm">

          {/* Login Card */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-5 sm:p-6">
            <h3 className="text-2xl font-bold text-black mb-2 text-center">Login</h3>
            <p className="text-gray-700 mb-6 text-center">
              Sign in to connect with travelers and showcase your experiences.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  {...register('email')}
                />
                <FiMail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  {...register('password')}
                />
                <FiLock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forget password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#1d236b',
                  '--hover-color': '#1d236b'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d236b'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1d236b'}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 font-medium text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

                    {/* Social Login */}
                    <div className="flex justify-center space-x-4 mb-4">
                      {/* Google - Black circle with colorful G */}
                      <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </button>
                      {/* Facebook - Black circle with white f */}
                      <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                        <span className="font-bold text-lg text-white">f</span>
                      </button>
                      {/* Apple - Black circle with white Apple logo */}
                      <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                      </button>
                    </div>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-700">
              Don't have supplier account{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </p>

            {/* Terms */}
            <div className="mt-6 flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed">
                By continuing, you agree to the{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms of use</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;