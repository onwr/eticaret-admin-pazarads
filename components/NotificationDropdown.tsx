import React, { useState } from 'react';
import { Bell, Check, X, Clock, Trash2 } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, onNavigate }) => {
    const { history, removeNotification, markAllAsRead, clearHistory } = useNotification();
    const [showAll, setShowAll] = useState(false);

    if (!isOpen) return null;

    const displayedNotifications = showAll ? history : history.filter(n => !n.read).slice(0, 5);

    const handleViewAll = () => {
        onNavigate('notifications');
        onClose();
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">Bildirimler</h3>
                <div className="flex gap-2">
                    {history.length > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium" title="Tümünü Okundu İşaretle">
                            <Check size={16} />
                        </button>
                    )}
                    {showAll && (
                        <button onClick={clearHistory} className="text-xs text-red-600 hover:text-red-700 font-medium" title="Geçmişi Temizle">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {displayedNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">{showAll ? 'Bildirim geçmişi boş' : 'Yeni bildirim yok'}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {displayedNotifications.map(notification => (
                            <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors relative group ${notification.read ? 'opacity-60' : 'bg-blue-50/30'}`}>
                                <div className="flex gap-3">
                                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notification.type === 'error' ? 'bg-red-500' :
                                        notification.type === 'success' ? 'bg-green-500' :
                                            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`} />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800 leading-snug">{notification.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(notification.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button
                    onClick={handleViewAll}
                    className="text-xs text-gray-500 hover:text-gray-900 font-medium w-full py-1"
                >
                    Tüm Bildirimleri Gör
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
