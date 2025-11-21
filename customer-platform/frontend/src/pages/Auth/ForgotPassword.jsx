import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiShield } from 'react-icons/fi'
import { toast } from 'react-toastify'
import authService from '../../services/authService'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [loadingState, setLoadingState] = useState({
    code: false,
    verify: false,
  })
  const [formData, setFormData] = useState({
    email: '',
    code: '',
  })

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleGetCode = async () => {
    if (!formData.email.trim()) {
      toast.error('Please enter your email to receive a code.')
      return
    }
    setLoadingState((prev) => ({ ...prev, code: true }))
    try {
      await authService.sendVerificationCode(formData.email.trim())
      toast.success('Verification code sent! Please check your inbox.')
    } catch (error) {
      toast.error(error.message || 'Failed to send verification code.')
    } finally {
      setLoadingState((prev) => ({ ...prev, code: false }))
    }
  }

  const handleVerifyAndContinue = async (e) => {
    e.preventDefault()
    if (!formData.email.trim() || !formData.code.trim()) {
      toast.error('Email and verification code are required.')
      return
    }
    setLoadingState((prev) => ({ ...prev, verify: true }))
    try {
      const response = await authService.verifyCode(
        formData.email.trim(),
        formData.code.trim()
      )
      const token = response?.token || formData.code.trim()
      toast.success('Code verified! Please set a new password.')
      navigate(`/reset-password?token=${encodeURIComponent(token)}`)
    } catch (error) {
      toast.error(error.message || 'Invalid verification code.')
    } finally {
      setLoadingState((prev) => ({ ...prev, verify: false }))
    }
  }

  const renderRequestCard = () => (
    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center">
      <h3 className="text-2xl font-bold text-black mb-2">Forgot password</h3>
      <p className="text-gray-700 mb-6">
        No problem, we're here to help. Enter the email linked to your account and we'll
        send you a verification code to reset your password.
      </p>

      <form onSubmit={handleVerifyAndContinue} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Email
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="customer@example.com"
              value={formData.email}
              onChange={handleChange('email')}
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <FiMail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter code"
                value={formData.code}
                onChange={handleChange('code')}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <FiShield className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              type="button"
              onClick={handleGetCode}
              disabled={loadingState.code}
              className="px-4 py-3 rounded-lg font-semibold text-white bg-[#1d236b] hover:bg-[#151a4a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingState.code ? 'Sending…' : 'Get Code'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loadingState.verify}
          className="w-full text-white py-3 px-4 rounded-lg font-semibold bg-[#1d236b] hover:bg-[#151a4a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loadingState.verify ? 'Processing…' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6">
        <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Back to login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('/assests/7a69a86aa051f23c28e29bda402f67956fba18bf.png')`,
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="relative z-10 h-20 flex items-center px-6 bg-white">
        <div className="flex items-center">
          <Link to="/dashboard">
            <img
              src="/assests/logo1.png"
              alt="TripsAdora Logo"
              className="h-12 w-auto"
            />
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 -mt-20">
        <div className="w-full max-w-xl">{renderRequestCard()}</div>
      </div>
    </div>
  )
}

export default ForgotPassword

