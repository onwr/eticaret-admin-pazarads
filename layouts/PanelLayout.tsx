
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { User } from '../types';
import { Menu } from 'lucide-react';

interface PanelLayoutProps {
  children: React.ReactNode;
  user: User | null;
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
  onProfileClick: () => void;
}

const PanelLayout: React.FC<PanelLayoutProps> = ({
  children,
  user,
  currentView,
  setCurrentView,
  onLogout,
  onProfileClick
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className="flex-1 flex flex-col min-h-screen transition-all w-full lg:w-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 px-4 md:px-8 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 capitalize hidden sm:block">
              {currentView.includes(':') ? currentView.split(':')[0] : currentView.replace('-', ' ')}
            </h1>
          </div>

          <Navbar
            user={user}
            onLogout={onLogout}
            onProfileClick={onProfileClick}
            title="" // Title is handled above now for mobile layout
            onNavigate={setCurrentView}
          />
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PanelLayout;
