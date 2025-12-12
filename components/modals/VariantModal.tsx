import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ProductVariant, VariantFormData } from '../../types';

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VariantFormData) => Promise<void>;
  initialData?: ProductVariant;
}

const VariantModal: React.FC<VariantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    type: string;
    valuesStr: string;
  }>({
    name: '',
    type: 'text',
    valuesStr: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        valuesStr: initialData.values.join(', '),
      });
    } else {
      setFormData({ name: '', type: 'text', valuesStr: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const values = formData.valuesStr.split(',').map(v => v.trim()).filter(v => v.length > 0);
    
    try {
      await onSubmit({
        name: formData.name,
        type: formData.type,
        values: values,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Variant' : 'Add Variant Group'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Color, Size"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="text">Text / Button</option>
              <option value="color">Color Swatch</option>
              <option value="image">Image Select</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Values</label>
            <textarea
              rows={3}
              required
              value={formData.valuesStr}
              onChange={(e) => setFormData(prev => ({ ...prev, valuesStr: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Red, Blue, Green (separated by commas)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate options with commas.</p>
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
              {initialData ? 'Update Variant' : 'Add Variant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VariantModal;