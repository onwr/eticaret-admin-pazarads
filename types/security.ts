
export interface BlacklistItem {
  id: string;
  ip: string;
  reason?: string;
  createdAt: string;
  createdBy: string;
}

export enum SecurityEventType {
  RATE_LIMIT = 'RATE_LIMIT',
  BLACKLIST_BLOCK = 'BLACKLIST_BLOCK',
  FAKE_ORDER_ATTEMPT = 'FAKE_ORDER_ATTEMPT',
  FRAUD_DETECTED = 'FRAUD_DETECTED',
  LOGIN_FAILURE = 'LOGIN_FAILURE'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface SecurityLog {
  id: string;
  type: SecurityEventType;
  ip: string;
  description: string;
  riskLevel: RiskLevel;
  details?: any; // JSON string or object
  createdAt: string;
}

export interface FakeDetectionResult {
  isFake: boolean;
  score: number; // 0-100
  reasons: string[];
}
