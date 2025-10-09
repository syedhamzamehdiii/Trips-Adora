// Frontend/src/pages/Orders/Orders.jsx
import { useState } from 'react';
import { FiSearch, FiFilter, FiEye, FiDownload } from 'react-icons/fi';
import { formatCurrency, formatDate } from '@/utils/helpers';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const orders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      email: 'john@example.com',
      products: 'Wireless Headphones',
      amount: 129.99,
      status: 'Pending',
      date: '2025-10-08T10:30:00',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      products: 'Smart Watch, USB Cable',
      amount: 319.98,
      status: 'Confirmed',
      date: '2025-10-08T09:15:00',
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      products: 'Laptop Stand',
      amount: 49.99,
      status: 'Shipped',
      date: '2025-10-07T14:20:00',
    },
    {
      id: 'ORD-004',
      customer: 'Sarah Williams',
      email: 'sarah@example.com',
      products: 'Wireless Mouse, Keyboard',
      amount: 89.98,
      status: 'Delivered',
      date: '2025-10-06T11:45:00',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'badge-warning',
      Confirmed: 'badge-info',
      Processing: 'badge-info',
      Shipped: 'badge-success',
      Delivered: 'badge-success',
      Cancelled: 'badge-danger',
    };
    return colors[status] || 'badge-gray';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage and track your orders</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders by ID, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Export Button */}
          <button className="btn btn-secondary flex items-center gap-2">
            <FiDownload size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Order ID</th>
                <th className="table-header-cell">Customer</th>
                <th className="table-header-cell">Products</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="table-cell">
                    <span className="font-medium text-primary-600">{order.id}</span>
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="table-cell max-w-xs truncate">{order.products}</td>
                  <td className="table-cell font-semibold">{formatCurrency(order.amount)}</td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500">
                    {formatDate(order.date, 'MMM dd, yyyy')}
                  </td>
                  <td className="table-cell">
                    <button className="btn btn-outline text-sm py-1 px-3 flex items-center gap-1">
                      <FiEye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            Showing 1 to 4 of 1,234 orders
          </p>
          <div className="flex gap-2">
            <button className="btn btn-secondary px-4 py-2">Previous</button>
            <button className="btn btn-primary px-4 py-2">1</button>
            <button className="btn btn-secondary px-4 py-2">2</button>
            <button className="btn btn-secondary px-4 py-2">3</button>
            <button className="btn btn-secondary px-4 py-2">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;