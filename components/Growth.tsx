
import React, { useState } from 'react';
import { AnalyticsEvent, Lead, Client, GrowthPlan, BusinessBlueprint } from '../types';
import { generateGrowthPlan } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Users, Target, Zap, RefreshCw, MessageCircle, ChevronRight, Lightbulb, Sparkles } from 'lucide-react';

interface GrowthProps {
  events: AnalyticsEvent[];
  leads: Lead[];
  clients: Client[];
  blueprint: BusinessBlueprint;
  growthPlan?: GrowthPlan;
  onUpdatePlan: (plan: GrowthPlan) => void;
}

const Growth: React.FC<GrowthProps> = ({ events, leads, clients, blueprint, growthPlan, onUpdatePlan }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Analytics Calculation
  const pageViews = events.filter(e => e.type === 'page_view').length;
  const leadCount = leads.length;
  const clientCount = clients.length;
  const conversionRate = pageViews > 0 ? ((leadCount / pageViews) * 100).toFixed(1) : '0';
  const closeRate = leadCount > 0 ? ((clientCount / leadCount) * 100).toFixed(1) : '0';

  const chartData = [
    { name: 'Views', value: pageViews },
    { name: 'Leads', value: leadCount },
    { name: 'Clients', value: clientCount }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    const plan = await generateGrowthPlan(blueprint.niche, {
        leads: leadCount,
        clients: clientCount,
        conversionRate: conversionRate + '%'
    });
    
    if (plan) {
        onUpdatePlan(plan);
        await storageService.saveGrowthPlan(plan);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Growth Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Analytics & AI-powered scaling strategies.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-primary-600/30 transition-all hover:translate-y-[-1px]"
        >
          <Zap size={18} className={isGenerating ? "animate-spin" : ""} />
          {isGenerating ? 'Analyzing...' : 'Generate AI Growth Plan'}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard label="Total Page Views" value={pageViews} icon={Users} color="blue" />
        <MetricCard label="Leads Captured" value={leadCount} icon={Target} color="purple" />
        <MetricCard label="Site Conversion" value={conversionRate + '%'} icon={TrendingUp} color="green" />
        <MetricCard label="Close Rate" value={closeRate + '%'} icon={Zap} color="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Funnel Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Funnel Performance</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', background: '#1e293b', border: 'none', color: '#fff' }}
                            cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* AI Growth Plan */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

             {!growthPlan ? (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8">
                     <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <Lightbulb size={32} className="text-yellow-400" />
                     </div>
                     <h3 className="text-2xl font-bold mb-2">No Growth Plan Yet</h3>
                     <p className="text-slate-400 max-w-md mx-auto mb-6">
                        Let Gemini analyze your niche ({blueprint.niche}) and your current metrics to generate actionable experiments.
                     </p>
                     <button onClick={handleGenerate} className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                        Generate Strategy
                     </button>
                 </div>
             ) : (
                 <div className="relative z-10 space-y-8">
                     <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Sparkles className="text-yellow-400" /> 
                            Growth Playbook
                        </h2>
                        <span className="text-xs text-slate-400">Generated {new Date(growthPlan.createdAt).toLocaleDateString()}</span>
                     </div>

                     <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recommended Experiments</h3>
                        <div className="grid gap-4">
                            {growthPlan.experiments.map((exp, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-primary-300">{exp.title}</h4>
                                        <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded font-bold">{exp.expectedImpact}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-4">{exp.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {exp.steps.map((step, j) => (
                                            <div key={j} className="flex items-center gap-1 text-xs bg-black/30 px-2 py-1 rounded text-slate-400">
                                                <ChevronRight size={10} /> {step}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>

                     <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Messaging Templates</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {growthPlan.suggestedMessages.map((msg, i) => (
                                <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase">
                                        <MessageCircle size={12} /> {msg.channel} • {msg.context}
                                    </div>
                                    <p className="text-sm text-white italic">"{msg.copy}"</p>
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(msg.copy)}
                                        className="mt-3 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                    >
                                        <RefreshCw size={10} /> Copy Template
                                    </button>
                                </div>
                            ))}
                        </div>
                     </div>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; icon: any; color: string }> = ({ label, value, icon: Icon, color }) => {
    const colors: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
        green: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
    };
    
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

export default Growth;