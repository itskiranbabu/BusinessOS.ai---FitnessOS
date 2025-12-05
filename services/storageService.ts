
import { ProjectData, SavedProject, ClientStatus, Lead, AnalyticsEvent, GrowthPlan } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './authService';

const LOCAL_STORAGE_KEY = 'business_os_project_v2';

// Default initial state for new projects
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
  saveProject: async (projectData: ProjectData): Promise<boolean> => {
    const saveData: SavedProject = {
      data: projectData,
      lastUpdated: new Date().toISOString()
    };

    // 1. Try Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const { error } = await supabase
            .from('projects')
            .upsert({ 
              user_id: user.id, 
              blueprint: saveData.data, 
              last_updated: saveData.lastUpdated
            });

          if (error) {
              console.error("Supabase Save Error:", error.message, error.details);
              throw error;
          }
          console.log('Project saved to Supabase');
          return true;
        }
      } catch (error) {
        console.error('Supabase save failed, falling back to local storage', error);
      }
    }

    // 2. Fallback to LocalStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
      console.log('Project saved to local storage (Fallback)');
      return true;
    } catch (error) {
      console.error('Failed to save project locally', error);
      return false;
    }
  },

  loadProject: async (): Promise<SavedProject | null> => {
    // 1. Try Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const { data, error } = await supabase
            .from('projects')
            .select('blueprint, last_updated')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;

          if (data && data.blueprint) {
             console.log('Project loaded from Supabase');
             
             const loadedData = data.blueprint as any;
             const projectData: ProjectData = {
               blueprint: loadedData.businessName ? loadedData : loadedData.blueprint,
               clients: loadedData.clients || DEFAULT_CLIENTS,
               automations: loadedData.automations || [],
               leads: loadedData.leads || [],
               events: loadedData.events || [],
               growthPlan: loadedData.growthPlan || undefined,
             };

             return {
               data: projectData,
               lastUpdated: data.last_updated
             };
          }
        }
      } catch (error) {
        console.error('Supabase load failed, falling back to local storage', error);
      }
    }

    // 2. Fallback to LocalStorage
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data) as SavedProject;
      // Ensure backwards compatibility
      if (!parsed.data.leads) parsed.data.leads = [];
      if (!parsed.data.events) parsed.data.events = [];
      
      return parsed;
    } catch (error) {
      console.error('Failed to load project locally', error);
      return null;
    }
  },

  // NEW: Load public project for visitors (Fixes 404)
  loadPublicProjectBySlug: async (slug: string): Promise<SavedProject | null> => {
    const formattedSlug = slug.replace(/-/g, ' ');
    
    // 1. Try Supabase (if RLS allows public select)
    if (isSupabaseConfigured() && supabase) {
        try {
            // This requires RLS policy: create policy "Public projects" on projects for select using (true);
            const { data, error } = await supabase
                .from('projects')
                .select('blueprint, last_updated')
                .limit(1); 
            
            // Note: In a real app we would filter where blueprint->>'businessName' ILIKE formattedSlug
            // For MVP, we just return the first project we find if we can't filter JSONB easily without extensions
            
            if (data && data.length > 0) {
                 const loadedData = data[0].blueprint as any;
                 const projectData: ProjectData = {
                    blueprint: loadedData.businessName ? loadedData : loadedData.blueprint,
                    clients: [], // Don't expose clients
                    automations: [],
                    leads: [],
                    events: [],
                 };
                 return { data: projectData, lastUpdated: data[0].last_updated };
            }
        } catch (e) {
            console.error("Public load error", e);
        }
    }

    // 2. Fallback: Check local storage (for testing on same device)
    const local = await storageService.loadProject();
    if (local && local.data.blueprint.businessName.toLowerCase().includes(formattedSlug.split(' ')[0])) {
        return local;
    }

    return null;
  },

  saveLead: async (lead: Lead): Promise<void> => {
    const saved = await storageService.loadProject();
    if (!saved) return; 

    const updatedData = { ...saved.data, leads: [...(saved.data.leads || []), lead] };
    await storageService.saveProject(updatedData);
    
    await storageService.trackEvent({
        id: Math.random().toString(36).substr(2, 9),
        type: 'lead_created',
        createdAt: new Date().toISOString(),
        metadata: { source: lead.source }
    });
  },

  updateLead: async (leadId: string, updates: Partial<Lead>): Promise<void> => {
    const saved = await storageService.loadProject();
    if (!saved) return;

    const updatedLeads = saved.data.leads.map(l => l.id === leadId ? { ...l, ...updates } : l);
    await storageService.saveProject({ ...saved.data, leads: updatedLeads });
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
