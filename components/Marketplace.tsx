
import React, { useEffect, useState } from 'react';
import { marketplaceService } from '../services/marketplaceService';
import { Template, TemplateCategory, ProjectData } from '../types';
import { Search, Download, Star, Filter, ShoppingBag, Layout, Zap, X, Globe, CheckCircle2, ShieldCheck, CreditCard, Eye } from 'lucide-react';

interface MarketplaceProps {
  onInstall: (data: ProjectData) => void;
  currentProject: ProjectData;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onInstall, currentProject }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TemplateCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await marketplaceService.getTemplates(filter === 'all' ? undefined : filter);
      setTemplates(data);
      setLoading(false);
    };
    load();
  }, [filter]);

  const handleInstallClick = (template: Template) => {
    setSelectedTemplate(template);
  };

  const confirmInstall = async () => {
    if (!selectedTemplate) return;
    
    if (selectedTemplate.price > 0) {
        alert("Redirecting to Stripe Checkout... (Simulated)");
        // In real app: Redirect to Stripe, then callback installs template
    }
    
    const config = await marketplaceService.installTemplate(selectedTemplate.id);
    if (config) {
        onInstall(config);
        setSelectedTemplate(null);
    }
  };

  const handlePublish = async () => {
      const title = prompt("Name your template:");
      if (!title) return;
      
      const priceStr = prompt("Price in USD (Enter 0 for free):", "0");
      const price = parseFloat(priceStr || "0") * 100; // Convert to cents

      setPublishing(true);
      const success = await marketplaceService.publishTemplate(currentProject, {
          title,
          description: "Published from BusinessOS",
          niche: currentProject.blueprint.niche,
          price
      });
      setPublishing(false);
      
      if (success) alert("Template published to Marketplace!");
      else alert("Failed to publish. Check console.");
  };

  const filtered = templates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-primary-500" /> Marketplace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Discover systems to scale your business.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handlePublish}
                disabled={publishing}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
            >
                {publishing ? 'Publishing...' : 'Publish Your System'}
            </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
                { id: 'all', label: 'All', icon: Filter },
                { id: 'full_system', label: 'Systems', icon: Layout },
                { id: 'funnel', label: 'Funnels', icon: Filter },
                { id: 'automation', label: 'Automations', icon: Zap },
            ].map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        filter === cat.id 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                    <cat.icon size={16} /> {cat.label}
                </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
          <div className="text-center py-20 text-slate-500">Loading marketplace...</div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(template => (
                <div key={template.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 flex flex-col">
                    <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-950 relative overflow-hidden flex items-center justify-center">
                        <div className="text-primary-500 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
                            {template.category === 'automation' ? <Zap size={64} /> : <Layout size={64} />}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded border border-white/10">
                            {template.price === 0 ? 'FREE' : `$${(template.price / 100).toFixed(0)}`}
                        </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider bg-primary-50 dark:bg-primary-900/10 px-2 py-0.5 rounded border border-primary-100 dark:border-primary-900/20">
                                {template.niche}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                                <Star size={12} fill="currentColor" /> {template.rating}
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{template.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                            {template.description}
                        </p>

                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Download size={14} /> {template.install_count} installs
                            </div>
                            <button 
                                onClick={() => handleInstallClick(template)}
                                className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 bg-primary-50 dark:bg-primary-900/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                {template.price === 0 ? 'Install' : 'Buy Now'} <Eye size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
          </div>
      )}

      {/* PREVIEW MODAL */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-950 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTemplate.title}</h2>
                            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded border border-primary-200 dark:border-primary-800 uppercase tracking-wide">
                                {selectedTemplate.category.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl">{selectedTemplate.description}</p>
                    </div>
                    <button onClick={() => setSelectedTemplate(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    {/* Feature 1: Website */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Globe size={16} className="text-primary-500" /> Website Structure
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Headline</span>
                                    <span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px] truncate">{selectedTemplate.config.blueprint.websiteData.heroHeadline}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">CTA</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{selectedTemplate.config.blueprint.websiteData.ctaText}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Urgency</span>
                                    <span className="font-medium text-green-500">{selectedTemplate.config.blueprint.websiteData.urgencySettings?.enabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Automations */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap size={16} className="text-yellow-500" /> Included Automations
                            </h3>
                            <div className="space-y-2">
                                {selectedTemplate.config.automations.map(auto => (
                                    <div key={auto.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
                                        <div className="bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 p-1.5 rounded">
                                            <Zap size={14} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">{auto.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{auto.trigger}</div>
                                        </div>
                                    </div>
                                ))}
                                {selectedTemplate.config.automations.length === 0 && <div className="text-sm text-slate-500">No pre-built automations.</div>}
                            </div>
                        </div>
                    </div>

                    {/* Trust Signals */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-4 flex gap-4 items-center">
                        <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Verified System:</strong> This template has been vetted for quality and includes a complete configuration for CRM, Website, and Automations.
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                    <button 
                        onClick={() => setSelectedTemplate(null)}
                        className="px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmInstall}
                        className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-500 shadow-lg shadow-primary-600/30 flex items-center gap-2 transition-all hover:scale-105"
                    >
                        {selectedTemplate.price === 0 ? (
                            <>Install System <Download size={18} /></>
                        ) : (
                            <>Purchase ${selectedTemplate.price/100} <CreditCard size={18} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
