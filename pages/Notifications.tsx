
import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../lib/i18n';
import { Bell, Check, Trash2, Clock, ArrowLeft } from 'lucide-react';

const Notifications: React.FC = () => {
    const { history, markAllAsRead, clearHistory } = useNotification();
    const { t } = useLanguage();

    // Group notifications by date
    const groupedNotifications = history.reduce((groups, notification) => {
        const date = new Date(notification.timestamp).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(notification);
        return groups;
    }, {} as Record<string, typeof history>);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bildirimler</h2>
                    <p className="text-gray-500 text-sm mt-1">Tüm sistem bildirimlerini buradan yönetebilirsiniz.</p>
                </div>
                <div className="flex gap-3">
                    {history.length > 0 && (
                        <>
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Check size={18} />
                                <span className="hidden sm:inline">Tümünü Okundu İşaretle</span>
                            </button>
                            <button
                                onClick={clearHistory}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                            >
                                <Trash2 size={18} />
                                <span className="hidden sm:inline">Geçmişi Temizle</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {history.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Bildirim Yok</h3>
                    <p className="text-gray-500">Şu anda görüntülenecek bildirim bulunmuyor.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedNotifications).map(([date, notifications]) => (
                        <div key={date}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">{date}</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                                {Array.isArray(notifications) && notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 ${notification.read ? 'opacity-75' : 'bg-blue-50/10'}`}
                                    >
                                        <div className={`w-2 h-2 mt-2.5 rounded-full flex-shrink-0 ${notification.type === 'error' ? 'bg-red-500' :
                                            notification.type === 'success' ? 'bg-green-500' :
                                                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`} />

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                    {notification.message}
                                                </p>
                                                <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap ml-4">
                                                    <Clock size={12} />
                                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            {notification.action && (
                                                <button
                                                    onClick={notification.action.onClick}
                                                    className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    {notification.action.label}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
