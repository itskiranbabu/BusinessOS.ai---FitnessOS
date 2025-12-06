
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ProjectData, Template, TemplateCategory } from '../types';
import { authService } from './authService';

export const marketplaceService = {
  
  // Fetch all public templates
  getTemplates: async (category?: TemplateCategory): Promise<Template[]> => {
    if (!isSupabaseConfigured() || !supabase) return getMockTemplates();

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
      return getMockTemplates();
    }
    
    return data as Template[];
  },

  // Publish the current project as a template
  publishTemplate: async (
    projectData: ProjectData, 
    meta: { title: string; description: string; niche: string; price: number }
  ): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn("Supabase not connected. Cannot publish template.");
        return false;
    }

    const user = await authService.getCurrentUser();
    if (!user) return false;

    // Sanitize data: Remove specific clients, leads, and events before publishing
    const sanitizedConfig: ProjectData = {
        blueprint: projectData.blueprint,
        automations: projectData.automations,
        clients: [], // Do not share client PII
        leads: [],   // Do not share lead PII
        events: [],  // Do not share analytics
        growthPlan: projectData.growthPlan
    };

    const { error } = await supabase.from('templates').insert({
        author_id: user.id,
        title: meta.title,
        description: meta.description,
        niche: meta.niche,
        price: meta.price,
        config: sanitizedConfig,
        is_public: true,
        category: 'full_system'
    });

    if (error) {
        console.error("Publish error:", error);
        return false;
    }
    return true;
  },

  // "Install" a template (overwrite current project for MVP)
  installTemplate: async (templateId: string): Promise<ProjectData | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        const mock = getMockTemplates().find(t => t.id === templateId);
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

    // Increment install count
    await supabase.rpc('increment_install_count', { template_id: templateId });

    return data.config as ProjectData;
  }
};

// --- RICH MOCK DATA FOR UI PREVIEW ---
const getMockTemplates = (): Template[] => [
  {
    id: '1',
    author_id: 'mock-auth',
    title: 'High-Ticket Coach OS',
    description: 'The exact system used to scale to $50k/mo. Includes webinar funnel, 7-day email sequence, and high-converting copy.',
    category: 'full_system',
    niche: 'Coaching',
    price: 0,
    is_public: true,
    install_count: 1240,
    rating: 4.8,
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
    price: 4900, // $49
    is_public: true,
    install_count: 850,
    rating: 4.5,
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
