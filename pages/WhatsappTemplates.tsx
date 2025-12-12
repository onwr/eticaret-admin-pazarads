
import React, { useEffect, useState } from 'react';
import { getWhatsappTemplates, saveWhatsappTemplate, updateWhatsappTemplate, deleteWhatsappTemplate } from '../lib/api';
import { WhatsappTemplate, WhatsappTemplateFormData, WhatsappTemplateStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import WhatsappTemplateModal from '../components/modals/WhatsappTemplateModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { MessageCircle, Plus, Edit2, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';

const WhatsappTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsappTemplate | undefined>(undefined);
  const [deletingTemplate, setDeletingTemplate] = useState<WhatsappTemplate | undefined>(undefined);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await getWhatsappTemplates();
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

  const handleEdit = (t: WhatsappTemplate) => {
    setEditingTemplate(t);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingTemplate) {
      await deleteWhatsappTemplate(deletingTemplate.id);
      setDeletingTemplate(undefined);
      fetchTemplates();
    }
  };

  const handleModalSubmit = async (data: WhatsappTemplateFormData) => {
    if (editingTemplate) {
      await updateWhatsappTemplate(editingTemplate.id, data);
    } else {
      await saveWhatsappTemplate(data);
    }
    fetchTemplates();
  };

  const getStatusBadge = (status: WhatsappTemplateStatus) => {
    switch (status) {
        case WhatsappTemplateStatus.APPROVED:
            return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold"><CheckCircle size={12}/> APPROVED</span>;
        case WhatsappTemplateStatus.PENDING:
            return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold"><Clock size={12}/> PENDING</span>;
        case WhatsappTemplateStatus.REJECTED:
            return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold"><XCircle size={12}/> REJECTED</span>;
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
             <MessageCircle className="text-green-600" />
             WhatsApp Templates
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage official WhatsApp Business templates.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {templates.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden">
               {/* Background Pattern for WA feel */}
               <div className="absolute inset-0 bg-[#e5ddd5] opacity-10 z-0"></div>

               <div className="relative z-10 flex flex-col h-full">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="font-bold text-gray-900">{t.name}</h3>
                         <span className="text-xs text-gray-500 uppercase">{t.category} • {t.language.toUpperCase()}</span>
                      </div>
                      {getStatusBadge(t.status)}
                   </div>
                   
                   <div className="bg-[#DCF8C6] p-3 rounded-lg rounded-tl-none border border-green-200 text-sm text-gray-800 mb-6 flex-1 shadow-sm">
                      {t.header && <p className="font-bold text-xs mb-1">{t.header}</p>}
                      <p className="whitespace-pre-wrap">{t.content}</p>
                      {t.footer && <p className="text-[10px] text-gray-500 mt-2 pt-1 border-t border-green-300/50">{t.footer}</p>}
                   </div>

                   <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => handleEdit(t)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
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
            </div>
         ))}
      </div>

      <WhatsappTemplateModal 
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

export default WhatsappTemplates;
