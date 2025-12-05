import { GoogleGenAI, Type } from "@google/genai";
import { BusinessBlueprint, SocialPost, GrowthPlan } from "../types";

// Initialize Gemini Client
// NOTE: Vercel Env Vars are injected via Vite 'define' plugin into process.env
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const blueprintSchema = {
  type: Type.OBJECT,
  properties: {
    businessName: { type: Type.STRING, description: "A premium, catchy name for the fitness business" },
    niche: { type: Type.STRING, description: "The specific fitness niche (e.g. Postpartum weight loss, Senior mobility)" },
    targetAudience: { type: Type.STRING, description: "Detailed description of the ideal client persona" },
    mission: { type: Type.STRING, description: "A compelling, emotionally resonant mission statement" },
    suggestedPrograms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 high-ticket program names"
    },
    websiteData: {
      type: Type.OBJECT,
      properties: {
        heroHeadline: { type: Type.STRING, description: "A high-converting H1 headline" },
        heroSubhead: { type: Type.STRING, description: "Persuasive H2 subheadline" },
        ctaText: { type: Type.STRING, description: "Action-oriented button text" },
        features: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 key benefits/features that solve pain points"
        },
        pricing: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              price: { type: Type.STRING },
              features: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        testimonials: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              result: { type: Type.STRING },
              quote: { type: Type.STRING }
            }
          }
        }
      }
    },
    contentPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          day: { type: Type.INTEGER },
          hook: { type: Type.STRING, description: "Viral opening hook" },
          body: { type: Type.STRING, description: "Educational or entertaining value" },
          cta: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Video', 'Image', 'Carousel', 'Text'] }
        }
      },
      description: "A 5-day sample content plan optimized for engagement"
    }
  },
  required: ["businessName", "niche", "websiteData", "contentPlan", "suggestedPrograms"]
};

export const generateBusinessBlueprint = async (userDescription: string): Promise<BusinessBlueprint | null> => {
  try {
    if (!apiKey) {
      console.warn("No API Key provided. Returning mock data.");
      return getMockBlueprint();
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `ACT AS A WORLD-CLASS BUSINESS STRATEGIST AND MARKETING EXPERT.
      
      Your goal is to build a highly profitable Fitness Coaching Business Blueprint based on this user input:
      "${userDescription}"
      
      1. ANALYZE the market gap and ideal customer psychology.
      2. GENERATE a premium brand identity (Name, Mission).
      3. WRITE high-conversion website copy (Hormozi-style offers).
      4. DESIGN a 3-tier pricing strategy (Low barrier, Core Offer, High Ticket).
      5. CREATE a viral content strategy for 5 days.
      
      The output must be strictly JSON format matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: blueprintSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as BusinessBlueprint;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getMockBlueprint();
  }
};

export const regenerateContentPlan = async (niche: string): Promise<SocialPost[]> => {
  if (!apiKey) return getMockBlueprint().contentPlan;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a Social Media Manager. Generate 5 new, viral post ideas for a fitness coach in the "${niche}" niche.
      Focus on 'Edutainment', controversy, or actionable tips.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              day: { type: Type.INTEGER },
              hook: { type: Type.STRING },
              body: { type: Type.STRING },
              cta: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['Video', 'Image', 'Carousel', 'Text'] }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as SocialPost[];
  } catch (error) {
    console.error("Content Gen Error", error);
    return [];
  }
};

export const generateGrowthPlan = async (
  niche: string, 
  stats: { leads: number; clients: number; conversionRate: string }
): Promise<GrowthPlan | null> => {
  if (!apiKey) return getMockGrowthPlan();

  const growthSchema = {
    type: Type.OBJECT,
    properties: {
      experiments: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedImpact: { type: Type.STRING }
          }
        }
      },
      suggestedMessages: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            channel: { type: Type.STRING, enum: ['Email', 'WhatsApp', 'SMS'] },
            copy: { type: Type.STRING },
            context: { type: Type.STRING }
          }
        }
      }
    },
    required: ["experiments", "suggestedMessages"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a Growth Hacker. Analyze: Niche="${niche}", Leads=${stats.leads}, Clients=${stats.clients}, ConvRate=${stats.conversionRate}.
      Generate 3 aggressive growth experiments and 3 sales scripts.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: growthSchema,
        temperature: 0.8,
      }
    });

    const text = response.text;
    if (!text) return null;
    const plan = JSON.parse(text);
    return {
      id: Date.now().toString(),
      experiments: plan.experiments,
      suggestedMessages: plan.suggestedMessages,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Growth Gen Error", error);
    return getMockGrowthPlan();
  }
};

const getMockGrowthPlan = (): GrowthPlan => ({
  id: "mock-growth",
  createdAt: new Date().toISOString(),
  experiments: [
    {
      title: "The 'Free Guide' Lead Magnet",
      description: "Create a simple PDF guide resolving one specific pain point.",
      steps: ["Write 5 tips", "Create PDF", "Post on IG Stories"],
      expectedImpact: "High Lead Gen"
    }
  ],
  suggestedMessages: [
    {
      channel: "WhatsApp",
      copy: "Hey [Name], saw you were interested in getting fit. Want me to send my free guide?",
      context: "New Lead Outreach"
    }
  ]
});

const getMockBlueprint = (): BusinessBlueprint => {
  return {
    businessName: "IronWill Fitness (Demo)",
    niche: "Strength Training",
    targetAudience: "Busy Dads",
    mission: "Help dads get strong.",
    suggestedPrograms: ["DadBod Destroyer", "Mobility Mastery", "Elite Coaching"],
    websiteData: {
      heroHeadline: "Reclaim Your Prime",
      heroSubhead: "The premier strength system for fathers.",
      ctaText: "Start Now",
      features: ["30-Min Workouts", "Nutrition Plan", "1-on-1 Coaching"],
      pricing: [
        { name: "Basic", price: "$97/mo", features: ["App Access"] },
        { name: "Pro", price: "$297/mo", features: ["Weekly Check-in"] }
      ],
      testimonials: [
        { name: "Mike", result: "-20lbs", quote: "Changed my life." }
      ]
    },
    contentPlan: [
      { id: "1", day: 1, hook: "Stop running.", body: "Lift weights instead.", cta: "DM me", type: "Video" }
    ]
  };
};