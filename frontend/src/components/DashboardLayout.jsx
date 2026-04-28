import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  LayoutDashboard, Upload, FileText, Coins, BookOpen,
  User, HelpCircle, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';

export const DashboardLayout = ({ children }) => {
  const { user, logout, t } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/upload', icon: Upload, label: t('uploadFile') },
    { to: '/files', icon: FileText, label: t('myFiles') },
    { to: '/credits', icon: Coins, label: t('buyCredits') },
    { to: '/tuning-specs', icon: BookOpen, label: t('tuningSpecs') },
    { to: '/account', icon: User, label: t('account') },
    { to: '/support', icon: HelpCircle, label: t('support') },
  ];

  return (
    <div className="min-h-screen bg-[#EEF1F4] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200`}>
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <Logo size="sm" />
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium ${
                  isActive
                    ? 'bg-fct-orange text-white'
                    : 'text-fct-dark hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-fct-dark hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded">
              <Coins className="w-4 h-4 text-fct-orange" />
              <span className="text-sm font-semibold text-fct-dark">{user?.credits || 0}</span>
              <span className="text-xs text-fct-muted hidden sm:inline">{t('credits')}</span>
            </div>
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-fct-orange text-white flex items-center justify-center text-sm font-semibold">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-sm">
                <div className="font-semibold text-fct-dark leading-tight">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-fct-muted">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
