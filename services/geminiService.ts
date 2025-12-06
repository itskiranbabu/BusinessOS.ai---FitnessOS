import { GoogleGenAI, Type } from "@google/genai";
import { BusinessBlueprint, SocialPost, GrowthPlan } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Expanded schema to support High-Conversion Funnel
const blueprintSchema = {
  type: Type.OBJECT,
  properties: {
    businessName: { type: Type.STRING, description: "A premium, catchy name for the fitness business" },
    niche: { type: Type.STRING, description: "The specific fitness niche" },
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
        heroHeadline: { type: Type.STRING, description: "H1: High-converting promise" },
        heroSubhead: { type: Type.STRING, description: "H2: How it works / The mechanism" },
        ctaText: { type: Type.STRING, description: "Action-oriented button text" },
        problem: { type: Type.STRING, description: "Agitate the customer's pain point" },
        solution: { type: Type.STRING, description: "Present the methodology as the only solution" },
        coachBio: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            headline: { type: Type.STRING },
            story: { type: Type.STRING, description: "Short, authority-building backstory" }
          }
        },
        features: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
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
        },
        faq: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            }
          },
          description: "3-5 common objections answered"
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
      }
    }
  },
  required: ["businessName", "niche", "websiteData", "contentPlan", "suggestedPrograms"]
};

// NEW: Function to enhance the user's raw input
export const enhanceUserPrompt = async (rawInput: string): Promise<string> => {
  if (!apiKey || !rawInput.trim()) return rawInput;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a professional prompt engineer for a business building AI.
      
      User Input: "${rawInput}"
      
      Task: Rewrite this input into a specific, high-ticket fitness business concept. 
      Include: The specific target audience, the unique mechanism/method, and the pricing model (high ticket/hybrid).
      Keep it under 30 words. Make it sound professional and lucrative.
      
      Example Input: "yoga for moms"
      Example Output: "A high-ticket post-natal recovery yoga program for executive mothers, focusing on core rebuilding and stress management via a hybrid digital-coaching model."`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    });

    return response.text?.trim() || rawInput;
  } catch (error) {
    console.error("Enhancement failed", error);
    return rawInput;
  }
};

export const generateBusinessBlueprint = async (userDescription: string): Promise<BusinessBlueprint | null> => {
  try {
    if (!apiKey) {
      console.warn("No API Key provided. Returning mock data.");
      return getMockBlueprint();
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `ACT AS AN ELITE BUSINESS STRATEGIST (Alex Hormozi / David Goggins hybrid).
      
      User Input: "${userDescription}"

      Your task: Build a $1M/year fitness coaching offer.
      
      CHAIN OF THOUGHT:
      1. Identify the bleeding neck problem for this audience.
      2. Construct a "Grand Slam Offer" (High value, high price).
      3. Write copy that hits emotional triggers (Status, Fear, Vanity).
      4. Design a content plan that is polarizing and viral.

      OUTPUT INSTRUCTIONS:
      - Pricing: Tier 1 ($97-$197/mo), Tier 2 ($297-$497/mo), Tier 3 ($997+ High Ticket).
      - Copy: Punchy, direct, no fluff.
      - FAQ: Handle objections like "I don't have time" or "I've failed before".
      
      Return JSON only matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: blueprintSchema,
        temperature: 0.75,
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
      contents: `You are a viral content strategist. Generate 5 polarizing, high-engagement post ideas for the "${niche}" fitness niche.
      Use hooks that stop the scroll (e.g. "Stop doing cardio", "Why your diet failed").`,
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
      contents: `Role: Growth Hacker. Niche: "${niche}". Stats: ${JSON.stringify(stats)}.
      Generate 3 growth experiments to double leads and 3 sales scripts to close high-ticket deals.`,
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
      problem: "You're tired, achy, and losing your edge.",
      solution: "A proven strength protocol that takes 30 mins.",
      coachBio: {
        name: "Coach Mike",
        headline: "Ex-Military turned Dad Coach",
        story: "I know what it's like to have zero time."
      },
      features: ["30-Min Workouts", "Nutrition Plan", "1-on-1 Coaching"],
      pricing: [
        { name: "Basic", price: "$97/mo", features: ["App Access"] },
        { name: "Pro", price: "$297/mo", features: ["Weekly Check-in"] }
      ],
      testimonials: [
        { name: "Mike", result: "-20lbs", quote: "Changed my life." }
      ],
      faq: [
        { question: "Do I need a gym?", answer: "No, home workouts included." }
      ],
      urgencySettings: {
        enabled: true,
        bannerText: "Only 3 spots left this month",
        spotsLeft: 3
      }
    },
    contentPlan: [
      { id: "1", day: 1, hook: "Stop running.", body: "Lift weights instead.", cta: "DM me", type: "Video" }
    ]
  };
};