import React from 'react';
import { useLanguage } from '../../lib/i18n';
import { X, GripVertical, Eye, EyeOff, Save, RotateCcw } from 'lucide-react';

export interface DashboardWidgetConfig {
    id: string;
    type: string;
    isVisible: boolean;
    order: number;
    colSpan: 1 | 2 | 3 | 4; // Grid column span (out of 4 for lg)
}

interface CustomizeLayoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    widgets: DashboardWidgetConfig[];
    setWidgets: (widgets: DashboardWidgetConfig[]) => void;
    onSave: () => void;
    onReset: () => void;
}

const CustomizeLayoutModal: React.FC<CustomizeLayoutModalProps> = ({
    isOpen, onClose, widgets, setWidgets, onSave, onReset
}) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    const handleToggleVisibility = (id: string) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, isVisible: !w.isVisible } : w));
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === widgets.length - 1) return;

        const newWidgets = [...widgets];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newWidgets[index], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[index]];

        // Update order property
        newWidgets.forEach((w, i) => w.order = i);

        setWidgets(newWidgets);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-white/20 ring-1 ring-black/5 transform transition-all scale-100">
                <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <span className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
                                <GripVertical size={18} />
                            </span>
                            {t('dash.customize')}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 ml-1">Paneli ihtiyacınıza göre düzenleyin.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-300 text-gray-400 group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {widgets.map((widget, index) => (
                        <div
                            key={widget.id}
                            className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 select-none ${widget.isVisible
                                    ? 'bg-white border-blue-100/50 shadow-sm hover:shadow-lg hover:border-blue-300/50 hover:translate-x-1'
                                    : 'bg-gray-50/50 border-gray-100 opacity-60 grayscale-[0.8] hover:opacity-100 hover:grayscale-0'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-2">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="hover:text-blue-600 disabled:opacity-0 transition-colors p-1 hover:bg-blue-50 rounded"
                                    >
                                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-current" />
                                    </button>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === widgets.length - 1}
                                        className="hover:text-blue-600 disabled:opacity-0 transition-colors p-1 hover:bg-blue-50 rounded"
                                    >
                                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-current" />
                                    </button>
                                </div>

                                <div className={`p-3 rounded-xl transition-colors duration-300 ${widget.isVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {widget.type.includes('chart') ? <span className="text-xs font-bold">GRAF</span> : <span className="text-xs font-bold">KPI</span>}
                                </div>

                                <div>
                                    <span className={`font-bold block text-base ${widget.isVisible ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {t(`dash.widget_${widget.type.replace('stats_', '').replace('chart_', '')}`) || widget.type}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {widget.isVisible && <span className="inline-flex items-center gap-1 text-[10px] text-green-700 font-bold bg-green-100/80 px-2 py-0.5 rounded-full shadow-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            Aktif
                                        </span>}
                                        <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                            {widget.colSpan === 4 ? 'Tam Genişlik' : widget.colSpan === 2 ? 'Yarım Genişlik' : 'Çeyrek Genişlik'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleToggleVisibility(widget.id)}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${widget.isVisible ? 'bg-blue-600 shadow-inner' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`${widget.isVisible ? 'translate-x-[22px]' : 'translate-x-1'
                                        } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center`}
                                >
                                    {widget.isVisible ? <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur-md flex justify-between items-center z-10">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-red-50 transition-all text-sm group"
                    >
                        <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" />
                        {t('dash.reset_layout')}
                    </button>
                    <button
                        onClick={onSave}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Save size={18} />
                        {t('dash.save_layout')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizeLayoutModal;
