import React from 'react'
import { useNavigate } from 'react-router-dom'

const KyotoPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Kyoto Page</h1>
        <p className="text-gray-600 mb-6">This page is coming soon!</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back Home
        </button>
      </div>
    </div>
  )
}

export default KyotoPage

