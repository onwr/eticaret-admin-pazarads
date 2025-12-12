
import { CreditCardForm, PaymentInitResult } from '../../types/payment';

export class IyzicoProvider {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = 'https://sandbox-api.iyzipay.com';
  }

  async processPayment(orderId: string, amount: number, card: CreditCardForm): Promise<PaymentInitResult> {
    console.log(`[Iyzico] Initializing payment for Order ${orderId}, Amount: ${amount}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (card.cvv === '000') {
        return { success: false, error: 'Payment declined by bank' };
    }

    return {
      success: true,
      transactionId: `iyz-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
  }
}

export const iyzicoClient = new IyzicoProvider('mock-api-key', 'mock-secret-key');
