
import React from 'react';
import { OrderStatus } from '../types';
import { useLanguage } from '../lib/i18n';

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
  color?: string; // Hex color for custom statuses
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '', color }) => {
  const { t } = useLanguage();
  
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';

  // System Status Styles
  switch (status) {
    case OrderStatus.NEW:
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case OrderStatus.ARANACAK:
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      break;
    case OrderStatus.ONAYLANDI:
      colorClass = 'bg-green-100 text-green-800 border-green-200';
      break;
    case OrderStatus.KARGODA:
      colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
      break;
    case OrderStatus.TESLIM_EDILDI:
      colorClass = 'bg-teal-100 text-teal-800 border-teal-200';
      break;
    case OrderStatus.YANLIS_NUMARA:
    case OrderStatus.ULASILAMADI:
      colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
      break;
    case OrderStatus.IPTAL:
      colorClass = 'bg-red-100 text-red-800 border-red-200';
      break;
    case OrderStatus.IADE:
      colorClass = 'bg-gray-200 text-gray-800 border-gray-300';
      break;
  }

  // Handle Custom Status Color
  const style = color ? {
    backgroundColor: `${color}20`, // 20% opacity
    color: color,
    borderColor: `${color}40`
  } : {};

  // Translation lookup
  const statusLabel = t(`status.${status}`);
  const label = statusLabel.startsWith('status.') ? status : statusLabel;

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${!color ? colorClass : ''} ${className}`}
      style={style}
    >
      {label}
    </span>
  );
};

export default OrderStatusBadge;
