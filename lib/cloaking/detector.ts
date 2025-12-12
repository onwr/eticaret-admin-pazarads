/**
 * Cloaking Detector Utility
 * 
 * In a real application, this would likely run on Edge Middleware 
 * to intercept requests before they reach the main server.
 */

// List of common bot signatures in User-Agent strings
const BOT_SIGNATURES = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest/0.',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeuripreview',
  'nuzzel',
  'discordbot',
  'google page speed',
  'qwantify',
  'pinterest',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'chrome-lighthouse',
  'telegrambot'
];

/**
 * Checks if a given User-Agent string belongs to a known bot/crawler.
 * @param userAgent The User-Agent string from the request headers
 * @returns true if identified as a bot, false otherwise
 */
export const isBot = (userAgent: string | undefined): boolean => {
  if (!userAgent) return true; // Treat missing UA as suspicious
  
  const ua = userAgent.toLowerCase();
  
  // Direct match check
  for (const signature of BOT_SIGNATURES) {
    if (ua.includes(signature)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Simulates the cloaking decision process
 */
export const determinePageType = (
  userAgent: string, 
  isCloakingActive: boolean, 
  safePageUrl?: string
): 'MONEY_PAGE' | 'SAFE_PAGE' => {
  if (!isCloakingActive) return 'MONEY_PAGE';
  if (!safePageUrl) return 'MONEY_PAGE'; // Fallback if no safe page defined
  
  if (isBot(userAgent)) {
    return 'SAFE_PAGE';
  }
  
  return 'MONEY_PAGE';
};