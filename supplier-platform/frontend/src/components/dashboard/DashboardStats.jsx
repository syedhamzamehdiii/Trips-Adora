import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import Card from '@/components/common/Card';

const DashboardStats = ({ stats }) => {
  const statItems = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || '0',
      change: '+12%',
      icon: <FiPackage size={24} />,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || '0',
      change: '+8%',
      icon: <FiShoppingBag size={24} />,
      color: 'bg-green-500',
    },
    {
      title: 'Revenue',
      value: `$${stats?.revenue || '0'}`,
      change: '+15%',
      icon: <FiDollarSign size={24} />,
      color: 'bg-purple-500',
    },
    {
      title: 'Growth',
      value: `${stats?.growth || '0'}%`,
      change: '+5%',
      icon: <FiTrendingUp size={24} />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index} hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg text-white`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;