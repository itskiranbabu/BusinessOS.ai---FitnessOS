// src/services/emailService.ts
import emailjs from '@emailjs/browser';

// Vite will inline these at build time
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

console.log('[Email Service] Loaded config:', {
  SERVICE_ID_SET: !!SERVICE_ID,
  TEMPLATE_ID_SET: !!TEMPLATE_ID,
  PUBLIC_KEY_SET: !!PUBLIC_KEY,
});

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const emailService = {
  /**
   * Send a welcome email to a new lead.
   * Does not block the UI on failure.
   */
  async sendWelcomeEmail(
    toEmail: string,
    clientName: string,
    businessName: string,
    coachName: string,
    publicUrl: string
  ): Promise<boolean> {
    console.log('[Email Service] sendWelcomeEmail called with:', {
      toEmail,
      clientName,
      businessName,
      coachName,
      publicUrl,
    });

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      console.warn(
        '[Email Service] EmailJS keys missing. Skipping real email and simulating success.'
      );
      await delay(500);
      return true;
    }

    const templateParams = {
      to_email: toEmail,
      client_name: clientName,
      business_name: businessName,
      coach_name: coachName,
      public_url: publicUrl,
    };

    try {
      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );
      console.log('[Email Service] ✅ REAL EMAIL SENT via EmailJS:', result.status, result.text);
      return true;
    } catch (error) {
      console.error('[Email Service] ❌ Failed to send real email:', error);
      return false;
    }
  },
};
