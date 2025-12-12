
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Phone, MapPin, Package, Clock, Plus, Trash2, Search, CreditCard, Calendar, Truck, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Ban, Info, RefreshCw } from 'lucide-react';
import { Order, OrderStatus, Product, OrderItem, OrderLog, ShippingCompany, ShippingProviderType, Upsell, ShippingSubCarrier } from '../../types';
import { updateOrder, createOrder, getProducts, getOrderLogs, getCustomStatuses, getShippingCompanies, getUpsells, checkDuplicateOrders, getBlacklist } from '../../lib/api';
import { cities, getDistricts } from '../../lib/tr_data';
import { useLanguage } from '../../lib/i18n';
import OrderTimeline from '../OrderTimeline';
import OrderStatusBadge from '../OrderStatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

interface OrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onUpdate }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [activeTab, setActiveTab] = useState<'customer' | 'cart' | 'cargo' | 'history'>('customer');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data States
    const [products, setProducts] = useState<Product[]>([]);
    const [logs, setLogs] = useState<OrderLog[]>([]);
    const [customStatuses, setCustomStatuses] = useState<any[]>([]);
    const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
    const [upsells, setUpsells] = useState<Upsell[]>([]);
    const [isBlacklisted, setIsBlacklisted] = useState(false);
    const [duplicateOrders, setDuplicateOrders] = useState<Order[]>([]);

    // Form States
    const [formData, setFormData] = useState<any>({});
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // Add Item State
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemPrice, setNewItemPrice] = useState(0);
    const [availablePrices, setAvailablePrices] = useState<any[]>([]); // For multi-price selection

    // Manual Item State
    const [isManualItem, setIsManualItem] = useState(false);
    const [manualItemName, setManualItemName] = useState('');

    // Cargo Cost State
    const [selectedCargoCompanyId, setSelectedCargoCompanyId] = useState('');
    const [selectedSubCarrierCode, setSelectedSubCarrierCode] = useState('');
    const [isCostInfoOpen, setIsCostInfoOpen] = useState(false);

    // Postpone State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [postponeDate, setPostponeDate] = useState('');

    // Shipping Fee State
    const [manualShippingFee, setManualShippingFee] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (order) {
                // Edit Mode
                setFormData({
                    name: order.customer?.name || '',
                    phone: order.customer?.phone || '',
                    address: order.customer?.address || '',
                    city: order.customer?.city || '',
                    district: order.customer?.district || '',
                    status: order.status,
                    paymentMethod: order.paymentMethod,
                    note: '',
                    isRural: false,
                });
                setOrderItems(order.items || []);

                // Initialize shipping fee from total
                const prodTotal = (order.items || []).reduce((sum, item) => sum + item.totalPrice, 0);
                const initialShipping = Math.max(0, order.totalAmount - prodTotal);
                setManualShippingFee(initialShipping);
            } else {
                // Create Mode
                setFormData({
                    name: '',
                    phone: '',
                    address: '',
                    city: '',
                    district: '',
                    status: OrderStatus.NEW,
                    paymentMethod: 'COD',
                    note: '',
                    isRural: false,
                });
                setOrderItems([]);
                setActiveTab('customer'); // Always start at customer tab for new orders
            }

            // Fetch Dependencies
            loadDependencies();
        }
    }, [isOpen, order]);

    const loadDependencies = async () => {
        // if (!order) return; // Allow loading dependencies for new order
        try {
            const [prodData, logData, statusData, shipData, dealerData, upsellData, blacklistData] = await Promise.all([
                getProducts(),
                order ? getOrderLogs(order.id) : Promise.resolve([]),
                getCustomStatuses(),
                getShippingCompanies(),
                getShippingCompanies(),
                getUpsells(),
                getBlacklist()
            ]);
            setProducts(prodData);
            setLogs(logData);
            setCustomStatuses(statusData);
            setShippingCompanies(shipData.filter(c => c.isActive));
            setShippingCompanies(shipData.filter(c => c.isActive));
            setUpsells(upsellData);

            // Check Blacklist
            if (order && order.ipAddress) {
                const isBlocked = blacklistData.some(b => b.ip === order.ipAddress);
                setIsBlacklisted(isBlocked);
            }

            // Check Duplicates
            if (order) {
                const duplicates = await checkDuplicateOrders(order.customer.phone, order.customer.name);
                setDuplicateOrders(duplicates.filter(o => o.id !== order.id));
            }

            // Set default cargo company if not set
            if (!selectedCargoCompanyId && shipData.length > 0) {
                const defaultCompany = shipData.find(c => c.isDefault) || shipData[0];
                setSelectedCargoCompanyId(defaultCompany.id);
                // Default subcarrier if exists
                if (defaultCompany.subCarriers && defaultCompany.subCarriers.length > 0) {
                    setSelectedSubCarrierCode(defaultCompany.subCarriers[0].code);
                }
            }
        } catch (e) {
            console.error("Failed to load order dependencies", e);
        }
    };

    // --- Item Logic ---
    const handleProductSelect = (productId: string) => {
        setSelectedProductId(productId);
        const prod = products.find(p => p.id === productId);
        if (prod) {
            setNewItemPrice(prod.prices[0]?.price || 0);
            setNewItemQty(1);
            setAvailablePrices(prod.prices || []);

            // Default variant
            if (prod.variants.length > 0) {
                setSelectedVariant(prod.variants[0].variantName);
            } else {
                setSelectedVariant('');
            }
        } else {
            setAvailablePrices([]);
        }
    };

    const handlePriceSelect = (price: number) => {
        setNewItemPrice(price);
    };

    const handleAddItem = () => {
        if (isManualItem) {
            if (!manualItemName || newItemPrice <= 0) return;
            const newItem: OrderItem = {
                productId: 'manual',
                productName: manualItemName,
                quantity: newItemQty,
                unitPrice: newItemPrice,
                totalPrice: newItemPrice * newItemQty,
                image: ''
            };
            setOrderItems([...orderItems, newItem]);
            setManualItemName('');
            setNewItemQty(1);
            setNewItemPrice(0);
            setIsManualItem(false);
            return;
        }

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

        // Reset selection
        setSelectedProductId('');
        setSelectedVariant('');
        setNewItemQty(1);
        setNewItemPrice(0);
        setAvailablePrices([]);
    };

    const handleAddPromotion = (upsell: Upsell) => {
        const newItem: OrderItem = {
            productId: upsell.id,
            productName: `[PROMO] ${upsell.title}`,
            quantity: 1,
            unitPrice: upsell.price,
            totalPrice: upsell.price,
            image: upsell.images?.[0]?.url
        };
        setOrderItems([...orderItems, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...orderItems];
        const item = { ...newItems[index], [field]: value };

        // Recalculate total if qty or price changes
        if (field === 'quantity' || field === 'unitPrice') {
            item.totalPrice = item.quantity * item.unitPrice;
        }

        newItems[index] = item;
        setOrderItems(newItems);
    };

    // --- Calculations ---
    // Helper to determine shipping fee display
    const getShippingInfo = () => {
        if (order?.landingPage) {
            const mainItem = orderItems[0];
            if (mainItem) {
                const product = products.find(p => p.id === mainItem.productId);
                if (product?.isFreeShipping) {
                    return { text: 'Ücretsiz Kargo', isFree: true, value: 0 };
                }
                const price = product?.prices.find(p => p.price === mainItem.unitPrice);
                const cost = price?.shippingCost || 39.90;
                return { text: `${cost.toFixed(2)} ₺`, isFree: false, value: cost };
            }
        }
        return null;
    };

    const calculateProductsTotal = () => {
        return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    };

    const calculateTotal = () => {
        const shippingInfo = getShippingInfo();
        const shippingFee = shippingInfo ? shippingInfo.value : manualShippingFee;
        return calculateProductsTotal() + shippingFee;
    };

    // --- Cargo Cost Calculation Logic ---
    const calculateOperationalCost = () => {
        const company = shippingCompanies.find(c => c.id === selectedCargoCompanyId);
        if (!company) return null;

        let carrier: ShippingSubCarrier | undefined;

        // If it's an aggregator (like Fest), use the selected sub-carrier
        if (company.type === ShippingProviderType.AGGREGATOR && company.subCarriers) {
            carrier = company.subCarriers.find(sc => sc.code === selectedSubCarrierCode);
        }
        // Fallback to first sub-carrier or mock logic if direct
        else if (company.subCarriers && company.subCarriers.length > 0) {
            carrier = company.subCarriers[0];
        }

        if (!carrier) return null;

        // 1. Delivery Fee (Teslim Ücreti)
        const deliveryFee = carrier.fixedPrice || 0;

        // 2. Service Fee (Tahsilat Hizmet Bedeli)
        // Only applies if payment is COD (Cash or Card)
        let serviceFee = 0;
        if (formData.paymentMethod === 'COD' || formData.paymentMethod === 'CC_ON_DOOR') {
            // Use carrier specific logic if available, otherwise default
            // Assuming carrier has a field for this or we use a default
            serviceFee = 38.00; // Mock default as per image
        }

        // 3. Card Commission (Kart Komisyonu)
        let cardCommission = 0;
        if (formData.paymentMethod === 'CC_ON_DOOR') {
            cardCommission = calculateTotal() * (carrier.cardCommission || 0);
        }

        const totalCost = deliveryFee + serviceFee + cardCommission;
        const profit = calculateTotal() - totalCost;

        return {
            deliveryFee,
            serviceFee,
            cardCommission,
            totalCost,
            profit
        };
    };

    const costInfo = calculateOperationalCost();
    const shippingInfo = getShippingInfo();

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validation for new orders
            if (!order) {
                if (!formData.name || !formData.phone) {
                    addNotification('warning', 'Lütfen müşteri adı ve telefon numarasını girin.');
                    setIsSubmitting(false);
                    return;
                }
                if (orderItems.length === 0) {
                    addNotification('warning', 'Lütfen en az bir ürün ekleyin.');
                    setIsSubmitting(false);
                    return;
                }
            }

            const orderData = {
                customer: {
                    id: order?.customer?.id || `c${Date.now()}`,
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    district: formData.district
                },
                status: formData.status,
                paymentMethod: formData.paymentMethod,
                items: orderItems,
                totalAmount: calculateTotal(),
            };

            if (order) {
                await updateOrder(order.id, {
                    ...orderData,
                    customer: { ...order.customer!, ...orderData.customer }
                }, user ? { id: user.id, name: user.name || 'Unknown' } : undefined);
            } else {
                await createOrder(orderData, user ? { id: user.id, name: user.name || 'Unknown' } : { id: 'admin', name: 'Admin' });
            }
            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
            addNotification('error', 'Güncelleme başarısız oldu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col font-sans">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-gray-900">{order ? `Sipariş #${order.orderNumber}` : 'Yeni Sipariş'}</h2>
                            {order && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                    {new Date(order.createdAt).toLocaleString('tr-TR')}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">DURUM</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none appearance-none cursor-pointer transition-all
                                        ${formData.status === OrderStatus.TESLIM_EDILDI ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                            formData.status === OrderStatus.IPTAL ? 'bg-rose-50 border-rose-200 text-rose-700' :
                                                formData.status === OrderStatus.KARGODA ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                    'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {Object.values(OrderStatus)
                                        .filter(s => s !== OrderStatus.TESLIM_EDILDI && s !== OrderStatus.IADE)
                                        .map(s => (
                                            <option key={s} value={s}>{t(`status.${s}`)}</option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex items-end relative">
                                <button
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                    className={`px-4 py-2 border rounded-xl text-sm font-bold transition-all flex items-center gap-2 h-[38px] shadow-sm active:scale-95 ${showDatePicker ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <Calendar size={16} /> İleri Tarihe At
                                </button>

                                {showDatePicker && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 animate-fade-in">
                                        <h4 className="text-sm font-bold text-gray-800 mb-2">Tarih Seçin</h4>
                                        <input
                                            type="datetime-local"
                                            value={postponeDate}
                                            onChange={e => setPostponeDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setShowDatePicker(false)}
                                                className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                                            >
                                                İptal
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Handle postpone logic here (e.g. update status to ARANACAK and set scheduled date)
                                                    setFormData({ ...formData, status: OrderStatus.ARANACAK });
                                                    // You might need a separate field for scheduledDate in Order type
                                                    setShowDatePicker(false);
                                                    addNotification('success', `Sipariş ${new Date(postponeDate).toLocaleString()} tarihine ertelendi.`);
                                                }}
                                                className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors ml-4">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                {/* Tabs */}
                <div className="px-6 pb-0 bg-white border-b border-gray-100">
                    <div className="flex p-1 bg-gray-100/80 rounded-xl w-fit mb-4">
                        <button
                            onClick={() => setActiveTab('customer')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'customer' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <User size={16} /> Müşteri
                        </button>
                        <button
                            onClick={() => setActiveTab('cart')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'cart' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Package size={16} /> Sepet & Finans
                        </button>
                        <button
                            onClick={() => setActiveTab('cargo')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'cargo' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Truck size={16} /> Kargo
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Clock size={16} /> Geçmiş
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">

                    {/* TAB 1: CUSTOMER */}
                    {activeTab === 'customer' && (
                        <div className="space-y-6 animate-fade-in">

                            {/* Warnings */}
                            {isBlacklisted && order && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                                    <div className="p-2 bg-white rounded-lg text-rose-600 shadow-sm">
                                        <Ban size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-rose-900">Müşteri Kara Listede!</h4>
                                        <p className="text-xs text-rose-700 mt-1">Bu IP adresi ({order.ipAddress}) daha önce şüpheli işlem nedeniyle engellenmiş.</p>
                                    </div>
                                </div>
                            )}

                            {duplicateOrders.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                                    <div className="p-2 bg-white rounded-lg text-amber-600 shadow-sm">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-900">Mükerrer Sipariş Şüphesi</h4>
                                        <p className="text-xs text-amber-700 mt-1">Bu müşteri ile eşleşen {duplicateOrders.length} adet başka sipariş bulundu.</p>
                                        <div className="mt-2 space-y-1">
                                            {duplicateOrders.map(d => (
                                                <button
                                                    key={d.id}
                                                    onClick={() => window.open(`/orders?id=${d.id}`, '_blank')}
                                                    className="text-xs text-amber-800 font-bold hover:underline block text-left bg-white/50 px-2 py-1 rounded"
                                                >
                                                    #{d.orderNumber} - {new Date(d.createdAt).toLocaleDateString()} - {d.status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 mb-4">Müşteri Bilgileri</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Ad Soyad</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Telefon</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all duration-200 tracking-wide font-medium"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">İl</label>
                                            <select
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value, district: '' })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                            >
                                                <option value="">Seçiniz</option>
                                                {cities.map(c => (
                                                    <option key={c.id} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">İlçe</label>
                                            <select
                                                value={formData.district}
                                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                                                disabled={!formData.city}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors disabled:bg-gray-100"
                                            >
                                                <option value="">Seçiniz</option>
                                                {getDistricts(formData.city).map((d, i) => (
                                                    <option key={i} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Adres</label>
                                        <textarea
                                            rows={3}
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 mb-4">Sipariş Notu</h3>
                                <textarea
                                    rows={3}
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Müşteri notu..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 2: CART & FINANCE */}
                    {activeTab === 'cart' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Items List */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-gray-800">Sepet İçeriği</h3>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{orderItems.length} Kalem</span>
                                </div>

                                <div className="space-y-4">
                                    {orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs overflow-hidden">
                                                {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> : 'IMG'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{item.productName}</h4>
                                                <p className="text-xs text-gray-500">{item.variantSelection || 'Standart'}</p>
                                            </div>
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-8">
                                                <button
                                                    onClick={() => handleUpdateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                                                    className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-white hover:text-red-500 rounded-l-lg transition-colors"
                                                >-</button>
                                                <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateItem(idx, 'quantity', item.quantity + 1)}
                                                    className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-white hover:text-green-500 rounded-r-lg transition-colors"
                                                >+</button>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <div className="font-bold text-gray-900 text-sm">{item.totalPrice.toFixed(2)} ₺</div>
                                                <div className="text-xs text-gray-400">{item.quantity} x {item.unitPrice}</div>
                                            </div>
                                            <button onClick={() => handleRemoveItem(idx)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Product Section */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-4 mb-3">
                                        <button
                                            onClick={() => setIsManualItem(false)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${!isManualItem ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            Listeden Seç
                                        </button>
                                        <button
                                            onClick={() => setIsManualItem(true)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isManualItem ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            Manuel Ekle
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-3 items-end">
                                        {!isManualItem ? (
                                            <>
                                                <div className="flex-1 min-w-[200px]">
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Ürün</label>
                                                    <select
                                                        value={selectedProductId}
                                                        onChange={e => handleProductSelect(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    >
                                                        <option value="">Ürün Seçiniz...</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="w-40">
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Varyant</label>
                                                    <select
                                                        value={selectedVariant}
                                                        onChange={e => setSelectedVariant(e.target.value)}
                                                        disabled={!selectedProductId}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                                                    >
                                                        <option value="">Standart</option>
                                                        {selectedProductId && products.find(p => p.id === selectedProductId)?.variants.map((v, i) => (
                                                            <option key={i} value={v.variantName}>{v.variantName}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 min-w-[200px]">
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Ürün Adı</label>
                                                <input
                                                    type="text"
                                                    value={manualItemName}
                                                    onChange={e => setManualItemName(e.target.value)}
                                                    placeholder="Örn: Özel Hizmet Bedeli"
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        )}

                                        <div className="w-24">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Adet</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={newItemQty}
                                                onChange={e => setNewItemQty(parseInt(e.target.value) || 1)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>

                                        <div className="w-28">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Birim Fiyat</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={newItemPrice}
                                                onChange={e => setNewItemPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>

                                        <button
                                            onClick={handleAddItem}
                                            disabled={(!isManualItem && !selectedProductId) || (isManualItem && !manualItemName)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors h-[38px]"
                                        >
                                            Ekle
                                        </button>
                                    </div>

                                    {/* Multi-price Selection */}
                                    {!isManualItem && availablePrices.length > 0 && (
                                        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                                            {availablePrices.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handlePriceSelect(p.price)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${newItemPrice === p.price ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                                                >
                                                    {p.quantity} Adet: {p.price} ₺
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Promotions */}
                                <div className="mt-4">
                                    <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">Hızlı Promosyon Ekle</h4>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {upsells.map(upsell => (
                                            <button
                                                key={upsell.id}
                                                onClick={() => handleAddPromotion(upsell)}
                                                className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors flex-shrink-0"
                                            >
                                                <div className="w-8 h-8 bg-white rounded border border-purple-200 overflow-hidden">
                                                    {upsell.images?.[0] ? <img src={upsell.images[0].url} className="w-full h-full object-cover" /> : <Package size={16} className="m-auto text-purple-300" />}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs font-bold text-purple-900">{upsell.title}</div>
                                                    <div className="text-[10px] text-purple-600">{upsell.price} ₺</div>
                                                </div>
                                                <Plus size={14} className="text-purple-400" />
                                            </button>
                                        ))}
                                        {upsells.length === 0 && <span className="text-xs text-gray-400 italic">Aktif promosyon bulunamadı.</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Finance Detail */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <CreditCard size={18} className="text-blue-600" />
                                    Finans Detayı
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm text-gray-600 px-2">
                                        <span>Ürünler Toplamı</span>
                                        <span className="font-medium">{calculateProductsTotal().toFixed(2)} ₺</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 px-2">
                                        <span>Müşteri Kargo Ücreti</span>
                                        <div className="w-24">
                                            {shippingInfo ? (
                                                <div className={`w-full text-right px-2 py-1 text-sm font-bold rounded-lg border ${shippingInfo.isFree ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                    {shippingInfo.text}
                                                </div>
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={manualShippingFee}
                                                    onChange={e => setManualShippingFee(parseFloat(e.target.value) || 0)}
                                                    className="w-full text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-blue-500 transition-colors"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600 px-2">
                                        <span>İskonto / İndirim (-)</span>
                                        <div className="w-24">
                                            <input type="number" className="w-full text-right bg-green-50 border border-green-200 text-green-700 rounded-lg px-2 py-1 text-sm outline-none focus:border-green-500 transition-colors" defaultValue="0" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-blue-600 px-2">
                                        <span>Ek Hizmet Bedeli (+)</span>
                                        <div className="w-24">
                                            <input type="number" className="w-full text-right bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-2 py-1 text-sm outline-none focus:border-blue-500 transition-colors" defaultValue="0" />
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 flex justify-between items-center shadow-lg shadow-gray-200">
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium mb-0.5">TAHSİL EDİLECEK TUTAR</p>
                                                <p className="text-xs text-gray-500">{orderItems.length} Adet Ürün</p>
                                            </div>
                                            <span className="text-2xl font-black text-white tracking-tight">{calculateTotal().toFixed(2)} ₺</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: CARGO */}
                    {activeTab === 'cargo' && (
                        <div className="space-y-6 animate-fade-in">

                            {/* Payment Method Selection (Redesigned) */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 mb-4">Ödeme Yönetimi</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <button
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                                        className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'COD' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                    >
                                        <div className="font-bold text-xs">Kapıda Nakit</div>
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'CC_ON_DOOR' })}
                                        className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'CC_ON_DOOR' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                    >
                                        <div className="font-bold text-xs">Kapıda K.Kartı</div>
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'WIRE' })}
                                        className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'WIRE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                    >
                                        <div className="font-bold text-xs">Havale / EFT</div>
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, paymentMethod: 'ONLINE' })}
                                        className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'ONLINE' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                    >
                                        <div className="font-bold text-xs">Online Ödeme</div>
                                    </button>
                                </div>


                            </div>

                            {/* Cargo Company Selection */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 mb-4">Kargo Firması Seçimi</h3>
                                <div className="space-y-3">
                                    {shippingCompanies
                                        .filter(company => {
                                            // Dynamic Payment Method Filtering
                                            if (formData.paymentMethod === 'COD') {
                                                // Check if any sub-carrier supports Cash on Door
                                                const supports = company.subCarriers?.some(sc => sc.isCashOnDoorAvailable);
                                                return supports ?? false;
                                            }
                                            if (formData.paymentMethod === 'CC_ON_DOOR') {
                                                // Check if any sub-carrier supports Card on Door
                                                const supports = company.subCarriers?.some(sc => sc.isCardOnDoorAvailable);
                                                return supports ?? false;
                                            }

                                            // Keep Rural check (legacy/specific logic)
                                            if (formData.isRural && !company.name.includes('PTT')) return false;

                                            return true;
                                        })
                                        .map(company => (
                                            <div key={company.id} className={`rounded-xl border-2 transition-all overflow-hidden ${selectedCargoCompanyId === company.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                                <div
                                                    className="p-4 flex items-center justify-between cursor-pointer"
                                                    onClick={() => setSelectedCargoCompanyId(company.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCargoCompanyId === company.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                                                            {selectedCargoCompanyId === company.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                        <span className="font-bold text-gray-900">{company.name}</span>
                                                        {company.isDefault && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Varsayılan</span>}
                                                    </div>
                                                    <Truck size={20} className={selectedCargoCompanyId === company.id ? 'text-blue-600' : 'text-gray-300'} />
                                                </div>

                                                {/* Sub-carriers for Aggregators */}
                                                {selectedCargoCompanyId === company.id && company.type === ShippingProviderType.AGGREGATOR && company.subCarriers && (
                                                    <div className="px-4 pb-4 pl-12 space-y-2 animate-fade-in">
                                                        <p className="text-xs font-bold text-gray-500 mb-2">Alt Taşıyıcı Seçimi:</p>
                                                        {company.subCarriers
                                                            .filter(sub => {
                                                                if (formData.paymentMethod === 'COD') return sub.isCashOnDoorAvailable;
                                                                if (formData.paymentMethod === 'CC_ON_DOOR') return sub.isCardOnDoorAvailable;
                                                                return true;
                                                            })
                                                            .map(sub => (
                                                                <label key={sub.code} className="flex items-center gap-2 cursor-pointer group">
                                                                    <input
                                                                        type="radio"
                                                                        name="subCarrier"
                                                                        checked={selectedSubCarrierCode === sub.code}
                                                                        onChange={() => setSelectedSubCarrierCode(sub.code)}
                                                                        className="text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{sub.name}</span>
                                                                    <span className="text-xs text-gray-400">({sub.fixedPrice} ₺)</span>
                                                                </label>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    {shippingCompanies.length === 0 && <div className="text-center py-4 text-gray-500">Aktif kargo firması bulunamadı.</div>}
                                </div>
                            </div>

                            {/* Operational Cost Info (Admin Only) */}
                            {user?.role === 'ADMIN' && costInfo && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => setIsCostInfoOpen(!isCostInfoOpen)}
                                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Info size={18} className="text-blue-600" />
                                            <span className="font-bold text-gray-800 text-sm">Operasyonel Maliyet (Bilgi)</span>
                                        </div>
                                        {isCostInfoOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                    </button>

                                    {isCostInfoOpen && (
                                        <div className="p-6 border-t border-gray-200 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Teslim Ücreti:</span>
                                                <span className="font-medium text-gray-900">{costInfo.deliveryFee.toFixed(2)} ₺</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tahsilat Hizmet Bedeli:</span>
                                                <span className="font-medium text-gray-900">{costInfo.serviceFee.toFixed(2)} ₺</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Kart Komisyonu:</span>
                                                <span className="font-medium text-gray-900">{costInfo.cardCommission.toFixed(2)} ₺</span>
                                            </div>
                                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                                <span className="font-bold text-gray-700">TOPLAM MALİYET:</span>
                                                <span className="font-bold text-red-600">{costInfo.totalCost.toFixed(2)} ₺</span>
                                            </div>
                                            <div className="pt-2 flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Kargo Kâr/Zarar:</span>
                                                <span className={`font-bold ${costInfo.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {costInfo.profit.toFixed(2)} ₺
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-center text-gray-400 mt-2">* Bu alan müşteriye gösterilmez, sadece kârlılık analizi içindir.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: HISTORY */}
                    {activeTab === 'history' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 mb-4">Sipariş Geçmişi</h3>
                                <OrderTimeline logs={logs} />
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center flex-shrink-0">
                    <div>
                        <span className="block text-[10px] font-bold text-gray-500 uppercase">GENEL TOPLAM</span>
                        <span className="text-xl font-extrabold text-gray-900">{calculateTotal().toFixed(2)} ₺</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-lg shadow-blue-200"
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Kaydet ve Güncelle
                    </button>
                </div>

            </div>
        </>
    );
};

export default OrderDetailModal;
