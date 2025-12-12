
import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

interface OrderFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onFilter: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ 
  search, 
  onSearchChange, 
  dateRange,
  onDateRangeChange,
  onFilter
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 items-end">
      
      {/* Search Input */}
      <div className="flex-1 w-full">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Arama</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Sipariş no, ad soyad, telefon..." 
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Date Start */}
      <div className="w-full lg:w-auto">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Tarih Aralığı</label>
        <div className="flex items-center gap-2">
            <div className="relative">
               <input 
                 type="date" 
                 value={dateRange.start}
                 onChange={(e) => onDateRangeChange({...dateRange, start: e.target.value})}
                 className="pl-3 pr-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-36"
               />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative">
               <input 
                 type="date" 
                 value={dateRange.end}
                 onChange={(e) => onDateRangeChange({...dateRange, end: e.target.value})}
                 className="pl-3 pr-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-36"
               />
            </div>
        </div>
      </div>

      {/* Filter Button */}
      <div className="w-full lg:w-auto">
        <button 
          onClick={onFilter}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors font-medium text-sm shadow-md active:translate-y-0.5"
        >
          <Filter size={16} /> Filtre
        </button>
      </div>
    </div>
  );
};

export default OrderFilters;
