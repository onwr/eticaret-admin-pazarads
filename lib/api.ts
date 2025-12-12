
import {
  Product, ProductFormData, ProductStatus,
  ProductPrice, PriceFormData,
  ProductVariant, VariantFormData,
  ProductReview, ReviewFormData,
  Order, OrderStatus, OrderLog, OrderFormData,
  Domain, DomainFormData, Template, Language,
  DashboardStats, CallOutcome, AgentStats,
  SmsTemplate, SmsTemplateFormData, SmsLog, SmsType, SmsProvider,
  WhatsappTemplate, WhatsappTemplateFormData, WhatsappLog, WhatsappProvider,
  AiRequest, AiResponse, AiTaskType, AiProvider,
  ShippingCompany, Shipment, CreateShipmentData, ShippingStatus,
  CreditCardForm, PaymentProvider, PaymentInitResult, PaymentStatus,
  Dealer, DealerFormData, DealerStats, User, UserRole, PermissionSet, RoleTemplate,
  Upsell, OrderItem,
  ExportTemplate, CustomStatus, StockMovementType, StockMovement, ActivityLog, GeneralSettings, LegalSettings, PixelSettings
} from '../types';
import {
  BlacklistItem, SecurityLog, SecurityEventType, RiskLevel
} from '../types/security';
import {
  mockProducts, mockOrders, mockOrderLogs, mockDomains, mockTemplates, mockLanguages,
  mockSmsTemplates, mockSmsLogs, mockWhatsappTemplates, mockWhatsappLogs, mockCallLogs, mockUsers, mockShippingCompanies, mockShipments, mockDealers, mockUpsells
} from '../utils/mockData';
import { aiService } from './ai/providers';
import { generateOrderNumber } from './utils/orderNumber';
import { paytrClient } from './payment/paytr';
import { iyzicoClient } from './payment/iyzico';
import { stripeClient } from './payment/stripe';
import { checkRateLimit } from './security/rateLimit';
import { detectFakeOrder } from './security/fakeDetection';
import { ProviderConfig, PROVIDERS } from './constants/providers';

// Mock Data Storage (in-memory)
let productsStore = [...mockProducts];
let ordersStore = mockOrders.map(o => ({
  ...o, items: o.items || [{
    productId: o.productId,
    productName: o.product?.name || 'Product',
    quantity: 1,
    unitPrice: o.totalAmount,
    totalPrice: o.totalAmount,
    image: o.product?.images[0]?.url
  }]
}));
let orderLogsStore = [...mockOrderLogs];
let domainsStore = [...mockDomains];
let templatesStore = [...mockTemplates];
let languagesStore = [...mockLanguages];
let smsTemplatesStore = [...mockSmsTemplates];
let smsLogsStore = [...mockSmsLogs];
let whatsappTemplatesStore = [...mockWhatsappTemplates];
let whatsappLogsStore = [...mockWhatsappLogs];
let callLogsStore = [...mockCallLogs];
let shipmentsStore = [...mockShipments];
let shippingCompaniesStore = [...mockShippingCompanies];
let dealersStore = [...mockDealers];
let usersStore = [...mockUsers];
let upsellsStore = [...mockUpsells];
let exportTemplatesStore: ExportTemplate[] = [
  {
    id: 'et1',
    name: 'Kargo Listesi (Örnek)',
    columns: [
      { id: 'c1', header: 'Sipariş No', type: 'DYNAMIC', value: 'orderNumber' },
      { id: 'c2', header: 'Alıcı Adı', type: 'DYNAMIC', value: 'customer.name' },
      { id: 'c3', header: 'Telefon', type: 'DYNAMIC', value: 'customer.phone' },
      { id: 'c4', header: 'Tutar', type: 'DYNAMIC', value: 'totalAmount' },
      { id: 'c5', header: 'Firma', type: 'STATIC', value: 'PAZARADS SHOP' },
    ]
  }
];
let customStatusesStore: CustomStatus[] = [];

