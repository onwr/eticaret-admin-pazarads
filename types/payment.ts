
import { Order } from "../types";

export enum PaymentProvider {
  PAYTR = 'PAYTR',
  IYZICO = 'IYZICO',
  STRIPE = 'STRIPE',
  OFFLINE = 'OFFLINE' // For Cash/Card on Delivery
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  COD = 'COD', // Cash on Delivery
  CC_ON_DOOR = 'CC_ON_DOOR', // Credit Card on Door
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
  transactionId: string; // ID from the provider (e.g., Stripe PaymentIntent ID)
  amount: number;
  currency: string;
  status: TransactionStatus;
  installments: number;
  last4?: string; // Last 4 digits of card
  errorMessage?: string;
  createdAt: string;
  
  // Relations
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
  redirectUrl?: string; // If 3D Secure or external page
  htmlContent?: string; // If iframe (PayTR)
  transactionId?: string;
  error?: string;
}
