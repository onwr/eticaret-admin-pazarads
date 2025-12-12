
import React, { useState, useEffect } from 'react';
import { Save, Loader2, ArrowLeft, Code } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { getPixelSettings, updatePixelSettings } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

interface PixelSettingsProps {
  onBack: () => void;
}

const PixelSettings: React.FC<PixelSettingsProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [headCode, setHeadCode] = useState('');
  const [bodyCode, setBodyCode] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getPixelSettings();
      setHeadCode(settings.headCode);
      setBodyCode(settings.bodyCode);
    } catch (error) {
      console.error('Failed to load settings', error);
      addNotification('error', t('common.error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updatePixelSettings({ headCode, bodyCode });
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
          <h2 className="text-2xl font-bold text-gray-800">{t('settings.pixel.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.pixel.subtitle')}</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-70"
        >

          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {t('settings.pixel.save')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Code size={18} className="text-blue-600" /> {t('settings.pixel.head_code')}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{t('settings.pixel.head_desc')}</p>
          <textarea
            value={headCode}
            onChange={(e) => setHeadCode(e.target.value)}
            className="flex-1 w-full bg-gray-900 text-gray-300 font-mono text-xs p-4 rounded-lg outline-none resize-none"
            spellCheck={false}
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Code size={18} className="text-purple-600" /> {t('settings.pixel.body_code')}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{t('settings.pixel.body_desc')}</p>
          <textarea
            value={bodyCode}
            onChange={(e) => setBodyCode(e.target.value)}
            className="flex-1 w-full bg-gray-900 text-gray-300 font-mono text-xs p-4 rounded-lg outline-none resize-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PixelSettings;
