import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp, Activity, ArrowUpRight, Save, Check, X, Bell, Globe, Loader2, Cpu, ShieldCheck } from 'lucide-react';
import { BusinessBlueprint, Client, ClientStatus, AnalyticsEvent } from '../types';

interface DashboardProps {
  blueprint: BusinessBlueprint;
  revenueData: any[];
  clients: Client[];
  events?: AnalyticsEvent[];
  isDarkMode?: boolean;
  onUpdateClient?: (id: string, updates: Partial<Client>) => Promise<void> | void;
}

const Dashboard: React.FC<DashboardProps> = ({ blueprint, revenueData, clients, events = [], isDarkMode = false, onUpdateClient }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [activeAction, setActiveAction] = useState<'workout' | 'invoice' | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getPrice = () => {
    try {
        const priceString = blueprint.websiteData.pricing.find(p => p.name.includes('Pro') || p.name.includes('Premium'))?.price 
                            || blueprint.websiteData.pricing[0]?.price 
                            || "0";
        return parseInt(priceString.replace(/[^0-9]/g, '')) || 0;
    } catch (e) {
        return 0;
    }
  };

  const planPrice = getPrice();
  const activeClients = clients.filter(c => c.status === ClientStatus.ACTIVE).length;
  const leads = clients.filter(c => c.status === ClientStatus.LEAD).length;
  const currentRevenue = activeClients * planPrice;

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  const handleAssignWorkout = async () => {
    if (onUpdateClient && selectedClientId) {
      setActionLoading(true);
      try {
        await onUpdateClient(selectedClientId, { program: selectedProgram });
        setActiveAction(null);
        setSelectedClientId('');
        setSelectedProgram('');
        alert("Workout assigned and saved to database successfully!");
      } catch (e) {
        console.error("Assign failed", e);
        alert("Failed to assign workout. Please try again.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCreateInvoice = () => {
    if (selectedClientId && invoiceAmount) {
      const link = `https://buy.stripe.com/test_${Math.random().toString(36).substring(7)}`;
      navigator.clipboard.writeText(link);
      alert(`Invoice created for $${invoiceAmount}! Link copied to clipboard.`);
      setActiveAction(null);
      setSelectedClientId('');
      setInvoiceAmount('');
    }
  };

  // Get recent 5 events
  const recentEvents = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in relative max-w-7xl mx-auto">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6 relative">
         {/* Decorative decorative lines */}
         <div className="absolute top-0 left-0 w-20 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
         
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase font-mono">Mission Control</h1>
             <span className="px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-400 text-[10px] font-mono border border-cyan-800">ONLINE</span>
          </div>
          <p className="text-slate-400 flex items-center gap-2 text-sm font-mono">
             SYSTEM: <span className="text-primary-400">{blueprint.businessName.toUpperCase()}</span>
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700 text-slate-300 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all hover:border-cyan-500/50 hover:text-cyan-400"
           >
             {isSaving ? <Check size={18} className="text-green-500" /> : <Save size={18} />}
             {isSaving ? 'SYNCING...' : 'SYNC DATA'}
           </button>
           <button 
             onClick={() => window.location.hash = '#crm'} 
             className="flex-1 md:flex-none bg-primary-600/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-500 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all hover:scale-105 border border-primary-500"
           >
             <ArrowUpRight size={18} /> NEW OPERATION
           </button>
        </div>
      </div>

      {/* Stats Grid - HUD Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'REVENUE', 
            value: `$${currentRevenue.toLocaleString()}`, 
            sub: '+12.5% M/M', 
            icon: DollarSign, 
            color: 'text-cyan-400', 
            border: 'border-cyan-500/30',
            glow: 'shadow-[0_0_20px_rgba(34,211,238,0.1)]'
          },
          { 
            label: 'ACTIVE AGENTS', 
            value: activeClients.toString(), 
            sub: `${leads} PENDING`, 
            icon: Users, 
            color: 'text-primary-400', 
             border: 'border-primary-500/30',
             glow: 'shadow-[0_0_20px_rgba(99,102,241,0.1)]'
          },
          { 
            label: 'COMPLETION', 
            value: '92%', 
            sub: 'OPTIMAL', 
            icon: Activity, 
            color: 'text-green-400', 
            border: 'border-green-500/30',
            glow: 'shadow-[0_0_20px_rgba(74,222,128,0.1)]'
          },
          { 
            label: 'LEAD PIPELINE', 
            value: leads.toString(), 
            sub: 'HIGH INTENT', 
            icon: TrendingUp, 
            color: 'text-purple-400', 
            border: 'border-purple-500/30',
            glow: 'shadow-[0_0_20px_rgba(192,132,252,0.1)]'
          },
        ].map((stat, i) => (
          <div key={i} className={`relative bg-slate-900/60 backdrop-blur-md rounded-xl p-6 border ${stat.border} ${stat.glow} transition-all duration-300 hover:bg-slate-800/60 group`}>
            <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className={`w-1 h-1 rounded-full ${stat.color} bg-current mb-1`}></div>
                <div className={`w-1 h-1 rounded-full ${stat.color} bg-current`}></div>
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded bg-white/5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${stat.border} ${stat.color} bg-white/5`}>
                LIVE
              </span>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-white tracking-tight font-mono">{stat.value}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 tracking-wider">{stat.label}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-slate-500">
                <TrendingUp size={12} className={stat.color} /> {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
                <Activity size={16} className="text-primary-400"/> Revenue Trajectory
            </h3>
            <select className="bg-black/40 border border-slate-700 rounded text-xs px-3 py-1 text-slate-300 outline-none focus:border-primary-500 font-mono">
                <option>T-MINUS 6 MONTHS</option>
                <option>YEAR TO DATE</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace'}} prefix="$" />
                <Tooltip 
                  contentStyle={{
                      borderRadius: '8px', 
                      border: '1px solid #334155', 
                      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      padding: '12px',
                      fontFamily: 'monospace'
                  }} 
                />
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    activeDot={{r: 4, strokeWidth: 0, fill: '#fff', stroke: '#6366f1'}}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 shadow-2xl backdrop-blur-sm flex flex-col relative">
           <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-bl-full filter blur-xl"></div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-mono mb-6 flex items-center gap-2">
             <Cpu size={16} className="text-cyan-400"/> Quick Actions
          </h3>
          <div className="space-y-4 flex-1">
            <button 
                onClick={() => setActiveAction('workout')}
                className="w-full text-left p-4 rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-primary-500/50 transition-all group"
            >
              <span className="block font-bold text-white group-hover:text-primary-400 transition-colors">Assign Program</span>
              <span className="text-xs text-slate-500 mt-1 font-mono">DEPLOY PROTOCOL &rarr;</span>
            </button>
            <button 
                onClick={() => setActiveAction('invoice')}
                className="w-full text-left p-4 rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-cyan-500/50 transition-all group"
            >
              <span className="block font-bold text-white group-hover:text-cyan-400 transition-colors">Create Invoice</span>
              <span className="text-xs text-slate-500 mt-1 font-mono">GENERATE LINK &rarr;</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">SYSTEM LOGS</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>
             <div className="space-y-4">
               {recentEvents.length === 0 ? (
                 <div className="text-xs text-slate-600 text-center py-4 font-mono">NO ACTIVITY DETECTED</div>
               ) : recentEvents.map(event => (
                 <div key={event.id} className="flex gap-3 animate-slide-up group">
                   <div className={`w-2 h-full min-h-[24px] rounded-full shrink-0 ${
                      event.type === 'lead_created' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                      event.type === 'page_view' ? 'bg-slate-600' :
                      event.type === 'automation_triggered' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' :
                      'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                   }`}></div>
                   <div>
                      <p className="text-xs text-slate-300 font-medium font-mono group-hover:text-white transition-colors">
                        {event.type === 'lead_created' ? 'NEW LEAD CAPTURED' : 
                         event.type === 'page_view' ? 'SITE VISIT DETECTED' : 
                         event.type === 'automation_triggered' ? 'AUTOMATION EXECUTED' :
                         'CONVERSION RECORDED'}
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono">{new Date(event.createdAt).toLocaleTimeString()}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Modals with Dark Sci-Fi Theme */}
      {activeAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden animate-slide-up border border-slate-700">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                        {activeAction === 'workout' ? 'DEPLOY PROTOCOL' : 'GENERATE INVOICE'}
                    </h2>
                    <button onClick={() => setActiveAction(null)} className="text-slate-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-5 bg-slate-900/50">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Target Agent</label>
                        <select 
                            className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-black/40 text-white focus:border-primary-500 outline-none transition-all"
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                        >
                            <option value="">-- SELECT TARGET --</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {activeAction === 'workout' ? (
                        <div>
                             <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Protocol</label>
                             <select 
                                className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-black/40 text-white focus:border-primary-500 outline-none transition-all"
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                             >
                                <option value="">-- SELECT PROTOCOL --</option>
                                {blueprint.suggestedPrograms.map(p => <option key={p} value={p}>{p}</option>)}
                             </select>
                        </div>
                    ) : (
                        <div>
                             <label className="block text-xs font-bold text-slate-400 mb-2 font-mono uppercase">Value ($)</label>
                             <input 
                                type="number"
                                className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-black/40 text-white focus:border-primary-500 outline-none transition-all"
                                placeholder="97.00"
                                value={invoiceAmount}
                                onChange={(e) => setInvoiceAmount(e.target.value)}
                             />
                        </div>
                    )}
                    
                    <button 
                        onClick={activeAction === 'workout' ? handleAssignWorkout : handleCreateInvoice}
                        disabled={!selectedClientId || (activeAction === 'workout' ? !selectedProgram : !invoiceAmount) || actionLoading}
                        className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold hover:bg-primary-500 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 transition-all font-mono uppercase tracking-wider"
                    >
                        {actionLoading ? <Loader2 className="animate-spin" size={20} /> : activeAction === 'workout' ? 'EXECUTE' : 'GENERATE'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
