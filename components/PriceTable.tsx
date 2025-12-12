import React from 'react';
import { ProductPrice } from '../types';
import { Edit2, Trash2, Tag } from 'lucide-react';

interface PriceTableProps {
  prices: ProductPrice[];
  onEdit: (price: ProductPrice) => void;
  onDelete: (price: ProductPrice) => void;
}

const PriceTable: React.FC<PriceTableProps> = ({ prices, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tier / Quantity</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Original Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Discount</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No prices defined yet.
                </td>
              </tr>
            ) : (
              prices.map((price) => {
                const discount = price.originalPrice 
                  ? Math.round(((price.originalPrice - price.price) / price.originalPrice) * 100) 
                  : 0;

                return (
                  <tr key={price.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Tag size={16} />
                        </div>
                        <div className="font-medium text-gray-900">
                          {price.quantity === 1 ? 'Single Item' : `${price.quantity} Units`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">${price.price}</div>
                    </td>
                    <td className="px-6 py-4">
                      {price.originalPrice ? (
                         <div className="text-sm text-gray-500 line-through">${price.originalPrice}</div>
                      ) : (
                         <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {discount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {discount}% OFF
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onEdit(price)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => onDelete(price)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceTable;