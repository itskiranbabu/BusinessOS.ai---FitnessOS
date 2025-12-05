
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
    <div className="w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-white h-screen flex flex-col shadow-2xl flex-shrink-0 transition-colors duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/50">
          <Activity size={20} className="text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          FitnessOS
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                <span>{isDarkMode ? 'Dark' : 'Light'}</span>
            </div>
            <button 
                onClick={toggleTheme}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-primary-600' : 'bg-slate-600'}`}
            >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
            </button>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all w-full"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
