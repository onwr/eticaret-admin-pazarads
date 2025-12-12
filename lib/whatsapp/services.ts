
import { WhatsappProvider } from '../../types';

export interface IWhatsappService {
  providerName: WhatsappProvider;
  sendTemplate(phone: string, templateName: string, language: string, components: any[]): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

// --- 360dialog Implementation ---
export class Dialog360Service implements IWhatsappService {
  providerName = WhatsappProvider.DIALOG360;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendTemplate(phone: string, templateName: string, language: string, components: any[]) {
    console.log(`[360dialog] Sending template '${templateName}' to ${phone}`);
    console.log('Variables:', components);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, messageId: `360-${Date.now()}` };
  }
}

// --- Twilio WhatsApp Implementation ---
export class TwilioWhatsappService implements IWhatsappService {
  providerName = WhatsappProvider.TWILIO;
  private accountSid: string;

  constructor(accountSid: string) {
    this.accountSid = accountSid;
  }

  async sendTemplate(phone: string, templateName: string, language: string, components: any[]) {
    console.log(`[Twilio WA] Sending template '${templateName}' to ${phone}`);
    await new Promise(resolve => setTimeout(resolve, 700));
    return { success: true, messageId: `tw-wa-${Date.now()}` };
  }
}

// --- Meta Cloud API Implementation ---
export class MetaCloudService implements IWhatsappService {
  providerName = WhatsappProvider.META_CLOUD;
  private accessToken: string;
  private phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  async sendTemplate(phone: string, templateName: string, language: string, components: any[]) {
    console.log(`[Meta Cloud] Sending template '${templateName}' to ${phone}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, messageId: `meta-${Date.now()}` };
  }
}

// Factory
export const getWhatsappService = (provider: WhatsappProvider): IWhatsappService => {
  switch (provider) {
    case WhatsappProvider.DIALOG360: return new Dialog360Service('mock-360-key');
    case WhatsappProvider.TWILIO: return new TwilioWhatsappService('mock-sid');
    case WhatsappProvider.META_CLOUD: return new MetaCloudService('mock-token', 'mock-phone-id');
    default: return new MetaCloudService('mock-token', 'mock-phone-id');
  }
};
