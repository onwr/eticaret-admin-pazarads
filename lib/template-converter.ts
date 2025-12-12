// Template to Vanilla HTML/JS Converter
import { Product, Template } from '../types';

export interface TemplateConversionOptions {
  templateId: string;
  product: Product;
  themeColor: string;
  domain: string;
  apiBaseUrl: string;
  pixels: {
    facebook?: string;
    tiktok?: string;
    ga?: string;
  };
}

/**
 * Converts React template to standalone vanilla HTML/JS
 */
export const convertTemplateToHTML = (options: TemplateConversionOptions): string => {
  const { product, themeColor, domain } = options;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(product.seoTitle || product.description)}">
  <meta name="keywords" content="${escapeHtml(product.seoKeywords || '')}">
  
  <title id="page-title">${escapeHtml(product.name)}</title>
  
  <!-- Preconnect -->
  <link rel="preconnect" href="${options.apiBaseUrl}">
  
  <!-- Critical CSS - Inline for performance -->
  <style>
${generateCriticalCSS(themeColor)}
  </style>
  
  <!-- Favicon -->
  <link rel="icon" href="${product.images[0]?.url || ''}" type="image/png">
</head>
<body>
  <!-- Main App Container -->
  <div id="landing-page" class="min-h-screen">
    <!-- Loading State -->
    <div id="loading-screen" class="loading-screen">
      <div class="spinner"></div>
      <p>Yükleniyor...</p>
    </div>
    
    <!-- Content will be rendered here -->
    <div id="main-content" style="display:none;"></div>
    <div id="main-content" style="display:none;"></div>
    
    <!-- Toast Container -->
    <div id="toast-container" class="toast-container"></div>
  </div>
  
  <!-- Order Form Modal -->
  <div id="order-modal" class="modal" style="display:none;">
    <div class="modal-overlay" onclick="closeOrderModal()"></div>
    <div class="modal-content">
      <button class="modal-close" onclick="closeOrderModal()">×</button>
      <h2>Sipariş Bilgileri</h2>
      <form id="order-form" onsubmit="submitOrder(event)">
        <div class="form-group">
          <label>İsim Soyisim *</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group">
          <label>Telefon *</label>
          <input type="tel" name="phone" required>
        </div>
        <div class="form-group">
          <label>Adres *</label>
          <textarea name="address" required></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Şehir *</label>
            <input type="text" name="city" required>
          </div>
          <div class="form-group">
            <label>İlçe *</label>
            <input type="text" name="district" required>
          </div>
        </div>
        <button type="submit" class="btn-primary">Siparişi Tamamla</button>
      </form>
    </div>
  </div>
  
  <!-- Config (loaded from config.js) -->
  <script src="config.js"></script>
  
  <!-- Pixels -->
  <script src="pixels.js" async></script>
  
  <!-- API Client -->
  <script src="api-client.js"></script>
  
  <!-- Main Application Logic -->
  <script>
${generateMainAppJS(product, themeColor)}
  </script>
