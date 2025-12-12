import React, { useState, useEffect } from 'react';
import {
  Package, ShoppingCart, Users, Globe, DollarSign,
  TrendingUp, Calendar, ArrowRight, ChevronRight, Phone,
  CheckCircle2, Truck, XCircle, Clock
} from 'lucide-react';
import { getDetailedReports } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../lib/i18n';
import SearchableSelect from '../../components/SearchableSelect';

interface ReportDashboardProps {
  onNavigate: (view: string) => void;
}

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  avgBasket: number;
  successRate: number;
  salesTrend: { revenue: number }[];
  topProducts: { name: string; value: number }[];
}

interface CargoData {
  totalShipped: number;
  delivered: number;
  returned: number;
  avgDeliveryTime: string;
  statusDistribution: { name: string; color: string }[];
  cityPerformance: { city: string; sent: number; delivered: number; successRate: number }[];
}

interface CallCenterData {
  totalCalls: number;
  reached: number;
  approved: number;
  cancelled: number;
  agentPerformance: { name: string; successRate: number; calls: number; reached: number; approved: number }[];
}

interface DomainData {
  activeDomains: number;
  totalVisits: number;
  avgConversion: number;
  adCost: number;
  domainPerformance: { domain: string; orders: number; revenue: number; conversion: number; status: string }[];
}

interface UpsellData {
  totalRevenue: number;
  conversionRate: number;
  topUpsells: { name: string; count: number; revenue: number }[];
  funnel: { stage: string; count: number }[];
}

interface ReportData {
  sales: SalesData;
  cargo: CargoData;
  callCenter: CallCenterData;
  domain: DomainData;
  upsell: UpsellData;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sales' | 'cargo' | 'call-center' | 'domain'>('sales');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);


