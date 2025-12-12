
import React, { useState, useEffect } from 'react';
import ReportFilter from '../../components/ReportFilter';
import { ReportPeriod } from '../../types/reports';
import { getOrderTrends } from '../../lib/reports';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';

const OrderReports: React.FC = () => {
   const { addNotification } = useNotification();
   const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.LAST_7_DAYS);
   const [data, setData] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         setLoading(true);
         const result = await getOrderTrends(period);
         setData(result);
         setLoading(false);
      };
      fetchData();
   }, [period]);

   if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;

   return (
      <div className="space-y-6 animate-fade-in">
         <ReportFilter
            title="Order Analytics"
            period={period}
            onPeriodChange={setPeriod}
            onExport={() => addNotification('info', 'Exporting...')}
         />

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-gray-800 mb-6">Order Volume Trend</h3>
            <SimpleLineChart data={data} height={350} color="#3B82F6" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4">Orders by Status</h3>
               {/* Mock pie data visualization using bars for simplicity */}
               <div className="space-y-4">
                  {[
                     { label: 'Delivered', value: 65, color: 'bg-green-500' },
                     { label: 'Shipped', value: 15, color: 'bg-blue-500' },
                     { label: 'Pending', value: 10, color: 'bg-yellow-500' },
                     { label: 'Returned', value: 5, color: 'bg-red-500' },
                     { label: 'Cancelled', value: 5, color: 'bg-gray-500' },
                  ].map((item, i) => (
                     <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                           <span className="text-gray-600">{item.label}</span>
                           <span className="font-bold">{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                           <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-4">Key Metrics</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                     <div>
                        <p className="text-sm text-gray-500">Average Order Value</p>
                        <p className="text-xl font-bold text-gray-900">$42.50</p>
                     </div>
                     <span className="text-green-600 text-sm font-bold">+5.2%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                     <div>
                        <p className="text-sm text-gray-500">Repeat Customer Rate</p>
                        <p className="text-xl font-bold text-gray-900">18.4%</p>
                     </div>
                     <span className="text-green-600 text-sm font-bold">+1.1%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                     <div>
                        <p className="text-sm text-gray-500">Cart Abandonment</p>
                        <p className="text-xl font-bold text-gray-900">65%</p>
                     </div>
                     <span className="text-red-600 text-sm font-bold">+2.3%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default OrderReports;
