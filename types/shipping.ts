
import { Order } from "../types";

export enum ShippingStatus {
  PREPARING = 'PREPARING', // HAZIRLANIYOR
  SHIPPED = 'SHIPPED',     // KARGODA
  DELIVERED = 'DELIVERED', // TESLIM_EDILDI
  RETURNED = 'RETURNED',   // IADE
  CANCELLED = 'CANCELLED'
}

export enum ShippingProviderType {
  DIRECT = 'DIRECT', // Yurtiçi, Aras direct integration
  AGGREGATOR = 'AGGREGATOR' // Fest Kargo etc.
}

export interface ShippingPriceRange {
  min: number;
  max: number;
  price: number; // The fee/cost for this range (Tahsilat Komisyonu)
}

export interface ShippingDesiRange {
  maxDesi: number; // e.g. 1, 3, 5
  price: number;   // e.g. 30 TL for 0-1 Desi
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
  fixedPrice: number; // Base fixed fee (if not using Desi logic)
  returnPrice: number; // İade Tutarı (Sabit)
  cardCommission: number; // Komisyon Yüzdesi (0.05 for 5%)
  
  // Pricing Tables
  desiRanges: ShippingDesiRange[]; // Taşıma Maliyeti (Desi bazlı)
  codRanges: ShippingPriceRange[]; // Tahsilat Komisyonu (Tutar bazlı)
}

export interface ShippingCompany {
  id: string;
  name: string;
  code: string; // FEST, YURTICI
  type: ShippingProviderType;
  isActive: boolean;
  isDefault: boolean;
  
  // Configuration for sub-carriers (specifically for Fest)
  subCarriers?: ShippingSubCarrier[];
  
  // Legacy support for direct integration pricing
  pricingRules?: any[];
}

export interface Shipment {
  id: string;
  orderId: string;
  companyId: string;
  trackingCode?: string;
  externalId?: string; // ID from the provider
  status: ShippingStatus;
  providerMeta?: string; // JSON string for provider specific data
  createdAt: string;
  updatedAt: string;
  
  // Relations
  order?: Order;
  company?: ShippingCompany;
}

export interface CreateShipmentData {
  orderId: string;
  companyId: string;
  subCarrierCode?: string; // For Fest
  amountType?: number; // For Fest
  codAmount?: number;
  weight?: number;
  desi?: number;
  trackingCode?: string; // Manual override
}
