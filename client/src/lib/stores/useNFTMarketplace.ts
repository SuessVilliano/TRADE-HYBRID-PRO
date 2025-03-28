import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NFT_CONFIG } from '../constants';
import { generateId } from '../utils';

// NFT categories for organizing the marketplace
export const NFT_CATEGORIES = [
  'all',
  'traders',
  'buildings',
  'accessories',
  'art',
  'collectibles',
];

// NFT rarity levels
export type NFTRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Structure of an NFT asset
export interface NFTAsset {
  id: string;
  name: string;
  description: string;
  image: string;
  creator: string;
  owner: string;
  price: number;
  currency: 'THC'; // Using THC as the default currency for NFTs
  listed: boolean;
  createdAt: Date;
  lastSold?: {
    price: number;
    date: Date;
    from: string;
    to: string;
  };
  category: string;
  attributes: {
    name: string;
    value: string | number;
    trait_type?: string;
  }[];
  rarity: NFTRarity;
  collectionId?: string;
  isFeatured: boolean;
}

// Store interface
interface NFTMarketplaceState {
  assets: NFTAsset[];
  collections: {
    id: string;
    name: string;
    description: string;
    creator: string;
    banner: string;
    logo: string;
    items: string[]; // NFT IDs that belong to this collection
    createdAt: Date;
    verified: boolean;
    floorPrice: number;
    totalVolume: number;
  }[];
  favorites: string[]; // IDs of favorited NFTs
  cart: string[]; // IDs of NFTs in the cart
  filter: {
    category: string;
    minPrice: number;
    maxPrice: number;
    rarity: NFTRarity[];
    searchQuery: string;
    creator: string;
    sort: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAssets: () => Promise<void>;
  addToFavorites: (assetId: string) => void;
  removeFromFavorites: (assetId: string) => void;
  addToCart: (assetId: string) => void;
  removeFromCart: (assetId: string) => void;
  clearCart: () => void;
  listAsset: (asset: Omit<NFTAsset, 'id' | 'createdAt' | 'listed'>) => Promise<string>;
  updateAsset: (assetId: string, data: Partial<NFTAsset>) => Promise<void>;
  buyAsset: (assetId: string, price: number) => Promise<void>;
  setFilter: (filter: Partial<NFTMarketplaceState['filter']>) => void;
  resetFilter: () => void;
}

// Sample NFT assets for development
const sampleAssets: NFTAsset[] = [
  {
    id: 'nft-1',
    name: 'TradeMaster Pro',
    description: 'Exclusive trader avatar with enhanced trading abilities and special access to premium zones',
    image: '/images/nfts/trader-pro.jpg',
    creator: 'TradeHybrid Studios',
    owner: '0x1234...5678',
    price: 500,
    currency: 'THC',
    listed: true,
    createdAt: new Date('2025-01-15'),
    category: 'traders',
    attributes: [
      { name: 'Rarity', value: 'Legendary', trait_type: 'Rarity' },
      { name: 'Trading Bonus', value: '+15%', trait_type: 'Boost' },
      { name: 'Unlocks', value: 'VIP Zones', trait_type: 'Access' },
    ],
    rarity: 'legendary',
    isFeatured: true,
  },
  {
    id: 'nft-2',
    name: 'Luxury Trading Tower',
    description: 'A prestigious skyscraper in the metaverse financial district with premium amenities',
    image: '/images/nfts/luxury-tower.jpg',
    creator: 'MetaArchitects',
    owner: '0xabcd...ef12',
    price: 1200,
    currency: 'THC',
    listed: true,
    createdAt: new Date('2025-02-10'),
    category: 'buildings',
    attributes: [
      { name: 'Floors', value: 50, trait_type: 'Size' },
      { name: 'Views', value: 'Panoramic', trait_type: 'Feature' },
      { name: 'Private Trading Room', value: 'Yes', trait_type: 'Amenity' },
    ],
    rarity: 'epic',
    isFeatured: true,
  },
  {
    id: 'nft-3',
    name: 'Diamond Hands Trophy',
    description: 'Show off your trading resilience with this exclusive collectible',
    image: '/images/nfts/diamond-hands.jpg',
    creator: 'CryptoArtist',
    owner: '0x7890...1234',
    price: 150,
    currency: 'THC',
    listed: true,
    createdAt: new Date('2025-03-05'),
    category: 'collectibles',
    attributes: [
      { name: 'Material', value: 'Digital Diamond', trait_type: 'Material' },
      { name: 'Edition', value: 'Limited', trait_type: 'Series' },
      { name: 'Glow Effect', value: 'Yes', trait_type: 'Visual' },
    ],
    rarity: 'rare',
    isFeatured: false,
  },
  {
    id: 'nft-4',
    name: 'Bull Market Canvas',
    description: 'Digital artwork celebrating the excitement of bull markets',
    image: '/images/nfts/bull-market-art.jpg',
    creator: 'FinanceArtist',
    owner: '0xdefg...5678',
    price: 300,
    currency: 'THC',
    listed: true,
    createdAt: new Date('2025-03-12'),
    category: 'art',
    attributes: [
      { name: 'Style', value: 'Abstract Digital', trait_type: 'Art Style' },
      { name: 'Colors', value: 'Vibrant Green', trait_type: 'Palette' },
      { name: 'Motion', value: 'Animated', trait_type: 'Type' },
    ],
    rarity: 'uncommon',
    isFeatured: false,
  },
  {
    id: 'nft-5',
    name: 'Lucky Trading Hat',
    description: 'A digital wearable that brings luck to your trades',
    image: '/images/nfts/lucky-hat.jpg',
    creator: 'MetaFashion',
    owner: '0xhijk...9012',
    price: 100,
    currency: 'THC',
    listed: true,
    createdAt: new Date('2025-03-20'),
    category: 'accessories',
    attributes: [
      { name: 'Luck Boost', value: '+5%', trait_type: 'Boost' },
      { name: 'Style', value: 'Fedora', trait_type: 'Type' },
      { name: 'Color', value: 'Green', trait_type: 'Appearance' },
    ],
    rarity: 'common',
    isFeatured: false,
  },
];

// Sample collections
const sampleCollections = [
  {
    id: 'collection-1',
    name: 'TradeHybrid Essentials',
    description: 'The official collection from TradeHybrid featuring premium digital assets',
    creator: 'TradeHybrid Studios',
    banner: '/images/collections/th-essentials-banner.jpg',
    logo: '/images/collections/th-essentials-logo.png',
    items: ['nft-1', 'nft-3'],
    createdAt: new Date('2025-01-10'),
    verified: true,
    floorPrice: 150,
    totalVolume: 15000,
  },
  {
    id: 'collection-2',
    name: 'MetaArchitects Structures',
    description: 'Luxurious and functional buildings for the virtual financial world',
    creator: 'MetaArchitects',
    banner: '/images/collections/meta-architects-banner.jpg',
    logo: '/images/collections/meta-architects-logo.png',
    items: ['nft-2'],
    createdAt: new Date('2025-02-05'),
    verified: true,
    floorPrice: 1200,
    totalVolume: 28000,
  },
];

// Default filter values
const defaultFilter = {
  category: 'all',
  minPrice: 0,
  maxPrice: 10000,
  rarity: ['common', 'uncommon', 'rare', 'epic', 'legendary'] as NFTRarity[],
  searchQuery: '',
  creator: '',
  sort: 'newest' as const,
};

// Create the store
export const useNFTMarketplace = create<NFTMarketplaceState>()(
  persist(
    (set, get) => ({
      assets: sampleAssets,
      collections: sampleCollections,
      favorites: [],
      cart: [],
      filter: { ...defaultFilter },
      isLoading: false,
      error: null,
      
      fetchAssets: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would fetch from an API here
          // For development, we'll just simulate a delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Return the sample data
          set({ assets: sampleAssets, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      addToFavorites: (assetId: string) => {
        const favorites = get().favorites;
        if (!favorites.includes(assetId)) {
          set({ favorites: [...favorites, assetId] });
        }
      },
      
      removeFromFavorites: (assetId: string) => {
        const favorites = get().favorites;
        set({ favorites: favorites.filter(id => id !== assetId) });
      },
      
      addToCart: (assetId: string) => {
        const cart = get().cart;
        if (!cart.includes(assetId)) {
          set({ cart: [...cart, assetId] });
        }
      },
      
      removeFromCart: (assetId: string) => {
        const cart = get().cart;
        set({ cart: cart.filter(id => id !== assetId) });
      },
      
      clearCart: () => {
        set({ cart: [] });
      },
      
      listAsset: async (asset) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would call an API here
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate a new asset with the provided data
          const newAsset: NFTAsset = {
            ...asset,
            id: generateId('nft-'),
            createdAt: new Date(),
            listed: true,
          };
          
          // Add the new asset to the store
          set(state => ({ 
            assets: [...state.assets, newAsset],
            isLoading: false,
          }));
          
          return newAsset.id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return '';
        }
      },
      
      updateAsset: async (assetId, data) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would call an API here
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update the asset in the store
          set(state => ({ 
            assets: state.assets.map(asset => 
              asset.id === assetId ? { ...asset, ...data } : asset
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      buyAsset: async (assetId, price) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would call an API here
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulate buying the asset by updating its owner and listed status
          const currentUser = 'current-user-address'; // In a real app, we would get this from user authentication
          
          set(state => ({
            assets: state.assets.map(asset => 
              asset.id === assetId 
                ? { 
                    ...asset, 
                    owner: currentUser, 
                    listed: false,
                    lastSold: {
                      price,
                      date: new Date(),
                      from: asset.owner,
                      to: currentUser,
                    },
                  } 
                : asset
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      setFilter: (filter) => {
        set(state => ({ filter: { ...state.filter, ...filter } }));
      },
      
      resetFilter: () => {
        set({ filter: { ...defaultFilter } });
      },
    }),
    {
      name: 'nft-marketplace-storage',
      partialize: (state) => ({ 
        favorites: state.favorites,
        cart: state.cart,
        filter: state.filter,
      }),
    }
  )
);