import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { Upload, Trash2, Image as ImageIcon, Check, X, Filter } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { useLanguage } from '../lib/i18n';

interface MediaLibraryProps {
    onSelect?: (url: string) => void;
    initialCategory?: 'products' | 'upsells' | 'reviews' | 'general';
    className?: string;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, initialCategory = 'products', className = '' }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<string>(initialCategory);
    const [images, setImages] = useState<MediaItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
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
        const stored = localStorage.getItem('media_library');
        if (stored) {
            setImages(JSON.parse(stored));
        } else {
            // Initial demo data
            const demoData: MediaItem[] = [
                { id: '1', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', name: 'Watch', category: 'products', createdAt: Date.now() },
                { id: '2', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', name: 'Headphones', category: 'products', createdAt: Date.now() },
                { id: '3', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f', name: 'Sunglasses', category: 'upsells', createdAt: Date.now() },
            ];
            setImages(demoData);
            localStorage.setItem('media_library', JSON.stringify(demoData));
        }
    }, []);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const newItem: MediaItem = {
                id: `img_${Date.now()}`,
                url: reader.result as string,
                name: file.name,
                category: activeTab as any,
                createdAt: Date.now()
            };
            const newImages = [newItem, ...images];
            setImages(newImages);
            localStorage.setItem('media_library', JSON.stringify(newImages));
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = (id: string) => {
        setConfirmDialog({
            isOpen: true,
            title: t('common.delete_confirm_title') || 'Silme Onayı',
            message: t('settings.media.delete_confirm'),
            onConfirm: () => {
                const newImages = images.filter(img => img.id !== id);
                setImages(newImages);
                localStorage.setItem('media_library', JSON.stringify(newImages));
            },
            isDestructive: true
        });
    };

    const filteredImages = activeTab === 'all'
        ? images
        : images.filter(img => img.category === activeTab);

    const tabs = [
        { id: 'products', label: t('settings.media.tab_products') },
        { id: 'upsells', label: t('settings.media.tab_upsells') },
        { id: 'reviews', label: t('settings.media.tab_reviews') },
        { id: 'general', label: t('settings.media.tab_general') },
    ];

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                        ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
                    <Upload size={16} />
                    {isUploading ? t('settings.media.uploading') : t('settings.media.upload')}
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                </label>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredImages.map(img => (
                        <div key={img.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                {onSelect && (
                                    <button
                                        onClick={() => onSelect(img.url)}
                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all"
                                        title={t('common.select') || 'Seç'}
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(img.id)}
                                    className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 shadow-lg transform hover:scale-105 transition-all"
                                    title={t('common.delete')}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                                <p className="text-xs text-white truncate">{img.name}</p>
                            </div>
                        </div>
                    ))}

                    {filteredImages.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                            <p className="font-medium">{t('settings.media.no_images')}</p>
                            <p className="text-sm mt-1">{t('settings.media.upload_new')}</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                isDestructive={confirmDialog.isDestructive}
            />
        </div >
    );
};

export default MediaLibrary;
