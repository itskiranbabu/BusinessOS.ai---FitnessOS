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
      {/* Banner */}
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

      {/* Hero */}
      <section className="py-24 px-6 md:px-12 text-center max-w-6xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold mb-8 border border-indigo-100">
            Now Accepting New Clients
        </div>
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

        <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600">
            {websiteData.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-full border border-slate-200">
                <CheckCircle2 size={18} className="text-indigo-600" /> {feat}
            </div>
            ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">Transformations</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {websiteData.testimonials.map((test, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-yellow-400 mb-6 flex text-xl">★★★★★</div>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">"{test.quote}"</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                                {test.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-lg">{test.name}</div>
                                <div className="text-sm text-indigo-600 font-bold bg-indigo-50 inline-block px-2 py-0.5 rounded mt-1">{test.result}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">Simple, Transparent Pricing</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
                {websiteData.pricing.map((plan, i) => (
                    <div key={i} className={`p-10 rounded-[2rem] border ${i === 1 ? 'border-indigo-600 bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'border-slate-200 bg-white text-slate-900'}`}>
                        {i === 1 && <div className="inline-block bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">Most Popular</div>}
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="text-5xl font-extrabold my-6 tracking-tight">{plan.price}</div>
                        <ul className="space-y-4 mb-10">
                            {plan.features.map((f, j) => (
                                <li key={j} className="flex gap-3 items-center text-lg opacity-90">
                                    <Check size={20} className={i === 1 ? 'text-indigo-400' : 'text-indigo-600'} /> {f}
                                </li>
                            ))}
                        </ul>
                        <button className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                            i === 1 ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                        }`}>
                            Get Started
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Lead Capture */}
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
                            <input 
                                required
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all placeholder:text-slate-600"
                                placeholder="e.g. John"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 ml-1 text-slate-300">Email Address</label>
                            <input 
                                required
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all placeholder:text-slate-600"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] disabled:opacity-70 disabled:scale-100"
                    >
                        {loading ? 'Processing...' : <>Join Waitlist <Send size={20} /></>}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-4">
                        100% Secure. Unsubscribe at any time.
                    </p>
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