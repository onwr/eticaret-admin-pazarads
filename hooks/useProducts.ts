import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFormData } from '../types';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../lib/api';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (data: ProductFormData) => {
    try {
      const newProduct = await createProduct(data);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      throw new Error('Failed to create product');
    }
  };

  const editProduct = async (id: string, data: ProductFormData) => {
    try {
      const updated = await updateProduct(id, data);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      throw new Error('Failed to update product');
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw new Error('Failed to delete product');
    }
  };

  return {
    products,
    loading,
    error,
    refresh: fetchProducts,
    addProduct,
    editProduct,
    removeProduct
  };
};
