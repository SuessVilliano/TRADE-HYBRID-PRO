import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PopupContainer } from './popup-container';
import { formatPrice, truncateString } from '../../lib/utils';
import { NFTAsset } from '../../lib/stores/useNFTMarketplace';
import { Button } from './button';

interface NFTAssetCardProps {
  asset: NFTAsset;
  onAddToCart?: (assetId: string) => void;
  onAddToFavorites?: (assetId: string) => void;
  isFavorited?: boolean;
  isInCart?: boolean;
  size?: 'small' | 'medium' | 'large';
  showActions?: boolean;
}

export default function NFTAssetCard({
  asset,
  onAddToCart,
  onAddToFavorites,
  isFavorited = false,
  isInCart = false,
  size = 'medium',
  showActions = true,
}: NFTAssetCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/nft-marketplace/asset/${asset.id}`);
  };
  
  // Prevent click propagation when clicking buttons
  const handleActionClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation();
    if (callback) callback();
  };
  
  // Size-based classes
  const sizeClasses = {
    small: 'max-w-[200px]',
    medium: 'max-w-[280px]',
    large: 'max-w-[360px]',
  };
  
  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-slate-400';
      case 'uncommon':
        return 'text-green-400';
      case 'rare':
        return 'text-blue-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-amber-400';
      default:
        return 'text-slate-400';
    }
  };
  
  const rarityClass = getRarityColor(asset.rarity);
  
  return (
    <PopupContainer 
      className={`${sizeClasses[size]} cursor-pointer transition-transform hover:scale-[1.02] overflow-hidden flex flex-col`}
      padding={false}
      onClick={handleClick}
    >
      {/* Featured badge */}
      {asset.isFeatured && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full z-10">
          Featured
        </div>
      )}
      
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img 
          src={asset.image}
          alt={asset.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback for broken images
            (e.target as HTMLImageElement).src = '/images/nfts/placeholder.jpg';
          }}
        />
      </div>
      
      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{truncateString(asset.name, 18)}</h3>
          <span className={`text-xs rounded-full px-2 py-0.5 bg-opacity-20 bg-slate-500 ${rarityClass}`}>
            {asset.rarity.charAt(0).toUpperCase() + asset.rarity.slice(1)}
          </span>
        </div>
        
        <p className="text-slate-400 text-sm mb-3">{truncateString(asset.description, 60)}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400">Price</span>
            <span className="text-lg font-bold">{formatPrice(asset.price, { currency: 'THC' })}</span>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant={asset.listed ? "outline" : "default"}
                size="sm"
                className={`flex-1 ${isInCart ? 'bg-slate-700' : ''}`}
                onClick={(e) => handleActionClick(e, () => onAddToCart?.(asset.id))}
                disabled={!asset.listed}
              >
                {isInCart ? 'In Cart' : asset.listed ? 'Add to Cart' : 'Not Listed'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className={`w-10 ${isFavorited ? 'text-red-500' : ''}`}
                onClick={(e) => handleActionClick(e, () => onAddToFavorites?.(asset.id))}
              >
                ♥
              </Button>
            </div>
          )}
        </div>
      </div>
    </PopupContainer>
  );
}