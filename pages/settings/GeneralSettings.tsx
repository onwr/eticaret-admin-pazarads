
import React, { useState, useEffect } from 'react';
import { Save, Loader2, Upload, ArrowLeft } from 'lucide-react';
import MediaLibraryModal from '../../components/modals/MediaLibraryModal';
import { useLanguage } from '../../lib/i18n';
import { getGeneralSettings, updateGeneralSettings } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

interface GeneralSettingsProps {
  onBack: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteTitle: '',
    metaDescription: '',
    supportEmail: '',
    supportWhatsapp: '',
    currency: 'USD',
    logo: '',
    favicon: ''
  });
  const [mediaModalConfig, setMediaModalConfig] = useState<{ isOpen: boolean; type: 'logo' | 'favicon' | null }>({ isOpen: false, type: null });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getGeneralSettings();
      setFormData(settings);
    } catch (error) {
      console.error('Failed to load settings', error);
      addNotification('error', t('common.error'));
    }
  };

  const handleMediaSelect = (url: string) => {
    if (mediaModalConfig.type === 'logo') {
      setFormData(prev => ({ ...prev, logo: url }));
    } else if (mediaModalConfig.type === 'favicon') {
      setFormData(prev => ({ ...prev, favicon: url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateGeneralSettings(formData);
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
          <h2 className="text-2xl font-bold text-gray-800">{t('settings.general.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.general.subtitle')}</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-70"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {t('settings.save')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('settings.site_identity')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.site_title')}</label>
                <input
                  type="text"
                  value={formData.siteTitle}
                  onChange={e => setFormData({ ...formData, siteTitle: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.meta_desc')}</label>
                <textarea
                  rows={3}
                  value={formData.metaDescription}
                  onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('settings.contact_info')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.support_email')}</label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={e => setFormData({ ...formData, supportEmail: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.whatsapp_number')}</label>
                <input
                  type="text"
                  value={formData.supportWhatsapp}
                  onChange={e => setFormData({ ...formData, supportWhatsapp: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase">{t('settings.branding')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.logo')}</label>
                <div
                  onClick={() => setMediaModalConfig({ isOpen: true, type: 'logo' })}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden"
                >
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="h-16 object-contain" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-300">NS</span>
                      </div>
                      <span className="text-xs">{t('settings.click_upload')}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.favicon')}</label>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {formData.favicon ? (
                      <img src={formData.favicon} alt="Favicon" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                    )}
                  </div>
                  <button
                    onClick={() => setMediaModalConfig({ isOpen: true, type: 'favicon' })}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Upload size={14} /> {t('settings.upload')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaLibraryModal
        isOpen={mediaModalConfig.isOpen}
        onClose={() => setMediaModalConfig({ isOpen: false, type: null })}
        onSelect={handleMediaSelect}
        initialCategory="general"
      />
    </div>
  );
};

export default GeneralSettings;

