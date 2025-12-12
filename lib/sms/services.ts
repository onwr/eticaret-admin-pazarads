
import { SmsProvider } from '../../types';

export interface ISmsService {
  providerName: SmsProvider;
  send(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
  getBalance(): Promise<number>;
}

// --- Netgsm Implementation ---
export class NetgsmService implements ISmsService {
  providerName = SmsProvider.NETGSM;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(phone: string, message: string) {
    console.log(`[Netgsm] Sending to ${phone}: ${message}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, messageId: `netgsm-${Date.now()}` };
  }

  async getBalance() {
    return 1000; // Mock balance
  }
}

// --- IletiMerkezi Implementation ---
export class IletiMerkeziService implements ISmsService {
  providerName = SmsProvider.ILETIMERKEZI;
  private apiKey: string;
  private secret: string;

  constructor(apiKey: string, secret: string) {
    this.apiKey = apiKey;
    this.secret = secret;
  }

  async send(phone: string, message: string) {
    console.log(`[IletiMerkezi] Sending to ${phone}: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, messageId: `im-${Date.now()}` };
  }

  async getBalance() {
    return 500;
  }
}

// --- Twilio Implementation ---
export class TwilioSmsService implements ISmsService {
  providerName = SmsProvider.TWILIO;
  private sid: string;

  constructor(sid: string) {
    this.sid = sid;
  }

  async send(phone: string, message: string) {
    console.log(`[Twilio] Sending SMS to ${phone}: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, messageId: `tw-${Date.now()}` };
  }

  async getBalance() {
    return 20.50; // USD
  }
}

// Factory
export const getSmsService = (provider: SmsProvider): ISmsService => {
  switch (provider) {
    case SmsProvider.NETGSM: return new NetgsmService('mock-key');
    case SmsProvider.ILETIMERKEZI: return new IletiMerkeziService('mock-key', 'mock-secret');
    case SmsProvider.TWILIO: return new TwilioSmsService('mock-sid');
    default: return new NetgsmService('mock-default');
  }
};
