import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Plus, Trash2, FileText, Search, AlertCircle, ClipboardList, Package } from 'lucide-react';
import { Product, StockMovementType } from '../../types';
import { getProducts, addStockMovement } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

interface StockEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface StockItem {
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    quantity: number;
    image: string;
}

const StockEntryModal: React.FC<StockEntryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [products, setProducts] = useState<Product[]>([]);
    const [items, setItems] = useState<StockItem[]>([]);
    const [documentUrl, setDocumentUrl] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [type, setType] = useState<StockMovementType>(StockMovementType.IN);

    // Selection State
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            loadProducts();
        }
    }, [isOpen]);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products", error);
        }
    };

    const handleAddItem = () => {
        if (!selectedProductId || quantity <= 0) return;

        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        let variantName = 'Standart';
        let variantId = '';

        if (selectedVariantId) {
            const variant = product.variants.find(v => v.id === selectedVariantId);
            if (variant) {
                variantName = variant.variantName;
                variantId = variant.id;
            }
        } else if (product.variants.length > 0) {
            // Auto-select first variant if not selected but exists
            variantName = product.variants[0].variantName;
            variantId = product.variants[0].id;
        }

        const newItem: StockItem = {
            productId: product.id,
            variantId,
            productName: product.name,
            variantName,
            quantity,
            image: product.images[0]?.url || ''
        };

        setItems([...items, newItem]);

        // Reset selection
        setSelectedProductId('');
        setSelectedVariantId('');
        setQuantity(1);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            alert("Lütfen en az bir ürün ekleyin.");
            return;
        }
        if (type === StockMovementType.IN && !documentUrl) {
            alert("Lütfen irsaliye veya belge görseli yükleyin (Zorunlu).");
            return;
        }

        setIsSubmitting(true);
        try {
            // Process all items
            for (const item of items) {
                await addStockMovement({
                    productId: item.productId,
                    variantId: item.variantId,
                    productName: item.productName,
                    variantName: item.variantName,
                    quantity: item.quantity,
                    type: type,
                    documentUrl,
                    note,
                    userId: user?.id || 'admin',
                    userName: user?.name || 'Admin'
                });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Stock entry failed", error);
            addNotification('error', "Stok girişi sırasında bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mock File Upload
    const handleFileUpload = () => {
        // In a real app, this would open a file picker and upload to S3/Cloudinary
        const mockUrl = "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?auto=format&fit=crop&q=80&w=1000";
        setDocumentUrl(mockUrl);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-black/5">

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${type === StockMovementType.IN ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            {type === StockMovementType.IN ? <UploadCloud size={24} /> : <ClipboardList size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Stok İşlemi</h2>
                            <p className="text-sm text-gray-500 font-medium">Stok girişlerini ve düzeltmelerini buradan yönetin.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all duration-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

                    {/* Left Panel: Input Form */}
                    <div className="flex-1 overflow-y-auto p-8 border-r border-gray-100 bg-gray-50/50">
                        <div className="space-y-8 max-w-2xl mx-auto">

                            {/* 1. Operation Type Toggle */}
                            <div className="bg-gray-200/50 p-1.5 rounded-2xl flex relative">
                                <button
                                    onClick={() => setType(StockMovementType.IN)}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${type === StockMovementType.IN
                                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <UploadCloud size={18} />
                                    Stok Girişi (Satın Alma)
                                </button>
                                <button
                                    onClick={() => setType(StockMovementType.ADJUST)}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${type === StockMovementType.ADJUST
                                        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <AlertCircle size={18} />
                                    Stok Sayım / Düzeltme
                                </button>
                            </div>

                            {/* 2. Document Upload (Conditional) */}
                            {type === StockMovementType.IN && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-blue-500" />
                                        İrsaliye / Belge <span className="text-red-500">*</span>
                                    </label>

                                    {documentUrl ? (
                                        <div className="relative group overflow-hidden rounded-2xl border-2 border-blue-100 bg-blue-50/30 p-4 flex items-center gap-4 transition-all hover:border-blue-200">
                                            <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-blue-100">
                                                <img src={documentUrl} alt="Doc" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-sm">Yüklenen Belge</h4>
                                                <p className="text-xs text-gray-500 mt-1">belge_gorseli.jpg</p>
                                            </div>
                                            <button
                                                onClick={() => setDocumentUrl('')}
                                                className="p-2 bg-white text-red-500 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={handleFileUpload}
                                            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 group"
                                        >
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                                                <UploadCloud size={24} className="text-gray-400 group-hover:text-blue-500" />
                                            </div>
                                            <p className="font-bold text-gray-700">Belge Yüklemek İçin Tıklayın</p>
                                            <p className="text-xs text-gray-400 mt-1">veya dosyayı buraya sürükleyin</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. Add Product Form */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                                    <h3 className="font-bold text-gray-900">Ürün Bilgileri</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Ürün Seçimi</label>
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                            <select
                                                value={selectedProductId}
                                                onChange={e => {
                                                    setSelectedProductId(e.target.value);
                                                    setSelectedVariantId('');
                                                }}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100"
                                            >
                                                <option value="">Ürün Ara veya Seç...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Varyant</label>
                                        <select
                                            value={selectedVariantId}
                                            onChange={e => setSelectedVariantId(e.target.value)}
                                            disabled={!selectedProductId}
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-100"
                                        >
                                            <option value="">Varyant Seçiniz</option>
                                            {selectedProductId && products.find(p => p.id === selectedProductId)?.variants.map(v => (
                                                <option key={v.id} value={v.id}>{v.variantName} (Stok: {v.stock})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Miktar</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">Adet</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddItem}
                                    disabled={!selectedProductId}
                                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <Plus size={20} />
                                    Listeye Ekle
                                </button>
                            </div>

                            {/* Note Input */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">İşlem Notu</label>
                                <textarea
                                    rows={3}
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Bu işlemle ilgili eklemek istediğiniz notlar..."
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Summary List */}
                    <div className="w-full lg:w-[400px] bg-white flex flex-col border-l border-gray-100 h-full">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardList size={20} className="text-gray-400" />
                                Eklenecek Ürünler
                                <span className="bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full ml-auto">{items.length}</span>
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Package size={32} className="opacity-20" />
                                    </div>
                                    <p className="font-medium">Henüz ürün eklenmedi.</p>
                                    <p className="text-xs mt-1 opacity-60">Soldaki formdan ürün seçip ekleyebilirsiniz.</p>
                                </div>
                            ) : (
                                items.map((item, idx) => (
                                    <div key={idx} className="group flex gap-4 p-3 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all duration-200 relative">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                                            {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <h4 className="font-bold text-gray-900 text-sm truncate">{item.productName}</h4>
                                            <p className="text-xs text-gray-500 truncate mb-2">{item.variantName}</p>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${type === StockMovementType.IN
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : 'bg-orange-50 text-orange-700 border border-orange-100'
                                                }`}>
                                                {type === StockMovementType.IN ? <Plus size={10} /> : <AlertCircle size={10} />}
                                                {item.quantity} Adet
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(idx)}
                                            className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || items.length === 0 || (type === StockMovementType.IN && !documentUrl)}
                                    className={`flex-[2] py-3.5 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${isSubmitting || items.length === 0 || (type === StockMovementType.IN && !documentUrl)
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-gray-900 hover:bg-black hover:shadow-xl hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            İşleniyor...
                                        </>
                                    ) : (
                                        <>
                                            İşlemi Onayla
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockEntryModal;
