import { calculateTradingFee } from '../contracts/thc-token-info';
import { type PublicKey } from '@solana/web3.js';

// Define interfaces for NFT data
export interface NFTAttribute {
  name: string;
  value: string;
}

export interface NFTItem {
  id: string;
  name: string;
  creator: string;
  creatorWallet: string;
  ownerWallet: string;
  price: number;
  currency: 'THC' | 'SOL';
  imageUrl: string;
  category: string;
  description: string;
  attributes: NFTAttribute[];
  listed: boolean;
  createdAt: Date;
  tokenId?: string; // For when it's minted on-chain
  mintAddress?: string; // Solana mint address
  tokenUri?: string;
  verified: boolean;
  strategy?: {
    code?: string;
    backtestResults?: {
      winRate: number;
      totalTrades: number;
      profitFactor: number;
      averageWin: number;
      averageLoss: number;
      maxDrawdown: number;
    }
  };
}

// Class for NFT operations
export class NFTService {
  private static instance: NFTService;
  private nfts: NFTItem[] = [];
  private userWallet: string | null = null;
  private thcBalance: number = 0;

  private constructor() {
    // Initialize with sample data
    this.loadSampleNFTs();
  }

  public static getInstance(): NFTService {
    if (!NFTService.instance) {
      NFTService.instance = new NFTService();
    }
    return NFTService.instance;
  }

  // Set user wallet address
  public setUserWallet(walletAddress: string | null | undefined): void {
    this.userWallet = walletAddress || null;
  }
  
  // Get user wallet address
  public getUserWallet(): string | null {
    return this.userWallet;
  }

  // Set THC balance for fee calculations
  public setThcBalance(balance: number): void {
    this.thcBalance = balance;
  }

  // Get all NFTs
  public getAllNFTs(): NFTItem[] {
    return [...this.nfts];
  }

  // Get NFTs owned by the current user
  public getMyNFTs(): NFTItem[] {
    if (!this.userWallet) return [];
    return this.nfts.filter(nft => nft.ownerWallet === this.userWallet);
  }

  // Get NFTs created by the current user
  public getCreatedNFTs(): NFTItem[] {
    if (!this.userWallet) return [];
    return this.nfts.filter(nft => nft.creatorWallet === this.userWallet);
  }

  // Get NFTs listed for sale
  public getListedNFTs(): NFTItem[] {
    return this.nfts.filter(nft => nft.listed);
  }

  // Get NFT by ID
  public getNFTById(id: string): NFTItem | undefined {
    return this.nfts.find(nft => nft.id === id);
  }

