
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
import PublicSite from './components/PublicSite';
import Auth from './components/Auth';
import ToastContainer, { ToastMessage, ToastType } from './components/Toast';
import { AppView, BusinessBlueprint, Client, ProjectData, ClientStatus, SocialPost, Automation, Lead, AnalyticsEvent, GrowthPlan } from './types';
import { fetchRevenueData } from './services/mockDatabase';
import { storageService } from './services/storageService';
import { regenerateContentPlan } from './services/geminiService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { authService } from './services/authService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // ROUTING CHECK
  const isPublicRoute = window.location.pathname.startsWith('/p/');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // App State
  const [isLoading, setIsLoading] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Data State
  const [blueprint, setBlueprint] = useState<BusinessBlueprint | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | undefined>(undefined);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Initialize Auth Check
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const checkAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserEmail(session.user.email || '');
          setIsAuthenticated(true);
        }
        
        // Listen for changes
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUserEmail(session.user.email || '');
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setUserEmail(null);
            setBlueprint(null);
          }
        });
        subscription = data.subscription;
        setAuthChecking(false);
      } else {
        setAuthChecking(false);
      }
    };

    checkAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Check for saved project on mount/auth
  useEffect(() => {
    // If public route, we might need to load public data differently. 
    // For MVP, we'll try to load from local storage to simulate "hosting".
    if (isPublicRoute) {
        loadSavedProject();
        return;
    }

    if (isAuthenticated) {
      loadSavedProject();
    }
  }, [isAuthenticated, isPublicRoute]);

  const loadSavedProject = async () => {
    setIsLoading(true);
    const saved = await storageService.loadProject();
    if (saved) {
      setBlueprint(saved.data.blueprint);
      setClients(saved.data.clients);
      setAutomations(saved.data.automations || []);
      setLeads(saved.data.leads || []);
      setEvents(saved.data.events || []);
      setGrowthPlan(saved.data.growthPlan);

      fetchRevenueData().then(setRevenueData);
      setHasOnboarded(true);
      if (!isPublicRoute) addToast('Project loaded successfully', 'success');
    } else {
      // Default automations if new project
      setAutomations([
        { id: '1', name: 'Weekly Client Check-in', type: 'WhatsApp', trigger: 'Every Monday 8AM', status: 'Active', stats: { sent: 0, opened: '0%' } },
        { id: '2', name: 'New Lead Welcome', type: 'Email', trigger: 'On Sign Up', status: 'Active', stats: { sent: 0, opened: '0%' } },
      ]);
    }
    setIsLoading(false);
  };

  // Unified Save
  const handleSaveProject = async (
    updatedBlueprint?: BusinessBlueprint, 
    updatedClients?: Client[],
    updatedAutomations?: Automation[],
    updatedLeads?: Lead[],
    updatedGrowthPlan?: GrowthPlan
  ) => {
    const bp = updatedBlueprint || blueprint;
    const cl = updatedClients || clients;
    const au = updatedAutomations || automations;
    const le = updatedLeads || leads;
    const gp = updatedGrowthPlan || growthPlan;

    if (bp) {
      const projectData: ProjectData = {
        blueprint: bp,
        clients: cl,
        automations: au,
        leads: le,
        events: events,
        growthPlan: gp
      };
      await storageService.saveProject(projectData);
    }
  };

  const handleUpdateClients = (newClients: Client[]) => {
    setClients(newClients);
    handleSaveProject(undefined, newClients);
  };

  const handleUpdateAutomations = (newAutomations: Automation[]) => {
    setAutomations(newAutomations);
    handleSaveProject(undefined, undefined, newAutomations);
  };

  const handleUpdateLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    handleSaveProject(undefined, undefined, undefined, newLeads);
  };
  
  const handleUpdateBlueprint = (updates: Partial<BusinessBlueprint>) => {
    if (blueprint) {
      const newBlueprint = { ...blueprint, ...updates };
      setBlueprint(newBlueprint);
      handleSaveProject(newBlueprint);
      addToast('Changes saved successfully', 'success');
    }
  };

  const handleUpdateGrowthPlan = (plan: GrowthPlan) => {
    setGrowthPlan(plan);
    handleSaveProject(undefined, undefined, undefined, undefined, plan);
  }

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    addToast(`Welcome back, ${email}`, 'success');
  };

  const handleLogout = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    setBlueprint(null);
    setHasOnboarded(false);
    addToast('Signed out successfully', 'info');
  };

  const handleOnboardingComplete = async (data: BusinessBlueprint) => {
    setBlueprint(data);
    const initialClients: Client[] = [
      {
        id: '1',
        name: 'Example Lead',
        email: 'lead@example.com',
        status: ClientStatus.LEAD,
        program: 'Interest',
        joinDate: new Date().toISOString().split('T')[0],
        lastCheckIn: 'N/A',
        progress: 0
      }
    ];
    setClients(initialClients);
    
    // Initialize default automations
    const initialAutomations: Automation[] = [
        { id: '1', name: 'Weekly Client Check-in', type: 'WhatsApp', trigger: 'Every Monday 8AM', status: 'Active', stats: { sent: 0, opened: '0%' } },
        { id: '2', name: 'New Lead Welcome', type: 'Email', trigger: 'On Sign Up', status: 'Active', stats: { sent: 0, opened: '0%' } },
    ];
    setAutomations(initialAutomations);

    fetchRevenueData().then(setRevenueData);
    setHasOnboarded(true);
    await handleSaveProject(data, initialClients, initialAutomations, [], undefined);
    addToast('Business initialized successfully!', 'success');
  };

  // Handlers
  const handleAddClient = (clientData: Partial<Client>) => {
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: clientData.name || 'New Client',
      email: clientData.email || '',
      status: clientData.status || ClientStatus.LEAD,
      program: clientData.program || 'General',
      joinDate: new Date().toISOString().split('T')[0],
      lastCheckIn: 'Never',
      progress: 0,
      notes: clientData.notes || '',
      tags: clientData.tags || []
    };
    
    const updatedClients = [...clients, newClient];
    handleUpdateClients(updatedClients);
    addToast('Client added successfully', 'success');

    // AUTOMATION TRIGGER LOGIC
    // Check if any automations should run for new leads
    const triggeredAutomations = automations.filter(a => 
      a.status === 'Active' && 
      (a.trigger.toLowerCase().includes('sign up') || a.trigger.toLowerCase().includes('new lead'))
    );

    if (triggeredAutomations.length > 0) {
      const updatedAutomations = automations.map(a => {
        if (triggeredAutomations.find(t => t.id === a.id)) {
          return {
            ...a,
            stats: { ...a.stats, sent: a.stats.sent + 1 }
          };
        }
        return a;
      });
      handleUpdateAutomations(updatedAutomations);
      
      triggeredAutomations.forEach(a => {
        setTimeout(() => {
          addToast(`⚡ Automation triggered: ${a.name}`, 'success');
        }, 1000);
      });
    }
  };

  const handleUpdateClient = (id: string, updates: Partial<Client>) => {
    const updated = clients.map(c => c.id === id ? { ...c, ...updates } : c);
    handleUpdateClients(updated);
    addToast('Client updated', 'success');
  };

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    handleUpdateClients(updated);
    addToast('Client removed', 'info');
  };

  const handleCaptureLead = (email: string) => {
    handleAddClient({
        name: 'Website Lead',
        email: email,
        status: ClientStatus.LEAD,
        program: 'Waitlist',
        tags: ['Website', 'Waitlist']
    });
    addToast('New lead captured from website!', 'success');
  };

  const handleConvertLead = (lead: Lead) => {
    // 1. Add as Client
    handleAddClient({
        name: lead.name,
        email: lead.email,
        status: ClientStatus.LEAD,
        program: 'Converted',
        tags: ['From Lead']
    });
    
    // 2. Update Lead Status
    const updatedLeads = leads.map(l => l.id === lead.id ? { ...l, status: 'Converted' as const } : l);
    handleUpdateLeads(updatedLeads);
    addToast('Lead converted to client!', 'success');
  };

  const handleUpdateLeadStatus = (id: string, status: Lead['status']) => {
    const updatedLeads = leads.map(l => l.id === id ? { ...l, status } : l);
    handleUpdateLeads(updatedLeads);
  };

  const handleUpdateContentPlan = (newPlan: SocialPost[]) => {
    if (blueprint) {
      handleUpdateBlueprint({ contentPlan: newPlan });
    }
  };

  const handleRegenerateContent = async (): Promise<SocialPost[]> => {
    if (blueprint) {
      addToast('Generating new content strategy...', 'info');
      const plan = await regenerateContentPlan(blueprint.niche);
      addToast('Content plan refreshed', 'success');
      return plan;
    }
    return [];
  };

  // --- PUBLIC SITE RENDERER ---
  if (isPublicRoute) {
      if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary-600" /></div>;
      if (!blueprint) return <div className="h-screen flex items-center justify-center text-slate-500">Site not found. Please publish your project first.</div>;
      return <PublicSite blueprint={blueprint} />;
  }

  // --- INTERNAL APP RENDERER ---
  if (authChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 gap-2">
        <Loader2 className="animate-spin" /> Starting BusinessOS...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Auth onLogin={handleLogin} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 gap-2">
        <Loader2 className="animate-spin" /> Loading your empire...
      </div>
    );
  }

  if (!hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    if (!blueprint) return null;

    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            blueprint={blueprint} 
            revenueData={revenueData} 
            clients={clients} 
            isDarkMode={isDarkMode}
            onUpdateClient={handleUpdateClient} 
          />
        );
      case AppView.CRM:
        return (
          <CRM 
            clients={clients} 
            onAddClient={handleAddClient} 
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      case AppView.LEADS:
        return (
            <Leads 
                leads={leads}
                onConvert={handleConvertLead}
                onUpdateStatus={handleUpdateLeadStatus}
            />
        );
      case AppView.WEBSITE:
        return (
            <WebsiteBuilder 
                blueprint={blueprint} 
                onUpdate={(updates) => handleUpdateBlueprint({ websiteData: { ...blueprint.websiteData, ...updates } })} 
                onCaptureLead={handleCaptureLead}
            />
        );
      case AppView.CONTENT:
        return (
          <ContentEngine 
            blueprint={blueprint} 
            onUpdatePlan={handleUpdateContentPlan}
            onRegenerate={handleRegenerateContent}
          />
        );
      case AppView.AUTOMATIONS:
        return <Automations automations={automations} onUpdate={handleUpdateAutomations} />;
      case AppView.PAYMENTS:
        return <Payments blueprint={blueprint} clients={clients} />;
      case AppView.GROWTH:
        return (
            <Growth 
                events={events}
                leads={leads}
                clients={clients}
                blueprint={blueprint}
                growthPlan={growthPlan}
                onUpdatePlan={handleUpdateGrowthPlan}
            />
        );
      case AppView.SETTINGS:
        return (
          <Settings 
            blueprint={blueprint} 
            userEmail={userEmail} 
            onUpdateProfile={handleUpdateBlueprint} 
            clients={clients}
          />
        );
      default:
        return <div className="p-8 text-slate-500">Feature coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 overflow-auto relative">
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
