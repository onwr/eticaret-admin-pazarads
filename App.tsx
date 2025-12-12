
import React, { useState, useEffect, Suspense } from 'react';
import PanelLayout from './layouts/PanelLayout';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import { User, OrderStatus } from './types';
import { LanguageProvider } from './lib/i18n';
import UserModal from './components/modals/UserModal';
import { updateUser, getGeneralSettings } from './lib/api';
import { updateSessionUser } from './lib/auth';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';

// Lazy Load Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductWizard = React.lazy(() => import('./pages/ProductWizard'));
const ProductPricing = React.lazy(() => import('./pages/ProductPricing'));
const ProductVariants = React.lazy(() => import('./pages/ProductVariants'));
const ProductImages = React.lazy(() => import('./pages/ProductImages'));
const ProductReviews = React.lazy(() => import('./pages/ProductReviews'));
const Orders = React.lazy(() => import('./pages/Orders'));
const OrderDetails = React.lazy(() => import('./pages/OrderDetails'));
const Domains = React.lazy(() => import('./pages/Domains'));
const Templates = React.lazy(() => import('./pages/Templates'));
const TemplatePreview = React.lazy(() => import('./pages/TemplatePreview'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const ThankYou = React.lazy(() => import('./pages/ThankYou'));
const CallCenter = React.lazy(() => import('./pages/CallCenter'));
const AgentStatsPage = React.lazy(() => import('./pages/AgentStats'));
const SmsHistory = React.lazy(() => import('./pages/SmsHistory'));
const SmsTemplates = React.lazy(() => import('./pages/SmsTemplates'));
const WhatsappHistory = React.lazy(() => import('./pages/WhatsappHistory'));
const WhatsappTemplates = React.lazy(() => import('./pages/WhatsappTemplates'));
const Shipping = React.lazy(() => import('./pages/Shipping'));
const ShippingCompanies = React.lazy(() => import('./pages/ShippingCompanies'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const AiPanel = React.lazy(() => import('./pages/AiPanel'));
const SecurityBlacklist = React.lazy(() => import('./pages/SecurityBlacklist'));
const SecurityLogs = React.lazy(() => import('./pages/SecurityLogs'));
const Promotions = React.lazy(() => import('./pages/Promotions'));
const ReportDashboard = React.lazy(() => import('./pages/reports/ReportDashboard'));
const ProductReports = React.lazy(() => import('./pages/reports/ProductReports'));
const OrderReports = React.lazy(() => import('./pages/reports/OrderReports'));
const AgentReports = React.lazy(() => import('./pages/reports/AgentReports'));
const FinanceReports = React.lazy(() => import('./pages/reports/FinanceReports'));
const SettingsDashboard = React.lazy(() => import('./pages/settings/SettingsDashboard'));
const GeneralSettings = React.lazy(() => import('./pages/settings/GeneralSettings'));
const LegalSettings = React.lazy(() => import('./pages/settings/LegalSettings'));
const PixelSettings = React.lazy(() => import('./pages/settings/PixelSettings'));
const UserManagement = React.lazy(() => import('./pages/settings/UserManagement'));
const OrderStatuses = React.lazy(() => import('./pages/settings/OrderStatuses'));
const ExportTemplates = React.lazy(() => import('./pages/settings/ExportTemplates'));
const IntegrationHub = React.lazy(() => import('./pages/settings/IntegrationHub'));
const AiSettings = React.lazy(() => import('./pages/settings/AiSettings'));
const MediaSettings = React.lazy(() => import('./pages/settings/MediaSettings'));
const LanguageSettings = React.lazy(() => import('./pages/settings/LanguageSettings'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const ActivityLogs = React.lazy(() => import('./pages/ActivityLogs'));
const Notifications = React.lazy(() => import('./pages/Notifications'));

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [landingDomain, setLandingDomain] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Profile Management State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { user, loading, logout, refreshUser } = useAuth();

  useEffect(() => {
    if (currentView.startsWith('view-page/')) {
      const domain = currentView.split('view-page/')[1];
      setLandingDomain(domain);
      return;
    }

    if (currentView.startsWith('thank-you/')) {
      const id = currentView.split('thank-you/')[1];
      setOrderId(id);
      return;
    }

    if (currentView.startsWith('payment/')) {
      const id = currentView.split('payment/')[1];
      setOrderId(id);
      return;
    }

    if (!loading && !user && currentView !== 'register') {
      setCurrentView('login');
    } else if (!loading && user && (currentView === 'login' || currentView === 'register')) {
      // Redirect based on role
      setCurrentView('dashboard');
    }
  }, [user, loading, currentView]);

  useEffect(() => {
    getGeneralSettings().then(settings => {
      if (settings.favicon) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = settings.favicon;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = settings.favicon;
          document.head.appendChild(newLink);
        }
      }
      if (settings.siteTitle) {
        document.title = settings.siteTitle;
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  // Public Routes (Suspense needed)
  if (currentView.startsWith('view-page/') && landingDomain) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <LandingPage
          domainName={landingDomain}
          onOrderSuccess={(id) => setCurrentView(`thank-you/${id}`)}
        />
      </Suspense>
    );
  }

  if (currentView.startsWith('preview-template/')) {
    const templateId = currentView.split('preview-template/')[1];
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <TemplatePreview templateId={templateId} onClose={() => setCurrentView('templates')} />
      </Suspense>
    );
  }

  if (currentView.startsWith('thank-you/') && orderId) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <ThankYou orderId={orderId} />
      </Suspense>
    );
  }

  if (currentView.startsWith('payment/') && orderId) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <PaymentPage orderId={orderId} />
      </Suspense>
    );
  }

  if (!user) {
    if (currentView === 'register') {
      return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
          <Register
            onRegisterSuccess={() => {
              refreshUser();
              setCurrentView('dashboard');
            }}
            navigateToLogin={() => setCurrentView('login')}
          />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <Login
          onLoginSuccess={() => {
            refreshUser();
            setCurrentView('dashboard');
          }}
          navigateToRegister={() => setCurrentView('register')}
        />
      </Suspense>
    );
  }

  const handleNavigate = (view: string, productId?: string) => {
    if (productId) {
      setSelectedProductId(productId);
    }
    setCurrentView(view);
  };

  const handleProfileUpdate = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = await updateUser(user.id, data);
      updateSessionUser(updatedUser);
      refreshUser();
    }
  };

  const renderContent = () => {
    // Handle reports routing manually since we use currentView string
    if (currentView.startsWith('reports')) {
      switch (currentView) {
        case 'reports': return <ReportDashboard onNavigate={setCurrentView} />;
        case 'reports/products': case 'products': return <ProductReports />;
        case 'reports/orders': case 'orders': return <OrderReports />;
        case 'reports/agents': case 'agents': return <AgentReports />;
        case 'reports/finance': case 'finance': return <FinanceReports />;
        case 'reports/domains': case 'domains':
          return <div className="p-8 text-center text-gray-500 bg-white rounded-xl">Domain traffic analysis coming soon.</div>;
        default: return <ReportDashboard onNavigate={setCurrentView} />;
      }
    }

    // Special case for orders filtering
    if (currentView.startsWith('orders')) {
      let filter: OrderStatus | 'ALL' = 'ALL';
      if (currentView.includes(':')) {
        filter = currentView.split(':')[1] as OrderStatus;
      }
      return <Orders initialStatus={filter} onNavigate={setCurrentView} />;
    }

    if (currentView.startsWith('order-detail/')) {
      const id = currentView.split('order-detail/')[1];
      return <OrderDetails orderId={id} onBack={() => setCurrentView('orders')} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'products':
        return <Products onNavigate={handleNavigate} />;
      case 'product-wizard':
        return (
          <ProductWizard
            productId={selectedProductId || undefined}
            onBack={() => setCurrentView('products')}
          />
        );
      case 'product-pricing':
        return selectedProductId ? (
          <ProductPricing
            productId={selectedProductId}
            onBack={() => setCurrentView('products')}
          />
        ) : <Products onNavigate={handleNavigate} />;
      case 'product-variants':
        return selectedProductId ? (
          <ProductVariants
            productId={selectedProductId}
            onBack={() => setCurrentView('products')}
          />
        ) : <Products onNavigate={handleNavigate} />;
      case 'product-images':
        return selectedProductId ? (
          <ProductImages
            productId={selectedProductId}
            onBack={() => setCurrentView('products')}
          />
        ) : <Products onNavigate={handleNavigate} />;
      case 'product-reviews':
        return selectedProductId ? (
          <ProductReviews
            productId={selectedProductId}
            onBack={() => setCurrentView('products')}
          />
        ) : <Products onNavigate={handleNavigate} />;
      case 'domains':
        return (
          <Domains
            onPreview={(domain) => setCurrentView(`view-page/${domain}`)}
          />
        );
      case 'templates':
        return <Templates onNavigate={setCurrentView} />;
      case 'call-center':
        return <CallCenter />;
      case 'call-center-stats':
        return <AgentStatsPage />;
      case 'sms-history':
        return <SmsHistory />;
      case 'sms-templates':
        return <SmsTemplates />;
      case 'whatsapp-history':
        return <WhatsappHistory />;
      case 'whatsapp-templates':
        return <WhatsappTemplates />;
      case 'shipping':
        return <Shipping onNavigateToSettings={() => setCurrentView('shipping-companies')} />;
      case 'shipping-companies':
        return <ShippingCompanies onBack={() => setCurrentView('shipping')} />;
      case 'ai-panel':
        return <AiPanel />;

      case 'security-blacklist':
        return <SecurityBlacklist />;
      case 'security-logs':
        return <SecurityLogs />;
      case 'promotions':
      case 'upsells':
        return <Promotions />;
      case 'inventory':
        return <Inventory />;
      case 'activity-logs':
        return <ActivityLogs />;
      case 'notifications':
        return <Notifications />;

      // Settings & Integrations
      case 'settings':
        return <SettingsDashboard onNavigate={setCurrentView} />;
      case 'settings-general':
        return <GeneralSettings onBack={() => setCurrentView('settings')} />;
      case 'settings-statuses':
        return <OrderStatuses onBack={() => setCurrentView('settings')} />;
      case 'settings-exports':
        return <ExportTemplates onBack={() => setCurrentView('settings')} />;
      case 'settings-legal':
        return <LegalSettings onBack={() => setCurrentView('settings')} />;
      case 'settings-pixels':
        return <PixelSettings onBack={() => setCurrentView('settings')} />;
      case 'settings-users':
        return <UserManagement onBack={() => setCurrentView('settings')} />;
      case 'settings-media':
        return <MediaSettings onBack={() => setCurrentView('settings')} />;
      case 'settings-sms':
        return <IntegrationHub category="sms" title="SMS" onBack={() => setCurrentView('settings')} />;
      case 'settings-whatsapp':
        return <IntegrationHub category="whatsapp" title="WhatsApp" onBack={() => setCurrentView('settings')} />;
      case 'settings-callcenter':
        return <IntegrationHub category="callcenter" title="Call Center" onBack={() => setCurrentView('settings')} />;
      case 'settings-payment':
        return <IntegrationHub category="payment" title="Payment" onBack={() => setCurrentView('settings')} />;
      case 'settings-cargo':
        return <ShippingCompanies onBack={() => setCurrentView('settings')} />;
      case 'settings-ai':
        return <AiSettings />;
      case 'settings-languages':
        return <LanguageSettings />;

      default:
        // Handle report sub-routes if they slip through
        if (currentView === 'products') return <ProductReports />;
        if (currentView === 'orders') return <OrderReports />;
        if (currentView === 'agents') return <AgentReports />;
        if (currentView === 'finance') return <FinanceReports />;

        return <Dashboard />;
    }
  };

  return (
    <PanelLayout
      user={user}
      currentView={currentView}
      setCurrentView={setCurrentView}
      onLogout={() => {
        logout();
        setCurrentView('login');
      }}
      onProfileClick={() => setIsProfileModalOpen(true)}
    >
      <Suspense fallback={<div className="h-[calc(100vh-100px)] flex items-center justify-center"><LoadingSpinner size={40} /></div>}>
        {renderContent()}
      </Suspense>

      <UserModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSubmit={handleProfileUpdate}
        initialData={user}
        hidePermissions={true}
      />
    </PanelLayout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
};

export default App;
