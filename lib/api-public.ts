// Public API endpoints for standalone landing pages
import { Router } from 'express';
import { getDomains, getProductById, createPublicOrder, getProducts } from './api';
import { Order, OrderFormData } from '../types';

const router = Router();

// ============================================
// PUBLIC API ENDPOINTS
// ============================================

/**
 * GET /api/public/domain/:domainName
 * Returns domain configuration and associated product data
 */
router.get('/domain/:domainName', async (req, res) => {
    try {
        const { domainName } = req.params;
        const domains = await getDomains();
        const domain = domains.find(d => d.domain === decodeURIComponent(domainName));

        if (!domain) {
            return res.status(404).json({
                error: 'Domain not found',
                message: 'This domain is not configured in the system.'
            });
        }

        if (!domain.isActive) {
            return res.status(403).json({
                error: 'Domain inactive',
                message: 'This domain is not currently active.'
            });
        }

        // Get full product data
        const product = await getProductById(domain.productId);

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: 'The product associated with this domain was not found.'
            });
        }

        res.json({
            domain: {
                name: domain.domain,
                templateId: domain.templateId,
                themeColor: domain.themeColor || '#3B82F6',
                languageId: domain.languageId
            },
            product: {
                id: product.id,
                name: product.name,
                description: product.description,
                images: product.images,
                prices: product.prices,
                variants: product.variants,
                reviews: product.reviews,
                videoUrl: product.videoUrl,
                ctaText: product.ctaText,
                checkoutConfig: product.checkoutConfig,
                marketing: {
                    facebookPixelId: product.marketing?.facebookPixelId,
                    tiktokPixelId: product.marketing?.tiktokPixelId,
                    googleAnalyticsId: product.marketing?.googleAnalyticsId
                }
            },
            pixels: {
                facebook: domain.pixelCode || product.marketing?.facebookPixelId,
                tiktok: product.marketing?.tiktokPixelId,
                googleAnalytics: product.marketing?.googleAnalyticsId
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching domain configuration.'
        });
    }
});

/**
 * GET /api/public/product/:productId
 * Returns product data by ID
 */
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await getProductById(productId);

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: 'The requested product was not found.'
            });
        }

        res.json({
            id: product.id,
            name: product.name,
            description: product.description,
            images: product.images,
            prices: product.prices,
            variants: product.variants,
            reviews: product.reviews,
            videoUrl: product.videoUrl,
            ctaText: product.ctaText,
            checkoutConfig: product.checkoutConfig
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while fetching product data.'
        });
    }
});

/**
 * POST /api/public/order
 * Creates a new order from landing page
 */
router.post('/order', async (req, res) => {
    try {
        const orderData: OrderFormData & {
            ipAddress?: string;
            userAgent?: string;
            variantSelection?: string;
            domain?: string;
        } = req.body;

        // Get IP address
        const ipAddress = req.headers['x-forwarded-for'] as string ||
            req.headers['x-real-ip'] as string ||
            req.connection.remoteAddress ||
            '127.0.0.1';

        // Get user agent
        const userAgent = req.headers['user-agent'] || 'Unknown';

        // Create order with security checks
        const order = await createPublicOrder({
            ...orderData,
            ipAddress: ipAddress.split(',')[0].trim(), // Take first IP if multiple
            userAgent,
            referrer: orderData.domain || 'Direct'
        });

        res.json({
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            message: 'Order created successfully'
        });

    } catch (error: any) {
        console.error('Order Creation Error:', error);

        // Handle specific error types
        if (error.message?.includes('Rate Limit') || error.message?.includes('Too many')) {
            return res.status(429).json({
                error: 'Too many requests',
                message: error.message
            });
        }

        if (error.message?.includes('blacklist') || error.message?.includes('blocked')) {
            return res.status(403).json({
                error: 'Blocked',
                message: error.message
            });
        }

        if (error.message?.includes('verification') || error.message?.includes('fraud')) {
            return res.status(400).json({
                error: 'Validation failed',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while creating your order. Please try again.'
        });
    }
});

/**
 * POST /api/public/pixel-event
 * Track pixel events server-side (Facebook Conversion API)
 */
router.post('/pixel-event', async (req, res) => {
    try {
        const {
            pixelId,
            event,
            eventId,
            userData,
            customData,
            domain
        } = req.body;

        // Get IP and user agent for better tracking
        const clientIpAddress = req.headers['x-forwarded-for'] as string ||
            req.connection.remoteAddress ||
            '127.0.0.1';
        const clientUserAgent = req.headers['user-agent'] || '';

        // TODO: Implement Facebook Conversion API
        // For now, just log the event
        console.log('[Server-Side Pixel]', {
            pixelId,
            event,
            eventId,
            domain,
            ip: clientIpAddress,
            ua: clientUserAgent
        });

        res.json({
            success: true,
            message: 'Event tracked successfully'
        });

    } catch (error) {
        console.error('Pixel Tracking Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to track event.'
        });
    }
});

/**
 * GET /api/public/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Landing Page API'
    });
});

export default router;
