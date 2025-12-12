import React from 'react';
import { Template } from '../types';
import { Eye, Check } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface TemplateCardProps {
  template: Template;
  isSelected?: boolean;
  onSelect?: (template: Template) => void;
  onPreview?: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected = false,
  onSelect,
  onPreview
}) => {
  const { t } = useLanguage();
  return (
    <div className={`group relative bg-white rounded-xl overflow-hidden shadow-sm border transition-all duration-200
      ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-gray-200 hover:shadow-md'}`}>

      <div className="aspect-[3/2] bg-gray-100 overflow-hidden relative">
        <img
          src={template.thumbnailUrl || `https://via.placeholder.com/600x400?text=${template.name}`}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          {onPreview && (
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(template); }}
              className="p-2 bg-white rounded-full text-gray-800 hover:text-blue-600 hover:scale-110 transition-all shadow-lg"
              title={t('templates.preview')}
            >
              <Eye size={20} />
            </button>
          )}
          {onSelect && !isSelected && (
            <button
              onClick={() => onSelect(template)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 hover:scale-105 transition-all shadow-lg"
            >
              {t('templates.select')}
            </button>
          )}
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-lg z-10">
            <Check size={16} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900">{template.name}</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">{template.code}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {template.description}
        </p>
      </div>
    </div>
  );
};

export default TemplateCard;