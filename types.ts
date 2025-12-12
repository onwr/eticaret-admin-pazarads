
// --- Auth & User ---
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  EDITOR = 'EDITOR',
  DEALER = 'DEALER'
}

export interface PermissionSet {
  catalog_view: boolean;
  catalog_create: boolean;
  catalog_edit: boolean;
  catalog_delete: boolean;
  orders_view: boolean;
  orders_edit: boolean;
  orders_approve: boolean;
  orders_export: boolean;
  customers_view: boolean;
  dealers_manage: boolean;
  domains_manage: boolean;
  templates_manage: boolean;
  reports_view: boolean;
  users_manage: boolean;
  settings_manage: boolean;
  logs_view: boolean;
  stock_manage: boolean; // New permission
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: PermissionSet;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  password?: string;
  permissions?: PermissionSet;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// --- Dealers ---
export interface Dealer {
  id: string;
  userId: string;
  companyName: string;
  taxNumber?: string;
  commissionRate: number;
  balance: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: string;
  user?: User;
}

export interface DealerFormData {
  userId: string;
  companyName: string;
  taxNumber?: string;
  commissionRate: number;
  isActive: boolean;
}

export interface DealerStats {
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  currentBalance: number;
}

// --- Marketing & Checkout Config ---
export interface MarketingConfig {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  // Specific fields for Settings tab
  pixelId?: string;
  capiToken?: string;
}

export type CheckoutFieldType = 'TEXT' | 'PHONE' | 'SELECT_CITY' | 'SELECT_DISTRICT' | 'SELECT' | 'TEXTAREA' | 'CHECKBOX';

export interface CheckoutField {
  id: string;
  label: string;
  key: string;
  type: CheckoutFieldType | string;
  isRequired: boolean;
  isVisible: boolean;
  order: number;
  options?: string[]; // For SELECT type
}

export interface CheckoutConfig {
  fields: CheckoutField[];
  cityDistrictSelection?: 'manual' | 'dropdown'; // New config
  paymentMethods: {
    cod_cash: boolean;
    cod_card: boolean;
    online_credit_card: boolean;
    bank_transfer: boolean;
  };
}

export interface GeneralSettings {
  siteTitle: string;
  metaDescription: string;
  supportEmail: string;
  supportWhatsapp: string;
  currency: string;
  logo: string;
  favicon: string;
}

export interface LegalSettings {
  kvkk: string;
  terms: string;
  refund: string;
}

export interface PixelSettings {
  headCode: string;
  bodyCode: string;
}

export interface UpsellImage {
  id: string;
  url: string;
  order: number;
}

export interface Upsell {
  id: string;
  title: string;
  shortName?: string; // New field for badge/tag
  description?: string;
  price: number;
  originalPrice?: number;
  quantity?: number;

  // Updated Media Structure
  images: UpsellImage[];
  videoUrl?: string; // Specific video url

