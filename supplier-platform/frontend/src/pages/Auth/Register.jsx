// Frontend/src/pages/Auth/Register.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import authService from '@/services/authService';
import { toast } from 'react-toastify';

// Validation schema
const registerSchema = yup.object().shape({
  fullName: yup.string().required('Full Name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  verificationCode: yup.string().required('Verification Code is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  terms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [showHeaderLabel, setShowHeaderLabel] = useState(false);
  
  useEffect(() => {
    // Reset and animate on every page load
    setShowHeaderLabel(false);
    const timer = setTimeout(() => {
      setShowHeaderLabel(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  const { register: authRegister, googleLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const handleSendCode = async () => {
    const email = watch('email');
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    try {
      setCodeLoading(true);
      await authService.sendVerificationCode(email);
      setCodeSent(true);
      toast.success('Verification code sent to your email!');
    } catch (error) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setCodeLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authRegister(data);
      toast.success('Registration successful! Welcome to TripsAdora!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      toast.success('Successfully signed in with Google!');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image - Japanese landscape with cherry blossoms */}
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-[#1d236b] ${
              showHeaderLabel ? 'animate-royal-reveal' : 'opacity-0'
            }`}
            style={{
              textShadow: showHeaderLabel
                ? '0 6px 14px rgba(22, 28, 98, 0.35)'
                : 'none',
              letterSpacing: '0.05em',
            }}
          >
            Supplier
          </span>
          <style>{`
            @keyframes royalReveal {
              0% {
                opacity: 0;
                transform: translateY(-25px) scale(0.85);
                letter-spacing: 0.3em;
              }
              45% {
                opacity: 0.8;
                transform: translateY(6px) scale(1.03);
                letter-spacing: 0.08em;
              }
              75% {
                opacity: 1;
                transform: translateY(-2px) scale(0.99);
                letter-spacing: 0.04em;
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
                letter-spacing: 0.05em;
              }
            }
            .animate-royal-reveal {
              animation: royalReveal 1s ease-out forwards;
            }
          `}</style>
        </div>
      </div>

      {/* Content - Centered Register Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 -mt-20">
        <div className="w-full max-w-md">

          {/* Register Card */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold text-black mb-2 text-center">Signup</h3>
            <p className="text-gray-700 mb-4 text-center">
              Sign up to connect with travelers and showcase your experiences.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  {...register('fullName')}
                />
                <FiUser className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                        )}
              </div>

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

              {/* Verification Code */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Verification Code"
                  className="w-full px-4 py-3 pr-24 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  {...register('verificationCode')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Get Code
                </button>
                {errors.verificationCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.verificationCode.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiLock size={20} /> : <FiLock size={20} />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiLock size={20} /> : <FiLock size={20} />}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6 flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  {...register('terms')}
                />
                <label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed">
                  By proceeding, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>
                  {' '}and confirm you have read our{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm mt-1">{errors.terms.message}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-2 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#1d236b',
                  '--hover-color': '#1d236b'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d236b'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1d236b'}
              >
                {isLoading ? 'Signing up...' : 'Sign up'}
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
                  {/* Google - Black circle with white G */}
                  <button 
                    onClick={handleGoogleLogin}
                    className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <span className="font-bold text-lg text-white">G</span>
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

                    {/* Login Link */}
                    <p className="text-center text-sm text-gray-700">
                      Already have an account?{' '}
                      <Link
                        to={ROUTES.LOGIN}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Sign in
                      </Link>
                    </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;