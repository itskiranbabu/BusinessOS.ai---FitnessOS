import React, { useState } from 'react';
import { BusinessBlueprint, Lead } from '../types';
import { Check, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';

interface PublicSiteProps {
  blueprint: BusinessBlueprint;
}

const PublicSite: React.FC<PublicSiteProps> = ({ blueprint }) => {
  const { websiteData } = blueprint;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // NEW STATE
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    storageService.trackEvent({
      id: Math.random().toString(36).substr(2, 9),
      type: 'page_view',
      createdAt: new Date().toISOString()
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setLoading(true);
    try {
      const newLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone, // SAVE PHONE
        status: 'New',
        createdAt: new Date().toISOString(),
        source: 'Website Capture'
      };
      await storageService.saveLead(newLead);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to join. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 animate-fade-in">
      <div className="bg-[#020617] text-slate-400 text-center py-3 text-xs uppercase tracking-widest font-bold border-b border-white/5">
        Powered by BusinessOS.ai
      </div>

      <header className="px-6 py-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="text-2xl font-extrabold tracking-tight text-slate-900">{blueprint.businessName}</div>
        <button 
            onClick={() => document.getElementById('join-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
        >
            {websiteData.ctaText}
        </button>
      </header>

      <section className="py-24 px-6 md:px-12 text-center max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] text-slate-900 tracking-tight">
            {websiteData.heroHeadline}
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            {websiteData.heroSubhead}
        </p>
        <button 
            onClick={() => document.getElementById('join-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-indigo-600 text-white px-10 py-5 rounded-full text-lg font-bold shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-transform"
        >
            {websiteData.ctaText}
        </button>
      </section>

      {/* Pricing Section - Simplified for brevity */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">Plans & Pricing</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {websiteData.pricing.map((plan, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                        <div className="text-4xl font-extrabold text-indigo-600 mb-6">{plan.price}</div>
                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Get Started</button>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Lead Capture Form with Phone */}
      <section id="join-form" className="py-24 bg-[#020617] text-white px-6">
        <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-900/50">
                <Sparkles size={40} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to transform?</h2>
            <p className="text-xl text-slate-400 mb-12">Join the waitlist for {blueprint.suggestedPrograms[0]} and get exclusive early access.</p>

            {submitted ? (
                <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl animate-slide-up">
                    <div className="flex flex-col items-center gap-4 text-green-400">
                        <CheckCircle2 size={48} className="mb-2" />
                        <h3 className="text-2xl font-bold text-white">Application Received!</h3>
                        <p className="text-lg">We'll be in touch shortly.</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white/5 p-8 md:p-10 rounded-[2rem] border border-white/10 backdrop-blur-xl text-left space-y-6 shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2 ml-1 text-slate-300">First Name</label>
                            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all placeholder:text-slate-600" placeholder="e.g. John" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 ml-1 text-slate-300">Email Address</label>
                            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all placeholder:text-slate-600" placeholder="john@example.com" />
                        </div>
                    </div>
                    {/* NEW PHONE FIELD */}
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1 text-slate-300">Phone Number (Optional)</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all placeholder:text-slate-600" placeholder="+1 (555) 000-0000" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] disabled:opacity-70">
                        {loading ? 'Processing...' : <>Join Waitlist <Send size={20} /></>}
                    </button>
                </form>
            )}
        </div>
      </section>

      <footer className="py-12 text-center text-slate-500 text-sm bg-[#020617] border-t border-white/5">
        &copy; {new Date().getFullYear()} {blueprint.businessName}. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicSite;
