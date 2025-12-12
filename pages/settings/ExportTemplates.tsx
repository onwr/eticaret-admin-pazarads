
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';
import { getExportTemplates, createExportTemplate, updateExportTemplate, deleteExportTemplate } from '../../lib/api';
import { ExportTemplate } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ExportTemplateModal from '../../components/modals/ExportTemplateModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useLanguage } from '../../lib/i18n';

interface ExportTemplatesProps {
  onBack: () => void;
}

const ExportTemplates: React.FC<ExportTemplatesProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | undefined>(undefined);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getExportTemplates();
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (t: ExportTemplate) => {
    setEditingTemplate(t);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t('common.delete_confirm_title') || 'Silme Onayı',
      message: t('settings.export.delete_confirm'),
      onConfirm: async () => {
        await deleteExportTemplate(id);
        loadData();
      },
      isDestructive: true
    });
  };

  const handleModalSubmit = async (data: Omit<ExportTemplate, 'id'>) => {
    if (editingTemplate) {
      await updateExportTemplate(editingTemplate.id, data);
    } else {
      await createExportTemplate(data);
    }
    loadData();
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> {t('settings.back')}
      </button>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('settings.export.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.export.subtitle')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >

          <Plus size={18} /> {t('settings.export.new')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <FileSpreadsheet size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(template)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(template.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">{template.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('settings.export.columns_config').replace('{count}', template.columns.length.toString())}</p>

            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {template.columns.slice(0, 3).map((c, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{c.header}</span>
                ))}
                {template.columns.length > 3 && <span className="text-xs text-gray-400 px-1">{t('settings.export.more').replace('{count}', (template.columns.length - 3).toString())}</span>}
              </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            {t('settings.export.no_templates')}
          </div>
        )}
      </div>

      <ExportTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTemplate}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};

export default ExportTemplates;
