
import { CreditCardForm, PaymentInitResult } from '../../types/payment';

export class StripeProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processPayment(orderId: string, amount: number, card: CreditCardForm): Promise<PaymentInitResult> {
    console.log(`[Stripe] Creating PaymentIntent for Order ${orderId}, Amount: ${amount}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate Stripe specific behavior (e.g. 3DS check)
    // For mock, just return success
    return {
      success: true,
      transactionId: `pi_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
  }
}

export const stripeClient = new StripeProvider('mock-sk-key');
