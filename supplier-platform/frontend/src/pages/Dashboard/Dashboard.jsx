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
              <div className="w-5 h-5 text-gray-600">🔔</div>
              <div className="w-5 h-5 text-gray-600">⏰</div>
              <div className="w-5 h-5 text-gray-600">🌐</div>
              <select className="bg-white text-gray-700 border border-gray-300 rounded px-2 py-1">
                <option>EN</option>
              </select>
              <span className="text-sm text-gray-700">Available Balance $1850</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-700">ID 00032123</span>
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-2">
                <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Dashboard</a>
                <a href="#" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">Listings</a>
                <a href="#" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">Availability</a>
                <a href="#" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">Bookings</a>
                <a href="#" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">Insights</a>
                <a href="#" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">Finance</a>
              </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
                    {/* Hero Banner with Desert Background */}
                    <div className="relative rounded-xl overflow-hidden h-64">
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSIzMDAiIHZpZXdCb3g9IjAgMCAxMjAwIDMwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGN0ZBIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImRlc2VydCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNENjQ5MzAiIHN0b3Atb3BhY2l0eT0iMSIvPgo8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI0U2QTQ4NyIgc3RvcC1vcGFjaXR5PSIxIi8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0Y0QjQ5MCIgc3RvcC1vcGFjaXR5PSIxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2Rlc2VydCkiLz4KPC9zdmc+')`,
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      <div className="relative p-8 text-white h-full flex flex-col justify-center">
                        <h1 className="text-4xl font-bold mb-6">
                          Grow Your Business with{' '}
                          <span className="text-yellow-300">THE NEW HORIZON</span>
                        </h1>
                        <div className="flex space-x-4">
                          <button className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-opacity-30 transition-all border border-white border-opacity-30">
                            Create new product
                          </button>
                          <button className="bg-white bg-opacity-10 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-opacity-20 transition-all">
                            Active Product listing
                          </button>
                        </div>
                      </div>
      </div>

      {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
              ))}
            </div>

            {/* Product Setup Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Wrap Up Your Product Setup</h2>
              <div className="space-y-4">
                {productSetupItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.date}</p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Continue
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
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <div className="flex items-center ml-4">
                        <span className="text-green-600 font-medium">{activity.popularity}</span>
                        <FiTrendingUp className="ml-1 text-green-600" size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Supplier Mode Toggle */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Supplier mode</span>
                        <div className="w-12 h-6 bg-green-500 rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                        </div>
                      </div>
                    </div>

                    {/* Supplier Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Supplier Information</h3>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">Edward William</p>
                        <p className="text-sm text-gray-600">Notting Hill, London</p>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Karwan Tours</span>
                          <FiCheck className="ml-2 text-green-600" size={16} />
                        </div>
                      </div>
                    </div>

            {/* Booking Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Statistics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Today's bookings</p>
                  <p className="font-medium text-gray-900">{sidebarStats.todayBookings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tomorrow's bookings</p>
                  <p className="font-medium text-gray-900">{sidebarStats.tomorrowBookings}</p>
                </div>
              </div>
      </div>

            {/* Activity Chart */}
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
                      stroke="#3b82f6"
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
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Published</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
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
        
            {/* Help Button */}
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;