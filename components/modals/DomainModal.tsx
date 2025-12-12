import React, { useState, useEffect } from 'react';
import { X, Loader2, Globe, Shield, Activity, Code } from 'lucide-react';
import { Domain, DomainFormData, Product, Template, Language } from '../../types';

interface DomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DomainFormData) => Promise<void>;
  initialData?: Domain;
  products: Product[];
  templates: Template[];
  languages: Language[];
}

const DomainModal: React.FC<DomainModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  products,
  templates,
  languages,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'tracking' | 'cloaking'>('general');
  const [formData, setFormData] = useState<DomainFormData>({
    domain: '',
    productId: '',
    languageId: '',
    templateId: '',
    themeColor: '#3B82F6',
    pixelCode: '',
    scriptCode: '',
    isActive: true,
    isCloakingActive: false,
    safePageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        domain: initialData.domain,
        productId: initialData.productId,
        languageId: initialData.languageId,
        templateId: initialData.templateId,
        themeColor: initialData.themeColor || '#3B82F6',
        pixelCode: initialData.pixelCode || '',
        scriptCode: initialData.scriptCode || '',
        isActive: initialData.isActive,
        isCloakingActive: initialData.isCloakingActive || false,
        safePageUrl: initialData.safePageUrl || '',
      });
    } else {
      setFormData({
        domain: '',
        productId: '',
        languageId: '',
        templateId: '',
        themeColor: '#3B82F6',
        pixelCode: '',
        scriptCode: '',
        isActive: true,
        isCloakingActive: false,
        safePageUrl: '',
      });
    }
    setActiveTab('general');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'tracking', label: 'Scripts & Pixel', icon: Code },
    { id: 'cloaking', label: 'Cloaking', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Domain Configuration' : 'Connect New Domain'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
                <div className="relative">
                   <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input
                    type="text"
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linked Product</label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    required
                    value={formData.languageId}
                    onChange={(e) => setFormData(prev => ({ ...prev, languageId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Language...</option>
                    {languages.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.code.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Landing Template</label>
                   <select
                    required
                    value={formData.templateId}
                    onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.themeColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={formData.themeColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer font-medium">
                  Domain is Active
                </label>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
                <input
                  type="text"
                  value={formData.pixelCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pixelCode: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                  placeholder="e.g. 123456789012345"
                />
                <p className="text-xs text-gray-500 mt-1">Enter just the ID, not the full script code.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Header Scripts</label>
                <textarea
                  rows={8}
                  value={formData.scriptCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, scriptCode: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                  placeholder="<script>...</script>"
                />
                <p className="text-xs text-gray-500 mt-1">Scripts will be injected into the &lt;head&gt; section of the landing page.</p>
              </div>
            </div>
          )}

          {activeTab === 'cloaking' && (
             <div className="space-y-6">
               <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                 <div className="flex items-start gap-3">
                    <Activity className="text-orange-600 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-orange-800">Advanced Bot Detection</h4>
                      <p className="text-xs text-orange-700 mt-1">
                        When enabled, visitors identified as bots/crawlers will be redirected to the "Safe Page". 
                        Real users will see the "Money Page" (Product Landing).
                      </p>
                    </div>
                 </div>
               </div>

               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">Cloaking System</h4>
                    <p className="text-xs text-gray-500">Enable or disable traffic filtering</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isCloakingActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isCloakingActive: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
               </div>

               <div className={`transition-all duration-300 ${formData.isCloakingActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Safe Page URL</label>
                 <div className="relative">
                   <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                   <input
                    type="url"
                    value={formData.safePageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, safePageUrl: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="https://my-safe-blog.com/article"
                  />
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   Bots and reviewers will see this page. It should be compliant with ad network policies.
                 </p>
               </div>
             </div>
          )}

          <div className="pt-6 flex justify-end gap-3 mt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {initialData ? 'Update Configuration' : 'Connect Domain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DomainModal;