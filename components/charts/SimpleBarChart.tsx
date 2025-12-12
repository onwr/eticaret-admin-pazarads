
import React from 'react';
import { ChartDataPoint } from '../../types/reports';

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  showValues?: boolean;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  height = 200, 
  color = '#3B82F6',
  showValues = false 
}) => {
  if (data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">No data available</div>;

  const maxValue = Math.max(...data.map(d => d.value)) || 100;
  
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="h-full flex items-end justify-between gap-2">
        {data.map((point, index) => {
          const percentage = (point.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group relative min-w-[20px]">
              {showValues && (
                <div className="mb-1 text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6">
                  {point.value}
                </div>
              )}
              <div 
                className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80"
                style={{ 
                  height: `${percentage}%`, 
                  backgroundColor: color,
                  minHeight: '4px'
                }}
              ></div>
              <div className="mt-2 text-[10px] text-gray-500 truncate w-full text-center" title={point.label}>
                {point.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleBarChart;
