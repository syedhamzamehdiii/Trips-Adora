// Frontend/src/components/products/ProductCard.jsx
import { FiEdit, FiTrash2, FiShare2, FiEye } from 'react-icons/fi';
import { formatCurrency } from '@/utils/helpers';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';

const ProductCard = ({ product, onEdit, onDelete, onShare }) => {
  const getStatusVariant = (status) => {
    const variants = {
      Active: 'success',
      Inactive: 'gray',
      'Out of Stock': 'danger',
      Draft: 'warning',
    };
    return variants[status] || 'gray';
  };

  return (
    <Card hover>
      <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-100">
        <img
          src={product.image || product.images?.[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <Badge
          variant={getStatusVariant(product.status)}
          className="absolute top-2 right-2"
        >
          {product.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm text-gray-600">Stock: {product.stock}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onEdit?.(product)}
          className="flex-1 btn btn-outline text-sm py-2 flex items-center justify-center gap-1"
        >
          <FiEye size={16} />
          View
        </button>
        <button
          onClick={() => onEdit?.(product)}
          className="btn btn-secondary p-2"
        >
          <FiEdit size={16} />
        </button>
        <button
          onClick={() => onShare?.(product)}
          className="btn btn-secondary p-2"
        >
          <FiShare2 size={16} />
        </button>
        <button
          onClick={() => onDelete?.(product)}
          className="btn btn-secondary text-red-600 hover:bg-red-50 p-2"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </Card>
  );
};

export default ProductCard;
