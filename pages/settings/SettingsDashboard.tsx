
import React from 'react';
import { Settings, Globe, Shield, CreditCard, Truck, MessageSquare, Phone, BrainCircuit, Users, FileSpreadsheet, List, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';

interface SettingsDashboardProps {
  onNavigate: (view: string) => void;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const categories = [
    {
      title: t('settings.general'), items: [
        { label: t('settings.site_identity'), icon: Settings, view: 'settings-general', desc: t('settings.site_identity_desc') },
        { label: t('settings.languages'), icon: Globe, view: 'settings-languages', desc: t('settings.languages_desc') },
        { label: t('settings.order_statuses'), icon: List, view: 'settings-statuses', desc: t('settings.order_statuses_desc') },
        { label: t('settings.export_templates'), icon: FileSpreadsheet, view: 'settings-exports', desc: t('settings.export_templates_desc') },
        { label: t('settings.legal'), icon: Shield, view: 'settings-legal', desc: t('settings.legal_desc') },
        { label: t('settings.pixels'), icon: Globe, view: 'settings-pixels', desc: t('settings.pixels_desc') },
        { label: t('settings.users'), icon: Users, view: 'settings-users', desc: t('settings.users_desc') },
        { label: t('settings.media'), icon: ImageIcon, view: 'settings-media', desc: t('settings.media_desc') },
      ]
    },
    {
      title: t('settings.integrations'), items: [
        { label: t('settings.payment'), icon: CreditCard, view: 'settings-payment', desc: t('settings.payment_desc') },
        { label: t('settings.cargo'), icon: Truck, view: 'settings-cargo', desc: t('settings.cargo_desc') },
        { label: t('settings.sms'), icon: MessageSquare, view: 'settings-sms', desc: t('settings.sms_desc') },
        { label: t('settings.whatsapp'), icon: MessageSquare, view: 'settings-whatsapp', desc: t('settings.whatsapp_desc') },
        { label: t('settings.callcenter'), icon: Phone, view: 'settings-callcenter', desc: t('settings.callcenter_desc') },
        { label: t('settings.ai'), icon: BrainCircuit, view: 'settings-ai', desc: t('settings.ai_desc') },
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('settings.subtitle')}</p>
      </div>

      {categories.map((cat, idx) => (
        <div key={idx}>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 pl-1">{cat.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.items.map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors text-gray-600">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.label}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsDashboard;
