import React, { useState, useEffect } from 'react';
import { Product, ProductReview, ReviewFormData } from '../types';
import { getProductById, addProductReview, updateProductReview, deleteProductReview } from '../lib/api';
import ReviewCard from '../components/ReviewCard';
import ReviewModal from '../components/modals/ReviewModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { ArrowLeft, Plus } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  onBack: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, onBack }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | undefined>(undefined);
  const [deletingReview, setDeletingReview] = useState<ProductReview | undefined>(undefined);

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
    setEditingReview(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (review: ProductReview) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingReview) {
      await deleteProductReview(productId, deletingReview.id);
      setDeletingReview(undefined);
      fetchProduct();
    }
  };

  const handleModalSubmit = async (data: ReviewFormData) => {
    if (editingReview) {
      await updateProductReview(productId, editingReview.id, data);
    } else {
      await addProductReview(productId, data);
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
          <h2 className="text-2xl font-bold text-gray-800">Reviews: {product.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Moderate customer feedback and ratings</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Manual Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {product.reviews.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
             No reviews yet. 
          </div>
        ) : (
          product.reviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onEdit={handleEdit} 
              onDelete={setDeletingReview} 
            />
          ))
        )}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingReview}
      />

      <ConfirmDialog
        isOpen={!!deletingReview}
        onClose={() => setDeletingReview(undefined)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        isDestructive={true}
      />
    </div>
  );
};

export default ProductReviews;