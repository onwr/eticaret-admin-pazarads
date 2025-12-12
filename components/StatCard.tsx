import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // Tailwind class for background color of icon container (e.g., 'bg-blue-100')
  iconColor?: string; // Tailwind class for text color of icon (e.g., 'text-blue-600')
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'bg-slate-100', 
  iconColor = 'text-slate-600',
  trend 
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start justify-between transition-transform hover:translate-y-[-2px]">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        
        {trend && (
          <div className="flex items-center mt-2 gap-1 text-xs font-medium">
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-gray-400">vs last month</span>
          </div>
        )}
      </div>
      
      <div className={`p-3 rounded-xl ${color} ${iconColor}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;