import { createContext, useContext, useState } from 'react';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
  });

  const value = {
    selectedProduct,
    setSelectedProduct,
    filters,
    setFilters,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;