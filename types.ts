export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  CRM = 'CRM',
  LEADS = 'LEADS',
  WEBSITE = 'WEBSITE',
  CONTENT = 'CONTENT',
  AUTOMATIONS = 'AUTOMATIONS',
  PAYMENTS = 'PAYMENTS',
  GROWTH = 'GROWTH',
  MARKETPLACE = 'MARKETPLACE',
  SETTINGS = 'SETTINGS',
}

export enum ClientStatus {
  LEAD = 'Lead',
  ACTIVE = 'Active',
  CHURNED = 'Churned',
}

export enum NotificationType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    WHATSAPP = 'WHATSAPP'
}

export type TemplateCategory = 'full_system' | 'funnel' | 'automation' | 'content_pack';

export interface Template {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  niche: string;
  price: number;
  is_public: boolean;
  install_count: number;
  rating: number;
  preview_image_url?: string;
  config: ProjectData; 
  created_at: string;
  version: string;
  verified: boolean;
  lastUpdated: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: ClientStatus;
  program: string;
  joinDate: string;
  lastCheckIn: string;
  progress: number;
  notes?: string;
  tags?: string[];
}

export interface Lead {
  id: string;
  project_id?: string; // Changed to match DB column
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Archived';
  createdAt: string;
  source: string;
}

export interface AnalyticsEvent {
  id: string;
  projectId?: string;
  type: 'page_view' | 'lead_created' | 'client_converted' | 'automation_triggered';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  day: number;
  hook: string;
  body: string;
  cta: string;
  type: 'Video' | 'Image' | 'Carousel' | 'Text';
  status?: 'Draft' | 'Scheduled' | 'Published';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface WebsiteData {
  heroHeadline: string;
  heroSubhead: string;
  ctaText: string;
  problem: string; 
  solution: string; 
  coachBio: {
    name: string;
    headline: string;
    story: string;
  };
  features: string[];
  pricing: {
    name: string;
    price: string;
    features: string[];
  }[];
  testimonials: {
    name: string;
    result: string;
    quote: string;
  }[];
  faq: FAQItem[];
  urgencySettings?: {
    enabled: boolean;
    bannerText: string;
    spotsLeft: number;
  };
  publishedUrl?: string;
}

export interface GrowthExperiment {
  title: string;
  description: string;
  steps: string[];
  expectedImpact: string;
}

export interface SuggestedMessage {
  channel: 'Email' | 'WhatsApp' | 'SMS';
  copy: string;
  context: string;
}

export interface GrowthPlan {
  id: string;
  experiments: GrowthExperiment[];
  suggestedMessages: SuggestedMessage[];
  createdAt: string;
}

export interface BusinessBlueprint {
  businessName: string;
  niche: string;
  targetAudience: string;
  mission: string;
  websiteData: WebsiteData;
  contentPlan: SocialPost[];
  suggestedPrograms: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Automation {
  id: string;
  name: string;
  type: 'Email' | 'WhatsApp' | 'SMS';
  trigger: string;
  status: 'Active' | 'Paused';
  stats: {
    sent: number;
    opened: string;
  };
}

export interface ProjectData {
  blueprint: BusinessBlueprint;
  clients: Client[];
  leads: Lead[];
  automations: Automation[];
  events: AnalyticsEvent[];
  growthPlan?: GrowthPlan;
}

export interface SavedProject {
  data: ProjectData;
  lastUpdated: string;
}
