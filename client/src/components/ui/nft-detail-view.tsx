import React, { useState } from 'react';
import { Button } from './button';
import { PopupContainer } from './popup-container';
import { formatCurrency, formatDate } from '../../lib/utils';
import { NFTAsset, useNFTMarketplace } from '../../lib/stores/useNFTMarketplace';
import { useUserStore } from '../../lib/stores/useUserStore';
import SellNFTModal from './sell-nft-modal';

interface NFTDetailViewProps {
  asset: NFTAsset;
  onClose: () => void;
}

const NFTDetailView: React.FC<NFTDetailViewProps> = ({ 
  asset,
  onClose
}) => {
  const [showSellModal, setShowSellModal] = useState(false);
  const { buyAsset, cancelListing } = useNFTMarketplace();
  const user = useUserStore(state => state.user);
  
  const isOwner = user?.id === asset.owner;
  const isLoggedIn = !!user;
  const canBuy = isLoggedIn && !isOwner && asset.isListed && (user?.balance.thc || 0) >= asset.price;
  
  // Get a color based on rarity
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-slate-400 text-white';
      case 'uncommon':
        return 'bg-green-500 text-white';
      case 'rare':
        return 'bg-blue-500 text-white';
      case 'epic':
        return 'bg-purple-500 text-white';
      case 'legendary':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-slate-400 text-white';
    }
  };
  
  // Handle buy click
  const handleBuy = async () => {
    if (!canBuy) return;
    
    const success = await buyAsset(asset.id);
    if (success) {
      // Notification or feedback here
      onClose();
    }
  };
  
  // Handle cancel listing
  const handleCancelListing = async () => {
    if (!isOwner || !asset.isListed) return;
    
    const success = await cancelListing(asset.id);
    if (success) {
      // Notification or feedback here
    }
  };
  
  // Open sell modal
  const handleSell = () => {
    setShowSellModal(true);
  };
  
  return (
    <>
      <PopupContainer 
        className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
        padding={true}
        rounded={true}
        border={true}
      >
        {/* Left Column - Image */}
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={asset.image}
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Rarity Badge */}
          <div className={`absolute top-4 right-4 ${getRarityColor(asset.attributes.rarity)} uppercase text-xs font-bold py-1 px-3 rounded-full`}>
            {asset.attributes.rarity}
          </div>
        </div>
        
        {/* Right Column - Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{asset.name}</h2>
            <p className="text-slate-300 mb-4">{asset.description}</p>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-slate-400">Category</p>
                <p>{asset.category}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-slate-400">Price</p>
                <p className="text-xl font-bold text-amber-300">
                  {formatCurrency(asset.price, 'THC')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-400">Creator</p>
                <p>{asset.creator}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Created</p>
                <p>{formatDate(asset.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Owner</p>
                <p>{asset.owner === 'marketplace' ? 'Marketplace' : asset.owner}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p>{asset.isListed ? 'For Sale' : 'Not Listed'}</p>
              </div>
            </div>
          </div>
          
          {/* Attributes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Attributes</h3>
            <div className="grid grid-cols-2 gap-2">
              {asset.attributes.type && (
                <div className="bg-slate-800 rounded-md p-2">
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="font-medium">{asset.attributes.type}</p>
                </div>
              )}
              
              {/* Render other attributes dynamically */}
              {Object.entries(asset.attributes).map(([key, value]) => {
                // Skip rarity and type as they're handled separately
                if (key === 'rarity' || key === 'type') return null;
                
                // Handle array values
                if (Array.isArray(value)) {
                  return (
                    <div key={key} className="bg-slate-800 rounded-md p-2">
                      <p className="text-xs text-slate-400">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                      <p className="font-medium">{value.slice(0, 3).join(', ')}{value.length > 3 ? '...' : ''}</p>
                    </div>
                  );
                }
                
                // Handle other values
                return (
                  <div key={key} className="bg-slate-800 rounded-md p-2">
                    <p className="text-xs text-slate-400">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-auto flex flex-col gap-3">
            {isOwner ? (
              <>
                {asset.isListed ? (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelListing}
                  >
                    Cancel Listing
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSell}
                  >
                    Sell Asset
                  </Button>
                )}
              </>
            ) : (
              <Button 
                onClick={handleBuy}
                disabled={!canBuy}
              >
                {!isLoggedIn 
                  ? 'Login to Buy' 
                  : (user.balance.thc < asset.price)
                  ? 'Insufficient THC Balance'
                  : 'Buy Now'
                }
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </PopupContainer>
      
      {/* Sell Modal */}
      {showSellModal && (
        <SellNFTModal 
          asset={asset}
          onClose={() => setShowSellModal(false)}
          onSuccess={onClose}
        />
      )}
    </>
  );
};

export default NFTDetailView;