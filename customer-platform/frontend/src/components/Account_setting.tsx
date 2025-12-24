import React, { useState } from 'react'
import { AlertCircle, UserPlus, Lock, Check, X, AlertCircle as ExclamationIcon } from 'lucide-react'

const Account_setting = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoginAccessModalOpen, setIsLoginAccessModalOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [allowLogin, setAllowLogin] = useState(true)
    const [roles, setRoles] = useState([
        { id: 'all-access', title: 'All access, including adding/removing users', enabled: true },
        { id: 'finance', title: 'Finance', description: 'Has access to financial information only.', enabled: true },
        { id: 'manage-booking', title: 'Manage booking', description: 'Can access financial info only.', enabled: true },
        { id: 'travel-queries', title: 'Travel Queries', description: 'Can access financial info only.', enabled: true }
    ])

    const profileItems = [
        { label: 'Personal Info', completed: false, points: '+10%' },
        { label: 'Setup account', completed: true, points: '+20%' },
        { label: 'Upload your photo', completed: true, points: '+10%' },
        { label: 'Notifications', completed: false, points: '+10%' },
        { label: 'Location', completed: false, points: '+10%' },
        { label: 'Biography', completed: false, points: '+30%' },
        { label: 'Bank details', completed: true, points: '+10%' },
    ]

    const completionPercentage = 40

    const handleSendInvite = () => {
        console.log('Sending invite to:', email, message)
        setIsModalOpen(false)
        setEmail('')
        setMessage('')
    }

    const toggleRole = (roleId) => {
        setRoles(roles.map(role => 
            role.id === roleId ? { ...role, enabled: !role.enabled } : role
        ))
    }

    const handleUpdate = () => {
        console.log('Allow Login:', allowLogin)
        console.log('Roles:', roles)
        setIsLoginAccessModalOpen(false)
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <img 
                                src="/images/logo1.png" 
                                alt="TripsAdora Logo" 
                                className="h-10 w-auto object-contain"
                            />
                        </div>

                        {/* Navigation */}
                        <nav className="flex items-center space-x-8">
                            <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Home</a>
                            <a href="#" className="text-gray-600 font-medium hover:text-gray-900">FAQs</a>
                            <a href="#" className="text-gray-600 font-medium hover:text-gray-900">Support</a>
                        </nav>

                        {/* Right Side - Balance, Profile, ID */}
                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Available Balance</div>
                                <div className="text-lg font-semibold text-gray-900">$1850</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center overflow-hidden">
                                    <img 
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-xs text-gray-600 mt-1">ID 00032123</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Top Section - Profile Card */}
                <div className="bg-gray-100 rounded-2xl p-8 mb-8">
                    <div className="flex items-start justify-between">
                        {/* Left - Profile Picture and Name */}
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-green-200 overflow-hidden relative">
                                    <img 
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" 
                                        alt="Edward William" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900">Edward William</h2>
                                    <a href="#" className="text-blue-600 text-sm font-medium hover:underline">Edit</a>
                                </div>
                                <p className="text-gray-600 text-sm">Notting Hill, London</p>
                            </div>
                        </div>

                        {/* Middle - Supplier ID and Upload */}
                        <div className="flex flex-col items-center">
                            <div className="text-lg font-semibold text-gray-900 mb-4">Supplier ID 00032123</div>
                            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition mb-2">
                                Upload new photo
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                                At least 800x800 px recommended.<br />
                                JPG or PNG is allowed.
                            </p>
                        </div>

                        {/* Right - Action Buttons */}
                        <div className="flex flex-col space-y-3">
                            <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-red-600 transition">
                                <AlertCircle className="w-5 h-5" />
                                Account verification
                            </button>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition"
                            >
                                <UserPlus className="w-5 h-5" />
                                Add a new user
                            </button>
                            <button 
                                onClick={() => setIsLoginAccessModalOpen(true)}
                                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-300 transition"
                            >
                                <Lock className="w-5 h-5" />
                                Login access
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Your Information Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Your information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Account type:</span>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                        Private individual
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Public name:</span>
                                    <span className="text-gray-900 font-medium">Suneel Pirkash</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Legal name:</span>
                                    <span className="text-gray-900 font-medium">SUNEEL PIRKASH</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="text-gray-900 font-medium">suneelpirkash@gmail.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Office Information Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Office information</h3>
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <span className="text-gray-600">Street address:</span>
                                    <span className="text-gray-900 font-medium text-right max-w-xs">
                                        1 Chome-1 Nishi-Shinjuku, Shinjuku City, Tokyo
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Complete Profile Card */}
                    <div>
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Complete your profile</h3>
                            
                            {/* Circular Progress */}
                            <div className="flex justify-center mb-8">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full" viewBox="0 0 200 200">
                                        <defs>
                                            <linearGradient id="greenGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#4ADE80" />
                                                <stop offset="100%" stopColor="#22C55E" />
                                            </linearGradient>
                                            <linearGradient id="greenGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#22C55E" />
                                                <stop offset="100%" stopColor="#16A34A" />
                                            </linearGradient>
                                        </defs>
                                        
                                        {(() => {
                                            const centerX = 100
                                            const centerY = 100
                                            const radius = 70
                                            
                                            const topArcStart = 135
                                            const topArcEnd = 45
                                            const bottomArcStart = 315
                                            const bottomArcEnd = 225
                                            
                                            const polarToCart = (angle) => {
                                                const rad = ((angle - 90) * Math.PI) / 180
                                                return {
                                                    x: centerX + radius * Math.cos(rad),
                                                    y: centerY + radius * Math.sin(rad)
                                                }
                                            }
                                            
                                            const topStart = polarToCart(topArcStart)
                                            const topEnd = polarToCart(topArcEnd)
                                            const bottomStart = polarToCart(bottomArcStart)
                                            const bottomEnd = polarToCart(bottomArcEnd)
                                            
                                            return (
                                                <>
                                                    <path
                                                        d={`M ${topStart.x} ${topStart.y} A ${radius} ${radius} 0 0 0 ${topEnd.x} ${topEnd.y}`}
                                                        fill="none"
                                                        stroke="url(#greenGradient1)"
                                                        strokeWidth="11"
                                                        strokeLinecap="round"
                                                    />
                                                    <path
                                                        d={`M ${bottomStart.x} ${bottomStart.y} A ${radius} ${radius} 0 0 0 ${bottomEnd.x} ${bottomEnd.y}`}
                                                        fill="none"
                                                        stroke="url(#greenGradient2)"
                                                        strokeWidth="11"
                                                        strokeLinecap="round"
                                                    />
                                                    <path
                                                        d={`M ${bottomEnd.x} ${bottomEnd.y} A ${radius} ${radius} 0 0 0 ${topStart.x} ${topStart.y}`}
                                                        fill="none"
                                                        stroke="#3F3F46"
                                                        strokeWidth="11"
                                                        strokeLinecap="round"
                                                    />
                                                    <circle cx={topStart.x} cy={topStart.y} r="11" fill="#2F5E23" />
                                                    <circle cx={bottomStart.x} cy={bottomStart.y} r="11" fill="#2F5E23" />
                                                </>
                                            )
                                        })()}
                                    </svg>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-green-500">
                                            {completionPercentage}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tasks List */}
                            <div className="space-y-3">
                                {profileItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {item.completed ? (
                                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                                                    <span className="text-black text-xs font-semibold leading-none">i</span>
                                                </div>
                                            )}
                                            <span className="text-gray-900">{item.label}</span>
                                        </div>
                                        <span className="text-sm font-medium text-green-500">{item.points}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal - Add a new holder */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                            Add a new holder
                        </h2>
                        
                        <p className="text-gray-500 text-center text-sm mb-6">
                            Continue by entering an email address
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Personal message (Optional)"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSendInvite}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                        >
                            Send invite to access
                        </button>
                    </div>
                </div>
            )}

            {/* Modal - Role and login access */}
            {isLoginAccessModalOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setIsLoginAccessModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Role and login access
                        </h2>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-600 font-medium">Allow login</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={allowLogin}
                                        onChange={(e) => setAllowLogin(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Enable this option to permit account login.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                            <div className="space-y-4">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 mb-1">
                                                {role.title}
                                            </div>
                                            {role.description && (
                                                <p className="text-gray-500 text-sm">
                                                    {role.description}
                                                </p>
                                            )}
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                                            <input
                                                type="checkbox"
                                                checked={role.enabled}
                                                onChange={() => toggleRole(role.id)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleUpdate}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                        >
                            Update
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Account_setting