
import React, { useState, useEffect } from 'react';
import { X, Loader2, Send, MessageSquare } from 'lucide-react';
import { SmsType, SmsProvider, SmsTemplate, Order } from '../../types';
import { getSmsTemplates, sendSms } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface SendSmsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const SendSmsModal: React.FC<SendSmsModalProps> = ({ order, isOpen, onClose }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [message, setMessage] = useState('');
  const [provider, setProvider] = useState<SmsProvider>(SmsProvider.NETGSM);
  const [type, setType] = useState<SmsType>(SmsType.GENERAL);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      // Default message
      setMessage(`Hi ${order.customer?.name}, regarding your order #${order.orderNumber}: `);
    }
  }, [isOpen, order]);

  const loadTemplates = async () => {
    const data = await getSmsTemplates();
    setTemplates(data.filter(t => t.isActive));
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tmplId = e.target.value;
    setSelectedTemplate(tmplId);
    if (!tmplId) return;

    const tmpl = templates.find(t => t.id === tmplId);
    if (tmpl) {
      setType(tmpl.type);
      // Replace variables
      let content = tmpl.content
        .replace('{name}', order.customer?.name || '')
        .replace('{orderNumber}', order.orderNumber)
        .replace('{trackingCode}', 'TRK-999'); // Mock tracking
      setMessage(content);
    }
  };

  const handleSend = async () => {
    if (!user || !order.customer?.phone) return;
    setIsSending(true);
    try {
      await sendSms(
        order.customer.phone,
        message,
        provider,
        type,
        { id: user.id, name: user.name || 'Agent' },
        order.id
      );
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to send SMS');
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
            <MessageSquare size={20} className="text-blue-600" />
            Send SMS
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

           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                 <select 
                   value={provider}
                   onChange={(e) => setProvider(e.target.value as SmsProvider)}
                   className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                    {Object.values(SmsProvider).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                 <select 
                   value={selectedTemplate}
                   onChange={handleTemplateChange}
                   className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                    <option value="">Custom Message</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                 </select>
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{message.length} chars</p>
           </div>
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
            disabled={isSending || !message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendSmsModal;
