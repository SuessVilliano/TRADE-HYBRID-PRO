import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, LandPlot, LineChart, Rocket, TrendingUp, ArrowDown } from 'lucide-react';

export function NftStatsWidget() {
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">THC Market Stats</CardTitle>
        <CardDescription>
          Current market performance and statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard 
            title="THC Price" 
            value="$2.45" 
            change="+5.2%" 
            trend="up" 
            icon={<Coins className="h-4 w-4" />} 
          />
          <StatCard 
            title="24h Volume" 
            value="1.2M THC" 
            change="+12.8%" 
            trend="up" 
            icon={<LineChart className="h-4 w-4" />} 
          />
          <StatCard 
            title="NFTs Traded" 
            value="324" 
            change="+8.1%" 
            trend="up" 
            icon={<LandPlot className="h-4 w-4" />} 
          />
          <StatCard 
            title="New Listings" 
            value="42" 
            change="-3.4%" 
            trend="down" 
            icon={<Rocket className="h-4 w-4" />} 
          />
        </div>
        
        <div className="mt-6 flex items-center justify-between space-x-2">
          <div className="grid grid-cols-3 gap-2 flex-grow">
            <ChartBar value={65} day="Mon" />
            <ChartBar value={45} day="Tue" />
            <ChartBar value={55} day="Wed" />
            <ChartBar value={75} day="Thu" />
            <ChartBar value={85} day="Fri" />
            <ChartBar value={65} day="Sat" />
            <ChartBar value={90} day="Sun" />
            <ChartBar value={75} day="Mon" />
            <ChartBar value={65} day="Tue" />
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Market Cap</span>
            <span className="font-medium">$24.5M</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Circulating Supply</span>
            <span className="font-medium">10M THC</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total NFTs</span>
            <span className="font-medium">1,248</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">THC Holders</span>
            <span className="font-medium">5,742</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-500 dark:text-gray-400 text-xs">{title}</span>
        <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
          {icon}
        </span>
      </div>
      <div className="font-semibold">{value}</div>
      <div className={`text-xs flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend === 'up' ? (
          <TrendingUp className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDown className="h-3 w-3 mr-1" />
        )}
        {change}
      </div>
    </div>
  );
}

interface ChartBarProps {
  value: number;
  day: string;
}

function ChartBar({ value, day }: ChartBarProps) {
  return (
    <div className="flex flex-col items-center space-y-1.5">
      <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden">
        <div 
          className="bg-primary/80 h-full w-full origin-bottom transition-transform duration-500" 
          style={{ transform: `scaleY(${value / 100})` }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{day}</span>
    </div>
  );
}