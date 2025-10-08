import { formatCurrency, formatDate } from '@/utils/helpers';
import Badge from '@/components/common/Badge';

const RecentOrders = ({ orders = [] }) => {
  const getStatusVariant = (status) => {
    const variants = {
      Pending: 'warning',
      Confirmed: 'info',
      Shipped: 'success',
      Delivered: 'success',
      Cancelled: 'danger',
    };
    return variants[status] || 'gray';
  };

  return (
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
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="table-cell font-medium text-primary-600">{order.id}</td>
              <td className="table-cell">{order.customer}</td>
              <td className="table-cell">{order.product}</td>
              <td className="table-cell">{formatCurrency(order.amount)}</td>
              <td className="table-cell">
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status}
                </Badge>
              </td>
              <td className="table-cell text-gray-500">
                {formatDate(order.date, 'MMM dd, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;
