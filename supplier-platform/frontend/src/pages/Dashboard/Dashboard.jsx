import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlus, FiClock, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { formatCurrency, formatNumber } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { clearAuth } = useAuth();
  
  // Mock data matching the TripsAdora dashboard design
  const stats = [
    {
      title: 'Total Products',
      value: '12',
      description: 'Total number of products you have created and listed on the platform.',
    },
    {
      title: 'Cancellation rate',
      value: '0%',
      description: 'The percentage of bookings that were canceled.',
    },
    {
      title: 'Fresh Reviews',
      value: '4.8',
      description: 'Booking canceled by you',
    },
    {
      title: 'Today\'s balance',
      value: '$760',
      description: 'Amount earned and available for today.',
    },
  ];

  const productSetupItems = [
    {
      title: 'Mount fuji 5th station',
      date: 'Started on Friday, August 1, 2002',
      progress: 20,
    },
    {
      title: 'Mount fuji 4th station',
      date: 'Started on Friday, August 1, 2002',
      progress: 80,
    },
  ];

  const popularActivities = [
    {
      title: 'Mount fuji 5th station tour by car with pickup',
      description: 'A highly demanded tour to Mount Fuji\'s 5th Station by private car with convenient pickup service. This experience has been one of the most popular choices among travelers in recent days.',
      popularity: '14.6%',
    },
  ];

  const sidebarStats = {
    todayBookings: '18 New',
    tomorrowBookings: '24 Confirmed',
    activityProgress: 60,
    published: 45,
    drafts: 15,
    underReview: 0,
    positiveRating: 79,
    cancellation: 9,
    negativeRating: 12,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center">
                        {/* TripsAdora Logo */}
                        <img 
                          src="/assets/logo.jpg" 
                          alt="TripsAdora" 
                          className="h-8 w-auto"
                        />
                      </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-blue-600 border-b-2 border-blue-600 pb-4 text-sm font-medium">Home</a>
                <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium">FAQs</a>
                <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium">Support</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-5 h-5 text-gray-700">🔔</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">EN</span>
                <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              {/* User Profile Section */}
              <div className="flex items-center space-x-4 px-4 py-2 rounded-lg" style={{ backgroundColor: '#1d236b' }}>
                <div className="text-right text-white">
                  <div className="text-xs">Available Balance</div>
                  <div className="text-lg font-semibold">$1850</div>
                </div>
                <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white"></div>
                <div className="text-white">
                  <div className="text-xs">ID 00032123</div>
                </div>
              </div>
              {/* Temporary logout button for testing */}
              <button 
                onClick={clearAuth}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Logout (Test)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-3">
            <a href="#" className="text-gray-900 border-b-2 border-gray-900 pb-1 text-sm font-medium">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Listings</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Availability</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Bookings</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Insights</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Finance</a>
              </nav>
        </div>
      </div>

      {/* First Half - Background Image Section */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center"
                        style={{
              backgroundImage: `url('/assets/49f555cdd6a046078f7f2a1e0a835fc0c68a4e3a.jpg')`,
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start gap-8">
            {/* Left Content */}
            <div className="flex-1">
                    {/* Hero Banner */}
                    <div className="relative rounded-xl overflow-hidden h-64 mb-8">
                      <div className="relative p-8 h-full flex flex-col justify-center">
                        <h1 className="text-5xl font-bold mb-6">
                          <span className="text-gray-800 block">Grow Your Business with</span>
                          <span className="text-white block text-6xl">THE NEW HORIZON</span>
                        </h1>
                        <div className="flex space-x-4">
                          <button className="bg-white bg-opacity-90 backdrop-blur-sm text-gray-800 px-6 py-3 rounded-lg hover:bg-opacity-95 transition-all border border-gray-300">
                            Create new product
                          </button>
                          <button className="text-white px-6 py-3 rounded-lg transition-all" style={{ backgroundColor: '#1d236b' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#171c55'} onMouseLeave={(e) => e.target.style.backgroundColor = '#1d236b'}>
                            Active Product listing
                          </button>
                        </div>
                      </div>
      </div>

      {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
                  <div key={index} className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{stat.title}</h3>
                    <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{stat.description}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Sidebar - Fixed Position */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-xl p-6" style={{ backgroundColor: '#1d236b' }}>
                    {/* Supplier Mode Toggle */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">Supplier mode</span>
                        <div className="w-12 h-6 bg-green-500 rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>

                    {/* Supplier Info */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="font-semibold text-white">Edward William</p>
                          <p className="text-sm text-gray-300">Notting Hill, London</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-300">Karwan Tours</span>
                        <FiCheck className="ml-2 text-green-400" size={16} />
                      </div>
                    </div>

            {/* Booking Stats */}
            <div className="mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-300">Today's bookings</p>
                  <p className="font-medium text-white">{sidebarStats.todayBookings} <span className="text-green-400">New Active</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Tomorrow's bookings</p>
                  <p className="font-medium text-white">{sidebarStats.tomorrowBookings} <span className="text-green-400">Confirmed Confirmed</span></p>
                </div>
              </div>
      </div>

                {/* Activity Chart */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">My Activity</h3>
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="24"
                          stroke="#4a5568"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="24"
                          stroke="#ffffff"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - sidebarStats.activityProgress / 100)}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">{sidebarStats.activityProgress}%</span>
                      </div>
                    </div>
                  </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-300">Published</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-300">Drafts</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-300">Under review</span>
                </div>
              </div>
            </div>

                {/* Account Stability */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Account Stability</h3>
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16">
                        <circle
                          cx="32"
                          cy="32"
                          r="24"
                          stroke="#4a5568"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="24"
                          stroke="#22c55e"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - 70 / 100)}`}
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="24"
                          stroke="#f59e0b"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - 18 / 100)}`}
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="24"
                          stroke="#ef4444"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - 12 / 100)}`}
                        />
                      </svg>
                    </div>
                  </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-300">Positive rating</span>
                  </div>
                  <span className="text-sm font-medium text-white">70%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-300">Cancellation</span>
                  </div>
                  <span className="text-sm font-medium text-white">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-300">Negative rating</span>
                  </div>
                  <span className="text-sm font-medium text-white">12%</span>
                </div>
              </div>
            </div>

                {/* Help Button */}
                <button className="w-full text-white py-3 px-4 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700">
                  Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Half - White Background Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
            {/* Product Setup Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Wrap Up Your Product Setup</h2>
              <div className="space-y-4">
                {productSetupItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.date}</p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${item.progress}%`, backgroundColor: '#1d236b' }}
                        ></div>
                      </div>
                    </div>
                      <button className="text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2" style={{ backgroundColor: '#1d236b' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#171c55'} onMouseLeave={(e) => e.target.style.backgroundColor = '#1d236b'}>
                        <span>Continue</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Most Popular Activities</h2>
              <div className="space-y-4">
                {popularActivities.map((activity, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{activity.title}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                        </div>
                        <div className="flex items-center ml-4">
                          <span className="text-green-600 font-medium text-lg">{activity.popularity}</span>
                          <FiTrendingUp className="ml-1 text-green-600" size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
      </div>

            {/* Sidebar for second half */}
            <div className="space-y-6">
              {/* My Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">My Activity</h3>
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                        stroke="#1d236b"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - sidebarStats.activityProgress / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-900">{sidebarStats.activityProgress}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Published</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Drafts</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Under review</span>
                </div>
        </div>
      </div>

            {/* Account Stability */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Stability</h3>
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#22c55e"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - sidebarStats.positiveRating / 100)}`}
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Positive rating</span>
                  </div>
                  <span className="text-sm font-medium">{sidebarStats.positiveRating}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Cancellation</span>
                  </div>
                  <span className="text-sm font-medium">{sidebarStats.cancellation}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Negative rating</span>
                  </div>
                  <span className="text-sm font-medium">{sidebarStats.negativeRating}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Know About us */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Know About us</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Explore */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Destinations</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Experiences</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Tours</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Activities</a></li>
              </ul>
            </div>
            
            {/* Help & Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Refund Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Safety Guidelines</a></li>
              </ul>
            </div>
            
            {/* Stay Connected */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
              <p className="text-gray-300 mb-4">Get travel deals & inspiration</p>
              <div className="flex mb-6">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
                  📧
                </button>
              </div>
              <div>
                <p className="text-gray-300 mb-2">Follow Us</p>
                <div className="flex space-x-3">
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">📱</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">💼</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">📘</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">🐦</a>
                </div>
                </div>
              </div>
        </div>
        
          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <span className="text-gray-300">Secure Booking</span>
                <span className="text-gray-300">10M+ Travels</span>
                <span className="text-gray-300">+1-800-Travel</span>
                <span className="text-gray-300">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <span>🌐</span>
                  <span>US English</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <span>$</span>
                  <span>$ USD - US Dollar</span>
            </button>
              </div>
            </div>
            <div className="mt-4 text-center text-gray-400">
              <p>©2025 TripAdora. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;