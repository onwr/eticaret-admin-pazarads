
import React, { useState, useEffect } from 'react';
import { Product, GeneralSettings } from '../../types';
import YouTubeEmbed from './YouTubeEmbed';
import ReviewSection from './ReviewSection';
import { Zap, TrendingUp, ChevronRight, Star } from 'lucide-react';
import { LiveViewers } from './FOMO';

interface TemplateProps {
    product: Product;
    onOpenOrder: () => void;
    themeColor?: string;
    generalSettings?: GeneralSettings;
}

const Template7: React.FC<TemplateProps> = ({ product, onOpenOrder, themeColor = '#E1306C', generalSettings }) => {
    const activePrice = product.prices[0];
    const discountedPrice = activePrice?.price || 0;
    const siteTitle = generalSettings?.siteTitle || 'VIRALSHOP';

    // Dynamic Payment Checks
    const isCodAvailable = product.checkoutConfig?.paymentMethods?.cod_cash || product.checkoutConfig?.paymentMethods?.cod_card;

    const [activeImage, setActiveImage] = useState(product.images[0]?.url || '');

    useEffect(() => {
        console.log('FB PIXEL: ViewContent', { content_ids: [product.id], content_name: product.name });
    }, [product]);

    useEffect(() => {
        if (product.images.length > 0) setActiveImage(product.images[0].url);
    }, [product]);

    return (
        <div className="bg-black text-white min-h-screen font-sans pb-24">
            {/* Gradient Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 py-3">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-sm font-black animate-bounce tracking-widest flex justify-center gap-2">
                        🔥 <span className="opacity-75">Trend Ürün</span>
                    </p>
                </div>
            </div>

            <header className="bg-gray-900/80 backdrop-blur border-b border-gray-800 py-4 sticky top-0 z-40">
                <div className="max-w-3xl mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text italic">
                        {siteTitle}
                    </h1>
                    <LiveViewers className="text-purple-400 text-xs" />
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="relative rounded-3xl overflow-hidden border-2 border-gray-800 shadow-[0_0_50px_rgba(225,48,108,0.3)] mb-8">
                    <img src={activeImage} className="w-full h-auto" />
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-6 pt-24">
                        <h2 className="text-3xl font-black mb-2 leading-tight">{product.name}</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" size={14} />)}
                            </div>
                        </div>
                    </div>
                </div>

                {product.images.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-6 mb-4 hide-scrollbar">
                        {product.images.map((img) => (
                            <div
                                key={img.id}
                                onClick={() => setActiveImage(img.url)}
                                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${activeImage === img.url ? 'border-pink-500' : 'border-gray-800 opacity-60'}`}
                            >
                                <img src={img.url} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={onOpenOrder}
                    className="w-full py-6 rounded-3xl font-black text-2xl shadow-2xl transition-all transform active:scale-95 duration-200 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 mb-12 flex items-center justify-center gap-3 group"
                >
                    <Zap size={32} className="animate-pulse" fill="white" />
                    <span>HEMEN AL</span>
                    <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
                </button>

                {/* Description */}
                <div className="bg-gray-900 rounded-3xl p-8 mb-8 border border-gray-800">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {product.description}
                    </div>
                </div>

                {product.videoUrl && (
                    <div className="mb-12 rounded-3xl overflow-hidden border border-gray-800">
                        <YouTubeEmbed url={product.videoUrl} />
                    </div>
                )}

                <div className="text-gray-200">
                    <ReviewSection reviews={product.reviews} themeColor={themeColor} />
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-gray-900/95 backdrop-blur border-t border-gray-800 z-50 shadow-2xl p-4 md:hidden">
                <button
                    onClick={onOpenOrder}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3"
                >
                    <TrendingUp size={24} />
                    {/* DYNAMIC TEXT */}
                    {isCodAvailable ? (
                        <span>KAPIDA ÖDE - ₺{discountedPrice}</span>
                    ) : (
                        <span>SİPARİŞ VER - ₺{discountedPrice}</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Template7;
