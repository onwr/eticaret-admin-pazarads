
import { Order } from '../../types';
import { FakeDetectionResult } from '../../types/security';

const FAKE_NAMES = ['test', 'deneme', 'asd', 'qwe', 'admin', 'user', 'musteri'];
const FAKE_PHONE_PATTERNS = [
  /^(\+?90)?5555555555$/,
  /^(\+?90)?5\d{2}0000000$/,
  /^(\+?90)?5\d{2}1234567$/,
  /123456/,
  /000000/
];

export const detectFakeOrder = (
  data: { name: string; phone: string; ipAddress?: string },
  existingOrders: Order[]
): FakeDetectionResult => {
  const reasons: string[] = [];
  let score = 0;

  const lowerName = data.name.toLowerCase().trim();
  const cleanPhone = data.phone.replace(/\D/g, '');

  // 1. Name Checks
  if (FAKE_NAMES.some(n => lowerName.includes(n))) {
    score += 50;
    reasons.push('Suspicious name pattern detected (e.g. test, deneme)');
  }
  if (lowerName.length < 3) {
    score += 30;
    reasons.push('Name too short');
  }
  // Check for repeating characters (e.g. "aaaaa")
  if (/(.)\1{3,}/.test(lowerName)) {
    score += 40;
    reasons.push('Name contains repetitive characters');
  }

  // 2. Phone Checks
  if (FAKE_PHONE_PATTERNS.some(p => p.test(cleanPhone))) {
    score += 80;
    reasons.push('Phone number matches known fake patterns');
  }
  if (cleanPhone.length < 10) {
    score += 100;
    reasons.push('Invalid phone number length');
  }

  // 3. Velocity Checks (Same IP/Phone in last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  if (data.ipAddress) {
    const ipCount = existingOrders.filter(o => 
      o.ipAddress === data.ipAddress && o.createdAt > oneHourAgo
    ).length;
    
    if (ipCount > 3) {
      score += 40;
      reasons.push(`High velocity: ${ipCount} orders from same IP in 1 hour`);
    }
  }

  const phoneCount = existingOrders.filter(o => 
    o.customer?.phone.replace(/\D/g, '') === cleanPhone && o.createdAt > oneHourAgo
  ).length;

  if (phoneCount > 2) {
    score += 60;
    reasons.push(`High velocity: ${phoneCount} orders with same phone in 1 hour`);
  }

  return {
    isFake: score >= 50,
    score,
    reasons
  };
};
