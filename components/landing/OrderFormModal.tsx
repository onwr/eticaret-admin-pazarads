
import React, { useState, useEffect } from 'react';
import { X, Loader2, ChevronRight, CreditCard, Banknote, ShieldCheck, Gift } from 'lucide-react';
import { Product, Upsell } from '../../types';
import { createPublicOrder, getUpsells } from '../../lib/api';

// --- MOCK CITY DATA FOR DROPDOWN ---
const TURKEY_CITIES = ["Adana", "Ankara", "Antalya", "Bursa", "Diyarbakır", "Erzurum", "Gaziantep", "İstanbul", "İzmir", "Konya", "Trabzon", "Şanlıurfa", "Van"];
// In a real app, this would be a full list or an API call

interface OrderFormModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  themeColor?: string;
  designVariant?: 'simple' | 'modern' | 'minimal';
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
  themeColor = '#3B82F6',
  designVariant = 'modern' // Default to modern
}) => {
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CREDIT_CARD'>('COD');

  // Upsell State
  const [activeUpsell, setActiveUpsell] = useState<Upsell | null>(null);
  const [isUpsellAdded, setIsUpsellAdded] = useState(false);

  // Dynamic form state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Sorted and filtered fields
  const fields = product.checkoutConfig?.fields
    .filter(f => f.isVisible)
    .sort((a, b) => a.order - b.order) || [];

  // Config for City Selection
  const useCityDropdown = product.checkoutConfig?.cityDistrictSelection === 'dropdown';

  useEffect(() => {
    if (product.prices.length > 0) {
      setSelectedPrice(product.prices[0].id);
    }
    // Default to COD (Kapıda Ödeme) if available
    if (product.checkoutConfig?.paymentMethods?.cod_cash || product.checkoutConfig?.paymentMethods?.cod_card) {
      setPaymentMethod('COD');
    }

    // Load related upsell if any
    const loadUpsells = async () => {
      const allUpsells = await getUpsells();
      // Find an upsell triggered by this product
      const relevant = allUpsells.find(u => u.isActive && u.triggerProductIds.includes(product.id));
      if (relevant) setActiveUpsell(relevant);
    };
    loadUpsells();

    // PIXEL: InitiateCheckout
    console.log('FB PIXEL: InitiateCheckout', { content_ids: [product.id], content_name: product.name });
  }, [product]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleVariantSelect = (variantName: string, value: string) => {
    setSelectedVariant(prev => ({ ...prev, [variantName]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate Dynamic Fields
    fields.forEach(field => {
      // Logic for City/District overrides
      if (useCityDropdown && (field.key === 'city' || field.key === 'district')) {
        if (field.isRequired && (!formData[field.key] || formData[field.key] === '')) {
          newErrors[field.key] = `${field.label} seçiniz`;
          isValid = false;
        }
      } else {
        if (field.isRequired && (!formData[field.key] || formData[field.key].trim() === '')) {
          newErrors[field.key] = `${field.label} gerekli`;
          isValid = false;
        }
      }

      // Basic phone check
      if (field.key === 'phone' && field.isRequired && formData[field.key]?.length < 10) {
        newErrors[field.key] = 'Geçerli bir telefon numarası giriniz';
        isValid = false;
      }
    });

    // Validate Price
    if (!selectedPrice) {
      newErrors['price'] = 'Lütfen bir paket seçiniz';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const variantSelectionString = Object.entries(selectedVariant)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');

      const orderPayload: any = {
        productId: product.id,
        priceId: selectedPrice,
        variantSelection: variantSelectionString,
        paymentMethod,
        name: formData['fullName'] || 'Misafir',
        phone: formData['phone'] || '',
        address: formData['address'] || '',
        city: formData['city'] || '',
        district: formData['district'] || '',
        ipAddress: '127.0.0.1', // Mock
        userAgent: navigator.userAgent
      };

      if (isUpsellAdded && activeUpsell) {
        orderPayload.note = `UPSELL EKLENDİ: ${activeUpsell.title} (+${activeUpsell.price} TL)`;
        // In real backend, we'd add it as an order item
      }

      // PIXEL: AddPaymentInfo / Purchase intent
      console.log('FB PIXEL: AddPaymentInfo');

      const order = await createPublicOrder(orderPayload);

      // PIXEL: Purchase
      console.log('FB PIXEL: Purchase', { value: order.totalAmount, currency: 'TRY' });

      if (paymentMethod === 'CREDIT_CARD') {
        window.location.href = `/payment/${order.id}`;
      } else {
        onSuccess(order.id);
      }
    } catch (err) {
      setSubmitError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Field Input
  const renderField = (field: any) => {
    // Special Handling for City/District based on Config
    if (useCityDropdown && field.key === 'city') {
      return (
        <select
          value={formData['city'] || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-20 outline-none transition-all bg-white ${errors['city'] ? 'border-red-300' : 'border-gray-200'}`}
        >
          <option value="">İl Seçiniz</option>
          {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      );
    }
    if (useCityDropdown && field.key === 'district') {
      return (
        <select
          value={formData['district'] || ''}
          onChange={(e) => handleChange('district', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-20 outline-none transition-all bg-white ${errors['district'] ? 'border-red-300' : 'border-gray-200'}`}
        >
          <option value="">İlçe Seçiniz</option>
          {/* Mock Districts */}
          {['Merkez', 'A', 'B', 'C'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          rows={2}
          value={formData[field.key] || ''}
          onChange={(e) => handleChange(field.key, e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-20 outline-none transition-all resize-none ${errors[field.key] ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
          placeholder={field.label}
        />
      );
    }

    return (
      <input
        type={field.type === 'PHONE' ? 'tel' : 'text'}
        value={formData[field.key] || ''}
        onChange={(e) => handleChange(field.key, e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-20 outline-none transition-all ${errors[field.key] ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
        placeholder={field.label}
      />
    );
  };

  // --- DESIGN VARIANTS ---
  const getContainerClasses = () => {
    switch (designVariant) {
      case 'minimal': return "bg-white w-full sm:max-w-md sm:rounded-none rounded-t-2xl shadow-none overflow-hidden flex flex-col max-h-[100vh]";
      case 'simple': return "bg-white w-full sm:max-w-lg sm:rounded-lg rounded-t-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100";
      default: return "bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] transition-transform duration-300";
    }
  };

  const getHeader = () => {
    if (designVariant === 'minimal') {
      return (
        <div className="flex justify-between items-center px-6 py-6 bg-white">
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">SİPARİŞ OLUŞTUR</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={24} /></button>
        </div>
      );
    }
    return (
      <div className={`flex justify-between items-center px-6 py-4 border-b border-gray-100 ${designVariant === 'simple' ? 'bg-white' : 'bg-gray-50/50'}`}>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{designVariant === 'simple' ? 'Hemen Sipariş Ver' : 'Sipariş Tamamla'}</h2>
          {designVariant !== 'simple' && <p className="text-xs text-gray-500">Bilgilerinizi girerek siparişi tamamlayın</p>}
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
    );
  };

  const getButtonStyles = () => {
    if (designVariant === 'minimal') return "rounded-none text-xl py-5 uppercase tracking-widest";
    if (designVariant === 'simple') return "rounded-lg text-lg py-3 shadow-sm";
    return "rounded-xl text-lg py-4 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className={getContainerClasses()}
        onClick={e => e.stopPropagation()}
      >
        {getHeader()}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Product Summary */}
          {designVariant !== 'minimal' && (
            <div className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 items-start">
              <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-200">
                <img src={product.images[0]?.url} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(selectedVariant).map(([k, v]) => (
                    <span key={k} className="text-xs bg-white border px-1.5 py-0.5 rounded text-gray-600 font-medium">{v}</span>
                  ))}
                </div>
              </div>
            </div>
          )}


          {submitError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
              <ShieldCheck size={16} />
              {submitError}
            </div>
          )}

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">

            {/* UPSELL SECTION (Adım 7) */}
            {activeUpsell && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                  ÖZEL TEKLİF
                </div>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={activeUpsell.images[0]?.url} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{activeUpsell.title}</h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{activeUpsell.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-red-600">
                        +₺{activeUpsell.price} <span className="text-gray-400 line-through text-xs ml-1">₺{activeUpsell.originalPrice}</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-yellow-300 hover:bg-yellow-50 transition-colors shadow-sm">
                        <input
                          type="checkbox"
                          checked={isUpsellAdded}
                          onChange={(e) => setIsUpsellAdded(e.target.checked)}
                          className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs font-bold text-gray-800">Pakete Ekle</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="space-y-3">
                {product.variants.map((variant) => (
                  <div key={variant.id}>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">{variant.name || variant.variantName}</label>
                    <div className="flex flex-wrap gap-2">
                      {variant.values && variant.values.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleVariantSelect(variant.variantName, val)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${selectedVariant[variant.variantName] === val
                            ? `shadow-md text-white font-medium`
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          style={selectedVariant[variant.variantName] === val ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">Paket Seçimi</label>
              {product.prices.map((price) => (
                <label
                  key={price.id}
                  className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all relative overflow-hidden group ${selectedPrice === price.id
                    ? 'ring-2 ring-offset-1 bg-blue-50/10'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  style={selectedPrice === price.id ? { borderColor: themeColor, '--tw-ring-color': themeColor } as any : {}}
                >
                  <div className="flex items-center gap-3 relative z-10 w-full">
                    <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${selectedPrice === price.id ? 'border-transparent' : 'border-gray-300'
                      }`} style={selectedPrice === price.id ? { backgroundColor: themeColor } : {}}>
                      {selectedPrice === price.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block group-hover:text-black">
                        {/* Use label if available, otherwise simplified Turkish logic */}
                        {price.label || (price.quantity === 1 ? '1 Adet' : `${price.quantity} Adet`)}
                      </span>
                      {price.originalPrice && (
                        <span className="text-xs text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          %{Math.round(((price.originalPrice - price.price) / price.originalPrice) * 100)} İndirim
                        </span>
                      )}
                    </div>

                    <div className="text-right relative z-10">
                      <div className="font-black text-lg" style={{ color: themeColor }}>₺{price.price.toLocaleString('tr-TR')}</div>
                      {price.originalPrice && (
                        <div className="text-sm text-gray-400 line-through">₺{price.originalPrice.toLocaleString('tr-TR')}</div>
                      )}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="price_selection"
                    checked={selectedPrice === price.id}
                    onChange={() => setSelectedPrice(price.id)}
                    className="hidden"
                  />
                </label>
              ))}
              {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price}</p>}
            </div>

            {/* Payment Methods */}
            {product.checkoutConfig?.paymentMethods &&
              (product.checkoutConfig.paymentMethods.cod_cash ||
                product.checkoutConfig.paymentMethods.cod_card ||
                product.checkoutConfig.paymentMethods.online_credit_card) && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">Ödeme Yöntemi</label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Prefer COD first for this demographic */}
                    {(product.checkoutConfig.paymentMethods.cod_cash || product.checkoutConfig.paymentMethods.cod_card) && (
                      <label
                        className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${paymentMethod === 'COD' ? `border-2 bg-gray-50/50` : 'border-gray-200'}`}
                        style={paymentMethod === 'COD' ? { borderColor: themeColor } : {}}
                      >
                        <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="hidden" />
                        <Banknote size={24} className="mb-2 text-gray-700" />
                        <span className="text-sm font-bold text-gray-800">Kapıda Ödeme</span>
                      </label>
                    )}
                    {product.checkoutConfig.paymentMethods.online_credit_card && (
                      <label
                        className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${paymentMethod === 'CREDIT_CARD' ? `border-2 bg-gray-50/50` : 'border-gray-200'}`}
                        style={paymentMethod === 'CREDIT_CARD' ? { borderColor: themeColor } : {}}
                      >
                        <input type="radio" name="payment" value="CREDIT_CARD" checked={paymentMethod === 'CREDIT_CARD'} onChange={() => setPaymentMethod('CREDIT_CARD')} className="hidden" />
                        <div className="relative">
                          <CreditCard size={24} className="mb-2 text-blue-600" />
                          <div className="absolute -top-1 -right-2 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-800">Kartla Öde</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

            {/* Dynamic Fields */}
            <div className="space-y-4 pt-2">
              <h4 className="font-semibold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                <ShieldCheck size={18} className="text-gray-400" />
                Teslimat Bilgileri
              </h4>
              {fields.map((field) => (
                <div key={field.id}>
                  {renderField(field)}
                  {errors[field.key] && <p className="text-xs text-red-500 mt-1 font-medium">{errors[field.key]}</p>}
                </div>
              ))}
            </div>
          </form>
        </div>

        <div className={`p-6 border-t border-gray-100 ${designVariant === 'minimal' ? 'bg-white' : 'bg-gray-50/50'}`}>
          <button
            form="checkout-form"
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-bold transition-all flex items-center justify-center gap-2 ${getButtonStyles()}`}
            style={{ backgroundColor: themeColor }}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (
              <>
                {paymentMethod === 'CREDIT_CARD' ? 'Ödemeye Geç' : 'Siparişi Tamamla'} <ChevronRight size={20} />
              </>
            )}
          </button>

          {designVariant !== 'minimal' && (
            <div className="mt-3 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <ShieldCheck size={12} />
              <span>256-Bit SSL ile güvenli ödeme</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderFormModal;
