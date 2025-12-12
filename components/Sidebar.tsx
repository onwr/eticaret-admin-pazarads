import React, { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Headphones, Truck, Users,
  BarChart2, Settings, Globe, Layout, Languages, MessageSquare,
  MessageCircle, BrainCircuit, Ban, ShieldAlert, Zap,
  X, Menu, ClipboardList, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useLanguage } from '../lib/i18n';
import { getGeneralSettings } from '../lib/api';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobileOpen, setIsMobileOpen }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [logo, setLogo] = useState<string>('');

  React.useEffect(() => {
    getGeneralSettings().then(settings => {
      if (settings.logo) setLogo(settings.logo);
    });
  }, []);

  const handleNav = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const NavItem = ({ icon: Icon, label, view, badge }: any) => {
    const isActive = currentView === view || currentView.startsWith(view + '/');
    return (
      <button
        onClick={() => handleNav(view)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mx-2 mb-1 transition-all duration-200 group relative overflow-hidden ${isActive
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        style={{ width: 'calc(100% - 16px)' }}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-full"></div>
        )}
        <div className="flex items-center gap-3 relative z-10 pl-2">
          <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600 transition-colors'} />
          <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </div>
        {badge && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-rose-200">{badge}</span>
        )}
      </button>
    );
  };

  const SectionTitle = ({ label }: { label: string }) => (
    <div className="px-4 mt-6 mb-2">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } `}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Logo" className="h-9 object-contain" />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white font-bold text-lg">N</span>
              </div>
            )}
            <div>
              <h1 className="text-gray-900 font-bold text-lg tracking-tight">PAZARADS</h1>
              <p className="text-xs text-gray-500 font-medium -mt-1">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-6 pr-2 custom-scrollbar">
          <div className="space-y-1">
            <NavItem icon={LayoutDashboard} label={t('menu.dashboard')} view="dashboard" />
          </div>

          <SectionTitle label={t('menu.operations')} />
          <div className="space-y-1">
            <NavItem icon={Headphones} label={t('menu.call_center')} view="call-center" />
            {/* Defaults to 'NEW' status when clicked */}
            <NavItem icon={ShoppingCart} label={t('menu.orders')} view="orders:NEW" />
            <NavItem icon={Truck} label={t('menu.shipping')} view="shipping" />
          </div>

          <SectionTitle label={t('menu.catalog')} />
          <div className="space-y-1">
            <NavItem icon={Package} label={t('menu.products')} view="products" />
            {(user?.permissions?.stock_manage || user?.role === UserRole.ADMIN) && (
              <NavItem icon={ClipboardList} label={t('menu.inventory')} view="inventory" />
            )}
            <NavItem icon={Zap} label={t('menu.upsells')} view="upsells" />
            <NavItem icon={Globe} label={t('menu.domains')} view="domains" />
          </div>

          <SectionTitle label={t('menu.design_content')} />
          <div className="space-y-1">
            <NavItem icon={Layout} label={t('menu.templates')} view="templates" />
            <NavItem icon={BrainCircuit} label={t('menu.ai_panel')} view="ai-panel" />
          </div>

          <SectionTitle label={t('menu.communication')} />
          <div className="space-y-1">
            <NavItem icon={MessageSquare} label={t('menu.sms_history')} view="sms-history" />
            <NavItem icon={MessageCircle} label={t('menu.wa_history')} view="whatsapp-history" />
          </div>

          <SectionTitle label={t('menu.analytics')} />
          <div className="space-y-1">
            <NavItem icon={BarChart2} label={t('menu.reports')} view="reports" />
          </div>

          <SectionTitle label={t('menu.security')} />
          <div className="space-y-1">
            <NavItem icon={Ban} label={t('menu.blacklist')} view="security-blacklist" />
            <NavItem icon={ShieldAlert} label={t('menu.logs')} view="security-logs" />
            {(user?.permissions?.logs_view || user?.role === UserRole.ADMIN) && (
              <NavItem icon={Activity} label={t('menu.activity_logs')} view="activity-logs" />
            )}
          </div>

          <SectionTitle label={t('menu.config')} />
          <div className="space-y-1 pb-10">
            <NavItem icon={Settings} label={t('menu.settings')} view="settings" />
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 font-bold border-2 border-gray-200 group-hover:border-blue-500 transition-colors">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
