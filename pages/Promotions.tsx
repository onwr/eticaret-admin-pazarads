
import React, { useState, useEffect } from 'react';
import { getUpsells, createUpsell, updateUpsell, deleteUpsell, getProducts } from '../lib/api';
import { Upsell, Product, UpsellImage } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import MediaLibraryModal from '../components/modals/MediaLibraryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Zap, Plus, Edit2, Trash2, Video, Image as ImageIcon, Search, X, Check, Grid, LayoutList, Package, Youtube, GripHorizontal, ExternalLink } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const Promotions: React.FC = () => {
    const { t } = useLanguage();
    const [upsells, setUpsells] = useState<Upsell[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUpsell, setEditingUpsell] = useState<Upsell | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [u, p] = await Promise.all([getUpsells(), getProducts()]);
        setUpsells(u);
        setProducts(p);
        setLoading(false);
    };

    const handleDelete = (id: string) => {
        setConfirmDialog({
            isOpen: true,
            title: t('common.delete_confirm_title') || 'Silme Onayı',
            message: t('upsell.delete_confirm'),
            onConfirm: async () => {
                await deleteUpsell(id);
                fetchData();
            },
            isDestructive: true
        });
    };

    const handleToggleActive = async (upsell: Upsell) => {
        // Optimistic update
        const updated = { ...upsell, isActive: !upsell.isActive };
        setUpsells(prev => prev.map(u => u.id === upsell.id ? updated : u));

        try {
            await updateUpsell(upsell.id, { isActive: !upsell.isActive });
        } catch (e) {
            // Revert on failure
            setUpsells(prev => prev.map(u => u.id === upsell.id ? upsell : u));
            console.error(e);
        }
    };

    const createDemoData = async () => {
        const demo: Omit<Upsell, 'id'> = {
            title: 'Demo: 3 Al 2 Öde Fırsatı',
            shortName: '3AL2ODE',
            description: 'Sadece bugüne özel, seçili ürünlerde 3 al 2 öde fırsatı kaçmaz!',
            price: 199.90,
            originalPrice: 299.90,
            quantity: 50,
            isActive: true,
            images: [
                { id: '1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80', order: 0 },
                { id: '2', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80', order: 1 }
            ],
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            triggerProductIds: products.slice(0, 1).map(p => p.id)
        };
        await createUpsell(demo);
        fetchData();
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {t('upsell.management_title')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t('upsell.management_subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setEditingUpsell(null); setIsModalOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={18} /> {t('upsell.add_new')}
                    </button>
                </div>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upsells.map(upsell => (
                    <div key={upsell.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                        {/* Media Area - Show first image or video icon */}
                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                            {upsell.images && upsell.images.length > 0 ? (
                                <img src={upsell.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : upsell.videoUrl ? (
                                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-900">
                                    <Video size={32} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300">
                                    <ImageIcon size={32} />
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                {upsell.images?.length > 1 && (
                                    <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                        <ImageIcon size={10} /> +{upsell.images.length - 1}
                                    </span>
                                )}
                                {!upsell.isActive && (
                                    <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-bold">{t('upsell.inactive')}</span>
                                )}
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 text-lg line-clamp-1" title={upsell.title}>{upsell.title}</h3>
                                {upsell.shortName && (
                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 whitespace-nowrap">
                                        {upsell.shortName}
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                                <Zap size={12} className="text-yellow-500" />
                                {t('upsell.valid_on_products').replace('{count}', upsell.triggerProductIds.length.toString())}
                            </p>

                            <div className="flex items-baseline gap-3 mb-5 p-3 bg-green-50 rounded-lg border border-green-100">
                                <span className="text-xl font-extrabold text-green-700">{upsell.price} ₺</span>
                                {upsell.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through font-medium">{upsell.originalPrice} ₺</span>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                {/* Toggle */}
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={upsell.isActive}
                                            onChange={() => handleToggleActive(upsell)}
                                        />
                                        <div className={`w-10 h-6 bg-gray-200 rounded-full shadow-inner transition-colors ${upsell.isActive ? '!bg-green-500' : ''}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${upsell.isActive ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                </label>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditingUpsell(upsell); setIsModalOpen(true); }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title={t('common.edit')}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(upsell.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {upsells.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <Zap size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">{t('upsell.no_promotions')}</p>
                        <p className="text-sm mt-1">{t('upsell.start_adding')}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <PromotionModal
                    isOpen={isModalOpen}
                    initialData={editingUpsell}
                    products={products}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (data: any) => {
                        if (editingUpsell) await updateUpsell(editingUpsell.id, data);
                        else await createUpsell(data);
                        fetchData();
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

interface PromotionModalProps {
    isOpen: boolean;
    initialData: Upsell | null;
    products: Product[];
    onClose: () => void;
    onSave: (data: Partial<Upsell>) => Promise<void>;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, initialData, products, onClose, onSave }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'MEDIA' | 'PRODUCTS'>('GENERAL');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Upsell>>(initialData || {
        title: '',
        shortName: '',
        description: '',
        price: 0,
        originalPrice: 0,
        images: [],
        videoUrl: '',
        triggerProductIds: [],
        isActive: true
    });

    // Product Search
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    // Filter Products
    const filteredProducts = products.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()));

    // Toggle Product Selection
    const toggleProduct = (id: string) => {
        const current = formData.triggerProductIds || [];
        if (current.includes(id)) {
            setFormData({ ...formData, triggerProductIds: current.filter(pid => pid !== id) });
        } else {
            setFormData({ ...formData, triggerProductIds: [...current, id] });
        }
    };

    // Media Handlers
    const handleAddImage = () => {
        setIsMediaModalOpen(true);
    };

    const handleMediaSelect = (url: string) => {
        const newImage: UpsellImage = {
            id: `img-${Date.now()}`,
            url: url,
            order: (formData.images?.length || 0)
        };
        setFormData({ ...formData, images: [...(formData.images || []), newImage] });
    };

    const handleRemoveImage = (id: string) => {
        setFormData({ ...formData, images: formData.images?.filter(img => img.id !== id) });
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        // Required for Firefox
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const newImages = [...(formData.images || [])];
        const [movedItem] = newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, movedItem);

        // Update order property
        newImages.forEach((img, idx) => img.order = idx);
        setFormData({ ...formData, images: newImages });
        setDraggedIndex(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-900">{initialData ? t('upsell.edit_promotion') : t('upsell.add_promotion')}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6 bg-white">
                    {[
                        { id: 'GENERAL', label: t('upsell.tab_general'), icon: LayoutList },
                        { id: 'MEDIA', label: t('upsell.tab_media'), icon: ImageIcon },
                        { id: 'PRODUCTS', label: t('upsell.tab_products'), icon: Package }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors
                                ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
                            `}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

                    {/* TAB 1: GENERAL */}
                    {activeTab === 'GENERAL' && (
                        <div className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('upsell.promo_title')}</label>
                                    <input required type="text" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder={t('upsell.placeholder_title')} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('upsell.promo_label')}</label>
                                    <input type="text" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.shortName || ''} onChange={e => setFormData({ ...formData, shortName: e.target.value })} placeholder={t('upsell.placeholder_label')} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('upsell.description')}</label>
                                    <textarea rows={3} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-4">{t('upsell.pricing')}</h4>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('upsell.sale_price')}</label>
                                        <div className="relative">
                                            <input required type="number" className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold text-green-700 outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">TL</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('upsell.regular_price')}</label>
                                        <div className="relative">
                                            <input type="number" className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-500 line-through outline-none" value={formData.originalPrice || ''} onChange={e => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })} />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">TL</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('upsell.stock_qty')}</label>
                                <input type="number" className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.quantity || ''} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })} placeholder="0" />
                            </div>
                        </div>
                    )}

                    {/* TAB 2: MEDIA */}
                    {activeTab === 'MEDIA' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">{t('upsell.image_gallery')}</h3>
                                <button onClick={handleAddImage} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <Plus size={16} /> {t('upsell.add_image')}
                                </button>
                            </div>

                            {/* Image Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 select-none">
                                {formData.images?.map((img, idx) => (
                                    <div
                                        key={img.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={(e) => handleDrop(e, idx)}
                                        className={`relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden aspect-square cursor-move transition-all 
                                            ${draggedIndex === idx ? 'opacity-50 border-blue-500 scale-95 ring-2 ring-blue-400 ring-offset-2' : 'hover:border-blue-300'}
                                        `}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover pointer-events-none" />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <div className="text-white text-xs font-bold flex items-center gap-1">
                                                <GripHorizontal size={16} /> {t('upsell.move')}
                                            </div>
                                            <button onClick={() => handleRemoveImage(img.id)} className="p-1.5 bg-red-600 rounded-full hover:bg-red-700 text-white mt-1 cursor-pointer">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded font-mono">
                                            {idx + 1}
                                        </div>
                                    </div>
                                ))}
                                {(formData.images?.length || 0) === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
                                        <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>{t('upsell.no_images')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Video Section */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 mt-6">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Youtube size={20} className="text-red-600" /> {t('upsell.video_integration')}
                                </h4>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.videoUrl || ''}
                                        onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                        placeholder={t('upsell.placeholder_video')}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{t('upsell.video_hint')}</p>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: PRODUCTS */}
                    {activeTab === 'PRODUCTS' && (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('upsell.search_products')}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl bg-white">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-12">{t('upsell.table_select')}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-16">{t('upsell.table_image')}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('upsell.table_product_name')}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">{t('upsell.table_sales')}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">{t('upsell.table_price')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredProducts.map((prod: Product) => {
                                            const isSelected = formData.triggerProductIds?.includes(prod.id);
                                            return (
                                                <tr
                                                    key={prod.id}
                                                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                                                    onClick={() => toggleProduct(prod.id)}
                                                >
                                                    <td className="px-4 py-3 text-center">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                                            {isSelected && <Check size={14} className="text-white" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                                            <img src={prod.images[0]?.url} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-900 text-sm">{prod.name}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-gray-500">{prod.shortDescription}</span>
                                                            <a href={`/product/${prod.slug}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                                {t('upsell.link')} <ExternalLink size={10} />
                                                            </a>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                                                        {prod.salesCount || 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">
                                                        {prod.prices[0]?.price} ₺
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredProducts.length === 0 && (
                                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t('products.no_products')}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800 text-sm flex justify-between items-center">
                                <span>{t('upsell.total_selected')}</span>
                                <span className="font-bold text-lg">{formData.triggerProductIds?.length}</span>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">{t('common.cancel')}</button>
                    <button type="button" onClick={() => onSave(formData)} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">{t('common.save')}</button>
                </div>
            </div>

            <MediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelect={handleMediaSelect}
                initialCategory="upsells"
            />
        </div>
    );
};

export default Promotions;
