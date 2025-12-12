import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, History, AlertTriangle, ArrowUp, ArrowDown, RefreshCw, Filter } from 'lucide-react';
import { Product, ProductVariant, StockMovement, StockMovementType } from '../types';
import { getProducts, getStockMovements } from '../lib/api';
import StockEntryModal from '../components/modals/StockEntryModal';
import { useLanguage } from '../lib/i18n';
import { useNotification } from '../contexts/NotificationContext';

// Flattened structure for table
interface InventoryItem {
    id: string; // variantId or productId if no variant
    productId: string;
    variantId?: string;
    productName: string;
    variantName: string;
    stock: number;
    image: string;
    sku?: string;
}

const Inventory: React.FC = () => {
    const { t } = useLanguage();
    const { addNotification } = useNotification();
    const [products, setProducts] = useState<Product[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [showLowStock, setShowLowStock] = useState(false);

    // History Modal State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedItemForHistory, setSelectedItemForHistory] = useState<InventoryItem | null>(null);
    const [historyLogs, setHistoryLogs] = useState<StockMovement[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);

            // Flatten products to inventory items
            const items: InventoryItem[] = [];
            data.forEach(p => {
                if (p.variants && p.variants.length > 0) {
                    p.variants.forEach(v => {
                        items.push({
                            id: v.id,
                            productId: p.id,
                            variantId: v.id,
                            productName: p.name,
                            variantName: v.variantName,
                            stock: v.stock || 0,
                            image: p.images[0]?.url || '',
                            sku: `SKU-${v.id.substring(0, 6).toUpperCase()}`
                        });
                    });
                } else {
                    // Simple product (if any, though we assume variants exist)
                    // If no variants, we might skip or show as "Standart"
                }
            });
            setInventoryItems(items);
        } catch (error) {
            console.error("Failed to load inventory", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenHistory = async (item: InventoryItem) => {
        setSelectedItemForHistory(item);
        setHistoryModalOpen(true);
        setHistoryLoading(true);
        try {
            const allMovements = await getStockMovements(item.productId);
            // Filter for specific variant if needed
            const filtered = item.variantId
                ? allMovements.filter(m => m.variantId === item.variantId)
                : allMovements;
            setHistoryLogs(filtered);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const filteredItems = inventoryItems.filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase());

        if (showLowStock) {
            return matchesSearch && item.stock <= 10;
        }
        return matchesSearch;
    });

    const lowStockCount = inventoryItems.filter(i => i.stock <= 10).length;

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('inventory.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('inventory.subtitle')}</p>
                </div>
                <button
                    onClick={() => setIsEntryModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
                >
                    <Plus size={20} />
                    {t('inventory.bulk_entry')}
                </button>
            </div>

            {/* Low Stock Alert Banner */}
            {lowStockCount > 0 && (
                <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-100 rounded-2xl p-6 mb-8 flex items-center justify-between animate-fade-in shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-3 bg-white text-rose-600 rounded-xl shadow-sm border border-rose-100">
                            <AlertTriangle size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{t('inventory.critical_alert')}</h3>
                            <p className="text-gray-600">{t('inventory.critical_desc').replace('{count}', lowStockCount.toString())}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLowStock(true)}
                        className="px-6 py-3 bg-white border border-rose-200 text-rose-700 font-bold rounded-xl hover:bg-rose-50 transition-all shadow-sm hover:shadow-md active:scale-95 relative z-10"
                    >
                        {t('inventory.show_products')}
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('inventory.search_placeholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                </div>
                <button className="px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Filter size={18} /> {t('common.filter')}
                </button>
                <button
                    onClick={() => setShowLowStock(!showLowStock)}
                    className={`px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 ${showLowStock ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                    <AlertTriangle size={18} /> {t('inventory.filter_critical')}
                </button>
                <button onClick={loadData} className="px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors ml-auto">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.table_product')}</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.table_sku')}</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.table_variant')}</th>
                            <th className="text-center py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.table_stock')}</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.table_actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">{t('common.loading')}</td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">{t('inventory.no_records')}</td></tr>
                        ) : (
                            filteredItems.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-gray-900">{item.productName}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-mono text-sm text-gray-500">{item.sku}</td>
                                    <td className="py-4 px-6">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                                            {item.variantName}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-bold text-sm shadow-sm
                                            ${item.stock <= 10 ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                item.stock <= 50 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            }`}>
                                            {item.stock <= 10 && <AlertTriangle size={14} />}
                                            <span>{item.stock} {t('inventory.units')}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => handleOpenHistory(item)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title={t('inventory.history_tooltip')}
                                        >
                                            <History size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stock Entry Modal */}
            <StockEntryModal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                onSuccess={() => {
                    loadData();
                    addNotification('success', t('inventory.stock_updated') || 'Stok güncellendi');
                }}
            />

            {/* History Modal (Inline for now) */}
            {historyModalOpen && selectedItemForHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <div>
                                <h3 className="font-bold text-gray-900">{t('inventory.stock_history')}</h3>
                                <p className="text-sm text-gray-500">{selectedItemForHistory.productName} - {selectedItemForHistory.variantName}</p>
                            </div>
                            <button onClick={() => setHistoryModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                                <ArrowDown size={20} className="rotate-45" /> {/* Close icon alternative */}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            {historyLoading ? (
                                <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
                            ) : historyLogs.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">{t('inventory.no_records')}</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-bold sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left">{t('inventory.history_date')}</th>
                                            <th className="px-6 py-3 text-left">{t('inventory.history_action')}</th>
                                            <th className="px-6 py-3 text-left">{t('inventory.history_qty')}</th>
                                            <th className="px-6 py-3 text-left">{t('inventory.history_user')}</th>
                                            <th className="px-6 py-3 text-left">{t('inventory.history_note')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {historyLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 text-gray-600">
                                                    {new Date(log.createdAt).toLocaleString('tr-TR')}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${log.type === StockMovementType.IN || log.type === StockMovementType.RETURN ? 'bg-green-100 text-green-700' :
                                                        log.type === StockMovementType.OUT ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {log.type === StockMovementType.IN ? <ArrowUp size={12} /> :
                                                            log.type === StockMovementType.OUT ? <ArrowDown size={12} /> : null}
                                                        {t(`inventory.move_${log.type}`)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-mono font-bold">
                                                    {log.quantity}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600">{log.userName}</td>
                                                <td className="px-6 py-3 text-gray-500 truncate max-w-[150px]" title={log.note}>
                                                    {log.note || '-'}
                                                    {log.documentUrl && (
                                                        <a href={log.documentUrl} target="_blank" rel="noreferrer" className="ml-2 text-blue-600 hover:underline">
                                                            {t('inventory.document')}
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
