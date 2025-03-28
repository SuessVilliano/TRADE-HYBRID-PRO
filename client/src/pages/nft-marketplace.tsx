import React from 'react';
import { NftMarketplaceDashboard } from '@/components/ui/nft-marketplace';
import { useEffect } from 'react';
import { useNftMarketplace } from '@/lib/stores/useNftMarketplace';

export default function NftMarketplacePage() {
  const { fetchNfts, fetchFeaturedNfts, fetchUserNfts } = useNftMarketplace();
  
  useEffect(() => {
    // Load NFT data when the page loads
    fetchNfts();
    fetchFeaturedNfts();
    fetchUserNfts();
  }, [fetchNfts, fetchFeaturedNfts, fetchUserNfts]);
  
  return (
    <div className="min-h-screen bg-background">
      <NftMarketplaceDashboard />
    </div>
  );
}