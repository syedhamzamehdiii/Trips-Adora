import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useProduct, useDeleteProduct } from '@/hooks/useProducts';
import ProductDetails from '@/components/products/ProductDetails';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { ROUTES } from '@/utils/constants';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(id);
      navigate(ROUTES.PRODUCTS);
    }
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          icon={<FiArrowLeft size={18} />}
          onClick={() => navigate(ROUTES.PRODUCTS)}
        >
          Back to Products
        </Button>

        <div className="flex gap-2">
          <Button
            variant="primary"
            icon={<FiEdit size={18} />}
            onClick={() => navigate(`${ROUTES.PRODUCTS}/edit/${id}`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            icon={<FiTrash2 size={18} />}
            onClick={handleDelete}
            loading={deleteProduct.isLoading}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="card">
        <ProductDetails product={product} />
      </div>
    </div>
  );
};

export default ProductDetail;