
export interface ProviderField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'boolean';
  options?: { label: string; value: string }[];
  placeholder?: string;
  description?: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  category: 'sms' | 'whatsapp' | 'callcenter' | 'payment' | 'cargo' | 'ai';
  logo?: string; // Icon name or URL
  description: string;
  fields: ProviderField[];
  isActive: boolean;
  isConfigured: boolean;
  credentials: Record<string, any>;
}

export const PROVIDERS: ProviderConfig[] = [
  // --- SMS ---
  {
    id: 'netgsm',
    name: 'Netgsm',
    category: 'sms',
    description: 'Leading SMS provider in Turkey.',
    isActive: true,
    isConfigured: true,
    credentials: { username: 'demo', password: '', header: 'PAZARADS' },
    fields: [
      { key: 'username', label: 'Kullanıcı Adı', type: 'text', placeholder: '850xxxxxxx' },
      { key: 'password', label: 'Şifre', type: 'password' },
      { key: 'header', label: 'SMS Başlığı', type: 'text', description: 'Onaylı SMS başlığınız' }
    ]
  },
  {
    id: 'iletimerkezi',
    name: 'İleti Merkezi',
    category: 'sms',
    description: 'Reliable bulk SMS service.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'apiSecret', label: 'API Secret', type: 'password' },
      { key: 'senderId', label: 'Gönderici ID', type: 'text' }
    ]
  },
  {
    id: 'twilio_sms',
    name: 'Twilio SMS',
    category: 'sms',
    description: 'Global SMS messaging.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'accountSid', label: 'Account SID', type: 'text' },
      { key: 'authToken', label: 'Auth Token', type: 'password' },
      { key: 'fromNumber', label: 'From Number', type: 'text' }
    ]
  },

  // --- Payment ---
  {
    id: 'paytr',
    name: 'PayTR',
    category: 'payment',
    description: 'Virtual POS and payment solutions.',
    isActive: true,
    isConfigured: true,
    credentials: {},
    fields: [
      { key: 'merchantId', label: 'Mağaza No (Merchant ID)', type: 'text' },
      { key: 'merchantKey', label: 'Mağaza Parola (Merchant Key)', type: 'password' },
      { key: 'merchantSalt', label: 'Mağaza Gizli Anahtar (Merchant Salt)', type: 'password' }
    ]
  },
  {
    id: 'iyzico',
    name: 'Iyzico',
    category: 'payment',
    description: 'Easy payment processing.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' },
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.iyzipay.com' }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    description: 'Global payment infrastructure.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' }
    ]
  },

  // --- WhatsApp ---
  {
    id: 'meta_cloud',
    name: 'Meta Cloud API',
    category: 'whatsapp',
    description: 'Official WhatsApp Business API by Meta.',
    isActive: true,
    isConfigured: true,
    credentials: {},
    fields: [
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text' },
      { key: 'accessToken', label: 'Permanent Access Token', type: 'password' },
      { key: 'businessAccountId', label: 'Business Account ID', type: 'text' }
    ]
  },
  {
    id: '360dialog',
    name: '360dialog',
    category: 'whatsapp',
    description: 'Official WhatsApp Business API Partner.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'apiKey', label: 'D360-API-KEY', type: 'password' },
      { key: 'namespace', label: 'Namespace', type: 'text' }
    ]
  },
  {
    id: 'twilio_whatsapp',
    name: 'Twilio WhatsApp',
    category: 'whatsapp',
    description: 'WhatsApp Business API via Twilio.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'accountSid', label: 'Account SID', type: 'text' },
      { key: 'authToken', label: 'Auth Token', type: 'password' },
      { key: 'fromNumber', label: 'From Number (WhatsApp)', type: 'text' }
    ]
  },

  // --- Call Center ---
  {
    id: 'alotech',
    name: 'AloTech',
    category: 'callcenter',
    description: 'Cloud call center software.',
    isActive: true,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'apiKey', label: 'App Key', type: 'text' },
      { key: 'appToken', label: 'App Token', type: 'password' },
      { key: 'tenant', label: 'Tenant Name', type: 'text' }
    ]
  },
  {
    id: 'ccs',
    name: 'Call Center Studio',
    category: 'callcenter',
    description: 'Cloud native call center solution.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'tenant', label: 'Tenant / Domain', type: 'text' }
    ]
  },
  {
    id: 'twilio',
    name: 'Twilio Voice',
    category: 'callcenter',
    description: 'Programmable voice and calls.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'accountSid', label: 'Account SID', type: 'text' },
      { key: 'authToken', label: 'Auth Token', type: 'password' },
      { key: 'twimlAppSid', label: 'TwiML App SID', type: 'text' }
    ]
  },
  {
    id: 'netgsm_pbx',
    name: 'NetGSM Sanal Santral',
    category: 'callcenter',
    description: 'NetGSM Virtual PBX integration.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'username', label: 'Kullanıcı Adı', type: 'text' },
      { key: 'password', label: 'Şifre', type: 'password' },
      { key: 'header', label: 'Başlık', type: 'text' }
    ]
  },

  // --- Cargo ---
  {
    id: 'fest',
    name: 'Fest Kargo (Ajan.NET)',
    category: 'cargo',
    description: 'Ajan.NET altyapılı Fest Kargo entegrasyonu.',
    isActive: true,
    isConfigured: true,
    credentials: {
      baseUrl: 'http://185.241.103.28:90',
      apiKey: 'CRW5vY0OQjchsmwXEzg4PkMbGFpDt98rxAKaHLIB',
      fromEmail: 'trendyollasana@festcargo.com'
    },
    fields: [
      { key: 'baseUrl', label: 'Panel URL', type: 'text', placeholder: 'http://185.241.103.28:90' },
      { key: 'apiKey', label: 'Api Authorization Key', type: 'password' },
      { key: 'fromEmail', label: 'Api From Email', type: 'text' }
    ]
  },
  {
    id: 'yurtici',
    name: 'Yurtiçi Kargo',
    category: 'cargo',
    description: 'Direct integration.',
    isActive: false,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'username', label: 'Kullanıcı Adı', type: 'text' },
      { key: 'password', label: 'Şifre', type: 'password' },
      { key: 'customerCode', label: 'Müşteri Kodu', type: 'text' }
    ]
  },

  // --- AI ---
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    description: 'GPT-4 and GPT-3.5 Turbo.',
    isActive: true,
    isConfigured: true,
    credentials: {},
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'model', label: 'Default Model', type: 'select', options: [{ label: 'GPT-4o', value: 'gpt-4o' }, { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }] }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'ai',
    description: 'Gemini Pro and Flash models.',
    isActive: true,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' }
    ]
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    category: 'ai',
    description: 'Claude 3 Opus, Sonnet and Haiku.',
    isActive: true,
    isConfigured: false,
    credentials: {},
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' }
    ]
  }
];
