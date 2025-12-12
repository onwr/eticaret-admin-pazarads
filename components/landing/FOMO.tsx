
import React, { useState, useEffect } from 'react';
import { Eye, Clock, Zap } from 'lucide-react';

// --- Countdown Timer Component ---
interface CountdownProps {
  minutes?: number;
  endDate?: string; // Support specific end date
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CountdownTimer: React.FC<CountdownProps> = ({ minutes = 15, endDate, className = '', size = 'md' }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    let targetTime = new Date().getTime() + minutes * 60000;
    if (endDate) {
      targetTime = new Date(endDate).getTime();
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.floor((targetTime - now) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [minutes, endDate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 font-mono font-bold ${className}`}>
      <Clock size={size === 'sm' ? 16 : 20} className="animate-pulse text-current" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

// --- Stock Indicator Component ---
interface StockProps {
  initialStock?: number;
  className?: string;
}

export const StockIndicator: React.FC<StockProps> = ({ initialStock = 15, className = '' }) => {
  const [stock, setStock] = useState(initialStock);

  useEffect(() => {
    // Randomly decrease stock every 20-40 seconds to simulate sales
    const interval = setInterval(() => {
      setStock((prev) => (prev > 3 ? prev - 1 : prev));
    }, Math.random() * 20000 + 20000);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min((stock / 50) * 100, 100);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-sm font-bold">
        <span className="text-red-600 flex items-center gap-1">
          <Zap size={14} fill="currentColor" />
          Acele Et! Son {stock} ürün
        </span>
        <span className="text-gray-500 text-xs">Yüksek Talep</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- Live Viewers Component ---
interface LiveViewersProps {
  min?: number;
  max?: number;
  className?: string;
}

export const LiveViewers: React.FC<LiveViewersProps> = ({ min = 12, max = 28, className = '' }) => {
  const [viewers, setViewers] = useState(min);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
      setViewers(prev => {
        const next = prev + change;
        return next < min ? min : next > max ? max : next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [min, max]);

  return (
    <div className={`flex items-center gap-1.5 text-sm font-medium ${className}`}>
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </div>
      <span>Şu an {viewers} kişi inceliyor</span>
    </div>
  );
};