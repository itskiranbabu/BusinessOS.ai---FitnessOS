import React, { useEffect, useState } from 'react';
import { marketplaceService } from '../services/marketplaceService';
import { Template, TemplateCategory, ProjectData } from '../types';
import { Search, Download, Star, Filter, ShoppingBag, Layout, Zap, X, Globe, CheckCircle2, ShieldCheck, CreditCard, Eye, DollarSign, Package, Edit, Trash2, Save } from 'lucide-react';

interface MarketplaceProps {
  onInstall: (data: ProjectData) => void;
  currentProject: ProjectData;
}

const Marketplace: React.FC<MarketplaceProps> = ({ onInstall, currentProject }) => {
  const [view, setView] = useState<'marketplace' | 'creator'>('marketplace');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [authoredTemplates, setAuthoredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TemplateCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Admin State
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: 0 });

  const loadData = async () => {
      setLoading(true);
      if (view === 'marketplace') {
          const data = await marketplaceService.getTemplates(filter === 'all' ? undefined : filter);
          setTemplates(data);
      } else {
          const data = await marketplaceService.getAuthoredTemplates();
          setAuthoredTemplates(data);
      }
      setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filter, view]);

  const handleInstallClick = (template: Template) => {
    setSelectedTemplate(template);
  };

  const confirmInstall = async () => {
    if (!selectedTemplate) return;
    if (selectedTemplate.price > 0) alert("Redirecting to Stripe Checkout... (Simulated)");
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
      const price = parseFloat(priceStr || "0") * 100;

      setPublishing(true);
      await marketplaceService.publishTemplate(currentProject, {
          title,
          description: "Published from BusinessOS",
          niche: currentProject.blueprint.niche,
          price
      });
      setPublishing(false);
      alert("Template published!");
      loadData(); // Refresh list
  };

  // Admin Functions
  const openEditModal = (template: Template) => {
      setEditingTemplate(template);
      setEditForm({ 
          title: template.title, 
          description: template.description, 
          price: template.price / 100 
      });
  };

  const handleSaveEdit = async () => {
      if (!editingTemplate) return;
      await marketplaceService.updateTemplate(editingTemplate.id, {
          title: editForm.title,
          description: editForm.description,
          price: editForm.price * 100
      });
      setEditingTemplate(null);
      loadData();
  };

  const handleDelete = async (id: string) => {
      if (confirm("Are you sure you want to delete this template? This cannot be undone.")) {
          await marketplaceService.deleteTemplate(id);
          loadData();
      }
  };

  const filtered = templates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const recommended = templates.filter(t => t.niche.toLowerCase().includes(currentProject.blueprint.niche.split(' ')[0].toLowerCase()));
  const totalRevenue = authoredTemplates.reduce((acc, t) => acc + (t.install_count * t.price), 0);
  const totalInstalls = authoredTemplates.reduce((acc, t) => acc + t.install_count, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-primary-500" /> {view === 'marketplace' ? 'System Store' : 'Creator Dashboard'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
              {view === 'marketplace' ? 'Discover systems to scale your business.' : 'Manage your products and revenue.'}
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button onClick={() => setView('marketplace')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'marketplace' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Browse</button>
            <button onClick={() => setView('creator')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'creator' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Selling</button>
        </div>
      </div>

      {view === 'marketplace' ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {[{ id: 'all', label: 'All', icon: Filter }, { id: 'full_system', label: 'Systems', icon: Layout }, { id: 'funnel', label: 'Funnels', icon: Filter }, { id: 'automation', label: 'Automations', icon: Zap }].map(cat => (
                        <button key={cat.id} onClick={() => setFilter(cat.id as any)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === cat.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <cat.icon size={16} /> {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {recommended.length > 0 && !searchTerm && filter === 'all' && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Zap size={18} className="text-yellow-500" /> Recommended for {currentProject.blueprint.niche}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommended.map(template => <TemplateCard key={template.id} template={template} onClick={handleInstallClick} />)}
                    </div>
                </div>
            )}

            {loading ? <div className="text-center py-20 text-slate-500">Loading...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(template => <TemplateCard key={template.id} template={template} onClick={handleInstallClick} />)}
                </div>
            )}
          </>
      ) : (
          <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider"><DollarSign size={16} /> Total Revenue</div>
                      <div className="text-4xl font-bold mt-2">${(totalRevenue/100).toLocaleString()}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider"><Download size={16} /> Total Installs</div>
                      <div className="text-4xl font-bold text-slate-900 dark:text-white mt-2">{totalInstalls}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-center">
                        <button onClick={handlePublish} disabled={publishing} className="bg-primary-600 text-white w-full h-full rounded-xl text-lg font-bold hover:bg-primary-700 transition-all flex flex-col items-center justify-center gap-2">
                            <Package size={24} /> {publishing ? 'Publishing...' : 'Publish New Template'}
                        </button>
                  </div>
              </div>

              <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Listings</h2>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                              <tr>
                                  <th className="px-6 py-4">Template Name</th>
                                  <th className="px-6 py-4">Price</th>
                                  <th className="px-6 py-4">Installs</th>
                                  <th className="px-6 py-4">Rating</th>
                                  <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {authoredTemplates.map(t => (
                                  <tr key={t.id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                      <td className="px-6 py-4">{t.title}</td>
                                      <td className="px-6 py-4">{t.price === 0 ? 'Free' : `$${t.price/100}`}</td>
                                      <td className="px-6 py-4">{t.install_count}</td>
                                      <td className="px-6 py-4 flex items-center gap-1"><Star size={12} fill="currentColor" className="text-yellow-500"/> {t.rating}</td>
                                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                                          <button onClick={() => openEditModal(t)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded"><Edit size={16} /></button>
                                          <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded"><Trash2 size={16} /></button>
                                      </td>
                                  </tr>
                              ))}
                              {authoredTemplates.length === 0 && (
                                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">You haven't published anything yet.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* EDIT MODAL */}
      {editingTemplate && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-700">
                  <h2 className="text-xl font-bold text-white mb-4">Edit Template</h2>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm text-slate-400 mb-1">Title</label>
                          <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm text-slate-400 mb-1">Price ($)</label>
                          <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" value={editForm.price} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                          <label className="block text-sm text-slate-400 mb-1">Description</label>
                          <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                          <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                          <button onClick={handleSaveEdit} className="bg-primary-600 text-white px-4 py-2 rounded font-bold hover:bg-primary-500 flex items-center gap-2"><Save size={16} /> Save</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* PREVIEW MODAL */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-950 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">{selectedTemplate.title} {selectedTemplate.verified && <CheckCircle2 size={20} className="text-blue-500" title="Verified" />}</h2>
                            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded border border-primary-200 dark:border-primary-800 uppercase tracking-wide">{selectedTemplate.category.replace('_', ' ')}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl">{selectedTemplate.description}</p>
                    </div>
                    <button onClick={() => setSelectedTemplate(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Globe size={16} className="text-primary-500" /> Website Structure</h3>
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Headline</span><span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px] truncate">{selectedTemplate.config.blueprint.websiteData.heroHeadline}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">CTA</span><span className="font-medium text-slate-900 dark:text-white">{selectedTemplate.config.blueprint.websiteData.ctaText}</span></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Included Automations</h3>
                            <div className="space-y-2">
                                {selectedTemplate.config.automations.map(auto => (
                                    <div key={auto.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
                                        <div className="bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 p-1.5 rounded"><Zap size={14} /></div>
                                        <div><div className="text-sm font-bold text-slate-900 dark:text-white">{auto.name}</div><div className="text-xs text-slate-500 dark:text-slate-400">{auto.trigger}</div></div>
                                    </div>
                                ))}
                                {selectedTemplate.config.automations.length === 0 && <div className="text-sm text-slate-500">No pre-built automations.</div>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                    <button onClick={() => setSelectedTemplate(null)} className="px-5 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                    <button onClick={confirmInstall} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-500 shadow-lg shadow-primary-600/30 flex items-center gap-2 transition-all hover:scale-105">{selectedTemplate.price === 0 ? <>Install System <Download size={18} /></> : <>Purchase ${selectedTemplate.price/100} <CreditCard size={18} /></>}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const TemplateCard: React.FC<{ template: Template; onClick: (t: Template) => void }> = ({ template, onClick }) => (
    <div onClick={() => onClick(template)} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 flex flex-col cursor-pointer">
        <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-950 relative overflow-hidden flex items-center justify-center">
            <div className="text-primary-500 opacity-20 transform group-hover:scale-110 transition-transform duration-500">{template.category === 'automation' ? <Zap size={64} /> : <Layout size={64} />}</div>
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded border border-white/10">{template.price === 0 ? 'FREE' : `$${(template.price / 100).toFixed(0)}`}</div>
            {template.verified && <div className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg"><CheckCircle2 size={10} /> VERIFIED</div>}
        </div>
        <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider bg-primary-50 dark:bg-primary-900/10 px-2 py-0.5 rounded border border-primary-100 dark:border-primary-900/20">{template.niche}</span>
                <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold"><Star size={12} fill="currentColor" /> {template.rating}</div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{template.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{template.description}</p>
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                <div className="flex items-center gap-1 text-xs text-slate-400"><Download size={14} /> {template.install_count} • <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">v{template.version}</span></div>
                <button className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1 bg-primary-50 dark:bg-primary-900/10 px-3 py-1.5 rounded-lg transition-colors">{template.price === 0 ? 'Install' : 'Buy'} <Eye size={16} /></button>
            </div>
        </div>
    </div>
);

export default Marketplace;
