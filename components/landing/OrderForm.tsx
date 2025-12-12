import React, { useState } from 'react';
import { X, Check, Loader2, Phone, User, MapPin } from 'lucide-react';
import { Product, ProductPrice } from '../../types';

interface OrderFormProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ product, isOpen, onClose, themeColor = '#3B82F6' }) => {
  const [selectedPrice, setSelectedPrice] = useState<string>(product.prices[0]?.id || '');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
        setIsSuccess(false);
        onClose();
    }, 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isSuccess) {
     return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full animate-fade-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Order Received!</h3>
                <p className="text-gray-500 mt-2">Thank you, {formData.name}. We will contact you shortly to confirm your order.</p>
            </div>
        </div>
     );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-transform duration-300 transform translate-y-0"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking form
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Complete Your Order</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Product Summary */}
          <div className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
             <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-200">
                <img src={product.images[0]?.url} alt="" className="w-full h-full object-cover" />
             </div>
             <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.shortDescription}</p>
             </div>
          </div>

          <form id="order-form" onSubmit={handleSubmit} className="space-y-5">
             {/* Price Selection */}
             <div className="space-y-3">
               <label className="text-sm font-medium text-gray-700 block">Select Offer</label>
               {product.prices.map((price) => (
                 <label 
                   key={price.id} 
                   className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                     selectedPrice === price.id 
                       ? `border-[${themeColor}] ring-1 ring-[${themeColor}] bg-blue-50/50` 
                       : 'border-gray-200 hover:border-gray-300'
                   }`}
                   style={selectedPrice === price.id ? { borderColor: themeColor, backgroundColor: `${themeColor}10` } : {}}
                 >
                   <div className="flex items-center gap-3">
                     <input 
                       type="radio" 
                       name="price" 
                       checked={selectedPrice === price.id} 
                       onChange={() => setSelectedPrice(price.id)}
                       className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <div>
                       <span className="font-bold text-gray-900 block">
                         {price.quantity === 1 ? '1 Pack' : `${price.quantity} Packs`}
                       </span>
                       {price.originalPrice && (
                         <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                           Save {Math.round(((price.originalPrice - price.price) / price.originalPrice) * 100)}%
                         </span>
                       )}
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="font-bold text-lg" style={{ color: themeColor }}>${price.price}</div>
                     {price.originalPrice && (
                       <div className="text-sm text-gray-400 line-through">${price.originalPrice}</div>
                     )}
                   </div>
                 </label>
               ))}
             </div>

             {/* Customer Info */}
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea 
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder="Street address, City, ZIP code"
                    />
                  </div>
               </div>
             </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            form="order-form"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: themeColor }}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Order - Pay on Delivery'}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
             Secure 256-bit SSL Encrypted Payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;