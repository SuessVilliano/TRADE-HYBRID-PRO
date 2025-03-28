import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, ThumbsUp } from 'lucide-react';
import { useNftMarketplace, NFTItem } from '@/lib/stores/useNftMarketplace';

interface NftCardProps {
  nft: NFTItem;
  compact?: boolean;
  className?: string;
}

export function NftCard({ nft, compact = false, className = '' }: NftCardProps) {
  const { addToCart } = useNftMarketplace();
  
  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="relative">
        {/* Use a placeholder if image doesn't exist */}
        <div className={`bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-900 ${compact ? 'h-32' : 'h-48'}`}>
          {nft.imageUrl && (
            <img 
              src={nft.imageUrl} 
              alt={nft.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, we'll let the gradient background show
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
        
        <Badge 
          className="absolute top-2 right-2 bg-white/80 dark:bg-black/60 text-primary hover:bg-white/90 dark:hover:bg-black/70"
        >
          {nft.category.charAt(0).toUpperCase() + nft.category.slice(1)}
        </Badge>
      </div>
      
      <CardHeader className={compact ? 'p-3' : 'p-4'}>
        <div className="flex justify-between items-start">
          <CardTitle className={`${compact ? 'text-sm' : 'text-lg'} line-clamp-1`}>{nft.name}</CardTitle>
          <div className="flex items-center text-yellow-500">
            <Star className="fill-yellow-500 h-4 w-4 mr-1" />
            <span className="text-xs font-medium">{nft.rating}</span>
          </div>
        </div>
        <div className="flex items-center mt-1">
          <Avatar className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} mr-2`}>
            <AvatarImage src={nft.authorAvatar} alt={nft.author} />
            <AvatarFallback>{nft.author.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardDescription className="text-xs line-clamp-1">by {nft.author}</CardDescription>
        </div>
      </CardHeader>
      
      {!compact && (
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{nft.description}</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {nft.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                {tag}
              </Badge>
            ))}
            {nft.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                +{nft.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      )}
      
      <CardFooter className={`bg-gray-50 dark:bg-gray-800/50 ${compact ? 'p-3' : 'p-4'} flex justify-between items-center`}>
        <div>
          <p className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-primary`}>
            {nft.price} {nft.currency}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {nft.sold} sold · {nft.available} available
          </p>
        </div>
        <Button 
          size={compact ? 'sm' : 'default'} 
          onClick={() => addToCart(nft.id)}
          className="gap-1"
        >
          <ShoppingCart className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          {compact ? '' : 'Buy'}
        </Button>
      </CardFooter>
    </Card>
  );
}