
import React, { useState } from 'react';
import { Product, GeneralSettings } from '../../types';
import { Star, Zap, ChevronRight, Phone, Check } from 'lucide-react';
import ReviewSection from './ReviewSection';
import OrderFormModal from './OrderFormModal';

interface TemplateProps {
    product: Product;
    onOpenOrder: () => void;
    themeColor?: string;
    generalSettings?: GeneralSettings;
}

const Template6: React.FC<TemplateProps> = ({ product, onOpenOrder, themeColor = '#FF6B35', generalSettings }) => {
    const discountedPrice = product.prices[0]?.price || 0;

    // Dynamic Payment Checks
    const isCodAvailable = product.checkoutConfig?.paymentMethods?.cod_cash || product.checkoutConfig?.paymentMethods?.cod_card;

    return (
        <div className="bg-white text-gray-900 min-h-screen font-sans pb-24">
            {/* 1. Gapless Image Stack */}
            <div className="flex flex-col">
                {product.images.sort((a, b) => a.order - b.order).map((img, idx) => (
                    <img key={idx} src={img.url} className="w-full h-auto object-cover block" loading="lazy" />
                ))}
            </div>

            {/* 2. Order Form Section (Simulated or Trigger) */}
            <div id="order-form-section" className="py-12 px-4 bg-gray-50 border-t border-b border-gray-200">
                <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-xl border-2 border-dashed border-gray-300 text-center">
                    <h2 className="text-2xl font-black mb-4">Sipariş Formu</h2>
                    <p className="text-gray-500 mb-6">Siparişinizi oluşturmak için aşağıdaki butona tıklayınız ve formu doldurunuz.</p>

                    <button
                        onClick={onOpenOrder}
                        className="w-full py-5 rounded-xl font-black text-2xl shadow-lg flex items-center justify-center gap-3 animate-pulse text-white"
                        style={{ backgroundColor: themeColor }}
                    >
                        <span>SİPARİŞİ TAMAMLA</span>
                        <ChevronRight size={28} />
                    </button>

                    {/* DYNAMIC BADGES */}
                    <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400 font-bold">
                        <span>🔒 Güvenli Ödeme</span>
                        {isCodAvailable && <span>🚛 Kapıda Ödeme</span>}
                        {!isCodAvailable && <span>🚛 Aynı Gün Kargo</span>}
                    </div>
                </div>
            </div>

            {/* 3. Reviews */}
            <div className="max-w-4xl mx-auto px-4">
                <ReviewSection reviews={product.reviews} />
            </div>

            {/* Sticky Bottom Bar (Essential for Mobile Conversion) */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] md:hidden">
                <button
                    onClick={onOpenOrder}
                    className="w-full py-4 rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-2 text-white"
                    style={{ backgroundColor: themeColor }}
                >
                    <Zap size={24} fill="white" />
                    <span>HEMEN AL - ₺{discountedPrice}</span>
                </button>
            </div>
        </div>
    );
};

export default Template6;
