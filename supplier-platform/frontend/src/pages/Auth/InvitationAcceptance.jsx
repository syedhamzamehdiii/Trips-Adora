import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { API_ENDPOINTS } from '@/utils/constants'
import { toast } from 'react-toastify'

const InvitationAcceptance = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('Accepting invitation...')

  useEffect(() => {
    const acceptInvitation = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid invitation link')
        return
      }

      try {
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/v1/auth/invitation/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.detail || 'Failed to accept invitation')
        }

        // Store tokens
        if (data.token) {
          localStorage.setItem('access_token', data.token)
          localStorage.setItem('refresh_token', data.refresh_token)
        }

        // Update user context
        if (data.user) {
          setUser(data.user)
          
          // Store supplier code if provided
          if (data.supplier_code) {
            localStorage.setItem('supplier_id', data.supplier_code)
            localStorage.setItem('selected_supplier_code', data.supplier_code)
          }
        }

        setStatus('success')
        setMessage(`Access granted to ${data.supplier_name || data.supplier_code}!`)
        toast.success(`Welcome! You now have access to ${data.supplier_name || data.supplier_code}`)

        // Redirect to dashboard with supplier code
        setTimeout(() => {
          if (data.redirect_url) {
            navigate(data.redirect_url)
          } else {
            navigate(`/dashboard${data.supplier_code ? `?supplier_code=${data.supplier_code}` : ''}`)
          }
        }, 2000)

      } catch (error) {
        console.error('Invitation acceptance error:', error)
        setStatus('error')
        setMessage(error.message || 'Failed to accept invitation. The link may be expired or invalid.')
        toast.error(error.message || 'Failed to accept invitation')
      }
    }

    acceptInvitation()
  }, [token, navigate, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accepting Invitation</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Granted!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Error</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default InvitationAcceptance