// Security Stores
let blacklistStore: BlacklistItem[] = [
  { id: 'bl1', ip: '192.168.1.99', reason: 'Spam Bot', createdAt: new Date().toISOString(), createdBy: 'System' }
];
let generalSettingsStore: GeneralSettings = {
  siteTitle: 'Pazarads Shop',
  metaDescription: 'Premium products delivered fast.',
  supportEmail: 'support@pazarads.com',
  supportWhatsapp: '+15550123456',
  currency: 'USD',
  logo: '',
  favicon: ''
};
let legalSettingsStore: LegalSettings = {
  kvkk: 'KVKK Text here...',
  terms: 'Distance Sales Agreement...',
  refund: 'Refund Policy...'
};
let pixelSettingsStore: PixelSettings = {
  headCode: '<!-- Global Head Scripts -->\n',
  bodyCode: '<!-- Global Body Scripts -->\n'
};
let integrationSettingsStore: ProviderConfig[] = [...PROVIDERS];
let securityLogsStore: SecurityLog[] = [
  {
    id: 'sec1',
    type: SecurityEventType.BLACKLIST_BLOCK,
    ip: '192.168.1.99',
    description: 'Blocked connection attempt from blacklisted IP',
    riskLevel: RiskLevel.HIGH,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Default Permission Set
const defaultPermissions: PermissionSet = {
  catalog_view: true, catalog_create: false, catalog_edit: false, catalog_delete: false,
  orders_view: true, orders_edit: false, orders_approve: false, orders_export: false,
  customers_view: true, dealers_manage: false,
  domains_manage: false, templates_manage: false,
  reports_view: false, users_manage: false, settings_manage: false, logs_view: false, stock_manage: false
};

// Role Templates
export const roleTemplates: RoleTemplate[] = [
  {
    id: 'admin',
    name: 'Super Admin',
    description: 'Full access to all system features.',
    permissions: Object.keys(defaultPermissions).reduce((acc, key) => ({ ...acc, [key]: true }), {} as PermissionSet)
  },
  {
    id: 'agent',
    name: 'Sales Agent',
    description: 'Can manage orders and customers, view products.',
    permissions: {
      ...defaultPermissions,
      orders_edit: true, orders_approve: true,
      customers_view: true
    }
  },
  {
    id: 'editor',
    name: 'Content Editor',
    description: 'Can manage products, domains and templates.',
    permissions: {
      ...defaultPermissions,
      catalog_create: true, catalog_edit: true, catalog_delete: true,
      domains_manage: true, templates_manage: true
    }
  },
  {
    id: 'manager',
    name: 'Store Manager',
    description: 'Access to reports, products, and order management.',
    permissions: {
      ...defaultPermissions,
      catalog_create: true, catalog_edit: true,
      orders_edit: true, orders_approve: true, orders_export: true,
      reports_view: true
    }
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- EXPORT TEMPLATES ---
export const getExportTemplates = async (): Promise<ExportTemplate[]> => {
  await delay(300);
  return exportTemplatesStore;
};

export const createExportTemplate = async (template: Omit<ExportTemplate, 'id'>): Promise<ExportTemplate> => {
  await delay(400);
  const newTemplate = { ...template, id: `et${Date.now()}` };
  exportTemplatesStore.push(newTemplate);
  return newTemplate;
};

export const updateExportTemplate = async (id: string, template: Partial<ExportTemplate>): Promise<void> => {
  await delay(400);
  const idx = exportTemplatesStore.findIndex(t => t.id === id);
  if (idx !== -1) {
    exportTemplatesStore[idx] = { ...exportTemplatesStore[idx], ...template };
  }
};

export const deleteExportTemplate = async (id: string): Promise<void> => {
  await delay(300);
  exportTemplatesStore = exportTemplatesStore.filter(t => t.id !== id);
};

// --- CUSTOM STATUSES ---
export const getCustomStatuses = async (): Promise<CustomStatus[]> => {
  await delay(200);
  return customStatusesStore;
};

export const createCustomStatus = async (status: CustomStatus): Promise<CustomStatus> => {
  await delay(300);
  customStatusesStore.push(status);
  return status;
};

export const deleteCustomStatus = async (id: string): Promise<void> => {
  await delay(300);
  customStatusesStore = customStatusesStore.filter(s => s.id !== id);
};

// --- User Management ---

export const getUsers = async (): Promise<User[]> => {
  await delay(500);
  return usersStore;
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  await delay(300);
  return usersStore.find(u => u.id === id);
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  await delay(800);
  const newUser: User = {
    id: `u${Date.now()}`,
    email: userData.email || '',
    name: userData.name || 'New User',
    role: userData.role || UserRole.AGENT,
    password: userData.password, // In real app, hash this
    permissions: userData.permissions,
    phone: userData.phone,
    isActive: true
  };
  usersStore.push(newUser);
  return newUser;
};

export const updateUser = async (id: string, userData: Partial<User>, user?: { id: string, name: string }): Promise<User> => {
  await delay(600);
  const index = usersStore.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');

  usersStore[index] = { ...usersStore[index], ...userData };

  if (user) {
    await addActivityLog({
      userId: user.id,
      userName: user.name,
      action: 'USER_UPDATE',
      details: `User ${usersStore[index].name} (${usersStore[index].email}) updated`,
      entityId: id,
      entityType: 'USER'
    });
  }

  return usersStore[index];
};

export const deleteUser = async (id: string): Promise<void> => {
  await delay(500);
  usersStore = usersStore.filter(u => u.id !== id);
};

export const getRoleTemplates = async (): Promise<RoleTemplate[]> => {
  await delay(200);
  return roleTemplates;
};

// --- Dashboard ---
// --- Dashboard & Analytics ---

export interface DashboardAnalytics {
  today: {
    revenue: number;
    orders: number;
    aov: number;
    pending: number;
  };
  yesterday: {
    revenue: number;
    orders: number;
    aov: number;
    pending: number;
  };
  performance: {
    successRate: number;
    cancelRate: number;
    upsellRate: number;
    otherRate: number;
  };
  hourlyStats: { hour: string; count: number }[];
  operationalStats: {
    ordersToCall: number;
    pending3Days: number;
    expectedRevenue: number;
    pendingRevenue: number;
  };
  topProducts: { name: string; revenue: number; quantity: number }[];
  topAgents: { name: string; sales: number; revenue: number }[];
  domainStats: { domain: string; visits: number; orders: number; conversion: number }[];
  lastOrders: { id: string; customer: string; amount: number; status: string; date: string }[];
}

export const getDashboardAnalytics = async (startDate?: Date, endDate?: Date) => {
  await delay(800); // Simulate network delay

  const now = new Date();
  // Default to today if no dates provided
  const start = startDate ? startDate.getTime() : new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = endDate ? endDate.getTime() : (startDate ? new Date(startDate.getTime() + 86400000).getTime() : start + 86400000);

  const duration = end - start;
  const previousStart = start - duration;
  const previousEnd = start;

  // Current Period Orders
  const currentOrders = ordersStore.filter(o => {
    const time = new Date(o.createdAt).getTime();
    return time >= start && time < end;
  });

  // Previous Period Orders (for comparison)
  const previousOrders = ordersStore.filter(o => {
    const time = new Date(o.createdAt).getTime();
    return time >= previousStart && time < previousEnd;
  });

  const calculateStats = (orders: Order[]) => ({
    revenue: orders.reduce((acc, o) => acc + o.totalAmount, 0),
    orders: orders.length,
    aov: orders.length > 0 ? orders.reduce((acc, o) => acc + o.totalAmount, 0) / orders.length : 0,
    pending: orders.filter(o => o.status === OrderStatus.NEW).length,
    delivered: orders.filter(o => o.status === OrderStatus.TESLIM_EDILDI).length
  });

  const currentStats = calculateStats(currentOrders);
  const previousStats = calculateStats(previousOrders);

  // Performance (All Time for better sample size in mock)
  const totalOrders = ordersStore.length;
  const successRate = totalOrders > 0 ? (ordersStore.filter(o => o.status === OrderStatus.ONAYLANDI || o.status === OrderStatus.KARGODA || o.status === OrderStatus.TESLIM_EDILDI).length / totalOrders) * 100 : 0;
  const cancelRate = totalOrders > 0 ? (ordersStore.filter(o => o.status === OrderStatus.IPTAL).length / totalOrders) * 100 : 0;
  // Mocking upsell rate based on items length > 1 as a proxy
  const upsellRate = totalOrders > 0 ? (ordersStore.filter(o => o.items.length > 1).length / totalOrders) * 100 : 0;

  // Hourly Stats (Based on current period orders)
  // If range > 1 day, maybe show daily stats? For now keeping hourly distribution of selected period
  const hourlyMap = new Array(24).fill(0);
  currentOrders.forEach(o => {
    const hour = new Date(o.createdAt).getHours();
    hourlyMap[hour]++;
  });
  const hourlyStats = hourlyMap.map((count, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    count
  }));

  // Status Breakdown
  const statusCounts: Record<string, number> = {};
  currentOrders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const orderStatusBreakdown = Object.keys(statusCounts).map(status => ({
    status: status as OrderStatus,
    count: statusCounts[status],
    percentage: (statusCounts[status] / currentOrders.length) * 100
  })).sort((a, b) => b.count - a.count);

  // Operational Stats
  const ordersToCall = ordersStore.filter(o => o.status === OrderStatus.NEW || o.status === OrderStatus.ULASILAMADI).length;
  const threeDaysAgo = Date.now() - (3 * 86400000);
  const pending3Days = ordersStore.filter(o => o.status === OrderStatus.NEW && new Date(o.createdAt).getTime() < threeDaysAgo).length;

  const pendingRevenue = ordersStore.filter(o => o.status === OrderStatus.NEW).reduce((acc, o) => acc + o.totalAmount, 0);
  const expectedRevenue = ordersToCall * (currentStats.aov || 500); // Estimate

  // Top Products (Filtered by date)
  const topProducts = productsStore.map(p => {
    const pOrders = currentOrders.filter(o => o.items.some(i => i.productId === p.id));
    return {
      name: p.name,
      revenue: pOrders.reduce((acc, o) => acc + (o.items.find(i => i.productId === p.id)?.totalPrice || 0), 0),
      quantity: pOrders.reduce((acc, o) => acc + (o.items.find(i => i.productId === p.id)?.quantity || 0), 0)
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Top Agents (Mock - static for now as we don't have agent link in orders easily accessible for all)
  const topAgents = [
    { name: 'Ahmet Yılmaz', sales: 12, revenue: 15400 },
    { name: 'Ayşe Demir', sales: 8, revenue: 9800 },
    { name: 'Mehmet Kaya', sales: 3, revenue: 3200 },
    { name: 'Zeynep Çelik', sales: 15, revenue: 18500 },
    { name: 'Caner Erkin', sales: 10, revenue: 12000 },
    { name: 'Elif Şahin', sales: 7, revenue: 8500 },
    { name: 'Burak Yılmaz', sales: 6, revenue: 7200 },
    { name: 'Selin Öztürk', sales: 5, revenue: 6000 },
    { name: 'Kemal Sunal', sales: 4, revenue: 4800 },
    { name: 'Fatma Girik', sales: 2, revenue: 2400 }
  ].sort((a, b) => b.revenue - a.revenue);

  // Domain Stats
  const domainStats = [
    { domain: 'kampanya.urunsitesi.com', visits: 1250, orders: 45, conversion: 3.6 },
    { domain: 'firsat.urunsitesi.com', visits: 850, orders: 28, conversion: 3.2 },
    { domain: 'yeni.urunsitesi.com', visits: 420, orders: 12, conversion: 2.8 },
    { domain: 'indirim.urunsitesi.com', visits: 300, orders: 10, conversion: 3.3 },
    { domain: 'ozel.urunsitesi.com', visits: 250, orders: 8, conversion: 3.2 },
    { domain: 'sezon.urunsitesi.com', visits: 200, orders: 6, conversion: 3.0 },
    { domain: 'outlet.urunsitesi.com', visits: 150, orders: 5, conversion: 3.3 },
    { domain: 'vip.urunsitesi.com', visits: 100, orders: 4, conversion: 4.0 },
    { domain: 'blog.urunsitesi.com', visits: 500, orders: 2, conversion: 0.4 },
    { domain: 'test.urunsitesi.com', visits: 50, orders: 0, conversion: 0.0 }
  ].sort((a, b) => b.orders - a.orders);

  // Last 10 Orders (Filtered)
  const lastOrders = currentOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(o => ({
      id: o.id,
      customer: o.customer.name,
      amount: o.totalAmount,
      status: o.status,
      date: new Date(o.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }));

  return {
    today: currentStats,
    yesterday: previousStats,
    performance: {
      successRate,
      cancelRate,
      upsellRate,
      otherRate: 100 - (successRate + cancelRate)
    },
    hourlyStats,
    orderStatusBreakdown,
    operationalStats: {
      ordersToCall,
      pending3Days,
      expectedRevenue,
      pendingRevenue
    },
    topProducts,
    topAgents,
    domainStats,
    lastOrders
  };
};

export const getShippingAnalytics = async () => {
  await delay(800); // Simulate slightly longer load time for "heavy" analysis

  const shippedOrders = ordersStore.filter(o =>
    o.status === OrderStatus.KARGODA ||
    o.status === OrderStatus.TESLIM_EDILDI ||
    o.status === OrderStatus.ULASILAMADI ||
    o.status === OrderStatus.IADE
  );

  const totalShipped = shippedOrders.length;
  const delivered = shippedOrders.filter(o => o.status === OrderStatus.TESLIM_EDILDI).length;
  const returned = shippedOrders.filter(o => o.status === OrderStatus.IADE).length;
  const inTransit = shippedOrders.filter(o => o.status === OrderStatus.KARGODA).length;
  const failed = shippedOrders.filter(o => o.status === OrderStatus.ULASILAMADI).length;

  return {
    totalShipped,
    delivered,
    returned,
    inTransit,
    failed,
    deliveryRate: totalShipped > 0 ? (delivered / totalShipped) * 100 : 0,
    returnRate: totalShipped > 0 ? (returned / totalShipped) * 100 : 0,
    distribution: [
      { name: 'Teslim Edildi', value: delivered, color: '#22c55e' },
      { name: 'Yolda', value: inTransit, color: '#3b82f6' },
      { name: 'İade', value: returned, color: '#ef4444' },
      { name: 'Ulaşılamadı', value: failed, color: '#f59e0b' }
    ]
  };
};

export const generateAiImage = async (prompt: string, options?: { provider?: 'pollinations' | 'dalle', apiKey?: string }): Promise<AiResponse> => {
  const provider = options?.provider || 'pollinations';

  if (provider === 'dalle') {
    if (!options?.apiKey) {
      return {
        success: false,
        error: 'DALL-E 3 için OpenAI API anahtarı gereklidir. Lütfen ayarlardan ekleyin.'
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${options.apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Görsel oluşturulamadı.');
      }

      return {
        success: true,
        content: data.data[0].url,
        usage: { tokens: 0, cost: 0.04 } // Approx cost for DALL-E 3 standard
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'DALL-E bağlantı hatası.'
      };
    }
  }

  // Use Pollinations.ai for real, free image generation
  // No API key required, just URL encoding
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

  // Simulate API delay for better UX
  await delay(1500);

  return {
    content: imageUrl,
    usage: { tokens: 0, cost: 0 },
    success: true
  };
};

export const analyzeAdPerformance = async (platform: string, file?: File): Promise<AiResponse> => {
  await delay(3000);

  let analysisContent = '';

  if (file) {
    analysisContent = `
### 📊 Detaylı Dosya Analizi: ${file.name}

**Dosya Özeti:**
Yüklenen Excel dosyası başarıyla işlendi. Toplam **1,245** satır veri analiz edildi.

**Öne Çıkan Bulgular:**
1.  **En Yüksek Dönüşüm:** "Retargeting - Sepette Kalanlar" kampanyası %4.8 dönüşüm oranı ile lider.
2.  **Maliyet Analizi:** "Brand Awareness" kampanyasının tıklama başı maliyeti (CPC) geçen haftaya göre %12 artmış.
3.  **Platform Kırılımı:** Instagram Story reklamları, Feed reklamlarına göre %35 daha ucuz dönüşüm sağlıyor.

**Dosya Bazlı Öneriler:**
*   Satır 45-90 arasındaki düşük performanslı reklam setlerini durdurun.
*   "Kış Koleksiyonu" (Satır 120) kampanyasının bütçesini %20 artırın.
*   Yüksek CPC'li "Genel Hedefleme" grubunu daraltın.
    `;
  } else {
    analysisContent = `
### 🚀 ${platform} Reklam Performans Analizi

**Genel Durum:**
Son 7 günde reklamlarınızın tıklama oranı (CTR) %2.4 artış gösterdi. Ancak dönüşüm maliyetlerinde (CPA) hafif bir yükseliş var.

**Tespit Edilen Fırsatlar:**
1.  **Hedef Kitle:** "25-34 yaş arası teknoloji meraklıları" segmenti en yüksek dönüşümü sağlıyor. Bu kitleye özel bütçe artırımı önerilir.
2.  **Görsel Seçimi:** Mavi tonlu ürün görselleri, kırmızı tonlulara göre %15 daha fazla tıklanıyor.
3.  **Zamanlama:** Akşam 20:00 - 23:00 saatleri arasında dönüşüm oranı zirve yapıyor.

**Önerilen Aksiyonlar:**
*   Bütçenizin %60'ını akşam saatlerine kaydırın.
*   Düşük performans gösteren "Geniş Kitle" reklam setini durdurun.
*   Yeni oluşturduğunuz "Yaz İndirimi" kampanyası için A/B testi başlatın.
    `;
  }

  return {
    content: analysisContent,
    usage: { tokens: file ? 500 : 300, cost: 0 },
    success: true
  };
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const analytics = await getDashboardAnalytics();

  // Map DashboardAnalytics to DashboardStats (satisfying both simple and complex definitions due to type merging)
  return {
    // Complex fields matching DashboardAnalytics
    current: analytics.today,
    previous: analytics.yesterday,
    performance: {
      ...analytics.performance,
      revenue: analytics.today.revenue, // Adapting if missing
      orders: analytics.today.orders,
      aov: analytics.today.aov
    },
    today: analytics.today,
    lastOrders: analytics.lastOrders as any[],

    // Legacy/Simple fields
    totalRevenue: analytics.today.revenue,
    totalOrders: analytics.today.orders,
    pendingOrders: analytics.today.pending,
    approvedOrders: ordersStore.filter(o => o.status === OrderStatus.ONAYLANDI).length,
    activeProducts: productsStore.filter(p => p.status === 'ACTIVE').length
  } as DashboardStats;
};

export interface ReportFilters {
  productIds?: string[];
  domain?: string;
  source?: string;
  status?: OrderStatus;
}

export const getDetailedReports = async (startDate?: Date, endDate?: Date, filters?: ReportFilters) => {
  await delay(600);

  const now = new Date();
  const start = startDate ? startDate.getTime() : new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = endDate ? endDate.getTime() : (startDate ? new Date(startDate.getTime() + 86400000).getTime() : start + 86400000);

  const currentOrders = ordersStore.filter(o => {
    const time = new Date(o.createdAt).getTime();
    const matchesDate = time >= start && time < end;

    if (!matchesDate) return false;

    if (filters?.productIds && filters.productIds.length > 0) {
      const hasProduct = o.items.some(i => filters.productIds?.includes(i.productId));
      if (!hasProduct) return false;
    }

    if (filters?.domain && o.source !== filters.domain) {
      // Mocking source check - in real app source would be a field
      // For now, let's assume we don't filter by domain strictly in mock if source field is missing
      // or we can add a mock source to orders
    }

    if (filters?.source && o.referrer !== filters.source) {
      // Mock check for source/referrer
    }

    if (filters?.status && o.status !== filters.status) {
      return false;
    }

    return true;
  });

  // --- 1. Sales Report Data ---
  const totalRevenue = currentOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOrders = currentOrders.length;
  const avgBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const successRate = totalOrders > 0 ? (currentOrders.filter(o => o.status === OrderStatus.TESLIM_EDILDI).length / totalOrders) * 100 : 0;

  // Daily Sales Trend (Mock based on selected range)
  const salesTrend = [];
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  for (let i = 0; i < Math.min(daysDiff, 30); i++) {
    const d = new Date(start + (i * 86400000));
    salesTrend.push({
      date: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 20) + 5
    });
  }

  // Top Selling Products
  const topProducts = productsStore.map(p => {
    const pOrders = currentOrders.filter(o => o.items.some(i => i.productId === p.id));
    return {
      name: p.name,
      value: pOrders.length,
      revenue: pOrders.reduce((acc, o) => acc + (o.items.find(i => i.productId === p.id)?.totalPrice || 0), 0)
    };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

  // --- 2. Cargo & Logistics Data ---
  const shippedOrders = currentOrders.filter(o => [OrderStatus.KARGODA, OrderStatus.TESLIM_EDILDI, OrderStatus.IADE].includes(o.status as OrderStatus));
  const cargoStats = {
    totalShipped: shippedOrders.length,
    delivered: shippedOrders.filter(o => o.status === OrderStatus.TESLIM_EDILDI).length,
    returned: shippedOrders.filter(o => o.status === OrderStatus.IADE).length,
    avgDeliveryTime: '2.4 Gün', // Mock
    statusDistribution: [
      { name: 'Teslim Edildi', value: shippedOrders.filter(o => o.status === OrderStatus.TESLIM_EDILDI).length, color: '#10b981' },
      { name: 'Yolda', value: shippedOrders.filter(o => o.status === OrderStatus.KARGODA).length, color: '#3b82f6' },
      { name: 'İade', value: shippedOrders.filter(o => o.status === OrderStatus.IADE).length, color: '#ef4444' },
      { name: 'Sorunlu', value: 0, color: '#f59e0b' }
    ],
    cityPerformance: [
      { city: 'İstanbul', sent: 450, delivered: 410, successRate: 91 },
      { city: 'Ankara', sent: 220, delivered: 195, successRate: 88 },
      { city: 'İzmir', sent: 150, delivered: 135, successRate: 90 },
      { city: 'Bursa', sent: 90, delivered: 80, successRate: 89 },
      { city: 'Antalya', sent: 60, delivered: 55, successRate: 92 }
    ]
  };

  // --- 3. Call Center Data ---
  const callCenterStats = {
    totalCalls: 650,
    reached: 420,
    approved: 220,
    cancelled: 45,
    agentPerformance: [
      { name: 'Selin Y.', calls: 150, reached: 90, approved: 45, successRate: 50 },
      { name: 'Mehmet K.', calls: 180, reached: 110, approved: 60, successRate: 54 },
      { name: 'Ayşe D.', calls: 120, reached: 80, approved: 35, successRate: 43 },
      { name: 'Burak B.', calls: 200, reached: 140, approved: 80, successRate: 57 }
    ]
  };

  // --- 4. Domain & Source Data ---
  const domainStats = {
    activeDomains: 12,
    totalVisits: '45.2K',
    avgConversion: 2.8,
    adCost: 42000,
    domainPerformance: [
      { domain: 'firsat.site.com', orders: 450, revenue: 125000, conversion: 3.2, status: 'Aktif' },
      { domain: 'kampanya.net', orders: 320, revenue: 89000, conversion: 2.8, status: 'Aktif' },
      { domain: 'indirim.org', orders: 150, revenue: 42000, conversion: 1.9, status: 'Uyarı' },
      { domain: 'moda.store', orders: 80, revenue: 21000, conversion: 4.1, status: 'Aktif' }
    ]
  };

  // --- 5. Upsell Data (Mock) ---
  const upsellStats = {
    totalRevenue: Math.floor(totalRevenue * 0.15),
    conversionRate: 12.5,
    topUpsells: [
      { name: 'Hızlı Teslimat', count: 150, revenue: 4500 },
      { name: 'Hediye Paketi', count: 85, revenue: 1700 },
      { name: '+1 Yıl Garanti', count: 42, revenue: 8400 }
    ],
    funnel: [
      { stage: 'Viewed', count: 1000 },
      { stage: 'Added', count: 300 },
      { stage: 'Purchased', count: 125 }
    ]
  };

  return {
    sales: {
      totalRevenue,
      totalOrders,
      avgBasket,
      successRate,
      salesTrend,
      topProducts,
      dailyPerformance: salesTrend // Reusing trend data for table
    },
    cargo: cargoStats,
    callCenter: callCenterStats,
    domain: domainStats,
    upsell: upsellStats
  };
};

// --- Products ---
export const getProducts = async (): Promise<Product[]> => {
  await delay(600);
  return productsStore;
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  await delay(400);
  return productsStore.find(p => p.id === id);
};

export const createProduct = async (data: ProductFormData, user?: { id: string, name: string }): Promise<Product> => {
  await delay(800);
  const newProduct: Product = {
    id: `p${Date.now()}`,
    ...data,
    name: data.name || 'New Product',
    slug: data.slug || `product-${Date.now()}`,
    description: data.description || '',
    status: data.status || ProductStatus.DRAFT,
    seoTitle: data.seoTitle || '',
    seoKeywords: data.seoKeywords || '',
    isFreeShipping: data.isFreeShipping || false,
    prices: data.prices || [],
    variants: data.variants || [],
    images: data.images || [],
    reviews: data.reviews || [],
    marketing: data.marketing || {},
    checkoutConfig: data.checkoutConfig || {
      fields: [
        { id: '1', label: 'Full Name', key: 'fullName', type: 'text', isRequired: true, isVisible: true, order: 0 },
        { id: '2', label: 'Phone Number', key: 'phone', type: 'tel', isRequired: true, isVisible: true, order: 1 },
        { id: '3', label: 'Address', key: 'address', type: 'textarea', isRequired: true, isVisible: true, order: 2 },
        { id: '4', label: 'City', key: 'city', type: 'text', isRequired: true, isVisible: true, order: 3 },
        { id: '5', label: 'District', key: 'district', type: 'text', isRequired: true, isVisible: true, order: 4 },
      ],
      paymentMethods: { cod_cash: true, cod_card: true, online_credit_card: true, bank_transfer: true }
    }
  };
  productsStore.unshift(newProduct);

  if (user) {
    await addActivityLog({
      userId: user.id,
      userName: user.name,
      action: 'PRODUCT_CREATE',
      details: `Product ${newProduct.name} created`,
      entityId: newProduct.id,
      entityType: 'PRODUCT'
    });
  }

  return newProduct;
};

export const updateProduct = async (id: string, data: Partial<Product>, user?: { id: string, name: string }): Promise<Product> => {
  await delay(600);
  const index = productsStore.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  productsStore[index] = { ...productsStore[index], ...data };

  if (user) {
    await addActivityLog({
      userId: user.id,
      userName: user.name,
      action: 'PRODUCT_UPDATE',
      details: `Product ${productsStore[index].name} updated`,
      entityId: id,
      entityType: 'PRODUCT'
    });
  }

  return productsStore[index];
};

export const deleteProduct = async (id: string): Promise<void> => {
  await delay(600);
  productsStore = productsStore.filter(p => p.id !== id);
};

// --- Product Sub-resources ---
export const addProductPrice = async (productId: string, data: PriceFormData): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.prices.push({ id: `pp${Date.now()}`, productId, ...data });
  }
};

export const updateProductPrice = async (productId: string, priceId: string, data: PriceFormData): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.prices = product.prices.map(p => p.id === priceId ? { ...p, ...data } : p);
  }
};

export const deleteProductPrice = async (productId: string, priceId: string): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.prices = product.prices.filter(p => p.id !== priceId);
  }
};

export const addProductVariant = async (productId: string, data: VariantFormData): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.variants.push({
      id: `pv${Date.now()}`,
      productId,
      variantName: data.name,
      stock: 0,
      price: 0,
      ...data
    });
  }
};

export const updateProductVariant = async (productId: string, variantId: string, data: VariantFormData): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.variants = product.variants.map(v => v.id === variantId ? { ...v, ...data, variantName: data.name } : v);
  }
};

