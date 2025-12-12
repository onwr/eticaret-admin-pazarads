
import React, { useEffect, useState } from 'react';
import { getWhatsappLogs } from '../lib/api';
import { WhatsappLog } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { MessageCircle, RefreshCw, CheckCheck, AlertCircle, Eye } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const WhatsappHistory: React.FC = () => {
   const { t } = useLanguage();
   const [logs, setLogs] = useState<WhatsappLog[]>([]);
   const [loading, setLoading] = useState(true);

   const fetchLogs = async () => {
      setLoading(true);
      try {
         const data = await getWhatsappLogs();
         setLogs(data);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchLogs();
   }, []);

   if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

   return (
      <div className="space-y-6 animate-fade-in">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <MessageCircle className="text-green-600" />
                  {t('wa.title')}
               </h2>
               <p className="text-sm text-gray-500 mt-1">{t('wa.subtitle')}</p>
            </div>
            <button
               onClick={fetchLogs}
               className="p-2 text-gray-500 hover:text-green-600 bg-white border border-gray-200 rounded-lg transition-colors"
            >
               <RefreshCw size={20} />
            </button>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('wa.table_status')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('wa.table_to')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('wa.table_template')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('wa.table_provider')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('wa.table_date')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {logs.length === 0 ? (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t('wa.no_logs')}</td></tr>
                  ) : (
                     logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4">
                              {log.status === 'READ' ? (
                                 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <CheckCheck size={14} className="text-blue-600" /> {t('wa.status_read')}
                                 </span>
                              ) : log.status === 'DELIVERED' || log.status === 'SENT' ? (
                                 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCheck size={14} className="text-gray-400" /> {t(`wa.status_${log.status}`)}
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <AlertCircle size={12} /> {t(`wa.status_${log.status}`)}
                                 </span>
                              )}
                           </td>
                           <td className="px-6 py-4 font-mono text-sm text-gray-900">{log.phone}</td>
                           <td className="px-6 py-4">
                              <p className="text-xs font-bold text-gray-700 mb-1 bg-gray-100 inline-block px-1 rounded">{log.templateName}</p>
                              <p className="text-sm text-gray-600 max-w-md truncate" title={log.content}>{log.content}</p>
                           </td>
                           <td className="px-6 py-4 text-xs text-gray-500">
                              {log.provider.replace('_', ' ')}
                           </td>
                           <td className="px-6 py-4 text-right text-xs text-gray-500">
                              {new Date(log.sentAt).toLocaleString()}
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default WhatsappHistory;
