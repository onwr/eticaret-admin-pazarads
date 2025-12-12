import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, VariantFormData } from '../types';
import { getProductById, addProductVariant, updateProductVariant, deleteProductVariant } from '../lib/api';
import VariantModal from '../components/modals/VariantModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, ArrowLeft, Layers, Edit2, Trash2 } from 'lucide-react';

interface ProductVariantsProps {
  productId: string;
  onBack: () => void;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({ productId, onBack }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>(undefined);
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | undefined>(undefined);

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
    setEditingVariant(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingVariant) {
      await deleteProductVariant(productId, deletingVariant.id);
      setDeletingVariant(undefined);
      fetchProduct();
    }
  };

  const handleModalSubmit = async (data: VariantFormData) => {
    if (editingVariant) {
      await updateProductVariant(productId, editingVariant.id, data);
    } else {
      await addProductVariant(productId, data);
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
          <h2 className="text-2xl font-bold text-gray-800">Variants: {product.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Manage colors, sizes, and other options</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Variant Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {product.variants.length === 0 ? (
           <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
             No variants found. Add a new variant group (e.g. Color) to get started.
           </div>
        ) : (
          product.variants.map((variant) => (
            <div key={variant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{variant.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">Type: {variant.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                     <button 
                       onClick={() => handleEdit(variant)} 
                       className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                     >
                       <Edit2 size={16} />
                     </button>
                     <button 
                        onClick={() => setDeletingVariant(variant)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                       <Trash2 size={16} />
                     </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {variant.values.map((val, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <VariantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingVariant}
      />

      <ConfirmDialog
        isOpen={!!deletingVariant}
        onClose={() => setDeletingVariant(undefined)}
        onConfirm={handleDelete}
        title="Delete Variant"
        message="Are you sure you want to delete this variant group? All selections associated with it will be removed."
        isDestructive={true}
      />
    </div>
  );
};

export default ProductVariants;