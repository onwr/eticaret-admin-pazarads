
import React, { useState, useEffect } from 'react';
import ReportFilter from '../../components/ReportFilter';
import { ReportPeriod } from '../../types/reports';
import { getAgentPerformanceReport } from '../../lib/reports';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';

const AgentReports: React.FC = () => {
  const { addNotification } = useNotification();
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.LAST_7_DAYS);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getAgentPerformanceReport(period);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [period]);

  const chartData = data.map(d => ({
    label: d.name,
    value: d.revenue
  }));

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <ReportFilter
        title="Call Center Performance"
        period={period}
        onPeriodChange={setPeriod}

        onExport={() => addNotification('info', 'Exporting...')}
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="font-bold text-gray-800 mb-6">Revenue by Agent</h3>
        <SimpleBarChart data={chartData} height={300} color="#10B981" showValues />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Agent Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Total Calls</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Confirmed Orders</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Revenue Generated</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Approval Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((agent, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{agent.name}</td>
                <td className="px-6 py-4 text-right text-gray-600">{agent.calls}</td>
                <td className="px-6 py-4 text-right text-gray-600">{agent.orders}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">${agent.revenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${agent.conversion > 40 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${agent.conversion}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{agent.conversion}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentReports;
