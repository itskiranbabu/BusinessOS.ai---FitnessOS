// services/storageService.ts
import {
  ProjectData,
  SavedProject,
  ClientStatus,
  Lead,
  AnalyticsEvent,
  GrowthPlan,
  Client,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './authService';

const LOCAL_STORAGE_KEY = 'business_os_project_v2';

const DEFAULT_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Sample Client',
    email: 'client@example.com',
    status: ClientStatus.LEAD,
    program: 'Interested',
    joinDate: new Date().toISOString().split('T')[0],
    lastCheckIn: 'Never',
    progress: 0,
  },
];

export const storageService = {
  // -------------------------------------------------------
  // PROJECT SAVE / LOAD
  // -------------------------------------------------------
  saveProject: async (projectData: ProjectData): Promise<boolean> => {
    const saveData: SavedProject = {
      data: projectData,
      lastUpdated: new Date().toISOString(),
    };

    // Try Supabase first
    if (isSupabaseConfigured() && supabase) {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const slug = projectData.blueprint.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

          const { error } = await supabase.from('projects').upsert({
            user_id: user.id,
            blueprint: saveData.data,
            public_slug: slug,
            last_updated: saveData.lastUpdated,
          });

          if (error) throw error;
          return true;
        }
      } catch (error) {
        console.error('[storageService.saveProject] Supabase save failed', error);
      }
    }

    // Fallback: localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('[storageService.saveProject] Local save failed', error);
      return false;
    }
  },

  loadProject: async (): Promise<SavedProject | null> => {
    // Prefer Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const { data, error } = await supabase
            .from('projects')
            .select('blueprint, last_updated')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('[storageService.loadProject] Supabase error', error);
          }

          if (data && data.blueprint) {
            const loadedData = data.blueprint as any;

            const projectData: ProjectData = {
              blueprint: loadedData.businessName
                ? loadedData
                : loadedData.blueprint,
              clients: loadedData.clients || DEFAULT_CLIENTS,
              automations: loadedData.automations || [],
              leads: [], // Leads now come from SQL via fetchLeads
              events: loadedData.events || [],
              growthPlan: loadedData.growthPlan || undefined,
            };

            return {
              data: projectData,
              lastUpdated: data.last_updated,
            };
          }
        }
      } catch (error) {
        console.error('[storageService.loadProject] Supabase load failed', error);
      }
    }

    // Fallback: localStorage
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data) as SavedProject;
      return parsed;
    } catch (error) {
      console.error('[storageService.loadProject] Local load failed', error);
      return null;
    }
  },

  loadPublicProjectBySlug: async (
    slug: string,
  ): Promise<SavedProject | null> => {
    const formattedSlug = slug.toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('blueprint, last_updated')
          .eq('public_slug', formattedSlug)
          .single();

        if (error) {
          console.error(
            '[storageService.loadPublicProjectBySlug] Supabase error',
            error,
          );
        }

        if (data && data.blueprint) {
          const loadedData = data.blueprint as any;

          const projectData: ProjectData = {
            blueprint: loadedData.businessName
              ? loadedData
              : loadedData.blueprint,
            clients: [],
            automations: [],
            leads: [],
            events: [],
          };

          return {
            data: projectData,
            lastUpdated: data.last_updated,
          };
        }
      } catch (error) {
        console.error(
          '[storageService.loadPublicProjectBySlug] Supabase load failed',
          error,
        );
      }
    }

    return null;
  },

  // -------------------------------------------------------
  // LEADS (Supabase inbound_leads)
  // -------------------------------------------------------
  saveLead: async (lead: Lead): Promise<void> => {
    // Primary path: Supabase with inbound_leads table
    if (isSupabaseConfigured() && supabase) {
      try {
        console.log('[storageService.saveLead] Inserting into inbound_leads…');

        // Infer slug when used on public site: /p/:slug
        let projectId: string | null = null;
        try {
          if (typeof window !== 'undefined') {
            const parts = window.location.pathname.split('/p/');
            if (parts.length > 1) {
              const slug = parts[1];
              const { data } = await supabase
                .from('projects')
                .select('user_id')
                .eq('public_slug', slug)
                .single();
              if (data) {
                projectId = data.user_id;
              }
            }
          }
        } catch (e) {
          console.warn('[storageService.saveLead] slug lookup failed', e);
        }

        const payload: any = {
          project_id: projectId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone ?? null,
          message: (lead as any).message ?? null,
          status: lead.status ?? 'New',
          source: lead.source ?? 'Website Capture',
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('inbound_leads')
          .insert(payload);

        if (error) {
          console.error(
            '[storageService.saveLead] Supabase insert error:',
            error,
          );
          throw error;
        }

        // Track analytics event in the project JSON
        await storageService.trackEvent({
          id: Math.random().toString(36).substr(2, 9),
          type: 'lead_created',
          createdAt: new Date().toISOString(),
          metadata: { source: payload.source },
        });

        console.log(
          '[storageService.saveLead] ✅ Lead saved to inbound_leads:',
          payload,
        );
        return;
      } catch (err) {
        console.error(
          '[storageService.saveLead] ❌ Failed to save lead in Supabase – will fallback to localStorage',
          err,
        );
        // then fallback
      }
    }

    // Fallback: localStorage only (dev / no Supabase)
    console.warn(
      '[storageService.saveLead] Supabase not configured – using localStorage fallback',
    );
    const saved = await storageService.loadProject();
    if (saved) {
      const updatedData: ProjectData = {
        ...saved.data,
        leads: [...(saved.data.leads || []), lead],
      };
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          data: updatedData,
          lastUpdated: new Date().toISOString(),
        }),
      );
    }
  },

  fetchLeads: async (): Promise<Lead[]> => {
    if (isSupabaseConfigured() && supabase) {
      try {
        console.log(
          '[storageService.fetchLeads] Loading leads from inbound_leads…',
        );
        const user = await authService.getCurrentUser();

        let query = supabase.from('inbound_leads').select('*');

        // If you later want per-owner filtering:
        if (user) {
          query = query.eq('project_id', user.id);
        }

        const { data, error } = await query.order('created_at', {
          ascending: false,
        });

        if (error) {
          console.error(
            '[storageService.fetchLeads] Supabase select error:',
            error,
          );
          return [];
        }

        return (data || []).map((d: any) => ({
          id: d.id?.toString() ?? Math.random().toString(36).substr(2, 9),
          project_id: d.project_id ?? undefined,
          name: d.name,
          email: d.email,
          phone: d.phone ?? undefined,
          message: d.message ?? undefined,
          status: (d.status as Lead['status']) || 'New',
          createdAt: d.created_at || new Date().toISOString(),
          source: d.source || 'Website',
        }));
      } catch (err) {
        console.error(
          '[storageService.fetchLeads] ❌ Failed to fetch from Supabase:',
          err,
        );
        return [];
      }
    }

    // Fallback: read leads from JSON blob
    console.warn(
      '[storageService.fetchLeads] Supabase not configured – reading leads from project JSON',
    );
    const saved = await storageService.loadProject();
    return saved?.data?.leads || [];
  },

  updateLead: async (
    leadId: string,
    updates: Partial<Lead>,
  ): Promise<void> => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('inbound_leads')
          .update(updates)
          .eq('id', leadId);

        if (error) {
          console.error(
            '[storageService.updateLead] Supabase update error:',
            error,
          );
        }
      } catch (err) {
        console.error(
          '[storageService.updateLead] Failed to update lead:',
          err,
        );
      }
    }
  },

  // -------------------------------------------------------
  // ANALYTICS / GROWTH PLAN
  // -------------------------------------------------------
  trackEvent: async (event: AnalyticsEvent): Promise<void> => {
    const saved = await storageService.loadProject();
    if (!saved) return;

    const updatedEvents = [...(saved.data.events || []), event];
    await storageService.saveProject({
      ...saved.data,
      events: updatedEvents,
    });
  },

  saveGrowthPlan: async (plan: GrowthPlan): Promise<void> => {
    const saved = await storageService.loadProject();
    if (!saved) return;

    await storageService.saveProject({
      ...saved.data,
      growthPlan: plan,
    });
  },
};
