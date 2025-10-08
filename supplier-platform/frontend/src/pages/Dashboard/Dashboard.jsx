import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { formatCurrency, formatNumber } from '@/utils/helpers';

const Dashboard = () => {
  // Mock data - will be replaced with API calls
  const stats = [
    {
      title: 'Total Products',
      value: '248',
      change: '+12%',
      icon: <FiPackage size={24} />,
      color: 'bg-blue-500',
      trend: 'up',
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8%',
      icon: <FiShoppingBag size={24} />,
      color: 'bg-green-500',
      trend: 'up',
    },
    {
      title: 'Revenue',
      value: formatCurrency(45678),
      change: '+15%',
      icon: <FiDollarSign size={24} />,
      color: 'bg-purple-500',
      trend: 'up',
    },
    {
      title: 'Growth',
      value: '23%',
      change: '+5%',
      icon: <FiTrendingUp size={24} />,
      color: 'bg-orange-500',
      trend: 'up',
    },
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      product: 'Wireless Headphones',
      amount: 129.99,
      status: 'Pending',
      date: '2025-10-08',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      product: 'Smart Watch',
      amount: 299.99,
      status: 'Confirmed',
      date: '2025-10-08',
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      product: 'Laptop Stand',
      amount: 49.99,
      status: 'Shipped',
      date: '2025-10-07',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'badge-warning',
      Confirmed: 'badge-info',
      Shipped: 'badge-success',
      Delivered: 'badge-success',
      Cancelled: 'badge-danger',
    };
    return colors[status] || 'badge-gray';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <Link to={ROUTES.PRODUCTS_CREATE}>
          <button className="btn btn-primary flex items-center gap-2">
            <FiPlus size={20} />
            Add New Product
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to={ROUTES.PRODUCTS_CREATE} className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
            <FiPackage size={32} className="text-primary-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Product</span>
          </Link>
          <Link to={ROUTES.ORDERS} className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <FiShoppingBag size={32} className="text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Orders</span>
          </Link>
          <Link to={ROUTES.MESSAGES} className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FiPackage size={32} className="text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Messages</span>
          </Link>
          <Link to={ROUTES.SETTINGS} className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <FiTrendingUp size={32} className="text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Analytics</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <Link to={ROUTES.ORDERS} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Order ID</th>
                <th className="table-header-cell">Customer</th>
                <th className="table-header-cell">Product</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Date</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="table-cell font-medium text-primary-600">{order.id}</td>
                  <td className="table-cell">{order.customer}</td>
                  <td className="table-cell">{order.product}</td>
                  <td className="table-cell">{formatCurrency(order.amount)}</td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;