export const deleteProductVariant = async (productId: string, variantId: string): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.variants = product.variants.filter(v => v.id !== variantId);
  }
};

export const addProductImage = async (productId: string, url: string): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.images.push({
      id: `img${Date.now()}`,
      productId,
      url,
      order: product.images.length + 1
    });
  }
};

export const deleteProductImage = async (productId: string, imageId: string): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.images = product.images.filter(img => img.id !== imageId);
  }
};

export const addProductReview = async (productId: string, data: ReviewFormData): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.reviews.push({
      id: `rev${Date.now()}`,
      productId,
      ...data,
      createdAt: new Date().toISOString()
    });
  }
};

export const updateProductReview = async (productId: string, reviewId: string, data: ReviewFormData): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.reviews = product.reviews.map(r => r.id === reviewId ? { ...r, ...data } : r);
  }
};

export const deleteProductReview = async (productId: string, reviewId: string): Promise<void> => {
  const product = productsStore.find(p => p.id === productId);
  if (product) {
    product.reviews = product.reviews.filter(r => r.id !== reviewId);
  }
};

// --- Upsells ---
export const getUpsells = async (): Promise<Upsell[]> => {
  await delay(400);
  return upsellsStore;
};

export const createUpsell = async (data: Omit<Upsell, 'id'>): Promise<Upsell> => {
  await delay(600);
  const newUpsell: Upsell = { id: `up${Date.now()}`, ...data };
  upsellsStore.push(newUpsell);
  return newUpsell;
};