  // Filters
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'thisMonth' | 'lastMonth' | 'custom'>('thisMonth');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    const now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), 1);
    let end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (dateRange === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (dateRange === 'yesterday') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (dateRange === 'custom' && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd);
    }

    try {
      const reportData = await getDetailedReports(start, end, {
        domain: selectedDomain || undefined,
        source: selectedSource || undefined,
        productIds: selectedProduct ? [selectedProduct] : undefined,
        status: selectedStatus as any || undefined
      });
      setData(reportData as unknown as ReportData);
    } catch (error) {
      console.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange === 'custom' && (!customStart || !customEnd)) {
      return; // Don't fetch if custom range is incomplete
    }
    loadData();
  }, [activeTab, dateRange, customStart, customEnd, selectedDomain, selectedSource, selectedStatus, selectedProduct]);

  if (loading && !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t('reports.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <DollarSign size={18} />
              {t('reports.export_excel')}
            </button>
          </div>
        </div>

        {/* Global Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          {/* Date Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">{t('reports.filter_date')}</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">{t('reports.date_today')}</option>
              <option value="yesterday">{t('reports.date_yesterday')}</option>
              <option value="thisMonth">{t('reports.date_this_month')}</option>
              <option value="lastMonth">{t('reports.date_last_month')}</option>
              <option value="custom">{t('reports.date_custom')}</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {dateRange === 'custom' && (
            <>
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs font-medium text-gray-500">{t('reports.date_start')}</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs font-medium text-gray-500">{t('reports.date_end')}</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Domain Filter */}
          <div className="space-y-1">
            <SearchableSelect
              label={t('reports.filter_domain')}
              placeholder={t('reports.filter_all')}
              value={selectedDomain}
              onChange={setSelectedDomain}
              options={[
                { value: '', label: t('reports.filter_all') },
                { value: 'kampanya.urunsitesi.com', label: 'kampanya.urunsitesi.com' },
                { value: 'firsat.urunsitesi.com', label: 'firsat.urunsitesi.com' }
              ]}
            />
          </div>

          {/* Source Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">{t('reports.filter_source')}</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('reports.filter_all')}</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="google">Google Ads</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">{t('reports.filter_status')}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('reports.filter_all')}</option>
              <option value="NEW">{t('reports.status_new')}</option>
              <option value="ONAYLANDI">{t('reports.status_approved')}</option>
              <option value="TESLIM_EDILDI">{t('reports.status_delivered')}</option>
              <option value="IPTAL">{t('reports.status_cancelled')}</option>
            </select>
          </div>

          {/* Product Filter (Searchable) */}
          <div className="space-y-1">
            <SearchableSelect
              label={t('reports.filter_product')}
              placeholder={t('reports.filter_all_products')}
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={[
                { value: '', label: t('reports.filter_all_products') },
                { value: '1', label: 'Akıllı Saat Pro' },
                { value: '2', label: 'Kablosuz Kulaklık' },
                { value: '3', label: 'Robot Süpürge X1' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'sales' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <DollarSign size={16} />
          {t('reports.tab_sales')}
        </button>
        <button
          onClick={() => setActiveTab('cargo')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'cargo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Package size={16} />
          {t('reports.tab_cargo')}
        </button>
        <button
          onClick={() => setActiveTab('call-center')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'call-center' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Phone size={16} />
          {t('reports.tab_call_center')}
        </button>
        <button
          onClick={() => setActiveTab('domain')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'domain' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Globe size={16} />
          {t('reports.tab_domain')}
        </button>
        <button
          onClick={() => setActiveTab('upsell' as any)}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'upsell' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <TrendingUp size={16} />
          {t('reports.tab_upsell')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'sales' && data?.sales && (
          <div className="space-y-6 animate-fade-in">
            {/* Sales Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-orange-500 p-6 rounded-2xl shadow-lg shadow-orange-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-orange-100 font-medium mb-1 text-sm">{t('reports.sales_total_revenue')}</p>
                  <h3 className="text-3xl font-bold">{data.sales.totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</h3>
                  <p className="text-orange-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    <TrendingUp size={14} /> %12.5 {t('reports.vs_last_month')}
                  </p>
                </div>
              </div>
              <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Package size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-blue-100 font-medium mb-1 text-sm">{t('reports.sales_total_orders')}</p>
                  <h3 className="text-3xl font-bold">{data.sales.totalOrders}</h3>
                  <p className="text-blue-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    <TrendingUp size={14} /> %8.2 {t('reports.vs_last_month')}
                  </p>
                </div>
              </div>
              <div className="bg-purple-600 p-6 rounded-2xl shadow-lg shadow-purple-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShoppingCart size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-purple-100 font-medium mb-1 text-sm">{t('reports.sales_avg_basket')}</p>
                  <h3 className="text-3xl font-bold">{data.sales.avgBasket.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</h3>
                  <p className="text-purple-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    <TrendingUp size={14} className="rotate-180" /> %2.1 {t('reports.vs_last_month')}
                  </p>
                </div>
              </div>
              <div className="bg-green-500 p-6 rounded-2xl shadow-lg shadow-green-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CheckCircle2 size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-green-100 font-medium mb-1 text-sm">{t('reports.sales_success_rate')}</p>
                  <h3 className="text-3xl font-bold">%{data.sales.successRate.toFixed(1)}</h3>
                  <p className="text-green-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    <TrendingUp size={14} /> %1.4 {t('reports.vs_last_month')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Trend Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6">{t('reports.sales_trend_title')}</h3>
                <div className="h-[300px] flex items-end justify-between gap-1">
                  {data.sales.salesTrend.map((item: any, i: number) => {
                    const height = (item.revenue / 6000) * 100; // Mock max
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative">
                        <div
                          className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all"
                          style={{ height: `${Math.max(height, 5)}%` }}
                        ></div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6">{t('reports.top_products_title')}</h3>
                <div className="space-y-4">
                  {data.sales.topProducts.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'][i % 5]}`}></div>
                        <span className="text-sm text-gray-600 truncate max-w-[150px]">{p.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{p.value} {t('reports.units')}</span>
                    </div>
                  ))}
                  <div className="flex justify-center mt-8">
                    {/* Donut Chart Placeholder */}
                    <div className="w-40 h-40 rounded-full border-[16px] border-blue-500 border-r-green-500 border-b-yellow-500 border-l-purple-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cargo' && data?.cargo && (
          <div className="space-y-6 animate-fade-in">
            {/* Cargo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Truck size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-blue-100 font-medium mb-1 text-sm">{t('reports.cargo_total_shipped')}</p>
                  <h3 className="text-3xl font-bold">{data.cargo.totalShipped}</h3>
                  <p className="text-blue-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    {t('reports.this_month')}
                  </p>
                </div>
              </div>
              <div className="bg-green-500 p-6 rounded-2xl shadow-lg shadow-green-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CheckCircle2 size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-green-100 font-medium mb-1 text-sm">{t('reports.cargo_delivered')}</p>
                  <h3 className="text-3xl font-bold">{data.cargo.delivered}</h3>
                  <p className="text-green-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    %{((data.cargo.delivered / data.cargo.totalShipped) * 100).toFixed(1)} {t('reports.success')}
                  </p>
                </div>
              </div>
              <div className="bg-red-500 p-6 rounded-2xl shadow-lg shadow-red-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <XCircle size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-red-100 font-medium mb-1 text-sm">{t('reports.cargo_returned')}</p>
                  <h3 className="text-3xl font-bold">{data.cargo.returned}</h3>
                  <p className="text-red-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    %{((data.cargo.returned / data.cargo.totalShipped) * 100).toFixed(1)} {t('reports.rate')}
                  </p>
                </div>
              </div>
              <div className="bg-orange-500 p-6 rounded-2xl shadow-lg shadow-orange-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Clock size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-orange-100 font-medium mb-1 text-sm">{t('reports.cargo_avg_time')}</p>
                  <h3 className="text-3xl font-bold">{data.cargo.avgDeliveryTime}</h3>
                  <p className="text-orange-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    {t('reports.fast')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cargo Status Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6">{t('reports.cargo_status_dist')}</h3>
                <div className="flex items-center justify-center h-[250px]">
                  <div className="w-48 h-48 rounded-full border-[20px] border-green-500 border-t-blue-500 border-r-red-500"></div>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {data.cargo.statusDistribution.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Time Trend */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6">{t('reports.cargo_avg_time_chart')}</h3>
                <div className="h-[250px] flex items-end justify-between px-4">
                  {[2.5, 2.1, 1.8, 2.4, 2.9, 2.2, 1.9].map((val, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mb-1"></div>
                      <div className="h-[1px] w-12 bg-yellow-500 rotate-12 origin-left"></div>
                      <span className="text-xs text-gray-400">G{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* City Performance Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">{t('reports.city_performance_title')}</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">{t('reports.table_city')}</th>
                    <th className="px-6 py-4">{t('reports.table_total_sent')}</th>
                    <th className="px-6 py-4">{t('reports.table_delivered')}</th>
                    <th className="px-6 py-4 text-right">{t('reports.table_success_rate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.cargo.cityPerformance.map((city: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{city.city}</td>
                      <td className="px-6 py-4 text-gray-600">{city.sent}</td>
                      <td className="px-6 py-4 text-gray-600">{city.delivered}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">%{city.successRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'call-center' && data?.callCenter && (
          <div className="space-y-6 animate-fade-in">
            {/* Call Center Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Phone size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-blue-100 font-medium mb-1 text-sm">{t('reports.cc_total_calls')}</p>
                  <h3 className="text-3xl font-bold">{data.callCenter.totalCalls}</h3>
                </div>
              </div>
              <div className="bg-purple-600 p-6 rounded-2xl shadow-lg shadow-purple-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-purple-100 font-medium mb-1 text-sm">{t('reports.cc_reached')}</p>
                  <h3 className="text-3xl font-bold">{data.callCenter.reached}</h3>
                  <p className="text-purple-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    %{((data.callCenter.reached / data.callCenter.totalCalls) * 100).toFixed(0)} {t('reports.cc_reachability')}
                  </p>
                </div>
              </div>
              <div className="bg-green-500 p-6 rounded-2xl shadow-lg shadow-green-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CheckCircle2 size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-green-100 font-medium mb-1 text-sm">{t('reports.cc_approved')}</p>
                  <h3 className="text-3xl font-bold">{data.callCenter.approved}</h3>
                  <p className="text-green-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    %{((data.callCenter.approved / data.callCenter.reached) * 100).toFixed(0)} {t('reports.cc_approval_rate')}
                  </p>
                </div>
              </div>
              <div className="bg-red-500 p-6 rounded-2xl shadow-lg shadow-red-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <XCircle size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-red-100 font-medium mb-1 text-sm">{t('reports.cc_cancelled')}</p>
                  <h3 className="text-3xl font-bold">{data.callCenter.cancelled}</h3>
                </div>
              </div>
            </div>

            {/* Agent Performance Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6">{t('reports.cc_agent_perf_title')}</h3>
              <div className="space-y-4">
                {data.callCenter.agentPerformance.map((agent: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{agent.name}</span>
                      <span className="font-bold text-gray-900">%{agent.successRate}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${agent.successRate}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">{t('reports.table_agent')}</th>
                    <th className="px-6 py-4">{t('reports.table_calls')}</th>
                    <th className="px-6 py-4">{t('reports.table_reached')}</th>
                    <th className="px-6 py-4 text-green-600">{t('reports.table_approved')}</th>
                    <th className="px-6 py-4 text-right text-blue-600">{t('reports.table_success')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.callCenter.agentPerformance.map((agent: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{agent.name}</td>
                      <td className="px-6 py-4 text-gray-600">{agent.calls}</td>
                      <td className="px-6 py-4 text-gray-600">{agent.reached}</td>
                      <td className="px-6 py-4 font-bold text-green-600">{agent.approved}</td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600">%{agent.successRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'domain' && data?.domain && (
          <div className="space-y-6 animate-fade-in">
            {/* Domain Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Globe size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-blue-100 font-medium mb-1 text-sm">{t('reports.domain_active')}</p>
                  <h3 className="text-3xl font-bold">{data.domain.activeDomains}</h3>
                </div>
              </div>
              <div className="bg-orange-500 p-6 rounded-2xl shadow-lg shadow-orange-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-orange-100 font-medium mb-1 text-sm">{t('reports.domain_visitors')}</p>
                  <h3 className="text-3xl font-bold">{data.domain.totalVisits}</h3>
                </div>
              </div>
              <div className="bg-green-500 p-6 rounded-2xl shadow-lg shadow-green-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-green-100 font-medium mb-1 text-sm">{t('reports.domain_avg_conv')}</p>
                  <h3 className="text-3xl font-bold">%{data.domain.avgConversion}</h3>
                </div>
              </div>
              <div className="bg-red-500 p-6 rounded-2xl shadow-lg shadow-red-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-red-100 font-medium mb-1 text-sm">{t('reports.domain_ad_cost')}</p>
                  <h3 className="text-3xl font-bold">{data.domain.adCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</h3>
                </div>
              </div>
            </div>

            {/* Domain Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">{t('reports.domain_perf_title')}</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">{t('reports.table_domain')}</th>
                    <th className="px-6 py-4">{t('reports.table_orders')}</th>
                    <th className="px-6 py-4">{t('reports.table_revenue')}</th>
                    <th className="px-6 py-4">{t('reports.table_conversion')}</th>
                    <th className="px-6 py-4 text-right">{t('reports.table_status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.domain.domainPerformance.map((d: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-blue-600">{d.domain}</td>
                      <td className="px-6 py-4 text-gray-600">{d.orders}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{d.revenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                      <td className="px-6 py-4 text-green-600">%{d.conversion}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${d.status === 'Aktif' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'upsell' && data?.upsell && (
          <div className="space-y-6 animate-fade-in">
            {/* Upsell Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-500 p-6 rounded-2xl shadow-lg shadow-orange-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-orange-100 font-medium mb-1 text-sm">{t('reports.upsell_revenue')}</p>
                  <h3 className="text-3xl font-bold">{data.upsell.totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</h3>
                  <p className="text-orange-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    <TrendingUp size={14} /> %15.2 {t('reports.vs_last_month')}
                  </p>
                </div>
              </div>
              <div className="bg-green-500 p-6 rounded-2xl shadow-lg shadow-green-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-green-100 font-medium mb-1 text-sm">{t('reports.upsell_conversion')}</p>
                  <h3 className="text-3xl font-bold">%{data.upsell.conversionRate}</h3>
                  <p className="text-green-100 mt-2 flex items-center gap-1 text-sm bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    <TrendingUp size={14} /> %2.4 {t('reports.vs_last_month')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Upsells */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6">{t('reports.upsell_top')}</h3>
                <div className="space-y-4">
                  {data.upsell.topUpsells.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{item.revenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</div>
                        <div className="text-xs text-gray-500">{item.count} {t('reports.units')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6">{t('reports.upsell_funnel')}</h3>
                <div className="space-y-2">
                  {data.upsell.funnel.map((step, i) => (
                    <div key={i} className="relative">
                      <div className="flex justify-between text-sm mb-1 relative z-10">
                        <span className="font-medium text-gray-700">{step.stage}</span>
                        <span className="font-bold text-gray-900">{step.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded h-8 overflow-hidden relative">
                        <div
                          className="absolute top-0 left-0 h-full bg-purple-500 opacity-20"
                          style={{ width: `${(step.count / data.upsell.funnel[0].count) * 100}%` }}
                        ></div>
                        <div className="absolute top-0 left-0 h-full w-1 bg-purple-600"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDashboard;
