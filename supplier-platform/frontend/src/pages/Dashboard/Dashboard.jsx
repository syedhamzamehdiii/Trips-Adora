// Frontend/src/pages/Dashboard/Dashboard.jsx
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlus, FiClock, FiCheck, FiBell } from 'react-icons/fi';
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
      bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600',
    },
    {
      title: 'Cancellation rate',
      value: '0%',
      description: 'The percentage of bookings that were canceled.',
      bgColor: 'bg-gradient-to-br from-gray-400 to-gray-600',
    },
    {
      title: 'Fresh Reviews',
      value: '4.8',
      description: 'Booking canceled by you',
      bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
    },
    {
      title: "Today's balance",
      value: '$760',
      description: 'Amount earned and available for today.',
      bgColor: 'bg-gradient-to-br from-teal-400 to-teal-600',
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
    {
      title: 'Mount fuji 5th station tour by car with pickup',
      description: 'A highly demanded tour to Mount Fuji\'s 5th Station by private car with convenient pickup service. This experience has been one of the most popular choices among travelers in recent days.',
      popularity: '14.6%',
    },
    {
      title: 'Mount fuji 5th station tour by car with pickup',
      description: 'A highly demanded tour to Mount Fuji\'s 5th Station by private car with convenient pickup service. This experience has been one of the most popular choices among travelers in recent days.',
      popularity: '14.6%',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
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
                <a href="#" className="text-blue-600 text-sm font-medium">Home</a>
                <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium">FAQs</a>
                <a href="#" className="text-gray-700 hover:text-gray-900 text-sm font-medium">Support</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiBell className="w-5 h-5 text-gray-700" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">EN</span>
                <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              {/* User Profile Section */}
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg" style={{ backgroundColor: '#1d4ed8' }}>
                <div className="text-right text-white">
                  <div className="text-xs">Available Balance</div>
                  <div className="text-sm font-semibold">$1850</div>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"></div>
                <div className="text-white text-xs">
                  ID 00032123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-3">
            <a href="#" className="text-gray-900 border-b-2 border-blue-600 pb-3 text-sm font-medium">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 pb-3 text-sm font-medium transition-colors">Listings</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 pb-3 text-sm font-medium transition-colors">Availability</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 pb-3 text-sm font-medium transition-colors">Bookings</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 pb-3 text-sm font-medium transition-colors">Insights</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 pb-3 text-sm font-medium transition-colors">Finance</a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Banner with Background Image */}
            <div className="relative rounded-xl overflow-hidden h-80">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/assets/49f555cdd6a046078f7f2a1e0a835fc0c68a4e3a.jpg')`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
              </div>
              <div className="relative p-8 h-full flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="text-gray-800 block">Grow Your Business with</span>
                  <span className="text-white block text-5xl md:text-6xl">THE NEW HORIZON</span>
                </h1>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-md">
                    Create new product
                  </button>
                  <button className="text-white px-6 py-3 rounded-lg font-medium shadow-md" style={{ backgroundColor: '#1d4ed8' }}>
                    Active Product listing
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid - 4 cards in 2 rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className={`${stat.bgColor} rounded-xl shadow-lg p-6 text-white`}>
                  <h3 className="text-sm font-medium mb-2 opacity-90">{stat.title}</h3>
                  <p className="text-4xl font-bold mb-2">{stat.value}</p>
                  <p className="text-sm opacity-80 leading-relaxed">{stat.description}</p>
                </div>
              ))}
            </div>

            {/* Wrap Up Your Product Setup */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Wrap Up Your Product Setup</h2>
              <div className="space-y-4">
                {productSetupItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{item.date}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${item.progress}%`, 
                            backgroundColor: '#1d4ed8' 
                          }}
                        ></div>
                      </div>
                    </div>
                    <button className="text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap" style={{ backgroundColor: '#1d4ed8' }}>
                      <span>Continue</span>
                      <FiCheck size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Popular Activities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Most Popular Activities</h2>
              <div className="space-y-4">
                {popularActivities.map((activity, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{activity.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                      </div>
                      <div className="flex items-center ml-4 text-green-600">
                        <FiTrendingUp size={20} className="mr-1" />
                        <span className="font-semibold text-lg">{activity.popularity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-xl p-6 text-white sticky top-6">
              {/* Supplier Mode Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Supplier mode</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="mb-6 pb-6 border-b border-blue-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold">Edward William</p>
                    <p className="text-sm text-blue-200">Notting Hill, London</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm">Karwan Tours</span>
                  <FiCheck className="ml-2 text-green-400" size={16} />
                </div>
              </div>

              {/* Booking Stats */}
              <div className="mb-6 space-y-3">
                <div>
                  <p className="text-sm text-blue-200 mb-1">Today's bookings</p>
                  <p className="font-medium">18 <span className="text-green-400">New Active</span></p>
                </div>
                <div>
                  <p className="text-sm text-blue-200 mb-1">Tomorrow's bookings</p>
                  <p className="font-medium">24 <span className="text-green-400">Confirmed</span></p>
                </div>
              </div>

              {/* My Activity Chart */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">My Activity</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="#ffffff"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - 60 / 100)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-semibold">60%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-sm">Published</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-sm">Drafts</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                      <span className="text-sm">Under review</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Stability */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Account Stability</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      {/* Green segment - 70% */}
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="#22c55e"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 32 * 0.7} ${2 * Math.PI * 32 * 0.3}`}
                        strokeDashoffset="0"
                      />
                      {/* Orange segment - 18% */}
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="#f59e0b"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 32 * 0.18} ${2 * Math.PI * 32 * 0.82}`}
                        strokeDashoffset={`${-2 * Math.PI * 32 * 0.7}`}
                      />
                      {/* Red segment - 12% */}
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="#ef4444"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 32 * 0.12} ${2 * Math.PI * 32 * 0.88}`}
                        strokeDashoffset={`${-2 * Math.PI * 32 * 0.88}`}
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm">Positive rating</span>
                      </div>
                      <span className="text-sm font-medium ml-4">70%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                        <span className="text-sm">Cancellation</span>
                      </div>
                      <span className="text-sm font-medium ml-4">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                        <span className="text-sm">Negative rating</span>
                      </div>
                      <span className="text-sm font-medium ml-4">12%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
                Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12 mt-12">
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
              </ul>
            </div>
            
            {/* Stay Connected */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
              <p className="text-gray-300 mb-4 text-sm">Get travel deals & inspiration</p>
              <div className="flex mb-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>©2025 TripAdora. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;