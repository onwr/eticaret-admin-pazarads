
import React from 'react';
import { Product } from '../../types';
import { ArrowRight, Star } from 'lucide-react';

interface UpsellSectionProps {
  products: Product[];
}

const UpsellSection: React.FC<UpsellSectionProps> = ({ products }) => {
  if (products.length === 0) return null;

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-900">Recommended for You</h3>
        <p className="text-sm text-gray-500 mt-1">Customers who bought this also bought</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
               <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
               <div>
                  <h4 className="font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-yellow-500 my-1">
                     <Star size={12} fill="currentColor" />
                     <span>4.8</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{product.shortDescription}</p>
               </div>
               <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-gray-900">${product.prices[0]?.price}</span>
                  <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                    View Details <ArrowRight size={12} />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpsellSection;
