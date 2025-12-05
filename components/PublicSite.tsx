
import React, { useState } from 'react';
import { BusinessBlueprint, Lead } from '../types';
import { Check, Send, Sparkles, AlertCircle } from 'lucide-react';
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
    // Track Page View
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 animate-fade-in">
      {/* Banner */}
      <div className="bg-slate-900 text-white text-center py-2 text-xs uppercase tracking-widest font-bold">
        Powered by BusinessOS.ai
      </div>

      {/* Header */}
      <header className="px-6 py-6 md:px-12 flex justify-between items-center bg-white shadow-sm sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tight">{blueprint.businessName}</div>
        <button 
            onClick={() => document.getElementById('join-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-primary-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-primary-700 transition-colors"
        >
            {websiteData.ctaText}
        </button>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 md:px-12 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight text-slate-900">
            {websiteData.heroHeadline}
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            {websiteData.heroSubhead}
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500 mb-12">
            {websiteData.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                <Check size={16} className="text-green-500" /> {feat}
            </div>
            ))}
        </div>
        <button 
            onClick={() => document.getElementById('join-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary-600/30 hover:scale-105 transition-transform"
        >
            {websiteData.ctaText}
        </button>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Results That Speak</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {websiteData.testimonials.map((test, i) => (
                    <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="text-yellow-400 mb-4 flex">★★★★★</div>
                        <p className="text-lg italic text-slate-600 mb-6">"{test.quote}"</p>
                        <div>
                            <div className="font-bold text-slate-900">{test.name}</div>
                            <div className="text-sm text-primary-600 font-bold">{test.result}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Simple Pricing</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {websiteData.pricing.map((plan, i) => (
                    <div key={i} className={`p-10 rounded-3xl border ${i === 1 ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-100 relative' : 'border-slate-200 bg-white'}`}>
                        {i === 1 && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-bold">BEST VALUE</div>}
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="text-4xl font-extrabold my-4">{plan.price}</div>
                        <ul className="space-y-3 mb-8">
                            {plan.features.map((f, j) => (
                                <li key={j} className="flex gap-2 items-center text-slate-600">
                                    <Check size={16} className="text-primary-600" /> {f}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-3 rounded-xl font-bold border border-slate-900 hover:bg-slate-900 hover:text-white transition-colors">
                            Get Started
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section id="join-form" className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <Sparkles size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to transform?</h2>
            <p className="text-slate-400 mb-8">Join the waitlist for {blueprint.suggestedPrograms[0]} and get exclusive early access.</p>

            {submitted ? (
                <div className="bg-green-500/20 border border-green-500/30 p-6 rounded-2xl animate-slide-up">
                    <div className="flex flex-col items-center gap-3 text-green-300">
                        <Check size={40} className="mb-2" />
                        <h3 className="text-xl font-bold text-white">You're in!</h3>
                        <p>We've received your info. Expect to hear from us soon!</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm text-left space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 ml-1 text-slate-300">First Name</label>
                        <input 
                            required
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-white"
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 ml-1 text-slate-300">Email Address</label>
                        <input 
                            required
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-white"
                            placeholder="you@example.com"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-500 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : <>Join Now <Send size={20} /></>}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-4">
                        Securely processed. We respect your privacy.
                    </p>
                </form>
            )}
        </div>
      </section>

      <footer className="py-8 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} {blueprint.businessName}. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicSite;
