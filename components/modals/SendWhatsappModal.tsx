
import React, { useState, useEffect } from 'react';
import { X, Loader2, Send, MessageCircle } from 'lucide-react';
import { WhatsappTemplate, WhatsappProvider, Order } from '../../types';
import { getWhatsappTemplates, sendWhatsappMessage } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface SendWhatsappModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const SendWhatsappModal: React.FC<SendWhatsappModalProps> = ({ order, isOpen, onClose }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsappTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [provider, setProvider] = useState<WhatsappProvider>(WhatsappProvider.META_CLOUD);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTemplate) {
      let content = selectedTemplate.content
        .replace('{name}', order.customer?.name || '')
        .replace('{orderNumber}', order.orderNumber)
        .replace('{trackingLink}', 'https://track.pazarads.com/' + order.orderNumber);

      setPreviewContent(content);
    } else {
      setPreviewContent('');
    }
  }, [selectedTemplate, order]);

  const loadTemplates = async () => {
    const data = await getWhatsappTemplates();
    // Only show approved templates
    setTemplates(data.filter(t => t.status === 'APPROVED'));
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tmplId = e.target.value;
    const tmpl = templates.find(t => t.id === tmplId) || null;
    setSelectedTemplate(tmpl);
  };

  const handleSend = async () => {
    if (!user || !order.customer?.phone || !selectedTemplate) return;
    setIsSending(true);
    try {
      await sendWhatsappMessage(
        order.customer.phone,
        selectedTemplate.id,
        previewContent,
        provider,
        { id: user.id, name: user.name || 'Agent' },
        order.id
      );
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to send WhatsApp message');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle size={20} className="text-green-600" />
            Send WhatsApp
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 font-mono text-sm">
              {order.customer?.name} ({order.customer?.phone})
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as WhatsappProvider)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              {Object.values(WhatsappProvider).map(p => (
                <option key={p} value={p}>{p.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
            <select
              onChange={handleTemplateChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">-- Choose a Template --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.language})</option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="bg-[#E7FCE3] p-4 rounded-lg border border-green-100 relative">
              {selectedTemplate.header && <p className="font-bold text-gray-900 text-sm mb-1">{selectedTemplate.header}</p>}
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{previewContent}</p>
              {selectedTemplate.footer && <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-green-200">{selectedTemplate.footer}</p>}

              <div className="absolute top-2 right-2 text-xs bg-white/50 px-1.5 rounded text-gray-500">Preview</div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !selectedTemplate}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Send Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendWhatsappModal;
