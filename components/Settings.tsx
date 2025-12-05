import React, { useState } from 'react';
import { BusinessBlueprint, Client } from '../types';
import { Save, User, Briefcase, Target, ShieldCheck, Download, FileText } from 'lucide-react';

interface SettingsProps {
  blueprint: BusinessBlueprint;
  userEmail: string | null;
  onUpdateProfile: (data: Partial<BusinessBlueprint>) => void;
  clients?: Client[];
}

const Settings: React.FC<SettingsProps> = ({ blueprint, userEmail, onUpdateProfile, clients = [] }) => {
  const [formData, setFormData] = useState({
    businessName: blueprint.businessName,
    niche: blueprint.niche,
    mission: blueprint.mission,
    targetAudience: blueprint.targetAudience
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportCSV = () => {
    if (clients.length === 0) {
        alert("No clients to export.");
        return;
    }

    const headers = ["ID", "Name", "Email", "Status", "Program", "Progress", "Last Check-in"];
    const csvContent = [
        headers.join(","),
        ...clients.map(c => [
            c.id, 
            `"${c.name}"`, 
            c.email, 
            c.status, 
            `"${c.program}"`, 
            c.progress, 
            `"${c.lastCheckIn}"`
        ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your business profile and preferences.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={20} className="text-slate-400" /> Account Info
          </h2>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary-500/30">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-lg">Signed in as</p>
              <p className="text-slate-500 dark:text-slate-400">{userEmail}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-4 py-1.5 rounded-full border border-green-200 dark:border-green-800">
              <ShieldCheck size={14} /> Secure Connection
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
             <div className="text-sm text-slate-500 dark:text-slate-400">
                 Data Management
             </div>
             <button 
                onClick={handleExportCSV}
                className="text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm flex items-center gap-2 transition-colors"
             >
                 <Download size={16} /> Export Clients (.CSV)
             </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase size={20} className="text-slate-400" /> Business Profile
          </h2>
          <button 
            type="submit"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg ${
              isSaved 
                ? 'bg-green-600 text-white shadow-green-600/20' 
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/30'
            }`}
          >
            <Save size={18} /> {isSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Business Name</label>
              <input 
                type="text" 
                value={formData.businessName}
                onChange={e => setFormData({...formData, businessName: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Niche / Speciality</label>
              <input 
                type="text" 
                value={formData.niche}
                onChange={e => setFormData({...formData, niche: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mission Statement</label>
             <textarea 
               rows={3}
               value={formData.mission}
               onChange={e => setFormData({...formData, mission: e.target.value})}
               className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
               <Target size={16} /> Target Audience
             </label>
             <textarea 
               rows={2}
               value={formData.targetAudience}
               onChange={e => setFormData({...formData, targetAudience: e.target.value})}
               className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-all"
             />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;