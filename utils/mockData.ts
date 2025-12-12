
import { User, UserRole, Product, ProductStatus, Order, OrderStatus, PaymentStatus, Domain, Customer, Language, Template, OrderLog, CallLog, CallOutcome, SmsTemplate, SmsLog, SmsType, SmsProvider, WhatsappTemplate, WhatsappLog, WhatsappProvider, WhatsappTemplateCategory, WhatsappTemplateStatus, ShippingCompany, ShippingProviderType, Shipment, ShippingStatus, PaymentTransaction, TransactionStatus, PaymentProvider, Dealer, Upsell } from '../types';

export const mockUsers: User[] = [
  { id: '1', email: 'admin@example.com', role: UserRole.ADMIN, name: 'Super Admin' },
  { id: '2', email: 'agent@example.com', role: UserRole.AGENT, name: 'Satış Temsilcisi' },
  { id: '3', email: 'editor@example.com', role: UserRole.EDITOR, name: 'İçerik Editörü' },
  { id: '4', email: 'dealer@example.com', role: UserRole.DEALER, name: 'Bayi' },
];

export const mockDealers: Dealer[] = [
  {
    id: 'dl1',
    userId: '4',
    companyName: 'Partner Teknoloji Çözümleri',
    commissionRate: 15,
    balance: 450.50,
    totalEarnings: 1200.00,
    isActive: true,
    createdAt: '2023-09-01T10:00:00Z',
    user: mockUsers[3]
  }
];

