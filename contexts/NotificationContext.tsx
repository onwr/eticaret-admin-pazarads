import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast, { ToastType } from '../components/ui/Toast';
import { playSuccessSound, playErrorSound, playNotificationSound } from '../lib/sound';

export interface Notification {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    timestamp: number;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    history: Notification[];
    addNotification: (type: ToastType, message: string, duration?: number, action?: { label: string; onClick: () => void }) => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearHistory: () => void;
    playTrigger: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [history, setHistory] = useState<Notification[]>([]);
    const [playTrigger, setPlayTrigger] = useState(0);

    // Load history from local storage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('notification_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse notification history', e);
            }
        }
    }, []);

    // Save history to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('notification_history', JSON.stringify(history));
    }, [history]);

    const addNotification = useCallback((type: ToastType, message: string, duration = 5000, action?: { label: string; onClick: () => void }) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotification: Notification = {
            id,
            type,
            message,
            duration,
            action,
            timestamp: Date.now(),
            read: false
        };

        setNotifications(prev => [...prev, newNotification]);
        setHistory(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50

        // Trigger audio
        if (type === 'success') {
            playSuccessSound();
        } else if (type === 'error') {
            playErrorSound();
        } else {
            playNotificationSound();
        }

        // Legacy trigger support if needed, otherwise can be removed
        if (type === 'success' || type === 'error') {
            setPlayTrigger(prev => prev + 1);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const markAsRead = useCallback((id: string) => {
        setHistory(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setHistory(prev => prev.map(n => ({ ...n, read: true })));
        setNotifications([]); // Clear active toasts too? Maybe not.
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            history,
            addNotification,
            removeNotification,
            markAsRead,
            markAllAsRead,
            clearHistory,
            playTrigger
        }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
                {notifications.map(notification => (
                    <div key={notification.id} className="pointer-events-auto">
                        <Toast
                            id={notification.id}
                            type={notification.type}
                            message={notification.message}
                            duration={notification.duration}
                            onClose={removeNotification}
                            action={notification.action}
                        />
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
