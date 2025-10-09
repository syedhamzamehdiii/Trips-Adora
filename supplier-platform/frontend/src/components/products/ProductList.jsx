// Frontend/src/components/products/ProductList.jsx
import ProductCard from './ProductCard';
import EmptyState from '@/components/common/EmptyState';
import { FiPackage } from 'react-icons/fi';

const ProductList = ({ products = [], onEdit, onDelete, onShare }) => {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<FiPackage size={64} />}
        title="No products found"
        description="Start by creating your first product"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
        />
      ))}
    </div>
  );
};

export default ProductList;