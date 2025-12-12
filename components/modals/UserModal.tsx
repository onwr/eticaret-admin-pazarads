
import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Lock, Mail, Shield, Check, Camera } from 'lucide-react';
import { User as UserType, UserRole, PermissionSet, RoleTemplate } from '../../types';
import { getRoleTemplates } from '../../lib/api';
import { useLanguage } from '../../lib/i18n';
import MediaLibraryModal from '../modals/MediaLibraryModal';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<UserType>) => Promise<void>;
  initialData?: UserType;
  hidePermissions?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  hidePermissions = false
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<UserType>>({
    name: '',
    email: '',
    role: UserRole.AGENT,
    password: '',
    permissions: {} as PermissionSet,
    isActive: true,
    avatarUrl: ''
  });

  const [permissions, setPermissions] = useState<PermissionSet>({
    catalog_view: false, catalog_create: false, catalog_edit: false, catalog_delete: false,
    orders_view: false, orders_edit: false, orders_approve: false, orders_export: false,
    customers_view: false, dealers_manage: false,
    domains_manage: false, templates_manage: false,
    reports_view: false, users_manage: false, settings_manage: false, logs_view: false
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      const templates = await getRoleTemplates();
      setRoleTemplates(templates);
    };
    if (isOpen) fetchTemplates();

    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        avatarUrl: initialData.avatarUrl || ''
      });
      if (initialData.permissions) {
        setPermissions(initialData.permissions);
      } else {
        // If no explicit permissions, try to match role to a template
        const match = roleTemplates.find(t => t.id.toUpperCase() === initialData.role);
        if (match) setPermissions(match.permissions);
      }
    } else {
      setFormData({
        name: '',
        email: '',
        role: UserRole.AGENT,
        password: '',
        isActive: true,
        avatarUrl: ''
      });
      // Default permissions
      const match = roleTemplates.find(t => t.id === 'agent');
      if (match) setPermissions(match.permissions);
    }
  }, [initialData, isOpen]);

  const handleTemplateApply = (template: RoleTemplate) => {
    setPermissions(template.permissions);
  };

  const handlePermissionChange = (key: keyof PermissionSet) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        permissions
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const permissionGroups = [
    { title: 'Catalog', keys: ['catalog_view', 'catalog_create', 'catalog_edit', 'catalog_delete'] },
    { title: 'Orders', keys: ['orders_view', 'orders_edit', 'orders_approve', 'orders_export'] },
    { title: 'System', keys: ['users_manage', 'settings_manage', 'logs_view', 'reports_view'] },
    { title: 'Marketing', keys: ['customers_view', 'domains_manage', 'templates_manage', 'dealers_manage'] }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            {initialData ? t('common.edit') + ' ' + t('common.profile') : t('common.add') + ' User'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            <User size={16} /> Profile Info
          </button>
          {!hidePermissions && (
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'permissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
            >
              <Shield size={16} /> Permissions & Roles
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">

          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => setIsMediaModalOpen(true)}>
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <Camera size={14} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required={!initialData} // Required only for new users
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder={initialData ? "Leave blank to keep current" : "Create a password"}
                  />
                </div>
              </div>

              {!hidePermissions && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Role Label</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value={UserRole.ADMIN}>Administrator</option>
                      <option value={UserRole.AGENT}>Sales Agent</option>
                      <option value={UserRole.EDITOR}>Content Editor</option>
                      <option value={UserRole.DEALER}>Dealer</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">This sets the badge color and default dashboard view.</p>
                  </div>

                  <div className="flex items-center pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 cursor-pointer">
                      User Account Active
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'permissions' && !hidePermissions && (
            <div className="space-y-6">
              {/* Quick Templates */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-3">Apply Role Template</h3>
                <div className="flex flex-wrap gap-2">
                  {roleTemplates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateApply(template)}
                      className="px-3 py-1.5 text-xs font-medium bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">Clicking a template will overwrite current permission selections.</p>
              </div>

              {/* Permission Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {permissionGroups.map(group => (
                  <div key={group.title} className="border border-gray-100 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 text-sm mb-3 border-b border-gray-100 pb-2">{group.title}</h4>
                    <div className="space-y-2">
                      {group.keys.map(key => (
                        <label key={key} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize">
                            {key.replace('_', ' ')}
                          </span>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={(permissions as any)[key]}
                              onChange={() => handlePermissionChange(key as keyof PermissionSet)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {initialData ? t('common.update') : t('common.create')}
            </button>
          </div>
        </form>
      </div>

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          setFormData(prev => ({ ...prev, avatarUrl: url }));
          setIsMediaModalOpen(false);
        }}
      />
    </div>
  );
};

export default UserModal;
