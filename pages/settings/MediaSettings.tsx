import React from 'react';
import { ArrowLeft } from 'lucide-react';
import MediaLibrary from '../../components/MediaLibrary';
import { useLanguage } from '../../lib/i18n';

interface MediaSettingsProps {
    onBack: () => void;
}

const MediaSettings: React.FC<MediaSettingsProps> = ({ onBack }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
            <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> {t('settings.back')}
            </button>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('settings.media.title')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.media.subtitle')}</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <MediaLibrary className="h-full" />
            </div>
        </div>
    );
};

export default MediaSettings;
