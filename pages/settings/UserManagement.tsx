
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, User, Trash2, Edit2, Shield, Search } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../lib/api';
import { User as UserType, UserRole } from '../../types';
import UserModal from '../../components/modals/UserModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../lib/i18n';

interface UserManagementProps {
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | undefined>(undefined);
  const [deletingUser, setDeletingUser] = useState<UserType | undefined>(undefined);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: Partial<UserType>) => {
    if (editingUser) {
      await updateUser(editingUser.id, data, user ? { id: user.id, name: user.name || 'Unknown' } : undefined);
    } else {
      await createUser(data);
    }
    loadUsers();
  };

  const handleDelete = async () => {
    if (deletingUser) {
      await deleteUser(deletingUser.id);
      setDeletingUser(undefined);
      loadUsers();
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> {t('settings.back')}
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('settings.users')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.users.subtitle')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          {t('settings.users.add')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('settings.users.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('settings.users.table.user')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('settings.users.table.role')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('settings.users.table.status')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('settings.users.table.permissions')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('settings.users.table.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t('settings.users.no_users')}</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{user.name || t('settings.users.unknown')}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                      ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' :
                        user.role === UserRole.DEALER ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'}`}>
                      <Shield size={10} className="mr-1" /> {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                        {t('settings.users.active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {t('settings.users.inactive')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">
                      {user.permissions ? t('settings.users.custom_set') : t('settings.users.default_role')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title={t('settings.users.edit_perm')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title={t('settings.users.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingUser}
      />

      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(undefined)}
        onConfirm={handleDelete}
        title={t('settings.users.delete')}
        message={t('settings.users.delete_confirm').replace('{name}', deletingUser?.name || '')}
        isDestructive={true}
      />
    </div>
  );
};

export default UserManagement;
