import React, { useState } from 'react';
import { X, Download, Code, FileCode, Globe, Palette, CheckCircle, AlertTriangle } from 'lucide-react';
import { Template, Product } from '../../types';
import { getProducts } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../lib/i18n';

interface TemplateExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: Template[];
}

const TemplateExportModal: React.FC<TemplateExportModalProps> = ({ isOpen, onClose, templates }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    // Simplified Form State
    const [selectedProduct, setSelectedProduct] = useState('');
    const [domainName, setDomainName] = useState('');
    const [themeColor, setThemeColor] = useState('#3B82F6');

    const [products, setProducts] = useState<Product[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            const productsData = await getProducts();
            setProducts(productsData.filter(p => p.status === 'ACTIVE'));
        } catch (error) {
            console.error('Failed to load data');
        }
    };

    const downloadFile = (filename: string, content: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    const generateAPIClientFile = () => {
        return `// API Client for Landing Page
const API_BASE = CONFIG.ADMIN_PANEL_URL + '/api/public';

class LandingPageAPI {
  async getDomainConfig(domain) {
    try {
      const response = await fetch(\`\${API_BASE}/domain/\${domain}\`);
      if (!response.ok) throw new Error('Domain not found');
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  async createOrder(orderData) {
    try {
      const response = await fetch(\`\${API_BASE}/order\`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...orderData,
          domain: CONFIG.DOMAIN
        })
      });
      if (!response.ok) throw new Error('Order failed');
      return response.json();
    } catch (error) {
      console.error('Order Error:', error);
      throw error;
    }
  }
}

window.api = new LandingPageAPI();
console.log('[API Client] Initialized');`;
    };

    const handleExport = async () => {
        if (!selectedProduct || !domainName) {
            alert('Lütfen ürün ve domain adı girin.');
            return;
        }

        setLoading(true);
        try {
            const product = products.find(p => p.id === selectedProduct);
            if (!product) {
                alert('Ürün bulunamadı');
                return;
            }

            // Auto-detect pixels from product marketing data
            const pixels = {
                facebook: product.marketing?.facebookPixelId || '',
                tiktok: product.marketing?.tiktokPixelId || '',
                ga: product.marketing?.googleAnalyticsId || ''
            };

            // Import dynamic modules
            const { generatePixelsJS, generateHTACCESS } = await import('../../lib/export-generators');
            const { convertTemplateToHTML } = await import('../../lib/template-converter');

            // We'll generate files for ALL templates with URL routing
            const allFiles: Array<{ name: string; content: string; type: string }> = [];

            // Generate config.js (single config for all templates)
            const config = `const CONFIG = {
  ADMIN_PANEL_URL: '${window.location.origin}',
  DOMAIN: '${domainName}',
  PRODUCT_ID: '${selectedProduct}',
  THEME_COLOR: '${themeColor}',
  FACEBOOK_PIXEL: '${pixels.facebook}',
  TIKTOK_PIXEL: '${pixels.tiktok}',
  GA_ID: '${pixels.ga}',
  ENABLE_COUNTDOWN: true,
  ENABLE_STOCK_COUNTER: true,
  ENABLE_LIVE_VIEWERS: true
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}`;

            allFiles.push({ name: 'config.js', content: config, type: 'text/javascript' });

            // Generate common files
            const pixelsJS = generatePixelsJS(pixels);
            const apiClient = generateAPIClientFile();
            const htaccess = generateHTACCESS();

            allFiles.push({ name: 'api-client.js', content: apiClient, type: 'text/javascript' });
            allFiles.push({ name: 'pixels.js', content: pixelsJS, type: 'text/javascript' });
            allFiles.push({ name: '.htaccess', content: htaccess, type: 'text/plain' });

            // Generate index.html with template routing
            const indexHTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${product.name}</title>
  <link rel="preconnect" href="${window.location.origin}">
  <style>
    body { margin: 0; font-family: -apple-system, sans-serif; }
    .loading { display: flex; align-items: center; justify-content: center; height: 100vh; 
               background: linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}05 100%); }
    .spinner { width: 48px; height: 48px; border: 4px solid #f3f3f3; 
               border-top: 4px solid ${themeColor}; border-radius: 50%; 
               animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="app" class="loading"><div class="spinner"></div></div>
  <script src="config.js"></script>
  <script src="api-client.js"></script>
  <script src="pixels.js"></script>
  <script>
    // Auto-detect template from URL path
    const path = window.location.pathname;
    const templateMatch = path.match(/\\/t([1-7])$/);
    const templateId = templateMatch ? 't' + templateMatch[1] : 't1'; // Default t1
    
    // Redirect to template-specific page
    if (!templateMatch && path === '/') {
      window.location.href = '/t1'; // Default to t1
    } else {
      window.location.href = templateId + '.html';
    }
  </script>
</body>
</html>`;

            allFiles.push({ name: 'index.html', content: indexHTML, type: 'text/html' });

            // Generate HTML for each template (t1.html - t7.html)
            const templateIds = ['t1', 't2', 't3', 't4', 't5', 't6', 't7'];
            for (const templateId of templateIds) {
                const templateHTML = convertTemplateToHTML({
                    templateId,
                    product,
                    themeColor,
                    domain: domainName,
                    apiBaseUrl: window.location.origin,
                    pixels
                });
                allFiles.push({ name: `${templateId}.html`, content: templateHTML, type: 'text/html' });
            }

            // Generate README with instructions
            const readme = `# ${domainName} - Landing Page Kurulum Rehberi

## 📦 Paket İçeriği
- index.html (Ana yönlendirme)
- t1.html - t7.html (7 farklı template)
- config.js (Konfigürasyon)
- api-client.js (API bağlantısı)
- pixels.js (Tracking: ${pixels.facebook ? 'FB ' : ''}${pixels.tiktok ? 'TikTok ' : ''}${pixels.ga ? 'GA' : ''})
- .htaccess (SEO & Performance)

## 🚀 Kurulum

### 1. Dosyaları Yükleyin
Tüm dosyaları hosting'inizin kök dizinine yükleyin.

### 2. URL Yapısı
Her template için ayrı URL:
- ${domainName}/t1 → Template 1 (Modern Dark)
- ${domainName}/t2 → Template 2 (Minimal Light)
- ${domainName}/t3 → Template 3 (Bold Colorful)
- ${domainName}/t4 → Template 4 (Classic E-com)
- ${domainName}/t5 → Template 5 (Luxury Premium)
- ${domainName}/t6 → Template 6 (Video-First)
- ${domainName}/t7 → Template 7 (Single Product)

### 3. Admin Panelde Domain Ekle
1. Admin Panel → Domains
2. Domain: ${domainName}
3. Product: ${product.name}
4. Kaydet

### 4. Reklam Testleri
Template'ler arası A/B test için farklı URL'leri kullanabilirsiniz:
- FB Reklamı #1 → ${domainName}/t1
- FB Reklamı #2 → ${domainName}/t3
- TikTok → ${domainName}/t6

## 📊 Pixel Tracking
${pixels.facebook ? '✅ Facebook Pixel: ' + pixels.facebook : '⚠️  Facebook Pixel: Yok'}
${pixels.tiktok ? '✅ TikTok Pixel: ' + pixels.tiktok : '⚠️  TikTok Pixel: Yok'}
${pixels.ga ? '✅ Google Analytics: ' + pixels.ga : '⚠️  Google Analytics: Yok'}

Tüm pixel'ler ürün ayarlarından otomatik çekildi.

## ⚙️ Özelleştirme
- Tema Rengi: ${themeColor}
- Countdown Timer: Aktif
- Stock Counter: Aktif
- Live Viewers: Aktif

## 🆘 Sorun Giderme
1. Sayfa açılmıyor → DNS propagation (5-60 dk)
2. Template değişmiyor → Cache temizle (Ctrl+F5)
3. Sipariş gelmiyor → Admin panelde domain kontrol et

---
© 2024 - ${window.location.origin}
`;

            allFiles.push({ name: 'README.txt', content: readme, type: 'text/plain' });

            // Download all files with delay
            allFiles.forEach((file, index) => {
                setTimeout(() => {
                    downloadFile(file.name, file.content, file.type);
                }, index * 300);
            });

            alert(`✅ Export başarılı! ${allFiles.length} dosya indiriliyor...\n\n7 Template URL'i:\n${domainName}/t1\n${domainName}/t2\n...${domainName}/t7`);
            onClose();
        } catch (error) {
            console.error('Export error:', error);
            alert('Export işlemi başarısız oldu: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const selectedProductData = products.find(p => p.id === selectedProduct);
    const hasPixels = selectedProductData?.marketing?.facebookPixelId ||
        selectedProductData?.marketing?.tiktokPixelId ||
        selectedProductData?.marketing?.googleAnalyticsId;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Code className="text-purple-600" size={28} />
                                API Entegrasyon - Landing Page Export
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">7 template tek seferde, URL ile seçim</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6">
                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">📌 Nasıl Çalışır?</h3>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Tüm 7 template tek seferde export edilir</li>
                                <li>• Her template ayrı URL: <code className="bg-blue-100 px-1 rounded">domain.com/t1</code>, <code className="bg-blue-100 px-1 rounded">domain.com/t2</code>, vb.</li>
                                <li>• Pixel'ler otomatik ürün ayarlarından çekilir</li>
                                <li>• A/B test için farklı template URL'leri kullanabilirsiniz</li>
                            </ul>
                        </div>

                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Globe className="inline mr-2" size={16} />
                                Ürün Seçimi
                            </label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Ürün seçin...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>

                            {/* Pixel Status */}
                            {selectedProductData && (
                                <div className="mt-2 text-xs">
                                    {hasPixels ? (
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle size={14} />
                                            Pixel tracking aktif (ürün ayarlarından)
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-amber-600">
                                            <AlertTriangle size={14} />
                                            Pixel yok - ürün ayarlarında ekleyebilirsiniz
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Domain Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Domain / Subdomain
                            </label>
                            <input
                                type="text"
                                value={domainName}
                                onChange={(e) => setDomainName(e.target.value)}
                                placeholder="kampanya.siteniz.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Sadece domain adını girin, template URL'de belirtilir
                            </p>
                        </div>

                        {/* Theme Color */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <Palette className="inline mr-2" size={16} />
                                Tema Rengi (Tüm template'ler için)
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={themeColor}
                                    onChange={(e) => setThemeColor(e.target.value)}
                                    className="h-12 w-20 rounded-xl border-2 border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={themeColor}
                                    onChange={(e) => setThemeColor(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* Template URLs Preview */}
                        {domainName && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 Export Edilecek URL'ler:</h4>
                                <div className="space-y-1 text-xs font-mono">
                                    {['t1', 't2', 't3', 't4', 't5', 't6', 't7'].map(tid => (
                                        <div key={tid} className="text-gray-600">
                                            {domainName}/{tid} → Template {tid.slice(1)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        <FileCode className="inline mr-1" size={14} />
                        13 dosya: index + 7 template + config + API + pixels
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={loading || !selectedProduct || !domainName}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg"
                        >
                            {loading ? (
                                <>İndiriliyor...</>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Tüm Template'leri İndir
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateExportModal;
