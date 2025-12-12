
import { OrderStatus } from '../types';
import { ChartDataPoint, ReportPeriod } from '../types/reports';
import { getOrders, getProducts } from './api';

const filterByDate = (date: string, period: ReportPeriod): boolean => {
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case ReportPeriod.LAST_7_DAYS:
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return d >= sevenDaysAgo;
    case ReportPeriod.LAST_30_DAYS:
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return d >= thirtyDaysAgo;
    case ReportPeriod.THIS_MONTH:
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    case ReportPeriod.LAST_MONTH:
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return d >= firstDayLastMonth && d <= lastDayLastMonth;
    default:
      return true;
  }
};

export const getProductPerformance = async (period: ReportPeriod) => {
  const orders = await getOrders({}); 
  const products = await getProducts();
  
  const filteredOrders = orders.filter(o => filterByDate(o.createdAt, period));
  
  const stats = products.map(p => {
    const pOrders = filteredOrders.filter(o => o.productId === p.id);
    const revenue = pOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const sales = pOrders.length;
    const cancelled = pOrders.filter(o => o.status === OrderStatus.IPTAL).length;
    
    // Mock views for conversion rate calculation
    // In real app, get from analytics table
    const views = sales > 0 ? Math.floor(sales * (Math.random() * 20 + 10)) : Math.floor(Math.random() * 100);
    
    return {
      id: p.id,
      name: p.name,
      sales,
      revenue,
      views,
      conversionRate: views > 0 ? (sales / views) * 100 : 0,
      cancelRate: sales > 0 ? (cancelled / sales) * 100 : 0
    };
  });

  return stats.sort((a, b) => b.revenue - a.revenue);
};

export const getOrderTrends = async (period: ReportPeriod): Promise<ChartDataPoint[]> => {
  const orders = await getOrders({});
  const filteredOrders = orders.filter(o => filterByDate(o.createdAt, period));
  
  const grouped: Record<string, number> = {};
  
  // Initialize defaults based on period to ensure continuous line
  // (Simplification: just grouping existing orders)
  
  filteredOrders.forEach(o => {
    const date = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return Object.keys(grouped).map(date => ({
    label: date,
    value: grouped[date]
  }));
};

export const getFinanceStats = async (period: ReportPeriod) => {
  const orders = await getOrders({});
  const filteredOrders = orders.filter(o => filterByDate(o.createdAt, period));
  
  const validOrders = filteredOrders.filter(o => 
    [OrderStatus.ONAYLANDI, OrderStatus.KARGODA, OrderStatus.TESLIM_EDILDI, OrderStatus.NEW].includes(o.status as OrderStatus)
  );

  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Mock Expenses
  const cogs = totalRevenue * 0.30;
  const adSpend = totalRevenue * 0.20;
  const shippingCost = validOrders.length * 5; 
  const totalExpenses = cogs + adSpend + shippingCost;
  const netProfit = totalRevenue - totalExpenses;

  const chartData: ChartDataPoint[] = [
    { label: 'Revenue', value: totalRevenue },
    { label: 'COGS', value: cogs },
    { label: 'Ads', value: adSpend },
    { label: 'Shipping', value: shippingCost },
    { label: 'Profit', value: netProfit }
  ];

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    chartData
  };
};

export const getAgentPerformanceReport = async (period: ReportPeriod) => {
  // Mock data for agents report
  return [
    { name: 'Sales Agent', calls: 142, orders: 45, revenue: 2250, conversion: 31.6 },
    { name: 'Support Rep', calls: 89, orders: 12, revenue: 600, conversion: 13.4 },
    { name: 'Closer Mike', calls: 110, orders: 52, revenue: 3100, conversion: 47.2 },
  ];
};
