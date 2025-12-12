import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, RefreshCw, User, Calendar } from 'lucide-react';
import { ActivityLog } from '../types';
import { getActivityLogs, getUsers } from '../lib/api';
import { useLanguage } from '../lib/i18n';


const ActivityLogs: React.FC = () => {
    const { t } = useLanguage();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [users, setUsers] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [logsData, usersData] = await Promise.all([
                getActivityLogs(),
                getUsers()
            ]);
            setLogs(logsData);
            setUsers(usersData.map(u => ({ id: u.id, name: u.name || u.email })));
        } catch (error) {
            console.error("Failed to load logs", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUser = selectedUser ? log.userId === selectedUser : true;

        return matchesSearch && matchesUser;
    });

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('activity.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('activity.subtitle')}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('activity.search_placeholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                </div>

                <div className="w-64">
                    <select
                        value={selectedUser}
                        onChange={e => setSelectedUser(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    >
                        <option value="">{t('activity.all_users')}</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <button onClick={loadData} className="px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors ml-auto">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">{t('activity.loading')}</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">{t('activity.no_logs')}</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${log.action.includes('LOGIN') ? 'bg-blue-50 text-blue-600' :
                                    log.action.includes('CREATE') ? 'bg-green-50 text-green-600' :
                                        log.action.includes('DELETE') ? 'bg-red-50 text-red-600' :
                                            'bg-gray-100 text-gray-600'
                                    }`}>
                                    <Activity size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900">{log.action}</h3>
                                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(log.createdAt).toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-2">{log.details}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            <User size={12} /> {log.userName}
                                        </span>
                                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                                        {log.entityType && <span>{t('activity.ref')} {log.entityType} #{log.entityId}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
