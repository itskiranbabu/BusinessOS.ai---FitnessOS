
// Simulated Email Service
// In a real backend, this would connect to SendGrid, Resend, or AWS SES

export interface EmailTemplate {
  subject: string;
  body: string;
}

export const emailService = {
  // Simulate network latency for "Real Time" feel
  _delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  sendWelcomeEmail: async (to: string, businessName: string): Promise<boolean> => {
    console.log(`[Email Service] Sending Welcome Email to ${to}...`);
    await emailService._delay(800);
    
    // In production, you would make an API call here
    // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to, type: 'welcome' }) })
    
    console.log(`[Email Service] 📧 SENT: Welcome to ${businessName}`);
    return true;
  },

  sendCheckInEmail: async (to: string, clientName: string): Promise<boolean> => {
    console.log(`[Email Service] Sending Check-in Email to ${to}...`);
    await emailService._delay(600);
    
    console.log(`[Email Service] 📧 SENT: Weekly Check-in for ${clientName}`);
    return true;
  },

  sendGrowthReport: async (to: string, stats: any): Promise<boolean> => {
    console.log(`[Email Service] Sending Growth Report to ${to}...`);
    await emailService._delay(1000);
    console.log(`[Email Service] 📧 SENT: Growth Report`);
    return true;
  }
};
