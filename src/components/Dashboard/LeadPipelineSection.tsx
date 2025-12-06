import React, { useEffect, useState } from 'react';
import { Lead, getLeads } from '../../services/leadService';

const LeadPipelineSection: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (err) {
        console.error('[LeadPipeline] Failed to load leads:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    // Optional live polling
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const newLeads = leads.filter((l) => (l.status || 'New') === 'New');
  const processed = leads.filter((l) => (l.status || 'New') !== 'New');

  if (loading) {
    return (
      <div className="p-6 text-slate-300">
        Loading leads…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Lead Pipeline</h1>
        <p className="text-sm text-slate-400">
          Manage incoming interest and convert them to clients.
        </p>
      </div>

      {/* NEW INQUIRIES */}
      <section>
        <h3 className="text-lg font-semibold text-emerald-300 mb-2">
          New Inquiries ({newLeads.length})
        </h3>

        {newLeads.length === 0 ? (
          <div className="text-sm text-slate-500 border border-dashed border-slate-700 rounded-2xl px-4 py-6">
            No new leads yet. Share your website link!
          </div>
        ) : (
          <div className="space-y-4">
            {newLeads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-xl px-4 py-3 border border-slate-800 bg-slate-900/60">
                <div className="font-medium text-slate-100">
                  {lead.name} <span className="text-slate-500">• {lead.email}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Source: {lead.source || 'Website'} •{' '}
                  {new Date(lead.createdAt || '').toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROCESSED */}
      <section>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          Processed / Contacted ({processed.length})
        </h3>

        {processed.length === 0 ? (
          <div className="text-sm text-slate-500 border border-dashed border-slate-700 rounded-2xl px-4 py-6">
            Once you contact a lead and update their status, they’ll appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {processed.map((lead) => (
              <div key={lead.id} className="rounded-xl px-4 py-3 border border-slate-800 bg-slate-900/60">
                <div className="font-medium text-slate-100">
                  {lead.name} <span className="text-slate-500">• {lead.email}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Status: {lead.status || 'Contacted'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LeadPipelineSection;
