
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp, Activity, ArrowUpRight, Save, Check, X } from 'lucide-react';
import { BusinessBlueprint, Client, ClientStatus } from '../types';

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

  // LOGIC: Parse price from blueprint (e.g. "$97/mo" -> 97)
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
  
  // Real-time calculated revenue
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
      // Simulate invoice creation
      const link = `https://buy.stripe.com/test_${Math.random().toString(36).substring(7)}`;
      navigator.clipboard.writeText(link);
      alert(`Invoice created for $${invoiceAmount}! Link copied to clipboard.`);
      setActiveAction(null);
      setSelectedClientId('');
      setInvoiceAmount('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Performance metrics for <span className="font-semibold text-primary-600 dark:text-primary-400">{blueprint.businessName}</span>
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
           >
             {isSaving ? <Check size={18} className="text-green-500" /> : <Save size={18} />}
             {isSaving ? 'Saved' : 'Save Project'}
           </button>
           <button className="flex-1 md:flex-none bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 transition-all hover:translate-y-[-1px]">
             <ArrowUpRight size={18} /> New Client
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Revenue', 
            value: `$${currentRevenue.toLocaleString()}`, 
            sub: 'Based on active subs', 
            icon: DollarSign, 
            color: 'text-green-600 dark:text-green-400', 
            bg: 'bg-green-100 dark:bg-green-900/30' 
          },
          { 
            label: 'Active Clients', 
            value: activeClients.toString(), 
            sub: `${leads} leads pending`, 
            icon: Users, 
            color: 'text-primary-600 dark:text-primary-400', 
            bg: 'bg-primary-100 dark:bg-primary-900/30' 
          },
          { 
            label: 'Completion Rate', 
            value: '92%', 
            sub: 'Workout adherence', 
            icon: Activity, 
            color: 'text-purple-600 dark:text-purple-400', 
            bg: 'bg-purple-100 dark:bg-purple-900/30' 
          },
          { 
            label: 'Leads Pipeline', 
            value: leads.toString(), 
            sub: 'Warm leads', 
            icon: TrendingUp, 
            color: 'text-orange-600 dark:text-orange-400', 
            bg: 'bg-orange-100 dark:bg-orange-900/30' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-3 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 flex items-center gap-1">
                <TrendingUp size={14} className="text-green-500" />
                {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h3>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1 text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500">
                <option>Last 6 Months</option>
                <option>Last Year</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} prefix="$" />
                <Tooltip 
                  contentStyle={{
                      borderRadius: '12px', 
                      border: isDarkMode ? '1px solid #334155' : 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                      color: isDarkMode ? '#fff' : '#000'
                  }} 
                />
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    activeDot={{r: 6, strokeWidth: 0}}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="space-y-4 flex-1">
            <button 
                onClick={() => setActiveAction('workout')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all group relative overflow-hidden"
            >
              <div className="relative z-10">
                <span className="block font-semibold text-slate-900 dark:text-white">Create Workout Plan</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Assign to client &rarr;</span>
              </div>
            </button>
            <button 
                onClick={() => setActiveAction('invoice')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
            >
              <span className="block font-semibold text-slate-900 dark:text-white">Send Payment Link</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Create Stripe Invoice &rarr;</span>
            </button>
            <button className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
              <span className="block font-semibold text-slate-900 dark:text-white">Generate Content</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Use AI Assistant &rarr;</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Pending Tasks</h3>
             <div className="space-y-4">
               <div className="flex items-center gap-3 group cursor-pointer">
                 <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-white group-hover:border-primary-500 peer-checked:bg-primary-500 transition-colors"></div>
                 <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 line-through opacity-50">Onboard new client (Mike)</span>
               </div>
               <div className="flex items-center gap-3 group cursor-pointer">
                 <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-white group-hover:border-primary-500 peer-checked:bg-primary-500 transition-colors"></div>
                 <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Review Sarah's form check video</span>
               </div>
               <div className="flex items-center gap-3 group cursor-pointer">
                 <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-white group-hover:border-primary-500 peer-checked:bg-primary-500 transition-colors"></div>
                 <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Update pricing on website</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Action Modals */}
      {activeAction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {activeAction === 'workout' ? 'Assign Workout Plan' : 'Send Invoice'}
                    </h2>
                    <button onClick={() => setActiveAction(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Client</label>
                        <select 
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                        >
                            <option value="">-- Choose a client --</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {activeAction === 'workout' ? (
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Program</label>
                             <select 
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                             >
                                <option value="">-- Choose a program --</option>
                                {blueprint.suggestedPrograms.map(p => <option key={p} value={p}>{p}</option>)}
                                <option value="Custom">Custom Plan...</option>
                             </select>
                        </div>
                    ) : (
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount ($)</label>
                             <input 
                                type="number"
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                                placeholder="97.00"
                                value={invoiceAmount}
                                onChange={(e) => setInvoiceAmount(e.target.value)}
                             />
                        </div>
                    )}
                    
                    <button 
                        onClick={activeAction === 'workout' ? handleAssignWorkout : handleCreateInvoice}
                        disabled={!selectedClientId || (activeAction === 'workout' ? !selectedProgram : !invoiceAmount)}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {activeAction === 'workout' ? 'Assign Plan' : 'Generate Link'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
