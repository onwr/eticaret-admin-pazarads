import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Product, OrderItem, OrderLog } from '../types';
import { updateOrder, getProducts, getOrderLogs, getCustomStatuses, getOrder } from '../lib/api';
import { useLanguage } from '../lib/i18n';
import { useNotification } from '../contexts/NotificationContext';
import OrderTimeline from '../components/OrderTimeline';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { ArrowLeft, Save, Printer, Ban, AlertTriangle, Package, Trash2, Plus, User, MapPin, Phone, CreditCard, Truck } from 'lucide-react';

interface OrderDetailsProps {
    orderId: string;
    onBack: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onBack }) => {
    const { t } = useLanguage();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data States
    const [products, setProducts] = useState<Product[]>([]);
    const [logs, setLogs] = useState<OrderLog[]>([]);
    const [customStatuses, setCustomStatuses] = useState<any[]>([]);

    // Form States
    const [formData, setFormData] = useState<any>({});
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // Add Item State
    const [activeTab, setActiveTab] = useState<'CATALOG' | 'PROMO' | 'MANUAL'>('CATALOG');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemPrice, setNewItemPrice] = useState(0);
    const [manualItemName, setManualItemName] = useState('');

    // Duplicate Check
    const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);

    useEffect(() => {
        fetchOrderData();
    }, [orderId]);

    const fetchOrderData = async () => {
        setLoading(true);
        try {
            const orderData = await getOrder(orderId);
            setOrder(orderData);

            // Initialize Form
            setFormData({
                name: orderData.customer?.name || '',
                phone: orderData.customer?.phone || '',
                address: orderData.customer?.address || '',
                city: orderData.customer?.city || '',
                district: orderData.customer?.district || '',
                status: orderData.status,
                paymentMethod: orderData.paymentMethod,
                shippingCost: 0, // Should be from order data if available
            });
            setOrderItems(orderData.items || []);

            // Load Dependencies
            const [prodData, logData, statusData] = await Promise.all([
                getProducts(),
                getOrderLogs(orderId),
                getCustomStatuses()
            ]);
            setProducts(prodData);
            setLogs(logData);
            setCustomStatuses(statusData);

        } catch (e) {
            console.error("Failed to load order", e);
        } finally {
            setLoading(false);
        }
    };

    // --- Item Logic ---
    const handleProductSelect = (productId: string) => {
        setSelectedProductId(productId);
        const prod = products.find(p => p.id === productId);
        if (prod) {
            setNewItemPrice(prod.prices[0]?.price || 0);
            setNewItemQty(1);
            if (prod.variants.length > 0) {
                setSelectedVariant(prod.variants[0].variantName);
            } else {
                setSelectedVariant('');
            }
        }
    };

    const handleAddItem = () => {
        if (activeTab === 'CATALOG') {
            if (!selectedProductId) return;
            const prod = products.find(p => p.id === selectedProductId);
            if (!prod) return;

            const newItem: OrderItem = {
                productId: prod.id,
                productName: prod.name,
                variantSelection: selectedVariant,
                quantity: newItemQty,
                unitPrice: newItemPrice,
                totalPrice: newItemPrice * newItemQty,
                image: prod.images[0]?.url
            };
            setOrderItems([...orderItems, newItem]);
        } else if (activeTab === 'MANUAL') {
            if (!manualItemName || newItemPrice <= 0) return;
            const newItem: OrderItem = {
                productId: `manual-${Date.now()}`,
                productName: manualItemName,
                variantSelection: 'Manuel Ekleme',
                quantity: newItemQty,
                unitPrice: newItemPrice,
                totalPrice: newItemPrice * newItemQty
            };
            setOrderItems([...orderItems, newItem]);
        }

        // Reset
        setSelectedProductId('');
        setSelectedVariant('');
        setNewItemQty(1);
        setNewItemPrice(0);
        setManualItemName('');
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const calculateSubtotal = () => orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const calculateTotal = () => calculateSubtotal() + (parseFloat(formData.shippingCost) || 0);

    const { addNotification } = useNotification();

    const handleSave = async () => {
        if (!order) return;
        setIsSubmitting(true);
        try {
            await updateOrder(order.id, {
                customer: {
                    ...order.customer!,
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    district: formData.district
                },
                status: formData.status,
                paymentMethod: formData.paymentMethod,
                items: orderItems,
                totalAmount: calculateTotal()
            });
            fetchOrderData();
            addNotification('success', 'Sipariş başarıyla güncellendi.');
        } catch (err) {
            console.error(err);
            addNotification('error', 'Güncelleme sırasında bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !order) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 animate-fade-in">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="flex justify-between items-center max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <span className="hover:text-blue-600 cursor-pointer transition-colors">Siparişler</span>
                                <span className="text-gray-300">/</span>
                                <span className="font-medium text-gray-900">Detay</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                Sipariş #{order.orderNumber}
                                <OrderStatusBadge status={order.status} />
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95">
                            <Printer size={18} /> Yazdır
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-100 font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95">
                            <Ban size={18} /> İptal Et
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save size={18} /> Kaydet
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6">

                {/* Duplicate Alert */}
                <div className="col-span-12">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <button
                            onClick={() => setIsDuplicateOpen(!isDuplicateOpen)}
                            className="flex items-center gap-2 text-yellow-800 font-bold w-full text-left"
                        >
                            <AlertTriangle size={20} />
                            Bu müşteriye ait 2 mükerrer sipariş kaydı bulundu!
                        </button>
                        {isDuplicateOpen && (
                            <div className="mt-4 bg-white rounded-lg border border-yellow-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-yellow-50/50 text-yellow-800 font-bold">
                                        <tr>
                                            <th className="p-3">Sipariş ID</th>
                                            <th className="p-3">Tarih</th>
                                            <th className="p-3">Durum</th>
                                            <th className="p-3">İçerik</th>
                                            <th className="p-3">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="p-3 border-t border-yellow-100">#ORD-1234</td>
                                            <td className="p-3 border-t border-yellow-100">2 Gün Önce</td>
                                            <td className="p-3 border-t border-yellow-100"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Teslim Edildi</span></td>
                                            <td className="p-3 border-t border-yellow-100">1 x Ürün A</td>
                                            <td className="p-3 border-t border-yellow-100">150.00 ₺</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Left Column: Operations & Customer */}
                <div className="col-span-12 lg:col-span-4 space-y-6">

                    {/* Status & Cargo */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Truck size={20} />
                            </div>
                            Operasyon
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sipariş Durumu</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer transition-all
                                        ${formData.status === OrderStatus.TESLIM_EDILDI ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                            formData.status === OrderStatus.IPTAL ? 'bg-rose-50 border-rose-200 text-rose-700' :
                                                formData.status === OrderStatus.KARGODA ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                    'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {Object.values(OrderStatus).map(s => (
                                        <option key={s} value={s}>{t(`status.${s}`)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Kargo Entegrasyonu</label>
                                <div className="bg-gray-50 rounded-lg p-4 text-center border-2 border-dashed border-gray-200">
                                    <button className="text-blue-600 font-bold text-sm hover:underline">
                                        + Kargo Barkodu Oluştur
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Form */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <User size={20} />
                            </div>
                            Müşteri Bilgileri
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ad Soyad</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">İl</label>
                                    <select
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="İstanbul">İstanbul</option>
                                        <option value="Ankara">Ankara</option>
                                        <option value="İzmir">İzmir</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">İlçe</label>
                                    <select
                                        value={formData.district}
                                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="Kadıköy">Kadıköy</option>
                                        <option value="Beşiktaş">Beşiktaş</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Açık Adres</label>
                                <textarea
                                    rows={3}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Log Timeline */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-800 mb-4">İşlem Geçmişi</h3>
                        <OrderTimeline logs={logs} />
                    </div>

                </div>

                {/* Right Column: Cart & Payment */}
                <div className="col-span-12 lg:col-span-8 space-y-6">

                    {/* Cart */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <Package size={20} />
                                </div>
                                Sepet İçeriği
                            </h3>
                        </div>

                        {/* Add Item Tabs */}
                        <div className="p-5 border-b border-gray-100 bg-white">
                            <div className="flex p-1 bg-gray-100/80 rounded-xl mb-6 w-fit">
                                <button
                                    onClick={() => setActiveTab('CATALOG')}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'CATALOG' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Katalogdan Ekle
                                </button>
                                <button
                                    onClick={() => setActiveTab('PROMO')}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'PROMO' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Promosyon Ekle
                                </button>
                                <button
                                    onClick={() => setActiveTab('MANUAL')}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'MANUAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Manuel Ekle
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed">
                                {activeTab === 'CATALOG' && (
                                    <>
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ürün</label>
                                            <select
                                                value={selectedProductId}
                                                onChange={e => handleProductSelect(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                                            >
                                                <option value="">Seçiniz...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-40">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Varyant</label>
                                            <select
                                                value={selectedVariant}
                                                onChange={e => setSelectedVariant(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                                            >
                                                <option value="">Standart</option>
                                                {selectedProductId && products.find(p => p.id === selectedProductId)?.variants.map((v, i) => (
                                                    <option key={i} value={v.variantName}>{v.variantName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'MANUAL' && (
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ürün Adı</label>
                                        <input
                                            type="text"
                                            value={manualItemName}
                                            onChange={e => setManualItemName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                                            placeholder="Örn: Özel Hizmet Bedeli"
                                        />
                                    </div>
                                )}

                                <div className="w-24">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adet</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newItemQty}
                                        onChange={e => setNewItemQty(parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                                    />
                                </div>
                                <div className="w-28">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fiyat</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newItemPrice}
                                        onChange={e => setNewItemPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleAddItem}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>

                        {/* Items List */}
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Ürün</th>
                                    <th className="px-6 py-3">Varyant</th>
                                    <th className="px-6 py-3 text-center">Adet</th>
                                    <th className="px-6 py-3 text-right">Fiyat</th>
                                    <th className="px-6 py-3 text-right">Toplam</th>
                                    <th className="px-6 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orderItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.productName}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{item.variantSelection || '-'}</td>
                                        <td className="px-6 py-4 text-center">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{item.unitPrice.toFixed(2)} ₺</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">{item.totalPrice.toFixed(2)} ₺</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleRemoveItem(idx)} className="text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <CreditCard size={20} />
                            </div>
                            Ödeme Özeti
                        </h3>

                        <div className="space-y-3 max-w-xs ml-auto">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Ara Toplam</span>
                                <span>{calculateSubtotal().toFixed(2)} ₺</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 items-center">
                                <span>Kargo Ücreti</span>
                                <input
                                    type="number"
                                    className="w-20 text-right border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                                    value={formData.shippingCost}
                                    onChange={e => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between text-lg font-bold text-gray-900">
                                <span>Genel Toplam</span>
                                <span className="text-blue-600">{calculateTotal().toFixed(2)} ₺</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default OrderDetails;
