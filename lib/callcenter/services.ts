
/**
 * Call Center Integration Service Layer
 * Supports: AloTech, Call Center Studio, Twilio
 */

export interface ICallCenterService {
  providerName: string;
  initiateCall(phoneNumber: string): Promise<{ success: boolean; callId?: string; message?: string }>;
  endCall(callId: string): Promise<boolean>;
  getRecording(callId: string): Promise<string | null>;
}

// --- AloTech Implementation ---
export class AloTechService implements ICallCenterService {
  providerName = 'AloTech';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initiateCall(phoneNumber: string) {
    console.log(`[AloTech] Dialing ${phoneNumber} with key ${this.apiKey.substring(0, 4)}...`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, callId: `alo-${Date.now()}`, message: 'AloTech call started' };
  }

  async endCall(callId: string) {
    console.log(`[AloTech] Ending call ${callId}`);
    return true;
  }

  async getRecording(callId: string) {
    return `https://api.alotech.com/recordings/${callId}.mp3`;
  }
}

// --- Call Center Studio Implementation ---
export class CallCenterStudioService implements ICallCenterService {
  providerName = 'Call Center Studio';
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async initiateCall(phoneNumber: string) {
    console.log(`[CCS] Dialing ${phoneNumber} for tenant ${this.tenantId}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, callId: `ccs-${Date.now()}`, message: 'CCS Click-to-call triggered' };
  }

  async endCall(callId: string) {
    console.log(`[CCS] Ending call ${callId}`);
    return true;
  }

  async getRecording(callId: string) {
    return `https://api.callcenterstudio.com/v1/records/${callId}`;
  }
}

// --- Twilio Voice Implementation ---
export class TwilioService implements ICallCenterService {
  providerName = 'Twilio Voice';
  private accountSid: string;

  constructor(accountSid: string) {
    this.accountSid = accountSid;
  }

  async initiateCall(phoneNumber: string) {
    console.log(`[Twilio] Dialing ${phoneNumber} via Flex...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, callId: `tw-${Date.now()}`, message: 'Twilio call connected' };
  }

  async endCall(callId: string) {
    console.log(`[Twilio] Ending call ${callId}`);
    return true;
  }

  async getRecording(callId: string) {
    return `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Recordings/${callId}`;
  }
}

// Factory to get active service
export const getCallCenterService = (provider: 'alotech' | 'ccs' | 'twilio'): ICallCenterService => {
  // In a real app, these keys would come from ENV or Settings
  switch (provider) {
    case 'alotech': return new AloTechService('mock-alo-key');
    case 'ccs': return new CallCenterStudioService('mock-tenant-id');
    case 'twilio': return new TwilioService('mock-sid');
    default: return new AloTechService('mock-default');
  }
};
