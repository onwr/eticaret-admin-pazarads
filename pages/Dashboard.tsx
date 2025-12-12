import React, { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDashboardAnalytics, getShippingAnalytics, DashboardAnalytics } from '../lib/api';
import { useLanguage } from '../lib/i18n';
import WidgetRenderer from '../components/dashboard/WidgetRenderer';
import CustomizeLayoutModal, { DashboardWidgetConfig } from '../components/dashboard/CustomizeLayoutModal';
import ConfirmDialog from '../components/ConfirmDialog';

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

const DEFAULT_LAYOUT: DashboardWidgetConfig[] = [
  { id: 'stats_orders', type: 'stats_orders', isVisible: true, order: 0, colSpan: 1 },
  { id: 'stats_revenue', type: 'stats_revenue', isVisible: true, order: 1, colSpan: 1 },
  { id: 'stats_pending', type: 'stats_pending', isVisible: true, order: 2, colSpan: 1 },
  { id: 'stats_delivery', type: 'stats_delivery', isVisible: true, order: 3, colSpan: 1 },
  { id: 'chart_hourly', type: 'chart_hourly', isVisible: true, order: 4, colSpan: 2 },
  { id: 'chart_weekly', type: 'chart_weekly', isVisible: true, order: 5, colSpan: 1 },
  { id: 'chart_status', type: 'chart_status', isVisible: true, order: 6, colSpan: 1 },
  { id: 'performance_indicators', type: 'performance_indicators', isVisible: true, order: 7, colSpan: 4 },
  { id: 'agent_performance', type: 'agent_performance', isVisible: true, order: 8, colSpan: 2 },
  { id: 'call_center_stats', type: 'call_center_stats', isVisible: true, order: 9, colSpan: 2 },
  { id: 'summary_reports', type: 'summary_reports', isVisible: true, order: 10, colSpan: 2 },
  { id: 'last_orders', type: 'last_orders', isVisible: true, order: 11, colSpan: 2 },
  { id: 'shipping_performance', type: 'shipping_performance', isVisible: true, order: 12, colSpan: 4 },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'last7' | 'last30'>('today');

  // Layout State
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_LAYOUT);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  useEffect(() => {
    // Load layout from local storage
    const savedLayout = localStorage.getItem('dashboard_layout_v1');
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        // Merge with default to ensure new widgets appear if not present
        const merged = DEFAULT_LAYOUT.map(def => {
          const saved = parsed.find((p: any) => p.id === def.id);
          return saved ? { ...def, ...saved } : def;
        });
        setWidgets(merged.sort((a, b) => a.order - b.order));
      } catch (e) {
        console.error('Failed to parse saved layout', e);
      }
    }
  }, []);

  const loadStats = async (range: 'today' | 'yesterday' | 'last7' | 'last30') => {
    setLoading(true);
    setDateRange(range);

    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (range === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (range === 'yesterday') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'last7') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (range === 'last30') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    try {
      const analytics = await getDashboardAnalytics(start, end);
      setData(analytics);
    } catch (error) {
      console.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats('today');
  }, []);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isDestructive: false
  });

  const handleSaveLayout = () => {
    localStorage.setItem('dashboard_layout_v1', JSON.stringify(widgets));
    setIsCustomizeModalOpen(false);
  };

  const handleResetLayout = () => {
    setConfirmDialog({
      isOpen: true,
      title: t('common.reset_layout') || 'Düzeni Sıfırla',
      message: t('common.confirm_reset'),
      isDestructive: true,
      onConfirm: () => {
        setWidgets(DEFAULT_LAYOUT);
        localStorage.removeItem('dashboard_layout_v1');
        setIsCustomizeModalOpen(false);
      }
    });
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('dash.title')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('dash.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm mr-2">
            <button
              onClick={() => loadStats('today')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateRange === 'today' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t('common.today')}
            </button>
            <button
              onClick={() => loadStats('yesterday')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateRange === 'yesterday' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t('common.yesterday')}
            </button>
            <button
              onClick={() => loadStats('last7')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateRange === 'last7' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t('reports.last_7')}
            </button>
            <button
              onClick={() => loadStats('last30')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateRange === 'last30' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t('reports.last_30')}
            </button>
          </div>

          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
            title={t('dash.customize')}
          >
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Dynamic Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.filter(w => w.isVisible).map((widget) => (
          <div
            key={widget.id}
            className={`
              ${widget.colSpan === 4 ? 'col-span-1 md:col-span-2 lg:col-span-4' : ''}
              ${widget.colSpan === 3 ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}
              ${widget.colSpan === 2 ? 'col-span-1 md:col-span-2' : ''}
              ${widget.colSpan === 1 ? 'col-span-1' : ''}
            `}
          >
            <WidgetRenderer
              id={widget.type}
              data={data}
              loading={loading}
              onNavigate={handleNavigate}
            />
          </div>
        ))}
      </div>

      <CustomizeLayoutModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        widgets={widgets}
        setWidgets={setWidgets}
        onSave={handleSaveLayout}
        onReset={handleResetLayout}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};

export default Dashboard;
