import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Product, ProductStatus } from '../types';
import ProductTable from '../components/ProductTable';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Search, Filter, X } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { createProduct } from '../lib/api';

import ProductWizard from './ProductWizard';
import { useNotification } from '../contexts/NotificationContext';

interface ProductsProps {
  onNavigate?: (view: string, productId?: string) => void;
}

const Products: React.FC<ProductsProps> = ({ onNavigate }) => {
  const { products, loading, error, removeProduct, refresh } = useProducts();
  const { t } = useLanguage();
  const { addNotification } = useNotification();

  // Modal State
  const [deletingProduct, setDeletingProduct] = useState<Product | undefined>(undefined);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
    if (onNavigate) {
      onNavigate('product-wizard');
    }
  };

  const handleEdit = (product: Product) => {
    if (onNavigate) {
      onNavigate('product-wizard', product.id);
    }
  };

  const [cloningProduct, setCloningProduct] = useState<Product | null>(null);

  const handleCloneClick = (product: Product) => {
    setCloningProduct(product);
  };

  const handleCloneConfirm = async () => {
    if (!cloningProduct) return;
    try {
      const { id, ...rest } = cloningProduct;
      const newProduct = {
        ...rest,
        name: `${cloningProduct.name} ${t('products.clone_suffix')}`,
        slug: `${cloningProduct.slug}-copy-${Date.now()}`,
        status: ProductStatus.DRAFT
      };
      await createProduct(newProduct);
      refresh();
      setCloningProduct(null);
    } catch (error) {
      console.error("Clone failed", error);
      addNotification('error', t('products.clone_error'));
    }
  };

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('products.title')}</h2>
          <p className="text-gray-500 mt-1">{t('products.subtitle')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-green-200 active:scale-95"
        >
          <Plus size={20} />
          {t('products.add_new')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t('products.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-colors">
          <Filter size={18} />
          {t('common.filter')}
        </button>
      </div>

      <ProductTable
        products={filteredProducts}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onClone={handleCloneClick}
        onPreview={setPreviewProduct}
      />

      {/* Quick View Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            <button
              onClick={() => setPreviewProduct(null)}
              className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            >
              <X size={24} />
            </button>
            <div className="flex-1 overflow-y-auto">
              <ProductWizard productId={previewProduct.id} onBack={() => setPreviewProduct(null)} />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(undefined)}
        onConfirm={() => deletingProduct && removeProduct(deletingProduct.id)}
        title={t('products.delete_confirm_title')}
        message={t('products.delete_confirm_msg')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={!!cloningProduct}
        onClose={() => setCloningProduct(null)}
        onConfirm={handleCloneConfirm}
        title={t('products.clone_confirm_title') || 'Ürünü Kopyala'}
        message={t('products.clone_confirm').replace('{name}', cloningProduct?.name || '')}
        confirmText={t('products.copy')}
        cancelText={t('common.cancel')}
        isDestructive={false}
      />
    </div>
  );
};

export default Products;