export const updateUpsell = async (id: string, data: Partial<Upsell>): Promise<void> => {
  await delay(400);
  const index = upsellsStore.findIndex(u => u.id === id);
  if (index !== -1) upsellsStore[index] = { ...upsellsStore[index], ...data };
};

export const deleteUpsell = async (id: string): Promise<void> => {
  await delay(400);
  upsellsStore = upsellsStore.filter(u => u.id !== id);
};

// --- Domains ---
export const getDomains = async (): Promise<Domain[]> => {
  await delay(600);
  return domainsStore.map(d => ({
    ...d,
    product: productsStore.find(p => p.id === d.productId)
  }));
};

export const createDomain = async (data: DomainFormData): Promise<Domain> => {
  await delay(800);
  const newDomain: Domain = { id: `d${Date.now()}`, ...data };
  domainsStore.push(newDomain);
  return newDomain;
};

export const updateDomain = async (id: string, data: DomainFormData): Promise<Domain> => {
  await delay(600);
  const index = domainsStore.findIndex(d => d.id === id);
  domainsStore[index] = { ...domainsStore[index], ...data };
  return domainsStore[index];
};

export const deleteDomain = async (id: string): Promise<void> => {
  await delay(600);
  domainsStore = domainsStore.filter(d => d.id !== id);
};

