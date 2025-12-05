import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp, Activity, ArrowUpRight, Save, Check, X, Bell } from 'lucide-react';
import { BusinessBlueprint, Client, ClientStatus, AnalyticsEvent } from '../types';

interface DashboardProps {
  blueprint: BusinessBlueprint;
  revenueData: any[];
  clients: Client[];
  isDarkMode?: boolean;
  onUpdateClient?: (id: string, updates: Partial<Client>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ blueprint, revenueData, clients, isDarkMode = false, onUpdateClient }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [activeAction, setActiveAction] = useState<'workout' | 'invoice' | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');

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

  const handleAssignWorkout = () => {
    if (onUpdateClient && selectedClientId) {
      onUpdateClient(selectedClientId, { program: selectedProgram });
      setActiveAction(null);
      setSelectedClientId('');
      setSelectedProgram('');
      alert("Workout assigned successfully!");
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

  return (
    <div className="space-y-8 animate-fade-in relative max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            Overview for <span className="font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">{blueprint.businessName}</span>
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
           >
             {isSaving ? <Check size={18} className="text-green-500" /> : <Save size={18} />}
             {isSaving ? 'Saved' : 'Save Changes'}
           </button>
           <button className="flex-1 md:flex-none bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-500 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5">
             <ArrowUpRight size={18} /> New Client
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Monthly Revenue', 
            value: `$${currentRevenue.toLocaleString()}`, 
            sub: '+12.5% vs last month', 
            icon: DollarSign, 
            color: 'text-green-600 dark:text-emerald-400', 
            bg: 'bg-green-100 dark:bg-emerald-900/20' 
          },
          { 
            label: 'Active Athletes', 
            value: activeClients.toString(), 
            sub: `${leads} new leads waiting`, 
            icon: Users, 
            color: 'text-primary-600 dark:text-primary-400', 
            bg: 'bg-primary-100 dark:bg-primary-900/20' 
          },
          { 
            label: 'Adherence Rate', 
            value: '92%', 
            sub: 'Workout completion', 
            icon: Activity, 
            color: 'text-rose-600 dark:text-rose-400', 
            bg: 'bg-rose-100 dark:bg-rose-900/20' 
          },
          { 
            label: 'Lead Pipeline', 
            value: leads.toString(), 
            sub: 'High intent leads', 
            icon: TrendingUp, 
            color: 'text-amber-600 dark:text-amber-400', 
            bg: 'bg-amber-100 dark:bg-amber-900/20' 
          },
        ].map((stat, i) => (
          <div key={i} className="glass-panel rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.value.includes('+') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'} dark:bg-white/5 dark:text-slate-300`}>
                Live
              </span>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{stat.label}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs font-medium text-slate-400">
                <TrendingUp size={12} className="text-green-500" /> {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Trajectory</h3>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1.5 text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500">
                <option>Last 6 Months</option>
                <option>Year to Date</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} prefix="$" />
                <Tooltip 
                  contentStyle={{
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                      color: isDarkMode ? '#fff' : '#000',
                      padding: '12px'
                  }} 
                />
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    activeDot={{r: 6, strokeWidth: 0, fill: '#fff'}}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm backdrop-blur-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="space-y-4 flex-1">
            <button 
                onClick={() => setActiveAction('workout')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-500/30 transition-all group"
            >
              <span className="block font-bold text-slate-900 dark:text-white">Assign Program</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">Deploy workout to client &rarr;</span>
            </button>
            <button 
                onClick={() => setActiveAction('invoice')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-500/30 transition-all group"
            >
              <span className="block font-bold text-slate-900 dark:text-white">Create Invoice</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">Generate Stripe link &rarr;</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Feed</h3>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
             <div className="space-y-4">
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Bell size={14} />
                 </div>
                 <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">New Lead: Sarah K.</p>
                    <p className="text-xs text-slate-500">2 minutes ago</p>
                 </div>
               </div>
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                    <DollarSign size={14} />
                 </div>
                 <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Payment Received</p>
                    <p className="text-xs text-slate-500">1 hour ago</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modals remain functionally same, just styled */}
      {activeAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {activeAction === 'workout' ? 'Assign Workout' : 'Create Invoice'}
                    </h2>
                    <button onClick={() => setActiveAction(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Client</label>
                        <select 
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                        >
                            <option value="">-- Choose client --</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {activeAction === 'workout' ? (
                        <div>
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Program</label>
                             <select 
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                             >
                                <option value="">-- Choose program --</option>
                                {blueprint.suggestedPrograms.map(p => <option key={p} value={p}>{p}</option>)}
                             </select>
                        </div>
                    ) : (
                        <div>
                             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount ($)</label>
                             <input 
                                type="number"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="97.00"
                                value={invoiceAmount}
                                onChange={(e) => setInvoiceAmount(e.target.value)}
                             />
                        </div>
                    )}
                    
                    <button 
                        onClick={activeAction === 'workout' ? handleAssignWorkout : handleCreateInvoice}
                        disabled={!selectedClientId || (activeAction === 'workout' ? !selectedProgram : !invoiceAmount)}
                        className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-500 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/25"
                    >
                        {activeAction === 'workout' ? 'Deploy Plan' : 'Generate Link'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;