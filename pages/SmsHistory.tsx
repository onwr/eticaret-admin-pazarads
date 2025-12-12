
import React, { useEffect, useState } from 'react';
import { getSmsLogs } from '../lib/api';
import { SmsLog } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { MessageSquare, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const SmsHistory: React.FC = () => {
   const { t } = useLanguage();
   const [logs, setLogs] = useState<SmsLog[]>([]);
   const [loading, setLoading] = useState(true);

   const fetchLogs = async () => {
      setLoading(true);
      try {
         const data = await getSmsLogs();
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
                  <MessageSquare className="text-green-600" />
                  {t('sms.title')}
               </h2>
               <p className="text-sm text-gray-500 mt-1">{t('sms.subtitle')}</p>
            </div>
            <button
               onClick={fetchLogs}
               className="p-2 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded-lg transition-colors"
            >
               <RefreshCw size={20} />
            </button>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('sms.table_status')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('sms.table_to')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('sms.table_message')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('sms.table_details')}</th>
                     <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('sms.table_date')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {logs.length === 0 ? (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t('sms.no_logs')}</td></tr>
                  ) : (
                     logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4">
                              {log.status === 'DELIVERED' || log.status === 'SENT' ? (
                                 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle size={12} /> {t(`sms.status_${log.status}`)}
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <XCircle size={12} /> {t(`sms.status_${log.status}`)}
                                 </span>
                              )}
                           </td>
                           <td className="px-6 py-4 font-mono text-sm text-gray-900">{log.phone}</td>
                           <td className="px-6 py-4">
                              <p className="text-sm text-gray-600 max-w-md truncate" title={log.message}>{log.message}</p>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-col text-xs text-gray-500">
                                 <span>{t('sms.provider')} {log.provider}</span>
                                 <span>{t('sms.type')} {log.type}</span>
                              </div>
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

export default SmsHistory;
