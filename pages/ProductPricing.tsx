import React, { useState, useEffect } from 'react';
import { Product, ProductPrice, PriceFormData } from '../types';
import { getProductById, addProductPrice, updateProductPrice, deleteProductPrice } from '../lib/api';
import PriceTable from '../components/PriceTable';
import PriceModal from '../components/modals/PriceModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, ArrowLeft } from 'lucide-react';

interface ProductPricingProps {
  productId: string;
  onBack: () => void;
}

const ProductPricing: React.FC<ProductPricingProps> = ({ productId, onBack }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ProductPrice | undefined>(undefined);
  const [deletingPrice, setDeletingPrice] = useState<ProductPrice | undefined>(undefined);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await getProductById(productId);
      setProduct(data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const handleCreate = () => {
    setEditingPrice(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (price: ProductPrice) => {
    setEditingPrice(price);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingPrice) {
      await deleteProductPrice(productId, deletingPrice.id);
      setDeletingPrice(undefined);
      fetchProduct();
    }
  };

  const handleModalSubmit = async (data: PriceFormData) => {
    if (editingPrice) {
      await updateProductPrice(productId, editingPrice.id, data);
    } else {
      await addProductPrice(productId, data);
    }
    fetchProduct();
  };

  if (loading) return <LoadingSpinner size={40} className="h-96" />;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Products
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pricing: {product.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Manage bulk pricing and discounts</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Price Tier
        </button>
      </div>

      <PriceTable 
        prices={product.prices}
        onEdit={handleEdit}
        onDelete={setDeletingPrice}
      />

      <PriceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingPrice}
      />

      <ConfirmDialog
        isOpen={!!deletingPrice}
        onClose={() => setDeletingPrice(undefined)}
        onConfirm={handleDelete}
        title="Delete Price"
        message="Are you sure you want to delete this price option?"
        isDestructive={true}
      />
    </div>
  );
};

export default ProductPricing;