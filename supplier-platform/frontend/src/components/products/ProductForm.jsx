// Frontend/src/components/products/ProductForm.jsx
import { useForm } from 'react-hook-form';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { PRODUCT_CATEGORIES, CURRENCIES } from '@/utils/constants';

const ProductForm = ({ product, onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Product Name"
        placeholder="Enter product name"
        error={errors.name?.message}
        {...register('name', { required: 'Product name is required' })}
      />

      <div>
        <label className="form-label">Description</label>
        <textarea
          placeholder="Enter product description"
          rows="5"
          className={`input ${errors.description ? 'input-error' : ''}`}
          {...register('description', { required: 'Description is required' })}
        />
        {errors.description && (
          <p className="form-error">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Category"
          options={PRODUCT_CATEGORIES}
          error={errors.category?.message}
          {...register('category', { required: 'Category is required' })}
        />

        <Input
          label="SKU (Optional)"
          placeholder="Enter SKU"
          {...register('sku')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Price"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.price?.message}
          {...register('price', { required: 'Price is required' })}
        />

        <Input
          label="Compare Price"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('comparePrice')}
        />

        <Select
          label="Currency"
          options={CURRENCIES}
          {...register('currency')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Stock Quantity"
          type="number"
          placeholder="0"
          error={errors.stock?.message}
          {...register('stock', { required: 'Stock is required' })}
        />

        <Input
          label="Weight (kg)"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('weight')}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          Save Product
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;