  triggerProductIds: string[]; // Which products trigger this upsell
  isActive: boolean;
}

export interface ProductPaymentConfig {
  methods: {
    cod_cash: boolean;
    cod_card: boolean;
    online_credit_card: boolean;
    bank_transfer: boolean;
  };
  fees: {
    cod_cash?: number;
    cod_card?: number;
    online_credit_card?: number;
    bank_transfer?: number;
  };
  discounts: {
    cod_cash?: number;
    cod_card?: number;
    online_credit_card?: number;
    bank_transfer?: number;
  };
  bankDetails?: {
    bankName: string;
    iban: string;
    accountHolder: string;
  };
}

// --- Products ---
export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface ProductPrice {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  label?: string; // e.g. "Best Value"
  // Specific pricing fields
  shippingCost?: number;
  discountRate?: number;
  unit?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string; // Required for form
  stock: number;
  price: number; // Additional price
  // Legacy/Optional support
  name?: string;
  type?: string;
  values?: string[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  order: number;
  alt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  isActive: boolean;
  createdAt: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  status: ProductStatus;
  salesCount?: number; // Added for promotion list view
  ctaText?: string;
  ctaColor?: string;
  ctaEmoji?: string;
  ctaBorderRadius?: number;
  whatsappNumber?: string;
  videoUrl?: string;

  // SEO Fields
  seoTitle?: string;
  seoKeywords?: string;

  // Settings
  isFreeShipping?: boolean;

  prices: ProductPrice[];
  variants: ProductVariant[];
  images: ProductImage[];
  adminCoverImage?: string; // New field for admin-only cover image
  reviews: ProductReview[];

  // Marketing & Config
  marketing?: MarketingConfig;
  checkoutConfig?: CheckoutConfig;
  paymentConfig?: ProductPaymentConfig;
  linkedUpsellIds?: string[];
}

export interface ProductFormData extends Partial<Product> {
  // Helper for form state
}

export interface PriceFormData {
  quantity: number;
  price: number;
  originalPrice?: number;
  label?: string;
}

export interface VariantFormData {
  name: string;
  type: string;
  values: string[];
}

export interface ReviewFormData {
  author: string;
  rating: number;
  comment: string;
  isActive: boolean;
  imageUrl?: string;
}

// --- Stock Management ---
export enum StockMovementType {
  IN = 'IN', // Giriş
  OUT = 'OUT', // Çıkış (Satış vb.)
  ADJUST = 'ADJUST', // Düzeltme (Sayım vb.)
  RETURN = 'RETURN', // İade
  CANCEL = 'CANCEL' // İptal
}

export interface StockMovement {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  quantity: number;
  type: StockMovementType;
  documentUrl?: string; // İrsaliye vb.
  note?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// --- Activity Logs ---
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string; // e.g. "ORDER_UPDATE", "PRODUCT_CREATE", "LOGIN"
  details: string;
  ipAddress?: string;
  createdAt: string;
  entityId?: string; // ID of the object affected
  entityType?: string; // "ORDER", "PRODUCT", "USER"
}

// --- Customers ---
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district: string;
}

// --- Orders ---
export enum OrderStatus {
  NEW = 'NEW',
  ARANACAK = 'ARANACAK',
  ONAYLANDI = 'ONAYLANDI',
  KARGODA = 'KARGODA',
  TESLIM_EDILDI = 'TESLIM_EDILDI',
  ULASILAMADI = 'ULASILAMADI',
  YANLIS_NUMARA = 'YANLIS_NUMARA',
  IPTAL = 'IPTAL',
  IADE = 'IADE'
}

export interface CustomStatus {
  id: string;
  label: string;
  color: string;
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  REFUNDED = 'REFUNDED'
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantSelection?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;

  productId: string;
  priceId: string;

  items: OrderItem[];

  variantSelection?: string;
  status: OrderStatus | string; // Updated to allow custom strings
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  ipAddress?: string;
  userAgent?: string;

  referrer?: string;
  source?: string; // Added for reports
  landingPage?: string;
  scheduledDate?: string; // New field for "İleri Tarihe At"

  dealerId?: string;
  createdAt: string;
  updatedAt?: string;

  customer?: Customer;
  product?: Product;
  dealer?: Dealer;
  logs?: OrderLog[];
}

export interface OrderLog {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  action: string;
  message: string;
  createdAt: string;
}

export interface OrderFormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  productId?: string;
  priceId?: string;
  paymentMethod?: string;
}

// --- Export Templates ---
export interface ExportColumn {
  id: string;
  header: string;
  type: 'DYNAMIC' | 'STATIC';
  value: string; // Field key (e.g. 'customer.name') or static text
}

export interface ExportTemplate {
  id: string;
  name: string;
  columns: ExportColumn[];
}

// --- Domains & Landing Pages ---
export interface Domain {
  id: string;
  domain: string;
  productId: string;
  languageId: string;
  templateId: string;
  themeColor?: string;
  pixelCode?: string;
  scriptCode?: string;
  isActive: boolean;
  isCloakingActive?: boolean;
  safePageUrl?: string;
  dealerId?: string;
  product?: Product;
}

