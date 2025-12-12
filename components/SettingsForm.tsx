
import React, { useState, useEffect } from 'react';
import { ProviderConfig } from '../lib/constants/providers';
import { Save, Check, Loader2, Eye, EyeOff } from 'lucide-react';

interface SettingsFormProps {
  provider: ProviderConfig;
  onSave: (id: string, data: any) => Promise<void>;
  onCancel: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ provider, onSave, onCancel }) => {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize with existing credentials or empty strings based on schema
    const initial: any = { ...provider.credentials };
    provider.fields.forEach(field => {
      if (initial[field.key] === undefined) {
        initial[field.key] = '';
      }
    });
    setFormData(initial);
  }, [provider]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(provider.id, formData);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
        <h3 className="font-bold text-blue-900 flex items-center gap-2">
          Configure {provider.name}
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          Enter your API credentials below. These are stored securely.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {provider.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            
            {field.type === 'select' ? (
              <select
                value={formData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="">Select an option</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <input
                  type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => toggleSecret(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            )}
            {field.description && <p className="text-xs text-gray-500 mt-1">{field.description}</p>}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Configuration
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;
