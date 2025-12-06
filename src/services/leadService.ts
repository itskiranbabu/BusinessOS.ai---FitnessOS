// src/services/leadService.ts
import { supabase } from '../lib/supabaseClient'; // <-- adjust path if needed

export interface Lead {
  id: string;
  projectId: string | null;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status?: string;
  source?: string;
  createdAt?: string;
}

/**
 * Infer project / slug from public URL (/p/:slug)
 * Used by PublicSite to attach the lead to a project if possible.
 */
function getSlugFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  const parts = window.location.pathname.split('/p/');
  return parts.length > 1 ? parts[1] : null;
}

/**
 * Resolve project_id for the current slug.
 * If we can't find a project, we'll still save the lead with projectId = null (MVP acceptable).
 */
async function resolveProjectIdForSlug(): Promise<string | null> {
  const slug = getSlugFromLocation();
  if (!slug) return null;

  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('public_slug', slug)
    .single();

  if (error) {
    console.warn('[leadService] Could not resolve project for slug:', slug, error.message);
    return null;
  }

  return data?.id ?? null;
}

/**
 * Create a new inbound lead from the public funnel.
 */
export async function createLead(input: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
}): Promise<void> {
  const projectId = await resolveProjectIdForSlug();

  const payload: any = {
    project_id: projectId,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    message: input.message ?? null,
    status: 'New',
    source: input.source ?? 'Website',
  };

  const { error } = await supabase.from('inbound_leads').insert(payload);

  if (error) {
    console.error('[leadService] Lead insert error:', error);
    throw error;
  }

  console.log('[leadService] ✅ Lead stored in inbound_leads:', payload);
}

/**
 * Fetch leads for current authenticated user (optionally filtered by project).
 * For now we just fetch all leads – RLS already limits visibility to authenticated users.
 */
export async function getLeads(projectId?: string): Promise<Lead[]> {
  let query = supabase
    .from('inbound_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[leadService] Fetch leads error:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    message: row.message ?? undefined,
    status: row.status ?? 'New',
    source: row.source ?? 'Website',
    createdAt: row.created_at,
  }));
}
