
import React, { useState, useEffect } from 'react';
import { Save, Loader2, ArrowLeft, FileText } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { getLegalSettings, updateLegalSettings } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

interface LegalSettingsProps {
  onBack: () => void;
}

const LegalSettings: React.FC<LegalSettingsProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'kvkk' | 'terms' | 'refund'>('kvkk');
  const [texts, setTexts] = useState({
    kvkk: '',
    terms: '',
    refund: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getLegalSettings();
      setTexts(settings);
    } catch (error) {
      console.error('Failed to load settings', error);
      addNotification('error', t('common.error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateLegalSettings(texts);
      addNotification('success', t('common.success'));
    } catch (error) {
      console.error('Failed to save settings', error);
      addNotification('error', t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> {t('settings.back')}
      </button>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('settings.legal.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.legal.subtitle')}</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-70"
        >

          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {t('settings.legal.save')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('kvkk')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'kvkk' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {t('settings.legal.kvkk')}
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'terms' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {t('settings.legal.terms')}
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'refund' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {t('settings.legal.refund')}
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
            <FileText size={16} />
            <span>{t('settings.legal.html_support')}</span>
          </div>
          <textarea
            value={texts[activeTab]}
            onChange={(e) => setTexts({ ...texts, [activeTab]: e.target.value })}
            className="flex-1 w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-sans text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default LegalSettings;
