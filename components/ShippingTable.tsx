
import React from 'react';
import { Shipment, ShippingStatus } from '../types';
import { Truck, Copy, MapPin, Eye, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import { isProblematicFestStatus, isStuckShipment } from '../lib/fest_api';

interface ShippingTableProps {
  shipments: Shipment[];
  onViewDetails: (shipment: Shipment) => void;
}

import { useLanguage } from '../lib/i18n';

const ShippingTable: React.FC<ShippingTableProps> = ({ shipments, onViewDetails }) => {
  const { t } = useLanguage();

  const getStatusBadge = (shipment: Shipment) => {
    // Priority: Problematic Fest Status > Internal Status
    if (shipment.festStatusCode && isProblematicFestStatus(shipment.festStatusCode)) {
      return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
        <AlertCircle size={12} /> {t('cargo.status_problematic').replace('{code}', shipment.festStatusCode)}
      </span>;
    }

    // Stuck Logic
    if (shipment.lastMovementDate && isStuckShipment(shipment.lastMovementDate) && shipment.status !== ShippingStatus.DELIVERED) {
      return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
        <Clock size={12} /> {t('cargo.status_stuck')}
      </span>;
    }

    switch (shipment.status) {
      case ShippingStatus.PREPARING:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{t('cargo.status.PREPARING')}</span>;
      case ShippingStatus.SHIPPED:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">{t('cargo.status.SHIPPED')}</span>;
      case ShippingStatus.DELIVERED:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">{t('cargo.status.DELIVERED')}</span>;
      case ShippingStatus.RETURNED:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">{t('cargo.status.RETURNED')}</span>;
      case ShippingStatus.CANCELLED:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{t('cargo.status.CANCELLED')}</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">{t('cargo.status_unknown')}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('cargo.table_barcode')}</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('cargo.table_order')}</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('cargo.table_customer')}</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('cargo.table_location')}</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('cargo.table_status')}</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('cargo.table_last_move')}</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('cargo.table_duration')}</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('cargo.table_action')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {shipments.length === 0 ? (
            <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">{t('cargo.no_records')}</td></tr>
          ) : (
            shipments.map(shipment => {
              const daysInTransit = Math.ceil((Date.now() - new Date(shipment.createdAt).getTime()) / (1000 * 60 * 60 * 24));
              const daysSinceLastMove = shipment.lastMovementDate ?
                Math.ceil((Date.now() - new Date(shipment.lastMovementDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

              return (
                <tr key={shipment.id} className="hover:bg-blue-50/40 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 text-sm">{shipment.trackingCode}</span>
                        <button className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" title={t('cargo.copy')}>
                          <Copy size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                          {shipment.company?.name || 'Fest Kargo'}
                        </span>
                        {shipment.subCarrier && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                            {shipment.subCarrier}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-blue-600 text-sm hover:underline cursor-pointer">{shipment.order?.orderNumber}</div>
                    <div className="text-xs text-gray-400">{new Date(shipment.createdAt).toLocaleDateString('tr-TR')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 text-sm">{shipment.order?.customer?.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{shipment.order?.customer?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={12} className="text-gray-400" />
                      {shipment.order?.customer?.city} / {shipment.order?.customer?.district}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(shipment)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600">
                      {shipment.lastMovementDate ? new Date(shipment.lastMovementDate).toLocaleDateString('tr-TR') : '-'}
                    </div>
                    {daysSinceLastMove > 2 && shipment.status !== ShippingStatus.DELIVERED && (
                      <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {t('cargo.stuck_days').replace('{days}', daysSinceLastMove.toString())}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${daysInTransit > 7 && shipment.status !== ShippingStatus.DELIVERED ? 'text-red-600' : 'text-gray-600'}`}>
                      {t('cargo.days').replace('{days}', daysInTransit.toString())}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onViewDetails(shipment)}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm inline-flex items-center gap-1"
                    >
                      <Eye size={12} /> {t('cargo.detail')}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShippingTable;
