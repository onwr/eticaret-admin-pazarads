
import React, { useState, useEffect } from 'react';
import { X, Loader2, MessageCircle } from 'lucide-react';
import { WhatsappTemplate, WhatsappTemplateFormData, WhatsappTemplateCategory } from '../../types';

interface WhatsappTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WhatsappTemplateFormData) => Promise<void>;
  initialData?: WhatsappTemplate;
}

const WhatsappTemplateModal: React.FC<WhatsappTemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<WhatsappTemplateFormData>({
    name: '',
    category: WhatsappTemplateCategory.UTILITY,
    language: 'en',
    content: '',
    header: '',
    footer: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        language: initialData.language,
        content: initialData.content,
        header: initialData.header || '',
        footer: initialData.footer || '',
      });
    } else {
      setFormData({
        name: '',
        category: WhatsappTemplateCategory.UTILITY,
        language: 'en',
        content: '',
        header: '',
        footer: '',
      });
    }
  }, [initialData, isOpen]);

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + variable
    }));
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle size={20} className="text-green-600" />
            {initialData ? 'Edit WhatsApp Template' : 'New WhatsApp Template'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-mono text-sm"
              placeholder="e.g. order_confirmation"
            />
            <p className="text-xs text-gray-500 mt-1">Lowercase, underscores only.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as WhatsappTemplateCategory }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
              >
                {Object.values(WhatsappTemplateCategory).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
              >
                <option value="en">English (en)</option>
                <option value="tr">Turkish (tr)</option>
                <option value="ar">Arabic (ar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Header (Optional)</label>
            <input
              type="text"
              value={formData.header}
              onChange={(e) => setFormData(prev => ({ ...prev, header: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              placeholder="e.g. Order Update"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Body Content</label>
              <div className="flex gap-1">
                {['{name}', '{orderNumber}', '{trackingLink}'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-200 text-gray-600"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none font-sans text-sm"
              placeholder="Hello {name}, your order #{orderNumber} is confirmed."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer (Optional)</label>
            <input
              type="text"
              value={formData.footer}
              onChange={(e) => setFormData(prev => ({ ...prev, footer: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-xs text-gray-500"
              placeholder="e.g. Pazarads Shop Team"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
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
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {initialData ? 'Update Template' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhatsappTemplateModal;
