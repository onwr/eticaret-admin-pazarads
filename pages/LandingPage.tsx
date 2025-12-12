
import React, { useState, useEffect } from 'react';
import { Domain } from '../types';
import { getDomains } from '../lib/api';
import OrderFormModal from '../components/landing/OrderFormModal';
import LoadingSpinner from '../components/LoadingSpinner';

// Import Templates
import Template1 from '../components/landing/Template1';
import Template2 from '../components/landing/Template2';
import Template3 from '../components/landing/Template3';
import Template4 from '../components/landing/Template4';
import Template5 from '../components/landing/Template5';
import Template6 from '../components/landing/Template6';
import Template7 from '../components/landing/Template7';

interface LandingPageProps {
  domainName: string; // Passed from router or extracted from URL
  onOrderSuccess?: (orderId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ domainName, onOrderSuccess }) => {
  const [domainData, setDomainData] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const domains = await getDomains();
        const found = domains.find(d => d.domain === decodeURIComponent(domainName));
        
        if (found) {
          setDomainData(found);
        } else {
          setError('Domain not configured in system.');
        }
      } catch (err) {
        setError('Failed to load landing page configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [domainName]);

  // Simulate Pixel Firing on Mount
  useEffect(() => {
    if (domainData?.product?.marketing) {
        const { facebookPixelId, tiktokPixelId, googleAnalyticsId } = domainData.product.marketing;
        
        if (facebookPixelId) {
            console.log(`[FB Pixel] Initialized ${facebookPixelId} & Fired PageView`);
        }
        if (tiktokPixelId) {
            console.log(`[TikTok Pixel] Initialized ${tiktokPixelId} & Fired PageView`);
        }
        if (googleAnalyticsId) {
            console.log(`[GA] Initialized ${googleAnalyticsId} & Fired PageView`);
        }
    }
  }, [domainData]);

  const handleOpenOrder = () => {
    // Fire 'InitiateCheckout' Pixel
    if (domainData?.product?.marketing?.facebookPixelId) {
        console.log(`[FB Pixel] Fired InitiateCheckout`);
    }
    setIsOrderModalOpen(true);
  };

  const renderTemplate = () => {
    if (!domainData || !domainData.product) return null;

    const props = {
      product: domainData.product,
      onOpenOrder: handleOpenOrder,
      themeColor: domainData.themeColor
    };

    switch (domainData.templateId) {
      case 't1': return <Template1 {...props} />;
      case 't2': return <Template2 {...props} />;
      case 't3': return <Template3 {...props} />; 
      case 't4': return <Template4 {...props} />; 
      case 't5': return <Template5 {...props} />; 
      case 't6': return <Template6 {...props} />; 
      case 't7': return <Template7 {...props} />; 
      default: return <Template1 {...props} />;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><LoadingSpinner size={48} /></div>;
  
  if (error || !domainData || !domainData.product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <h1 className="text-4xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-gray-500">{error || 'Site not found'}</p>
        <button onClick={() => window.location.href = '/'} className="mt-8 text-blue-500 underline">Return to Admin</button>
      </div>
    );
  }

  return (
    <div className="antialiased scroll-smooth">
      {renderTemplate()}

      <OrderFormModal
        product={domainData.product}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={(orderId) => {
            setIsOrderModalOpen(false);
            // Fire 'Purchase' Pixel
            if (domainData?.product?.marketing?.facebookPixelId) {
                console.log(`[FB Pixel] Fired Purchase for Order ${orderId}`);
            }
            if (onOrderSuccess) {
                onOrderSuccess(orderId);
            }
        }}
        themeColor={domainData.themeColor}
      />
    </div>
  );
};

export default LandingPage;
