
import React, { useState, useEffect } from 'react';
import { getOrderById, processPayment } from '../lib/api';
import { Order, PaymentProvider, CreditCardForm } from '../types';
import PaymentForm from '../components/PaymentForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface PaymentPageProps {
  orderId?: string; // If embedded
}

const PaymentPage: React.FC<PaymentPageProps> = ({ orderId: propOrderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [provider, setProvider] = useState<PaymentProvider>(PaymentProvider.PAYTR);

  // Parse ID from URL manually if not passed as prop (for mock router)
  const urlParts = window.location.pathname.split('/');
  const routeOrderId = urlParts[urlParts.length - 1] && urlParts[urlParts.length - 1] !== 'payment' ? urlParts[urlParts.length - 1] : null;
  const effectiveOrderId = propOrderId || routeOrderId;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!effectiveOrderId) {
        setError('Invalid Order ID');
        setLoading(false);
        return;
      }
      try {
        const data = await getOrderById(effectiveOrderId);
        if (data) {
          setOrder(data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [effectiveOrderId]);

  const { addNotification } = useNotification();

  const handlePaymentSubmit = async (cardData: CreditCardForm) => {
    if (!order) return;
    setIsProcessing(true);
    try {
      await processPayment(order.id, cardData, provider);
      // Redirect to thank you page
      // In a real app with react-router: navigate(...)
      // For mock: force refresh to new route
      window.location.href = `/thank-you/${order.id}`;
    } catch (err) {
      addNotification('error', 'Payment Failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size={48} /></div>;
  if (error || !order) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center text-gray-500 hover:text-gray-800">
            <ArrowLeft size={18} className="mr-1" /> Back
          </button>
          <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
            <ShieldCheck size={16} /> Secure Checkout
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Order Summary</h2>

              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={order.product?.images[0]?.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{order.product?.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{order.variantSelection}</p>
                  <p className="text-sm text-gray-500">Qty: {order.items?.[0]?.quantity || 1}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Provider Selection (Mock) */}
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway (Debug)</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as PaymentProvider)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value={PaymentProvider.PAYTR}>PayTR</option>
                <option value={PaymentProvider.IYZICO}>Iyzico</option>
                <option value={PaymentProvider.STRIPE}>Stripe</option>
              </select>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <PaymentForm
              amount={order.totalAmount}
              onSubmit={handlePaymentSubmit}
              isProcessing={isProcessing}
              providerName={provider}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
