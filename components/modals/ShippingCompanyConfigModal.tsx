
import React, { useState, useEffect } from 'react';
import { ShippingCompany, ShippingSubCarrier, ShippingProviderType, ShippingDesiRange, ShippingPriceRange } from '../../types';
import { X, Save, Loader2, Plus, Trash2, AlertCircle, ChevronDown, ChevronUp, CreditCard, Banknote, Scale, Calculator, ArrowRight } from 'lucide-react';

interface ShippingCompanyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: ShippingCompany;
  onSave: (id: string, data: Partial<ShippingCompany>) => Promise<void>;
}

const ShippingCompanyConfigModal: React.FC<ShippingCompanyConfigModalProps> = ({
  isOpen,
  onClose,
  company,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'API' | 'SUB_CARRIERS'>('API');
  const [isSaving, setIsSaving] = useState(false);
  const [subCarriers, setSubCarriers] = useState<ShippingSubCarrier[]>([]);
  const [expandedCarrier, setExpandedCarrier] = useState<string | null>(null);

  // Simulation State
  const [simDesi, setSimDesi] = useState<number>(1);
  const [simAmount, setSimAmount] = useState<number>(500);
  const [simResult, setSimResult] = useState<string>('---');

  // New sub-carrier form
  const [newSubCarrier, setNewSubCarrier] = useState({ code: '', name: '' });

  useEffect(() => {
    if (company) {
      setSubCarriers(company.subCarriers || []);
    }
  }, [company, isOpen]);

  const handleAddSubCarrier = () => {
    if (!newSubCarrier.code || !newSubCarrier.name) return;
    const newSc: ShippingSubCarrier = {
        code: newSubCarrier.code.toUpperCase(),
        name: newSubCarrier.name,
        branchCode: '',
        isActive: true,
        isCashOnDoorAvailable: true,
        isCardOnDoorAvailable: true,
        fixedPrice: 0,
        returnPrice: 0,
        cardCommission: 0,
        codRanges: [],
        desiRanges: []
    };
    setSubCarriers([...subCarriers, newSc]);
    setNewSubCarrier({ code: '', name: '' });
    setExpandedCarrier(newSc.code);
  };

  const updateSubCarrier = (code: string, field: keyof ShippingSubCarrier, value: any) => {
      setSubCarriers(prev => prev.map(sc => sc.code === code ? { ...sc, [field]: value } : sc));
  };

  const removeSubCarrier = (code: string) => {
      setSubCarriers(prev => prev.filter(sc => sc.code !== code));
  };

  // --- Desi Range Logic ---
  const addDesiRange = (carrierCode: string) => {
      const carrier = subCarriers.find(sc => sc.code === carrierCode);
      if(!carrier) return;
      const newRanges = [...(carrier.desiRanges || []), { maxDesi: 0, price: 0 }];
      updateSubCarrier(carrierCode, 'desiRanges', newRanges);
  };

  const updateDesiRange = (carrierCode: string, index: number, field: keyof ShippingDesiRange, value: number) => {
      const carrier = subCarriers.find(sc => sc.code === carrierCode);
      if(!carrier) return;
      const newRanges = [...(carrier.desiRanges || [])];
      newRanges[index] = { ...newRanges[index], [field]: value };
      updateSubCarrier(carrierCode, 'desiRanges', newRanges);
  };

  const removeDesiRange = (carrierCode: string, index: number) => {
      const carrier = subCarriers.find(sc => sc.code === carrierCode);
      if(!carrier) return;
      const newRanges = (carrier.desiRanges || []).filter((_, i) => i !== index);
      updateSubCarrier(carrierCode, 'desiRanges', newRanges);
  };

  // --- COD Range Logic ---
  const addCodRange = (carrierCode: string) => {
      const carrier = subCarriers.find(sc => sc.code === carrierCode);
      if(!carrier) return;
      const newRanges = [...(carrier.codRanges || []), { min: 0, max: 0, price: 0 }];
      updateSubCarrier(carrierCode, 'codRanges', newRanges);
  };

  const updateCodRange = (carrierCode: string, index: number, field: keyof ShippingPriceRange, value: number) => {
      const carrier = subCarriers.find(sc => sc.code === carrierCode);
      if(!carrier) return;
      const newRanges = [...(carrier.codRanges || [])];
      newRanges[index] = { ...newRanges[index], [field]: value };
      updateSubCarrier(carrierCode, 'codRanges', newRanges);
  };

  const removeCodRange = (carrierCode: string, index: number) => {
      const carrier = subCarriers.find(sc => sc.code === carrierCode);
      if(!carrier) return;
      const newRanges = (carrier.codRanges || []).filter((_, i) => i !== index);
      updateSubCarrier(carrierCode, 'codRanges', newRanges);
  };

  // --- Calculator ---
  const calculateSim = (carrierCode: string) => {
      const carrier = subCarriers.find(sc => sc.code === carrierCode);
      if(!carrier) return;

      let total = 0;
      let log = [];

      // 1. Desi
      const desiRule = carrier.desiRanges?.find(r => simDesi <= r.maxDesi);
      if (desiRule) {
          total += desiRule.price;
          log.push(`Taşıma: ${desiRule.price} TL`);
      } else {
          log.push(`Taşıma: Tanımsız (Desi > Max)`);
      }

      // 2. COD
      const codRule = carrier.codRanges?.find(r => simAmount >= r.min && simAmount <= r.max);
      if (codRule) {
          total += codRule.price;
          log.push(`Tahsilat: ${codRule.price} TL`);
      } else {
          log.push(`Tahsilat: Aralık Dışı`);
      }

      setSimResult(`${total.toFixed(2)} TL (${log.join(' + ')})`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(company.id, { subCarriers });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{company.name} Yapılandırma</h2>
            <p className="text-xs text-gray-500">{company.type === ShippingProviderType.AGGREGATOR ? 'Toplayıcı (Aggregator) Entegrasyonu' : 'Doğrudan Entegrasyon'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 bg-white overflow-x-auto">
           <button 
             onClick={() => setActiveTab('API')}
             className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'API' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
             API Bağlantısı
           </button>
           {company.type === ShippingProviderType.AGGREGATOR && (
             <button 
               onClick={() => setActiveTab('SUB_CARRIERS')}
               className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'SUB_CARRIERS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
               Alt Firmalar ve Fiyatlandırma
             </button>
           )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
           
           {/* API TAB */}
           {activeTab === 'API' && (
              <div className="max-w-2xl mx-auto space-y-6">
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">API Entegrasyon Bilgileri</h4>
                        <p className="text-xs text-blue-700 mt-1">Bu bilgiler kargo firması tarafından sağlanır. Doğru girilmezse barkod oluşturulamaz.</p>
                    </div>
                 </div>

                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">API Kullanıcı Adı / Key</label>
                       <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={company.code === 'FEST' ? 'CRW5vY0OQjchsmwXEzg4PkMbGFpDt98rxAKaHLIB' : ''} />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">API Şifre / Secret</label>
                       <input type="password" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
                    </div>
                    {company.code === 'FEST' && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">From Email (Header)</label>
                           <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue="trendyollasana@festcargo.com" />
                        </div>
                    )}
                 </div>
              </div>
           )}

           {/* SUB CARRIERS TAB */}
           {activeTab === 'SUB_CARRIERS' && (
              <div className="space-y-6">
                 {/* Add New Carrier */}
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Kod (örn: ARS)" 
                      className="w-24 border border-gray-200 rounded-lg p-2 text-sm uppercase"
                      value={newSubCarrier.code}
                      onChange={e => setNewSubCarrier({...newSubCarrier, code: e.target.value.toUpperCase()})}
                    />
                    <input 
                      type="text" 
                      placeholder="Firma Adı (örn: Aras Kargo)" 
                      className="flex-1 border border-gray-200 rounded-lg p-2 text-sm"
                      value={newSubCarrier.name}
                      onChange={e => setNewSubCarrier({...newSubCarrier, name: e.target.value})}
                    />
                    <button onClick={handleAddSubCarrier} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700">
                       Ekle
                    </button>
                 </div>

                 {/* Carrier List */}
                 <div className="space-y-4">
                    {subCarriers.map((sc) => {
                       const isExpanded = expandedCarrier === sc.code;
                       return (
                          <div key={sc.code} className={`bg-white border rounded-xl shadow-sm transition-all overflow-hidden ${isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}>
                             {/* Card Header */}
                             <div 
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => setExpandedCarrier(isExpanded ? null : sc.code)}
                             >
                                <div className="flex items-center gap-3">
                                   <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold font-mono w-12 text-center">{sc.code}</span>
                                   <h4 className="font-bold text-gray-900">{sc.name}</h4>
                                   <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${sc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                       {sc.isActive ? 'Aktif' : 'Pasif'}
                                   </span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); removeSubCarrier(sc.code); }}
                                     className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                   {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </div>
                             </div>

                             {/* Expanded Config */}
                             {isExpanded && (
                                <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-6">
                                   
                                   {/* 1. General Status & Payment Methods */}
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div className="space-y-3">
                                           <h5 className="text-xs font-bold text-gray-500 uppercase">Ödeme Yöntemleri</h5>
                                           <div className="flex gap-6">
                                               <label className="flex items-center gap-2 cursor-pointer">
                                                   <input 
                                                     type="checkbox" 
                                                     className="w-4 h-4 text-green-600 rounded"
                                                     checked={sc.isCashOnDoorAvailable}
                                                     onChange={e => updateSubCarrier(sc.code, 'isCashOnDoorAvailable', e.target.checked)}
                                                   />
                                                   <span className="text-sm font-medium flex items-center gap-1"><Banknote size={14}/> Kapıda Nakit</span>
                                               </label>
                                               <label className="flex items-center gap-2 cursor-pointer">
                                                   <input 
                                                     type="checkbox" 
                                                     className="w-4 h-4 text-blue-600 rounded"
                                                     checked={sc.isCardOnDoorAvailable}
                                                     onChange={e => updateSubCarrier(sc.code, 'isCardOnDoorAvailable', e.target.checked)}
                                                   />
                                                   <span className="text-sm font-medium flex items-center gap-1"><CreditCard size={14}/> Kapıda K. Kartı</span>
                                               </label>
                                           </div>
                                       </div>
                                       <div className="flex items-end justify-end">
                                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 w-full">
                                                <h5 className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-2"><Calculator size={14}/> Hesaplama Testi</h5>
                                                <div className="flex gap-2 items-center">
                                                    <input type="number" value={simDesi} onChange={e => setSimDesi(parseFloat(e.target.value))} className="w-16 p-1 text-xs border rounded" placeholder="Desi" />
                                                    <span className="text-xs text-gray-500">Desi</span>
                                                    <span className="text-gray-300">|</span>
                                                    <input type="number" value={simAmount} onChange={e => setSimAmount(parseFloat(e.target.value))} className="w-20 p-1 text-xs border rounded" placeholder="Tutar" />
                                                    <span className="text-xs text-gray-500">TL</span>
                                                    <button onClick={() => calculateSim(sc.code)} className="bg-purple-600 text-white p-1 rounded"><ArrowRight size={14}/></button>
                                                </div>
                                                <p className="text-xs font-bold text-purple-700 mt-2">{simResult}</p>
                                            </div>
                                       </div>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       
                                       {/* 2. Transport Costs (Desi) */}
                                       <div className="space-y-3">
                                           <div className="flex justify-between items-center">
                                               <h5 className="text-sm font-bold text-blue-800 flex items-center gap-2"><Scale size={16}/> Taşıma Fiyatları (Desi)</h5>
                                               <button onClick={() => addDesiRange(sc.code)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200">+ Aralık Ekle</button>
                                           </div>
                                           <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                               <table className="w-full text-left text-xs">
                                                   <thead className="bg-gray-50 font-bold text-gray-600">
                                                       <tr>
                                                           <th className="p-2">Maks. Desi</th>
                                                           <th className="p-2">Fiyat (TL)</th>
                                                           <th className="p-2 w-8"></th>
                                                       </tr>
                                                   </thead>
                                                   <tbody>
                                                       {sc.desiRanges?.map((range, idx) => (
                                                           <tr key={idx} className="border-t border-gray-100">
                                                               <td className="p-2"><input type="number" className="w-full border rounded p-1" value={range.maxDesi} onChange={e => updateDesiRange(sc.code, idx, 'maxDesi', parseFloat(e.target.value))} /></td>
                                                               <td className="p-2"><input type="number" className="w-full border rounded p-1 font-bold" value={range.price} onChange={e => updateDesiRange(sc.code, idx, 'price', parseFloat(e.target.value))} /></td>
                                                               <td className="p-2"><button onClick={() => removeDesiRange(sc.code, idx)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button></td>
                                                           </tr>
                                                       ))}
                                                   </tbody>
                                               </table>
                                               {(!sc.desiRanges || sc.desiRanges.length === 0) && <div className="p-2 text-center text-gray-400 text-xs">Aralık ekleyin.</div>}
                                           </div>
                                       </div>

                                       {/* 3. Service Costs (COD) */}
                                       <div className="space-y-3">
                                           <div className="flex justify-between items-center">
                                               <h5 className="text-sm font-bold text-green-800 flex items-center gap-2"><Banknote size={16}/> Tahsilat Komisyonları</h5>
                                               <button onClick={() => addCodRange(sc.code)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200">+ Aralık Ekle</button>
                                           </div>
                                           <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                               <table className="w-full text-left text-xs">
                                                   <thead className="bg-gray-50 font-bold text-gray-600">
                                                       <tr>
                                                           <th className="p-2">Min TL</th>
                                                           <th className="p-2">Max TL</th>
                                                           <th className="p-2">Ücret</th>
                                                           <th className="p-2 w-8"></th>
                                                       </tr>
                                                   </thead>
                                                   <tbody>
                                                       {sc.codRanges?.map((range, idx) => (
                                                           <tr key={idx} className="border-t border-gray-100">
                                                               <td className="p-2"><input type="number" className="w-full border rounded p-1" value={range.min} onChange={e => updateCodRange(sc.code, idx, 'min', parseFloat(e.target.value))} /></td>
                                                               <td className="p-2"><input type="number" className="w-full border rounded p-1" value={range.max} onChange={e => updateCodRange(sc.code, idx, 'max', parseFloat(e.target.value))} /></td>
                                                               <td className="p-2"><input type="number" className="w-full border rounded p-1 font-bold" value={range.price} onChange={e => updateCodRange(sc.code, idx, 'price', parseFloat(e.target.value))} /></td>
                                                               <td className="p-2"><button onClick={() => removeCodRange(sc.code, idx)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button></td>
                                                           </tr>
                                                       ))}
                                                   </tbody>
                                               </table>
                                               {(!sc.codRanges || sc.codRanges.length === 0) && <div className="p-2 text-center text-gray-400 text-xs">Aralık ekleyin.</div>}
                                           </div>
                                       </div>

                                   </div>

                                   {/* 4. Fixed Costs */}
                                   <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                                       <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Sabit Ücretler</h5>
                                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                           <div>
                                               <label className="block text-xs text-gray-500 mb-1">İade Tutarı (Sabit)</label>
                                               <input 
                                                 type="number" 
                                                 className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                                 value={sc.returnPrice}
                                                 onChange={e => updateSubCarrier(sc.code, 'returnPrice', parseFloat(e.target.value))}
                                               />
                                           </div>
                                           <div>
                                               <label className="block text-xs text-gray-500 mb-1">Kart Komisyonu (%)</label>
                                               <input 
                                                 type="number" 
                                                 className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                                 value={sc.cardCommission}
                                                 onChange={e => updateSubCarrier(sc.code, 'cardCommission', parseFloat(e.target.value))}
                                                 placeholder="Örn: 5"
                                               />
                                           </div>
                                       </div>
                                   </div>

                                </div>
                             )}
                          </div>
                       );
                    })}
                 </div>
              </div>
           )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0f172a] border-t border-gray-800 flex justify-end gap-3 text-white">
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 font-bold flex items-center gap-2 disabled:opacity-70 text-sm transition-colors"
           >
             {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
             Kaydet
           </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingCompanyConfigModal;
