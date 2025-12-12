
import React, { useEffect, useState } from 'react';
import { CheckCircle, Phone, ArrowLeft, Package, MapPin, Printer, Copy, Share2, Edit2, Truck } from 'lucide-react';
import { getOrderById, getProducts } from '../lib/api';
import { Order, Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import UpsellSection from '../components/landing/UpsellSection';
import { useNotification } from '../contexts/NotificationContext';

interface ThankYouProps {
  orderId: string;
}

const ThankYou: React.FC<ThankYouProps> = ({ orderId }) => {
  const { addNotification } = useNotification();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [upsellProducts, setUpsellProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(true); // Mock "grace period" state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);

        if (orderData) {
          const allProducts = await getProducts();
          setUpsellProducts(allProducts.filter(p => p.id !== orderData.productId).slice(0, 2));
        }
      } catch (error) {
        console.error("Failed to load order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Mock timer for edit grace period
    const timer = setTimeout(() => setCanEdit(false), 10 * 60 * 1000); // 10 minutes
    return () => clearTimeout(timer);
  }, [orderId]);

  const handleCopyTracking = () => {
    const trackingUrl = `${window.location.origin}/tracking/${order?.orderNumber}`;
    navigator.clipboard.writeText(trackingUrl);
    addNotification('success', 'Kargo takip linki kopyalandı!');
  };

  const handleShare = async () => {
    const trackingUrl = `${window.location.origin}/tracking/${order?.orderNumber}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sipariş Takibi',
          text: `Siparişimi takip et: ${order?.orderNumber}`,
          url: trackingUrl,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      handleCopyTracking();
    }
  };

  const handleEditAddress = () => {
    addNotification('info', 'Adres düzenleme penceresi açılıyor... (Demo: Bu özellik şu an sadece simülasyon)');
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size={48} /></div>;

  if (!order) return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h1>
      <p className="text-gray-500">Sipariş detaylarına ulaşılamadı.</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-blue-600">Tekrar Dene</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-green-600 p-8 text-center text-white">
            <div className="w-16 h-16 bg-white text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Teşekkürler!</h1>
            <p className="text-green-100 text-lg">Siparişiniz başarıyla alındı.</p>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-6 gap-4">
              <div>
                <p className="text-sm text-gray-500">Sipariş Numarası</p>
                <p className="text-xl font-mono font-bold text-gray-900">#{order.orderNumber}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
              >
                <Printer size={16} /> Yazdır
              </button>
            </div>

            {/* Tracking Link Section */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <Truck size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900">Kargo Takibi</h4>
                  <p className="text-sm text-blue-700 mb-3">Siparişinizin durumunu bu linkten takip edebilirsiniz.</p>

                  <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg p-2">
                    <code className="flex-1 text-xs text-gray-600 font-mono truncate">
                      {window.location.origin}/tracking/{order.orderNumber}
                    </code>
                    <button onClick={handleCopyTracking} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500" title="Kopyala">
                      <Copy size={16} />
                    </button>
                    <button onClick={handleShare} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500" title="Paylaş">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package size={18} className="text-blue-500" />
                  Sipariş Özeti
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{order.product?.name}</span>
                    <span className="font-bold">{order.totalAmount} TL</span>
                  </div>
                  {order.variantSelection && (
                    <p className="text-sm text-gray-500 mb-1">Seçim: {order.variantSelection}</p>
                  )}
                  <p className="text-sm text-gray-500">Ödeme: <span className="uppercase">{order.paymentMethod}</span></p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={18} className="text-red-500" />
                    Teslimat Bilgileri
                  </h3>
                  {canEdit && (
                    <button onClick={handleEditAddress} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                      <Edit2 size={12} /> Düzenle
                    </button>
                  )}
                </div>
                <div className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100 relative">
                  {canEdit && <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Düzenlenebilir"></span>}
                  <p className="font-medium text-gray-900">{order.customer?.name}</p>
                  <p>{order.customer?.address}</p>
                  <p>{order.customer?.district}, {order.customer?.city}</p>
                  <p>{order.customer?.phone}</p>
                </div>
                {canEdit && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    * Adres bilgilerini siparişten sonraki 10 dakika içinde güncelleyebilirsiniz.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 text-center">Yardıma mı ihtiyacınız var?</h4>
              {order.product?.whatsappNumber && (
                <a
                  href={`https://wa.me/${order.product.whatsappNumber.replace('+', '')}?text=Merhaba, siparişim (${order.orderNumber}) hakkında bilgi almak istiyorum.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                >
                  <Phone size={20} />
                  WhatsApp Destek Hattı
                </a>
              )}
            </div>

            <UpsellSection products={upsellProducts} />

          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-gray-900 text-sm flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={16} /> Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
