
import React, { useState } from 'react';
import { Copy, Check, Sparkles, RefreshCw } from 'lucide-react';

interface AiOutputProps {
  content?: string;
  data?: any;
  isLoading: boolean;
  onRetry?: () => void;
  title?: string;
}

const AiOutput: React.FC<AiOutputProps> = ({ content, data, isLoading, onRetry, title = 'AI Output' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-pulse h-full min-h-[200px]">
        <Sparkles className="text-purple-500 mb-3 animate-bounce" size={32} />
        <p className="text-gray-600 font-medium">AI is thinking...</p>
        <p className="text-xs text-gray-400 mt-1">Generating optimized content</p>
      </div>
    );
  }

  if (!content && !data) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
           <Sparkles className="text-gray-300" size={24} />
        </div>
        <p className="text-gray-500">Ready to generate.</p>
        <p className="text-xs text-gray-400 mt-1">Select options and click Generate.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col animate-fade-in">
      <div className="bg-purple-50 px-4 py-3 border-b border-purple-100 flex justify-between items-center">
        <h3 className="font-bold text-purple-900 flex items-center gap-2 text-sm">
          <Sparkles size={14} /> {title}
        </h3>
        <div className="flex gap-2">
          {onRetry && (
            <button onClick={onRetry} className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" title="Regenerate">
              <RefreshCw size={16} />
            </button>
          )}
          {content && (
            <button onClick={handleCopy} className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" title="Copy Text">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1">
        {content && (
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {content}
          </div>
        )}
        
        {/* Special rendering for Ad Copy Data */}
        {data && data.headline && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Headline</p>
              <p className="text-lg font-bold text-gray-900">{data.headline}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Primary Text</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.primaryText}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">CTA</p>
              <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium border border-gray-200">
                {data.cta}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiOutput;
