import React, { useState } from 'react';
import { Save, BrainCircuit, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';

const AiSettings: React.FC = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [settings, setSettings] = useState({
        defaultProvider: 'gemini',
        geminiKey: '',
        openaiKey: '',
        claudeKey: '',
        imageProvider: 'pollinations',
        language: 'tr'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        setSuccess(false);

        // Simulate API save
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save to localStorage for persistence across pages
        localStorage.setItem('ai_settings', JSON.stringify(settings));
        console.log('Settings saved:', settings);

        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    // Load settings on mount
    React.useEffect(() => {
        const saved = localStorage.getItem('ai_settings');
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('settings.ai.title')}</h2>
                    <p className="text-gray-500 text-sm mt-1">{t('settings.ai.subtitle')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-200"
                >
                    {loading ? (
                        <span className="animate-spin">⌛</span>
                    ) : success ? (
                        <CheckCircle2 size={20} />
                    ) : (
                        <Save size={20} />
                    )}
                    {loading ? t('settings.ai.saving') : success ? t('settings.ai.saved') : t('settings.ai.save')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider Selection */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <BrainCircuit size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800">{t('settings.ai.model_pref')}</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.ai.default_text_model')}</label>
                            <select
                                name="defaultProvider"
                                value={settings.defaultProvider}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                            >
                                <option value="gemini">Google Gemini (Önerilen - Ücretsiz)</option>
                                <option value="openai">OpenAI GPT-4 (Ücretli)</option>
                                <option value="claude">Anthropic Claude 3 (Ücretli)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {settings.defaultProvider === 'gemini' && t('settings.ai.gemini_desc')}
                                {settings.defaultProvider === 'openai' && t('settings.ai.openai_desc')}
                                {settings.defaultProvider === 'claude' && t('settings.ai.claude_desc')}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.ai.image_generator')}</label>
                            <select
                                name="imageProvider"
                                value={settings.imageProvider}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                            >
                                <option value="pollinations">Pollinations.ai (Ücretsiz)</option>
                                <option value="dalle">DALL-E 3 (Ücretli)</option>
                                <option value="midjourney">Midjourney (Yakında)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.ai.default_lang')}</label>
                            <select
                                name="language"
                                value={settings.language}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                            >
                                <option value="tr">Türkçe</option>
                                <option value="en">İngilizce</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* API Keys */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                            <Key size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800">{t('settings.ai.api_keys')}</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Google Gemini API Key</label>
                            <input
                                type="password"
                                name="geminiKey"
                                value={settings.geminiKey}
                                onChange={handleChange}
                                placeholder="AIzaSy..."
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
                            />
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                {t('settings.ai.get_key')}
                            </a>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
                            <input
                                type="password"
                                name="openaiKey"
                                value={settings.openaiKey}
                                onChange={handleChange}
                                placeholder="sk-..."
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Anthropic API Key</label>
                            <input
                                type="password"
                                name="claudeKey"
                                value={settings.claudeKey}
                                onChange={handleChange}
                                placeholder="sk-ant-..."
                                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
                            />
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg flex gap-2 items-start text-xs text-blue-700 mt-4">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p>
                                {t('settings.ai.security_note')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiSettings;
