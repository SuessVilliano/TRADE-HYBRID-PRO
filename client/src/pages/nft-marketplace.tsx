import React, { useEffect, useState } from 'react';
import { PopupContainer } from '../components/ui/popup-container';
import { useNFTMarketplace, NFT_CATEGORIES } from '../lib/stores/useNFTMarketplace';
import { useUserStore } from '../lib/stores/useUserStore';
import { formatCurrency } from '../lib/utils';
import NFTAssetCard from '../components/ui/nft-asset-card';
import THCBalanceDisplay from '../components/ui/thc-balance-display';
import { Button } from '../components/ui/button';

export default function NFTMarketplace() {
  // Store
  const { 
    assets, 
    collections,
    favorites, 
    cart, 
    filter, 
    isLoading, 
    fetchAssets,
    addToFavorites, 
    removeFromFavorites, 
    addToCart, 
    removeFromCart,
    setFilter,
    resetFilter
  } = useNFTMarketplace();
  
  // Local state
  const [activeTab, setActiveTab] = useState<'explore' | 'collections' | 'my-nfts'>('explore');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load assets on mount
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Filter assets based on current filter settings and category
  const filteredAssets = assets.filter(asset => {
    // Filter by category
    if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
      return false;
    }
    
    // Filter by search query
    if (
      searchQuery && 
      !asset.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !asset.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by price range
    if (asset.price < filter.minPrice || asset.price > filter.maxPrice) {
      return false;
    }
    
    // Filter by rarity
    if (filter.rarity.length > 0 && !filter.rarity.includes(asset.rarity)) {
      return false;
    }
    
    return true;
  });
  
  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (filter.sort) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Featured assets
  const featuredAssets = assets.filter(asset => asset.isFeatured);
  
  // Handle category click
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };
  
  // Handle asset selection
  const handleAssetSelect = (assetId: string) => {
    console.log('Selected asset:', assetId);
  };
  
  // Handle add/remove from favorites
  const toggleFavorite = (assetId: string) => {
    if (favorites.includes(assetId)) {
      removeFromFavorites(assetId);
    } else {
      addToFavorites(assetId);
    }
  };
  
  // Handle add/remove from cart
  const toggleCart = (assetId: string) => {
    if (cart.includes(assetId)) {
      removeFromCart(assetId);
    } else {
      addToCart(assetId);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">NFT Marketplace</h1>
          <p className="text-slate-300">
            Discover, collect, and trade unique digital assets
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <THCBalanceDisplay showLabel={true} />
          
          {cart.length > 0 && (
            <Button variant="outline" className="space-x-2">
              <span>Cart</span>
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs">
                {cart.length}
              </span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-8">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'explore' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400'}`}
          onClick={() => setActiveTab('explore')}
        >
          Explore
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'collections' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400'}`}
          onClick={() => setActiveTab('collections')}
        >
          Collections
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'my-nfts' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400'}`}
          onClick={() => setActiveTab('my-nfts')}
        >
          My NFTs
        </button>
      </div>
      
      {/* Featured Section */}
      {activeTab === 'explore' && featuredAssets.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Featured Assets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredAssets.map(asset => (
              <NFTAssetCard
                key={asset.id}
                asset={asset}
                isFavorited={favorites.includes(asset.id)}
                isInCart={cart.includes(asset.id)}
                onAddToFavorites={toggleFavorite}
                onAddToCart={toggleCart}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Categories */}
      {activeTab === 'explore' && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {NFT_CATEGORIES.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Search and filters */}
      {activeTab === 'explore' && (
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search by name or description..."
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filter.sort}
              onChange={(e) => setFilter({ sort: e.target.value as any })}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Assets Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {activeTab === 'explore' && 'All Assets'}
          {activeTab === 'collections' && 'Collections'}
          {activeTab === 'my-nfts' && 'My NFTs'}
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedAssets.map(asset => (
              <NFTAssetCard
                key={asset.id}
                asset={asset}
                isFavorited={favorites.includes(asset.id)}
                isInCart={cart.includes(asset.id)}
                onAddToFavorites={toggleFavorite}
                onAddToCart={toggleCart}
              />
            ))}
          </div>
        ) : (
          <PopupContainer className="py-12 text-center">
            <p className="text-slate-400">No assets found matching your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              resetFilter();
              setSelectedCategory('all');
              setSearchQuery('');
            }}>
              Reset Filters
            </Button>
          </PopupContainer>
        )}
      </div>
    </div>
  );
}