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
    { id: AppView.DASHBOARD, label: 'Mission Control', icon: LayoutDashboard },
    { id: AppView.CRM, label: 'CRM', icon: Users },
    { id: AppView.LEADS, label: 'Lead Pipeline', icon: Target },
    { id: AppView.WEBSITE, label: 'Funnel Builder', icon: Globe },
    { id: AppView.CONTENT, label: 'Content Engine', icon: FileText },
    { id: AppView.AUTOMATIONS, label: 'Automations', icon: Zap },
    { id: AppView.PAYMENTS, label: 'Monetization', icon: CreditCard },
    { id: AppView.GROWTH, label: 'Growth Lab', icon: TrendingUp },
    { id: AppView.SETTINGS, label: 'System', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-50 dark:bg-[#020617] border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 transition-colors duration-300 z-20 relative">
      {/* Decorative Border */}
      <div className="absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary-900 to-transparent opacity-50"></div>

      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 dark:bg-white border-2 border-primary-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <Activity size={20} className="text-white dark:text-black" />
        </div>
        <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white block leading-none">
            FitnessOS
            </span>
            <span className="text-[10px] font-bold text-primary-500 tracking-widest uppercase">System V2.0</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-white dark:bg-primary-600/10 text-primary-700 dark:text-primary-400 font-bold shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              )}
              <Icon size={18} className={`transition-transform duration-200 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'group-hover:text-slate-900 dark:group-hover:text-white'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-[#05091a]">
        <div className="bg-slate-200/50 dark:bg-slate-900/50 rounded-lg p-3 flex items-center justify-between border border-slate-300 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isDarkMode ? <Moon size={12} /> : <Sun size={12} />}
                <span>{isDarkMode ? 'Dark' : 'Light'}</span>
            </div>
            <button 
                onClick={toggleTheme}
                className={`w-8 h-4 rounded-full relative transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-primary-600' : 'bg-slate-400'}`}
            >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${isDarkMode ? 'left-4.5' : 'left-0.5'}`} style={{ left: isDarkMode ? '18px' : '2px' }}></div>
            </button>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all w-full text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Disconnect</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
