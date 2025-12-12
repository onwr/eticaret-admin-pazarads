import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { LogOut, Bell, User as UserIcon, Globe } from 'lucide-react';
import { logout } from '../lib/auth';
import { useLanguage } from '../lib/i18n';
import NotificationDropdown from './NotificationDropdown';
import { useNotification } from '../contexts/NotificationContext';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onProfileClick: () => void;
  title: string;
  onNavigate: (view: string) => void;
}

import NotificationSound from './NotificationSound';

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onProfileClick, title, onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { notifications, history, playTrigger } = useNotification();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  const unreadCount = history.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-8 flex justify-between items-center sticky top-0 z-10">
      <NotificationSound playTrigger={playTrigger} />
      <div>
        <h1 className="text-xl font-bold text-gray-800 capitalize">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
        >
          <Globe size={18} />
          <span className="text-sm font-medium uppercase">{language}</span>
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} onNavigate={onNavigate} />
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3">
          <button
            onClick={onProfileClick}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors group text-left"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden group-hover:border-blue-100 transition-colors">
              <UserIcon size={20} />
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title={t('common.logout')}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
