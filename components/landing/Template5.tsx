
import React, { useState, useEffect } from 'react';
import { Product, GeneralSettings } from '../../types';
import YouTubeEmbed from './YouTubeEmbed';
import ReviewSection from './ReviewSection';
import { Play, Star, ChevronRight, Check } from 'lucide-react';
import { CountdownTimer, StockIndicator } from './FOMO';

interface TemplateProps {
    product: Product;
    onOpenOrder: () => void;
    themeColor?: string;
    generalSettings?: GeneralSettings;
}

const Template5: React.FC<TemplateProps> = ({ product, onOpenOrder, themeColor = '#7C3AED', generalSettings }) => {
    const discountedPrice = product.prices[0]?.price || 0;
    const siteTitle = generalSettings?.siteTitle || '';
    const isCodAvailable = product.checkoutConfig?.paymentMethods?.cod_cash || product.checkoutConfig?.paymentMethods?.cod_card;

    useEffect(() => {
        console.log('FB PIXEL: ViewContent', { content_ids: [product.id], content_name: product.name });
    }, [product]);

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans pb-24">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <h1 className="text-xl font-bold tracking-widest uppercase">{siteTitle}</h1>
                <button onClick={onOpenOrder} className="bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-all">
                    Şimdi İncele
                </button>
            </div>

            {/* Hero Section */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img src={product.images[0]?.url} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-black/40"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mt-20">
                    <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-6 animate-fade-in-up">
                        <Star size={12} fill="white" />
                        <span>YENİ SEZON</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-2xl">
                        {product.name}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
                        {product.shortDescription}
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onOpenOrder}
                            className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <span>HEMEN AL - ₺{discountedPrice}</span>
                            <ChevronRight size={20} />
                        </button>
                        {product.videoUrl && (
                            <button
                                onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                                <Play size={20} fill="currentColor" />
                                <span>Videoyu İzle</span>
                            </button>
                        )}
                    </div>

                    {/* Dynamic Badges */}
                    <div className="mt-8 flex items-center justify-center gap-6 text-sm font-medium text-gray-300">
                        {isCodAvailable && (
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-purple-400" />
                                <span>Kapıda Ödeme</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Check size={16} className="text-purple-400" />
                            <span>Stoklarla Sınırlı</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Product Gallery Grid */}
                {product.images.length > 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
                        {product.images.slice(1, 4).map((img, idx) => (
                            <div key={idx} className="rounded-2xl overflow-hidden aspect-square border border-gray-800 hover:border-purple-500 transition-colors">
                                <img src={img.url} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Video Section */}
                {product.videoUrl && (
                    <div id="video-section" className="mb-16 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                        <YouTubeEmbed url={product.videoUrl} />
                    </div>
                )}

                <div className="bg-gray-800/50 rounded-3xl p-8 md:p-12 mb-16 border border-gray-700">
                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-line text-gray-300">
                        {product.description}
                    </div>
                </div>

                <ReviewSection reviews={product.reviews} themeColor={themeColor} />
            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-gray-900/90 backdrop-blur border-t border-gray-800 z-50 p-4 md:hidden">
                <button
                    onClick={onOpenOrder}
                    className="w-full py-4 bg-purple-600 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-3 text-white"
                >
                    FIRSATI YAKALA - ₺{discountedPrice}
                </button>
            </div>
        </div>
    );
};

export default Template5;
