
import React, { useState, useEffect } from 'react';
import { Product, ProductStatus, ProductVariant, Upsell } from '../types';
import { createProduct, getProductById, updateProduct, getUpsells } from '../lib/api';
import {
  ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, Trash2,
  Box, DollarSign, Layers, UploadCloud, MoreHorizontal, Truck,
  Eye, CreditCard, Search, X, Check, BarChart, Layout, MessageSquare, Zap, GripVertical,
  Globe, Smartphone, Palette, MousePointer, ChevronRight, ChevronLeft, ExternalLink, MessageCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import MediaLibraryModal from '../components/modals/MediaLibraryModal';
import { useLanguage } from '../lib/i18n';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';

interface ProductWizardProps {
  productId?: string;
  onBack: () => void;
}

// Helper type for local state handling of Option Groups
interface OptionGroup {
  id: string;
  name: string;
  values: string[];
}

const ProductWizard: React.FC<ProductWizardProps> = ({ productId, onBack }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState('general');
  const [availableUpsells, setAvailableUpsells] = useState<Upsell[]>([]);

  // Product State
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    status: ProductStatus.DRAFT,
    seoTitle: '',
    seoKeywords: '',
    videoUrl: '',
    whatsappNumber: '',
    prices: [],
    images: [],
    variants: [],
    marketing: { pixelId: '', capiToken: '', facebookPixelId: '', googleAnalyticsId: '', googleTagManagerId: '', tiktokPixelId: '' },
    linkedUpsellIds: [],
    checkoutConfig: {
      fields: [
        { id: '1', label: 'Ad Soyad', key: 'fullName', type: 'TEXT', isRequired: true, isVisible: true, order: 0 },
        { id: '2', label: 'Telefon', key: 'phone', type: 'PHONE', isRequired: true, isVisible: true, order: 1 },
        { id: '3', label: 'İl', key: 'city', type: 'SELECT_CITY', isRequired: true, isVisible: true, order: 2 },
        { id: '4', label: 'İlçe', key: 'district', type: 'SELECT_DISTRICT', isRequired: true, isVisible: true, order: 3 },
        { id: '5', label: 'Adres', key: 'address', type: 'TEXTAREA', isRequired: true, isVisible: true, order: 4 },
      ],
      paymentMethods: { cod_cash: true, cod_card: true, online_credit_card: false, bank_transfer: false }
    },
    paymentConfig: {
      methods: { cod_cash: true, cod_card: true, online_credit_card: false, bank_transfer: false },
      fees: {},
      discounts: {}
    },
    ctaText: 'SİPARİŞİ TAMAMLA',
    ctaColor: '#2563EB',
    isFreeShipping: false,
    adminCoverImage: '',
    reviews: []
  });

  // UI States for Pricing Calculator
  const [simplePrice, setSimplePrice] = useState(0);
  const [comparePrice, setComparePrice] = useState(0);
  const [costPerItem, setCostPerItem] = useState(0);
  const [hasVariants, setHasVariants] = useState(false); // Toggle for Variants

  // Variant Generation State
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);

  const steps = [
    { id: 'general', label: 'Ürün & Genel', icon: Box, sub: 'Temel Bilgiler' },
    { id: 'pricing', label: 'Fiyat & Varyantlar', icon: DollarSign, sub: 'Satış Seçenekleri' },
    { id: 'marketing', label: 'Pazarlama (Pixel)', icon: Globe, sub: 'Takip Kodları' },
    { id: 'form', label: 'Form & Tasarım', icon: Layout, sub: 'Ödeme Sayfası' },
    { id: 'images', label: 'Görseller', icon: ImageIcon, sub: 'Medya Galerisi' },
    // { id: 'variants', label: 'Varyantlar', icon: Layers, sub: 'Seçenekler' }, // Merged into Pricing
    { id: 'reviews', label: 'Yorumlar', icon: MessageSquare, sub: 'Müşteri Görüşleri' },
    { id: 'promotions', label: 'Promosyonlar', icon: Zap, sub: 'Fırsatlar' },
  ];

  useEffect(() => {
    const init = async () => {
      if (productId) {
        try {
          const data = await getProductById(productId);
          if (data) {
            setProduct(data);
            if (data.prices && data.prices.length > 0) {
              setSimplePrice(data.prices[0].price);
              setComparePrice(data.prices[0].originalPrice || 0);
            }
            if (data.variants && data.variants.length > 0) {
              setHasVariants(true);
            }
          }
        } catch (e) {
          console.error("Failed to load product");
        }
      }
      setLoading(false);
      getUpsells().then(setAvailableUpsells);
    };
    init();
  }, [productId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Sync Pricing to Product Structure
      const updatedProduct = { ...product };

      // If no explicit variants, ensure we have a default price rule
      if (!updatedProduct.variants || updatedProduct.variants.length === 0) {
        updatedProduct.prices = [{
          id: updatedProduct.prices?.[0]?.id || `p-${Date.now()}`,
          productId: productId || '',
          quantity: 1,
          price: simplePrice,
          originalPrice: comparePrice,
          shippingCost: updatedProduct.isFreeShipping ? 0 : 29.90,
          discountRate: comparePrice > simplePrice ? Math.round(((comparePrice - simplePrice) / comparePrice) * 100) : 0
        }];
      }

      if (productId) {
        await updateProduct(productId, updatedProduct, user ? { id: user.id, name: user.name || 'Unknown' } : undefined);
        addNotification('success', 'Ürün başarıyla güncellendi.');
      } else {
        await createProduct(updatedProduct as any, user ? { id: user.id, name: user.name || 'Unknown' } : undefined);
        addNotification('success', 'Yeni ürün başarıyla oluşturuldu.');
      }
      onBack();
    } catch (e) {
      console.error(e);
      addNotification('error', 'Ürün kaydedilirken bir hata oluştu.', 5000, {
        label: 'Tekrar Dene',
        onClick: handleSave
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Product, value: any) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleImageAdd = () => {
    setIsMediaModalOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    setProduct(prev => ({
      ...prev,
      images: [...(prev.images || []), { id: `img-${Date.now()}`, url, order: (prev.images?.length || 0), productId: productId || '' }]
    }));
  };

  // --- Variant Logic ---
  const addOptionGroup = () => {
    if (!newOptionName.trim()) return;
    const newGroup: OptionGroup = {
      id: `opt-${Date.now()}`,
      name: newOptionName,
      values: []
    };
    setOptionGroups([...optionGroups, newGroup]);
    setNewOptionName('');
    setActiveOptionId(newGroup.id);
  };

  const addOptionValue = (groupId: string) => {
    if (!newOptionValue.trim()) return;
    setOptionGroups(prev => prev.map(g => {
      if (g.id === groupId && !g.values.includes(newOptionValue)) {
        return { ...g, values: [...g.values, newOptionValue] };
      }
      return g;
    }));
    setNewOptionValue('');
  };

  const removeOptionValue = (groupId: string, val: string) => {
    setOptionGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, values: g.values.filter(v => v !== val) };
      }
      return g;
    }));
  };

  const removeOptionGroup = (id: string) => {
    setOptionGroups(prev => prev.filter(g => g.id !== id));
    if (activeOptionId === id) setActiveOptionId(null);
  };

  const generateVariants = () => {
    if (optionGroups.length === 0) return;

    const cartesian = (...a: any[][]) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

    const validGroups = optionGroups.filter(g => g.values.length > 0);
    if (validGroups.length === 0) return;

    const combinations = validGroups.length === 1
      ? validGroups[0].values.map(v => [v])
      : cartesian(...validGroups.map(g => g.values));

    const newVariants: ProductVariant[] = combinations.map((combo: string[]) => {
      const name = combo.join(' / ');
      return {
        id: `var-${Math.random().toString(36).substr(2, 9)}`,
        productId: productId || '',
        variantName: name,
        stock: 100,
        price: simplePrice,
        name: validGroups.map(g => g.name).join('/'),
        type: 'text',
        values: combo
      };
    });

    setProduct(prev => ({ ...prev, variants: newVariants }));
  };

  // Profit Calculation
  const profit = simplePrice - costPerItem;
  const margin = simplePrice > 0 ? ((profit / simplePrice) * 100).toFixed(1) : '0';

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8fafc]"><LoadingSpinner size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 animate-fade-in font-sans flex flex-col">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {productId ? (product.name || 'Ürün Yükleniyor...') : 'Yeni Ürün Ekle'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {productId ? `Ürün ID: ${productId} • ${product.slug || 'Slug oluşturulmadı'}` : 'Yeni bir ürün oluşturun ve özelliklerini belirleyin.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {product.status === 'PUBLISHED' ? 'YAYINDA' : 'TASLAK'}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Stepper */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between relative px-4 py-6 overflow-x-auto no-scrollbar">
            {/* Connecting Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full hidden md:block"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-out hidden md:block"
              style={{ width: `${(steps.findIndex(s => s.id === activeStep) / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step, idx) => {
              const isActive = activeStep === step.id;
              const isCompleted = steps.findIndex(s => s.id === activeStep) > idx;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`group relative flex flex-col items-center gap-3 transition-all duration-300 min-w-[100px] ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                >
                  <div
                    className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 border-2 z-10
                      ${isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30'
                        : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500'}
                    `}
                  >
                    {isCompleted ? <Check size={20} strokeWidth={3} /> : <step.icon size={20} />}
                  </div>

                  <div className={`text-center transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>ADIM {idx + 1}</p>
                    <p className={`text-xs font-bold whitespace-nowrap ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-6 pb-32">

        {/* 1. GENERAL */}
        {activeStep === 'general' && (
          <div className="space-y-6 animate-fade-in">

            {/* Template Selector Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-end gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">ŞABLON:</span>
                <select className="bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Standart (Tek Sayfa)</option>
                  <option>Influencer Modu</option>
                  <option>Landing Page V1</option>
                  <option>Landing Page V2</option>
                </select>
              </div>
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                <ExternalLink size={14} /> Canlı Önizleme
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Box className="text-blue-600" size={24} />
                <h3 className="font-bold text-lg text-gray-900">Temel Bilgiler</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Adı <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif italic">T</span>
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                        placeholder="Örn: Premium T-Shirt"
                        value={product.name}
                        onChange={e => updateField('name', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Kısa İsim / Etiket <span className="text-gray-400 font-normal">(Opsiyonel)</span></label>
                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                        placeholder="Örn: FIRSAT ÜRÜNÜ"
                        value={product.shortDescription}
                        onChange={e => updateField('shortDescription', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">URL Yapısı (Slug) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                      value={product.slug}
                      onChange={e => updateField('slug', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Açıklaması</label>
                  <textarea
                    rows={6}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200 resize-y"
                    placeholder="Ürün özelliklerini detaylıca anlatın..."
                    value={product.description}
                    onChange={e => updateField('description', e.target.value)}
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">HTML formatı desteklenmektedir.</p>
                </div>
              </div>
            </div>

            {/* Media & SEO Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="text-orange-500" size={20} />
                  <h3 className="font-bold text-gray-900">SEO Ayarları</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">SEO Başlığı</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="Google'da görünecek başlık"
                      value={product.seoTitle}
                      onChange={e => updateField('seoTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Anahtar Kelimeler</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="virgül, ile, ayırın"
                      value={product.seoKeywords}
                      onChange={e => updateField('seoKeywords', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRICING */}
        {activeStep === 'pricing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-green-600" size={24} />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Satış Seçenekleri & Fiyatlandırma</h3>
                    <p className="text-sm text-gray-500">Müşteriye sunulacak miktar bazlı paketleri oluşturun (Örn: 1 Adet, 2'li Set).</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newPrice = {
                      id: `p-${Date.now()}`,
                      productId: productId || '',
                      quantity: 1,
                      unit: 'Adet',
                      price: 0,
                      originalPrice: 0,
                      shippingCost: 0,
                      discountRate: 0
                    };
                    setProduct(prev => ({ ...prev, prices: [...(prev.prices || []), newPrice] }));
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  <Plus size={16} /> Yeni Seçenek Ekle
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Miktar</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Birim</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Normal Fiyat (Çizili)</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">İndirimli Satış Fiyatı</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Kargo Ücreti</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">İndirim %</th>
                      <th className="px-6 py-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {product.prices?.map((price, idx) => (
                      <tr key={price.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="px-6 py-3">
                          <input
                            type="number"
                            className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-center font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={price.quantity}
                            onChange={e => {
                              const newPrices = [...(product.prices || [])];
                              newPrices[idx].quantity = parseInt(e.target.value) || 1;
                              setProduct({ ...product, prices: newPrices });
                            }}
                          />
                        </td>
                        <td className="px-6 py-3">
                          <select
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all"
                            value={price.unit || 'Adet'}
                            onChange={e => {
                              const newPrices = [...(product.prices || [])];
                              newPrices[idx].unit = e.target.value;
                              setProduct({ ...product, prices: newPrices });
                            }}
                          >
                            <option>Adet</option>
                            <option>Kutu</option>
                            <option>Set</option>
                            <option>Paket</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₺</span>
                            <input
                              type="number"
                              className="w-32 border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-gray-500 line-through focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                              value={price.originalPrice}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                const newPrices = [...(product.prices || [])];
                                newPrices[idx].originalPrice = val;
                                // Recalculate discount
                                if (val > newPrices[idx].price) {
                                  newPrices[idx].discountRate = Math.round(((val - newPrices[idx].price) / val) * 100);
                                } else {
                                  newPrices[idx].discountRate = 0;
                                }
                                setProduct({ ...product, prices: newPrices });
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 font-bold text-xs">₺</span>
                            <input
                              type="number"
                              className="w-32 border border-gray-200 rounded-lg pl-7 pr-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                              value={price.price}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                const newPrices = [...(product.prices || [])];
                                newPrices[idx].price = val;
                                // Recalculate discount
                                if (newPrices[idx].originalPrice && newPrices[idx].originalPrice! > val) {
                                  newPrices[idx].discountRate = Math.round(((newPrices[idx].originalPrice! - val) / newPrices[idx].originalPrice!) * 100);
                                } else {
                                  newPrices[idx].discountRate = 0;
                                }
                                setProduct({ ...product, prices: newPrices });
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">₺</span>
                            <input
                              type="number"
                              className={`w-32 border rounded-lg pl-7 pr-3 py-2 focus:ring-2 outline-none transition-all ${price.shippingCost === 0 ? 'bg-green-50 border-green-200 text-green-700 font-bold focus:ring-green-500/20 focus:border-green-500' : 'border-gray-200 text-gray-700 focus:ring-blue-500/20 focus:border-blue-500'}`}
                              value={price.shippingCost}
                              onChange={e => {
                                const newPrices = [...(product.prices || [])];
                                newPrices[idx].shippingCost = parseFloat(e.target.value) || 0;
                                setProduct({ ...product, prices: newPrices });
                              }}
                            />
                            {price.shippingCost === 0 && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-600 bg-white px-1.5 py-0.5 rounded border border-green-200">BEDAVA</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold text-sm">
                            %{price.discountRate}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => {
                              const newPrices = product.prices?.filter(p => p.id !== price.id);
                              setProduct({ ...product, prices: newPrices });
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!product.prices || product.prices.length === 0) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          Henüz bir satış seçeneği eklenmedi. Yukarıdaki butonu kullanarak ekleyebilirsiniz.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 px-2">
                <div className="flex items-center gap-2">
                  <Box size={16} />
                  <span>Toplam <b>{product.prices?.length || 0}</b> farklı satış seçeneği tanımlandı.</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Truck size={16} />
                  <span>Kargo ücreti "0" girilen seçeneklerde <b>Ücretsiz Kargo</b> etiketi gösterilir.</span>
                </div>
              </div>
            </div>


            {/* Variant Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Layers className="text-purple-600" size={24} />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Ürün Varyantları</h3>
                    <p className="text-sm text-gray-500">Bu ürünün farklı seçenekleri (Renk, Beden vb.) var mı?</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {hasVariants && (
                <div className="animate-fade-in space-y-6">
                  {/* Feature Builder */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50/50">
                    <div className="flex gap-4 mb-6">
                      <input
                        type="text"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                        placeholder="Seçenek Grubu Adı (Örn: Renk)"
                        value={newOptionName}
                        onChange={e => setNewOptionName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addOptionGroup()}
                      />
                      <button
                        onClick={addOptionGroup}
                        className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                      >
                        + Ekle
                      </button>
                    </div>

                    <div className="space-y-4">
                      {optionGroups.map(group => (
                        <div key={group.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-900">{group.name}</h4>
                            <button onClick={() => removeOptionGroup(group.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {group.values.map(val => (
                              <span key={val} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 flex items-center gap-2">
                                {val}
                                <button onClick={() => removeOptionValue(group.id, val)} className="hover:text-red-600"><X size={14} /></button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                              placeholder={`${group.name} değeri ekle...`}
                              value={activeOptionId === group.id ? newOptionValue : ''}
                              onChange={e => {
                                setActiveOptionId(group.id);
                                setNewOptionValue(e.target.value);
                              }}
                              onKeyDown={e => e.key === 'Enter' && addOptionValue(group.id)}
                            />
                            <button
                              onClick={() => addOptionValue(group.id)}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                            >
                              Ekle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {optionGroups.length > 0 && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={generateVariants}
                          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-200"
                        >
                          <Zap size={18} /> Varyantları Oluştur
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Variant List Table */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 font-bold text-gray-500">Varyant</th>
                            <th className="px-6 py-3 font-bold text-gray-500">Fiyat</th>
                            <th className="px-6 py-3 font-bold text-gray-500">Stok</th>
                            <th className="px-6 py-3 font-bold text-gray-500 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {product.variants.map((variant, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 font-medium text-gray-900">{variant.variantName}</td>
                              <td className="px-6 py-3">
                                <div className="relative w-32">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₺</span>
                                  <input
                                    type="number"
                                    className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-1.5 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                    value={variant.price}
                                    onChange={e => {
                                      const newVariants = [...(product.variants || [])];
                                      newVariants[idx].price = parseFloat(e.target.value) || 0;
                                      setProduct({ ...product, variants: newVariants });
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <input
                                  type="number"
                                  className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                  value={variant.stock}
                                  onChange={e => {
                                    const newVariants = [...(product.variants || [])];
                                    newVariants[idx].stock = parseInt(e.target.value) || 0;
                                    setProduct({ ...product, variants: newVariants });
                                  }}
                                />
                              </td>
                              <td className="px-6 py-3 text-right">
                                <button
                                  onClick={() => {
                                    const newVariants = product.variants?.filter((_, i) => i !== idx);
                                    setProduct({ ...product, variants: newVariants });
                                  }}
                                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. MARKETING */}
        {activeStep === 'marketing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <BarChart size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900">Profesyonel Takip Merkezi</h4>
                <p className="text-sm text-blue-700 mt-1">Reklam dönüşümlerini ve site trafiğini en üst düzeyde takip edin. Tüm entegrasyonlar sunucu taraflı (Server-Side) çalışır.</p>
              </div>
            </div>

            {/* Meta (Facebook) Pixel - MOVED TO TOP */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden ring-1 ring-blue-100">
              <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Meta (Facebook) Pixel & CAPI</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Server-Side Tracking</span>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">ÖNERİLEN</span>
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!product.marketing?.facebookPixelId}
                    onChange={(e) => {
                      // If checking, set a placeholder if empty to ensure it stays checked
                      if (e.target.checked && !product.marketing?.facebookPixelId) {
                        updateField('marketing', { ...product.marketing, facebookPixelId: ' ' }); // Space as placeholder
                      } else if (!e.target.checked) {
                        updateField('marketing', { ...product.marketing, facebookPixelId: '', pixelId: '', capiToken: '' });
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {/* Always show inputs if checked (even if placeholder) */}
              {!!product.marketing?.facebookPixelId && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">PIXEL ID</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="1234567890"
                      value={product.marketing?.facebookPixelId?.trim() || ''}
                      onChange={e => updateField('marketing', { ...product.marketing, facebookPixelId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CAPI ACCESS TOKEN (SERVER-SIDE)</label>
                    <textarea
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="EAAG..."
                      value={product.marketing?.capiToken || ''}
                      onChange={e => updateField('marketing', { ...product.marketing, capiToken: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    {['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'].map(event => (
                      <span key={event} className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-100 flex items-center gap-1">
                        <Check size={10} /> {event}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Google Analytics 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                    <BarChart size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Google Analytics 4</h4>
                    <p className="text-xs text-gray-500">Client-Side Tracking</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!product.marketing?.googleAnalyticsId}
                    onChange={(e) => {
                      if (e.target.checked && !product.marketing?.googleAnalyticsId) {
                        updateField('marketing', { ...product.marketing, googleAnalyticsId: ' ' });
                      } else if (!e.target.checked) {
                        updateField('marketing', { ...product.marketing, googleAnalyticsId: '' });
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {!!product.marketing?.googleAnalyticsId && (
                <div className="p-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">MEASUREMENT ID (G-XXXX)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                    placeholder="G-A1B2C3D4"
                    value={product.marketing?.googleAnalyticsId?.trim() || ''}
                    onChange={e => updateField('marketing', { ...product.marketing, googleAnalyticsId: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Google Tag Manager */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Google Tag Manager</h4>
                    <p className="text-xs text-gray-500">Client-Side Tracking</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!product.marketing?.googleTagManagerId}
                    onChange={(e) => {
                      if (e.target.checked && !product.marketing?.googleTagManagerId) {
                        updateField('marketing', { ...product.marketing, googleTagManagerId: ' ' });
                      } else if (!e.target.checked) {
                        updateField('marketing', { ...product.marketing, googleTagManagerId: '' });
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {!!product.marketing?.googleTagManagerId && (
                <div className="p-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CONTAINER ID (GTM-XXXX)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                    placeholder="GTM-A1B2C3"
                    value={product.marketing?.googleTagManagerId?.trim() || ''}
                    onChange={e => updateField('marketing', { ...product.marketing, googleTagManagerId: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* TikTok Pixel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                    <span className="font-bold text-xs">Tik</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">TikTok Pixel</h4>
                    <p className="text-xs text-gray-500">Client-Side Tracking</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!product.marketing?.tiktokPixelId}
                    onChange={(e) => {
                      if (e.target.checked && !product.marketing?.tiktokPixelId) {
                        updateField('marketing', { ...product.marketing, tiktokPixelId: ' ' });
                      } else if (!e.target.checked) {
                        updateField('marketing', { ...product.marketing, tiktokPixelId: '' });
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {!!product.marketing?.tiktokPixelId && (
                <div className="p-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">PIXEL ID</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                    placeholder="C..."
                    value={product.marketing?.tiktokPixelId?.trim() || ''}
                    onChange={e => updateField('marketing', { ...product.marketing, tiktokPixelId: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. FORM & DESIGN */}
        {activeStep === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Left Column: Settings */}
            <div className="lg:col-span-7 space-y-6">



              {/* Form Fields */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-gray-900">Ödeme Formu Alanları</h3>
                  <button
                    onClick={() => {
                      const newField = {
                        id: Date.now().toString(),
                        label: 'Yeni Alan',
                        key: `field_${Date.now()}`,
                        type: 'TEXT',
                        isRequired: false,
                        isVisible: true,
                        order: (product.checkoutConfig?.fields.length || 0)
                      };
                      updateField('checkoutConfig', {
                        ...product.checkoutConfig,
                        fields: [...(product.checkoutConfig?.fields || []), newField]
                      });
                    }}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={14} /> Alan Ekle
                  </button>
                </div>

                <div className="space-y-3">
                  {product.checkoutConfig?.fields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50 group hover:border-blue-200 transition-colors">
                      <GripVertical className="text-gray-400 cursor-move" size={16} />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          value={field.label}
                          onChange={(e) => {
                            const newFields = [...(product.checkoutConfig?.fields || [])];
                            newFields[idx].label = e.target.value;
                            updateField('checkoutConfig', { ...product.checkoutConfig, fields: newFields });
                          }}
                        />
                        <select
                          className="border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
                          value={field.type}
                          onChange={(e) => {
                            const newFields = [...(product.checkoutConfig?.fields || [])];
                            newFields[idx].type = e.target.value;
                            updateField('checkoutConfig', { ...product.checkoutConfig, fields: newFields });
                          }}
                        >
                          <option value="TEXT">Metin (Text)</option>
                          <option value="PHONE">Telefon</option>
                          <option value="TEXTAREA">Uzun Metin</option>
                          <option value="SELECT_CITY">İl Seçimi</option>
                          <option value="SELECT_DISTRICT">İlçe Seçimi</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 focus:ring-blue-500"
                          checked={field.isRequired}
                          onChange={(e) => {
                            const newFields = [...(product.checkoutConfig?.fields || [])];
                            newFields[idx].isRequired = e.target.checked;
                            updateField('checkoutConfig', { ...product.checkoutConfig, fields: newFields });
                          }}
                        />
                        <span className="text-xs font-medium text-gray-600">Zorunlu</span>
                      </label>
                      <button
                        onClick={() => {
                          const newFields = product.checkoutConfig?.fields.filter(f => f.id !== field.id);
                          updateField('checkoutConfig', { ...product.checkoutConfig, fields: newFields });
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Configuration */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">WhatsApp Sipariş Hattı</h3>
                      <p className="text-sm text-gray-500">Müşterilerin WhatsApp üzerinden sipariş vermesini sağlayın.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!product.whatsappNumber}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('whatsappNumber', '90');
                        } else {
                          updateField('whatsappNumber', '');
                        }
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {!!product.whatsappNumber && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Numarası</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                      placeholder="905XXXXXXXXX"
                      value={product.whatsappNumber}
                      onChange={e => updateField('whatsappNumber', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">Uluslararası formatta, başında + olmadan yazınız (Örn: 905321234567).</p>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Ödeme Seçenekleri & Komisyonlar</h3>
                <div className="space-y-4">
                  {[
                    { id: 'cod_cash', label: 'Kapıda Nakit Ödeme', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                    { id: 'cod_card', label: 'Kapıda Kartla Ödeme', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-100' },
                    { id: 'online_credit_card', label: 'Online Kredi Kartı', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { id: 'bank_transfer', label: 'Havale / EFT', icon: Box, color: 'text-purple-600', bg: 'bg-purple-100' }
                  ].map((method) => (
                    <div key={method.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${method.bg} rounded-lg flex items-center justify-center ${method.color}`}>
                            <method.icon size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{method.label}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          checked={product.paymentConfig?.methods[method.id as keyof typeof product.paymentConfig.methods]}
                          onChange={(e) => updateField('paymentConfig', {
                            ...product.paymentConfig,
                            methods: { ...product.paymentConfig?.methods, [method.id]: e.target.checked }
                          })}
                        />
                      </label>

                      {/* Extra Settings for Enabled Methods */}
                      {product.paymentConfig?.methods[method.id as keyof typeof product.paymentConfig.methods] && (
                        <div className="bg-gray-50 p-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ek Ücret (TL)</label>
                            <input
                              type="number"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                              placeholder="0.00"
                              value={product.paymentConfig?.fees?.[method.id as keyof typeof product.paymentConfig.fees] || ''}
                              onChange={e => updateField('paymentConfig', {
                                ...product.paymentConfig,
                                fees: { ...product.paymentConfig?.fees, [method.id]: parseFloat(e.target.value) }
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">İndirim (TL)</label>
                            <input
                              type="number"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                              placeholder="0.00"
                              value={product.paymentConfig?.discounts?.[method.id as keyof typeof product.paymentConfig.discounts] || ''}
                              onChange={e => updateField('paymentConfig', {
                                ...product.paymentConfig,
                                discounts: { ...product.paymentConfig?.discounts, [method.id]: parseFloat(e.target.value) }
                              })}
                            />
                          </div>

                          {/* Bank Details for Wire Transfer */}
                          {method.id === 'bank_transfer' && (
                            <div className="col-span-full mt-2 pt-2 border-t border-gray-200">
                              <h4 className="font-bold text-sm text-gray-700 mb-2">Banka Bilgileri</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                  type="text"
                                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                  placeholder="Banka Adı"
                                  value={product.paymentConfig?.bankDetails?.bankName || ''}
                                  onChange={e => updateField('paymentConfig', {
                                    ...product.paymentConfig,
                                    bankDetails: { ...product.paymentConfig?.bankDetails, bankName: e.target.value }
                                  })}
                                />
                                <input
                                  type="text"
                                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                  placeholder="IBAN"
                                  value={product.paymentConfig?.bankDetails?.iban || ''}
                                  onChange={e => updateField('paymentConfig', {
                                    ...product.paymentConfig,
                                    bankDetails: { ...product.paymentConfig?.bankDetails, iban: e.target.value }
                                  })}
                                />
                                <input
                                  type="text"
                                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                  placeholder="Alıcı Adı"
                                  value={product.paymentConfig?.bankDetails?.accountHolder || ''}
                                  onChange={e => updateField('paymentConfig', {
                                    ...product.paymentConfig,
                                    bankDetails: { ...product.paymentConfig?.bankDetails, accountHolder: e.target.value }
                                  })}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Button Design */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Buton Tasarımı</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Buton Metni</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={product.ctaText}
                      onChange={e => updateField('ctaText', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Buton Rengi</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-none"
                        value={product.ctaColor}
                        onChange={e => updateField('ctaColor', e.target.value)}
                      />
                      <span className="text-sm text-gray-500 font-mono">{product.ctaColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Mobile Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-32">
                <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-4 border-gray-800 max-w-[320px] mx-auto">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden h-[600px] relative flex flex-col">
                    {/* Mock Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-100 text-center">
                      <p className="font-bold text-gray-900 text-sm">{product.name || 'Ürün Adı'}</p>
                    </div>

                    {/* Mock Content */}
                    <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-xl"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>

                      {/* Form Preview */}
                      <div className="space-y-3 mt-8">
                        {product.checkoutConfig?.fields.filter(f => f.isVisible).map(field => (
                          <div key={field.id}>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">
                              {field.label} {field.isRequired && '*'}
                            </label>
                            <div className="h-8 bg-gray-50 border border-gray-200 rounded-lg w-full"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sticky Button */}
                    <div className="p-4 bg-white border-t border-gray-100">
                      <button
                        className="w-full py-3 font-bold text-white shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: product.ctaColor,
                          borderRadius: '12px' // Simplified for preview
                        }}
                      >
                        <span>{product.ctaText}</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. IMAGES */}
        {activeStep === 'images' && (
          <div className="space-y-6 animate-fade-in">

            {/* Video URL (Moved from Step 1) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="text-purple-500" size={20} />
                <h3 className="font-bold text-gray-900">Tanıtım Videosu</h3>
              </div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Video URL (YouTube/Vimeo)</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                placeholder="https://youtube.com/watch?v=..."
                value={product.videoUrl}
                onChange={e => updateField('videoUrl', e.target.value)}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">Ürün Görselleri</h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleImageAdd}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <UploadCloud size={16} /> Bilgisayardan Yükle
                  </button>
                  <button
                    onClick={handleImageAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    <ImageIcon size={16} /> Kütüphaneden Seç
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Upload Placeholder */}
                <div
                  onClick={handleImageAdd}
                  className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-all hover:bg-blue-50"
                >
                  <Plus size={32} />
                  <span className="text-sm font-bold mt-2">Görsel Ekle</span>
                </div>

                {product.images?.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => setDraggedIndex(idx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedIndex !== null && draggedIndex !== idx) {
                        const newImages = [...(product.images || [])];
                        const draggedItem = newImages[draggedIndex];
                        newImages.splice(draggedIndex, 1);
                        newImages.splice(idx, 0, draggedItem);
                        updateField('images', newImages);
                        setDraggedIndex(idx);
                      }
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`relative group aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-move ${draggedIndex === idx ? 'opacity-50 ring-2 ring-blue-500' : ''}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const newImages = product.images?.filter(i => i.id !== img.id);
                          updateField('images', newImages);
                        }}
                        className="bg-white text-red-600 p-2 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm pointer-events-none">
                        ANA RESİM
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Cover Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Panel Kapak Resmi</h3>
                  <p className="text-xs text-gray-500">Sadece yönetim panelinde ürün listesinde görünür.</p>
                </div>
                {product.adminCoverImage && (
                  <button onClick={() => updateField('adminCoverImage', '')} className="text-red-500 text-xs font-bold hover:underline">Kaldır</button>
                )}
              </div>

              {product.adminCoverImage ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                  <img src={product.adminCoverImage} alt="Admin Cover" className="w-full h-full object-cover" />
                </div>
              ) : (
                <button
                  onClick={handleImageAdd} // Ideally should distinguish context
                  className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-all"
                >
                  <ImageIcon size={24} />
                  <span className="text-xs font-bold mt-2">Kapak Resmi Seç</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 7. REVIEWS */}
        {activeStep === 'reviews' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-yellow-500" size={24} />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Müşteri Yorumları</h3>
                    <p className="text-sm text-gray-500">Ürün için sahte veya gerçek müşteri yorumları ekleyin.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newReview = {
                      id: `rev-${Date.now()}`,
                      productId: productId || '',
                      author: 'Müşteri',
                      rating: 5,
                      comment: 'Harika bir ürün, tavsiye ederim!',
                      isActive: true,
                      createdAt: new Date().toISOString()
                    };
                    updateField('reviews', [...(product.reviews || []), newReview]);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  <Plus size={16} /> Yorum Ekle
                </button>
              </div>

              <div className="space-y-4">
                {product.reviews?.map((review, idx) => (
                  <div key={review.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-4 items-start group hover:border-blue-200 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 font-bold text-lg border border-gray-200">
                      {review.author.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none font-bold text-gray-900 px-1 transition-colors"
                          value={review.author}
                          onChange={e => {
                            const newReviews = [...(product.reviews || [])];
                            newReviews[idx].author = e.target.value;
                            updateField('reviews', newReviews);
                          }}
                        />
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => {
                                const newReviews = [...(product.reviews || [])];
                                newReviews[idx].rating = star;
                                updateField('reviews', newReviews);
                              }}
                              className={`text-lg ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <textarea
                        className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        rows={2}
                        value={review.comment}
                        onChange={e => {
                          const newReviews = [...(product.reviews || [])];
                          newReviews[idx].comment = e.target.value;
                          updateField('reviews', newReviews);
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="rounded text-green-600 focus:ring-green-500"
                              checked={true} // Mock verified purchase
                              readOnly
                            />
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Satın Alan Kişi</span>
                          </label>
                        </div>
                        {/* Review Image Upload */}
                        <div>
                          {review.imageUrl ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 group/img">
                              <img src={review.imageUrl} className="w-full h-full object-cover" />
                              <button
                                onClick={() => {
                                  const newReviews = [...(product.reviews || [])];
                                  newReviews[idx].imageUrl = undefined;
                                  updateField('reviews', newReviews);
                                }}
                                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                              <ImageIcon size={14} /> Görsel Ekle
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    const newReviews = [...(product.reviews || [])];
                                    newReviews[idx].imageUrl = url;
                                    updateField('reviews', newReviews);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newReviews = product.reviews?.filter(r => r.id !== review.id);
                        updateField('reviews', newReviews);
                      }}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {(!product.reviews || product.reviews.length === 0) && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    Henüz yorum eklenmemiş.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 8. PROMOTIONS */}
        {activeStep === 'promotions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-500" size={24} />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Promosyonlar & Upsell</h3>
                    <p className="text-sm text-gray-500">Sipariş tamamlandıktan sonra müşteriye sunulacak ek teklifler.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newPromo = {
                      id: `promo-${Date.now()}`,
                      title: 'Yeni Fırsat Ürünü',
                      description: 'Bu ürünle birlikte harika gider!',
                      price: 99.90,
                      originalPrice: 129.90,
                      images: [{ id: '1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', order: 0 }],
                      triggerProductIds: [],
                      isActive: true
                    };
                    setAvailableUpsells([...availableUpsells, newPromo]);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  <Plus size={16} /> Yeni Promosyon Ekle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableUpsells.map(upsell => {
                  const isSelected = product.linkedUpsellIds?.includes(upsell.id);
                  return (
                    <div
                      key={upsell.id}
                      onClick={() => {
                        const currentIds = product.linkedUpsellIds || [];
                        const newIds = isSelected
                          ? currentIds.filter(id => id !== upsell.id)
                          : [...currentIds, upsell.id];
                        updateField('linkedUpsellIds', newIds);
                      }}
                      className={`
                        relative border-2 rounded-xl p-4 cursor-pointer transition-all group
                        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'}
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        {upsell.images?.[0] && <img src={upsell.images[0].url} className="w-full h-full object-cover" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{upsell.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">₺{upsell.price}</span>
                        {upsell.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">₺{upsell.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}


        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                const prevIdx = steps.findIndex(s => s.id === activeStep) - 1;
                if (prevIdx >= 0) setActiveStep(steps[prevIdx].id);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors ${activeStep === steps[0].id ? 'invisible' : ''}`}
            >
              <ArrowLeft size={20} /> Önceki Adım
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Kaydet ve Çık
              </button>

              <button
                onClick={() => {
                  const nextIdx = steps.findIndex(s => s.id === activeStep) + 1;
                  if (nextIdx < steps.length) {
                    setActiveStep(steps[nextIdx].id);
                  } else {
                    handleSave();
                  }
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                {activeStep === steps[steps.length - 1].id ? 'Tamamla' : 'Sonraki Adım'}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <MediaLibraryModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={handleMediaSelect}
        />
      </div>
    </div>
  );
};
export default ProductWizard;
