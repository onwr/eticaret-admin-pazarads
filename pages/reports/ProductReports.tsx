
import React, { useState, useEffect } from 'react';
import ReportFilter from '../../components/ReportFilter';
import { ReportPeriod } from '../../types/reports';
import { getProductPerformance } from '../../lib/reports';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';

const ProductReports: React.FC = () => {
  const { addNotification } = useNotification();
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.LAST_7_DAYS);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getProductPerformance(period);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [period]);

  const topProducts = data.slice(0, 5).map(p => ({
    label: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    value: p.revenue
  }));

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <ReportFilter
        title="Product Performance"
        period={period}
        onPeriodChange={setPeriod}
        onExport={() => addNotification('info', 'Exporting...')}
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="font-bold text-gray-800 mb-6">Top 5 Products by Revenue</h3>
        <SimpleBarChart data={topProducts} height={300} color="#F59E0B" showValues />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Sales</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Revenue</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Conv. Rate</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Cancel Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 text-right text-gray-600">{p.sales}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">${p.revenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.conversionRate > 2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.conversionRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-xs ${p.cancelRate > 10 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    {p.cancelRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductReports;
