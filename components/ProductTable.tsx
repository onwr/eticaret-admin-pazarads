import React from 'react';
import { Product } from '../types';
import { Edit2, Trash2, Eye, Copy, TrendingUp, Truck } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onClone: (product: Product) => void;
  onPreview: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onClone,
  onPreview
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">{t('products.table_image')}</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">{t('products.table_info')}</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">{t('products.table_sales_cargo')}</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">{t('products.table_price')}</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-right">{t('products.table_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  {t('products.no_products')}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-gray-300">
                          <Eye size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-base">{product.name}</div>
                    <div className="text-xs text-blue-300 font-medium mt-1">{product.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                        <TrendingUp size={14} className="text-green-500" />
                        <span>{t('products.sales_count').replace('{count}', (product.salesCount || 0).toString())}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Truck size={14} className="text-gray-400" />
                        {product.isFreeShipping ? (
                          <span className="text-green-600 font-bold">{t('products.free_shipping')}</span>
                        ) : (
                          <span>{t('products.shipping_cost').replace('{cost}', (product.prices[0]?.shippingCost || 0).toFixed(2))}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900 text-lg">
                      {product.prices[0]?.price.toFixed(2)} ₺
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => onPreview(product)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title={t('products.quick_view')}
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => onClone(product)}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                        title={t('products.copy')}
                      >
                        <Copy size={20} />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title={t('products.edit')}
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title={t('products.delete')}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
