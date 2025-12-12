
import React, { useEffect, useState } from 'react';
import { AgentStats } from '../types';
import { getAgentStats } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart2, PhoneCall, CheckCircle, XCircle, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';

const AgentStatsPage: React.FC = () => {
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAgentStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
       <div>
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
           <BarChart2 className="text-indigo-600" />
           Agent Performance
         </h2>
         <p className="text-sm text-gray-500 mt-1">Real-time metrics for call center agents.</p>
       </div>

       <div className="grid grid-cols-1 gap-6">
          {stats.map(agent => (
            <div key={agent.agentId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4">{agent.agentName}</h3>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <div className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                        <PhoneCall size={12} /> Total Calls
                     </div>
                     <div className="text-2xl font-bold text-gray-900">{agent.totalCalls}</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                     <div className="text-green-600 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                        <CheckCircle size={12} /> Approval Rate
                     </div>
                     <div className="text-2xl font-bold text-green-700">{agent.approvalRate}%</div>
                     <div className="text-xs text-green-600 mt-1">{agent.confirmedOrders} orders</div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                     <div className="text-red-600 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                        <XCircle size={12} /> Cancelled
                     </div>
                     <div className="text-2xl font-bold text-red-700">{agent.cancelledOrders}</div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                     <div className="text-blue-600 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                        <Clock size={12} /> Avg Duration
                     </div>
                     <div className="text-2xl font-bold text-blue-700">{agent.avgDurationSeconds}s</div>
                  </div>
               </div>
            </div>
          ))}

          {stats.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
               No call data available yet.
            </div>
          )}
       </div>
    </div>
  );
};

export default AgentStatsPage;
