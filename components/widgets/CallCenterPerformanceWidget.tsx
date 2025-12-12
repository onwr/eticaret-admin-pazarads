import React, { useEffect, useState } from 'react';
import { Headphones, PhoneIncoming, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getAgentPerformance } from '../../lib/call_center_api';
import LoadingSpinner from '../LoadingSpinner';
import { useLanguage } from '../../lib/i18n';

const CallCenterPerformanceWidget: React.FC = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAgentPerformance();
                setStats(data);
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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Headphones size={20} className="text-purple-600" />
                    <h3 className="font-bold text-gray-800">{t('call.title')}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-green-600 font-medium">{t('call.online')}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <PhoneIncoming size={16} />
                        <span className="text-xs font-bold uppercase">{t('call.total_calls')}</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{stats?.totalCalls || 0}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase">{t('call.avg_duration')}</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{stats?.avgDuration || '0:00'}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle size={16} />
                        <span className="text-xs font-bold uppercase">{t('call.success_rate')}</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">%{stats?.successRate || 0}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <XCircle size={16} />
                        <span className="text-xs font-bold uppercase">{t('status.IPTAL')}</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{stats?.ordersApproved || 0}</p> {/* Using ordersApproved as placeholder for now, logic might need adjustment based on real API */}
                </div>
            </div>
        </div>
    );
};

export default CallCenterPerformanceWidget;
