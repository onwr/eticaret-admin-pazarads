
import React from 'react';
import { ChartDataPoint } from '../../types/reports';

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ 
  data, 
  height = 200, 
  color = '#8B5CF6' 
}) => {
  if (data.length < 2) return <div className="h-full flex items-center justify-center text-gray-400">Not enough data to display trend</div>;

  const maxValue = Math.max(...data.map(d => d.value)) * 1.1 || 100; // Add 10% padding
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  // Create fill area
  const fillPoints = `0,100 ${points} 100,100`;

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#f3f4f6" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#f3f4f6" strokeWidth="0.5" />

        {/* Area Fill */}
        <polygon points={fillPoints} fill={color} fillOpacity="0.1" />

        {/* The Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.value / maxValue) * 100;
          return (
            <g key={i} className="group cursor-pointer">
              <circle 
                cx={x} 
                cy={y} 
                r="1.5" 
                fill="white" 
                stroke={color} 
                strokeWidth="1" 
                vectorEffect="non-scaling-stroke"
                className="group-hover:r-2 transition-all"
              />
              <title>{d.label}: {d.value}</title>
            </g>
          );
        })}
      </svg>
      
      {/* X Axis Labels */}
      <div className="absolute top-full left-0 w-full flex justify-between mt-2 px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-gray-400">
            {i % Math.ceil(data.length / 6) === 0 ? d.label : ''} 
          </span>
        ))}
      </div>
    </div>
  );
};

export default SimpleLineChart;
