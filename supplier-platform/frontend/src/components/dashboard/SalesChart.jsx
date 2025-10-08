import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data = [] }) => {
  const defaultData = [
    { month: 'Jan', sales: 4000, orders: 240 },
    { month: 'Feb', sales: 3000, orders: 198 },
    { month: 'Mar', sales: 2000, orders: 980 },
    { month: 'Apr', sales: 2780, orders: 390 },
    { month: 'May', sales: 1890, orders: 480 },
    { month: 'Jun', sales: 2390, orders: 380 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={2} />
        <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;