
import React, { useState, useEffect } from 'react';
import { Product, GeneralSettings } from '../../types';
import YouTubeEmbed from './YouTubeEmbed';
import ReviewSection from './ReviewSection';
import { TrendingUp, ChevronRight, Star, ShoppingBag } from 'lucide-react';

interface TemplateProps {
    product: Product;
    onOpenOrder: () => void;
    themeColor?: string;
    generalSettings?: GeneralSettings;
}

const Template4: React.FC<TemplateProps> = ({ product, onOpenOrder, themeColor = '#2563EB', generalSettings }) => {
    const [activeImage, setActiveImage] = useState<string>(product.images[0]?.url || '');

    useEffect(() => {
        console.log('FB PIXEL: ViewContent', { content_ids: [product.id], content_name: product.name });
    }, [product]);

    useEffect(() => {
        if (product.images.length > 0) setActiveImage(product.images[0].url);
    }, [product]);

    const discountedPrice = product.prices[0]?.price || 0;
    const siteTitle = generalSettings?.siteTitle || '';

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen font-sans pb-20">
            <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                        {siteTitle}
                    </h1>
                </div>
            </header>

            <article className="max-w-4xl mx-auto px-4 py-8">

                <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                    {product.name}
                </h1>

                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
                    <img src={activeImage} alt={product.name} className="w-full h-auto" />
                </div>

                {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        {product.images.slice(0, 4).map((img, idx) => (
                            <div key={idx} className="rounded-lg overflow-hidden cursor-pointer border-2 hover:border-blue-500 transition-all" onClick={() => setActiveImage(img.url)}>
                                <img src={img.url} className="w-full h-20 object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="prose prose-lg prose-blue mx-auto text-gray-700 leading-relaxed mb-12 whitespace-pre-line">
                    {product.description}
                </div>

                {/* Verdict Box */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-xl mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" size={24} />)}
                        </div>
                        <span className="font-bold text-blue-900">Mükemmel Seçim</span>
                    </div>
                    <button
                        onClick={onOpenOrder}
                        className="w-full py-5 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 bg-blue-600 text-white hover:bg-blue-700 transition-all"
                    >
                        <ShoppingBag size={24} />
                        <span>Sipariş Ver (₺{discountedPrice})</span>
                        <ChevronRight size={24} />
                    </button>
                </div>

                {product.videoUrl && (
                    <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
                        <YouTubeEmbed url={product.videoUrl} />
                    </div>
                )}

                <ReviewSection reviews={product.reviews} />
            </article>
        </div>
    );
};

export default Template4;
