import React, { useState } from 'react';
import { Save, Plus, Trash2, Search, Languages, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { useNotification } from '../../contexts/NotificationContext';

const LanguageSettings: React.FC = () => {
    const { t, language, addTranslation } = useLanguage();
    const { showNotification } = useNotification();
    const [searchQuery, setSearchQuery] = useState('');
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [selectedLang, setSelectedLang] = useState<'tr' | 'en'>('tr');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey || !newValue) return;

        addTranslation(selectedLang, newKey, newValue);
        showNotification('success', t('settings.languages.override_success'));
        setNewKey('');
        setNewValue('');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('settings.languages.title')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.languages.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add New Translation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-blue-600" />
                            {t('settings.languages.add_override')}
                        </h3>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLang('tr')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${selectedLang === 'tr' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Turkish (TR)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLang('en')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${selectedLang === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        English (EN)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.languages.key')}</label>
                                <input
                                    type="text"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="e.g. common.hello"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.languages.value')}</label>
                                <textarea
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                                    placeholder="Translation text..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {t('common.save')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List & Search (Placeholder for now as we don't expose all keys easily yet, but we can show recent overrides if we wanted) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Languages size={32} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Translation Management</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            You can manually override any text in the application by adding its key and the new value.
                            Changes are saved locally and applied immediately.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageSettings;
