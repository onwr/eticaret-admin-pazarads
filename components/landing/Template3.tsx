
import React, { useState, useEffect } from 'react';
import { Product, GeneralSettings } from '../../types';
import YouTubeEmbed from './YouTubeEmbed';
import ReviewSection from './ReviewSection';
import { Heart, Users, Leaf, Shield, ChevronRight, Phone, Mail, CheckCircle } from 'lucide-react';

interface TemplateProps {
    product: Product;
    onOpenOrder: () => void;
    themeColor?: string;
    generalSettings?: GeneralSettings;
}

const Template3: React.FC<TemplateProps> = ({ product, onOpenOrder, themeColor = '#10B981', generalSettings }) => {
    const [activeImage, setActiveImage] = useState<string>(product.images[0]?.url || '');

    useEffect(() => {
        console.log('FB PIXEL: ViewContent', { content_ids: [product.id], content_name: product.name });
    }, [product]);

    useEffect(() => {
        if (product.images.length > 0) setActiveImage(product.images[0].url);
    }, [product]);

    const activePrice = product.prices[0];
    const discountedPrice = activePrice?.price || 0;
    const siteTitle = generalSettings?.siteTitle || '';

    // Checks
    const isCodAvailable = product.checkoutConfig?.paymentMethods?.cod_cash || product.checkoutConfig?.paymentMethods?.cod_card;

    return (
        <div className="bg-gradient-to-b from-emerald-50 via-white to-teal-50 text-gray-800 min-h-screen font-sans pb-20">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-emerald-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-light text-emerald-900 tracking-wide">
                        {siteTitle}
                    </h1>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
                            {product.name}
                        </h2>

                        <div className="text-3xl font-light text-emerald-900">₺{discountedPrice.toLocaleString('tr-TR')}</div>

                        <div className="flex flex-col gap-2 text-sm text-gray-600">
                            {isCodAvailable && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-600" />
                                    <span>Kapıda Ödeme Mevcut</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-600" />
                                <span>Stokta Var - Hızlı Gönderim</span>
                            </div>
                        </div>

                        <button
                            onClick={onOpenOrder}
                            className="w-full md:w-auto px-10 py-4 rounded-full font-semibold text-lg shadow-lg flex items-center justify-center gap-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                            <Heart size={20} />
                            <span>Sipariş Oluştur</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-white relative">
                            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        {product.images.length > 0 && (
                            <div className="flex justify-center gap-3">
                                {product.images.slice(0, 5).map((img) => (
                                    <div
                                        key={img.id}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${activeImage === img.url ? 'border-emerald-500 scale-105' : 'border-transparent opacity-70'}`}
                                    >
                                        <img src={img.url} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="prose prose-emerald mx-auto max-w-4xl text-center mb-16 text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                </div>

                {product.videoUrl && (
                    <div className="max-w-4xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-xl">
                        <YouTubeEmbed url={product.videoUrl} />
                    </div>
                )}

                <ReviewSection reviews={product.reviews} />
            </div>

            {/* Sticky Mobile Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 p-3 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] md:hidden">
                <button
                    onClick={onOpenOrder}
                    className="w-full py-4 rounded-full font-bold text-xl shadow-lg flex items-center justify-center gap-2 bg-emerald-600 text-white"
                >
                    SATIN AL - ₺{discountedPrice}
                </button>
            </div>
        </div>
    );
};

export default Template3;
