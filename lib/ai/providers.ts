
import { AiProvider, AiRequest, AiResponse, FraudAnalysisResult, AdCopyResult } from '../../types';
import { Order } from '../../types';

// Mock Latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AiService {
  
  async processRequest(req: AiRequest): Promise<AiResponse> {
    await delay(1500); // Simulate network call

    switch (req.task) {
      case 'AD_COPY':
        return this.generateAdCopy(req);
      case 'PRODUCT_DESCRIPTION':
        return this.generateDescription(req);
      case 'TRANSLATION':
        return this.translate(req);
      case 'FRAUD_ANALYSIS':
        return this.analyzeFraud(req);
      default:
        return { success: false, error: 'Unknown task type' };
    }
  }

  private generateAdCopy(req: AiRequest): AiResponse {
    const { productName, audience, tone } = req.context;
    const providerName = req.provider === 'OPENAI' ? 'GPT-4' : 'Gemini Pro';
    
    const content: AdCopyResult = {
      headline: `Experience the Future of ${productName} | ${providerName} Generated`,
      primaryText: `Stop settling for less. Our new ${productName} is designed for ${audience || 'you'}. 
      
      ✨ Premium Quality
      🚀 Fast Shipping
      ✅ Satisfaction Guaranteed
      
      ${tone ? `Written in a ${tone} tone.` : ''} Don't miss out on this exclusive offer.`,
      cta: "Shop Now & Save 50%"
    };

    return {
      success: true,
      data: content,
      usage: { tokens: 150, cost: 0.002 }
    };
  }

  private generateDescription(req: AiRequest): AiResponse {
    const { name, features } = req.context;
    
    return {
      success: true,
      content: `Elevate your lifestyle with the ${name}. Engineered with precision and designed for elegance, this product features ${features || 'state-of-the-art technology'}. Whether you are at home or on the go, it provides the ultimate experience in performance and durability.`,
      usage: { tokens: 200, cost: 0.003 }
    };
  }

  private translate(req: AiRequest): AiResponse {
    const { text, targetLang } = req.context;
    
    // Mock translation logic
    const translations: Record<string, string> = {
      tr: "[TR] " + text,
      en: "[EN] " + text,
      ar: "[AR] " + text,
      fa: "[FA] " + text,
      de: "[DE] " + text
    };

    return {
      success: true,
      content: translations[targetLang] || `[${targetLang}] ${text}`,
      usage: { tokens: 50, cost: 0.001 }
    };
  }

  private analyzeFraud(req: AiRequest): AiResponse {
    const order: Order = req.context.order;
    
    let score = 0;
    const reasons: string[] = [];

    // Rule-based simulation (AI would be more complex)
    if (order.totalAmount > 500) {
      score += 20;
      reasons.push("High order value");
    }

    if (order.customer?.name.toLowerCase().includes("test")) {
      score += 50;
      reasons.push("Customer name looks suspicious");
    }

    if (order.ipAddress === "127.0.0.1") {
      // Localhost is fine for dev, but let's flag specific patterns
    }

    if (!order.customer?.phone || order.customer.phone.length < 10) {
      score += 30;
      reasons.push("Invalid phone number format");
    }

    // AI "Hallucination" / Insight
    if (Math.random() > 0.7) {
      score += 15;
      reasons.push("IP address location does not match shipping city (AI Detected)");
    }

    let riskLevel: FraudAnalysisResult['riskLevel'] = 'LOW';
    let action: FraudAnalysisResult['recommendedAction'] = 'APPROVE';

    if (score > 80) {
      riskLevel = 'CRITICAL';
      action = 'CANCEL';
    } else if (score > 50) {
      riskLevel = 'HIGH';
      action = 'REVIEW';
    } else if (score > 20) {
      riskLevel = 'MEDIUM';
      action = 'REVIEW';
    }

    const result: FraudAnalysisResult = {
      score,
      riskLevel,
      reasons,
      recommendedAction: action
    };

    return {
      success: true,
      data: result,
      usage: { tokens: 500, cost: 0.01 }
    };
  }
}

export const aiService = new AiService();
