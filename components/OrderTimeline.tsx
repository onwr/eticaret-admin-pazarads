
import React from 'react';
import { OrderLog } from '../types';
import { User, RefreshCw, MessageSquare, Shield } from 'lucide-react';

interface OrderTimelineProps {
  logs: OrderLog[];
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ logs }) => {
  if (logs.length === 0) {
    return <div className="text-gray-400 text-sm text-center py-4">Geçmiş bulunamadı</div>;
  }

  const getIcon = (action: string) => {
    switch (action) {
      case 'STATUS_CHANGE': return <RefreshCw size={14} className="text-blue-600" />;
      case 'NOTE': return <MessageSquare size={14} className="text-amber-600" />;
      case 'SYSTEM': return <Shield size={14} className="text-gray-600" />;
      default: return <User size={14} className="text-gray-600" />;
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('tr-TR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, logIdx) => (
          <li key={log.id}>
            <div className="relative pb-8">
              {logIdx !== logs.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                     ${log.action === 'STATUS_CHANGE' ? 'bg-blue-100' :
                      log.action === 'NOTE' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                    {getIcon(log.action)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">{log.userName}</span>{' '}
                      {log.action === 'STATUS_CHANGE' ? 'durumu güncelledi' :
                        log.action === 'NOTE' ? 'not ekledi' : 'sistem güncellemesi'}
                    </p>
                    <p className="text-sm text-gray-900 mt-0.5 font-medium">{log.message}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-gray-400">
                    <time dateTime={log.createdAt}>{formatTime(log.createdAt)}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderTimeline;
