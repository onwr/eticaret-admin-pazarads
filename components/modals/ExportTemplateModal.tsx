
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Save, Loader2 } from 'lucide-react';
import { ExportTemplate, ExportColumn } from '../../types';
import { useLanguage } from '../../lib/i18n';
import { useNotification } from '../../contexts/NotificationContext';

interface ExportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ExportTemplate, 'id'>) => Promise<void>;
  initialData?: ExportTemplate;
}

const ExportTemplateModal: React.FC<ExportTemplateModalProps> = ({
  isOpen, onClose, onSubmit, initialData
}) => {
  const { t } = useLanguage();

  // Available fields for mapping
  const AVAILABLE_FIELDS = [
    { label: t('export.field_order_number'), value: 'orderNumber' },
    { label: t('export.field_date'), value: 'createdAt' },
    { label: t('export.field_status'), value: 'status' },
    { label: t('export.field_total_amount'), value: 'totalAmount' },
    { label: t('export.field_payment_method'), value: 'paymentMethod' },
    { label: t('export.field_items'), value: 'formatted_items' },
    { label: t('export.field_customer_name'), value: 'customer.name' },
    { label: t('export.field_customer_phone'), value: 'customer.phone' },
    { label: t('export.field_city'), value: 'customer.city' },
    { label: t('export.field_district'), value: 'customer.district' },
    { label: t('export.field_address'), value: 'customer.address' },
    { label: t('export.field_product_name'), value: 'product.name' },
    { label: t('export.field_variant'), value: 'variantSelection' },
    { label: t('export.field_ip'), value: 'ipAddress' },
    { label: t('export.field_dealer_id'), value: 'dealerId' }
  ];

  const [name, setName] = useState('');
  const [columns, setColumns] = useState<ExportColumn[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColumns(initialData.columns);
    } else {
      setName('');
      setColumns([
        { id: '1', header: t('export.field_order_number'), type: 'DYNAMIC', value: 'orderNumber' },
        { id: '2', header: t('export.field_customer_name'), type: 'DYNAMIC', value: 'customer.name' }
      ]);
    }
  }, [initialData, isOpen]);

  const addColumn = () => {
    setColumns([...columns, {
      id: `col-${Date.now()}`,
      header: t('export.new_column'),
      type: 'DYNAMIC',
      value: 'orderNumber'
    }]);
  };

  const removeColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id));
  };

  const updateColumn = (id: string, field: keyof ExportColumn, val: any) => {
    setColumns(columns.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert(t('export.name_required'));
    setIsSubmitting(true);
    await onSubmit({ name, columns });
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? t('export.edit_template') : t('export.new_template')}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('export.template_name')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={t('export.template_name_placeholder')}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700">{t('export.column_config')}</h3>
              <button type="button" onClick={addColumn} className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-1">
                <Plus size={16} /> {t('export.add_column')}
              </button>
            </div>

            <div className="space-y-3">
              {columns.map((col, idx) => (
                <div key={col.id} className="flex flex-col md:flex-row gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm items-center">
                  <div className="text-gray-400 cursor-move hidden md:block"><GripVertical size={16} /></div>

                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('export.excel_header')}</label>
                    <input
                      type="text"
                      value={col.header}
                      onChange={e => updateColumn(col.id, 'header', e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                      placeholder={t('export.column_header_placeholder')}
                    />
                  </div>

                  <div className="w-full md:w-32">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('export.type')}</label>
                    <select
                      value={col.type}
                      onChange={e => updateColumn(col.id, 'type', e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
                    >
                      <option value="DYNAMIC">{t('export.type_dynamic')}</option>
                      <option value="STATIC">{t('export.type_static')}</option>
                    </select>
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('export.value_field')}</label>
                    {col.type === 'DYNAMIC' ? (
                      <select
                        value={col.value}
                        onChange={e => updateColumn(col.id, 'value', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
                      >
                        {AVAILABLE_FIELDS.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={col.value}
                        onChange={e => updateColumn(col.id, 'value', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                        placeholder={t('export.static_value')}
                      />
                    )}
                  </div>

                  <button type="button" onClick={() => removeColumn(col.id)} className="text-gray-400 hover:text-red-500 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{t('common.cancel')}</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportTemplateModal;
