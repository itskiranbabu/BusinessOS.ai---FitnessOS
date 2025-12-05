
import React from 'react';
import { Lead, ClientStatus, Client } from '../types';
import { UserPlus, Mail, Clock, CheckCircle2, Archive, MessageSquare } from 'lucide-react';

interface LeadsProps {
  leads: Lead[];
  onConvert: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: Lead['status']) => void;
}

const Leads: React.FC<LeadsProps> = ({ leads, onConvert, onUpdateStatus }) => {
  const newLeads = leads.filter(l => l.status === 'New');
  const otherLeads = leads.filter(l => l.status !== 'New');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Lead Pipeline</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage incoming interest and convert them to clients.</p>
      </div>

      <div className="grid gap-6">
        {/* New Leads Section */}
        <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                New Inquiries ({newLeads.length})
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newLeads.length === 0 ? (
                    <div className="col-span-full p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-slate-500">
                        No new leads yet. Share your website link!
                    </div>
                ) : newLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onConvert={onConvert} onUpdateStatus={onUpdateStatus} isNew />
                ))}
            </div>
        </div>

        {/* Processed Leads */}
        <div className="mt-8">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 text-slate-500">
                Processed / Contacted
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                {otherLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onConvert={onConvert} onUpdateStatus={onUpdateStatus} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const LeadCard: React.FC<{ 
    lead: Lead; 
    onConvert: (l: Lead) => void; 
    onUpdateStatus: (id: string, status: Lead['status']) => void; 
    isNew?: boolean 
}> = ({ lead, onConvert, onUpdateStatus, isNew }) => {
    return (
        <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all ${isNew ? 'border-primary-200 dark:border-primary-900 shadow-lg shadow-primary-900/10' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-200">
                        {lead.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{lead.name}</h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                {isNew && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">NEW</span>}
            </div>

            <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Mail size={14} className="text-slate-400" /> {lead.email}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                    "Source: {lead.source}"
                </div>
            </div>

            <div className="flex gap-2">
                {lead.status !== 'Converted' && (
                    <button 
                        onClick={() => onConvert(lead)}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                        <UserPlus size={16} /> Convert
                    </button>
                )}
                
                {lead.status === 'New' && (
                    <button 
                        onClick={() => onUpdateStatus(lead.id, 'Contacted')}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                        <MessageSquare size={16} /> Mark Contacted
                    </button>
                )}

                 {lead.status === 'Converted' && (
                    <div className="w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                        <CheckCircle2 size={16} /> Converted Client
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leads;
