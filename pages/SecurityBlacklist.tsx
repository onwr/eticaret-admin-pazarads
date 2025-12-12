
import React, { useEffect, useState } from 'react';
import { getBlacklist, addToBlacklist, removeFromBlacklist } from '../lib/api';
import { BlacklistItem } from '../types/security';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { Ban, Trash2, Plus, Shield } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const SecurityBlacklist: React.FC = () => {
  const { t } = useLanguage();
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIp, setNewIp] = useState('');
  const [reason, setReason] = useState('');
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

  const loadData = async () => {
    try {
      const data = await getBlacklist();
      setBlacklist(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;
    setLoading(true);
    await addToBlacklist(newIp, reason || t('security.manual_block'));
    setNewIp('');
    setReason('');
    await loadData();
  };

  const handleRemove = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t('common.delete_confirm_title') || 'Silme Onayı',
      message: t('security.unblock_confirm'),
      onConfirm: async () => {
        setLoading(true);
        await removeFromBlacklist(id);
        await loadData();
      },
      isDestructive: true
    });
  };

  if (loading && blacklist.length === 0) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Ban className="text-red-600" />
          {t('security.blacklist.title')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{t('security.blacklist.subtitle')}</p>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">{t('security.block_new_ip')}</h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('security.ip_placeholder')}
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
              required
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('security.reason_placeholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> {t('security.block_ip')}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('security.ip_address')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('security.reason')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('security.date_added')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('security.added_by')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('security.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {blacklist.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 flex flex-col items-center gap-2"><Shield size={24} className="text-green-500" /> {t('security.no_ips')}</td></tr>
            ) : (
              blacklist.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-gray-900">{item.ip}</td>
                  <td className="px-6 py-4 text-gray-600">{item.reason}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.createdBy}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('security.unblock')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

export default SecurityBlacklist;