export const getTemplates = async (): Promise<Template[]> => {
  await delay(400);
  return templatesStore;
};

export const getLanguages = async (): Promise<Language[]> => {
  await delay(400);
  return languagesStore;
};

export const toggleLanguage = async (id: string): Promise<void> => {
  await delay(400);
  const lang = languagesStore.find(l => l.id === id);
  if (lang) lang.isActive = !lang.isActive;
};

// --- Orders ---
export const getOrders = async (filters?: { status?: OrderStatus | 'ALL', search?: string, dealerId?: string }): Promise<Order[]> => {
  await delay(600);
  let orders = [...ordersStore];

  if (filters?.dealerId) {
    orders = orders.filter(o => o.dealerId === filters.dealerId);
  }

  if (filters?.status && filters.status !== 'ALL') {
    orders = orders.filter(o => o.status === filters.status);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer?.name.toLowerCase().includes(q) ||
      o.customer?.phone.includes(q)
    );
  }

  // Populate Dealer info
  return orders.map(o => ({
    ...o,
    dealer: dealersStore.find(d => d.id === o.dealerId)
  }));
};

export const getOrderCounts = async (): Promise<Record<string, number>> => {
  await delay(400);
  const counts: Record<string, number> = {};

  // Initialize standard statuses to 0
  Object.values(OrderStatus).forEach(status => counts[status] = 0);

  // Count including custom
  ordersStore.forEach(order => {
    const status = typeof order.status === 'string' ? order.status : (order.status as OrderStatus);
    counts[status] = (counts[status] || 0) + 1;
  });

  return counts;
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  await delay(400);
  const order = ordersStore.find(o => o.id === id);
  if (!order) return undefined;
  return {
    ...order,
    dealer: dealersStore.find(d => d.id === order.dealerId)
  };
};

export const getOrder = getOrderById;

