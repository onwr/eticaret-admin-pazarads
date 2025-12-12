
import React, { useState, useEffect } from 'react';
import { Product, GeneralSettings } from '../../types';
import { CountdownTimer, StockIndicator, LiveViewers } from './FOMO';
import YouTubeEmbed from './YouTubeEmbed';
import ReviewSection from './ReviewSection';
import { ChevronRight, Clock, Star, Check } from 'lucide-react';

interface TemplateProps {
    product: Product;
    onOpenOrder: () => void;
    themeColor?: string;
    generalSettings?: GeneralSettings;
}

const Template2: React.FC<TemplateProps> = ({ product, onOpenOrder, themeColor = '#EF4444', generalSettings }) => {
    const [activeImage, setActiveImage] = useState<string>(product.images[0]?.url || '');

    useEffect(() => {
        console.log('FB PIXEL: ViewContent', { content_ids: [product.id], content_name: product.name });
    }, [product]);

    useEffect(() => {
        if (product.images.length > 0) setActiveImage(product.images[0].url);
    }, [product]);

    const activePrice = product.prices[0];
    const originalPrice = activePrice?.originalPrice || (activePrice?.price ? activePrice.price * 1.5 : 0);
    const discountedPrice = activePrice?.price || 0;
    const siteTitle = generalSettings?.siteTitle || '';

    // Dynamic Payment Checks
    const isCodAvailable = product.checkoutConfig?.paymentMethods?.cod_cash || product.checkoutConfig?.paymentMethods?.cod_card;

    return (
        <div className="bg-red-50/50 text-gray-900 min-h-screen font-sans pb-20">
            {/* Ticker */}
            <div className="bg-red-600 text-white overflow-hidden py-2 text-center text-sm font-bold">
                <div className="animate-pulse">🔥 SON 24 SAATTE YÜKSEK TALEP! STOKLAR TÜKENİYOR!</div>
            </div>

            {/* Header */}
            <div className="sticky top-0 bg-white shadow-md z-40 border-b-2 border-red-500">
                <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-black italic uppercase text-red-600 tracking-tighter transform -skew-x-12">
                        {siteTitle}
                        <span className="text-black ml-1 text-sm font-normal not-italic tracking-normal">| FIRSAT</span>
                    </h1>
                    <div className="hidden md:flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full text-red-700 font-bold text-sm">
                        <Clock size={16} />
                        <span>İNDİRİM BİTİYOR:</span>
                        <CountdownTimer minutes={45} size="sm" />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-white aspect-square">
                            <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
                            <div className="absolute top-4 left-4 bg-yellow-400 text-black font-black px-4 py-2 rounded shadow-lg transform -rotate-3 border-2 border-white">
                                SÜPER FİYAT
                            </div>
                        </div>
                        {product.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {product.images.map((img) => (
                                    <div
                                        key={img.id}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeImage === img.url ? 'border-red-600 opacity-100' : 'border-gray-200 opacity-60'}`}
                                    >
                                        <img src={img.url} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-2 flex items-center gap-2">
                            <Star className="text-yellow-500 fill-current" size={20} />
                            <span className="font-bold text-gray-600">4.9/5 Müşteri Puanı</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-none mb-4 uppercase tracking-tight">
                            {product.name}
                        </h1>

                        <div className="bg-white border-2 border-red-100 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-gray-400 line-through text-xl font-bold">₺{originalPrice.toLocaleString('tr-TR')}</span>
                                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">KAZANÇLI</span>
                                </div>
                                <div className="text-5xl font-black text-red-600 mb-4 tracking-tighter">
                                    ₺{discountedPrice.toLocaleString('tr-TR')}
                                </div>
                                <StockIndicator initialStock={9} className="mb-4" />
                                <div className="space-y-2 text-sm font-bold text-gray-700">
                                    <div className="flex items-center gap-2"><Check className="text-green-600" /> <span>Hızlı Sipariş</span></div>
                                    {/* DYNAMIC COD CHECK */}
                                    {isCodAvailable && (
                                        <div className="flex items-center gap-2"><Check className="text-green-600" /> <span>Kapıda Ödeme İmkanı</span></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onOpenOrder}
                            className="w-full py-5 rounded-xl font-black text-2xl shadow-xl transition-all transform hover:scale-105 duration-200 flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 text-white animate-pulse"
                        >
                            <span>HEMEN AL</span>
                            <ChevronRight size={32} />
                        </button>
                    </div>
                </div>

                {/* No header "Product Description", just the content */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 prose max-w-none text-gray-700 whitespace-pre-line">
                    {product.description}
                </div>

                {product.videoUrl && (
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border-4 border-black">
                        <YouTubeEmbed url={product.videoUrl} />
                    </div>
                )}

                <ReviewSection reviews={product.reviews} />
            </div>

            {/* Sticky Mobile Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-red-100 z-50 p-3 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] md:hidden">
                <button
                    onClick={onOpenOrder}
                    className="w-full py-4 rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-2 bg-red-600 text-white"
                >
                    FIRSATI YAKALA
                </button>
            </div>
        </div>
    );
};

export default Template2;