export interface DomainFormData {
  domain: string;
  productId: string;
  languageId: string;
  templateId: string;
  themeColor?: string;
  pixelCode?: string;
  scriptCode?: string;
  isActive: boolean;
  isCloakingActive?: boolean;
  safePageUrl?: string;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Template {
  id: string;
  name: string;
  code: string;
  description: string;
  thumbnailUrl?: string;
}

// --- Call Center ---
export enum CallOutcome {
  REACHED_CONFIRMED = 'REACHED_CONFIRMED',
  REACHED_CANCELLED = 'REACHED_CANCELLED',
  BUSY = 'BUSY',
  UNREACHABLE = 'UNREACHABLE',
  WRONG_NUMBER = 'WRONG_NUMBER',
  SCHEDULED = 'SCHEDULED'
}

export interface DashboardStats {
  current: {
    revenue: number;
    orders: number;
    aov: number;
    pending: number;
    delivered: number;
  };
  previous: {
    revenue: number;
    orders: number;
    aov: number;
    pending: number;
    delivered: number;
  };
  performance: {
    revenue: number;
    orders: number;
    aov: number;
  };
  today: {
    revenue: number;
    orders: number;
    aov: number;
    pending: number;
    delivered: number;
  };
  lastOrders: Order[];
}



export interface CallLog {
  id: string;
  orderId: string;
  agentId: string;
  agentName: string;
  outcome: CallOutcome;
  durationSeconds: number;
  note?: string;
  calledAt: string;
}

export interface AgentStats {
  agentId: string;
  agentName: string;
  totalCalls: number;
  confirmedOrders: number;
  cancelledOrders: number;
  approvalRate: number;
  avgDurationSeconds: number;
}

export interface CallCenterStats {
  totalCalls: number;
  successRate: number;
  avgDuration: string;
  ordersApproved: number;
}

// Enhanced Call Center Types
export enum CallPoolStatus {
  WAITING = 'WAITING',
  DIALING = 'DIALING',
  CONNECTED = 'CONNECTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface CallPoolItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: CallPoolStatus;
  priority: number;
  addedAt: string;
  order?: Order;
  // Retry Logic
  retryCount?: number;
  nextRetryAt?: string;
  lastCallOutcome?: CallOutcome;
}

export interface CallSession {
  id: string;
  poolItemId: string;
  agentId: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  outcome?: CallOutcome;
  notes?: string;
  recordingUrl?: string;
}

// --- SMS ---
export enum SmsType {
  GENERAL = 'GENERAL',
  ORDER_NOTIFICATION = 'ORDER_NOTIFICATION',
  SHIPPING_INFO = 'SHIPPING_INFO',
  CAMPAIGN = 'CAMPAIGN'
}

export enum SmsProvider {
  NETGSM = 'NETGSM',
  ILETIMERKEZI = 'ILETIMERKEZI',
  TWILIO = 'TWILIO'
}

export interface SmsTemplate {
  id: string;
  title: string;
  content: string;
  type: SmsType;
  isActive: boolean;
}

export interface SmsTemplateFormData {
  title: string;
  content: string;
  type: SmsType;
  isActive: boolean;
}

export interface SmsLog {
  id: string;
  phone: string;
  message: string;
  type: SmsType;
  provider: SmsProvider;
  status: string;
  sentAt: string;
  orderId?: string;
  sentBy?: string;
}

// --- WhatsApp ---
export enum WhatsappProvider {
  DIALOG360 = 'DIALOG360',
  TWILIO = 'TWILIO',
  META_CLOUD = 'META_CLOUD'
}

export enum WhatsappTemplateCategory {
  UTILITY = 'UTILITY',
  MARKETING = 'MARKETING',
  AUTHENTICATION = 'AUTHENTICATION'
}

export enum WhatsappTemplateStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export interface WhatsappTemplate {
  id: string;
  name: string;
  category: WhatsappTemplateCategory;
  language: string;
  content: string; // Body
  header?: string;
  footer?: string;
  status: WhatsappTemplateStatus;
}

export interface WhatsappTemplateFormData {
  name: string;
  category: WhatsappTemplateCategory;
  language: string;
  content: string;
  header?: string;
  footer?: string;
}

export interface WhatsappLog {
  id: string;
  orderId?: string;
  phone: string;
  templateName: string;
  content: string;
  provider: WhatsappProvider;
  status: string;
  sentAt: string;
  sentBy?: string;
}

// --- Dashboard ---
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  activeProducts: number;
}

// --- SHIPPING TYPES ---
export enum ShippingStatus {
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED'
}

export enum ShippingProviderType {
  DIRECT = 'DIRECT',
  AGGREGATOR = 'AGGREGATOR'
}

export interface ShippingPriceRange {
  min: number;
  max: number;
  price: number;
}

export interface ShippingDesiRange {
  maxDesi: number;
  price: number;
}

export interface ShippingSubCarrier {
  code: string;
  name: string;
  branchCode: string | number;
  isActive: boolean;

  // Payment Capabilities
  isCashOnDoorAvailable: boolean;
  isCardOnDoorAvailable: boolean;

