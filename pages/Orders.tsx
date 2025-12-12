
import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, ExportTemplate } from '../types';
import { getOrders, bulkUpdateOrderStatus, getOrderCounts, getExportTemplates } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import OrderTable from '../components/OrderTable';
import OrderFilters from '../components/OrderFilters';
import OrderDetailModal from '../components/modals/OrderDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FileSpreadsheet, CheckCircle, Truck, XCircle, X, Plus, ChevronDown
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import * as XLSX from 'xlsx';

import { useNotification } from '../contexts/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';

interface OrdersProps {
  initialStatus?: OrderStatus | 'ALL';
  onNavigate?: (view: string) => void;
}

const Orders: React.FC<OrdersProps> = ({ initialStatus = 'ALL', onNavigate }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filter State
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // UI State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showExcelMenu, setShowExcelMenu] = useState(false);

  // Initial Load
  useEffect(() => {
    setActiveTab(initialStatus);
  }, [initialStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderData, countData, tmplData] = await Promise.all([
        getOrders({ search: searchQuery }),
        getOrderCounts(),
        getExportTemplates()
      ]);
      setOrders(orderData);
      setCounts(countData);
      setTemplates(tmplData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  // Client-side filtering
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Status Filter
    if (activeTab !== 'ALL') {
      result = result.filter(o => o.status === activeTab);
    }

    // Date Filter
    if (dateRange.start) {
      result = result.filter(o => new Date(o.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      result = result.filter(o => new Date(o.createdAt) <= endDate);
    }

    return result;
  }, [orders, activeTab, dateRange]);

  // Selection Handlers
  const handleSelect = (id: string, selected: boolean) => {
    if (selected) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? filteredOrders.map(o => o.id) : []);
  };

  // Handlers
  const handleOpenNewOrder = () => {
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleOpenEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Bulk Actions
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

  const { addNotification } = useNotification();

  const handleBulkStatusChange = async (status: OrderStatus) => {
    if (!user || selectedIds.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: t('orders.bulk_status_title') || 'Toplu Durum Güncelleme',
      message: t('orders.confirm_bulk_status').replace('{count}', selectedIds.length.toString()),
      onConfirm: async () => {
        setIsBulkProcessing(true);
        try {
          await bulkUpdateOrderStatus(selectedIds, status, { id: user.id, name: user.name || 'Admin' });
          setSelectedIds([]);
          fetchData();
          addNotification('success', t('orders.bulk_success') || 'Siparişler güncellendi');
        } catch (e) {
          addNotification('error', t('orders.bulk_error'));
        } finally {
          setIsBulkProcessing(false);
        }
      }
    });
  };

  // Helper to get nested value by string path (e.g. "customer.name")
  const getNestedValue = (obj: any, path: string) => {
    // Special logic for formatted items to handle multiple dynamic fields in one cell
    if (path === 'formatted_items') {
      if (!obj.items || obj.items.length === 0) return '';
      // Format: "2 x Product A (Red), 1 x Product B"
      return obj.items.map((item: any) => {
        const variantStr = item.variantSelection ? `(${item.variantSelection})` : '';
        return `${item.quantity} x ${item.productName} ${variantStr}`.trim();
      }).join(', ');
    }

    // Default dot notation access
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const handleExcelExport = (template?: ExportTemplate) => {
    setShowExportMenu(false);

    // Determine which orders to export (selected or all filtered)
    const exportData = selectedIds.length > 0
      ? orders.filter(o => selectedIds.includes(o.id))
      : filteredOrders;

    if (exportData.length === 0) return addNotification('warning', t('orders.no_export_data'));

    console.log("Exporting using template:", template ? template.name : "Default");

    let excelData: any[] = [];

    if (template) {
      // Map based on template columns
      excelData = exportData.map(order => {
        const row: Record<string, any> = {};
        template.columns.forEach(col => {
          if (col.type === 'STATIC') {
            row[col.header] = col.value;
          } else {
            let val = getNestedValue(order, col.value);
            if (val === undefined || val === null) val = "";
            row[col.header] = val;
          }
        });
        return row;
      });
    } else {
      // Default Export - Enhanced
      excelData = exportData.map(o => ({
        [t('orders.export_header_order_no')]: o.orderNumber,
        [t('orders.export_header_customer')]: o.customer?.name,
        [t('orders.export_header_phone')]: o.customer?.phone,
        [t('orders.export_header_city')]: o.customer?.city,
        [t('orders.export_header_district')]: o.customer?.district,
        [t('orders.export_header_address')]: o.customer?.address,
        [t('orders.export_header_product')]: o.product?.name,
        [t('orders.export_header_variant')]: o.variantSelection,
        [t('orders.export_header_amount')]: o.totalAmount,
        [t('orders.export_header_payment')]: o.paymentMethod,
        [t('orders.export_header_status')]: o.status,
        [t('orders.export_header_source')]: o.referrer,
        [t('orders.export_header_date')]: new Date(o.createdAt).toLocaleString('tr-TR')
      }));
    }

    // Generate Excel File
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('orders.sheet_name'));

    XLSX.writeFile(workbook, `orders_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    addNotification('success', 'Excel dosyası oluşturuldu');
  };

  const handleBarcodeGenerate = () => {
    addNotification('info', t('orders.export_generating').replace('{count}', selectedIds.length.toString()));
  };

  // Status Tabs Configuration
  const tabs = [
    { id: OrderStatus.NEW, label: t('orders.tab_new'), count: counts[OrderStatus.NEW] || 0, icon: '🆕' },
    { id: OrderStatus.ONAYLANDI, label: t('orders.tab_approved'), count: counts[OrderStatus.ONAYLANDI] || 0, icon: '✅' },
    { id: OrderStatus.ARANACAK, label: t('orders.tab_call'), count: counts[OrderStatus.ARANACAK] || 0, icon: '📞' },
    { id: OrderStatus.ULASILAMADI, label: t('orders.tab_unreachable'), count: counts[OrderStatus.ULASILAMADI] || 0, icon: '📵' },
    { id: OrderStatus.KARGODA, label: t('orders.tab_shipped'), count: counts[OrderStatus.KARGODA] || 0, icon: '🚛' },
    { id: OrderStatus.IPTAL, label: t('orders.tab_cancelled'), count: counts[OrderStatus.IPTAL] || 0, icon: '❌' },
    { id: 'ALL', label: t('orders.tab_all'), count: orders.length, icon: '📑' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">

      {/* 1. Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('orders.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('orders.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleOpenNewOrder}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus size={18} /> {t('orders.new_order')}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
            >
              <FileSpreadsheet size={18} /> {t('orders.export_excel')} <ChevronDown size={14} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                <button onClick={() => handleExcelExport()} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-50">
                  {t('orders.export_standard')}
                </button>
                {templates.length > 0 && <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase bg-gray-50/50">{t('orders.templates')}</div>}
                {templates.map(tmpl => (
                  <button key={tmpl.id} onClick={() => handleExcelExport(tmpl)} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700">
                    {tmpl.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sticky Status Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-6 overflow-x-auto no-scrollbar">
        <div className="flex space-x-2 min-w-max py-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border
                  ${isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                `}
              >
                <span>{tab.icon} {tab.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filters & Content */}
      <div className="p-6 max-w-[1920px] mx-auto space-y-6">

        {/* Filter Bar */}
        {/* Custom Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={t('orders.search_placeholder')}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm min-w-[140px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
              {t('orders.date_format')}
            </button>

            <button className="px-6 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
              {t('orders.filtered')}
            </button>
          </div>
        </div>

        {/* Top Bulk Action Bar (Floating) */}
        {selectedIds.length > 0 && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-6 animate-slide-up">
            <div className="flex items-center gap-2 font-medium border-r border-gray-700 pr-6">
              <span className="bg-white text-gray-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {selectedIds.length}
              </span>
              <span className="text-sm">{t('orders.selected')}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Update Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-green-400 text-sm font-medium transition-colors"
                >
                  <CheckCircle size={16} /> {t('orders.update_status')} <ChevronDown size={14} />
                </button>
                {showStatusMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                      <div className="max-h-64 overflow-y-auto">
                        {Object.values(OrderStatus).map(status => (
                          <button
                            key={status}
                            onClick={() => {
                              handleBulkStatusChange(status);
                              setShowStatusMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-50 last:border-0 flex items-center gap-2"
                          >
                            <span className={`w-2 h-2 rounded-full ${status === OrderStatus.TESLIM_EDILDI ? 'bg-green-500' :
                              status === OrderStatus.IPTAL ? 'bg-red-500' :
                                'bg-blue-500'
                              }`} />
                            {t(`status.${status}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button onClick={handleBarcodeGenerate} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-blue-400 text-sm font-medium transition-colors">
                <Truck size={16} /> {t('orders.generate_barcode')}
              </button>

              {/* Excel Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExcelMenu(!showExcelMenu)}
                  className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-green-400 text-sm font-medium transition-colors"
                >
                  <FileSpreadsheet size={16} /> {t('orders.export_excel')} <ChevronDown size={14} />
                </button>
                {showExcelMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExcelMenu(false)} />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                      <button onClick={() => { handleExcelExport(); setShowExcelMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-50 font-medium">
                        {t('orders.export_standard')}
                      </button>
                      {templates.length > 0 && <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase bg-gray-50/50">{t('orders.templates')}</div>}
                      {templates.map(tmpl => (
                        <button key={tmpl.id} onClick={() => { handleExcelExport(tmpl); setShowExcelMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700">
                          {tmpl.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button onClick={() => setSelectedIds([])} className="ml-4 text-gray-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-gray-200">
            <LoadingSpinner size={40} />
          </div>
        ) : (
          <OrderTable
            orders={filteredOrders}
            onViewDetails={handleOpenEditOrder}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
          />
        )}
      </div>

      {/* Details Modal (Slide Over) */}
      <OrderDetailModal
        isOpen={isModalOpen}
        order={selectedOrder}
        onClose={handleCloseModal}
        onUpdate={fetchData}
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

export default Orders;
