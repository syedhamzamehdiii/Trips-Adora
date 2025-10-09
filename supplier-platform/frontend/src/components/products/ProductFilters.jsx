// Frontend/src/components/products/ProductFilters.jsx
import { FiSearch, FiFilter } from 'react-icons/fi';
import Select from '@/components/common/Select';

const ProductFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="input pl-10"
        />
      </div>

      <Select
        options={[
          { value: 'all', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'out-of-stock', label: 'Out of Stock' },
          { value: 'draft', label: 'Draft' },
        ]}
        value={filters.status || 'all'}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        className="w-full md:w-48"
      />

      <button className="btn btn-secondary flex items-center gap-2">
        <FiFilter size={20} />
        More Filters
      </button>
    </div>
  );
};

export default ProductFilters;