  // Pricing Configuration
  fixedPrice: number; // Teslim Tutarı (Base)
  returnPrice: number; // İade Tutarı
  cardCommission: number; // Komisyon Yüzdesi (0.05 for 5%)

  // Tiered Pricing (Tahsilatlı Kargo Komisyonları)
  priceRanges?: ShippingPriceRange[]; // @deprecated Use codRanges
  desiRanges?: ShippingDesiRange[]; // Taşıma Maliyeti (Desi bazlı)
  codRanges?: ShippingPriceRange[]; // Tahsilat Komisyonu (Tutar bazlı)
}

export interface ShippingCompany {
  id: string;
  name: string;
  code: string;
  type: ShippingProviderType;
  isActive: boolean;
  isDefault: boolean;

  // Configuration for sub-carriers (specifically for Fest)
  subCarriers?: ShippingSubCarrier[];

  // Deprecated but kept for backward compat in legacy direct integrations
  pricingRules?: any[];
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingCode: string;
  companyId?: string;
  status: ShippingStatus;
  createdAt: string;
  updatedAt: string;

  // Relations
  order?: Order;
  company?: ShippingCompany;

  // New Fields for Fest Integration
  festStatusCode?: string; // e.g. "42", "10"
  subCarrier?: string; // e.g. "Aras Kargo", "PTT"
  lastMovementDate?: string;
  problemDescription?: string; // e.g. "Adreste bulunamadı"
}

export interface CreateShipmentData {
  orderId: string;
  companyId: string;
  subCarrierCode?: string;
  amountType?: number;
  codAmount?: number;
  weight?: number;
  desi?: number;
  trackingCode?: string;
}

// --- FEST TYPES ---
export enum FestCargoStatus {
  HAZIRLANIYOR = '00',
  KARGODA = '40',
  TESLIM_EDILDI = '10',
  IADE = '20',
}

export enum FestAmountType {
  TOPLU_GONDERI = 1,
  UCRET_ALICI = 2,
  KAPIDA_NAKIT = 3,
  KREDI_KARTI = 5,
  KAPIDA_KREDI_KARTI = 6
}

export interface FestConsignmentPayload {
  customer: string;
  province_name: string;
  county_name: string;
  district: string;
  address: string;
  telephone: string;
  branch_code: string | number;
  consignment_type_id: number;
  amount_type_id: number;
  amount: string;
  order_number: string;
  quantity: number;
  weight?: number;
  desi?: number;
  summary?: string;
}

export interface FestConsignmentResponse {
  error: boolean;
  result: string;
  barcode: string;
  record_id: number;
}

// --- PAYMENT TYPES ---
export enum PaymentProvider {
  PAYTR = 'PAYTR',
  IYZICO = 'IYZICO',
  STRIPE = 'STRIPE',
  OFFLINE = 'OFFLINE'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  COD = 'COD',
  CC_ON_DOOR = 'CC_ON_DOOR',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  transactionId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  installments: number;
  last4?: string;
  errorMessage?: string;
  createdAt: string;
  order?: Order;
}

export interface CreditCardForm {
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
}

export interface PaymentInitResult {
  success: boolean;
  redirectUrl?: string;
  htmlContent?: string;
  transactionId?: string;
  error?: string;
}

// --- AI TYPES ---
export enum AiProvider {
  OPENAI = 'OPENAI',
  GEMINI = 'GEMINI',
  CLAUDE = 'CLAUDE'
}

export enum AiTaskType {
  AD_COPY = 'AD_COPY',
  PRODUCT_DESCRIPTION = 'PRODUCT_DESCRIPTION',
  TRANSLATION = 'TRANSLATION',
  FRAUD_ANALYSIS = 'FRAUD_ANALYSIS'
}

export interface AiRequest {
  provider: AiProvider;
  task: AiTaskType;
  prompt?: string;
  context?: any;
  options?: {
    tone?: string;
    language?: string;
    length?: 'short' | 'medium' | 'long';
  };
}

export interface AiResponse {
  success: boolean;
  content?: string;
  data?: any;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export interface FraudAnalysisResult {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  recommendedAction: 'APPROVE' | 'REVIEW' | 'CANCEL';
}

export interface AdCopyResult {
  headline: string;
  primaryText: string;
  cta: string;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  category: 'products' | 'upsells' | 'reviews' | 'general';
  createdAt: number;
}
