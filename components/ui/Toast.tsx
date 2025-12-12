import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000, onClose, action }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, id, onClose]);

    const icons = {
        success: <CheckCircle2 size={20} className="text-green-500" />,
        error: <XCircle size={20} className="text-red-500" />,
        warning: <AlertCircle size={20} className="text-yellow-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const styles = {
        success: 'bg-white border-l-4 border-green-500 shadow-lg shadow-green-500/10',
        error: 'bg-white border-l-4 border-red-500 shadow-lg shadow-red-500/10',
        warning: 'bg-white border-l-4 border-yellow-500 shadow-lg shadow-yellow-500/10',
        info: 'bg-white border-l-4 border-blue-500 shadow-lg shadow-blue-500/10'
    };

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-slide-in min-w-[320px] max-w-[400px] ${styles[type]}`}>
            <div className="flex-shrink-0 mt-0.5">
                {icons[type]}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{message}</p>
                {action && (
                    <button
                        onClick={() => {
                            action.onClick();
                            onClose(id);
                        }}
                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <button
                onClick={() => onClose(id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
