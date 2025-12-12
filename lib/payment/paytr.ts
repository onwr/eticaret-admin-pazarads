
import { CreditCardForm, PaymentInitResult } from '../../types/payment';

export class PaytrProvider {
  private merchantId: string;
  private merchantKey: string;
  private merchantSalt: string;

  constructor(merchantId: string, merchantKey: string, merchantSalt: string) {
    this.merchantId = merchantId;
    this.merchantKey = merchantKey;
    this.merchantSalt = merchantSalt;
  }

  async processPayment(orderId: string, amount: number, card: CreditCardForm): Promise<PaymentInitResult> {
    console.log(`[PayTR] Initializing payment for Order ${orderId}, Amount: ${amount}`);
    
    // In a real implementation, you would:
    // 1. Prepare payload with user info, basket items, etc.
    // 2. Generate token using SHA256 HMAC
    // 3. Request iframe token from https://www.paytr.com/odeme/api/get-token
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate basic validation
    if (card.cardNumber.length < 16) {
      return { success: false, error: 'Invalid card number' };
    }

    return {
      success: true,
      transactionId: `paytr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      // For iFrame mode, PayTR returns a token to embed. Here we simulate direct success for the mock.
    };
  }
}

export const paytrClient = new PaytrProvider('mock-id', 'mock-key', 'mock-salt');
