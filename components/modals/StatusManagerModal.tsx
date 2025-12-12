
import React, { useState } from 'react';
import { X, Plus, Trash2, Check, GripVertical } from 'lucide-react';
import { OrderStatus } from '../../types';
import { useLanguage } from '../../lib/i18n';

interface StatusManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomStatus {
  id: string;
  label: string;
  color: string;
  isCustom: boolean;
}

const StatusManagerModal: React.FC<StatusManagerModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  // Initial list combining Enum and some potential custom ones
  const [statuses, setStatuses] = useState<CustomStatus[]>([
    ...Object.values(OrderStatus).map(s => ({
        id: s,
        label: t(`status.${s}`),
        color: '#3B82F6', // Default blue
        isCustom: false
    })),
    // Example existing custom statuses
    // { id: 'CUSTOM_1', label: 'Beklemede', color: '#F59E0B', isCustom: true }
  ]);

  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#10B981'); // Default green for new

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newStatus: CustomStatus = {
        id: `CUSTOM_${Date.now()}`,
        label: newLabel,
        color: newColor,
        isCustom: true
    };

    setStatuses([...statuses, newStatus]);
    setNewLabel('');
  };

  const handleDelete = (id: string) => {
    setStatuses(statuses.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{t('orders.status_manager')}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
           {/* Add New Status */}
           <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">{t('orders.add_status')}</h3>
              <div className="flex gap-2">
                 <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder={t('orders.status_name')}
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div className="w-12">
                    <input 
                      type="color" 
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-full h-full border border-gray-200 rounded-lg cursor-pointer p-1"
                      title={t('orders.color')}
                    />
                 </div>
                 <button 
                   type="submit"
                   className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                 >
                   <Plus size={20} />
                 </button>
              </div>
           </form>

           {/* Status List */}
           <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Active Statuses</h3>
              {statuses.map((status) => (
                 <div key={status.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-gray-200 transition-colors">
                    <GripVertical size={16} className="text-gray-300 cursor-move" />
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 flex-1">{status.label}</span>
                    {status.isCustom ? (
                        <button onClick={() => handleDelete(status.id)} className="text-gray-400 hover:text-red-600 p-1">
                            <Trash2 size={16} />
                        </button>
                    ) : (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">System</span>
                    )}
                 </div>
              ))}
           </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
           >
             {t('common.save')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default StatusManagerModal;
