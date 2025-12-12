
import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { generateAdCopy } from '../../lib/api';
import { AiProvider, AiResponse } from '../../types';
import AiOutput from '../AiOutput';

interface AdCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdCopyModal: React.FC<AdCopyModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    productName: '',
    audience: '',
    tone: 'Professional',
    provider: AiProvider.OPENAI
  });
  const [result, setResult] = useState<AiResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setResult(null);
    try {
      const response = await generateAdCopy(formData);
      setResult(response);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Inputs */}
        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 p-6 flex flex-col overflow-y-auto">
           <div className="mb-6">
             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <Sparkles size={20} className="text-purple-600" /> Ad Generator
             </h2>
             <p className="text-sm text-gray-500">Create high-converting ads in seconds.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value as AiProvider})}
                >
                  <option value={AiProvider.OPENAI}>OpenAI (GPT-4)</option>
                  <option value={AiProvider.GEMINI}>Google Gemini Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  placeholder="e.g. Ultra Earbuds"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <input 
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  placeholder="e.g. Fitness enthusiasts, Students"
                  value={formData.audience}
                  onChange={(e) => setFormData({...formData, audience: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white"
                  value={formData.tone}
                  onChange={(e) => setFormData({...formData, tone: e.target.value})}
                >
                  <option value="Professional">Professional</option>
                  <option value="Exciting">Exciting / Hype</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Urgent">Urgent (FOMO)</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Generate Ad
                </button>
              </div>
           </form>
        </div>

        {/* Right: Output */}
        <div className="flex-1 p-6 bg-white relative">
           <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg text-gray-500">
             <X size={20} />
           </button>
           
           <div className="h-full pt-8">
              <AiOutput 
                isLoading={isGenerating}
                data={result?.data}
                title="Generated Ad Copy"
              />
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdCopyModal;
