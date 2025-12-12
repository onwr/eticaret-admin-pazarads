
import React from 'react';
import { Order } from '../types';
import { Eye, Info, MessageCircle, Truck, FileText, Smartphone, Globe, Link as LinkIcon, MapPin } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  selectedIds: string[];
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

import { useLanguage } from '../lib/i18n';

const OrderTable: React.FC<OrderTableProps> = ({ orders, onViewDetails, selectedIds, onSelect, onSelectAll }) => {
  const { t } = useLanguage();
  const allSelected = orders.length > 0 && selectedIds.length === orders.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < orders.length;

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
            <tr>
              <th className="px-4 py-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
              </th>
              <th className="px-2 py-4 w-10 text-center">{t('orders.table_info')}</th>
              <th className="px-4 py-4">{t('orders.table_date')}</th>
              <th className="px-4 py-4">{t('orders.table_customer')}</th>
              <th className="px-4 py-4">{t('orders.table_phone')}</th>
              <th className="px-4 py-4">{t('orders.table_product')}</th>
              <th className="px-4 py-4">{t('orders.table_amount')}</th>
              <th className="px-4 py-4">{t('orders.table_cargo')}</th>
              <th className="px-4 py-4">{t('orders.table_payment')}</th>
              <th className="px-4 py-4 text-center">{t('orders.table_status')}</th>
              <th className="px-4 py-4 text-center">{t('orders.table_action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                  {t('orders.no_records')}
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isSelected = selectedIds.includes(order.id);

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-blue-50/40 group transition-colors cursor-default ${isSelected ? 'bg-blue-50/60' : ''}`}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(order.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                      />
                    </td>

                    {/* Info Popover Column */}
                    <td className="px-2 py-4 text-center relative">
                      <div className="group/tooltip inline-block">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center cursor-help mx-auto hover:bg-blue-100 transition-colors">
                          <Info size={14} />
                        </div>

                        {/* Popover Content */}
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 w-80 bg-slate-900 text-white text-xs p-0 rounded-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50 transition-opacity duration-200 border border-slate-700 overflow-hidden">
                          {/* Header */}
                          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-2 font-bold text-sm">
                              <FileText size={14} className="text-blue-400" /> {t('orders.popover_title')}
                            </div>
                            <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                              {order.orderNumber}
                            </span>
                          </div>

                          {/* Body */}
                          <div className="p-4 space-y-3">
                            {/* Source */}
                            <div className="flex items-start gap-3">
                              <LinkIcon size={14} className="text-slate-500 mt-0.5" />
                              <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('orders.source')}:</span>
                                <a href={order.landingPage || '#'} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate block max-w-[200px]">
                                  {order.landingPage || t('orders.unspecified')}
                                </a>
                              </div>
                            </div>

                            {/* Platform */}
                            <div className="flex items-start gap-3">
                              <Globe size={14} className="text-slate-500 mt-0.5" />
                              <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('orders.platform')}:</span>
                                <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] mt-1 inline-block">
                                  {order.referrer || t('orders.unknown')}
                                </span>
                              </div>
                            </div>

                            {/* Device */}
                            <div className="flex items-start gap-3">
                              <Smartphone size={14} className="text-slate-500 mt-0.5" />
                              <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('orders.device')}:</span>
                                <span className="text-white font-medium line-clamp-2" title={order.userAgent}>
                                  {order.userAgent || t('orders.unknown')}
                                </span>
                              </div>
                            </div>

                            {/* IP */}
                            <div className="flex items-start gap-3">
                              <MapPin size={14} className="text-slate-500 mt-0.5" />
                              <div>
                                <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('orders.ip_address')}:</span>
                                <span className="text-white font-mono">{order.ipAddress || t('orders.unknown')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-slate-800 border-b-8 border-b-transparent"></div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>

                    {/* Combined Customer Name and Phone */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                          {order.customer?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <button
                            onClick={(e) => { e.stopPropagation(); onViewDetails(order); }}
                            className="font-medium text-gray-900 hover:text-blue-600 hover:underline text-left"
                          >
                            {order.customer?.name || t('orders.unknown')}
                          </button>
                          <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Empty TD for the old phone column, or remove if not needed */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleWhatsApp(order.customer?.phone || '')}
                        className="text-green-500 hover:text-green-600 transition-colors"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {order.product?.name} <span className="text-gray-400 text-xs">({order.variantSelection || t('orders.standard')})</span>
                    </td>

                    <td className="px-4 py-4 font-extrabold text-gray-900">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.totalAmount)}
                    </td>

                    <td className="px-4 py-4 text-gray-600 text-xs">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Truck size={14} className="text-gray-400" />
                          <span>Aras Kargo</span>
                        </div>
                        {(order.status === 'TESLIM_EDILDI' || order.status === 'IADE') && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${order.status === 'TESLIM_EDILDI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {order.status === 'TESLIM_EDILDI' ? t('status.TESLIM_EDILDI') : t('status.IADE')}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-green-600 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} />
                        <span>{order.paymentMethod === 'COD' ? t('orders.payment_cod') : order.paymentMethod}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => onViewDetails(order)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Static for now based on image) */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-500">
        <div>{t('orders.pagination_total').replace('{total}', orders.length.toString()).replace('{start}', '1').replace('{end}', orders.length.toString())}</div>
        <div className="flex gap-1">
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>&lt;</button>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
