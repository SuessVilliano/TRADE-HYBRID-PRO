import React from 'react';
import { SignalPerformanceGrid } from '@/components/trade/signal-performance-grid';
import { PageHeader } from '@/components/ui/page-header';
import { Helmet } from 'react-helmet-async';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  LineChart, 
  LucideWallet, 
  TrendingUp, 
  Users, 
  BarChart3,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SignalsPerformancePage() {
  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  // Stats cards for the top section
  const stats = [
    {
      title: 'Active Signals',
      value: '12',
      change: '+3 today',
      icon: <Clock className="h-4 w-4 text-emerald-500" />,
      description: 'Currently active trading signals'
    },
    {
      title: 'Win Rate',
      value: '78%',
      change: '+2.5% this week',
      icon: <BarChart3 className="h-4 w-4 text-emerald-500" />,
      description: 'Success rate of closed signals'
    },
    {
      title: 'Average Profit',
      value: '3.2%',
      change: '+0.4% this month',
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
      description: 'Average profit per successful trade'
    },
    {
      title: 'Total Users',
      value: '1,245',
      change: '+85 this week',
      icon: <Users className="h-4 w-4 text-emerald-500" />,
      description: 'Users following these signals'
    }
  ];
  
  return (
    <>
      <Helmet>
        <title>Signal Performance | TradeHybrid</title>
      </Helmet>
      
      <div className="flex flex-col gap-6 p-6">
        <PageHeader
          title="Signal Performance"
          description="Track and analyze the performance of our trading signals in real-time"
          icon={<LineChart className="h-6 w-6" />}
        />
        
        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className="rounded-full p-1.5 bg-muted">
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <p className="mt-1 text-xs text-emerald-500">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Main Content - Signals Performance Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Signal Performance Dashboard</CardTitle>
              <CardDescription>
                View and filter trading signals. Click on a signal to view detailed performance metrics and animated charts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignalPerformanceGrid />
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Footnote */}
        <p className="text-center text-xs text-muted-foreground">
          Signal performance data is updated in real-time. Past performance is not indicative of future results.
        </p>
      </div>
    </>
  );
}