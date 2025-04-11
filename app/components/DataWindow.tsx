"use client";

import { useState, useEffect } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/app/components/ui/chart";
import { 
  BarChart as RechartsBarChart,
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

// Define proper typings for our visualization data
interface TopSellingItem {
  name: string;
  count: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface LineData {
  name: string;
  value: number;
}

interface StatData {
  label: string;
  value: string;
}

interface DataWindowProps {
  type: 'chart' | 'graph' | 'stats';
  merchantId: string;
  data?: {
    topItems?: TopSellingItem[] | string;
    period?: string;
    merchant?: string;
    chartData?: ChartData[];
    lineData?: LineData[];
    statData?: StatData[];
    // Add any other data types you might need
  };
  title?: string;
}

export default function DataWindow({ type, merchantId, data, title }: DataWindowProps) {
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

    // Handle top selling items data if available
    if (data?.topItems) {
      return <TopSellingItemsDisplay 
        items={data.topItems} 
        period={data.period || 'week'} 
        merchant={data.merchant || merchantId} 
      />;
    }

    switch (type) {
      case 'chart':
        return <BarChartDisplay 
          data={data?.chartData} 
          merchantId={merchantId} 
        />;
      case 'graph':
        return <LineGraphDisplay 
          data={data?.lineData} 
          merchantId={merchantId} 
        />;
      case 'stats':
        return <StatsDisplay 
          data={data?.statData} 
          merchantId={merchantId} 
        />;
      default:
        return <div>Unknown data type</div>;
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-md font-medium">
          {title || (type === 'chart' ? 'Sales by Category' : 
                    type === 'graph' ? 'Performance Trends' : 'Key Metrics')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 h-[calc(100%-3rem)]">
        {renderContent()}
      </CardContent>
    </Card>
  );
}

// New component to display top selling items
function TopSellingItemsDisplay({ 
  items, 
  period, 
  merchant 
}: { 
  items: Array<{ name: string; count: number }> | string; 
  period: string;
  merchant: string;
}) {
  // Handle case where items is a string (no data available)
  if (typeof items === 'string') {
    return <div className="text-center py-4 text-gray-500">{items}</div>;
  }

  const getPeriodName = () => period === 'week' ? 'Weekly' : 'Monthly';

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                style={{ backgroundColor: index % 2 === 0 ? 'var(--muted)' : 'transparent' }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold bg-primary text-primary-foreground"
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div 
                  className="px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
                >
                  {item.count} sold
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No items found for this period</div>
        )}
      </div>
    </div>
  );
}

// Adjusting the chart container to ensure it fits properly within the CardContent
function BarChartDisplay({ 
  data,
  merchantId 
}: { 
  data?: Array<ChartData>,
  merchantId: string 
}) {
  // Use state to store data
  const [chartData, setChartData] = useState<Array<ChartData>>([]);
  
  useEffect(() => {
    // If data is provided, use it
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      // Otherwise generate sample data
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
      
      // Generate sample data
      const categories = ['Food', 'Drinks', 'Dessert', 'Takeout', 'Delivery', 'Catering', 'Other'];
      const newData = categories.map(category => ({
        name: category,
        value: Math.floor(getRandom(30, 90))
      }));
      
      setChartData(newData);
    }
  }, [merchantId, data]);
  
  // Define chart colors
  const chartConfig = {
    value: { 
      label: 'Sales', 
      color: 'var(--primary)' 
    },
  };

  return (
    <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <RechartsBarChart 
          data={chartData} 
          margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            height={30}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={40}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
          />
          <ChartLegend 
            verticalAlign="top" 
            height={36}
            content={<ChartLegendContent />} 
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
}

// Adjusting the chart container to ensure it fits properly within the CardContent
function LineGraphDisplay({ 
  data,
  merchantId 
}: { 
  data?: Array<LineData>,
  merchantId: string 
}) {
  // Use state to store data
  const [lineData, setLineData] = useState<Array<LineData>>([]);

  useEffect(() => {
    // If data is provided, use it
    if (data && data.length > 0) {
      setLineData(data);
    } else {
      // Otherwise generate sample data
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
      
      // Generate sample data for a line chart
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const newData = days.map(day => ({
        name: day,
        value: Math.floor(getRandom(30, 90))
      }));
      
      setLineData(newData);
    }
  }, [merchantId, data]);

  // Define chart colors
  const chartConfig = {
    value: { 
      label: 'Trend', 
      color: 'var(--primary)' 
    },
  };
  
  return (
    <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <RechartsLineChart 
          data={lineData} 
          margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            height={30}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={40}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
          />
          <ChartLegend 
            verticalAlign="top" 
            height={36}
            content={<ChartLegendContent />} 
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            strokeWidth={2} 
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ChartContainer>
    </div>
  );
}

function StatsDisplay({ 
  data,
  merchantId 
}: { 
  data?: Array<StatData>,
  merchantId: string 
}) {
  // Use state to store consistent data across re-renders
  const [stats, setStats] = useState<Array<StatData>>([]);
  
  useEffect(() => {
    // If data is provided, use it
    if (data && data.length > 0) {
      setStats(data);
    } else {
      // Otherwise generate sample data
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
    }
  }, [merchantId, data]);

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="p-3 rounded-lg bg-secondary text-secondary-foreground"
          >
            <p className="text-xs opacity-80">{stat.label}</p>
            <p className="text-lg font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
