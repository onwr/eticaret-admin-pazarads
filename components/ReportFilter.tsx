
import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { ReportPeriod } from '../types/reports';

interface ReportFilterProps {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  onExport: () => void;
  title: string;
}

const ReportFilter: React.FC<ReportFilterProps> = ({ period, onPeriodChange, onExport, title }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">Analyzing data for the selected period.</p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <select 
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as ReportPeriod)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value={ReportPeriod.LAST_7_DAYS}>Last 7 Days</option>
            <option value={ReportPeriod.LAST_30_DAYS}>Last 30 Days</option>
            <option value={ReportPeriod.THIS_MONTH}>This Month</option>
            <option value={ReportPeriod.LAST_MONTH}>Last Month</option>
          </select>
        </div>
        
        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
};

export default ReportFilter;
