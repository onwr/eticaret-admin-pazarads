
import React, { useEffect, useState } from 'react';
import { getSecurityLogs } from '../lib/api';
import { SecurityLog, RiskLevel } from '../types/security';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShieldAlert, AlertTriangle, Info, AlertOctagon, RefreshCw, CheckCircle2, Lock, Activity, Search } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const SecurityLogs: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getSecurityLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL:
        return <span className="flex items-center gap-1 text-red-800 bg-red-100 px-2 py-0.5 rounded text-xs font-bold border border-red-200"><AlertOctagon size={12} /> {t('security.risk.critical')}</span>;
      case RiskLevel.HIGH:
        return <span className="flex items-center gap-1 text-orange-800 bg-orange-100 px-2 py-0.5 rounded text-xs font-bold border border-orange-200"><AlertTriangle size={12} /> {t('security.risk.high')}</span>;
      case RiskLevel.MEDIUM:
        return <span className="flex items-center gap-1 text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200"><Info size={12} /> {t('security.risk.medium')}</span>;
      default:
        return <span className="flex items-center gap-1 text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-xs font-bold border border-blue-200"><Info size={12} /> {t('security.risk.low')}</span>;
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <ShieldAlert className="text-purple-600" />
            {t('security.logs.title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t('security.logs.description')}</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* System Health Report */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{t('security.health.rate_limit')}</p>
            <p className="text-sm font-bold text-green-700 flex items-center gap-1">
              <CheckCircle2 size={14} /> {t('security.health.active')}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{t('security.health.fake_order')}</p>
            <p className="text-sm font-bold text-green-700 flex items-center gap-1">
              <CheckCircle2 size={14} /> {t('security.health.active')}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Lock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{t('security.health.ssl')}</p>
            <p className="text-sm font-bold text-green-700 flex items-center gap-1">
              <CheckCircle2 size={14} /> {t('security.health.valid')}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Search size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{t('security.health.scan')}</p>
            <p className="text-sm font-bold text-green-700 flex items-center gap-1">
              <CheckCircle2 size={14} /> {t('security.health.clean')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('security.table.timestamp')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('security.risk_level')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('security.table.type')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('security.ip_address')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('security.table.description')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t('security.table.no_logs')}</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {getRiskBadge(log.riskLevel)}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-700">
                    {log.type}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {log.description}
                    {log.details && (
                      <div className="mt-1 text-xs text-gray-500 font-mono bg-gray-50 p-1 rounded max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div >
    </div >
  );
};

export default SecurityLogs;
