
import React, { useState } from 'react';
import { BusinessBlueprint, WebsiteData } from '../types';
import { Monitor, Smartphone, ExternalLink, Check, Edit2, Save, Send, Loader2, Globe } from 'lucide-react';

interface WebsiteBuilderProps {
  blueprint: BusinessBlueprint;
  onUpdate: (data: Partial<WebsiteData>) => void;
  onCaptureLead?: (email: string) => void;
}

const WebsiteBuilder: React.FC<WebsiteBuilderProps> = ({ blueprint, onUpdate, onCaptureLead }) => {
  const { websiteData } = blueprint;
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
        // Generate a clean slug
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`preview-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Website Builder</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your high-converting funnel is ready to launch.</p>
        </div>
        <div className="flex gap-2 items-center">
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 flex gap-1 mr-2">
                <button 
                    onClick={() => setViewMode('desktop')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'desktop' ? 'bg-slate-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Monitor size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('mobile')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'mobile' ? 'bg-slate-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Smartphone size={18} />
                </button>
           </div>

           {isEditing ? (
             <>
                <button onClick={handleCancel} className="px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/30 transition-all">
                  <Save size={18} /> Save Changes
                </button>
             </>
           ) : (
             <button onClick={() => setIsEditing(true)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all">
                <Edit2 size={18} /> Edit Content
             </button>
           )}
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2 self-center hidden sm:block"></div>
          
          {websiteData.publishedUrl ? (
             <a href={websiteData.publishedUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-600/30 transition-all hover:translate-y-[-1px]">
                <Globe size={18} /> Live
             </a>
          ) : (
             <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 flex items-center gap-2 shadow-lg shadow-primary-600/30 transition-all hover:translate-y-[-1px] disabled:opacity-70"
             >
                {isPublishing ? <Loader2 className="animate-spin" size={18} /> : <ExternalLink size={18} />}
                {isPublishing ? 'Publishing...' : 'Publish'}
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden relative shadow-inner p-4 md:p-8 flex items-center justify-center transition-all">
        {/* Mock Browser Window */}
        <div className={`bg-white w-full h-full shadow-2xl overflow-y-auto transition-all duration-500 ease-in-out scroll-smooth ${viewMode === 'mobile' ? 'max-w-sm rounded-[3rem] border-8 border-slate-900 h-[90%] pb-12 hide-scrollbar' : 'max-w-6xl rounded-xl'}`}>
          {/* Header */}
          <header className={`px-8 py-5 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10 ${viewMode === 'mobile' ? 'px-4 py-3' : ''}`}>
            <div className={`font-bold text-slate-900 ${viewMode === 'mobile' ? 'text-lg' : 'text-xl'}`}>{blueprint.businessName}</div>
            {viewMode === 'desktop' && (
                <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600 cursor-pointer">
                <a onClick={() => scrollToSection('program')} className="hover:text-primary-600 transition-colors">Program</a>
                <a onClick={() => scrollToSection('stories')} className="hover:text-primary-600 transition-colors">Stories</a>
                <a onClick={() => scrollToSection('pricing')} className="hover:text-primary-600 transition-colors">Pricing</a>
                </nav>
            )}
            <button className={`bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors ${viewMode === 'mobile' ? 'px-3 py-1.5 text-xs' : 'px-5 py-2 text-sm'}`}>
              Login
            </button>
          </header>

          {/* Hero */}
          <section id="preview-hero" className={`text-center mx-auto ${viewMode === 'mobile' ? 'py-12 px-4' : 'py-24 px-8 max-w-5xl'}`}>
            {isEditing ? (
                <div className="space-y-4">
                    <input 
                      type="text" 
                      value={editData.heroHeadline}
                      onChange={(e) => setEditData({...editData, heroHeadline: e.target.value})}
                      className="w-full text-4xl md:text-7xl font-extrabold text-slate-900 text-center border-b-2 border-primary-300 focus:border-primary-600 outline-none bg-transparent"
                    />
                    <textarea 
                      value={editData.heroSubhead}
                      onChange={(e) => setEditData({...editData, heroSubhead: e.target.value})}
                      className="w-full text-lg md:text-2xl text-slate-600 text-center border-b-2 border-primary-300 focus:border-primary-600 outline-none bg-transparent resize-none"
                      rows={3}
                    />
                </div>
            ) : (
                <>
                    <h1 className={`font-extrabold text-slate-900 tracking-tight mb-6 leading-tight ${viewMode === 'mobile' ? 'text-4xl' : 'text-5xl md:text-7xl'}`}>
                    {editData.heroHeadline}
                    </h1>
                    <p className={`text-slate-600 mb-8 mx-auto leading-relaxed ${viewMode === 'mobile' ? 'text-lg' : 'text-xl md:text-2xl max-w-3xl'}`}>
                    {editData.heroSubhead}
                    </p>
                </>
            )}
            
            <button className={`bg-primary-600 text-white rounded-full font-bold shadow-xl shadow-primary-600/40 hover:bg-primary-700 transition-transform hover:-translate-y-1 ${viewMode === 'mobile' ? 'px-6 py-3 text-base w-full' : 'px-8 py-4 text-lg'}`}>
              {editData.ctaText}
            </button>
            <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500">
              {editData.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                  <Check size={16} className="text-green-500" /> {feat}
                </div>
              ))}
            </div>
          </section>

          {/* Lead Capture Section (Functional) */}
          <section id="preview-program" className="py-16 bg-slate-900 text-white text-center px-6">
            <div className="max-w-xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Join the waitlist</h2>
                <p className="text-slate-400 mb-8">Get exclusive access and free tips delivered to your inbox.</p>
                
                {demoSubmitted ? (
                    <div className="bg-green-500/20 text-green-300 p-4 rounded-xl flex items-center justify-center gap-2 animate-fade-in">
                        <Check size={20} /> Thanks! We'll be in touch.
                    </div>
                ) : (
                    <form onSubmit={handleDemoSubmit} className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="email" 
                            placeholder="Enter your email"
                            value={demoEmail}
                            onChange={(e) => setDemoEmail(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                        />
                        <button type="submit" className="bg-primary-600 px-6 py-3 rounded-xl font-bold hover:bg-primary-500 transition-colors flex items-center justify-center gap-2">
                            Join <Send size={18} />
                        </button>
                    </form>
                )}
                <p className="text-xs text-slate-600 mt-4">* This form actually adds a lead to your BusinessOS CRM.</p>
            </div>
          </section>

          {/* Social Proof */}
          <section id="preview-stories" className="py-20 bg-slate-50 border-y border-slate-200">
            <div className={`mx-auto px-8 ${viewMode === 'mobile' ? '' : 'max-w-6xl'}`}>
              <h2 className="text-center text-3xl font-bold text-slate-900 mb-12">Success Stories</h2>
              <div className={`grid gap-8 ${viewMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
                {editData.testimonials.map((test, i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                    <div className="absolute top-8 right-8 text-slate-200 text-6xl font-serif">"</div>
                    <div className="flex text-yellow-400 mb-4 text-lg">★★★★★</div>
                    <p className="text-slate-600 italic mb-6 relative z-10 leading-relaxed text-lg">"{test.quote}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div>
                        <div className="font-bold text-slate-900 text-base">{test.name}</div>
                        <div className="text-sm text-primary-600 font-bold">{test.result}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="preview-pricing" className="py-24 px-8">
             <div className="max-w-5xl mx-auto">
               <h2 className="text-center text-4xl font-bold text-slate-900 mb-16">Simple Pricing</h2>
               <div className={`grid gap-8 items-center ${viewMode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                 {editData.pricing.map((plan, i) => (
                   <div key={i} className={`p-10 rounded-3xl border ${i === 1 ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-100 relative' : 'border-slate-200 bg-white'}`}>
                     {i === 1 && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</div>}
                     <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                     <div className="text-5xl font-extrabold text-slate-900 my-6 tracking-tight">{plan.price}</div>
                     <ul className="space-y-4 mb-10">
                       {plan.features.map((f, j) => (
                         <li key={j} className="flex items-start gap-3 text-base text-slate-600">
                           <Check size={20} className="text-primary-600 mt-0.5" />
                           {f}
                         </li>
                       ))}
                     </ul>
                     <button className={`w-full py-4 rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] ${i === 1 ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/30' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                       Get Started
                     </button>
                   </div>
                 ))}
               </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBuilder;
