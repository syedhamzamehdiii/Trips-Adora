import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import authService from '@/services/authService';
import { ROUTES } from '@/utils/constants';
import { markSupplierOnboardingVerified } from '@/utils/onboardingRedirect';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showHeaderLabel, setShowHeaderLabel] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState('form'); // form | success
  const [isVerifiedSupplier, setIsVerifiedSupplier] = useState(false);

  const token = searchParams.get('token') || '';

  useEffect(() => {
    setShowHeaderLabel(false);
    const timer = setTimeout(() => setShowHeaderLabel(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const getOnboardingStatus = () => {
    try {
      return (
        localStorage.getItem('supplier_onboarding_status') ||
        sessionStorage.getItem('supplier_onboarding_status') ||
        ''
      );
    } catch (_) {
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Invalid or missing reset token. Please use the link from your email.');
      return;
    }
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Please fill in both password fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token.trim(), formData.password);
      const onboardingStatus = getOnboardingStatus();
      setIsVerifiedSupplier(onboardingStatus === 'verified');
      markSupplierOnboardingVerified();
      setPhase('success');
      toast.success('Password updated!');
    } catch (error) {
      toast.error(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('/assets/7a69a86aa051f23c28e29bda402f67956fba18bf.png')`,
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="relative z-10 h-20 flex items-center px-6 bg-white">
        <div className="flex items-center">
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
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 -mt-20">
        <div className="w-full max-w-xl">
          {phase === 'form' ? (
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-black mb-2">Set a new password</h3>
              <p className="text-gray-700 mb-6">
                Create a new password. Ensure it differs from previous ones for security.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white py-3 px-4 rounded-lg font-semibold bg-[#1d236b] hover:bg-[#151a4a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating…' : 'Update Password'}
                </button>
              </form>

              <div className="mt-6">
                <Link to={ROUTES.LOGIN} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl px-6 py-10 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto">
                <FiCheckCircle size={34} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">Congratulations!</h3>
                <p className="text-gray-700 text-base leading-relaxed max-w-sm mx-auto">
                  Your password has been changed. Click continue to login.
                </p>
              </div>

              <button
                onClick={handleGoToLogin}
                className="w-full text-white py-3 px-4 rounded-full font-semibold bg-[#1d236b] hover:bg-[#151a4a] transition-colors"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

