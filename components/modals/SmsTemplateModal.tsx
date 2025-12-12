
import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText } from 'lucide-react';
import { SmsTemplate, SmsTemplateFormData, SmsType } from '../../types';

interface SmsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SmsTemplateFormData) => Promise<void>;
  initialData?: SmsTemplate;
}

const SmsTemplateModal: React.FC<SmsTemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<SmsTemplateFormData>({
    title: '',
    content: '',
    type: SmsType.GENERAL,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        type: initialData.type,
        isActive: initialData.isActive,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        type: SmsType.GENERAL,
        isActive: true,
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit SMS Template' : 'New SMS Template'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Order Confirmation"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
               <select
                 value={formData.type}
                 onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as SmsType }))}
                 className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
               >
                 {Object.values(SmsType).map(t => (
                   <option key={t} value={t}>{t.replace('_', ' ')}</option>
                 ))}
               </select>
            </div>
            <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  Active
                </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Message Content</label>
              <div className="flex gap-1">
                 {['{name}', '{orderNumber}', '{trackingCode}'].map(v => (
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-mono text-sm"
              placeholder="Hi {name}, your order #{orderNumber} is confirmed."
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {formData.content.length} characters | ~{Math.ceil(formData.content.length / 160)} SMS
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
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
              {initialData ? 'Update Template' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmsTemplateModal;
