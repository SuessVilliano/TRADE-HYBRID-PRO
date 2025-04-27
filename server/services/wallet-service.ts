import { db } from '../db';
import { users } from '../../shared/schema';
import { wallets, transactions, nfts, staking, tokenPrices } from '../../shared/wallet-schema';
import { eq, and, desc } from 'drizzle-orm';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fetch from 'node-fetch';

/**
 * Wallet Service
 * 
 * This service handles wallet integration, token tracking, and NFT management.
 * It provides a centralized way to interact with on-chain data for user wallets.
 */
class WalletService {
  private rpcUrl: string;
  private connection: Connection;
  private THC_TOKEN_ADDRESS = '4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4';
  private THC_VALIDATOR_ADDRESS = '5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej';
  
  constructor() {
    // Initialize Solana connection using RPC URL from environment
    this.rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(this.rpcUrl, 'confirmed');
    
    console.log('Wallet service initialized with RPC URL:', this.rpcUrl);
  }
  
  /**
   * Get wallet data for a user
   */
  async getWalletData(userId: number): Promise<any> {
    try {
      // Get user from database
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user || !user.walletAddress) {
        return {
          walletConnected: false,
          message: 'No wallet connected'
        };
      }
      
      // Get wallet data from database
      const wallet = await db.query.wallets.findFirst({
        where: eq(wallets.address, user.walletAddress)
      });
      
      // If wallet exists in database, return cached data along with on-chain data
      if (wallet) {
        // Get transactions for this wallet
        const walletTransactions = await db.query.transactions.findMany({
          where: eq(transactions.walletId, wallet.id),
          orderBy: [desc(transactions.timestamp)],
          limit: 10
        });
        
        // Get NFTs for this wallet
        const walletNfts = await db.query.nfts.findMany({
          where: eq(nfts.walletId, wallet.id)
        });

        // Get staking information
        const stakingInfo = await db.query.staking.findFirst({
          where: and(
            eq(staking.walletId, wallet.id),
            eq(staking.status, 'active')
          )
        });
        
        // Include both cached and fresh data
        return {
          walletConnected: true,
          address: user.walletAddress,
          provider: wallet.provider || 'unknown',
          cachedBalanceUsd: wallet.balanceUsd,
          cachedSolBalance: wallet.solBalance,
          cachedThcBalance: wallet.thcBalance,
          cachedTokens: wallet.tokens || [],
          cachedNfts: walletNfts,
          cachedTransactions: walletTransactions,
          isStaking: wallet.isStaking,
          stakedAmount: wallet.stakedAmount,
          stakedSince: wallet.stakedSince,
          stakingInfo: stakingInfo,
          lastUpdated: wallet.updatedAt,
          ...(await this.fetchOnChainWalletData(user.walletAddress))
        };
      }
      
      // If wallet doesn't exist in database, fetch on-chain data
      const onChainData = await this.fetchOnChainWalletData(user.walletAddress);
      
      // Create wallet record in database
      const [newWallet] = await db.insert(wallets).values({
        userId,
        address: user.walletAddress,
        provider: 'unknown', // Will be updated when user connects wallet
        balanceUsd: onChainData.balance || 0,
        solBalance: onChainData.solBalance || 0,
        thcBalance: onChainData.thcTokenHolding || 0,
        tokens: onChainData.tokens || [],
        isStaking: onChainData.isStaking || false,
        stakedAmount: onChainData.stakedAmount || 0,
        stakedSince: onChainData.stakedSince,
        lastRefreshed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      // Store NFTs if any
      if (onChainData.nfts && onChainData.nfts.length > 0) {
        for (const nft of onChainData.nfts) {
          await db.insert(nfts).values({
            walletId: newWallet.id,
            tokenAddress: nft.tokenAddress,
            mintAddress: nft.mintAddress,
            name: nft.name,
            symbol: nft.symbol,
            image: nft.image,
            metadata: nft.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      return {
        walletConnected: true,
        address: user.walletAddress,
        provider: user.walletProvider || 'unknown',
        ...onChainData
      };
    } catch (error) {
      console.error('Error getting wallet data:', error);
      throw error;
    }
  }
  
  /**
   * Fetch on-chain data for a wallet
   */
  async fetchOnChainWalletData(walletAddress: string): Promise<any> {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Fetch SOL balance
      const solBalance = await this.connection.getBalance(publicKey) / 1e9; // Convert lamports to SOL
      
      // Check for THC token holdings and stake status
      const thcData = await this.fetchTHCTokenData(walletAddress);
      
      // Fetch all token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );
      
      // Format token data
      const tokens = tokenAccounts.value.map(account => {
        const {mint, tokenAmount} = account.account.data.parsed.info;
        return {
          mint,
          address: account.pubkey.toString(),
          amount: tokenAmount.uiAmount,
          decimals: tokenAmount.decimals,
          isTHC: mint === this.THC_TOKEN_ADDRESS
        };
      });
      
      // Attempt to get NFTs (this is a simplified version - real implementation would use Metaplex)
      // We'd need to filter token accounts for those with amount=1 and then fetch metadata
      const nfts = [];
      
      return {
        solBalance,
        balance: solBalance, // Overall balance in USD would need price feed
        tokens,
        nfts,
        isStaking: thcData.isStaking,
        stakedAmount: thcData.stakedAmount,
        stakedSince: thcData.stakedSince,
        validatorCommission: 0.01, // 1%
        thcTokenHolding: thcData.tokenAmount,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching on-chain wallet data:', error);
      // Return minimal data in case of error
      return {
        solBalance: 0,
        balance: 0,
        tokens: [],
        nfts: [],
        isStaking: false,
        stakedAmount: 0,
        timestamp: new Date()
      };
    }
  }
  
  /**
   * Fetch THC token data for a wallet
   */
  async fetchTHCTokenData(walletAddress: string): Promise<any> {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Find token account for THC token
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: new PublicKey(this.THC_TOKEN_ADDRESS) }
      );
      
      let tokenAmount = 0;
      
      if (tokenAccounts.value.length > 0) {
        const tokenAccount = tokenAccounts.value[0];
        tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount || 0;
      }
      
      // Check if staking (simplified check - would need to query the staking program)
      // In a real implementation, we would query the staking program to check if this
      // wallet has any active stakes on the validator
      
      // Placeholder for stake data
      const isStaking = false; // Would need real stake program query
      const stakedAmount = 0;   // Would need real stake program query
      const stakedSince = null; // Would need real stake program query
      
      return {
        tokenAmount,
        isStaking,
        stakedAmount,
        stakedSince
      };
    } catch (error) {
      console.error('Error fetching THC token data:', error);
      return {
        tokenAmount: 0,
        isStaking: false,
        stakedAmount: 0,
        stakedSince: null
      };
    }
  }
  
  /**
   * Get the current THC token price from multiple sources
   */
  async getTHCTokenPrice(): Promise<any> {
    try {
      // In a real implementation, we would query Birdeye, Raydium, and other sources
      // for the price of the THC token
      
      // Fetch from Birdeye
      let birdeyePrice = null;
      try {
        const birdeyeResponse = await fetch(
          `https://public-api.birdeye.so/public/tokenPrice?address=${this.THC_TOKEN_ADDRESS}`,
          {
            headers: {
              'x-api-key': process.env.BIRDEYE_API_KEY || '',
              'Accept': 'application/json'
            }
          }
        );
        
        if (birdeyeResponse.ok) {
          const birdeyeData = await birdeyeResponse.json();
          birdeyePrice = birdeyeData.value;
        }
      } catch (error) {
        console.error('Error fetching THC price from Birdeye:', error);
      }
      
      // Fetch from Raydium (simplified)
      let raydiumPrice = null;
      
      // Return price data from available sources
      return {
        price: birdeyePrice || raydiumPrice || 0,
        birdeye: birdeyePrice,
        raydium: raydiumPrice,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting THC token price:', error);
      return {
        price: 0,
        timestamp: new Date()
      };
    }
  }
  
  /**
   * Refresh wallet data for a user
   */
  async refreshWalletData(userId: number): Promise<any> {
    try {
      // Get user from database
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user || !user.walletAddress) {
        return {
          walletConnected: false,
          message: 'No wallet connected'
        };
      }
      
      // Fetch fresh on-chain data
      const onChainData = await this.fetchOnChainWalletData(user.walletAddress);
      
      // Get wallet from database
      const wallet = await db.query.wallets.findFirst({
        where: eq(wallets.address, user.walletAddress)
      });
      
      if (wallet) {
        // Update wallet data
        await db.update(wallets).set({
          balanceUsd: onChainData.balance || 0,
          solBalance: onChainData.solBalance || 0,
          thcBalance: onChainData.thcTokenHolding || 0,
          tokens: onChainData.tokens || [],
          isStaking: onChainData.isStaking || false,
          stakedAmount: onChainData.stakedAmount || 0,
          stakedSince: onChainData.stakedSince,
          lastRefreshed: new Date(),
          updatedAt: new Date()
        }).where(eq(wallets.id, wallet.id));
        
        // Update user THC token status
        const hasTHC = (onChainData.tokens || []).some((token: any) => token.isTHC && token.amount > 0);
        await db.update(users).set({
          thcTokenHolder: hasTHC,
          updatedAt: new Date()
        }).where(eq(users.id, userId));
      } else {
        // Create new wallet record
        const [newWallet] = await db.insert(wallets).values({
          userId,
          address: user.walletAddress,
          provider: 'unknown', // Will be updated when user connects wallet
          balanceUsd: onChainData.balance || 0,
          solBalance: onChainData.solBalance || 0,
          thcBalance: onChainData.thcTokenHolding || 0,
          tokens: onChainData.tokens || [],
          isStaking: onChainData.isStaking || false,
          stakedAmount: onChainData.stakedAmount || 0,
          stakedSince: onChainData.stakedSince,
          lastRefreshed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        // Update user THC token status
        const hasTHC = (onChainData.tokens || []).some((token: any) => token.isTHC && token.amount > 0);
        await db.update(users).set({
          thcTokenHolder: hasTHC,
          updatedAt: new Date()
        }).where(eq(users.id, userId));
      }
      
      return {
        walletConnected: true,
        address: user.walletAddress,
        provider: user.walletProvider || 'unknown',
        ...onChainData,
        refreshed: true
      };
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const walletService = new WalletService();