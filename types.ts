
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
  SETTINGS = 'SETTINGS',
}

export enum ClientStatus {
  LEAD = 'Lead',
  ACTIVE = 'Active',
  CHURNED = 'Churned',
}

export interface Client {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  program: string;
  joinDate: string;
  lastCheckIn: string;
  progress: number; // 0-100
  notes?: string;
  tags?: string[];
}

export interface Lead {
  id: string;
  projectId?: string;
  name: string;
  email: string;
  message?: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Archived';
  createdAt: string;
  source: string; // e.g., 'Website', 'Referral'
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

export interface WebsiteData {
  heroHeadline: string;
  heroSubhead: string;
  ctaText: string;
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

// Unified Project Data for Storage
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
