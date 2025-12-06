import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import CRM from './components/CRM';
import WebsiteBuilder from './components/WebsiteBuilder';
import ContentEngine from './components/ContentEngine';
import Automations from './components/Automations';
import Payments from './components/Payments';
import Settings from './components/Settings';
import Leads from './components/Leads';
import Growth from './components/Growth';
import Marketplace from './components/Marketplace';
import PublicSite from './components/PublicSite';
import Auth from './components/Auth';
import ToastContainer, { ToastMessage, ToastType } from './components/Toast';
import { AppView, BusinessBlueprint, Client, ProjectData, ClientStatus, SocialPost, Automation, Lead, AnalyticsEvent, GrowthPlan } from './types';
import { fetchRevenueData } from './services/mockDatabase';
import { storageService } from './services/storageService';
import { regenerateContentPlan } from './services/geminiService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { authService } from './services/authService';
import { emailService } from './services/emailService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const isPublicRoute = window.location.pathname.startsWith('/p/');
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [blueprint, setBlueprint] = useState<BusinessBlueprint | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') { setIsDarkMode(false); document.documentElement.classList.remove('dark'); }
    else { setIsDarkMode(true); document.documentElement.classList.add('dark'); }
  }, []);

  // REAL-TIME POLLING FOR LEADS & EVENTS
  useEffect(() => {
    if (isAuthenticated && hasOnboarded && !isPublicRoute) {
        const interval = setInterval(async () => {
            // 1. Fetch JSON blob for events/clients
            const saved = await storageService.loadProject();
            if (saved && saved.data.events) {
                if (saved.data.events.length !== events.length) setEvents(saved.data.events);
            }
            
            // 2. Fetch SQL Leads
            const fetchedLeads = await storageService.fetchLeads();
            if (fetchedLeads.length !== leads.length) {
                // New lead detected!
                if (fetchedLeads.length > leads.length && leads.length > 0) {
                    addToast("New Lead Captured!", "success");
                }
                setLeads(fetchedLeads);
            }
        }, 5000); // Check every 5s
        return () => clearInterval(interval);
    }
  }, [isAuthenticated, hasOnboarded, leads.length, events.length, isPublicRoute]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    const checkAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) { setUserEmail(session.user.email || ''); setIsAuthenticated(true); }
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) { setUserEmail(session.user.email || ''); setIsAuthenticated(true); }
          else { setIsAuthenticated(false); setUserEmail(null); setBlueprint(null); }
        });
        subscription = data.subscription;
        setAuthChecking(false);
      } else { setAuthChecking(false); }
    };
    checkAuth();
    return () => { if (subscription) subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        if (isPublicRoute) {
             const slug = window.location.pathname.split('/p/')[1];
             const saved = await storageService.loadPublicProjectBySlug(slug);
             if (saved) setBlueprint(saved.data.blueprint);
             else setBlueprint(null);
        } else if (isAuthenticated) {
            const saved = await storageService.loadProject();
            const fetchedLeads = await storageService.fetchLeads(); // Fetch initial leads
            
            if (saved) {
                setBlueprint(saved.data.blueprint);
                setClients(saved.data.clients || []);
                setAutomations(saved.data.automations || []);
                setLeads(fetchedLeads); // Set leads from SQL
                setEvents(saved.data.events || []);
                setGrowthPlan(saved.data.growthPlan);
                fetchRevenueData().then(setRevenueData);
                setHasOnboarded(true);
                addToast('Project loaded successfully', 'success');
            } else {
                setAutomations([
                    { id: '1', name: 'Weekly Client Check-in', type: 'WhatsApp', trigger: 'Every Monday 8AM', status: 'Active', stats: { sent: 0, opened: '0%' } },
                    { id: '2', name: 'New Lead Welcome', type: 'Email', trigger: 'On Sign Up', status: 'Active', stats: { sent: 0, opened: '0%' } },
                ]);
            }
        }
        setIsLoading(false);
    };
    loadData();
  }, [isAuthenticated, isPublicRoute]);

  const handleSaveProject = async (
    updatedBlueprint?: BusinessBlueprint, 
    updatedClients?: Client[],
    updatedAutomations?: Automation[],
    updatedLeads?: Lead[],
    updatedGrowthPlan?: GrowthPlan,
    updatedEvents?: AnalyticsEvent[]
  ) => {
    const bp = updatedBlueprint || blueprint;
    const cl = updatedClients || clients;
    const au = updatedAutomations || automations;
    const gp = updatedGrowthPlan || growthPlan;
    const ev = updatedEvents || events;

    // NOTE: Leads are saved via separate SQL calls now, so we don't need to pass them to saveProject
    // but for type compatibility we pass the current state.
    
    if (bp) {
      const projectData: ProjectData = { blueprint: bp, clients: cl, automations: au, leads: leads, events: ev, growthPlan: gp };
      await storageService.saveProject(projectData);
    }
  };

  const handleUpdateClients = (newClients: Client[]) => { setClients(newClients); handleSaveProject(undefined, newClients); };
  const handleUpdateAutomations = (newAutomations: Automation[]) => { setAutomations(newAutomations); handleSaveProject(undefined, undefined, newAutomations); };
  const handleUpdateLeads = async (newLeads: Lead[]) => { 
      // For status updates, we update SQL individually
      // This is a simplified prop handler for Leads component
      setLeads(newLeads); 
  };
  
  const handleUpdateBlueprint = (updates: Partial<BusinessBlueprint>) => { if (blueprint) { const newBlueprint = { ...blueprint, ...updates }; setBlueprint(newBlueprint); handleSaveProject(newBlueprint); addToast('Changes saved successfully', 'success'); } };
  const handleUpdateGrowthPlan = (plan: GrowthPlan) => { setGrowthPlan(plan); handleSaveProject(undefined, undefined, undefined, undefined, plan); }
  const handleLogin = (email: string) => { setUserEmail(email); setIsAuthenticated(true); addToast(`Welcome back, ${email}`, 'success'); };
  const handleLogout = async () => { await authService.signOut(); setIsAuthenticated(false); setUserEmail(null); setBlueprint(null); setHasOnboarded(false); addToast('Signed out successfully', 'info'); };
  const handleOnboardingComplete = async (data: BusinessBlueprint) => { setBlueprint(data); const initialClients: Client[] = [{ id: '1', name: 'Example Lead', email: 'lead@example.com', status: ClientStatus.LEAD, program: 'Interest', joinDate: new Date().toISOString().split('T')[0], lastCheckIn: 'N/A', progress: 0 }]; setClients(initialClients); const initialAutomations: Automation[] = [{ id: '1', name: 'Weekly Client Check-in', type: 'WhatsApp', trigger: 'Every Monday 8AM', status: 'Active', stats: { sent: 0, opened: '0%' } }, { id: '2', name: 'New Lead Welcome', type: 'Email', trigger: 'On Sign Up', status: 'Active', stats: { sent: 0, opened: '0%' } }]; setAutomations(initialAutomations); fetchRevenueData().then(setRevenueData); setHasOnboarded(true); await handleSaveProject(data, initialClients, initialAutomations, [], undefined, []); addToast('Business initialized successfully!', 'success'); };

  const handleAddClient = async (clientData: Partial<Client>) => {
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: clientData.name || 'New Client',
      email: clientData.email || '',
      phone: clientData.phone || '', 
      status: clientData.status || ClientStatus.LEAD,
      program: clientData.program || 'General',
      joinDate: new Date().toISOString().split('T')[0],
      lastCheckIn: 'Never',
      progress: 0,
      notes: clientData.notes || '',
      tags: clientData.tags || []
    };
    
    const updatedClients = [...clients, newClient];
    setClients(updatedClients); 
    addToast('Client added successfully', 'success');

    if (newClient.email && blueprint) {
       await emailService.sendWelcomeEmail(
           newClient.email,
           newClient.name,
           blueprint.businessName,
           blueprint.websiteData?.coachBio?.name || 'Coach', 
           blueprint.websiteData?.publishedUrl || 'https://businessos.ai' 
       );
       addToast(`Email Sent: Welcome to ${blueprint.businessName}`, 'info');
    }

    // ... Automation logic (same as before) ...
    const triggeredAutomations = automations.filter(a => 
      a.status === 'Active' && 
      (a.trigger.toLowerCase().includes('sign up') || a.trigger.toLowerCase().includes('new lead') || a.trigger.toLowerCase().includes('client'))
    );

    let updatedAutomations = [...automations];
    let newEvents = [...events];

    if (triggeredAutomations.length > 0) {
      updatedAutomations = automations.map(a => {
        if (triggeredAutomations.find(t => t.id === a.id)) {
          return { ...a, stats: { ...a.stats, sent: a.stats.sent + 1 } };
        }
        return a;
      });
      setAutomations(updatedAutomations);

      const triggerEvents: AnalyticsEvent[] = triggeredAutomations.map(a => ({
        id: Math.random().toString(36).substr(2, 9),
        type: 'automation_triggered',
        createdAt: new Date().toISOString(),
        metadata: { workflow: a.name, client: newClient.name }
      }));
      
      newEvents = [...events, ...triggerEvents];
      setEvents(newEvents);
      
      triggeredAutomations.forEach(a => {
        setTimeout(() => {
          if (a.type === 'Email') {
             addToast(`⚡ Triggered Email: ${a.name}`, 'success');
          } else {
             addToast(`⚡ Automation: ${a.name} (Ready to Send)`, 'info');
          }
        }, 1000);
      });
    }

    handleSaveProject(undefined, updatedClients, updatedAutomations, undefined, undefined, newEvents);
  };

  const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
    const updated = clients.map(c => c.id === id ? { ...c, ...updates } : c);
    setClients(updated);
    await handleSaveProject(undefined, updated);
    addToast('Client updated', 'success');
  };

  const handleCheckIn = async (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client && blueprint) {
        const updated = clients.map(c => c.id === id ? { ...c, lastCheckIn: 'Just now' } : c);
        setClients(updated);
        await handleSaveProject(undefined, updated);
        await emailService.sendCheckInEmail(client.email, client.name, blueprint.businessName);
        addToast(`Check-in logged for ${client.name}`, 'success');
    }
  };

  const handleDeleteClient = (id: string) => { const updated = clients.filter(c => c.id !== id); handleUpdateClients(updated); addToast('Client removed', 'info'); };
  
  const handleCaptureLead = (email: string) => {
    // This is for internal manual capture
    handleAddClient({ name: 'Website Lead', email: email, status: ClientStatus.LEAD, program: 'Waitlist', tags: ['Website', 'Waitlist'] });
    addToast('New lead captured from website!', 'success');
  };

  const handleConvertLead = (lead: Lead) => {
    handleAddClient({ name: lead.name, email: lead.email, phone: lead.phone, status: ClientStatus.LEAD, program: 'Converted', tags: ['From Lead'] });
    // Update status in SQL
    storageService.updateLead(lead.id, { status: 'Converted' }).then(() => {
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'Converted' as const } : l));
        addToast('Lead converted to client!', 'success');
    });
  };

  const handleUpdateLeadStatus = (id: string, status: Lead['status']) => { 
      storageService.updateLead(id, { status }).then(() => {
          setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      });
  };
  
  const handleUpdateContentPlan = (newPlan: SocialPost[]) => { if (blueprint) { handleUpdateBlueprint({ contentPlan: newPlan }); } };
  const handleRegenerateContent = async (): Promise<SocialPost[]> => { if (blueprint) { addToast('Generating new content strategy...', 'info'); const plan = await regenerateContentPlan(blueprint.niche); addToast('Content plan refreshed', 'success'); return plan; } return []; };

  const handleInstallTemplate = (newConfig: ProjectData) => {
      setBlueprint(newConfig.blueprint);
      setAutomations(newConfig.automations);
      const merged: ProjectData = { ...newConfig, clients: clients, leads: leads, events: events };
      handleSaveProject(merged.blueprint, merged.clients, merged.automations);
      addToast('System installed successfully!', 'success');
      setCurrentView(AppView.DASHBOARD);
  }

  if (isPublicRoute) {
      if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary-600" /></div>;
      if (!blueprint) return <div className="h-screen flex items-center justify-center text-slate-500">Site not found.</div>;
      return <PublicSite blueprint={blueprint} />;
  }
  if (authChecking) return <div className="h-screen flex items-center justify-center bg-[#020617] text-slate-400 gap-2"><Loader2 className="animate-spin text-primary-500" /> Starting BusinessOS...</div>;
  if (!isAuthenticated) return <><Auth onLogin={handleLogin} /><ToastContainer toasts={toasts} removeToast={removeToast} /></>;
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#020617] text-slate-400 gap-2"><Loader2 className="animate-spin text-primary-500" /> Loading your empire...</div>;
  if (!hasOnboarded) return <Onboarding onComplete={handleOnboardingComplete} />;

  const renderContent = () => {
    if (!blueprint) return null;
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard blueprint={blueprint} revenueData={revenueData} clients={clients} events={events} isDarkMode={isDarkMode} onUpdateClient={handleUpdateClient} />;
      case AppView.CRM: return <CRM clients={clients} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} onCheckIn={handleCheckIn} />;
      case AppView.LEADS: return <Leads leads={leads} onConvert={handleConvertLead} onUpdateStatus={handleUpdateLeadStatus} />;
      case AppView.WEBSITE: return <WebsiteBuilder blueprint={blueprint} onUpdate={(updates) => handleUpdateBlueprint({ websiteData: { ...blueprint.websiteData, ...updates } })} onCaptureLead={handleCaptureLead} />;
      case AppView.CONTENT: return <ContentEngine blueprint={blueprint} onUpdatePlan={handleUpdateContentPlan} onRegenerate={handleRegenerateContent} />;
      case AppView.AUTOMATIONS: return <Automations automations={automations} events={events} onUpdate={handleUpdateAutomations} />;
      case AppView.PAYMENTS: return <Payments blueprint={blueprint} clients={clients} />;
      case AppView.GROWTH: return <Growth events={events} leads={leads} clients={clients} blueprint={blueprint} growthPlan={growthPlan} onUpdatePlan={handleUpdateGrowthPlan} />;
      case AppView.MARKETPLACE: return <Marketplace currentProject={{blueprint, clients, automations, leads, events, growthPlan}} onInstall={handleInstallTemplate} />;
      case AppView.SETTINGS: return <Settings blueprint={blueprint} userEmail={userEmail} onUpdateProfile={handleUpdateBlueprint} clients={clients} />;
      default: return <div className="p-8 text-slate-500">Feature coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020617] overflow-hidden transition-colors duration-300">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Sidebar currentView={currentView} onChangeView={setCurrentView} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-auto relative custom-scrollbar">
        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-20">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
