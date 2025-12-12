
import React, { useState, useEffect } from 'react';
import { 
  Save, Loader2, Plus, Trash2, GripVertical, 
  Settings, DollarSign, Layers, Tag, Box, Zap 
} from 'lucide-react';
import { Product, ProductStatus, CheckoutFieldType, Upsell, ProductVariant, ProductPrice } from '../types';
import { getUpsells } from '../lib/api';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'PRICING' | 'VARIANTS' | 'WIZARD' | 'PROMOS' | 'SETTINGS'>('GENERAL');
  const [availableUpsells, setAvailableUpsells] = useState<Upsell[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    videoUrl: '',
    seoTitle: '',
    seoKeywords: '',
    prices: [],
    variants: [],
    marketing: { pixelId: '', capiToken: '' },
    isFreeShipping: false,
    linkedUpsellIds: [],
    checkoutConfig: {
      fields: [],
      paymentMethods: { cod_cash: true, cod_card: true, online_credit_card: true }
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        marketing: initialData.marketing || { pixelId: '', capiToken: '' },
        checkoutConfig: initialData.checkoutConfig || { fields: [], paymentMethods: { cod_cash: true, cod_card: true, online_credit_card: true } }
      });
    } else {
      // Default Fields for new Product matching standard Turkey e-comm
      setFormData(prev => ({
        ...prev,
        checkoutConfig: {
          fields: [
            { id: '1', label: 'Ad Soyad', key: 'fullName', type: 'TEXT', isRequired: true, isVisible: true, order: 0 },
            { id: '2', label: 'Telefon', key: 'phone', type: 'PHONE', isRequired: true, isVisible: true, order: 1 },
            { id: '3', label: 'İl', key: 'city', type: 'SELECT_CITY', isRequired: true, isVisible: true, order: 2 },
            { id: '4', label: 'İlçe', key: 'district', type: 'SELECT_DISTRICT', isRequired: true, isVisible: true, order: 3 },
            { id: '5', label: 'Adres', key: 'address', type: 'TEXTAREA', isRequired: true, isVisible: true, order: 4 },
          ],
          paymentMethods: { cod_cash: true, cod_card: true, online_credit_card: true }
        }
      }));
    }

    // Load Upsells
    getUpsells().then(setAvailableUpsells);
  }, [initialData]);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMarketingChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      marketing: { ...prev.marketing, [field]: value }
    }));
  };

  // --- Pricing Logic ---
  const addPriceRule = () => {
    const newPrice: ProductPrice = {
      id: `price_${Date.now()}`,
      productId: initialData?.id || '',
      quantity: 1,
      price: 0,
      shippingCost: 0,
      discountRate: 0,
      originalPrice: 0
    };
    setFormData(prev => ({ ...prev, prices: [...(prev.prices || []), newPrice] }));
  };

  const updatePriceRule = (index: number, field: keyof ProductPrice, value: any) => {
    const newPrices = [...(formData.prices || [])];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData(prev => ({ ...prev, prices: newPrices }));
  };

  const removePriceRule = (index: number) => {
    const newPrices = [...(formData.prices || [])];
    newPrices.splice(index, 1);
    setFormData(prev => ({ ...prev, prices: newPrices }));
  };

  // --- Variant Logic ---
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `var_${Date.now()}`,
      productId: initialData?.id || '',
      variantName: '',
      stock: 100,
      price: 0
    };
    setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const removeVariant = (index: number) => {
    const newVariants = [...(formData.variants || [])];
    newVariants.splice(index, 1);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  // --- Form Wizard Logic ---
  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: 'Yeni Alan',
      key: `custom_${Date.now()}`,
      type: 'TEXT',
      isRequired: false,
      isVisible: true,
      order: (formData.checkoutConfig?.fields.length || 0)
    };
    setFormData(prev => ({
      ...prev,
      checkoutConfig: {
        ...prev.checkoutConfig!,
        fields: [...(prev.checkoutConfig?.fields || []), newField]
      }
    }));
  };

  const updateField = (index: number, field: string, value: any) => {
    const newFields = [...(formData.checkoutConfig?.fields || [])];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      checkoutConfig: { ...prev.checkoutConfig!, fields: newFields }
    }));
  };

  const removeField = (index: number) => {
    const newFields = [...(formData.checkoutConfig?.fields || [])];
    newFields.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      checkoutConfig: { ...prev.checkoutConfig!, fields: newFields }
    }));
  };

  // --- Tabs Configuration ---
  const tabs = [
    { id: 'GENERAL', label: 'Genel Bilgiler', icon: Box },
    { id: 'PRICING', label: 'Fiyatlandırma', icon: DollarSign },
    { id: 'VARIANTS', label: 'Varyantlar', icon: Layers },
    { id: 'WIZARD', label: 'Form Sihirbazı', icon: Tag },
    { id: 'PROMOS', label: 'Promosyonlar', icon: Zap },
    { id: 'SETTINGS', label: 'Ayarlar', icon: Settings },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Header Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
              ${activeTab === tab.id 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-white">
        
        {/* TAB 1: Genel Bilgiler */}
        {activeTab === 'GENERAL' && (
          <div className="space-y-5 max-w-3xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı (name)</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Kısa Adı (slug)</label>
              <input 
                type="text" 
                value={formData.slug}
                onChange={e => handleChange('slug', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama (description)</label>
              <textarea 
                rows={5}
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Linki (videoUrl)</label>
              <input 
                type="url" 
                value={formData.videoUrl}
                onChange={e => handleChange('videoUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://youtube.com/..."
              />
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">SEO Ayarları</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Başlığı (title)</label>
                  <input 
                    type="text" 
                    value={formData.seoTitle}
                    onChange={e => handleChange('seoTitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anahtar Kelimeler (keywords)</label>
                  <input 
                    type="text" 
                    value={formData.seoKeywords}
                    onChange={e => handleChange('seoKeywords', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="virgül ile ayırın"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Fiyatlandırma */}
        {activeTab === 'PRICING' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-gray-800">Fiyat Kuralları</h3>
               <button 
                 type="button" 
                 onClick={addPriceRule}
                 className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
               >
                 <Plus size={16} /> Yeni Kural Ekle
               </button>
            </div>

            <div className="space-y-3">
               {(formData.prices?.length === 0) && (
                 <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                    Henüz fiyat kuralı eklenmedi.
                 </div>
               )}
               {formData.prices?.map((price, idx) => (
                 <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl relative">
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Adet (quantity)</label>
                       <input 
                         type="number" 
                         value={price.quantity}
                         onChange={e => updatePriceRule(idx, 'quantity', parseInt(e.target.value))}
                         className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fiyat (price)</label>
                       <input 
                         type="number" 
                         value={price.price}
                         onChange={e => updatePriceRule(idx, 'price', parseFloat(e.target.value))}
                         className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kargo (shippingCost)</label>
                       <input 
                         type="number" 
                         value={price.shippingCost || 0}
                         onChange={e => updatePriceRule(idx, 'shippingCost', parseFloat(e.target.value))}
                         className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">İndirim (discountRate)</label>
                       <input 
                         type="number" 
                         value={price.discountRate || 0}
                         onChange={e => updatePriceRule(idx, 'discountRate', parseFloat(e.target.value))}
                         className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                       />
                    </div>
                    <div className="flex items-end justify-end">
                       <button 
                         type="button" 
                         onClick={() => removePriceRule(idx)}
                         className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* TAB 3: Varyantlar */}
        {activeTab === 'VARIANTS' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-gray-800">Ürün Varyantları</h3>
               <button 
                 type="button" 
                 onClick={addVariant}
                 className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
               >
                 <Plus size={16} /> Varyant Ekle
               </button>
            </div>

            <div className="space-y-3">
               {(formData.variants?.length === 0) && (
                 <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                    Varyant eklenmedi.
                 </div>
               )}
               {formData.variants?.map((v, idx) => (
                 <div key={idx} className="flex gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl items-end">
                    <div className="flex-1">
                       <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Varyant Adı (variantName)</label>
                       <input 
                         type="text" 
                         value={v.variantName}
                         onChange={e => updateVariant(idx, 'variantName', e.target.value)}
                         className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                         placeholder="Örn: Kırmızı - L"
                       />
                    </div>
                    <div className="w-32">
                       <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Stok (stock)</label>
                       <input 
                         type="number" 
                         value={v.stock}
                         onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value))}
                         className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                       />
                    </div>
                    <div className="w-32">
                       <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Ek Fiyat (+price)</label>
                       <input 
                         type="number" 
                         value={v.price}
                         onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value))}
                         className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                       />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeVariant(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-0.5"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* TAB 4: Form Sihirbazı */}
        {activeTab === 'WIZARD' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-gray-800">Ödeme Formu Alanları</h3>
               <button 
                 type="button" 
                 onClick={addField}
                 className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
               >
                 <Plus size={16} /> Alan Ekle
               </button>
            </div>

            <div className="space-y-2">
               {formData.checkoutConfig?.fields.map((field, idx) => (
                 <div key={idx} className="flex gap-3 p-3 border border-gray-200 rounded-lg items-center bg-white shadow-sm">
                    <GripVertical size={16} className="text-gray-300 cursor-move" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                       <input 
                         type="text" 
                         value={field.label}
                         onChange={e => updateField(idx, 'label', e.target.value)}
                         className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                         placeholder="Etiket (Label)"
                       />
                       <select
                         value={field.type}
                         onChange={e => updateField(idx, 'type', e.target.value)}
                         className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
                       >
                          <option value="TEXT">Text</option>
                          <option value="PHONE">Phone</option>
                          <option value="SELECT_CITY">Select City</option>
                          <option value="SELECT_DISTRICT">Select District</option>
                          <option value="SELECT">Select (Custom)</option>
                          <option value="TEXTAREA">Textarea</option>
                          <option value="CHECKBOX">Checkbox</option>
                       </select>
                       <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                             <input 
                               type="checkbox" 
                               checked={field.isRequired}
                               onChange={e => updateField(idx, 'isRequired', e.target.checked)}
                               className="rounded border-gray-300 text-blue-600"
                             />
                             Zorunlu
                          </label>
                          {/* Options input only if type is SELECT */}
                          {field.type === 'SELECT' && (
                             <input 
                                type="text"
                                placeholder="Seçenekler (virgül ile)"
                                className="border border-gray-300 rounded px-2 py-1.5 text-xs w-32"
                             />
                          )}
                       </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeField(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                       <Trash2 size={16} />
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* TAB 5: Promosyonlar */}
        {activeTab === 'PROMOS' && (
          <div className="space-y-6">
             <h3 className="font-bold text-gray-800 mb-4">Aktif Promosyonlar</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableUpsells.map(promo => (
                   <label key={promo.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                      <input 
                        type="checkbox" 
                        checked={formData.linkedUpsellIds?.includes(promo.id)}
                        onChange={(e) => {
                           const current = formData.linkedUpsellIds || [];
                           if (e.target.checked) {
                              setFormData({ ...formData, linkedUpsellIds: [...current, promo.id] });
                           } else {
                              setFormData({ ...formData, linkedUpsellIds: current.filter(id => id !== promo.id) });
                           }
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                         <p className="font-bold text-gray-900">{promo.title}</p>
                         <p className="text-xs text-green-600 font-bold">{promo.price} ₺</p>
                      </div>
                   </label>
                ))}
                {availableUpsells.length === 0 && <div className="text-gray-500 text-sm">Hiç promosyon bulunamadı.</div>}
             </div>
          </div>
        )}

        {/* TAB 6: Ayarlar */}
        {activeTab === 'SETTINGS' && (
          <div className="space-y-6 max-w-2xl">
             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                   <h4 className="font-bold text-gray-900">Ücretsiz Kargo</h4>
                   <p className="text-xs text-gray-500">Bu ürün için kargo ücreti alınmasın.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.isFreeShipping}
                  onChange={e => setFormData({...formData, isFreeShipping: e.target.checked})}
                  className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                />
             </div>

             <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-900">Piksel Ayarları</h4>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
                   <input 
                     type="text" 
                     value={formData.marketing?.pixelId}
                     onChange={e => handleMarketingChange('pixelId', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">CAPI Token</label>
                   <textarea 
                     rows={3}
                     value={formData.marketing?.capiToken}
                     onChange={e => handleMarketingChange('capiToken', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs resize-none"
                   />
                </div>
             </div>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
         <button 
           type="button" 
           onClick={onCancel}
           className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
         >
           İptal
         </button>
         <button 
           type="submit"
           disabled={isSubmitting}
           className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
         >
           {isSubmitting && <Loader2 className="animate-spin" size={18} />}
           Kaydet
         </button>
      </div>
    </form>
  );
};

export default ProductForm;
