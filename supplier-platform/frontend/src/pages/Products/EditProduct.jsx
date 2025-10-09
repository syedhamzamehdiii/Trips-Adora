// Frontend/src/pages/Products/EditProduct.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';
import ProductForm from '@/components/products/ProductForm';
import ImageUploader from '@/components/products/ImageUploader';
import Loader from '@/components/common/Loader';
import { ROUTES } from '@/utils/constants';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (product?.images) {
      setImages(product.images.map((url, index) => ({
        id: index,
        preview: url,
        url,
      })));
    }
  }, [product]);

  const handleSubmit = async (data) => {
    const imageUrls = images.map(img => img.url || img.preview);
    await updateProduct.mutateAsync({
      id,
      data: { ...data, images: imageUrls },
    });
    navigate(ROUTES.PRODUCTS);
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">Update your product information</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images</h2>
        <ImageUploader images={images} onImagesChange={setImages} />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Information</h2>
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          loading={updateProduct.isLoading}
        />
      </div>
    </div>
  );
};

export default EditProduct;