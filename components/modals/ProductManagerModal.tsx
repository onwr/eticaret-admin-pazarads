
import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Image as ImageIcon, Tag, MessageSquare, Zap, Settings, Save, Loader2 } from 'lucide-react';
import { Product, ProductStatus } from '../../types';
import { createProduct, updateProduct } from '../../lib/api';
import { useLanguage } from '../../lib/i18n';

// Sub-components would be imported here or defined inline for brevity
import ProductForm from '../ProductForm';
import PriceTable from '../PriceTable';
import ImageGallery from '../ImageGallery';
import ImageUploader from '../ImageUploader';
import { addProductImage, deleteProductImage, addProductPrice, updateProductPrice, deleteProductPrice } from '../../lib/api';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product;
  onSave: () => void;
}

const ProductManagerModal: React.FC<ProductManagerModalProps> = ({ isOpen, onClose, initialProduct, onSave }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  const [product, setProduct] = useState<Partial<Product>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    } else {
      setProduct({
        name: '', slug: '', description: '', status: ProductStatus.DRAFT,
        prices: [], images: [], variants: [], reviews: []
      });
    }
    setActiveTab('general');
  }, [initialProduct, isOpen]);

  const handleGeneralSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (initialProduct) {
        await updateProduct(initialProduct.id, data);
      } else {
        const newP = await createProduct(data);
        setProduct(newP); // Update local state to have ID for next steps
      }
      onSave(); // Just refresh list, keep modal open if new?
      if (initialProduct) onClose(); // Close on edit save
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Quick handlers for sub-tabs (simplified for this modal) ---
  const handleImageUpload = async (url: string) => {
      if(!product.id) return alert("Save general info first.");
      await addProductImage(product.id, url);
      // In real app, re-fetch product data here
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Package },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'variants', label: 'Variants', icon: Tag },
    // Add more as needed
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
           <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                 {product.name || 'New Product'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">{product.id ? 'Editing Mode' : 'Creation Mode'}</p>
           </div>
           <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {tabs.map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                   }`}
                 >
                    <tab.icon size={18} />
                    {tab.label}
                 </button>
              ))}
           </nav>
           <div className="p-4 border-t border-gray-200">
              <button onClick={onClose} className="w-full py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">
                 Close
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
           <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'general' && (
                 <div className="max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">General Information</h3>
                    <ProductForm 
                       initialData={product as Product} 
                       onSubmit={handleGeneralSubmit} 
                       onCancel={onClose}
                       isSubmitting={isSubmitting}
                    />
                 </div>
              )}

              {activeTab === 'pricing' && (
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xl font-bold text-gray-800">Pricing Strategy</h3>
                       {!product.id && <p className="text-sm text-red-500">Save product first</p>}
                    </div>
                    {product.id ? (
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center text-blue-800">
                            Quick Pricing Editor Component Here (Reusing PricingTable logic)
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-400">Please create the product first.</div>
                    )}
                 </div>
              )}

              {activeTab === 'media' && (
                 <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800">Media Gallery</h3>
                    {product.id ? (
                        <>
                           <ImageUploader onUpload={handleImageUpload} />
                           {/* Simple mock display */}
                           <div className="grid grid-cols-4 gap-4">
                              {product.images?.map(img => (
                                 <img key={img.id} src={img.url} className="w-full aspect-square object-cover rounded-lg border" />
                              ))}
                           </div>
                        </>
                    ) : (
                        <div className="p-12 text-center text-gray-400">Please create the product first.</div>
                    )}
                 </div>
              )}
              
              {/* Other tabs placeholders */}
              {activeTab === 'variants' && <div className="p-12 text-center text-gray-400">Variants Manager (Coming Soon in Modal)</div>}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProductManagerModal;
