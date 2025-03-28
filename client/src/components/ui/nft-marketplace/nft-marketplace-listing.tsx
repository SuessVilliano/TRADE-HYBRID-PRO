import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, ShoppingCart, Star, ThumbsUp, Info, BarChart, Code, BookOpen } from 'lucide-react';
import { NFTItem } from '@/lib/stores/useNftMarketplace';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NftMarketplaceListingProps {
  nft: NFTItem;
}

export function NftMarketplaceListing({ nft }: NftMarketplaceListingProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-900 h-80 rounded-tl-lg rounded-tr-lg md:rounded-tr-none">
              {nft.imageUrl && (
                <img 
                  src={nft.imageUrl} 
                  alt={nft.name} 
                  className="w-full h-full object-cover rounded-tl-lg rounded-tr-lg md:rounded-tr-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
            
            <Badge 
              className="absolute top-3 right-3 bg-white/80 dark:bg-black/60 text-primary hover:bg-white/90 dark:hover:bg-black/70"
            >
              {nft.category.charAt(0).toUpperCase() + nft.category.slice(1)}
            </Badge>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center rounded-bl-lg md:rounded-bl-none">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={nft.authorAvatar} alt={nft.author} />
                <AvatarFallback>{nft.author.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{nft.author}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Creator</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="h-4 w-4 mr-1" />
                Follow
              </Button>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold">{nft.name}</h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <CalendarDays className="h-4 w-4 mr-1" />
                Created {new Date(nft.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
              <Star className="fill-yellow-500 h-4 w-4 mr-1" />
              <span className="font-medium">{nft.rating}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({nft.ratingCount})</span>
            </div>
          </div>
          
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details" className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                <span>Performance</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>Code</span>
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>Docs</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4">
              <ScrollArea className="h-48">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    {nft.description}
                  </p>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {nft.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Sales</h3>
                      <p className="text-gray-600 dark:text-gray-300">{nft.sold} sold</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Available</h3>
                      <p className="text-gray-600 dark:text-gray-300">{nft.available} copies</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {new Date(nft.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Category</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {nft.category.charAt(0).toUpperCase() + nft.category.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="performance" className="h-48 mt-4">
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Performance data will be available after purchase</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="h-48 mt-4">
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Code className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Source code will be available after purchase</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="docs" className="h-48 mt-4">
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Documentation will be available after purchase</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
              <div className="text-3xl font-bold text-primary">{nft.price} {nft.currency}</div>
            </div>
            <div className="space-x-2">
              <Button variant="outline">Preview</Button>
              <Button className="gap-1">
                <ShoppingCart className="h-4 w-4" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}