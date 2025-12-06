import { ProjectData, SavedProject, ClientStatus, Lead, AnalyticsEvent, GrowthPlan } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './authService';

const LOCAL_STORAGE_KEY = 'business_os_project_v2';

const DEFAULT_CLIENTS = [
  {
    id: '1',
    name: 'Sample Client',
    email: 'client@example.com',
    status: ClientStatus.LEAD,
    program: 'Interested',
    joinDate: new Date().toISOString().split('T')[0],
    lastCheckIn: 'Never',
    progress: 0,
  }
];

export const storageService = {
  // ... (keep saveProject/loadProject mostly same, but remove leads array management if moving fully to SQL)
  // For MVP transition, we keep the JSON blob logic for OTHER data, but separate Leads.

  saveProject: async (projectData: ProjectData): Promise<boolean> => {
    const saveData: SavedProject = {
      data: projectData,
      lastUpdated: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const slug = projectData.blueprint.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          
          const { error } = await supabase
            .from('projects')
            .upsert({ 
              user_id: user.id, 
              blueprint: saveData.data, 
              public_slug: slug,
              last_updated: saveData.lastUpdated
            });

          if (error) throw error;
          return true;
        }
      } catch (error) {
        console.error('Supabase save failed', error);
      }
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      return false;
    }
  },

  loadProject: async (): Promise<SavedProject | null> => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const { data, error } = await supabase
            .from('projects')
            .select('blueprint, last_updated')
            .eq('user_id', user.id)
            .single();

          if (data && data.blueprint) {
             const loadedData = data.blueprint as any;
             const projectData: ProjectData = {
               blueprint: loadedData.businessName ? loadedData : loadedData.blueprint,
               clients: loadedData.clients || DEFAULT_CLIENTS,
               automations: loadedData.automations || [],
               leads: [], // Now fetched separately via fetchLeads
               events: loadedData.events || [],
               growthPlan: loadedData.growthPlan || undefined,
             };
             return { data: projectData, lastUpdated: data.last_updated };
          }
        }
      } catch (error) {
        console.error('Supabase load failed', error);
      }
    }

    // Fallback
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data) as SavedProject;
      return parsed;
    } catch (error) {
      return null;
    }
  },

  loadPublicProjectBySlug: async (slug: string): Promise<SavedProject | null> => {
    const formattedSlug = slug.toLowerCase();
    
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('blueprint, last_updated')
                .eq('public_slug', formattedSlug)
                .single();
            
            if (data) {
                 const loadedData = data.blueprint as any;
                 const projectData: ProjectData = {
                    blueprint: loadedData.businessName ? loadedData : loadedData.blueprint,
                    clients: [],
                    automations: [],
                    leads: [],
                    events: [],
                 };
                 return { data: projectData, lastUpdated: data.last_updated };
            }
        } catch (e) {
            console.error("Public load error", e);
        }
    }
    return null;
  },

  // --- NEW: ROBUST SQL LEAD CAPTURE ---
  saveLead: async (lead: Lead): Promise<void> => {
    // 1. We need the Project Owner ID.
    // If visitor is on public site, they don't have auth.
    // We must query the project by the URL slug (which should be in window location or passed in)
    // For this MVP service, we will assume we can find the owner via the business name slug match if needed,
    // OR we rely on the fact that PublicSite passed a `lead` object.
    
    // HACK for MVP: Since `lead` doesn't have project_id attached from PublicSite yet, we need to find it.
    // Ideally PublicSite should pass the project ID. But for security, we look up via slug.
    
    if (isSupabaseConfigured() && supabase) {
        // Try to infer slug from URL
        const pathSegments = window.location.pathname.split('/p/');
        const slug = pathSegments.length > 1 ? pathSegments[1] : null;

        let projectId = null;

        if (slug) {
            const { data } = await supabase.from('projects').select('user_id').eq('public_slug', slug).single();
            if (data) projectId = data.user_id;
        } else {
            // Internal testing (owner adding lead manually)
            const user = await authService.getCurrentUser();
            if (user) projectId = user.id;
        }

        if (projectId) {
            const { error } = await supabase.from('inbound_leads').insert({
                project_id: projectId,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                source: lead.source,
                status: 'New'
            });
            
            if (error) {
                console.error("Lead Insert Error:", error);
                throw error;
            }
            
            // Also track event (still in JSON for now, or separate table later)
            await storageService.trackEvent({
                id: Math.random().toString(36).substr(2, 9),
                type: 'lead_created',
                createdAt: new Date().toISOString(),
                metadata: { source: lead.source }
            });
            return;
        }
    }

    // Fallback Local Storage
    console.warn("Using LocalStorage fallback for lead (not production ready)");
    const saved = await storageService.loadProject();
    if (saved) {
        const updatedData = { ...saved.data, leads: [...(saved.data.leads || []), lead] };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ data: updatedData, lastUpdated: new Date().toISOString() }));
    }
  },

  // NEW: Fetch leads from SQL table
  fetchLeads: async (): Promise<Lead[]> => {
      if (isSupabaseConfigured() && supabase) {
          const user = await authService.getCurrentUser();
          if (user) {
              const { data, error } = await supabase
                  .from('inbound_leads')
                  .select('*')
                  .order('created_at', { ascending: false });
              
              if (!error && data) {
                  return data.map(d => ({
                      id: d.id,
                      project_id: d.project_id,
                      name: d.name,
                      email: d.email,
                      phone: d.phone,
                      status: d.status,
                      createdAt: d.created_at,
                      source: d.source || 'Website'
                  }));
              }
          }
      }
      return [];
  },

  updateLead: async (leadId: string, updates: Partial<Lead>): Promise<void> => {
      if (isSupabaseConfigured() && supabase) {
          await supabase.from('inbound_leads').update(updates).eq('id', leadId);
      }
  },

  trackEvent: async (event: AnalyticsEvent): Promise<void> => {
    const saved = await storageService.loadProject();
    if (!saved) return;
    const updatedEvents = [...(saved.data.events || []), event];
    await storageService.saveProject({ ...saved.data, events: updatedEvents });
  },

  saveGrowthPlan: async (plan: GrowthPlan): Promise<void> => {
    const saved = await storageService.loadProject();
    if (!saved) return;
    await storageService.saveProject({ ...saved.data, growthPlan: plan });
  }
};