export const mockProducts: Product[] = [
  {
    id: 'demo_promo_1',
    name: 'Galaxy Z Pro 5G - Promosyon Paketi',
    slug: 'galaxy-z-pro-promo',
    description: 'Sınırlı süre için özel üretim Galaxy Z Pro 5G. Katlanabilir ekran teknolojisi, yapay zeka destekli 108MP kamera ve tüm gün süren pil ömrü ile geleceği cebinizde taşıyın. \n\n**Öne Çıkan Özellikler:**\n- 7.6 inç Dinamik AMOLED 2X Ekran\n- Snapdragon 8 Gen 3 İşlemci\n- Suya Dayanıklı Tasarım (IPX8)\n- S-Pen Desteği',
    shortDescription: 'Geleceği Katlayın - Şimdi %30 İndirimli ve Sürpriz Hediyeli!',
    status: ProductStatus.ACTIVE,
    ctaText: 'Fırsatı Yakala ⚡',
    ctaColor: '#EF4444',
    ctaEmoji: '🔥',
    ctaBorderRadius: 12,
    whatsappNumber: '+905551234567',
    videoUrl: 'https://www.youtube.com/watch?v=kN8Q_0_A998',
    seoTitle: 'Galaxy Z Pro 5G - Fırsat Ürünü | Teknoloji Pazarı',
    seoKeywords: 'galaxy z pro, katlanabilir telefon, indirimli telefon, 5g akıllı telefon',
    isFreeShipping: true,
    adminCoverImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    prices: [
      {
        id: 'pp_promo_1',
        productId: 'demo_promo_1',
        quantity: 1,
        price: 24999.00,
        originalPrice: 35000.00,
        label: 'Tekli Paket',
        discountRate: 30,
        shippingCost: 0
      },
      {
        id: 'pp_promo_2',
        productId: 'demo_promo_1',
        quantity: 2,
        price: 45999.00,
        originalPrice: 70000.00,
        label: 'Çiftli Avantaj Paketi (-4000TL)',
        discountRate: 35,
        shippingCost: 0
      }
    ],
    variants: [
      {
        id: 'pv_color_1',
        productId: 'demo_promo_1',
        variantName: 'Renk Seçimi',
        stock: 50,
        price: 0,
        name: 'Renk',
        type: 'color',
        values: ['Uzay Siyahı', 'Krem', 'Buz Mavisi']
      },
      {
        id: 'pv_capacity_1',
        productId: 'demo_promo_1',
        variantName: 'Hafıza',
        stock: 50,
        price: 0,
        name: 'Kapasite',
        type: 'select',
        values: ['256GB', '512GB (+2000TL)', '1TB (+5000TL)']
      }
    ],
    images: [
      { id: 'img_promo_1', productId: 'demo_promo_1', url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80', order: 1, alt: 'Galaxy Z Pro Önden' },
      { id: 'img_promo_2', productId: 'demo_promo_1', url: 'https://images.unsplash.com/photo-1595941069915-4ebc5197c396?auto=format&fit=crop&w=800&q=80', order: 2, alt: 'Katlanmış Görünüm' },
      { id: 'img_promo_3', productId: 'demo_promo_1', url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80', order: 3, alt: 'Yaşam Tarzı' },
      { id: 'img_promo_4', productId: 'demo_promo_1', url: 'https://images.unsplash.com/photo-1574614217730-6819b139783f?auto=format&fit=crop&w=800&q=80', order: 4, alt: 'Kalem Detayı' },
      { id: 'img_promo_5', productId: 'demo_promo_1', url: 'https://images.unsplash.com/photo-1596742578443-7682e525c489?auto=format&fit=crop&w=800&q=80', order: 5, alt: 'Yan Görünüm' },
      { id: 'img_promo_6', productId: 'demo_promo_1', url: 'https://images.unsplash.com/photo-1627389955611-70cb8e076632?auto=format&fit=crop&w=800&q=80', order: 6, alt: 'Elde Duruş' }
    ],
    reviews: [
      { id: 'rev_1', productId: 'demo_promo_1', author: 'Caner E.', rating: 5, comment: 'Gerçekten muazzam bir cihaz, kargo çok hızlıydı.', isActive: true, createdAt: '2023-11-20', imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 'rev_2', productId: 'demo_promo_1', author: 'Elif Y.', rating: 5, comment: 'Katlanabilir ekran deneyimi bambaşka. Teşekkürler!', isActive: true, createdAt: '2023-11-22' }
    ],
    checkoutConfig: {
      fields: [
        { id: 'f1', label: 'Ad Soyad', key: 'fullName', type: 'TEXT', isRequired: true, isVisible: true, order: 0 },
        { id: 'f2', label: 'Telefon', key: 'phone', type: 'PHONE', isRequired: true, isVisible: true, order: 1 },
        { id: 'f3', label: 'Şehir', key: 'city', type: 'SELECT_CITY', isRequired: true, isVisible: true, order: 2 },
        { id: 'f4', label: 'İlçe', key: 'district', type: 'SELECT_DISTRICT', isRequired: true, isVisible: true, order: 3 },
        { id: 'f5', label: 'Açık Adres', key: 'address', type: 'TEXTAREA', isRequired: true, isVisible: true, order: 4 },
      ],
      paymentMethods: { cod_cash: true, cod_card: true, online_credit_card: true, bank_transfer: false },
      cityDistrictSelection: 'dropdown' // New feature demo
    }
  },
  {
    id: 'demo_full_1',
    name: 'Ultra Slim Powerbank 20000mAh',
    slug: 'ultra-slim-powerbank',
    description: 'Asla şarjınız bitmesin. 20000mAh devasa kapasitesine rağmen ultra ince tasarım. Hızlı şarj (PD 20W) desteği ile telefonunuzu 30 dakikada %50 şarj eder. Çift USB-A ve bir USB-C çıkışı ile aynı anda 3 cihazı şarj edebilirsiniz.',
    shortDescription: 'Cebinizdeki Nükleer Santral - Şık ve Güçlü.',
    status: ProductStatus.ACTIVE,
    ctaText: 'Sepete Ekle',
    ctaColor: '#2563EB',
    isFreeShipping: false,
    prices: [
      { id: 'pp_full_1', productId: 'demo_full_1', quantity: 1, price: 899.90, originalPrice: 1200.00, discountRate: 25, shippingCost: 39.90 }
    ],
    variants: [],
    images: [
      { id: 'img_full_1', productId: 'demo_full_1', url: 'https://images.unsplash.com/photo-1609592424368-66c30e2ea203?auto=format&fit=crop&w=800&q=80', order: 1 },
      { id: 'img_full_2', productId: 'demo_full_1', url: 'https://images.unsplash.com/photo-1593106578051-51264b974b92?auto=format&fit=crop&w=800&q=80', order: 2 },
      { id: 'img_full_3', productId: 'demo_full_1', url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80', order: 3 },
      { id: 'img_full_4', productId: 'demo_full_1', url: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=800&q=80', order: 4 },
      { id: 'img_full_5', productId: 'demo_full_1', url: 'https://images.unsplash.com/photo-1622666504287-29369324022b?auto=format&fit=crop&w=800&q=80', order: 5 }
    ],
    reviews: []
  },
  {
    id: 'p1',
    name: 'Ultra Kablosuz Kulaklık',
    slug: 'ultra-kablosuz-kulaklik',
    description: 'Yeni Ultra Kablosuz Kulaklıklarımızla kristal netliğinde ses kalitesini deneyimleyin. Aktif gürültü engelleme, 24 saat pil ömrü ve rahat ergonomik uyum özelliklerine sahiptir. Spor, seyahat ve günlük kullanım için mükemmeldir.',
    shortDescription: 'ANC ve 24 saat pil ömrü ile en iyi ses deneyimi.',
    status: ProductStatus.ACTIVE,
    ctaText: 'Hemen Al - %50 İndirim',
    ctaColor: '#FF5733',
    whatsappNumber: '+1234567890',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    seoTitle: 'En İyi Kablosuz Kulaklık 2024',
    seoKeywords: 'earbuds, wireless, anc',
    isFreeShipping: true,
    prices: [
      { id: 'pp1', productId: 'p1', quantity: 1, price: 49.99, originalPrice: 99.99, shippingCost: 0, discountRate: 50 },
      { id: 'pp2', productId: 'p1', quantity: 2, price: 89.99, originalPrice: 199.98, shippingCost: 0, discountRate: 55 }
    ],
    variants: [
      {
        id: 'pv1',
        productId: 'p1',
        variantName: 'Siyah - Standart',
        stock: 100,
        price: 0,
        name: 'Color',
        type: 'color',
        values: ['Siyah', 'Beyaz', 'Mavi']
      }
    ],
    images: [
      { id: 'img1', productId: 'p1', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', order: 1, alt: 'Earbuds Front' },
      { id: 'img2', productId: 'p1', url: 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?auto=format&fit=crop&w=800&q=80', order: 2, alt: 'Earbuds Case' }
    ],
    reviews: [
      { id: 'r1', productId: 'p1', author: 'Mehmet B.', rating: 5, comment: 'Kesinlikle harika ses kalitesi!', isActive: true, createdAt: '2023-10-01' },
      { id: 'r2', productId: 'p1', author: 'Selin K.', rating: 4, comment: 'Fiyatına göre çok iyi.', isActive: true, createdAt: '2023-10-05' }
    ],
    checkoutConfig: {
      fields: [
        { id: '1', label: 'Ad Soyad', key: 'fullName', type: 'TEXT', isRequired: true, isVisible: true, order: 0 },
        { id: '2', label: 'Telefon', key: 'phone', type: 'PHONE', isRequired: true, isVisible: true, order: 1 },
        { id: '3', label: 'Adres', key: 'address', type: 'TEXTAREA', isRequired: true, isVisible: true, order: 2 },
        { id: '4', label: 'İl', key: 'city', type: 'SELECT_CITY', isRequired: true, isVisible: true, order: 3 },
        { id: '5', label: 'İlçe', key: 'district', type: 'SELECT_DISTRICT', isRequired: true, isVisible: true, order: 4 },
      ],
      paymentMethods: { cod_cash: true, cod_card: true, online_credit_card: true, bank_transfer: true }
    }
  },
  {
    id: 'p2',
    name: 'Akıllı Fitness Saati',
    slug: 'akilli-fitness-saati',
    description: 'Sağlık ve fitness hedeflerinizi hassasiyetle takip edin. Kalp atış hızı, uyku düzeni ve adımları izler. Suya dayanıklı ve her duruma uygun şık tasarım.',
    shortDescription: 'En iyi sağlık arkadaşınız.',
    status: ProductStatus.ACTIVE,
    ctaText: 'Sipariş Ver',
    ctaColor: '#3B82F6',
    videoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    prices: [{ id: 'pp3', productId: 'p2', quantity: 1, price: 120.00, originalPrice: 199.00 }],
    variants: [],
    images: [{ id: 'img3', productId: 'p2', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', order: 1 }],
    reviews: []
  },
  {
    id: 'p3',
    name: 'Ergonomik Ofis Koltuğu',
    slug: 'ergonomik-ofis-koltugu',
    description: 'Konfor ve üretkenlik için tasarlanan bu ergonomik koltuk, ayarlanabilir bel desteği ve nefes alabilen fileye sahiptir.',
    shortDescription: 'Uzun çalışma saatleri için maksimum konfor.',
    status: ProductStatus.DRAFT,
    ctaText: 'Ön Sipariş',
    prices: [{ id: 'pp4', productId: 'p3', quantity: 1, price: 250.00 }],
    variants: [],
    images: [{ id: 'img4', productId: 'p3', url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80', order: 1 }],
    reviews: []
  }
];

export const mockUpsells: Upsell[] = [
  {
    id: 'up1',
    title: 'Sürpriz Kablo Paketi +2 Yıl Garanti',
    shortName: 'FIRSAT',
    description: 'Çoklu şarj seti ve uzatılmış garanti paketi. Sadece bu siparişe özel %60 indirim!',
    price: 149.90,
    originalPrice: 350.00,
    quantity: 100,
    isActive: true,
    images: [
      { id: 'uimg1', url: 'https://images.unsplash.com/photo-1616422283658-e3ac5cc62e3d?auto=format&fit=crop&w=800&q=80', order: 1 },
      { id: 'uimg2', url: 'https://images.unsplash.com/photo-1608612716381-81d394142f9b?auto=format&fit=crop&w=800&q=80', order: 2 },
      { id: 'uimg3', url: 'https://images.unsplash.com/photo-1563770095-39d468a92a45?auto=format&fit=crop&w=800&q=80', order: 3 }
    ],
    triggerProductIds: ['demo_promo_1', 'p1']
  }
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Ahmet Yılmaz', phone: '+905551112233', email: 'ahmet@example.com', address: 'Atatürk Cad. No:123', city: 'İstanbul', district: 'Kadıköy' },
  { id: 'c2', name: 'Ayşe Demir', phone: '+905554445566', address: 'Cumhuriyet Mah. 456. Sok.', city: 'Ankara', district: 'Çankaya' },
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    orderNumber: 'ORD-2023-001',
    customerId: 'c1',
    productId: 'demo_promo_1',
    priceId: 'pp_promo_1',
    status: OrderStatus.NEW,
    totalAmount: 24999.00,
    paymentMethod: 'Credit Card',
    paymentStatus: PaymentStatus.PAID,
    createdAt: '2023-10-25T10:00:00Z',
    customer: mockCustomers[0],
    product: mockProducts[0],
    dealerId: 'dl1',
    referrer: 'Facebook Ads',
    landingPage: 'best-earbuds.com',
    items: [
      {
        productId: 'demo_promo_1',
        productName: 'Galaxy Z Pro 5G - Promosyon Paketi',
        quantity: 1,
        unitPrice: 24999.00,
        totalPrice: 24999.00,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'o2',
    orderNumber: 'ORD-2023-002',
    customerId: 'c2',
    productId: 'p2',
    priceId: 'pp3',
    status: OrderStatus.KARGODA,
    totalAmount: 120.00,
    paymentMethod: 'COD',
    paymentStatus: PaymentStatus.UNPAID,
    createdAt: '2023-10-24T14:30:00Z',
    customer: mockCustomers[1],
    product: mockProducts[3],
    referrer: 'Instagram',
    landingPage: 'fit-watch-tr.com',
    items: [
      {
        productId: 'p2',
        productName: 'Akıllı Fitness Saati',
        quantity: 1,
        unitPrice: 120.00,
        totalPrice: 120.00,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'o3',
    orderNumber: 'ORD-2023-003',
    customerId: 'c1',
    productId: 'demo_promo_1',
    priceId: 'pp_promo_2',
    status: OrderStatus.ARANACAK,
    totalAmount: 45999.00,
    paymentMethod: 'COD',
    paymentStatus: PaymentStatus.UNPAID,
    createdAt: '2023-10-26T09:15:00Z',
    customer: mockCustomers[0],
    product: mockProducts[0],
    referrer: 'Google Organic',
    landingPage: 'best-earbuds.com',
    items: [
      {
        productId: 'demo_promo_1',
        productName: 'Galaxy Z Pro 5G - Promosyon Paketi',
        quantity: 2,
        unitPrice: 22999.5,
        totalPrice: 45999.00,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

export const mockOrderLogs: OrderLog[] = [
  {
    id: 'log1',
    orderId: 'o1',
    userId: '1',
    userName: 'Super Admin',
    action: 'SYSTEM',
    message: 'Sipariş iniş sayfası üzerinden oluşturuldu',
    createdAt: '2023-10-25T10:00:00Z'
  },
  {
    id: 'log2',
    orderId: 'o2',
    userId: '2',
    userName: 'Satış Temsilcisi',
    action: 'STATUS_CHANGE',
    message: 'Durum YENİ den KARGODA ya değiştirildi',
    createdAt: '2023-10-24T16:30:00Z'
  }
];

export const mockCallLogs: CallLog[] = [
  {
    id: 'cl1',
    orderId: 'o2',
    agentId: '2',
    agentName: 'Satış Temsilcisi',
    outcome: CallOutcome.REACHED_CONFIRMED,
    durationSeconds: 125,
    note: 'Müşteri adres detaylarını onayladı.',
    calledAt: '2023-10-24T14:25:00Z'
  },
  {
    id: 'cl2',
    orderId: 'o3',
    agentId: '2',
    agentName: 'Satış Temsilcisi',
    outcome: CallOutcome.BUSY,
    durationSeconds: 15,
    note: 'Hat meşgul, daha sonra aranacak.',
    calledAt: '2023-10-26T09:00:00Z'
  }
];

export const mockSmsTemplates: SmsTemplate[] = [
  {
    id: 'st1',
    title: 'Sipariş Onayı',
    content: 'Merhaba {name}, #{orderNumber} numaralı siparişiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.',
    type: SmsType.ORDER_NOTIFICATION,
    isActive: true
  },
  {
    id: 'st2',
    title: 'Kargo Güncellemesi',
    content: 'Müjde {name}! #{orderNumber} numaralı siparişiniz kargoya verildi. Takip: {trackingCode}',
    type: SmsType.SHIPPING_INFO,
    isActive: true
  },
  {
    id: 'st3',
    title: 'Flaş İndirim',
    content: 'Özel teklif: Sadece bugüne özel Kulaklıklarda %50 indirim! Link: https://pazarads-shop.com',
    type: SmsType.CAMPAIGN,
    isActive: true
  }
];

export const mockSmsLogs: SmsLog[] = [
  {
    id: 'sl1',
    phone: '+15550101',
    message: 'Merhaba Ahmet Yılmaz, #ORD-2023-001 numaralı siparişiniz alındı.',
    type: SmsType.ORDER_NOTIFICATION,
    provider: SmsProvider.NETGSM,
    status: 'DELIVERED',
    sentAt: '2023-10-25T10:05:00Z',
    orderId: 'o1',
    sentBy: '1'
  },
  {
    id: 'sl2',
    phone: '+15550102',
    message: 'Müjde Ayşe! #ORD-2023-002 numaralı siparişiniz kargoya verildi.',
    type: SmsType.SHIPPING_INFO,
    provider: SmsProvider.ILETIMERKEZI,
    status: 'SENT',
    sentAt: '2023-10-24T16:35:00Z',
    orderId: 'o2',
    sentBy: '2'
  }
];

export const mockWhatsappTemplates: WhatsappTemplate[] = [
  {
    id: 'wt1',
    name: 'siparis_onayi',
    category: WhatsappTemplateCategory.UTILITY,
    language: 'tr',
    content: 'Merhaba {name}, #{orderNumber} numaralı siparişiniz başarıyla oluşturuldu. Kargoya verildiğinde size haber vereceğiz.',
    header: 'Sipariş Onaylandı',
    footer: 'Pazarads Shop',
    status: WhatsappTemplateStatus.APPROVED
  },
  {
    id: 'wt2',
    name: 'kargo_guncellemesi',
    category: WhatsappTemplateCategory.UTILITY,
    language: 'tr',
    content: 'Siparişiniz #{orderNumber} yola çıktı! Buradan takip edebilirsiniz: {trackingLink}',
    status: WhatsappTemplateStatus.APPROVED
  },
  {
    id: 'wt3',
    name: 'terk_edilmis_sepet',
    category: WhatsappTemplateCategory.MARKETING,
    language: 'tr',
    content: 'Merhaba {name}, sepetinde bir şeyler unuttun. Siparişini şimdi tamamla ve %5 indirim kazan!',
    status: WhatsappTemplateStatus.PENDING
  }
];

export const mockWhatsappLogs: WhatsappLog[] = [
  {
    id: 'wl1',
    orderId: 'o1',
    phone: '+15550101',
    templateName: 'siparis_onayi',
    content: 'Merhaba Ahmet Yılmaz, #ORD-2023-001 numaralı siparişiniz başarıyla oluşturuldu...',
    provider: WhatsappProvider.META_CLOUD,
    status: 'READ',
    sentAt: '2023-10-25T10:06:00Z',
    sentBy: '1'
  }
];

export const mockLanguages: Language[] = [
  { id: 'l1', code: 'en', name: 'İngilizce', isActive: true },
  { id: 'l2', code: 'tr', name: 'Türkçe', isActive: true },
  { id: 'l3', code: 'ar', name: 'Arapça', isActive: true },
  { id: 'l4', code: 'fa', name: 'Farsça', isActive: false },
];

export const mockTemplates: Template[] = [
  { id: 't1', name: 'Modern Karanlık', code: 'modern-dark', description: 'Teknoloji ürünleri için yüksek dönüşümlü karanlık temalı iniş sayfası.', thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { id: 't2', name: 'Temiz Aydınlık', code: 'clean-light', description: 'Sağlık ve güzellik ürünleri için minimalist aydınlık tema.', thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80' },
  { id: 't3', name: 'Aciliyet Satışı', code: 'urgency-sales', description: 'Flaş satışlar için agresif geri sayım sayaçları ve yanıp sönen CTA lar.', thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { id: 't4', name: 'Editoryal Blog', code: 'editorial-blog', description: 'Hikaye tabanlı satış için reklam tarzı düzen.', thumbnailUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=800&q=80' },
  { id: 't5', name: 'Video Kahraman', code: 'video-hero', description: 'Tanıtıcı ürünler için video öncelikli iniş sayfası.', thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { id: 't6', name: 'Görsel Yığın', code: 'gapless-stack', description: 'Satın almak için herhangi bir yere tıklayın özellikli boşluksuz tam genişlikte görseller. Maksimum FOMO.', thumbnailUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80' },
  { id: 't7', name: 'Sosyal Akış', code: 'social-feed', description: 'Yorumlar, beğeniler ve yapışkan mağaza butonu ile Instagram tarzı düzen.', thumbnailUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80' },
];

export const mockDomains: Domain[] = [
  {
    id: 'd1',
    domain: 'best-earbuds.com',
    productId: 'demo_promo_1',
    languageId: 'l1',
    templateId: 't1',
    isActive: true,
    isCloakingActive: false,
    themeColor: '#FF5733',
    product: mockProducts[0]
  },
  {
    id: 'd2',
    domain: 'fit-watch-tr.com',
    productId: 'p2',
    languageId: 'l2',
    templateId: 't2',
    isActive: true,
    isCloakingActive: true,
    safePageUrl: 'https://generic-safe-blog.com',
    themeColor: '#3B82F6',
    product: mockProducts[3]
  }
];

export const mockShippingCompanies: ShippingCompany[] = [
  {
    id: 'sc1',
    name: 'Fest Kargo',
    code: 'FEST',
    type: ShippingProviderType.AGGREGATOR,
    isActive: true,
    isDefault: true,
    subCarriers: [
      {
        code: 'ARS',
        name: 'Aras Kargo',
        branchCode: '1234',
        isActive: true,
        isCashOnDoorAvailable: true,
        isCardOnDoorAvailable: true,
        fixedPrice: 0, // Placeholder
        returnPrice: 35.00,
        cardCommission: 5, // 5%
        desiRanges: [
          { maxDesi: 2, price: 35.00 },
          { maxDesi: 5, price: 42.00 },
          { maxDesi: 10, price: 55.00 }
        ],
        codRanges: [
          { min: 1, max: 1000, price: 15.00 }, // 1-1000 TL arası 15 TL Komisyon
          { min: 1001, max: 2000, price: 25.00 },
          { min: 2001, max: 5000, price: 40.00 }
        ]
      },
      {
        code: 'PTT',
        name: 'PTT Kargo',
        branchCode: '9012',
        isActive: true,
        isCashOnDoorAvailable: true,
        isCardOnDoorAvailable: false, // PTT No Card
        fixedPrice: 0,
        returnPrice: 30.00,
        cardCommission: 0,
        desiRanges: [
          { maxDesi: 1, price: 30.00 },
          { maxDesi: 3, price: 38.00 }
        ],
        codRanges: [
          { min: 1, max: 5000, price: 10.00 } // Fixed fee per collection
        ]
      },
      {
        code: 'HPS',
        name: 'HepsiJet',
        branchCode: '3456',
        isActive: true,
        isCashOnDoorAvailable: false,
        isCardOnDoorAvailable: false,
        fixedPrice: 38.00,
        returnPrice: 38.00,
        cardCommission: 0,
        desiRanges: [],
        codRanges: []
      }
    ]
  },
  {
    id: 'sc2',
    name: 'Yurtiçi Kargo',
    code: 'YURTICI',
    type: ShippingProviderType.DIRECT,
    isActive: false,
    isDefault: false
  }
];

export const mockShipments: Shipment[] = [
  {
    id: 'ship1',
    orderId: 'o2',
    companyId: 'sc1',
    trackingCode: 'FEST987654321',
    status: ShippingStatus.SHIPPED,
    createdAt: '2023-10-24T15:00:00Z',
    updatedAt: '2023-10-24T15:00:00Z',
    order: mockOrders[1],
    company: mockShippingCompanies[0]
  }
];

export const mockTransactions: PaymentTransaction[] = [
  {
    id: 'tx1',
    orderId: 'o1',
    provider: PaymentProvider.PAYTR,
    transactionId: 'paytr-12345',
    amount: 49.99,
    currency: 'USD',
    status: TransactionStatus.SUCCESS,
    installments: 1,
    last4: '4242',
    createdAt: '2023-10-25T10:01:00Z'
  }
];
