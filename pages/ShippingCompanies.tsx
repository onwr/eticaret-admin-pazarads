
import React, { useState, useEffect } from 'react';
import { getShippingCompanies, updateShippingCompany } from '../lib/api';
import { ShippingCompany } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ShippingCompanyConfigModal from '../components/modals/ShippingCompanyConfigModal';
import { ArrowLeft, Building2, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { useNotification } from '../contexts/NotificationContext';

interface ShippingCompaniesProps {
   onBack: () => void;
}

const ShippingCompanies: React.FC<ShippingCompaniesProps> = ({ onBack }) => {
   const { t } = useLanguage();
   const { addNotification } = useNotification();
   const [companies, setCompanies] = useState<ShippingCompany[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedCompany, setSelectedCompany] = useState<ShippingCompany | null>(null);

   useEffect(() => {
      loadData();
   }, []);

   const loadData = async () => {
      try {
         const data = await getShippingCompanies();
         setCompanies(data || []);
      } catch (e) {
         console.error("Failed to load shipping companies", e);
      } finally {
         setLoading(false);
      }
   };

   const handleSaveConfig = async (id: string, data: Partial<ShippingCompany>) => {
      try {
         await updateShippingCompany(id, data);
         setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
         addNotification('success', 'Ayarlar başarıyla kaydedildi.');
      } catch (e) {
         console.error("Failed to update shipping company", e);
         const errorMessage = e instanceof Error ? e.message : String(e);
         addNotification('error', `Kaydetme başarısız: ${errorMessage}`);
      }
   };

   if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

   return (
      <div className="space-y-6 animate-fade-in">
         <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> {t('shipping.back')}
         </button>

         <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('shipping.companies.title')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('shipping.companies.subtitle')}</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map(company => (
               <div key={company.id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col h-full transition-all ${company.isActive ? 'border-blue-200 ring-1 ring-blue-50' : 'border-gray-200 opacity-75 grayscale-[0.5]'}`}>
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${company.isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                           <Building2 size={24} />
                        </div>
                        <div>
                           <h3 className="font-bold text-gray-900 text-lg">{company.name}</h3>
                           <span className="text-xs text-gray-400 font-mono uppercase">{company.code}</span>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        {company.isDefault && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded border border-yellow-200">{t('shipping.default')}</span>}
                        {company.isActive ? (
                           <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-green-200"><CheckCircle size={10} /> {t('shipping.active')}</span>
                        ) : (
                           <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-gray-200"><XCircle size={10} /> {t('shipping.inactive')}</span>
                        )}
                     </div>
                  </div>

                  <div className="flex-1">
                     <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4 border border-gray-100">
                        <p className="font-medium mb-1 text-xs text-gray-500 uppercase">{t('shipping.integration_type')}:</p>
                        <p className="font-semibold text-gray-800">{company.type === 'AGGREGATOR' ? 'Toplayıcı (Çoklu Firma)' : 'Doğrudan API'}</p>
                     </div>

                     {company.subCarriers && company.subCarriers.length > 0 && (
                        <div className="mb-4">
                           <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('shipping.sub_carriers')}</p>
                           <div className="flex flex-wrap gap-2">
                              {company.subCarriers.map(sc => (
                                 <span key={sc.code} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 font-medium">
                                    {sc.name}
                                 </span>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                     <button
                        onClick={() => setSelectedCompany(company)}
                        className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                     >
                        <Settings size={16} /> {t('shipping.edit_config')}
                     </button>
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{company.isActive ? 'Aktif' : 'Pasif'}</span>
                        <div className={`w-8 h-4 rounded-full relative cursor-pointer ${company.isActive ? 'bg-green-50' : 'bg-gray-300'}`}>
                           <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${company.isActive ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {selectedCompany && (
            <ShippingCompanyConfigModal
               isOpen={!!selectedCompany}
               company={selectedCompany}
               onClose={() => setSelectedCompany(null)}
               onSave={handleSaveConfig}
            />
         )}
      </div>
   );
};

export default ShippingCompanies;