</body>
</html>`;
};

/**
 * Generate critical CSS (inline for performance)
 */
const generateCriticalCSS = (themeColor: string): string => {
  return `    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .loading-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}05 100%);
    }
    
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid ${themeColor};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    
    .hero {
      padding: 60px 0;
      background: linear-gradient(135deg, ${themeColor}10 0%, transparent 100%);
    }
    
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: center;
    }
    
    @media (max-width: 768px) {
      .hero-grid { grid-template-columns: 1fr; }
    }
    
    .product-image {
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    
    .description {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 30px;
    }
    
    .btn-primary {
      background: ${themeColor};
      color: white;
      padding: 16px 48px;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: inline-block;
      text-decoration: none;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px ${themeColor}40;
    }
    
    .btn-primary:active {
      transform: translateY(0);
    }
    
    /* Modal Styles */
    .modal {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .modal-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
    }
    
    .modal-content {
      position: relative;
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 32px;
      cursor: pointer;
      color: #999;
      line-height: 1;
      padding: 0;
      width: 32px;
      height: 32px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e5e5e5;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s;
    }
    
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: ${themeColor};
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
    }
    
    /* Toast Notification */
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .toast {
      background: white;
      color: #333;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out forwards;
      max-width: 350px;
      border-left: 4px solid ${themeColor};
    }
    
    .toast.error { border-left-color: #ef4444; }
    .toast.success { border-left-color: #10b981; }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }`;
};

/**
 * Generate main application JavaScript
 */
const generateMainAppJS = (product: Product, themeColor: string): string => {
  return `    // Initialize on page load
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        // Hide loading screen after a short delay
        setTimeout(() => {
          document.getElementById('loading-screen').style.display = 'none';
          document.getElementById('main-content').style.display = 'block';
        }, 500);
        
        // Render product page
        renderProductPage();
        
        // Track page view
        if (window.trackPixelEvent) {
          window.trackPixelEvent('PageView', {
            content_name: '${escapeJS(product.name)}',
            content_ids: ['${product.id}'],
            content_type: 'product'
          });
        }
      } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('loading-screen').innerHTML = 
          '<p style="color: red;">Sayfa yüklenirken bir hata oluştu.</p>';
      }
    });
    
    // Render product page
    function renderProductPage() {
      const mainContent = document.getElementById('main-content');
      const productHTML = \`
        <div class="hero">
          <div class="container">
            <div class="hero-grid">
              <div>
                <h1>${escapeHtml(product.name)}</h1>
                <p class="description">${escapeHtml(product.description)}</p>
                <button class="btn-primary" onclick="openOrderModal()">
                  ${escapeHtml(product.ctaText || 'Hemen Sipariş Ver')}
                </button>
              </div>
              <div>
                <img src="${product.images[0]?.url || ''}" 
                     alt="${escapeHtml(product.name)}" 
                     class="product-image"
                     loading="eager">
              </div>
            </div>
          </div>
        </div>
      \`;
      
      mainContent.innerHTML = productHTML;
    }
    
    // Open order modal
    function openOrderModal() {
      document.getElementById('order-modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Track InitiateCheckout
      if (window.trackPixelEvent) {
        window.trackPixelEvent('InitiateCheckout', {
          content_ids: ['${product.id}'],
          value: ${product.prices[0]?.price || 0},
          currency: 'TRY'
        });
      }
    }
    
    // Close order modal
    function closeOrderModal() {
      document.getElementById('order-modal').style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    
    // Submit order
    async function submitOrder(event) {
      event.preventDefault();
      
      const form = event.target;
      const formData = new FormData(form);
      
      const orderData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        district: formData.get('district'),
        productId: '${product.id}',
        priceId: '${product.prices[0]?.id || ''}',
        paymentMethod: 'COD',
        domain: CONFIG.DOMAIN
      };
      
      try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Gönderiliyor...';
        
        const response = await window.api.createOrder(orderData);
        
        // Track Purchase
        if (window.trackPixelEvent) {
          window.trackPixelEvent('Purchase', {
            value: ${product.prices[0]?.price || 0},
            currency: 'TRY',
            content_ids: ['${product.id}'],
            content_type: 'product'
          });
        }
        
        // Show success message
        showToast('Siparişiniz alındı! Teşekkür ederiz.', 'success');
        closeOrderModal();
        form.reset();
        
      } catch (error) {
        console.error('Order error:', error);
        showToast('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
      } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Siparişi Tamamla';
      }
    }
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeOrderModal();
      }
    });
    
    // Toast Notification System
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = \`toast \${type}\`;
      toast.innerHTML = \`
        <div style="flex:1">\${message}</div>
      \`;
      
      container.appendChild(toast);
      
      // Remove after 3 seconds
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }`;
};

/**
 * Escape HTML special characters
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Escape JavaScript special characters
 */
const escapeJS = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
};
