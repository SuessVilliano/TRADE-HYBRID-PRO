import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface NFTItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: 'THC' | 'SOL';
  category: 'strategy' | 'indicator' | 'asset' | 'membership';
  author: string;
  authorAvatar: string;
  createdAt: string;
  updatedAt: string;
  sold: number;
  available: number;
  tags: string[];
  rating: number;
  ratingCount: number;
}

interface NFTMarketplaceState {
  nfts: NFTItem[];
  featuredNfts: NFTItem[];
  userNfts: NFTItem[];
  cart: { itemId: string; quantity: number }[];
  loading: boolean;
  error: string | null;
  
  fetchNfts: () => Promise<void>;
  fetchFeaturedNfts: () => Promise<void>;
  fetchUserNfts: () => Promise<void>;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

// Sample data for initial display
const sampleNfts: NFTItem[] = [
  {
    id: 'nft1',
    name: 'Moving Average Crossover Strategy',
    description: 'A battle-tested strategy using golden cross and death cross signals for reliable market entries and exits',
    imageUrl: '/nft/strategy-ma-crossover.png',
    price: 250,
    currency: 'THC',
    category: 'strategy',
    author: 'TradeMaster42',
    authorAvatar: '/avatars/trader1.png',
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2025-03-01T14:30:00Z',
    sold: 42,
    available: 100,
    tags: ['moving average', 'crossover', 'trend following'],
    rating: 4.7,
    ratingCount: 28
  },
  {
    id: 'nft2',
    name: 'Trade Hybrid Premium Membership',
    description: 'Exclusive access to premier trading signals, VIP events, and advanced AI analysis tools',
    imageUrl: '/nft/membership-premium.png',
    price: 1000,
    currency: 'THC',
    category: 'membership',
    author: 'Trade Hybrid',
    authorAvatar: '/logo.png',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-03-10T16:45:00Z',
    sold: 175,
    available: 500,
    tags: ['membership', 'premium', 'exclusive'],
    rating: 4.9,
    ratingCount: 112
  },
  {
    id: 'nft3',
    name: 'Advanced RSI Divergence Indicator',
    description: 'Spot hidden divergences with this proprietary indicator that offers early signals before major market moves',
    imageUrl: '/nft/indicator-rsi-divergence.png',
    price: 150,
    currency: 'THC',
    category: 'indicator',
    author: 'SignalPro',
    authorAvatar: '/avatars/trader3.png',
    createdAt: '2025-02-28T11:30:00Z',
    updatedAt: '2025-03-05T09:15:00Z',
    sold: 37,
    available: 200,
    tags: ['rsi', 'divergence', 'indicator', 'technical analysis'],
    rating: 4.6,
    ratingCount: 22
  },
  {
    id: 'nft4',
    name: 'Metaverse Trading Desk',
    description: 'Custom 3D trading desk asset for your Trade Hybrid metaverse office with multi-screen setup and AI assistant',
    imageUrl: '/nft/asset-trading-desk.png',
    price: 350,
    currency: 'THC',
    category: 'asset',
    author: 'MetaDesigner',
    authorAvatar: '/avatars/designer1.png',
    createdAt: '2025-03-01T15:20:00Z',
    updatedAt: '2025-03-12T10:10:00Z',
    sold: 15,
    available: 50,
    tags: ['metaverse', '3D asset', 'office', 'desk'],
    rating: 4.8,
    ratingCount: 9
  },
  {
    id: 'nft5',
    name: 'Harmonic Pattern Scanner',
    description: 'Automatically detect Gartley, Butterfly, Bat and Crab patterns with this advanced scanner',
    imageUrl: '/nft/indicator-harmonic.png',
    price: 400,
    currency: 'THC',
    category: 'indicator',
    author: 'PatternTrader',
    authorAvatar: '/avatars/trader5.png',
    createdAt: '2025-02-10T16:40:00Z',
    updatedAt: '2025-03-08T13:25:00Z',
    sold: 27,
    available: 75,
    tags: ['harmonic patterns', 'scanner', 'technical analysis'],
    rating: 4.5,
    ratingCount: 19
  }
];

export const useNftMarketplace = create<NFTMarketplaceState>()(
  devtools(
    persist(
      (set, get) => ({
        nfts: sampleNfts,
        featuredNfts: sampleNfts.slice(0, 3),
        userNfts: [],
        cart: [],
        loading: false,
        error: null,
        
        fetchNfts: async () => {
          try {
            set({ loading: true, error: null });
            // In a real implementation, this would be a fetch call to your API
            // const response = await fetch('/api/nfts');
            // const data = await response.json();
            
            // For demo purposes, we'll use the sample data and add a delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            set({ 
              nfts: sampleNfts,
              loading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch NFTs',
              loading: false 
            });
          }
        },
        
        fetchFeaturedNfts: async () => {
          try {
            set({ loading: true, error: null });
            // In a real implementation, this would fetch featured NFTs
            await new Promise(resolve => setTimeout(resolve, 600));
            
            set({ 
              featuredNfts: sampleNfts.filter(nft => nft.sold > 30),
              loading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch featured NFTs',
              loading: false 
            });
          }
        },
        
        fetchUserNfts: async () => {
          try {
            set({ loading: true, error: null });
            // In a real implementation, this would fetch the user's owned NFTs
            await new Promise(resolve => setTimeout(resolve, 700));
            
            // For demo, we'll return a subset of the sample NFTs as if owned by the user
            set({ 
              userNfts: [sampleNfts[1], sampleNfts[3]],
              loading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch user NFTs',
              loading: false 
            });
          }
        },
        
        addToCart: (itemId: string) => {
          const { cart } = get();
          const existingItem = cart.find(item => item.itemId === itemId);
          
          if (existingItem) {
            set({
              cart: cart.map(item => 
                item.itemId === itemId 
                  ? { ...item, quantity: item.quantity + 1 } 
                  : item
              )
            });
          } else {
            set({
              cart: [...cart, { itemId, quantity: 1 }]
            });
          }
        },
        
        removeFromCart: (itemId: string) => {
          const { cart } = get();
          set({
            cart: cart.filter(item => item.itemId !== itemId)
          });
        },
        
        clearCart: () => {
          set({ cart: [] });
        }
      }),
      {
        name: 'nft-marketplace-storage',
      }
    )
  )
);