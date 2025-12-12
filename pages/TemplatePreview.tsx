
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product, GeneralSettings } from '../types';
import { mockProducts } from '../utils/mockData';
import { getGeneralSettings } from '../lib/api';
import Template1 from '../components/landing/Template1';
import Template2 from '../components/landing/Template2';
import Template3 from '../components/landing/Template3';
import Template4 from '../components/landing/Template4';
import Template5 from '../components/landing/Template5';
import Template6 from '../components/landing/Template6';
import Template7 from '../components/landing/Template7';
import OrderFormModal from '../components/landing/OrderFormModal';
import { useNotification } from '../contexts/NotificationContext';

interface TemplatePreviewProps {
  templateId: string;
  onClose: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ templateId, onClose }) => {
  const { addNotification } = useNotification();
  // Use state for product to ensure it updates with the store
  const [product, setProduct] = useState<Product>(mockProducts[0]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch dynamic data to ensure edits are reflected
      const [settings, products] = await Promise.all([
        getGeneralSettings(),
        import('../lib/api').then(m => m.getProducts())
      ]);

      setGeneralSettings(settings);

      // Use the first active product (likely the one being edited)
      if (products.length > 0) {
        setProduct(products[0]);
      }
    };
    fetchData();
  }, [templateId]); // Re-fetch when template changes or on mount

  // Mock theme colors based on template
  const getThemeColor = (id: string) => {
    switch (id) {
      case 't1': return '#3B82F6';
      case 't2': return '#10B981';
      case 't3': return '#DC2626';
      case 't4': return '#2563EB';
      case 't5': return '#8B5CF6';
      case 't6': return '#EF4444';
      case 't7': return '#000000';
      default: return '#3B82F6';
    }
  };

  const themeColor = getThemeColor(templateId);

  const handleOpenOrder = () => {
    setIsOrderModalOpen(true);
  };

  if (!generalSettings) return <div>Loading...</div>;

  const renderTemplate = () => {
    const props = {
      product,
      onOpenOrder: handleOpenOrder,
      themeColor,
      generalSettings
    };

    switch (templateId) {
      case 't1': return <Template1 {...props} />;
      case 't2': return <Template2 {...props} />;
      case 't3': return <Template3 {...props} />;
      case 't4': return <Template4 {...props} />;
      case 't5': return <Template5 {...props} />;
      case 't6': return <Template6 {...props} />;
      case 't7': return <Template7 {...props} />;
      default: return <div className="p-10 text-center">Template not found</div>;
    }
  };

  // Determine form style based on template ID
  const getDesignVariant = (id: string): 'simple' | 'modern' | 'minimal' => {
    if (id === 't3' || id === 't4') return 'simple';
    if (id === 't7' || id === 't1') return 'minimal';
    return 'modern';
  }

  return (
    <div className="relative z-50 bg-white min-h-screen">
      {/* Floating Close Button */}
      <div className="fixed bottom-6 right-6 z-[100] flex gap-2">
        <div className="bg-black/80 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm text-sm font-medium flex items-center">
          Demo Preview Mode
        </div>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
          title="Close Preview"
        >
          <X size={24} />
        </button>
      </div>

      {renderTemplate()}

      <OrderFormModal
        product={product}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={() => addNotification('info', 'This is a demo order form.')}
        themeColor={themeColor}
        designVariant={getDesignVariant(templateId)}
      />
    </div>
  );
};

export default TemplatePreview;
