import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ProjectData, Template, TemplateCategory } from '../types';
import { authService } from './authService';

// --- PERSISTENT MOCK DATA ---
const MOCK_STORAGE_KEY = 'businessos_mock_templates';

const DEFAULT_MOCK_TEMPLATES: Template[] = [
  {
    id: '1',
    author_id: 'alex-hormozi-clone',
    title: 'High-Ticket Coach OS',
    description: 'The exact system used to scale to $50k/mo. Includes webinar funnel, 7-day email sequence, and high-converting copy.',
    category: 'full_system',
    niche: 'Coaching',
    price: 0,
    is_public: true,
    install_count: 1240,
    rating: 4.9,
    version: '2.1',
    verified: true,
    lastUpdated: '2 days ago',
    created_at: new Date().toISOString(),
    config: {
        blueprint: {
            businessName: "Elite Coach Systems",
            niche: "Business Coaching",
            targetAudience: "Consultants",
            mission: "Scale to 7-figures.",
            suggestedPrograms: ["Accelerator", "Mastermind"],
            contentPlan: [],
            websiteData: {
                heroHeadline: "Scale Your Consulting Business",
                heroSubhead: "The proven roadmap to consistent $50k months without burnout.",
                ctaText: "Apply for Accelerator",
                problem: "Feast or famine revenue cycles.",
                solution: "Automated client acquisition.",
                coachBio: { name: "Alex G.", headline: "Founder", story: "Scaled 3 agencies." },
                features: ["Automated Outreach", "Sales Script", "Fulfillment SOPs"],
                pricing: [{ name: "Growth", price: "$2,000", features: ["Course"] }],
                testimonials: [],
                faq: [{ question: "Is this for beginners?", answer: "Yes." }],
                urgencySettings: { enabled: true, bannerText: "2 Spots Left", spotsLeft: 2 }
            }
        },
        clients: [],
        leads: [],
        events: [],
        automations: [
            { id: 'a1', name: 'Webinar Follow-up', type: 'Email', trigger: 'Webinar Register', status: 'Active', stats: { sent: 1200, opened: '45%' } },
            { id: 'a2', name: 'Booked Call SMS', type: 'SMS', trigger: 'Call Scheduled', status: 'Active', stats: { sent: 300, opened: '98%' } }
        ]
    }
  },
  {
    id: '2',
    author_id: 'mock-auth',
    title: 'Local Gym Dominator',
    description: 'Lead capture funnel for 7-day pass. SMS automation included for immediate walk-ins.',
    category: 'funnel',
    niche: 'Fitness',
    price: 4900,
    is_public: true,
    install_count: 850,
    rating: 4.5,
    version: '1.0',
    verified: false,
    lastUpdated: '1 month ago',
    created_at: new Date().toISOString(),
    config: {
        blueprint: {
            businessName: "Iron Gym",
            niche: "Local Gym",
            targetAudience: "Locals",
            mission: "Get fit.",
            suggestedPrograms: ["7 Day Pass"],
            contentPlan: [],
            websiteData: {
                heroHeadline: "Try the Best Gym in Town",
                heroSubhead: "Claim your free 7-day pass today.",
                ctaText: "Get Free Pass",
                problem: "Boring gyms.",
                solution: "High energy training.",
                coachBio: { name: "Team Iron", headline: "Trainers", story: "We lift things." },
                features: ["Open 24/7", "Sauna", "Free Weights"],
                pricing: [],
                testimonials: [],
                faq: [],
                urgencySettings: { enabled: true, bannerText: "Offer ends soon", spotsLeft: 10 }
            }
        },
        clients: [],
        leads: [],
        events: [],
        automations: [
            { id: 'b1', name: 'Pass Claimed SMS', type: 'SMS', trigger: 'Form Submit', status: 'Active', stats: { sent: 850, opened: '99%' } }
        ]
    }
  }
];

const loadMockTemplates = (): Template[] => {
    const saved = localStorage.getItem(MOCK_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return DEFAULT_MOCK_TEMPLATES;
};

const saveMockTemplates = (templates: Template[]) => {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(templates));
};

export const marketplaceService = {
  
  getTemplates: async (category?: TemplateCategory): Promise<Template[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        const templates = loadMockTemplates();
        return templates.filter(t => category ? t.category === category : true);
    }

    let query = supabase
      .from('templates')
      .select('*')
      .eq('is_public', true)
      .order('install_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching templates:", error);
      return loadMockTemplates();
    }
    return data as Template[];
  },

  getAuthoredTemplates: async (): Promise<Template[]> => {
      const user = await authService.getCurrentUser();
      
      if (!isSupabaseConfigured() || !supabase) {
          // For mock mode, filter by the mock user ID (assuming 'mock-user-123')
          return loadMockTemplates().filter(t => t.author_id === 'mock-user-123');
      }

      if (!user) return [];

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('author_id', user.id);
      
      if (error) {
          console.error("Error fetching authored templates", error);
          return [];
      }
      return data as Template[];
  },

  publishTemplate: async (
    projectData: ProjectData, 
    meta: { title: string; description: string; niche: string; price: number }
  ): Promise<boolean> => {
    const sanitizedConfig: ProjectData = {
        blueprint: projectData.blueprint,
        automations: projectData.automations,
        clients: [], 
        leads: [],   
        events: [],  
        growthPlan: projectData.growthPlan
    };

    if (!isSupabaseConfigured() || !supabase) {
        console.warn("Using Mock Publish (Persistent).");
        const newTemplate: Template = {
            id: Math.random().toString(36).substr(2, 9),
            author_id: 'mock-user-123',
            title: meta.title,
            description: meta.description,
            niche: meta.niche,
            price: meta.price,
            category: 'full_system',
            is_public: true,
            install_count: 0,
            rating: 0,
            version: '1.0',
            verified: false,
            lastUpdated: 'Just now',
            created_at: new Date().toISOString(),
            config: sanitizedConfig
        };
        const current = loadMockTemplates();
        saveMockTemplates([...current, newTemplate]);
        return true;
    }

    const user = await authService.getCurrentUser();
    if (!user) return false;

    const { error } = await supabase.from('templates').insert({
        author_id: user.id,
        title: meta.title,
        description: meta.description,
        niche: meta.niche,
        price: meta.price,
        config: sanitizedConfig,
        is_public: true,
        category: 'full_system',
        version: '1.0',
        verified: false,
        install_count: 0,
        rating: 0
    });

    if (error) {
        console.error("Publish error:", error);
        return false;
    }
    return true;
  },

  updateTemplate: async (id: string, updates: Partial<Template>): Promise<boolean> => {
      if (!isSupabaseConfigured() || !supabase) {
          const current = loadMockTemplates();
          const updated = current.map(t => t.id === id ? { ...t, ...updates } : t);
          saveMockTemplates(updated);
          return true;
      }
      
      const { error } = await supabase.from('templates').update(updates).eq('id', id);
      return !error;
  },

  deleteTemplate: async (id: string): Promise<boolean> => {
      if (!isSupabaseConfigured() || !supabase) {
          const current = loadMockTemplates();
          const updated = current.filter(t => t.id !== id);
          saveMockTemplates(updated);
          return true;
      }

      const { error } = await supabase.from('templates').delete().eq('id', id);
      return !error;
  },

  installTemplate: async (templateId: string): Promise<ProjectData | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        const mock = loadMockTemplates().find(t => t.id === templateId);
        return mock ? mock.config : null;
    }

    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();

    if (error || !data) {
        console.error("Install error:", error);
        return null;
    }

    await supabase.rpc('increment_install_count', { template_id: templateId });

    return data.config as ProjectData;
  }
};
