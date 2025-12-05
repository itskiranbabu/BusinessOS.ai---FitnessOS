import React, { useState } from 'react';
import { BusinessBlueprint, Client } from '../types';
import { Save, User, Briefcase, Target, ShieldCheck, Download, FileText, AlertTriangle, Cpu, Terminal } from 'lucide-react';

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

  const handleReset = () => {
      if(confirm("WARNING: This will wipe all local data and reset the app to the onboarding state. Continue?")) {
          localStorage.clear();
          window.location.reload();
      }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your operating system parameters.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Account Info */}
        <div className="md:col-span-1 space-y-6">
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 text-center border-b border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary-500/30">
                        {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{userEmail}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Administrator</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-black/20">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium justify-center bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                        <ShieldCheck size={14} /> Encrypted Connection
                    </div>
                </div>
             </div>

             <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Cpu size={14} /> System Status
                 </h4>
                 <div className="space-y-3 font-mono text-xs">
                     <div className="flex justify-between text-slate-300">
                         <span>CPU_LOAD</span>
                         <span className="text-green-400">12%</span>
                     </div>
                     <div className="flex justify-between text-slate-300">
                         <span>MEMORY</span>
                         <span className="text-green-400">48%</span>
                     </div>
                     <div className="flex justify-between text-slate-300">
                         <span>AI_MODEL</span>
                         <span className="text-primary-400">GEMINI-2.5-FLASH</span>
                     </div>
                     <div className="flex justify-between text-slate-300">
                         <span>LATENCY</span>
                         <span className="text-green-400">42ms</span>
                     </div>
                 </div>
             </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase size={20} className="text-primary-500" /> Business Profile
                </h2>
                <button 
                    type="submit"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg ${
                    isSaved 
                        ? 'bg-green-600 text-white shadow-green-600/20' 
                        : 'bg-primary-600 text-white hover:bg-primary-500 shadow-primary-600/30'
                    }`}
                >
                    <Save size={16} /> {isSaved ? 'Saved' : 'Save Changes'}
                </button>
                </div>
                
                <div className="p-6 space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Brand Name</label>
                        <input 
                            type="text" 
                            value={formData.businessName}
                            onChange={e => setFormData({...formData, businessName: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-black text-slate-900 dark:text-white transition-all outline-none font-medium"
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Niche</label>
                        <input 
                            type="text" 
                            value={formData.niche}
                            onChange={e => setFormData({...formData, niche: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-black text-slate-900 dark:text-white transition-all outline-none font-medium"
                        />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Mission Statement</label>
                        <textarea 
                        rows={3}
                        value={formData.mission}
                        onChange={e => setFormData({...formData, mission: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-black text-slate-900 dark:text-white transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase flex items-center gap-2">
                        <Target size={14} /> Ideal Client Avatar
                        </label>
                        <textarea 
                        rows={2}
                        value={formData.targetAudience}
                        onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-black text-slate-900 dark:text-white transition-all outline-none"
                        />
                    </div>
                </div>
            </form>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Terminal size={16} /> Data Operations
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                     <button 
                        onClick={handleExportCSV}
                        className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                    >
                        <Download size={18} /> Export Client Data (CSV)
                    </button>
                    <button 
                        onClick={handleReset}
                        className="flex-1 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all font-medium"
                    >
                        <AlertTriangle size={18} /> Reset System Data
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
