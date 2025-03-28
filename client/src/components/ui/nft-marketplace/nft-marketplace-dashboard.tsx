import React from 'react';
import { NftDashboardWidget } from './nft-dashboard-widget';
import { NftStatsWidget } from './nft-stats-widget';
import { ThcPriceWidget } from './thc-price-widget';
import { useIsMobile } from '@/hooks/use-is-mobile';

export function NftMarketplaceDashboard() {
  const isMobile = useIsMobile();
  
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">NFT Marketplace Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main marketplace widget - larger on desktop, full width on mobile */}
        <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
          <NftDashboardWidget />
        </div>
        
        {/* Right column widgets - stack on mobile */}
        <div className={isMobile ? 'col-span-1 space-y-6' : 'col-span-1 space-y-6'}>
          <ThcPriceWidget />
          <NftStatsWidget />
        </div>
      </div>
    </div>
  );
}