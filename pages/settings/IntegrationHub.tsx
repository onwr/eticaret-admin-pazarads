
import React, { useState, useEffect } from 'react';
import { ProviderConfig } from '../../lib/constants/providers';
import { getIntegrationSettings, updateIntegrationSettings } from '../../lib/api';
import ProviderCard from '../../components/ProviderCard';
import SettingsForm from '../../components/SettingsForm';
import { X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';

interface IntegrationHubProps {
  category: 'sms' | 'whatsapp' | 'callcenter' | 'payment' | 'cargo' | 'ai';
  title: string;
  onBack: () => void;
}

const IntegrationHub: React.FC<IntegrationHubProps> = ({ category, title, onBack }) => {
  const { t } = useLanguage();
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfig | null>(null);

  useEffect(() => {
    loadProviders();
  }, [category]);

  const loadProviders = async () => {
    const allProviders = await getIntegrationSettings();
    const filtered = allProviders.filter(p => p.category === category);
    setProviders(filtered);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, isActive } : p));
    await updateIntegrationSettings(id, { isActive });
  };

  const handleSave = async (id: string, data: Record<string, any>) => {
    await updateIntegrationSettings(id, { credentials: data, isConfigured: true });
    setProviders(prev => prev.map(p =>
      p.id === id ? { ...p, credentials: data, isConfigured: true } : p
    ));
    setSelectedProvider(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> {t('settings.back')}
      </button>

      <div>
        <h2 className="text-2xl font-bold text-gray-800">{t('settings.integration.title').replace('{title}', title)}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('settings.integration.subtitle').replace('{title}', title.toLowerCase())}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(provider => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onConfigure={setSelectedProvider}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Configuration Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">{t('settings.integration.configure').replace('{name}', selectedProvider.name)}</h2>
              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <SettingsForm
                provider={selectedProvider}
                onSave={handleSave}
                onCancel={() => setSelectedProvider(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationHub;
