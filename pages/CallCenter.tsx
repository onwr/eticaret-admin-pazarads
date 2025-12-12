import React, { useState, useEffect, useRef } from 'react';
import { CallPoolItem, CallPoolStatus, CallOutcome, OrderStatus, ShippingStatus, CallCenterStats } from '../types';
import { getCallPool, startAutoDialer, simulateConnection, completeCall, getAgentPerformance, getPoolCounts, populatePool } from '../lib/call_center_api';
import OrderDetailModal from '../components/modals/OrderDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Headphones, Play, Phone, PhoneOff, User, Clock, CheckCircle, XCircle, BarChart2, Mic, Pause, Maximize2, Minimize2, RefreshCw, Plus, AlertTriangle, MessageSquare, Zap, Trophy, Target, TrendingUp } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

import { useNotification } from '../contexts/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';

const CallCenter: React.FC = () => {
  const { t } = useLanguage();
  const [pool, setPool] = useState<CallPoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<CallPoolItem | null>(null);
  const [callStatus, setCallStatus] = useState<'IDLE' | 'DIALING' | 'RINGING' | 'CONNECTED' | 'WRAPUP'>('IDLE');
  const [callDuration, setCallDuration] = useState(0);
  const [stats, setStats] = useState<CallCenterStats | null>(null);
  const [counts, setCounts] = useState<{ orderCounts: Record<string, number>, cargoCounts: Record<string, number> } | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activePoolType, setActivePoolType] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    return () => stopTimer();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [poolData, statsData, countsData] = await Promise.all([
      getCallPool(),
      getAgentPerformance(),
      getPoolCounts()
    ]);
    // Sort pool by priority (Retries first, then priority, then date)
    const sortedPool = poolData.sort((a, b) => {
      if ((a.retryCount || 0) > (b.retryCount || 0)) return -1; // Retries first
      if (a.priority !== b.priority) return b.priority - a.priority; // Higher priority first
      return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(); // Older first
    });

    setPool(sortedPool);
    setStats(statsData);
    setCounts(countsData);
    setLoading(false);
  };

  const { addNotification } = useNotification();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isDestructive: false
  });

  const handleAddToPool = async (type: 'ORDER' | 'CARGO', status: string) => {
    if (callStatus !== 'IDLE') {
      addNotification('warning', t('call.alert_pool_change'));
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: t('call.pool_change_title') || 'Havuz Değişikliği',
      message: t('call.confirm_pool_change'),
      onConfirm: async () => {
        setLoading(true);
        const newPool = await populatePool(type, status);
        setPool(newPool);
        setActivePoolType(`${type}-${status}`);
        setLoading(false);
        addNotification('success', t('call.pool_updated') || 'Çağrı havuzu güncellendi');
      }
    });
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartAutoDial = async () => {
    const item = await startAutoDialer();
    if (!item) {
      addNotification('info', t('call.alert_no_records'));
      return;
    }

    setActiveItem(item);
    setCallStatus('DIALING');

    setTimeout(async () => {
      setCallStatus('RINGING');
      const connected = await simulateConnection(item.id);

      if (connected) {
        setCallStatus('CONNECTED');
        startTimer();
        setIsModalOpen(true);
      } else {
        setCallStatus('WRAPUP');
        setTimeout(() => handleEndCall(CallOutcome.UNREACHABLE), 2000);
      }
    }, 1500);
  };

  const handleEndCall = async (outcome: CallOutcome) => {
    if (!activeItem) return;
    stopTimer();
    await completeCall(activeItem.id, outcome);
    setCallStatus('IDLE');
    setActiveItem(null);
    setCallDuration(0);
    setIsModalOpen(false);

    const updatedPool = await getCallPool();
    setPool(updatedPool);
  };

  const handleModalClose = () => {
    if (callStatus === 'CONNECTED') {
      setConfirmDialog({
        isOpen: true,
        title: t('call.end_call_title') || 'Çağrıyı Sonlandır',
        message: t('call.confirm_end_call'),
        isDestructive: true,
        onConfirm: () => handleEndCall(CallOutcome.REACHED_CONFIRMED)
      });
    } else {
      setIsModalOpen(false);
    }
  };

  // Helper for status colors
  const getStatusColor = (status: string) => {
    if (status === OrderStatus.NEW || status === OrderStatus.ARANACAK) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (status === OrderStatus.ULASILAMADI) return 'text-red-600 bg-red-50 border-red-100';
    if (status === OrderStatus.IPTAL) return 'text-gray-600 bg-gray-50 border-gray-100';
    return 'text-gray-700 bg-gray-50 border-gray-100';
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className={`flex flex-col h-[calc(100vh-80px)] ${isFullScreen ? 'fixed inset-0 z-50 bg-gray-100 h-screen' : ''}`}>

      {/* PERFORMANCE DASHBOARD (Top) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-lg flex-shrink-0">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full">
              <Headphones size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('call.title')}</h2>
              <p className="text-xs text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> {t('call.online')} • {activePoolType || t('call.no_pool')}
              </p>
            </div>
          </div>

          <div className="flex gap-6 text-center">
            <div className="px-4 border-r border-white/10">
              <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{t('call.total_calls')}</div>
              <div className="text-2xl font-bold font-mono">{stats?.totalCalls || 0}</div>
            </div>
            <div className="px-4 border-r border-white/10">
              <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{t('call.success_rate')}</div>
              <div className="text-2xl font-bold text-green-400">%{stats?.successRate || 0}</div>
            </div>
            <div className="px-4 border-r border-white/10">
              <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{t('call.avg_duration')}</div>
              <div className="text-2xl font-bold text-blue-400">{stats?.avgDuration || '0:00'}</div>
            </div>
            <div className="px-4">
              <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{t('call.approved')}</div>
              <div className="text-2xl font-bold text-yellow-400">{stats?.ordersApproved || 0}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={toggleFullScreen} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title={t('call.fullscreen')}>
              {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (Sources) */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
            <Target size={18} /> {t('call.sources')}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {/* Order Statuses */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">{t('call.order_statuses')}</h4>
              <div className="space-y-1">
                {Object.values(OrderStatus)
                  .filter(s => s !== OrderStatus.ONAYLANDI && s !== OrderStatus.KARGODA)
                  .map(status => (
                    <div key={status} className={`flex items-center justify-between p-2 rounded-lg border transition-all group hover:shadow-md ${getStatusColor(status)}`}>
                      <div className="flex-1">
                        <div className="text-sm font-bold">{t(`status.${status}`)}</div>
                        <div className="text-xs opacity-70">{counts?.orderCounts[status] || 0} {t('call.records')}</div>
                      </div>
                      <button
                        onClick={() => handleAddToPool('ORDER', status)}
                        className="p-1.5 bg-white text-gray-700 rounded shadow-sm opacity-0 group-hover:opacity-100 hover:bg-blue-50 transition-all"
                        title={t('call.add_to_pool')}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Cargo Statuses */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">{t('call.cargo_statuses')}</h4>
              <div className="space-y-1">
                {Object.values(ShippingStatus)
                  .filter(s => s !== ShippingStatus.DELIVERED)
                  .map(status => (
                    <div key={status} className="flex items-center justify-between p-2 rounded-lg border border-orange-100 bg-orange-50 text-orange-800 hover:shadow-md transition-all group">
                      <div className="flex-1">
                        <div className="text-sm font-bold">{t(`cargo.status.${status}`)}</div>
                        <div className="text-xs opacity-70">{counts?.cargoCounts[status] || 0} {t('call.records')}</div>
                      </div>
                      <button
                        onClick={() => handleAddToPool('CARGO', status)}
                        className="p-1.5 bg-white text-gray-700 rounded shadow-sm opacity-0 group-hover:opacity-100 hover:bg-orange-100 transition-all"
                        title={t('call.add_to_pool')}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden relative">

          {/* ACTIVE CALL AREA */}
          <div className="flex-shrink-0 p-6">
            {activeItem ? (
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden animate-slide-up">
                {/* Status Bar */}
                <div className={`h-2 w-full transition-colors duration-500 ${callStatus === 'DIALING' ? 'bg-yellow-400' :
                  callStatus === 'RINGING' ? 'bg-blue-500' :
                    callStatus === 'CONNECTED' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />

                <div className="p-6 flex flex-col lg:flex-row gap-8">
                  {/* Customer Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                        <User size={32} className="text-slate-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{activeItem.customerName}</h2>
                        <p className="text-lg text-gray-600 font-mono flex items-center gap-2">
                          <Phone size={18} /> {activeItem.customerPhone}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                            {activeItem.orderNumber}
                          </span>
                          {activeItem.retryCount && activeItem.retryCount > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded flex items-center gap-1">
                              <RefreshCw size={12} /> {t('call.retry_count').replace('{count}', activeItem.retryCount.toString())}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Script / Guide */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                        <MessageSquare size={14} /> {t('call.script')}
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {t('call.script_text').replace('{orderNumber}', activeItem.orderNumber)}
                      </p>
                    </div>
                  </div>

                  {/* Call Controls */}
                  <div className="flex flex-col items-center justify-center gap-4 min-w-[250px] border-l border-gray-100 pl-8">
                    <div className="text-center">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('call.duration')}</div>
                      <div className={`text-5xl font-mono font-bold ${callStatus === 'CONNECTED' ? 'text-green-600' : 'text-gray-400'
                        }`}>
                        {formatDuration(callDuration)}
                      </div>
                      <div className="text-sm font-bold text-blue-600 mt-2 animate-pulse">
                        {callStatus === 'DIALING' && t('call.dialing')}
                        {callStatus === 'RINGING' && t('call.ringing')}
                        {callStatus === 'CONNECTED' && t('call.connected')}
                        {callStatus === 'WRAPUP' && t('call.wrapup')}
                      </div>
                    </div>

                    <div className="w-full space-y-3 mt-4">
                      <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={callStatus !== 'CONNECTED'}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${callStatus === 'CONNECTED'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <User size={20} /> {t('call.order_detail')}
                      </button>

                      <button
                        onClick={() => handleEndCall(CallOutcome.REACHED_CONFIRMED)}
                        className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <PhoneOff size={20} /> {t('call.end_call')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                  <Zap size={48} className="text-green-600 ml-1" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('call.ready_title')}</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {t('call.ready_desc').replace('{count}', pool.filter(i => i.status === CallPoolStatus.WAITING).length.toString())}
                </p>
                <button
                  onClick={handleStartAutoDial}
                  disabled={pool.length === 0}
                  className={`px-10 py-5 rounded-2xl shadow-xl font-bold text-xl flex items-center gap-3 mx-auto transition-all transform hover:scale-105 ${pool.length > 0
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                >
                  <Play fill="currentColor" /> {t('call.start_auto')}
                </button>
              </div>
            )}
          </div>

          {/* POOL LIST (Bottom) */}
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Clock size={18} /> {t('call.waiting_list')}
                </h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">{t('call.priority_high')}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">{t('call.priority_normal')}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('call.priority')}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('call.customer')}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('call.status')}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('call.retry')}</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">{t('call.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pool.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t('call.pool_empty')}</td>
                      </tr>
                    ) : (
                      pool.map((item) => (
                        <tr key={item.id} className={`hover:bg-gray-50 ${item.id === activeItem?.id ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-6 py-4">
                            {item.retryCount && item.retryCount > 0 ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded flex w-fit items-center gap-1">
                                <AlertTriangle size={12} /> {t('call.priority_high')}
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded w-fit">
                                {t('call.priority_normal')}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{item.customerName}</div>
                            <div className="text-xs text-gray-500">{item.orderNumber}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === CallPoolStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                              item.status === CallPoolStatus.FAILED ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                              {item.status === CallPoolStatus.WAITING ? t('call.status_waiting') :
                                item.status === CallPoolStatus.DIALING ? t('call.status_dialing') :
                                  item.status === CallPoolStatus.CONNECTED ? t('call.status_connected') :
                                    item.status === CallPoolStatus.COMPLETED ? t('call.status_completed') :
                                      item.status === CallPoolStatus.FAILED ? t('call.status_failed') : item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.nextRetryAt ? (
                              <span className="text-orange-600 flex items-center gap-1 font-bold">
                                <Clock size={14} /> {new Date(item.nextRetryAt).toLocaleTimeString()}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {item.status === CallPoolStatus.WAITING && (
                              <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title={t('call.manual_call')}>
                                <Phone size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeItem?.order && (
        <OrderDetailModal
          isOpen={isModalOpen}
          order={activeItem.order}
          onClose={handleModalClose}
          onUpdate={() => { }}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};

export default CallCenter;
