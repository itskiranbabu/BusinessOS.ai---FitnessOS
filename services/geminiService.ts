
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessBlueprint, SocialPost, GrowthPlan } from "../types";

// Initialize Gemini Client
// NOTE: Vercel Env Vars are injected via Vite 'define' plugin into process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const blueprintSchema = {
  type: Type.OBJECT,
  properties: {
    businessName: { type: Type.STRING, description: "A catchy name for the fitness business" },
    niche: { type: Type.STRING, description: "The specific fitness niche (e.g. Postpartum weight loss, Senior mobility)" },
    targetAudience: { type: Type.STRING, description: "Description of the ideal client" },
    mission: { type: Type.STRING, description: "A short mission statement" },
    suggestedPrograms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 program names to sell"
    },
    websiteData: {
      type: Type.OBJECT,
      properties: {
        heroHeadline: { type: Type.STRING },
        heroSubhead: { type: Type.STRING },
        ctaText: { type: Type.STRING },
        features: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 key benefits/features"
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
          hook: { type: Type.STRING },
          body: { type: Type.STRING },
          cta: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Video', 'Image', 'Carousel', 'Text'] }
        }
      },
      description: "A 5-day sample content plan"
    }
  },
  required: ["businessName", "niche", "websiteData", "contentPlan", "suggestedPrograms"]
};

export const generateBusinessBlueprint = async (userDescription: string): Promise<BusinessBlueprint | null> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("No API Key provided in environment variables. Returning mock data.");
      return getMockBlueprint();
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert business consultant for Fitness Coaches. 
      Create a complete business blueprint (Website copy, content plan, pricing) based on this user description: "${userDescription}".
      Focus on high-conversion copywriting and realistic fitness programming.`,
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
    // Fallback for demo purposes if API fails or key is missing
    return getMockBlueprint();
  }
};

export const regenerateContentPlan = async (niche: string): Promise<SocialPost[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided. Returning mock content.");
    return getMockBlueprint().contentPlan;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 fresh, viral social media post ideas for a fitness coach in the "${niche}" niche. 
      Focus on engagement and authority building.`,
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
  if (!process.env.API_KEY) {
    console.warn("No API Key. Returning mock growth plan.");
    return getMockGrowthPlan();
  }

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
      contents: `You are a Growth Hacker for fitness businesses.
      The business is in the "${niche}" niche.
      Current Stats: ${stats.leads} Leads, ${stats.clients} Clients, ${stats.conversionRate} Conversion Rate.
      
      Generate a tactical Growth Plan with 3 experiments to increase leads/conversions, and 3 templates for messaging leads.`,
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
      description: "Create a simple PDF guide resolving one specific pain point and promote it on socials.",
      steps: ["Write 5 tips for back pain", "Create PDF in Canva", "Post on IG Stories with 'DM me GUIDE'"],
      expectedImpact: "High Lead Generation"
    },
    {
      title: "Win-Back Campaign",
      description: "Re-engage old leads who never bought.",
      steps: ["Export Lead list", "Send personal voice note on WhatsApp", "Offer 10% off for 48h"],
      expectedImpact: "Immediate Revenue"
    }
  ],
  suggestedMessages: [
    {
      channel: "WhatsApp",
      copy: "Hey [Name], saw you were interested in getting fit. I made a quick video on 3 mistakes to avoid. Want me to send it?",
      context: "New Lead Outreach"
    }
  ]
});

// Fallback mock data generator to ensure app is usable without API key immediately
const getMockBlueprint = (): BusinessBlueprint => {
  return {
    businessName: "IronWill Fitness (Demo Mode)",
    niche: "Strength Training for Busy Dads",
    targetAudience: "Fathers over 30 who want to reclaim their athleticism",
    mission: "To help 10,000 dads get strong and pain-free.",
    suggestedPrograms: ["DadBod Destroyer", "Mobility Mastery", "Elite Dad Coaching"],
    websiteData: {
      heroHeadline: "Reclaim Your Prime Years",
      heroSubhead: "The premier strength system designed specifically for busy fathers. Get strong, lose fat, and have energy for your kids.",
      ctaText: "Start Your Transformation",
      features: ["30-Minute Workouts", "Custom Nutrition Plan", "24/7 Coach Access"],
      pricing: [
        { name: "Basic", price: "$97/mo", features: ["App Access", "Community"] },
        { name: "Pro", price: "$297/mo", features: ["Weekly Check-in", "Form Review"] }
      ],
      testimonials: [
        { name: "Mike T.", result: "Lost 20lbs", quote: "I feel 10 years younger." }
      ]
    },
    contentPlan: [
      { id: "1", day: 1, hook: "Stop doing crunches.", body: "They won't fix your belly.", cta: "DM 'CORE' for my guide", type: "Video" },
      { id: "2", day: 2, hook: "The dad breakfast hack.", body: "High protein, low time.", cta: "Comment 'RECIPE'", type: "Image" }
    ]
  };
};
