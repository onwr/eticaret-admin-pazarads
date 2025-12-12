
import React, { useEffect, useState } from 'react';
import { getSmsTemplates, saveSmsTemplate, updateSmsTemplate, deleteSmsTemplate } from '../lib/api';
import { SmsTemplate, SmsTemplateFormData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import SmsTemplateModal from '../components/modals/SmsTemplateModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { FileText, Plus, Edit2, Trash2 } from 'lucide-react';

const SmsTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | undefined>(undefined);
  const [deletingTemplate, setDeletingTemplate] = useState<SmsTemplate | undefined>(undefined);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await getSmsTemplates();
      setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = () => {
    setEditingTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (t: SmsTemplate) => {
    setEditingTemplate(t);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingTemplate) {
      await deleteSmsTemplate(deletingTemplate.id);
      setDeletingTemplate(undefined);
      fetchTemplates();
    }
  };

  const handleModalSubmit = async (data: SmsTemplateFormData) => {
    if (editingTemplate) {
      await updateSmsTemplate(editingTemplate.id, data);
    } else {
      await saveSmsTemplate(data);
    }
    fetchTemplates();
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
             <FileText className="text-blue-600" />
             SMS Templates
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage reusable message templates.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {templates.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <h3 className="font-bold text-gray-900">{t.title}</h3>
                     <span className="text-xs text-gray-500 uppercase">{t.type.replace('_', ' ')}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                     {t.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
               </div>
               
               <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-600 font-mono mb-6 flex-1">
                  {t.content}
               </div>

               <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                  <button 
                    onClick={() => handleEdit(t)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => setDeletingTemplate(t)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
               </div>
            </div>
         ))}
      </div>

      <SmsTemplateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTemplate}
      />

      <ConfirmDialog
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(undefined)}
        onConfirm={handleDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template?"
        isDestructive={true}
      />
    </div>
  );
};

export default SmsTemplates;
