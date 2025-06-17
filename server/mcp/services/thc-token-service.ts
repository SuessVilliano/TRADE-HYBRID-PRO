/**
 * THC Token Service for the Trade Hybrid platform
 * 
 * This service provides specialized functionality for the Trade Hybrid Token (THC).
 * It integrates with the Solana Blockchain Service to fetch real token data.
 */

import { SolanaBlockchainService, TokenInfo } from './solana-blockchain-service';
import EventEmitter from 'events';

// THC Token holder information
export interface THCTokenHolder {
  address: string;
  amount: string;
  rank: number;
  percentage?: number; // Percentage of total supply
}

// THC Token statistics
export interface THCTokenStats {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  circulatingSupply: string;
  totalSupply: string;
  lastUpdated: Date;
}

// THC Token current staking information
export interface THCStakingInfo {
  totalStaked: string;
  percentageStaked: number;
  stakingAPY: number;
  validators: {
    address: string;
    commission: number;
    stake: string;
  }[];
  lastUpdated: Date;
}

/**
 * THC Token Service class
 */
export class THCTokenService extends EventEmitter {
  private solanaService: SolanaBlockchainService;
  private initialized: boolean = false;
  private thcTokenStats: THCTokenStats | null = null;
  private thcStakingInfo: THCStakingInfo | null = null;
  private static instance: THCTokenService;
  
  // THC Token address - hardcoded for Trade Hybrid
  private readonly THC_TOKEN_ADDRESS = '4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4';
  
  // THC Validator address - hardcoded for Trade Hybrid
  private readonly THC_VALIDATOR_ADDRESS = '5Mp3EF1donYxLxhe5hs6HoWpAucZGLZ76NKRNztkjEej';

  // Singleton pattern
  static getInstance(): THCTokenService {
    if (!THCTokenService.instance) {
      THCTokenService.instance = new THCTokenService();
    }
    return THCTokenService.instance;
  }

  private constructor() {
    super();
    
    // Get Solana blockchain service instance
    this.solanaService = SolanaBlockchainService.getInstance();
    
    // Subscribe to token price updates
    this.solanaService.on('tokenPriceUpdated', (data: { tokenAddress: string, price: number }) => {
      if (data.tokenAddress === this.THC_TOKEN_ADDRESS && this.thcTokenStats) {
        this.thcTokenStats.price = data.price;
        this.thcTokenStats.lastUpdated = new Date();
        
        // Emit price update event
        this.emit('thcPriceUpdated', data.price);
      }
    });
  }

  /**
   * Initialize the THC token service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      console.log('Initializing THC Token Service...');
      
      // Make sure Solana blockchain service is initialized
      await this.solanaService.initialize();
      
      // Fetch initial THC token information
      await this.updateTokenStats();
      
      // Fetch initial THC staking information
      await this.updateStakingInfo();
      
      this.initialized = true;
      console.log('THC Token Service initialized successfully');
      
      // Setup periodic updates
      this.setupPeriodicUpdates();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize THC Token Service:', error);
      return false;
    }
  }

  /**
   * Setup periodic updates for THC token data
   */
  private setupPeriodicUpdates() {
    // Update token stats every 15 minutes
    setInterval(() => {
      this.updateTokenStats().catch(err => {
        console.error('Error updating THC token stats:', err);
      });
    }, 15 * 60 * 1000);
    
    // Update staking info every hour
    setInterval(() => {
      this.updateStakingInfo().catch(err => {
        console.error('Error updating THC staking info:', err);
      });
    }, 60 * 60 * 1000);
  }

  /**
   * Update THC token statistics
   */
  private async updateTokenStats(): Promise<void> {
    try {
      // Get THC token info from Solana service
      const tokenInfo = await this.solanaService.getTHCTokenInfo();
      
      // Get top token holders
      const holders = await this.getTopHolders(10);
      
      // Create token stats object
      this.thcTokenStats = {
        price: tokenInfo.price || 0,
        priceChange24h: tokenInfo.priceChange24h || 0,
        marketCap: tokenInfo.marketCap || 0,
        volume24h: 0, // Solscan doesn't provide this directly
        holders: holders.length,
        circulatingSupply: tokenInfo.totalSupply || '0',
        totalSupply: tokenInfo.totalSupply || '0',
        lastUpdated: new Date()
      };
      
      // Emit updated stats event
      this.emit('tokenStatsUpdated', this.thcTokenStats);
      
    } catch (error) {
      console.error('Error updating THC token statistics:', error);
      throw error;
    }
  }

  /**
   * Update THC staking information
   */
  private async updateStakingInfo(): Promise<void> {
    try {
      // Get validator info from Solana service
      const validatorInfo = await this.solanaService.getValidatorInfo();
      
      // Get THC token info
      const tokenInfo = await this.solanaService.getTHCTokenInfo();
      
      // Calculate percentage staked (using validator's activated stake as an approximation)
      const totalSupply = Number(tokenInfo.totalSupply || '0');
      const totalStaked = validatorInfo.activatedStake.toString();
      const percentageStaked = totalSupply > 0 
        ? (validatorInfo.activatedStake / totalSupply) * 100 
        : 0;
      
      // Create staking info object
      this.thcStakingInfo = {
        totalStaked,
        percentageStaked,
        stakingAPY: 5.0, // Default APY value, could be calculated from validator rewards
        validators: [
          {
            address: this.THC_VALIDATOR_ADDRESS,
            commission: validatorInfo.commission,
            stake: totalStaked
          }
        ],
        lastUpdated: new Date()
      };
      
      // Emit updated staking info event
      this.emit('stakingInfoUpdated', this.thcStakingInfo);
      
    } catch (error) {
      console.error('Error updating THC staking information:', error);
      throw error;
    }
  }

  /**
   * Get THC token information
   */
  async getTokenInfo(): Promise<TokenInfo> {
    return await this.solanaService.getTHCTokenInfo();
  }

  /**
   * Get THC token statistics
   */
  async getTokenStats(): Promise<THCTokenStats> {
    if (!this.thcTokenStats) {
      await this.updateTokenStats();
    }
    
    if (!this.thcTokenStats) {
      throw new Error('Failed to get THC token statistics');
    }
    
    return this.thcTokenStats;
  }

  /**
   * Get THC staking information
   */
  async getStakingInfo(): Promise<THCStakingInfo> {
    if (!this.thcStakingInfo) {
      await this.updateStakingInfo();
    }
    
    if (!this.thcStakingInfo) {
      throw new Error('Failed to get THC staking information');
    }
    
    return this.thcStakingInfo;
  }

  /**
   * Get THC token balance for a wallet
   */
  async getBalance(walletAddress: string): Promise<string> {
    return await this.solanaService.getTHCTokenBalance(walletAddress);
  }

  /**
   * Get top THC token holders
   */
  async getTopHolders(limit: number = 10): Promise<THCTokenHolder[]> {
    try {
      const adapter = new (await import('../adapters/solscan-adapter')).SolscanAdapter();
      const holders = await adapter.getTHCTokenHolders(limit);
      
      if (!holders || !Array.isArray(holders)) {
        console.log('No valid holders data received');
        return [];
      }
      
      return holders.map(holder => ({
        address: holder.owner,
        amount: holder.amount,
        rank: holder.rank,
        percentage: 0 // Would calculate based on total supply
      }));
    } catch (error) {
      console.error('Error getting top THC token holders:', error);
      return [];
    }
  }

  /**
   * Get THC validator information
   */
  async getValidatorInfo() {
    return await this.solanaService.getValidatorInfo();
  }
}