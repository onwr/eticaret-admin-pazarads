import React, { useEffect, useState } from 'react';
import { Template } from '../types';
import { getTemplates } from '../lib/api';
import TemplateCard from '../components/TemplateCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Layout, Download } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import TemplateExportModal from '../components/modals/TemplateExportModal';

interface TemplatesProps {
  onNavigate: (view: string) => void;
}

const Templates: React.FC<TemplatesProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Layout className="text-blue-600" />
            {t('templates.title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t('templates.subtitle')}</p>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium text-sm transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
        >
          <Download size={18} />
          {t('templates.api_integration')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onPreview={() => onNavigate(`preview-template/${template.id}`)}
          />
        ))}
      </div>

      <TemplateExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        templates={templates}
      />
    </div>
  );
};

export default Templates;
