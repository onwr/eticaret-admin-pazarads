
import React, { useState, useEffect } from 'react';
import { Product, GeneralSettings } from '../../types';
import { ChevronRight, ShieldCheck, Star, Truck, CreditCard } from 'lucide-react';
import { StockIndicator, LiveViewers } from './FOMO';
import ReviewSection from './ReviewSection';
import YouTubeEmbed from './YouTubeEmbed';

interface TemplateProps {
    product: Product;
    onOpenOrder: () => void;
    themeColor?: string;
    generalSettings?: GeneralSettings;
}

const Template1: React.FC<TemplateProps> = ({ product, onOpenOrder, themeColor = '#2563EB', generalSettings }) => {
    const [activeImage, setActiveImage] = useState<string>(product.images[0]?.url || '');

    // Pixel ViewContent
    useEffect(() => {
        console.log('FB PIXEL: ViewContent', { content_ids: [product.id], content_name: product.name });
    }, [product]);

    useEffect(() => {
        if (product.images.length > 0) setActiveImage(product.images[0].url);
    }, [product]);

    const activePrice = product.prices[0];
    const originalPrice = activePrice?.originalPrice || (activePrice?.price ? activePrice.price * 1.3 : 0);
    const discountedPrice = activePrice?.price || 0;
    const siteTitle = generalSettings?.siteTitle || '';

    // Checks
    const isCodAvailable = product.checkoutConfig?.paymentMethods?.cod_cash || product.checkoutConfig?.paymentMethods?.cod_card;
    const discountPercentage = originalPrice > discountedPrice
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

    return (
        <div className="bg-white text-gray-900 min-h-screen font-sans">
            {/* Dynamic Announcement */}
            <div className="bg-gray-900 text-white py-2 px-4 text-center text-sm font-medium">
                {discountPercentage > 0 ? `%${discountPercentage} İndirim Fırsatı!` : 'Sınırlı Stok Fırsatı!'}
            </div>

            <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="text-xl font-bold tracking-tight text-blue-900">{siteTitle}</div>
                    <LiveViewers className="text-xs text-green-600" />
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-10">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                            <img src={activeImage} className="w-full h-full object-contain mix-blend-multiply" />
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg font-bold shadow-lg">
                                    %{discountPercentage} İndirim
                                </div>
                            )}
                        </div>
                        {product.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map(img => (
                                    <div
                                        key={img.id}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 cursor-pointer overflow-hidden ${activeImage === img.url ? 'border-blue-600' : 'border-transparent bg-gray-50'}`}
                                    >
                                        <img src={img.url} className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <span className="text-sm text-gray-500 font-medium">(4.9/5 Müşteri Puanı)</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-end gap-3 mb-6">
                            <div className="text-4xl font-black text-blue-600">
                                ₺{discountedPrice.toLocaleString('tr-TR')}
                            </div>
                            {originalPrice > discountedPrice && (
                                <div className="text-xl text-gray-400 line-through mb-1">
                                    ₺{originalPrice.toLocaleString('tr-TR')}
                                </div>
                            )}
                        </div>

                        <StockIndicator initialStock={15} className="mb-8" />

                        <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                            {product.shortDescription}
                        </div>

                        {/* Dynamic Feature Badges based on Config */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                <Truck size={18} className="text-blue-600" />
                                <span>Hızlı Kargo</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                <ShieldCheck size={18} className="text-blue-600" />
                                <span>Güvenli Ödeme</span>
                            </div>
                            {isCodAvailable && (
                                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg col-span-2">
                                    <CreditCard size={18} className="text-blue-600" />
                                    <span className="font-semibold">Kapıda Ödeme İmkanı</span>
                                </div>
                            )}
                        </div>

                        {/* Packages */}
                        <div className="space-y-3 mb-8">
                            {product.prices.map(price => (
                                <div
                                    key={price.id}
                                    onClick={onOpenOrder}
                                    className="border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-600 group-hover:bg-blue-600 transition-colors"></div>
                                        <span className="font-bold text-gray-900">
                                            {price.label || (price.quantity === 1 ? '1 Adet' : `${price.quantity} Adet`)}
                                        </span>
                                    </div>
                                    <div className="font-bold text-blue-600">
                                        ₺{price.price.toLocaleString('tr-TR')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onOpenOrder}
                            className="w-full py-5 rounded-xl text-white font-bold text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 bg-blue-600"
                        >
                            <span>SİPARİŞ VER</span>
                            <ChevronRight />
                        </button>
                    </div>
                </div>

                {/* Sticky Mobile CTA */}
                <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t md:hidden z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
                    <button
                        onClick={onOpenOrder}
                        className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg bg-blue-600"
                    >
                        SİPARİŞ VER - ₺{discountedPrice.toLocaleString('tr-TR')}
                    </button>
                </div>

                <div className="my-16 border-t pt-16">
                    <div className="prose max-w-none mx-auto text-gray-800 whitespace-pre-line">
                        {product.description}
                    </div>
                </div>

                {product.videoUrl && (
                    <div className="my-12 max-w-4xl mx-auto">
                        <YouTubeEmbed url={product.videoUrl} />
                    </div>
                )}

                <ReviewSection reviews={product.reviews} />
            </main>
        </div>
    );
};

export default Template1;
