import React, { useState } from 'react';
import { BusinessBlueprint, WebsiteData } from '../types';
import { Monitor, Smartphone, ExternalLink, Check, Edit2, Save, Send, Loader2, Globe, Layout, Type, UserCircle, HelpCircle, DollarSign, Clock, Plus, Trash2 } from 'lucide-react';

interface WebsiteBuilderProps {
  blueprint: BusinessBlueprint;
  onUpdate: (data: Partial<WebsiteData>) => void;
  onCaptureLead?: (email: string) => void;
}

const WebsiteBuilder: React.FC<WebsiteBuilderProps> = ({ blueprint, onUpdate, onCaptureLead }) => {
  const { websiteData } = blueprint;
  const [activeTab, setActiveTab] = useState<'hero' | 'problem' | 'solution' | 'bio' | 'testimonials' | 'pricing' | 'faq'>('hero');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<WebsiteData>(websiteData);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  React.useEffect(() => {
    if (!isEditing) {
      setEditData(websiteData);
    }
  }, [websiteData, isEditing]);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(websiteData);
    setIsEditing(false);
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
        const slug = blueprint.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const publicUrl = `${window.location.origin}/p/${slug}`;
        onUpdate({ publishedUrl: publicUrl });
        setIsPublishing(false);
        window.open(publicUrl, '_blank');
    }, 1500);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoEmail && onCaptureLead) {
        onCaptureLead(demoEmail);
        setDemoSubmitted(true);
        setTimeout(() => {
            setDemoSubmitted(false);
            setDemoEmail('');
        }, 3000);
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero', icon: Layout },
    { id: 'problem', label: 'Problem', icon: HelpCircle },
    { id: 'solution', label: 'Solution', icon: Check },
    { id: 'bio', label: 'Bio', icon: UserCircle },
    { id: 'testimonials', label: 'Proof', icon: Type },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const updateTestimonial = (index: number, field: string, value: string) => {
      const newTestimonials = [...editData.testimonials];
      newTestimonials[index] = { ...newTestimonials[index], [field]: value };
      setEditData({ ...editData, testimonials: newTestimonials });
  };

  const updatePricing = (index: number, field: string, value: string) => {
      const newPricing = [...editData.pricing];
      if (field === 'features') {
          newPricing[index] = { ...newPricing[index], features: value.split(',').map(s => s.trim()) };
      } else {
          newPricing[index] = { ...newPricing[index], [field]: value };
      }
      setEditData({ ...editData, pricing: newPricing });
  };

  const updateFaq = (index: number, field: string, value: string) => {
      const newFaq = [...editData.faq];
      newFaq[index] = { ...newFaq[index], [field]: value };
      setEditData({ ...editData, faq: newFaq });
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      {/* Header Toolbar */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Funnel Builder 2.0</h1>
          <p className="text-slate-400 text-xs mt-0.5">High-conversion sales page editor.</p>
        </div>
        <div className="flex gap-3 items-center">
           <div className="bg-slate-800 border border-slate-700 rounded-lg p-1 flex gap-1">
                <button 
                    onClick={() => setViewMode('desktop')}
                    className={`p-2 rounded transition-colors ${viewMode === 'desktop' ? 'bg-slate-700 text-primary-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <Monitor size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('mobile')}
                    className={`p-2 rounded transition-colors ${viewMode === 'mobile' ? 'bg-slate-700 text-primary-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <Smartphone size={16} />
                </button>
           </div>

           {isEditing ? (
             <>
                <button onClick={handleCancel} className="px-3 py-2 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-500 flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all">
                  <Save size={16} /> Save
                </button>
             </>
           ) : (
             <button onClick={() => setIsEditing(true)} className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2 transition-all">
                <Edit2 size={16} /> Edit Page
             </button>
           )}
          
          <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>
          
          {websiteData.publishedUrl ? (
             <a href={websiteData.publishedUrl} target="_blank" rel="noopener noreferrer" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-500 flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">
                <Globe size={16} /> Live Site
             </a>
          ) : (
             <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-2 shadow-lg transition-all disabled:opacity-70"
             >
                {isPublishing ? <Loader2 className="animate-spin" size={16} /> : <ExternalLink size={16} />}
                {isPublishing ? 'Publishing...' : 'Publish'}
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Editor Sidebar */}
        {isEditing && (
            <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shrink-0 animate-fade-in">
                <div className="flex overflow-x-auto md:flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'bg-slate-800 text-primary-400 border-l-2 border-primary-500' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                    {activeTab === 'hero' && (
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase">Headline</label>
                            <textarea 
                                value={editData.heroHeadline}
                                onChange={e => setEditData({...editData, heroHeadline: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none"
                                rows={3}
                            />
                            <label className="text-xs font-bold text-slate-500 uppercase">Subhead</label>
                            <textarea 
                                value={editData.heroSubhead}
                                onChange={e => setEditData({...editData, heroSubhead: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none"
                                rows={3}
                            />
                            <label className="text-xs font-bold text-slate-500 uppercase">CTA Text</label>
                            <input 
                                value={editData.ctaText}
                                onChange={e => setEditData({...editData, ctaText: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none"
                            />
                        </div>
                    )}
                    {activeTab === 'problem' && (
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase">The Pain Point</label>
                            <textarea 
                                value={editData.problem || ''}
                                onChange={e => setEditData({...editData, problem: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none"
                                rows={6}
                                placeholder="Describe the problem your client faces..."
                            />
                        </div>
                    )}
                     {activeTab === 'solution' && (
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase">The Solution</label>
                            <textarea 
                                value={editData.solution || ''}
                                onChange={e => setEditData({...editData, solution: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none"
                                rows={6}
                                placeholder="Describe your unique mechanism..."
                            />
                            <label className="text-xs font-bold text-slate-500 uppercase mt-4">Feature List</label>
                            <div className="space-y-2">
                                {editData.features.map((feature, i) => (
                                    <input 
                                        key={i}
                                        value={feature}
                                        onChange={e => {
                                            const newFeatures = [...editData.features];
                                            newFeatures[i] = e.target.value;
                                            setEditData({...editData, features: newFeatures});
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-primary-500 outline-none"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'bio' && (
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase">Coach Name</label>
                            <input 
                                value={editData.coachBio?.name || ''}
                                onChange={e => setEditData({
                                    ...editData, 
                                    coachBio: {
                                        ...(editData.coachBio || { name: '', headline: '', story: '' }), 
                                        name: e.target.value
                                    }
                                })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none"
                            />
                             <label className="text-xs font-bold text-slate-500 uppercase">Headline</label>
                            <input 
                                value={editData.coachBio?.headline || ''}
                                onChange={e => setEditData({
                                    ...editData, 
                                    coachBio: {
                                        ...(editData.coachBio || { name: '', headline: '', story: '' }), 
                                        headline: e.target.value
                                    }
                                })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none"
                            />
                            <label className="text-xs font-bold text-slate-500 uppercase">Story</label>
                            <textarea 
                                value={editData.coachBio?.story || ''}
                                onChange={e => setEditData({
                                    ...editData, 
                                    coachBio: {
                                        ...(editData.coachBio || { name: '', headline: '', story: '' }), 
                                        story: e.target.value
                                    }
                                })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-primary-500 outline-none"
                                rows={5}
                            />
                        </div>
                    )}
                    {activeTab === 'testimonials' && (
                         <div className="space-y-6">
                            {editData.testimonials.map((test, i) => (
                                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Name</label>
                                    <input 
                                        value={test.name}
                                        onChange={e => updateTestimonial(i, 'name', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm mb-3"
                                    />
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Result</label>
                                    <input 
                                        value={test.result}
                                        onChange={e => updateTestimonial(i, 'result', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm mb-3"
                                    />
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Quote</label>
                                    <textarea 
                                        value={test.quote}
                                        onChange={e => updateTestimonial(i, 'quote', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                        rows={2}
                                    />
                                </div>
                            ))}
                         </div>
                    )}
                    {activeTab === 'pricing' && (
                        <div className="space-y-6">
                            {editData.pricing.map((plan, i) => (
                                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Plan Name</label>
                                    <input 
                                        value={plan.name}
                                        onChange={e => updatePricing(i, 'name', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm mb-3"
                                    />
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Price</label>
                                    <input 
                                        value={plan.price}
                                        onChange={e => updatePricing(i, 'price', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm mb-3"
                                    />
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Features (comma separated)</label>
                                    <textarea 
                                        value={plan.features.join(', ')}
                                        onChange={e => updatePricing(i, 'features', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                        rows={3}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'faq' && (
                        <div className="space-y-6">
                            {editData.faq.map((item, i) => (
                                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Question</label>
                                    <textarea 
                                        value={item.question}
                                        onChange={e => updateFaq(i, 'question', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm mb-3"
                                        rows={2}
                                    />
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Answer</label>
                                    <textarea 
                                        value={item.answer}
                                        onChange={e => updateFaq(i, 'answer', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                        rows={3}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 bg-slate-200 dark:bg-black rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden relative shadow-inner p-4 md:p-8 flex items-center justify-center transition-all">
            <div className={`bg-white w-full h-full shadow-2xl overflow-y-auto transition-all duration-500 ease-in-out scroll-smooth ${viewMode === 'mobile' ? 'max-w-sm rounded-[3rem] border-8 border-slate-900 h-[90%] pb-12 hide-scrollbar' : 'max-w-6xl rounded-xl'}`}>
                
                {/* PREVIEW CONTENT */}
                
                {/* Navbar */}
                <header className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-20">
                    <div className="font-bold text-slate-900">{blueprint.businessName}</div>
                    {viewMode === 'desktop' && (
                        <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800">
                            Apply Now
                        </button>
                    )}
                </header>

                {/* Hero */}
                <section className="py-20 px-6 text-center max-w-4xl mx-auto">
                    {editData.urgencySettings?.enabled && (
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-red-100 animate-pulse">
                            <Clock size={12} /> {editData.urgencySettings.bannerText}
                        </div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                        {editData.heroHeadline}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                        {editData.heroSubhead}
                    </p>
                    <button className="bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary-600/30 hover:scale-105 transition-transform">
                        {editData.ctaText}
                    </button>
                </section>

                {/* Problem / Agitation */}
                {editData.problem && (
                    <section className="py-16 px-6 bg-slate-50 border-y border-slate-100">
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">The Problem</h2>
                            <p className="text-xl md:text-2xl font-serif italic text-slate-800 leading-relaxed">
                                "{editData.problem}"
                            </p>
                        </div>
                    </section>
                )}

                {/* Solution */}
                {editData.solution && (
                    <section className="py-16 px-6 bg-white">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">The Solution</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                {editData.solution}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                                {editData.features.slice(0,3).map((f, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <Check className="text-green-500 mb-2" />
                                        <p className="font-medium text-slate-900">{f}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Bio */}
                {editData.coachBio && (
                    <section className="py-16 px-6 bg-slate-900 text-white">
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                            <div className="w-32 h-32 md:w-48 md:h-48 bg-slate-700 rounded-full shrink-0 flex items-center justify-center text-4xl font-bold text-slate-500">
                                {editData.coachBio.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Meet {editData.coachBio.name}</h3>
                                <p className="text-primary-400 font-medium mb-4">{editData.coachBio.headline}</p>
                                <p className="text-slate-300 leading-relaxed">{editData.coachBio.story}</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Pricing */}
                <section className="py-20 px-6 bg-white">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Investment</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                             {editData.pricing.map((plan, i) => (
                                <div key={i} className="p-8 border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <div className="text-4xl font-extrabold mb-6">{plan.price}</div>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f, j) => (
                                            <li key={j} className="flex gap-2 text-sm text-slate-600">
                                                <Check size={16} className="text-green-500 mt-0.5" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800">
                                        Choose Plan
                                    </button>
                                </div>
                             ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                {editData.faq && editData.faq.length > 0 && (
                    <section className="py-16 px-6 bg-slate-50">
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {editData.faq.map((item, i) => (
                                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200">
                                        <h4 className="font-bold text-slate-900 mb-2">{item.question}</h4>
                                        <p className="text-slate-600 text-sm">{item.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section id="join-form" className="py-20 bg-primary-600 text-white text-center px-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform?</h2>
                    <form onSubmit={handleDemoSubmit} className="max-w-md mx-auto flex gap-2">
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={demoEmail}
                            onChange={e => setDemoEmail(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl text-slate-900 outline-none" 
                        />
                        <button className="bg-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-black">
                            {demoSubmitted ? <Check/> : <Send/>}
                        </button>
                    </form>
                </section>

                <footer className="bg-slate-900 text-slate-500 text-center py-8 text-sm">
                    &copy; {blueprint.businessName}
                </footer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBuilder;