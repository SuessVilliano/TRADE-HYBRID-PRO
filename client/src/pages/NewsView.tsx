import React, { Suspense } from 'react';
import { TradingDashboardLayout } from '@/components/ui/trading-dashboard-layout';

// Lazy load the news dashboard to prevent blocking rendering if there are any issues
const NewsDashboard = React.lazy(() => import('./news-dashboard'));

export default function NewsView() {
  return (
    <TradingDashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-300">Loading news dashboard...</p>
          </div>
        </div>
      }>
        <NewsDashboard />
      </Suspense>
    </TradingDashboardLayout>
  );
}