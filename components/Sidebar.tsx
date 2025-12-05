import React from 'react';
import { LayoutDashboard, Users, Globe, FileText, Settings, LogOut, Activity, Zap, CreditCard, Moon, Sun, Target, TrendingUp } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, isDarkMode, toggleTheme }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.CRM, label: 'CRM', icon: Users },
    { id: AppView.LEADS, label: 'Leads', icon: Target },
    { id: AppView.WEBSITE, label: 'Website Builder', icon: Globe },
    { id: AppView.CONTENT, label: 'Content Engine', icon: FileText },
    { id: AppView.AUTOMATIONS, label: 'Automations', icon: Zap },
    { id: AppView.PAYMENTS, label: 'Monetization', icon: CreditCard },
    { id: AppView.GROWTH, label: 'Growth Engine', icon: TrendingUp },
    { id: AppView.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 transition-colors duration-300 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Activity size={20} className="text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          FitnessOS
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"></div>
              )}
              <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-3 flex items-center justify-between border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
                <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <button 
                onClick={toggleTheme}
                className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-primary-600' : 'bg-slate-300'}`}
            >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${isDarkMode ? 'left-5' : 'left-1'}`}></div>
            </button>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all w-full text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;