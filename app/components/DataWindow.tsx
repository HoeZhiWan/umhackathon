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
            <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: "var(--light)" }}></div>
            <div className="w-3 h-3 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: "var(--light)" }}></div>
            <div className="w-3 h-3 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: "var(--light)" }}></div>
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
  // Use state to store consistent random data
  const [bars, setBars] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const maxBarHeight = 100;
  
  useEffect(() => {
    // Create a simple hash from merchantId to get consistent numbers
    const hashCode = (s: string) => {
      let h = 0;
      for(let i = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      return Math.abs(h);
    };
    
    const baseSeed = hashCode(merchantId);
    let currentSeed = baseSeed;
    const getRandom = (min: number, max: number) => {
      const x = Math.sin(currentSeed++) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };
    
    // Generate random bar values
    const newBars = Array(7).fill(0).map(() => Math.floor(getRandom(30, 90)));
    setBars(newBars);
    
    // Define categories for the bars
    const itemCategories = ['Food', 'Drinks', 'Dessert', 'Takeout', 'Delivery', 'Catering', 'Other'];
    setCategories(itemCategories);
  }, [merchantId]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm mb-2">Sales by Category ({merchantId})</h3>
      <div className="flex-1 flex items-end justify-around">
        {bars.map((height, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-xs mb-1" style={{ color: "var(--secondary)" }}>
              {height}%
            </span>
            <div 
              className="w-8 rounded-t-md transition-all duration-500 ease-in-out" 
              style={{ 
                height: `${height}px`, 
                backgroundColor: "var(--light)",
                minHeight: '10px',
                maxHeight: '80%'
              }}
            ></div>
            <span className="text-xs mt-2 text-center" style={{ color: "var(--foreground)" }}>
              {categories[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineGraph({ merchantId }: { merchantId: string }) {
  // Use state to store consistent random data
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  
  useEffect(() => {
    // Create a simple hash from merchantId to get consistent numbers
    const hashCode = (s: string) => {
      let h = 0;
      for(let i = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      return Math.abs(h);
    };
    
    const baseSeed = hashCode(merchantId);
    let currentSeed = baseSeed;
    const getRandom = (min: number, max: number) => {
      const x = Math.sin(currentSeed++) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };
    
    // Generate random points for the line graph
    // X coordinates are fixed and evenly spaced
    const xCoords = [0, 15, 30, 45, 60, 75, 90];
    // Y coordinates are random between 10 (highest point) and 40 (lowest point)
    const newPoints = xCoords.map(x => ({
      x,
      y: getRandom(10, 40)
    }));
    
    setPoints(newPoints);
  }, [merchantId]);

  // Generate the points string for the polyline
  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

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
          {points.length > 0 && (
            <polyline 
              points={pointsString}
              fill="none" 
              stroke="var(--foreground)" 
              strokeWidth="1"
            />
          )}
          
          {/* Points */}
          {points.map((point, i) => (
            <circle 
              key={i}
              cx={point.x} 
              cy={point.y} 
              r="1.5" 
              fill="var(--light)" 
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function StatsDisplay({ merchantId }: { merchantId: string }) {
  // Use useRef to maintain consistent data across re-renders
  const [stats, setStats] = useState<Array<{label: string, value: string}>>([]);
  
  // Generate consistent random stats based on merchantId
  useEffect(() => {
    // Create a simple hash from merchantId to get consistent numbers
    const hashCode = (s: string) => {
      let h = 0;
      for(let i = 0; i < s.length; i++)
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      return Math.abs(h);
    };
    
    const baseSeed = hashCode(merchantId);
    let currentSeed = baseSeed;
    const getRandom = (min: number, max: number) => {
      const x = Math.sin(currentSeed++) * 10000;
      return min + (x - Math.floor(x)) * (max - min);
    };
    
    const newStats = [
      { 
        label: 'Total Revenue', 
        value: `$${getRandom(5000, 15000).toFixed(2)}` 
      },
      { 
        label: 'Customers', 
        value: Math.floor(getRandom(100, 500)).toString() 
      },
      { 
        label: 'Avg Order Value', 
        value: `$${getRandom(50, 150).toFixed(2)}` 
      },
      { 
        label: 'Conversion Rate', 
        value: `${getRandom(5, 15).toFixed(2)}%` 
      }
    ];
    
    setStats(newStats);
  }, [merchantId]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm mb-4">Key Metrics ({merchantId})</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: "var(--light)", 
              color: "var(--foreground)" 
            }}
          >
            <p className="text-xs" style={{ color: "var(--secondary)" }}>{stat.label}</p>
            <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
