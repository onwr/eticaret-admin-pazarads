
// Simple token bucket simulation for client-side demo
// In a real app, this would use Redis on the server

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const WINDOW_MS = 60 * 1000; // 1 Minute
const MAX_REQUESTS = 10; // 10 requests per minute

const store: RateLimitStore = {};

export const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = store[ip];

  if (!record) {
    store[ip] = {
      count: 1,
      resetTime: now + WINDOW_MS
    };
    return true;
  }

  if (now > record.resetTime) {
    // Reset window
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    return true;
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return false; // Blocked
  }

  return true; // Allowed
};
