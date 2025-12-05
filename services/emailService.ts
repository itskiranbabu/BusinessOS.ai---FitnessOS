
import emailjs from '@emailjs/browser';

// Load keys from environment via process.env (polyfilled in vite.config.ts)
const SERVICE_ID = process.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = process.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = process.env.VITE_EMAILJS_PUBLIC_KEY || '';

export const emailService = {
  _delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Sends a dynamic welcome email.
   */
  sendWelcomeEmail: async (
    toEmail: string, 
    clientName: string,
    businessName: string,
    coachName: string,
    publicUrl: string
  ): Promise<boolean> => {
    console.log(`[Email Service] Attempting to send to ${toEmail}...`);

    // Fallback if keys are missing
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.warn("[Email Service] Keys missing. Check Vercel Env Vars. Simulating success.");
      await emailService._delay(800);
      return true;
    }

    try {
      const templateParams = {
        to_email: toEmail,
        client_name: clientName,
        business_name: businessName,
        coach_name: coachName,
        public_url: publicUrl,
        client_goal: "Transforming your health",
      };

      // Explicitly pass PUBLIC_KEY here to avoid init() issues
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      
      console.log(`[Email Service] ✅ REAL EMAIL SENT via EmailJS to ${toEmail}`);
      return true;
    } catch (error) {
      console.error("[Email Service] ❌ Failed to send real email:", error);
      return false; 
    }
  },

  sendCheckInEmail: async (toEmail: string, clientName: string, businessName: string): Promise<boolean> => {
    // For check-ins, we currently simulate
    await emailService._delay(600);
    console.log(`[Email Service] (Simulated) Check-in sent to ${toEmail}`);
    return true;
  },

  // --- NEW: Real-Time Communication Helpers ---

  sendWhatsApp: (phone: string, message: string) => {
    if (!phone) return;
    // Remove non-numeric chars
    const cleanPhone = phone.replace(/[^0-9]/g, ''); 
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  },

  sendSMS: (phone: string, message: string) => {
    if (!phone) return;
    // Remove non-numeric chars
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = url;
  }
};
