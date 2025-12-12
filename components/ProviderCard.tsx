
import React from 'react';
import { ProviderConfig } from '../lib/constants/providers';
import { Settings, CheckCircle, XCircle, Power } from 'lucide-react';

interface ProviderCardProps {
  provider: ProviderConfig;
  onConfigure: (provider: ProviderConfig) => void;
  onToggle: (id: string, state: boolean) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onConfigure, onToggle }) => {
  return (
    <div className={`bg-white rounded-xl border p-5 transition-all ${provider.isActive ? 'border-blue-200 shadow-sm ring-1 ring-blue-100' : 'border-gray-200 opacity-80 hover:opacity-100'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${provider.isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {provider.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{provider.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${provider.isConfigured ? 'bg-green-500' : 'bg-orange-400'}`}></span>
              <span className="text-xs text-gray-500">{provider.isConfigured ? 'Configured' : 'Setup Required'}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onToggle(provider.id, !provider.isActive)}
          className={`p-2 rounded-lg transition-colors ${provider.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
          title={provider.isActive ? 'Disable' : 'Enable'}
        >
          <Power size={18} />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">
        {provider.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400 font-mono">{provider.id}</span>
        <button 
          onClick={() => onConfigure(provider)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-200 transition-colors"
        >
          <Settings size={16} /> Configure
        </button>
      </div>
    </div>
  );
};

export default ProviderCard;