  // Filter NFTs by criteria
  public filterNFTs(options: {
    searchTerm?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    creator?: string;
    listedOnly?: boolean;
    verifiedOnly?: boolean;
  }): NFTItem[] {
    return this.nfts.filter(nft => {
      // Filter by search term
      if (options.searchTerm && 
          !nft.name.toLowerCase().includes(options.searchTerm.toLowerCase()) &&
          !nft.description.toLowerCase().includes(options.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (options.category && options.category !== 'all' && 
          nft.category.toLowerCase() !== options.category.toLowerCase()) {
        return false;
      }
      
      // Filter by price range
      if (options.minPrice !== undefined && nft.price < options.minPrice) {
        return false;
      }
      if (options.maxPrice !== undefined && nft.price > options.maxPrice) {
        return false;
      }
      
      // Filter by creator
      if (options.creator && nft.creatorWallet !== options.creator) {
        return false;
      }
      
      // Filter by listing status
      if (options.listedOnly && !nft.listed) {
        return false;
      }
      
      // Filter by verification
      if (options.verifiedOnly && !nft.verified) {
        return false;
      }
      
      return true;
    });
  }

  // Create a new NFT
  public async createNFT(nftData: {
    name: string;
    category: string;
    description: string;
    price: number;
    imageFile: File;
    attributes: NFTAttribute[];
    strategyCode?: string;
    backtestResults?: {
      winRate: number;
      totalTrades: number;
      profitFactor: number;
      averageWin: number;
      averageLoss: number;
      maxDrawdown: number;
    }
  }): Promise<NFTItem> {
    if (!this.userWallet) {
      throw new Error('User wallet not connected');
    }
    
    // Calculate fee based on THC balance
    const baseFeePercent = 2.5; // 2.5% base fee for NFT creation
    const calculatedFee = nftData.price * (baseFeePercent - calculateTradingFee(100, this.thcBalance)) / 100;
    
    // In a real implementation, we would:
    // 1. Upload image to IPFS or other storage
    // 2. Mint the NFT on Solana
    // 3. Store metadata on-chain or IPFS
    
    // For this demo, we'll simulate these steps with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a blob URL for the image (in production this would be IPFS)
    const imageUrl = URL.createObjectURL(nftData.imageFile);
    
    // Generate a unique ID
    const id = `nft_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const newNFT: NFTItem = {
      id,
      name: nftData.name,
      creator: `User_${this.userWallet.substring(0, 6)}`,
      creatorWallet: this.userWallet,
      ownerWallet: this.userWallet,
      price: nftData.price,
      currency: 'THC',
      imageUrl,
      category: nftData.category,
      description: nftData.description,
      attributes: nftData.attributes,
      listed: true,
      createdAt: new Date(),
      verified: false, // New NFTs start unverified
      strategy: nftData.strategyCode ? {
        code: nftData.strategyCode,
        backtestResults: nftData.backtestResults
      } : undefined
    };
    
    // Add to collection
    this.nfts.push(newNFT);
    
    return newNFT;
  }

  // List/unlist an NFT for sale
  public toggleListNFT(id: string, listed: boolean): NFTItem | undefined {
    const nftIndex = this.nfts.findIndex(nft => nft.id === id);
    if (nftIndex === -1) return undefined;
    
    // Check ownership
    if (this.userWallet !== this.nfts[nftIndex].ownerWallet) {
      throw new Error('You do not own this NFT');
    }
    
    // Update listing status
    this.nfts[nftIndex] = {
      ...this.nfts[nftIndex],
      listed
    };
    
    return this.nfts[nftIndex];
  }

  // Update NFT price
  public updateNFTPrice(id: string, price: number): NFTItem | undefined {
    const nftIndex = this.nfts.findIndex(nft => nft.id === id);
    if (nftIndex === -1) return undefined;
    
    // Check ownership
    if (this.userWallet !== this.nfts[nftIndex].ownerWallet) {
      throw new Error('You do not own this NFT');
    }
    
    // Update price
    this.nfts[nftIndex] = {
      ...this.nfts[nftIndex],
      price
    };
    
    return this.nfts[nftIndex];
  }

  // Purchase an NFT
  public async purchaseNFT(id: string): Promise<NFTItem | undefined> {
    const nftIndex = this.nfts.findIndex(nft => nft.id === id);
    if (nftIndex === -1) return undefined;
    
    const nft = this.nfts[nftIndex];
    
    // Check if NFT is listed
    if (!nft.listed) {
      throw new Error('This NFT is not listed for sale');
    }
    
    // Check if user is trying to buy their own NFT
    if (this.userWallet === nft.ownerWallet) {
      throw new Error('You already own this NFT');
    }
    
    // In a real implementation, we would perform the blockchain transaction here
    // For this demo, we'll simulate the purchase with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update ownership
    this.nfts[nftIndex] = {
      ...nft,
      ownerWallet: this.userWallet || '',
      listed: false // Automatically unlist after purchase
    };
    
    return this.nfts[nftIndex];
  }

  // Load sample NFTs for demonstration
  private loadSampleNFTs(): void {
    const creationDate = new Date();
    creationDate.setMonth(creationDate.getMonth() - 1); // Created a month ago
    
    this.nfts = [
      {
        id: 'nft_001',
        name: 'Advanced Breakout Strategy',
        creator: 'TradingMaster',
        creatorWallet: '0x1234567890abcdef1234567890abcdef12345678',
        ownerWallet: '0x1234567890abcdef1234567890abcdef12345678',
        price: 0.25,
        currency: 'THC',
        imageUrl: 'https://via.placeholder.com/300x300.png?text=Trading+Strategy',
        category: 'Strategy',
        description: 'A proven breakout strategy for cryptocurrency markets with over 70% win rate.',
        attributes: [
          { name: 'Success Rate', value: '76%' },
          { name: 'Time Frame', value: '4h' },
          { name: 'Markets', value: 'Crypto' },
          { name: 'Backtested', value: 'Yes' }
        ],
        listed: true,
        createdAt: creationDate,
        verified: true,
        strategy: {
          backtestResults: {
            winRate: 76,
            totalTrades: 120,
            profitFactor: 2.3,
            averageWin: 3.5,
            averageLoss: 1.2,
            maxDrawdown: 12.5
          }
        }
      },
      {
        id: 'nft_002',
        name: 'Trade Hybrid Membership',
        creator: 'TH Official',
        creatorWallet: '0x2345678901abcdef2345678901abcdef23456789',
        ownerWallet: '0x2345678901abcdef2345678901abcdef23456789',
        price: 2.5,
        currency: 'THC',
        imageUrl: 'https://via.placeholder.com/300x300.png?text=TH+Membership',
        category: 'Membership',
        description: 'Premium membership NFT giving access to exclusive trading groups and signals.',
        attributes: [
          { name: 'Duration', value: 'Lifetime' },
          { name: 'Priority Support', value: 'Yes' },
          { name: 'Trading Signals', value: 'Included' },
          { name: 'Group Access', value: 'VIP' }
        ],
        listed: true,
        createdAt: creationDate,
        verified: true
      },
      {
        id: 'nft_003',
        name: 'Metaverse Trading Floor',
        creator: 'MetaBuilder',
        creatorWallet: '0x3456789012abcdef3456789012abcdef34567890',
        ownerWallet: '0x3456789012abcdef3456789012abcdef34567890',
        price: 5.0,
        currency: 'THC',
        imageUrl: 'https://via.placeholder.com/300x300.png?text=Trading+Floor',
        category: 'Virtual Real Estate',
        description: 'Own a premium space on the Trade Hybrid metaverse for hosting trading events.',
        attributes: [
          { name: 'Size', value: 'Large' },
          { name: 'Location', value: 'Central' },
          { name: 'Customizable', value: 'Yes' },
          { name: 'Capacity', value: '25 avatars' }
        ],
        listed: true,
        createdAt: creationDate,
        verified: true
      },
      {
        id: 'nft_004',
        name: 'Elite Trader Avatar',
        creator: 'AvatarArtist',
        creatorWallet: '0x4567890123abcdef4567890123abcdef45678901',
        ownerWallet: '0x4567890123abcdef4567890123abcdef45678901',
        price: 0.8,
        currency: 'THC',
        imageUrl: 'https://via.placeholder.com/300x300.png?text=Trader+Avatar',
        category: 'Avatar',
        description: 'Unique avatar with special abilities in the Trade Hybrid metaverse.',
        attributes: [
          { name: 'Rarity', value: 'Epic' },
          { name: 'Special Abilities', value: '3' },
          { name: 'Customizable', value: 'Yes' },
          { name: 'Badge', value: 'Pro Trader' }
        ],
        listed: true,
        createdAt: creationDate,
        verified: true
      },
      {
        id: 'nft_005',
        name: 'Trend-Following Strategy Bundle',
        creator: 'AlgoTrader',
        creatorWallet: '0x5678901234abcdef5678901234abcdef56789012',
        ownerWallet: '0x5678901234abcdef5678901234abcdef56789012',
        price: 1.75,
        currency: 'THC',
        imageUrl: 'https://via.placeholder.com/300x300.png?text=Strategy+Bundle',
        category: 'Strategy',
        description: 'A collection of 5 proven trend-following strategies for futures markets.',
        attributes: [
          { name: 'Strategies', value: '5' },
          { name: 'Time Frames', value: 'Multiple' },
          { name: 'Markets', value: 'Futures' },
          { name: 'Documentation', value: 'Included' }
        ],
        listed: true,
        createdAt: creationDate,
        verified: true,
        strategy: {
          backtestResults: {
            winRate: 68,
            totalTrades: 250,
            profitFactor: 1.9,
            averageWin: 2.8,
            averageLoss: 1.5,
            maxDrawdown: 18.2
          }
        }
      },
      {
        id: 'nft_006',
        name: 'Custom Indicator Pack',
        creator: 'IndicatorWizard',
        creatorWallet: '0x6789012345abcdef6789012345abcdef67890123',
        ownerWallet: '0x6789012345abcdef6789012345abcdef67890123',
        price: 0.5,
        currency: 'THC',
        imageUrl: 'https://via.placeholder.com/300x300.png?text=Indicator+Pack',
        category: 'Indicator',
        description: 'A set of 10 custom indicators for market analysis and trade entry/exit.',
        attributes: [
          { name: 'Indicators', value: '10' },
          { name: 'Platforms', value: 'Multiple' },
          { name: 'Installation Guide', value: 'Yes' },
          { name: 'Updates', value: 'Free for 1 year' }
        ],
        listed: true,
        createdAt: creationDate,
        verified: true
      }
    ];
  }
}

// Export singleton instance
export const nftService = NFTService.getInstance();