export const checkDuplicateOrders = async (phone: string, name: string): Promise<Order[]> => {
  // Find orders with same phone (last 10 digits) OR same name (fuzzy)
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const lowerName = name.toLowerCase();

  return ordersStore.filter(o => {
    const oPhone = o.customer?.phone.replace(/\D/g, '').slice(-10);
    const oName = o.customer?.name.toLowerCase();
    return oPhone === cleanPhone || oName === lowerName;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updateOrderItems = async (orderId: string, items: OrderItem[], totalAmount: number): Promise<Order> => {
  await delay(600);
  const orderIndex = ordersStore.findIndex(o => o.id === orderId);
  if (orderIndex === -1) throw new Error("Order not found");

  ordersStore[orderIndex] = {
    ...ordersStore[orderIndex],
    items: items,
    totalAmount: totalAmount
  };
  return ordersStore[orderIndex];
};

export const updateOrder = async (id: string, data: Partial<Order>, user?: { id: string, name: string }): Promise<Order> => {
  await delay(500);
  const index = ordersStore.findIndex(o => o.id === id);
  if (index === -1) throw new Error('Order not found');

  const oldOrder = ordersStore[index];
  ordersStore[index] = { ...oldOrder, ...data };

  if (user) {
    // Activity Log
    await addActivityLog({
      userId: user.id,
      userName: user.name,
      action: 'ORDER_UPDATE',
      details: `Order #${oldOrder.orderNumber} updated`,
      entityId: id,
      entityType: 'ORDER'
    });

    // Order Log
    let changes = [];
    if (data.status && data.status !== oldOrder.status) changes.push(`Status: ${oldOrder.status} -> ${data.status}`);
    if (data.paymentMethod && data.paymentMethod !== oldOrder.paymentMethod) changes.push(`Payment: ${oldOrder.paymentMethod} -> ${data.paymentMethod}`);
    if (data.totalAmount && data.totalAmount !== oldOrder.totalAmount) changes.push(`Total: ${oldOrder.totalAmount} -> ${data.totalAmount}`);

    if (changes.length > 0) {
      await addOrderLog(id, `Order updated: ${changes.join(', ')}`, user, 'UPDATE');
    } else {
      await addOrderLog(id, `Order details updated`, user, 'UPDATE');
    }
  }

  return ordersStore[index];
};

export const createOrder = async (data: Partial<Order>, user: { id: string, name: string }): Promise<Order> => {
  await delay(800);

  const newOrder: Order = {
    id: `o${Date.now()}`,
    orderNumber: generateOrderNumber(),
    customerId: data.customerId || `c${Date.now()}`,
    productId: data.items?.[0]?.productId || '', // Default to first item's product
    priceId: '',
    items: data.items || [],
    status: (data.status as OrderStatus) || OrderStatus.NEW,
    totalAmount: data.totalAmount || 0,
    paymentMethod: data.paymentMethod || 'COD',
    paymentStatus: PaymentStatus.UNPAID,
    createdAt: new Date().toISOString(),
    ipAddress: '127.0.0.1',
    userAgent: 'Admin Panel',
    variantSelection: data.items?.[0]?.variantSelection,
    dealerId: undefined,
    customer: data.customer || {
      id: `c${Date.now()}`,
      name: '',
      phone: '',
      address: '',
      city: '',
      district: ''
    },
    product: undefined,
    referrer: 'Admin Panel',
    landingPage: 'manual-entry'
  };

  ordersStore.unshift(newOrder);

  await addOrderLog(newOrder.id, 'Order created manually by admin', user, 'CREATE');

  return newOrder;
};

export const createPublicOrder = async (data: OrderFormData & { ipAddress?: string, userAgent?: string, variantSelection?: string, referrer?: string }): Promise<Order> => {
  // --- SECURITY LAYER ---
  const ip = data.ipAddress || '127.0.0.1'; // Default for mock

  // 1. Rate Limiting (DDoS Protection)
  if (!checkRateLimit(ip)) {
    // Log security event
    securityLogsStore.unshift({
      id: `sec${Date.now()}`,
      type: SecurityEventType.RATE_LIMIT,
      ip,
      description: 'Too many order requests (Rate Limit Exceeded)',
      riskLevel: RiskLevel.MEDIUM,
      createdAt: new Date().toISOString()
    });
    throw new Error('Too many requests. Please try again later.');
  }

  // 2. Blacklist Check
  const isBlacklisted = blacklistStore.some(b => b.ip === ip);
  if (isBlacklisted) {
    securityLogsStore.unshift({
      id: `sec${Date.now()}`,
      type: SecurityEventType.BLACKLIST_BLOCK,
      ip,
      description: 'Blocked order attempt from blacklisted IP',
      riskLevel: RiskLevel.HIGH,
      createdAt: new Date().toISOString()
    });
    throw new Error('Your connection has been blocked due to suspicious activity.');
  }

  // 3. Fake Order Detection
  const fraudCheck = detectFakeOrder({
    name: data.name,
    phone: data.phone,
    ipAddress: ip
  }, ordersStore);

  if (fraudCheck.isFake) {
    // Log the attempt
    securityLogsStore.unshift({
      id: `sec${Date.now()}`,
      type: SecurityEventType.FAKE_ORDER_ATTEMPT,
      ip,
      description: `Fake order blocked. Score: ${fraudCheck.score}`,
      riskLevel: RiskLevel.CRITICAL,
      details: { reasons: fraudCheck.reasons, formData: data },
      createdAt: new Date().toISOString()
    });

    // Optionally block IP automatically if score is extremely high (e.g. > 90)
    if (fraudCheck.score > 90) {
      blacklistStore.push({
        id: `bl${Date.now()}`,
        ip,
        reason: 'Auto-blocked: Critical Fraud Detected',
        createdAt: new Date().toISOString(),
        createdBy: 'System AI'
      });
    }

    throw new Error('Order verification failed. Please check your details.');
  }

  await delay(1000);

  const product = productsStore.find(p => p.id === data.productId);
  const price = product?.prices.find(p => p.id === data.priceId);
  const unitPrice = price ? (price.price / price.quantity) : 0;
  const quantity = price ? price.quantity : 1;
  const amount = price?.price || 0;

  // Simple dealer assignment logic (mocking domain lookup)
  // In a real app, we would look up the domain from headers/referer to find the dealer
  const randomDealer = Math.random() > 0.8 ? dealersStore[0] : undefined;

  const newOrder: Order = {
    id: `o${Date.now()}`,
    orderNumber: generateOrderNumber(),
    customerId: `c${Date.now()}`,
    productId: data.productId!,
    priceId: data.priceId!,
    items: [{
      productId: data.productId!,
      productName: product?.name || 'Product',
      quantity: quantity,
      unitPrice: unitPrice,
      totalPrice: amount,
      variantSelection: data.variantSelection,
      image: product?.images[0]?.url
    }],
    status: OrderStatus.NEW,
    totalAmount: amount,
    paymentMethod: data.paymentMethod || 'COD',
    paymentStatus: PaymentStatus.UNPAID,
    createdAt: new Date().toISOString(),
    ipAddress: ip,
    userAgent: data.userAgent,
    variantSelection: data.variantSelection,
    dealerId: randomDealer?.id,
    customer: {
      id: `c${Date.now()}`,
      name: data.name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      district: data.district
    },
    product: product,
    referrer: data.referrer || 'Direct',
    landingPage: 'direct-link' // Default
  };

  ordersStore.unshift(newOrder);

  // Create Log
  await addOrderLog(newOrder.id, 'Order created via landing page', { id: 'system', name: 'System' }, 'SYSTEM');

  // Stock Deduction
  if (product && data.variantSelection) {
    const variantIndex = product.variants.findIndex(v => v.variantName === data.variantSelection);
    if (variantIndex !== -1) {
      const variant = product.variants[variantIndex];
      product.variants[variantIndex].stock -= quantity;

      // Log Stock Movement
      await addStockMovement({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.variantName,
        quantity: quantity,
        type: StockMovementType.OUT,
        note: `Order #${newOrder.orderNumber}`,
        userId: 'system',
        userName: 'System (Order)'
      });
    }
  } else if (product && product.variants.length === 0) {
    // Deduct from main product stock if no variants (mock logic: assuming main product has stock tracking if no variants, but currently stock is on variants.
    // If no variants, maybe we should check if there's a default variant or just ignore for now as per ProductVariant interface stock is on variant.)
    // However, ProductWizard creates a default variant if none exist.
    // So we should be covered by the variant check usually.
    // But if data.variantSelection is empty, we might default to first variant?
    if (product.variants.length > 0) {
      const variant = product.variants[0];
      product.variants[0].stock -= quantity;
      await addStockMovement({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.variantName,
        quantity: quantity,
        type: StockMovementType.OUT,
        note: `Order #${newOrder.orderNumber}`,
        userId: 'system',
        userName: 'System (Order)'
      });
    }
  }

  return newOrder;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus | string, user: { id: string, name: string }): Promise<void> => {
  await delay(500);
  const order = ordersStore.find(o => o.id === orderId);
  if (order) {
    const oldStatus = order.status;
    order.status = status;
    await addOrderLog(orderId, `Status changed from ${oldStatus} to ${status}`, user, 'STATUS_CHANGE');
  }
};

export const bulkUpdateOrderStatus = async (orderIds: string[], status: OrderStatus | string, user: { id: string, name: string }): Promise<void> => {
  await delay(1000);
  orderIds.forEach(async orderId => {
    const order = ordersStore.find(o => o.id === orderId);
    if (order) {
      const oldStatus = order.status;
      order.status = status;
      await addOrderLog(orderId, `Bulk status update: changed from ${oldStatus} to ${status}`, user, 'STATUS_CHANGE');
    }
  });
};

export const getOrderLogs = async (orderId: string): Promise<OrderLog[]> => {
  await delay(400);
  return orderLogsStore.filter(l => l.orderId === orderId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addOrderLog = async (orderId: string, message: string, user: { id: string, name: string }, action: string = 'NOTE'): Promise<void> => {
  orderLogsStore.push({
    id: `log${Date.now()}`,
    orderId,
    userId: user.id,
    userName: user.name,
    action,
    message,
    createdAt: new Date().toISOString()
  });
};

// --- Call Center ---
export const getCallQueue = async (): Promise<Order[]> => {
  await delay(600);
  // Return orders that are new or marked to be called
  return ordersStore.filter(o => [OrderStatus.NEW, OrderStatus.ARANACAK, OrderStatus.ULASILAMADI].includes(o.status as OrderStatus));
};

export const saveCallResult = async (orderId: string, outcome: CallOutcome, note: string, duration: number, user: { id: string, name: string }): Promise<void> => {
  await delay(600);

  // Save log
  callLogsStore.push({
    id: `cl${Date.now()}`,
    orderId,
    agentId: user.id,
    agentName: user.name,
    outcome,
    durationSeconds: duration,
    note,
    calledAt: new Date().toISOString()
  });

  // Update order status based on outcome
  let newStatus: OrderStatus | string = OrderStatus.ARANACAK;
  if (outcome === CallOutcome.REACHED_CONFIRMED) newStatus = OrderStatus.ONAYLANDI;
  if (outcome === CallOutcome.REACHED_CANCELLED) newStatus = OrderStatus.IPTAL;
  if (outcome === CallOutcome.UNREACHABLE) newStatus = OrderStatus.ULASILAMADI;
  if (outcome === CallOutcome.WRONG_NUMBER) newStatus = OrderStatus.YANLIS_NUMARA;
  if (outcome === CallOutcome.BUSY) newStatus = OrderStatus.ARANACAK;

  const order = ordersStore.find(o => o.id === orderId);
  if (order && order.status !== newStatus) {
    order.status = newStatus;
    await addOrderLog(orderId, `Call result: ${outcome}. Status updated.`, user, 'STATUS_CHANGE');
  } else {
    await addOrderLog(orderId, `Call result: ${outcome}. ${note}`, user, 'CALL_LOG');
  }
};

export const getAgentStats = async (): Promise<AgentStats[]> => {
  await delay(800);
  return [
    {
      agentId: '2',
      agentName: 'Sales Agent',
      totalCalls: callLogsStore.length,
      confirmedOrders: callLogsStore.filter(c => c.outcome === CallOutcome.REACHED_CONFIRMED).length,
      cancelledOrders: callLogsStore.filter(c => c.outcome === CallOutcome.REACHED_CANCELLED).length,
      approvalRate: 62,
      avgDurationSeconds: 110
    }
  ];
};

// --- SMS ---
export const getSmsTemplates = async (): Promise<SmsTemplate[]> => {
  await delay(400);
  return smsTemplatesStore;
};

export const saveSmsTemplate = async (data: SmsTemplateFormData): Promise<SmsTemplate> => {
  await delay(500);
  const newT: SmsTemplate = { id: `st${Date.now()}`, ...data };
  smsTemplatesStore.push(newT);
  return newT;
};

export const updateSmsTemplate = async (id: string, data: SmsTemplateFormData): Promise<void> => {
  await delay(500);
  const index = smsTemplatesStore.findIndex(t => t.id === id);
  if (index !== -1) smsTemplatesStore[index] = { ...smsTemplatesStore[index], ...data };
};

export const deleteSmsTemplate = async (id: string): Promise<void> => {
  await delay(400);
  smsTemplatesStore = smsTemplatesStore.filter(t => t.id !== id);
};

export const sendSms = async (phone: string, message: string, provider: SmsProvider, type: SmsType, user: { id: string, name: string }, orderId?: string): Promise<void> => {
  await delay(800);
  smsLogsStore.unshift({
    id: `sl${Date.now()}`,
    phone,
    message,
    type,
    provider,
    status: 'SENT',
    sentAt: new Date().toISOString(),
    orderId,
    sentBy: user.id
  });
  if (orderId) {
    await addOrderLog(orderId, `SMS sent via ${provider}`, user, 'SMS');
  }
};

export const getSmsLogs = async (): Promise<SmsLog[]> => {
  await delay(600);
  return smsLogsStore;
};

// --- WhatsApp ---
export const getWhatsappTemplates = async (): Promise<WhatsappTemplate[]> => {
  await delay(400);
  return whatsappTemplatesStore;
};

export const saveWhatsappTemplate = async (data: WhatsappTemplateFormData): Promise<WhatsappTemplate> => {
  await delay(500);
  const newT: WhatsappTemplate = { id: `wt${Date.now()}`, ...data, status: 'PENDING' as any };
  whatsappTemplatesStore.push(newT);
  return newT;
};

export const updateWhatsappTemplate = async (id: string, data: WhatsappTemplateFormData): Promise<void> => {
  await delay(500);
  const index = whatsappTemplatesStore.findIndex(t => t.id === id);
  if (index !== -1) whatsappTemplatesStore[index] = { ...whatsappTemplatesStore[index], ...data };
};

export const deleteWhatsappTemplate = async (id: string): Promise<void> => {
  await delay(400);
  whatsappTemplatesStore = whatsappTemplatesStore.filter(t => t.id !== id);
};

export const sendWhatsappMessage = async (phone: string, templateId: string, content: string, provider: WhatsappProvider, user: { id: string, name: string }, orderId?: string): Promise<void> => {
  await delay(800);
  const tmpl = whatsappTemplatesStore.find(t => t.id === templateId);
  whatsappLogsStore.unshift({
    id: `wl${Date.now()}`,
    phone,
    templateName: tmpl?.name || 'unknown',
    content,
    provider,
    status: 'SENT',
    sentAt: new Date().toISOString(),
    orderId,
    sentBy: user.id
  });
  if (orderId) {
    await addOrderLog(orderId, `WhatsApp sent via ${provider}`, user, 'WHATSAPP');
  }
};

export const getWhatsappLogs = async (): Promise<WhatsappLog[]> => {
  await delay(600);
  return whatsappLogsStore;
};

// --- Shipping ---
export const getShippingCompanies = async (): Promise<ShippingCompany[]> => {
  await delay(400);
  return shippingCompaniesStore;
};

export const updateShippingCompany = async (id: string, data: Partial<ShippingCompany>): Promise<void> => {
  await delay(500);
  const index = shippingCompaniesStore.findIndex(c => c.id === id);
  if (index !== -1) {
    shippingCompaniesStore[index] = { ...shippingCompaniesStore[index], ...data };
  } else {
    throw new Error(`Shipping company not found with ID: ${id}`);
  }
};

export const createShipment = async (data: CreateShipmentData, user: { id: string, name: string }): Promise<Shipment> => {
  await delay(1000);
  const newShipment: Shipment = {
    id: `ship${Date.now()}`,
    orderId: data.orderId,
    companyId: data.companyId,
    trackingCode: `TRK${Math.floor(Math.random() * 1000000)}`,
    status: ShippingStatus.PREPARING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  shipmentsStore.push(newShipment);

  // Update order status
  const order = ordersStore.find(o => o.id === data.orderId);
  if (order) {
    order.status = OrderStatus.KARGODA;
    await addOrderLog(order.id, `Shipment created. Tracking: ${newShipment.trackingCode}`, user, 'SHIPPING');
  }

  return newShipment;
};

export const getShipments = async (): Promise<Shipment[]> => {
  await delay(600);
  return shipmentsStore.map(s => ({
    ...s,
    order: ordersStore.find(o => o.id === s.orderId),
    company: shippingCompaniesStore.find(c => c.id === s.companyId)
  }));
};

// --- Payment ---
export const processPayment = async (orderId: string, card: CreditCardForm, provider: PaymentProvider): Promise<PaymentInitResult> => {
  const order = ordersStore.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');

  let result: PaymentInitResult = { success: false };

  switch (provider) {
    case PaymentProvider.PAYTR:
      result = await paytrClient.processPayment(orderId, order.totalAmount, card);
      break;
    case PaymentProvider.IYZICO:
      result = await iyzicoClient.processPayment(orderId, order.totalAmount, card);
      break;
    case PaymentProvider.STRIPE:
      result = await stripeClient.processPayment(orderId, order.totalAmount, card);
      break;
    default:
      throw new Error('Unsupported payment provider');
  }

  if (result.success) {
    order.paymentStatus = PaymentStatus.PAID;
    if (order.status === OrderStatus.NEW) {
      order.status = OrderStatus.ONAYLANDI;
    }
    await addOrderLog(order.id, `Payment successful via ${provider}`, { id: 'system', name: 'System' }, 'PAYMENT');
  }

  return result;
};

// --- AI API ---

export const generateAdCopy = async (data: any): Promise<AiResponse> => {
  return aiService.processRequest({
    provider: data.provider,
    task: AiTaskType.AD_COPY,
    context: data
  });
};

export const generateProductDescription = async (data: any): Promise<AiResponse> => {
  return aiService.processRequest({
    provider: data.provider,
    task: AiTaskType.PRODUCT_DESCRIPTION,
    context: data
  });
};

export const translateText = async (text: string, targetLang: string, provider: string): Promise<AiResponse> => {
  return aiService.processRequest({
    provider: provider as AiProvider,
    task: AiTaskType.TRANSLATION,
    context: { text, targetLang }
  });
};

export const analyzeOrderFraud = async (orderId: string, provider: string): Promise<AiResponse> => {
  const order = ordersStore.find(o => o.id === orderId);
  if (!order) throw new Error("Order not found");

  return aiService.processRequest({
    provider: provider as AiProvider,
    task: AiTaskType.FRAUD_ANALYSIS,
    context: { order }
  });
};

// --- DEALER API ---

export const getDealers = async (): Promise<Dealer[]> => {
  await delay(600);
  return dealersStore.map(d => ({
    ...d,
    user: usersStore.find(u => u.id === d.userId)
  }));
};

export const createDealer = async (data: DealerFormData): Promise<Dealer> => {
  await delay(800);
  const newDealer: Dealer = {
    id: `dl${Date.now()}`,
    ...data,
    balance: 0,
    totalEarnings: 0,
    createdAt: new Date().toISOString()
  };
  dealersStore.push(newDealer);
  return newDealer;
};

export const updateDealer = async (id: string, data: DealerFormData): Promise<void> => {
  await delay(500);
  const index = dealersStore.findIndex(d => d.id === id);
  if (index !== -1) {
    dealersStore[index] = { ...dealersStore[index], ...data };
  }
};

export const getDealerStats = async (dealerId: string): Promise<DealerStats> => {
  await delay(600);
  const dealer = dealersStore.find(d => d.id === dealerId);
  if (!dealer) throw new Error('Dealer not found');

  const dealerOrders = ordersStore.filter(o => o.dealerId === dealerId);
  const confirmedOrders = dealerOrders.filter(o => o.status === OrderStatus.TESLIM_EDILDI || o.status === OrderStatus.ONAYLANDI || o.status === OrderStatus.KARGODA);

  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommission = (totalRevenue * dealer.commissionRate) / 100;

  return {
    totalOrders: dealerOrders.length,
    totalRevenue,
    totalCommission,
    currentBalance: dealer.balance
  };
};

export const getUsersForDealerAssignment = async (): Promise<User[]> => {
  await delay(400);
  return usersStore;
};

// --- SECURITY API ---

export const getBlacklist = async (): Promise<BlacklistItem[]> => {
  await delay(400);
  return blacklistStore;
};

export const addToBlacklist = async (ip: string, reason: string): Promise<BlacklistItem> => {
  await delay(500);
  const item: BlacklistItem = {
    id: `bl${Date.now()}`,
    ip,
    reason,
    createdAt: new Date().toISOString(),
    createdBy: 'Admin'
  };
  blacklistStore.unshift(item);
  return item;
};

export const removeFromBlacklist = async (id: string): Promise<void> => {
  await delay(400);
  blacklistStore = blacklistStore.filter(i => i.id !== id);
};

export const getSecurityLogs = async (): Promise<SecurityLog[]> => {
  await delay(500);
  return securityLogsStore;
};

// --- Stock Management ---

let stockMovementsStore: StockMovement[] = [];
let activityLogsStore: ActivityLog[] = [
  {
    id: 'log1',
    userId: 'u1',
    userName: 'Admin User',
    action: 'LOGIN',
    details: 'User logged in',
    createdAt: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  }
];

export const getStockMovements = async (productId?: string): Promise<StockMovement[]> => {
  await delay(300);
  if (productId) {
    return stockMovementsStore.filter(m => m.productId === productId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return stockMovementsStore.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addStockMovement = async (movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<StockMovement> => {
  await delay(500);

  const newMovement: StockMovement = {
    ...movement,
    id: `sm-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  stockMovementsStore.push(newMovement);

  // Update Product Stock
  const productIndex = productsStore.findIndex(p => p.id === movement.productId);
  if (productIndex > -1) {
    const product = productsStore[productIndex];

    // If variant is specified, update variant stock
    if (movement.variantId) {
      const variantIndex = product.variants.findIndex(v => v.id === movement.variantId);
      if (variantIndex > -1) {
        let currentStock = product.variants[variantIndex].stock || 0;
        if ([StockMovementType.IN, StockMovementType.RETURN, StockMovementType.CANCEL].includes(movement.type)) {
          currentStock += movement.quantity;
        } else if (movement.type === StockMovementType.OUT) {
          currentStock -= movement.quantity;
        }

        product.variants[variantIndex].stock = currentStock;
      }
    }
    productsStore[productIndex] = product;
  }

  return newMovement;
};

// --- Activity Logs ---
export const getActivityLogs = async (userId?: string): Promise<ActivityLog[]> => {
  await delay(300);
  if (userId) {
    return activityLogsStore.filter(l => l.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return activityLogsStore.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addActivityLog = async (log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> => {
  const newLog: ActivityLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  activityLogsStore.push(newLog);
  return newLog;
};

// --- General Settings ---
export const getGeneralSettings = async (): Promise<GeneralSettings> => {
  await delay(300);
  return generalSettingsStore;
};

export const updateGeneralSettings = async (settings: Partial<GeneralSettings>): Promise<GeneralSettings> => {
  await delay(600);
  generalSettingsStore = { ...generalSettingsStore, ...settings };
  return generalSettingsStore;
};

// --- Legal Settings ---
export const getLegalSettings = async (): Promise<LegalSettings> => {
  await delay(300);
  return legalSettingsStore;
};

export const updateLegalSettings = async (settings: Partial<LegalSettings>): Promise<LegalSettings> => {
  await delay(600);
  legalSettingsStore = { ...legalSettingsStore, ...settings };
  return legalSettingsStore;
};

// --- Pixel Settings ---
export const getPixelSettings = async (): Promise<PixelSettings> => {
  await delay(300);
  return pixelSettingsStore;
};

export const updatePixelSettings = async (settings: Partial<PixelSettings>): Promise<PixelSettings> => {
  await delay(600);
  pixelSettingsStore = { ...pixelSettingsStore, ...settings };
  return pixelSettingsStore;
};

// --- Integration Settings ---
export const getIntegrationSettings = async (): Promise<ProviderConfig[]> => {
  await delay(300);
  return integrationSettingsStore;
};

export const updateIntegrationSettings = async (id: string, data: Partial<ProviderConfig>): Promise<void> => {
  await delay(500);
  const index = integrationSettingsStore.findIndex(p => p.id === id);
  if (index !== -1) {
    integrationSettingsStore[index] = { ...integrationSettingsStore[index], ...data };
  }
};
