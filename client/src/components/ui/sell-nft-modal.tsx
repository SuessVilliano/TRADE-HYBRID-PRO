import React, { useState } from 'react';
import { Button } from './button';
import { PopupContainer } from './popup-container';
import { formatCurrency } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { NFTAsset, useNFTMarketplace } from '../../lib/stores/useNFTMarketplace';

interface SellNFTModalProps {
  asset: NFTAsset;
  onClose: () => void;
  onSuccess?: () => void;
}

const SellNFTModal: React.FC<SellNFTModalProps> = ({
  asset,
  onClose,
  onSuccess
}) => {
  const [price, setPrice] = useState(asset.price.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { sellAsset } = useNFTMarketplace();
  
  // Handle price change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setPrice(value);
      setError(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price greater than 0');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const success = await sellAsset(asset.id, parseFloat(price));
      
      if (success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError('Failed to list asset for sale. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell NFT Asset</DialogTitle>
          <DialogDescription>
            Set a price to list your asset "{asset.name}" for sale on the marketplace.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={asset.image}
                alt={asset.name}
                className="h-full w-full object-cover"
              />
            </div>
            
            <div>
              <h3 className="font-semibold">{asset.name}</h3>
              <p className="text-sm text-slate-400">{asset.category}</p>
              <p className="text-xs text-slate-500">Rarity: {asset.attributes.rarity}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium">
              Listing Price (THC)
            </label>
            <div className="relative rounded-md">
              <input
                type="text"
                id="price"
                value={price}
                onChange={handlePriceChange}
                className="w-full rounded-md bg-slate-800 border border-slate-700 py-2 pl-3 pr-12 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
                disabled={isProcessing}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-slate-400">THC</span>
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
            
            <p className="text-sm text-slate-400 mt-1">
              Market average for {asset.category}: {formatCurrency(asset.price * 1.1, 'THC', 'en-US')}
            </p>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isProcessing || !price || parseFloat(price) <= 0}
              className="w-full sm:w-auto"
            >
              {isProcessing ? 'Processing...' : 'List for Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SellNFTModal;