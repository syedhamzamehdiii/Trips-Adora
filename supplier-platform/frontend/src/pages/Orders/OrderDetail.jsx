// Frontend/src/pages/Orders/OrderDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useOrder } from '@/hooks/useOrders';
import OrderDetails from '@/components/orders/OrderDetails';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { ROUTES } from '@/utils/constants';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="secondary"
          icon={<FiArrowLeft size={18} />}
          onClick={() => navigate(ROUTES.ORDERS)}
        >
          Back to Orders
        </Button>
      </div>

      <div className="card">
        <OrderDetails order={order} />
      </div>
    </div>
  );
};

export default OrderDetail;