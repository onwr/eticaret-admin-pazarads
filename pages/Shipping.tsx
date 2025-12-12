
import React, { useState, useEffect, useMemo } from 'react';
import { getShipments } from '../lib/api';
import { Shipment, ShippingStatus } from '../types';
import ShippingTable from '../components/ShippingTable';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderDetailModal from '../components/modals/OrderDetailModal';
import { Order } from '../types';
import { Truck, RefreshCw, Download, Search, Filter, Package, CheckCircle, AlertTriangle, XCircle, Clock, BarChart2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { isProblematicFestStatus, isStuckShipment } from '../lib/fest_api';
import { useNotification } from '../contexts/NotificationContext';

interface ShippingProps {
   onNavigateToSettings: () => void;
}

const Shipping: React.FC<ShippingProps> = ({ onNavigateToSettings }) => {
   const { t } = useLanguage();
   const { addNotification } = useNotification();
   const [shipments, setShipments] = useState<Shipment[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   // Filters
   const [search, setSearch] = useState('');
   const [activeFilter, setActiveFilter] = useState<string>('ALL'); // ALL, STUCK, RETURN_RISK, DELAYED_BRANCH, NO_MOVEMENT
   const [subCarrierFilter, setSubCarrierFilter] = useState<string>('ALL');

   const fetchShipments = async () => {
      setLoading(true);
      try {
         const data = await getShipments();
         // Mocking some Fest data for demo purposes since backend isn't real
         const enhancedData = data.map(s => ({
            ...s,
            festStatusCode: s.status === ShippingStatus.DELIVERED ? '10' :
               s.status === ShippingStatus.RETURNED ? '20' :
                  Math.random() > 0.7 ? '42' : '40', // Random status
            subCarrier: Math.random() > 0.5 ? 'Aras Kargo' : 'PTT',
            lastMovementDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
         }));
         setShipments(enhancedData);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchShipments();
   }, []);

   const handleSync = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      fetchShipments();
      setLoading(false);
      addNotification('success', t('common.success'));
   };

   // Advanced Filtering Logic
   const filteredData = useMemo(() => {
      return shipments.filter(s => {
         // 1. Search
         const matchesSearch =
            s.trackingCode?.toLowerCase().includes(search.toLowerCase()) ||
            s.order?.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            s.order?.customer?.name.toLowerCase().includes(search.toLowerCase());

         if (!matchesSearch) return false;

         // 2. Sub Carrier
         if (subCarrierFilter !== 'ALL' && s.subCarrier !== subCarrierFilter) return false;

         // 3. Status / Risk Filters
         const daysSinceLastMove = s.lastMovementDate ?
            Math.ceil((Date.now() - new Date(s.lastMovementDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

         switch (activeFilter) {
            case 'ALL': return true;
            case 'PREPARING': return s.status === ShippingStatus.PREPARING;
            case 'SHIPPED': return s.status === ShippingStatus.SHIPPED;
            case 'DELIVERED': return s.status === ShippingStatus.DELIVERED;
            case 'PROBLEMATIC': return isProblematicFestStatus(s.festStatusCode || '');

            // Special Risk Filters
            case 'NO_MOVEMENT': return daysSinceLastMove > 3 && s.status !== ShippingStatus.DELIVERED;
            case 'STUCK_PACKAGING': return s.status === ShippingStatus.PREPARING && daysSinceLastMove > 2;
            case 'LONG_DISTRIBUTION': return s.status === ShippingStatus.SHIPPED && daysSinceLastMove > 7;
            case 'WAITING_BRANCH': return s.festStatusCode === '41' && daysSinceLastMove > 1; // 41 = At Delivery Branch

            default: return true;
         }
      });
   }, [shipments, search, activeFilter, subCarrierFilter]);

   // Stats Calculation
   const stats = {
      total: shipments.length,
      delivered: shipments.filter(s => s.status === ShippingStatus.DELIVERED).length,
      problematic: shipments.filter(s => isProblematicFestStatus(s.festStatusCode || '')).length,
      actionNeeded: shipments.filter(s => {
         const daysSinceLastMove = s.lastMovementDate ?
            Math.ceil((Date.now() - new Date(s.lastMovementDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
         return (daysSinceLastMove > 3 && s.status !== ShippingStatus.DELIVERED) ||
            (s.festStatusCode === '41' && daysSinceLastMove > 1);
      }).length
   };

   if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

   return (
      <div className="space-y-6 animate-fade-in pb-20">
         {/* Header */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Truck className="text-blue-600" />
                  {t('cargo.title')}
               </h2>
               <p className="text-sm text-gray-500 mt-1">{t('cargo.subtitle')}</p>
            </div>
            <div className="flex gap-2">
               <button
                  onClick={handleSync}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
               >
                  <RefreshCw size={18} /> {t('cargo.sync')}
               </button>
               <button
                  onClick={() => addNotification('info', t('cargo.downloading'))}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
               >
                  <Download size={18} /> {t('cargo.analysis_report')}
               </button>
            </div>
         </div>

         {/* KPI Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('cargo.total_shipments')}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <Package size={20} />
               </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('cargo.delivered')}</p>
                  <h3 className="text-2xl font-bold text-green-600">{stats.delivered}</h3>
                  <span className="text-xs text-green-500 font-medium">{t('cargo.success_rate').replace('{rate}', ((stats.delivered / stats.total) * 100).toFixed(1))}</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle size={20} />
               </div>
            </div>

            <div
               onClick={() => setActiveFilter('PROBLEMATIC')}
               className={`cursor-pointer bg-white p-5 rounded-xl border shadow-sm transition-all hover:shadow-md flex items-center justify-between ${activeFilter === 'PROBLEMATIC' ? 'ring-2 ring-red-500 border-red-500' : 'border-gray-200'}`}
            >
               <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('cargo.problematic')}</p>
                  <h3 className="text-2xl font-bold text-red-600">{stats.problematic}</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <AlertTriangle size={20} />
               </div>
            </div>

            <div
               onClick={() => setActiveFilter('NO_MOVEMENT')} // Default to one of the action filters
               className="cursor-pointer bg-gradient-to-br from-orange-500 to-red-600 text-white p-5 rounded-xl shadow-lg transform transition-transform hover:scale-[1.02] flex items-center justify-between"
            >
               <div>
                  <p className="text-xs font-bold text-white/80 uppercase mb-1">{t('cargo.action_needed')}</p>
                  <h3 className="text-2xl font-bold text-white">{stats.actionNeeded}</h3>
                  <p className="text-[10px] text-white/90 mt-1">{t('cargo.action_needed_desc')}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white animate-pulse">
                  <AlertCircle size={20} />
               </div>
            </div>
         </div>

         {/* Quick Action Filters (The "User Friendly" Request) */}
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
               <Filter size={16} className="text-blue-600" /> {t('cargo.quick_filters')}
            </h3>
            <div className="flex flex-wrap gap-2">
               {[
                  { id: 'ALL', label: t('cargo.filter_all') },
                  { id: 'NO_MOVEMENT', label: t('cargo.filter_no_movement'), color: 'red' },
                  { id: 'STUCK_PACKAGING', label: t('cargo.filter_stuck_packaging'), color: 'orange' },
                  { id: 'LONG_DISTRIBUTION', label: t('cargo.filter_long_distribution'), color: 'yellow' },
                  { id: 'WAITING_BRANCH', label: t('cargo.filter_waiting_branch'), color: 'purple' },
               ].map(filter => (
                  <button
                     key={filter.id}
                     onClick={() => setActiveFilter(filter.id)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                        ${activeFilter === filter.id
                           ? 'bg-gray-800 text-white border-gray-800'
                           : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                    `}
                  >
                     {filter.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Main Filter Bar */}
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input
                  type="text"
                  placeholder={t('cargo.search_placeholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
               />
            </div>
            <div className="w-full md:w-auto">
               <select
                  value={subCarrierFilter}
                  onChange={(e) => setSubCarrierFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
               >
                  <option value="ALL">{t('cargo.all_carriers')}</option>
                  <option value="Aras Kargo">{t('cargo.aras')}</option>
                  <option value="PTT">{t('cargo.ptt')}</option>
                  <option value="MNG Kargo">{t('cargo.mng')}</option>
                  <option value="Sürat Kargo">{t('cargo.surat')}</option>
               </select>
            </div>
         </div>

         {/* Table */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ShippingTable
               shipments={filteredData}
               onViewDetails={(shipment) => {
                  if (shipment.order) {
                     setSelectedOrder(shipment.order);
                     setIsModalOpen(true);
                  }
               }}
            />
         </div>

         {/* Order Detail Modal */}
         {selectedOrder && (
            <OrderDetailModal
               isOpen={isModalOpen}
               onClose={() => {
                  setIsModalOpen(false);
                  setSelectedOrder(null);
               }}
               order={selectedOrder}
               onUpdateOrder={() => {
                  fetchShipments(); // Refresh data if order changes
               }}
            />
         )}
      </div>
   );
};

export default Shipping;
