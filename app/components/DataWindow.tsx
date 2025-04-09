"use client";

import { useState, useEffect } from 'react';

interface DataWindowProps {
  type: 'chart' | 'graph' | 'stats';
  merchantId: string;
}

export default function DataWindow({ type, merchantId }: DataWindowProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate data loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [merchantId, type]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>
      );
    }

    switch (type) {
      case 'chart':
        return <BarChart merchantId={merchantId} />;
      case 'graph':
        return <LineGraph merchantId={merchantId} />;
      case 'stats':
        return <StatsDisplay merchantId={merchantId} />;
      default:
        return <div>Unknown data type</div>;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
}

function BarChart({ merchantId }: { merchantId: string }) {
  // Placeholder for a bar chart visualization
  const bars = [65, 40, 85, 30, 55, 60, 45];
  const maxBarHeight = 100;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm mb-2">Sales by Category ({merchantId})</h3>
      <div className="flex-1 flex items-end justify-between gap-2 pt-4">
        {bars.map((height, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-blue-500 rounded-t-sm"
              style={{ height: `${(height / maxBarHeight) * 100}%` }}
            ></div>
            <span className="text-xs mt-1">Cat {i+1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineGraph({ merchantId }: { merchantId: string }) {
  // Placeholder for a line graph
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm mb-2">Performance Trends ({merchantId})</h3>
      <div className="flex-1 relative">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          {/* Grid lines */}
          <line x1="0" y1="10" x2="100" y2="10" stroke="#ddd" strokeWidth="0.5" />
          <line x1="0" y1="20" x2="100" y2="20" stroke="#ddd" strokeWidth="0.5" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="#ddd" strokeWidth="0.5" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#ddd" strokeWidth="0.5" />
          
          {/* Line */}
          <polyline 
            points="0,35 15,25 30,30 45,15 60,20 75,10 90,22" 
            fill="none" 
            stroke="#3B82F6" 
            strokeWidth="2"
          />
          
          {/* Points */}
          <circle cx="0" cy="35" r="1.5" fill="#3B82F6" />
          <circle cx="15" cy="25" r="1.5" fill="#3B82F6" />
          <circle cx="30" cy="30" r="1.5" fill="#3B82F6" />
          <circle cx="45" cy="15" r="1.5" fill="#3B82F6" />
          <circle cx="60" cy="20" r="1.5" fill="#3B82F6" />
          <circle cx="75" cy="10" r="1.5" fill="#3B82F6" />
          <circle cx="90" cy="22" r="1.5" fill="#3B82F6" />
        </svg>
      </div>
    </div>
  );
}

function StatsDisplay({ merchantId }: { merchantId: string }) {
  // Placeholder for key statistics
  const stats = [
    { label: 'Total Revenue', value: `$${(Math.random() * 10000).toFixed(2)}` },
    { label: 'Customers', value: Math.floor(Math.random() * 500) },
    { label: 'Avg Order Value', value: `$${(Math.random() * 100).toFixed(2)}` },
    { label: 'Conversion Rate', value: `${(Math.random() * 10).toFixed(2)}%` }
  ];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm mb-4">Key Metrics ({merchantId})</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
          >
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-lg font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
