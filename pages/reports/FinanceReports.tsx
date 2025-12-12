
import React, { useState, useEffect } from 'react';
import ReportFilter from '../../components/ReportFilter';
import { ReportPeriod } from '../../types/reports';
import { getFinanceStats } from '../../lib/reports';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const FinanceReports: React.FC = () => {
   const { addNotification } = useNotification();
   const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.THIS_MONTH);
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         setLoading(true);
         const result = await getFinanceStats(period);
         setData(result);
         setLoading(false);
      };
      fetchData();
   }, [period]);

   if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;

   return (
      <div className="space-y-6 animate-fade-in">
         <ReportFilter
            title="Financial Overview"
            period={period}
            onPeriodChange={setPeriod}

            onExport={() => addNotification('info', 'Exporting...')}
         />

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg">
               <p className="text-indigo-200 text-sm font-medium mb-1">Total Revenue</p>
               <h3 className="text-3xl font-bold">${data.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-sm font-medium mb-1">Total Expenses</p>
               <h3 className="text-3xl font-bold text-red-600">-${data.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-sm font-medium mb-1">Net Profit</p>
               <h3 className="text-3xl font-bold text-green-600">${data.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-sm font-medium mb-1">Net Margin</p>
               <h3 className="text-3xl font-bold text-blue-600">{data.margin.toFixed(1)}%</h3>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-6">Income vs Expenses</h3>
               <SimpleBarChart data={data.chartData} height={300} color="#4F46E5" showValues />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-6">Breakdown</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded">
                           <DollarSign size={16} />
                        </div>
                        <span className="font-medium text-gray-700">Cost of Goods</span>
                     </div>
                     <span className="font-bold text-gray-900">30%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded">
                           <TrendingUp size={16} />
                        </div>
                        <span className="font-medium text-gray-700">Ad Spend</span>
                     </div>
                     <span className="font-bold text-gray-900">20%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded">
                           <CreditCard size={16} />
                        </div>
                        <span className="font-medium text-gray-700">Transaction Fees</span>
                     </div>
                     <span className="font-bold text-gray-900">3.5%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default FinanceReports;
