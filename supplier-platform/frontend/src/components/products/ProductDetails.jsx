// Frontend/src/components/products/ProductDetails.jsx
import { formatCurrency, formatDate } from '@/utils/helpers';
import Badge from '@/components/common/Badge';

const ProductDetails = ({ product }) => {
  if (!product) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img
            src={product.image || product.images?.[0]}
            alt={product.name}
            className="w-full rounded-lg"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <Badge variant="success" className="mt-2">{product.status}</Badge>
          </div>

          <div className="text-3xl font-bold text-primary-600">
            {formatCurrency(product.price)}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-medium">{product.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock</p>
              <p className="font-medium">{product.stock}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">SKU</p>
              <p className="font-medium">{product.sku || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Views</p>
              <p className="font-medium">{product.views || 0}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">
              Created: {formatDate(product.createdAt, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
