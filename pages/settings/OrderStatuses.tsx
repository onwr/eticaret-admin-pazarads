
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, List } from 'lucide-react';
import { getCustomStatuses, createCustomStatus, deleteCustomStatus } from '../../lib/api';
import { CustomStatus, OrderStatus } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useLanguage } from '../../lib/i18n';

interface OrderStatusesProps {
  onBack: () => void;
}

const OrderStatuses: React.FC<OrderStatusesProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState({ label: '', color: '#3B82F6' });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isDestructive: false
  });

  // System statuses
  const systemStatuses = Object.values(OrderStatus).filter(s => s !== OrderStatus.TESLIM_EDILDI && s !== OrderStatus.IADE);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCustomStatuses();
      setCustomStatuses(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus.label.trim()) return;

    await createCustomStatus({
      id: `STATUS_${Date.now()}`,
      label: newStatus.label,
      color: newStatus.color
    });
    setNewStatus({ label: '', color: '#3B82F6' });
    loadData();
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t('common.delete_confirm_title') || 'Silme Onayı',
      message: t('settings.status.delete_confirm'),
      onConfirm: async () => {
        await deleteCustomStatus(id);
        loadData();
      },
      isDestructive: true
    });
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> {t('settings.back')}
      </button>

      <div>
        <h2 className="text-2xl font-bold text-gray-800">{t('settings.status.title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('settings.status.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Statuses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <List size={18} className="text-blue-600" /> {t('settings.status.system_title')}
          </h3>
          <div className="space-y-2">
            {systemStatuses.map(status => (
              <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-700">{t(`status.${status}`)}</span>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{t('settings.status.system_badge')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Statuses */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">{t('settings.status.custom_add')}</h3>
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                type="text"
                placeholder={t('settings.status.custom_placeholder')}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={newStatus.label}
                onChange={e => setNewStatus({ ...newStatus, label: e.target.value })}
                required
              />
              <input
                type="color"
                className="h-10 w-10 border border-gray-200 rounded-lg cursor-pointer p-1"
                value={newStatus.color}
                onChange={e => setNewStatus({ ...newStatus, color: e.target.value })}
              />
              <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                <Plus size={20} />
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">{t('settings.status.custom_title')}</h3>
            <div className="space-y-2">
              {customStatuses.length === 0 && <p className="text-gray-400 text-sm">{t('settings.status.no_custom')}</p>}
              {customStatuses.map(status => (
                <div key={status.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }}></div>
                    <span className="font-medium text-gray-700">{status.label}</span>
                  </div>
                  <button onClick={() => handleDelete(status.id)} className="text-gray-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div >
  );
};

export default OrderStatuses;
