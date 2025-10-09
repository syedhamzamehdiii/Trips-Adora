// Frontend/src/components/dashboard/QuickActions.jsx
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';
import { ROUTES } from '@/utils/constants';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add Product',
      icon: <FiPackage size={32} />,
      link: ROUTES.PRODUCTS_CREATE,
      color: 'bg-primary-50 hover:bg-primary-100 text-primary-600',
    },
    {
      title: 'View Orders',
      icon: <FiShoppingBag size={32} />,
      link: ROUTES.ORDERS,
      color: 'bg-green-50 hover:bg-green-100 text-green-600',
    },
    {
      title: 'Messages',
      icon: <FiMessageSquare size={32} />,
      link: ROUTES.MESSAGES,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
    },
    {
      title: 'Analytics',
      icon: <FiTrendingUp size={32} />,
      link: ROUTES.DASHBOARD,
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link
          key={index}
          to={action.link}
          className={`flex flex-col items-center p-4 rounded-lg transition-colors ${action.color}`}
        >
          {action.icon}
          <span className="text-sm font-medium mt-2">{action.title}</span>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;