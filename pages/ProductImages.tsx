import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProductById, addProductImage, deleteProductImage } from '../lib/api';
import ImageUploader from '../components/ImageUploader';
import ImageGallery from '../components/ImageGallery';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Plus } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import MediaLibraryModal from '../components/modals/MediaLibraryModal';

interface ProductImagesProps {
  productId: string;
  onBack: () => void;
}

const ProductImages: React.FC<ProductImagesProps> = ({ productId, onBack }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleUpload = async (url: string) => {
    await addProductImage(productId, url);
    await fetchProduct();
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteProductImage(productId, deletingId);
      setDeletingId(null);
      await fetchProduct();
    }
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

      <div>
        <h2 className="text-2xl font-bold text-gray-800">Images: {product.name}</h2>
        <p className="text-sm text-gray-500 mt-1">Manage gallery, sort order, and variations</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Add New Image</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          Select from Media Library
        </button>
      </div>

      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleUpload}
        initialCategory="products"
      />

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Gallery ({product.images.length})</h3>
        <ImageGallery
          images={product.images}
          onDelete={setDeletingId}
        />
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        isDestructive={true}
      />
    </div>
  );
};

export default ProductImages;