// src/components/PublicSite.tsx
import React, { useState } from 'react';
import { createLead } from '../services/leadService';
import { emailService } from '../services/emailService';

interface PublicSiteProps {
  businessName: string;
  coachName: string;
  publicUrl: string;
}

export const PublicSite: React.FC<PublicSiteProps> = ({
  businessName,
  coachName,
  publicUrl,
}) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !email) {
      setError('Please fill in your name and email.');
      return;
    }

    try {
      setSubmitting(true);

      // 1) Save lead in Supabase
      await createLead({
        name: firstName,
        email,
        source: 'Website Waitlist',
      });

      // 2) Send welcome email via EmailJS
      try {
        const ok = await emailService.sendWelcomeEmail(
          email,
          firstName,
          businessName,
          coachName,
          publicUrl
        );
        console.log('[PublicSite] Welcome email status:', ok);
      } catch (err) {
        console.error('[PublicSite] Welcome email failed:', err);
        // do not block success message because of email failure
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('[PublicSite] Lead submit failed:', err);
      setError('Something went wrong while submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-16 px-4 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Application Received!
        </h2>
        <p className="text-lg text-emerald-300">
          We&apos;ll be in touch shortly.
        </p>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 max-w-3xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
        Ready to transform?
      </h2>
      <p className="text-lg text-slate-300 mb-8">
        Join the waitlist for {businessName} and get exclusive early access.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <label className="block text-sm text-slate-300 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. John"
              className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 mt-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full md:w-auto inline-flex items-center justify-center rounded-2xl px-8 py-3 font-semibold
                     bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed
                     text-white shadow-lg shadow-indigo-500/30 transition-all"
        >
          {submitting ? 'Submitting...' : 'Join Waitlist'}
          <span className="ml-2">✈️</span>
        </button>

        <p className="mt-2 text-xs text-slate-500">
          100% Secure. Unsubscribe at any time.
        </p>
      </form>
    </section>
  );
};
