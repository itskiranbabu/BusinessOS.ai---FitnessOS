import React, { useState } from 'react';
import { BusinessBlueprint, Lead } from '../types';
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
      createdAt: new Date().toISOString(),
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
        source: 'Website Capture',
      };

      await storageService.saveLead(newLead);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('Failed to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-16">
        {/* Top badge */}
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Powered by BusinessOS.ai</span>
        </div>

        {/* HERO */}
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-400">
            {blueprint.businessName}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold">
            {websiteData.heroHeadline}
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            {websiteData.heroSubhead}
          </p>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById('join-form')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-indigo-600 text-white px-10 py-3 rounded-full text-lg font-bold shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] transition-all"
          >
            {websiteData.ctaText}
          </button>
        </header>

        {/* PRICING (simplified) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Plans &amp; Pricing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {websiteData.pricing.map((plan, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2"
              >
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold">{plan.price}</p>
                <p className="text-xs text-slate-400">{plan.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LEAD CAPTURE FORM */}
        <section id="join-form" className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to transform?
          </h2>
          <p className="text-slate-300">
            Join the waitlist for {blueprint.suggestedPrograms[0]} and get
            exclusive early access.
          </p>

          {submitted ? (
            <div className="bg-emerald-900/40 border border-emerald-600/60 rounded-3xl p-8 text-center space-y-2">
              <h3 className="text-xl font-semibold">Application Received!</h3>
              <p className="text-slate-200">We&apos;ll be in touch shortly.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block text-sm text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-slate-950/60 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-600"
                    placeholder="e.g. John"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-sm text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-slate-950/60 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-600"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-sm text-slate-300 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-slate-950/60 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-600"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full md:w-auto inline-flex items-center justify-center rounded-2xl px-8 py-3 font-semibold bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-500/30 transition-all"
              >
                {loading ? 'Processing…' : 'Join Waitlist'}
              </button>

              <p className="mt-2 text-xs text-slate-500">
                100% Secure. Unsubscribe at any time.
              </p>
            </form>
          )}
        </section>

        <footer className="pt-4 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} {blueprint.businessName}. All rights
          reserved.
        </footer>
      </div>
    </div>
  );
};

export default PublicSite;
