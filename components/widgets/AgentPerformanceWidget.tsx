import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Phone, ShoppingCart } from 'lucide-react';
import { getAgentStats } from '../../lib/api';
import { AgentStats } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { useLanguage } from '../../lib/i18n';

const AgentPerformanceWidget: React.FC = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState<AgentStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAgentStats();
                // Sort by sales (descending) and take top 5
                setStats(data.sort((a, b) => b.confirmedOrders - a.confirmedOrders).slice(0, 5));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="h-48 flex items-center justify-center"><LoadingSpinner size={24} /></div>;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users size={20} className="text-blue-600" />
                    <h3 className="font-bold text-gray-800">{t('dash.agent_performance')}</h3>
                </div>
            </div>

            <div className="space-y-4">
                {stats.map((agent, index) => (
                    <div key={agent.agentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    index === 1 ? 'bg-gray-200 text-gray-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-600'
                                }`}>
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{agent.agentName}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Phone size={10} /> {agent.totalCalls}</span>
                                    <span className="flex items-center gap-1"><ShoppingCart size={10} /> {agent.confirmedOrders}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900 text-sm">%{agent.approvalRate}</p>
                            <p className="text-xs text-green-600 font-medium">{t('common.conversion')}</p>
                        </div>
                    </div>
                ))}

                {stats.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        {t('common.no_data')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentPerformanceWidget;
