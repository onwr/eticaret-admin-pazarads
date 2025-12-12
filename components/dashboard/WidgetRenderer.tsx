import React from 'react';
import { useLanguage } from '../../lib/i18n';
import { DashboardAnalytics } from '../../lib/api';
import {
    TrendingUp, ShoppingCart, DollarSign, Clock,
    CheckCircle2, XCircle, AlertCircle, Phone,
    ArrowUpRight, ArrowDownRight, Activity, Calendar,
    Package, Users, Globe, ChevronRight, Truck
} from 'lucide-react';
import AgentPerformanceWidget from '../widgets/AgentPerformanceWidget';
import CallCenterPerformanceWidget from '../widgets/CallCenterPerformanceWidget';

// Re-using parts from original Dashboard.tsx for specific widgets
// In a real refactor, these would be separate files.

interface WidgetProps {
    id: string;
    data: DashboardAnalytics | null;
    loading: boolean;
    onNavigate: (path: string) => void;
}

const WidgetRenderer: React.FC<WidgetProps> = ({ id, data, loading, onNavigate }) => {
    const { t } = useLanguage();

    if (loading && !data) return <div className="animate-pulse bg-gray-100 rounded-2xl h-full min-h-[150px]"></div>;
    if (!data) return null;

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueTrend = calculateTrend(data.today.revenue, data.yesterday.revenue);
    const ordersTrend = calculateTrend(data.today.orders, data.yesterday.orders);
    const maxHourlyOrder = Math.max(...data.hourlyStats.map(s => s.count), 1);

    switch (id) {
        case 'stats_orders':
            return (
                <div className="bg-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all duration-300 h-full group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Package size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 text-white rounded-xl backdrop-blur-sm">
                                <Package size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                {ordersTrend >= 0 ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                                {Math.abs(ordersTrend).toFixed(1)}%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-white">{data.today.orders}</h3>
                        <p className="text-sm text-blue-100 mt-1">{t('dash.total_orders')}</p>
                        <p className="text-xs text-blue-200 mt-4">Tüm zamanlar</p>
                    </div>
                </div>
            );
        case 'stats_revenue':
            return (
                <div className="bg-orange-500 rounded-2xl p-6 shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all duration-300 h-full group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSign size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 text-white rounded-xl backdrop-blur-sm">
                                <DollarSign size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                {revenueTrend >= 0 ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                                {Math.abs(revenueTrend).toFixed(1)}%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-white">
                            {data.today.revenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}
                        </h3>
                        <p className="text-sm text-orange-100 mt-1">{t('dash.revenue')}</p>
                        <p className="text-xs text-orange-200 mt-4">Tüm zamanlar</p>
                    </div>
                </div>
            );
        case 'stats_pending':
            return (
                <div className="bg-green-500 rounded-2xl p-6 shadow-lg shadow-green-500/20 hover:shadow-xl transition-all duration-300 h-full group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 text-white rounded-xl backdrop-blur-sm">
                                <Clock size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                <Activity size={12} className="mr-1" />
                                Aktif
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-white">{data.today.pending}</h3>
                        <p className="text-sm text-green-100 mt-1">{t('dash.pending_orders')}</p>
                        <p className="text-xs text-green-200 mt-4">Bekleyen işlemler</p>
                    </div>
                </div>
            );
        case 'stats_delivery':
            return (
                <div className="bg-purple-600 rounded-2xl p-6 shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all duration-300 h-full group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Truck size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 text-white rounded-xl backdrop-blur-sm">
                                <Truck size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                <ArrowUpRight size={12} className="mr-1" />
                                +1.5%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-white">%{Math.round(data.performance.successRate)}</h3>
                        <p className="text-sm text-purple-100 mt-1">{t('dash.delivery_rate')}</p>
                        <p className="text-xs text-purple-200 mt-4">Başarıyla tamamlandı</p>
                    </div>
                </div>
            );
        case 'chart_hourly':
            return (
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
                    <div className="flex items-center gap-2 mb-6">
                        <Clock size={20} className="text-blue-600" />
                        <h3 className="font-bold text-gray-800">{t('dash.hourly_chart_title')}</h3>
                    </div>
                    <div className="h-[200px] w-full flex items-end justify-between gap-2 px-4">
                        {data.hourlyStats.map((stat, i) => {
                            const height = (stat.count / (maxHourlyOrder || 1)) * 100;
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                    <div
                                        className="w-full bg-blue-100 rounded-t-md relative group-hover:bg-blue-200 transition-all"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            {stat.count}
                                        </div>
                                    </div>
                                    {i % 3 === 0 && <span className="text-[10px] text-gray-400">{stat.hour}</span>}
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
        case 'chart_weekly':
            return (
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-600" />
                            <h3 className="font-bold text-gray-800">{t('reports.last_7')}</h3>
                        </div>
                    </div>
                    <div className="h-[200px] flex items-center justify-center">
                        <div className="w-full h-full relative">
                            <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
                                <path
                                    d="M0,120 C50,120 50,100 100,80 C150,60 150,90 200,50 C250,10 250,40 300,20"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                                <circle cx="0" cy="120" r="4" fill="#10b981" />
                                <circle cx="100" cy="80" r="4" fill="#10b981" />
                                <circle cx="200" cy="50" r="4" fill="#10b981" />
                                <circle cx="300" cy="20" r="4" fill="#10b981" />
                            </svg>
                            <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-400 mt-4">
                                <span>Pzt</span>
                                <span>Çar</span>
                                <span>Cum</span>
                                <span>Paz</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'chart_status':
            return (
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">{t('dash.order_statuses_title')}</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {data.orderStatusBreakdown.slice(0, 5).map((status, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">{t(`status.${status.status}`)}</span>
                                    <span className="text-gray-900 font-bold">{status.count}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${status.status === 'TESLIM_EDILDI' ? 'bg-green-500' :
                                            status.status === 'IPTAL' ? 'bg-red-500' :
                                                status.status === 'KARGODA' ? 'bg-blue-500' :
                                                    status.status === 'NEW' ? 'bg-orange-500' : 'bg-gray-500'
                                            }`}
                                        style={{ width: `${status.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => onNavigate('reports')} className="w-full mt-6 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                        {t('dash.view_detailed_report')}
                    </button>
                </div>
            );
        case 'performance_indicators':
            return (
                <div className="h-full">
                    <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">{t('dash.performance_indicators')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">{t('dash.success_rate')}</p>
                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
                                    %{data.performance.successRate.toFixed(1)}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">{t('dash.cancel_rate')}</p>
                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <XCircle size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                                    %{data.performance.cancelRate.toFixed(1)}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">{t('dash.upsell_rate')}</p>
                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                    %{data.performance.upsellRate.toFixed(1)}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">{t('dash.other_rate')}</p>
                                <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-gray-400 group-hover:scale-110 transition-transform" />
                                    %{data.performance.otherRate.toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'last_orders':
            return (
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-6 h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">{t('dash.last_10_orders')}</h3>
                        <button onClick={() => onNavigate('orders')} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            {t('common.all')} <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-4 overflow-y-auto max-h-[340px] pr-2 custom-scrollbar">
                        {data.lastOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{order.customer}</p>
                                    <p className="text-xs text-gray-500">{order.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 text-sm">
                                        {order.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </p>
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium inline-block mt-1">
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'agent_performance':
            return <AgentPerformanceWidget />;
        case 'call_center_stats':
            return <CallCenterPerformanceWidget />;
        default:
            return null;
    }
};

export default WidgetRenderer;
