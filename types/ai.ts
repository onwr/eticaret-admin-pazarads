
export enum AiProvider {
  OPENAI = 'OPENAI',
  GEMINI = 'GEMINI'
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
  context?: any; // JSON object with specific data (e.g. order details, product info)
  options?: {
    tone?: string;
    language?: string;
    length?: 'short' | 'medium' | 'long';
  };
}

export interface AiResponse {
  success: boolean;
  content?: string;
  data?: any; // Structured data (e.g. fraud score)
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export interface FraudAnalysisResult {
  score: number; // 0-100 (100 is definitely fraud)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  recommendedAction: 'APPROVE' | 'REVIEW' | 'CANCEL';
}

export interface AdCopyResult {
  headline: string;
  primaryText: string;
  cta: string;
}
