import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNftMarketplace } from '@/lib/stores/useNftMarketplace';
import { NftCard } from './nft-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight, ShoppingBag, TrendingUp, UserCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';

export function NftDashboardWidget() {
  const { 
    nfts, 
    featuredNfts, 
    userNfts, 
    loading, 
    fetchNfts, 
    fetchFeaturedNfts,
    fetchUserNfts
  } = useNftMarketplace();
  
  const isMobile = useIsMobile();
  
  useEffect(() => {
    fetchNfts();
    fetchFeaturedNfts();
    fetchUserNfts();
  }, [fetchNfts, fetchFeaturedNfts, fetchUserNfts]);
  
  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">NFT Marketplace</CardTitle>
          <CardDescription>
            Trade strategies, indicators, and assets with THC
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          Full Marketplace <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="featured" className="w-full">
          <div className="px-6">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="featured" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className={isMobile ? 'hidden' : 'inline'}>Featured</span>
              </TabsTrigger>
              <TabsTrigger value="my-nfts" className="flex items-center gap-1">
                <UserCircle className="h-4 w-4" />
                <span className={isMobile ? 'hidden' : 'inline'}>My NFTs</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center gap-1">
                <ShoppingBag className="h-4 w-4" />
                <span className={isMobile ? 'hidden' : 'inline'}>Marketplace</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="featured" className="pt-2 pb-4">
            <ScrollArea className="h-[420px]">
              <div className="px-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="h-64 animate-pulse">
                        <div className="h-32 bg-gray-200 dark:bg-gray-800"></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full mt-4"></div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    featuredNfts.map(nft => (
                      <NftCard key={nft.id} nft={nft} compact={true} />
                    ))
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" className="gap-1">
                    View All Featured <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="my-nfts" className="pt-2 pb-4">
            <ScrollArea className="h-[420px]">
              <div className="px-6 space-y-4">
                {userNfts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userNfts.map(nft => (
                      <NftCard key={nft.id} nft={nft} compact={true} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-10 pb-6">
                    <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No NFTs in your collection</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                      Start building your collection by purchasing strategies, indicators, or assets on the marketplace.
                    </p>
                    <Button>
                      Browse Marketplace
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="marketplace" className="pt-2 pb-4">
            <ScrollArea className="h-[420px]">
              <div className="px-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    Array(6).fill(0).map((_, i) => (
                      <Card key={i} className="h-64 animate-pulse">
                        <div className="h-32 bg-gray-200 dark:bg-gray-800"></div>
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full mt-4"></div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    nfts.map(nft => (
                      <NftCard key={nft.id} nft={nft} compact={true} />
                    ))
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" className="gap-1">
                    View All NFTs <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}