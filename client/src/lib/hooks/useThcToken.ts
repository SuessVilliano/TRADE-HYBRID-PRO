import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import {
  THC_TOKEN,
  calculateTokensFromUsd,
  formatUsdAmount,
  formatTokenAmount
} from '../contracts/thc-token-info';
import { useToast } from '@/components/ui/use-toast';
import coinPriceService, { TokenPriceData, PriceHistoryPoint } from '../services/coin-price-service';

// THC Token purchase status
export type PurchaseStatus = 'idle' | 'preparing' | 'confirming' | 'processing' | 'success' | 'error';

export interface ThcTokenState {
  // Token data
  price: number;
  priceChange24h: number;
  totalSupply: number;
  circulatingSupply: number;
  marketCap: number;
  tradingVolume24h: number;
  holderCount: number;
  priceHistory: PriceHistoryPoint[];
  isLoading: boolean;
  lastUpdated: Date | null;
  
  // Raydium data
  raydiumPrice?: number;
  raydiumPriceChange24h?: number;
  raydiumLiquidity?: number;
  raydiumVolume24h?: number;
  raydiumLpAddress?: string;
  raydiumLastUpdated?: Date;
  dataSource?: 'birdeye' | 'raydium' | 'both' | 'fallback';
  
  // User data
  balance: number;
  pendingRewards: number;
  
  // Purchase state
  usdAmount: number;
  tokenAmount: number;
  purchaseFee: number;
  totalUsdCost: number;
  purchaseStatus: PurchaseStatus;
  purchaseError: string | null;
  
  // Functions
  updateUsdAmount: (amount: number) => void;
  updateTokenAmount: (amount: number) => void;
  purchaseTokens: () => Promise<boolean>;
  refreshPrice: () => Promise<number>;
}

/**
 * Hook for managing THC token data and operations
 */
export function useThcToken(): ThcTokenState {
  // Price and market data
  const [price, setPrice] = useState(THC_TOKEN.price);
  const [priceChange24h, setPriceChange24h] = useState(THC_TOKEN.priceChange24h);
  const [marketCap, setMarketCap] = useState(THC_TOKEN.marketCap);
  const [tradingVolume24h, setTradingVolume24h] = useState(THC_TOKEN.tradingVolume24h);
  
  // Raydium data
  const [raydiumPrice, setRaydiumPrice] = useState<number | undefined>(undefined);
  const [raydiumPriceChange24h, setRaydiumPriceChange24h] = useState<number | undefined>(undefined);
  const [raydiumLiquidity, setRaydiumLiquidity] = useState<number | undefined>(undefined); 
  const [raydiumVolume24h, setRaydiumVolume24h] = useState<number | undefined>(undefined);
  const [raydiumLpAddress, setRaydiumLpAddress] = useState<string | undefined>(undefined);
  const [raydiumLastUpdated, setRaydiumLastUpdated] = useState<Date | undefined>(undefined);
  const [dataSource, setDataSource] = useState<'birdeye' | 'raydium' | 'both' | 'fallback' | undefined>(undefined);
  
  // User purchase data
  const [usdAmount, setUsdAmount] = useState(100); // Default $100
  const [tokenAmount, setTokenAmount] = useState(calculateTokensFromUsd(100));
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>('idle');
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  
  // Get Solana connection and wallet
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  
  // Simulated user balance - in a real app, this would be fetched from a blockchain
  const [balance, setBalance] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  
  // Update simulated user balance if wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      // For demo purposes, generate a deterministic balance based on public key
      const pubKeyString = publicKey.toString();
      const lastFourChars = pubKeyString.slice(-4);
      const numericValue = parseInt(lastFourChars, 16);
      
      // Generate balance between 10 and 1000 THC
      const simulatedBalance = 10 + (numericValue % 990);
      setBalance(simulatedBalance);
      
      // Generate pending rewards between 0 and 20 THC
      const simulatedRewards = (numericValue % 200) / 10;
      setPendingRewards(simulatedRewards);
    } else {
      setBalance(0);
      setPendingRewards(0);
    }
  }, [connected, publicKey]);
  
  // Real token price history for chart
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Periodically update token price with real market data
  useEffect(() => {
    // Initial update
    refreshPrice();
    
    // Load initial price history
    fetchPriceHistory();
    
    // Set up interval for price updates (every 30 seconds)
    const intervalId = setInterval(() => {
      refreshPrice();
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Fetch price history data for chart
  const fetchPriceHistory = useCallback(async () => {
    try {
      const history = await coinPriceService.fetchTokenPriceHistory(7);
      setPriceHistory(history);
      
      // Also update THC_TOKEN's price history for components that use it directly
      THC_TOKEN.priceHistory = history;
    } catch (error) {
      console.error('Failed to fetch price history:', error);
    }
  }, []);
  
  // Update USD amount and calculate corresponding token amount
  const updateUsdAmount = useCallback((amount: number) => {
    setUsdAmount(amount);
    setTokenAmount(calculateTokensFromUsd(amount, price));
  }, [price]);
  
  // Update token amount and calculate corresponding USD amount
  const updateTokenAmount = useCallback((amount: number) => {
    setTokenAmount(amount);
    // Calculate USD amount including fee
    const usdBeforeFee = amount * price;
    const fee = usdBeforeFee * (THC_TOKEN.purchaseFee / 100);
    setUsdAmount(usdBeforeFee + fee);
  }, [price]);
  
  // Refresh token price from API
  const refreshPrice = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch real token price data from API
      const tokenData = await coinPriceService.fetchTokenPrice();
      
      // Update state with real data from Birdeye
      setPrice(tokenData.price);
      setPriceChange24h(tokenData.priceChange24h);
      setMarketCap(tokenData.marketCap);
      setTradingVolume24h(tokenData.tradingVolume24h);
      setLastUpdated(tokenData.lastUpdated);
      
      // Update Raydium data if available
      setRaydiumPrice(tokenData.raydiumPrice);
      setRaydiumPriceChange24h(tokenData.raydiumPriceChange24h);
      setRaydiumLiquidity(tokenData.raydiumLiquidity);
      setRaydiumVolume24h(tokenData.raydiumVolume24h);
      setRaydiumLpAddress(tokenData.raydiumLpAddress);
      setRaydiumLastUpdated(tokenData.raydiumLastUpdated);
      setDataSource(tokenData.dataSource);
      
      // Update cached values in THC_TOKEN for other components
      THC_TOKEN.price = tokenData.price;
      THC_TOKEN.priceChange24h = tokenData.priceChange24h;
      THC_TOKEN.marketCap = tokenData.marketCap;
      
      // Update token amount based on new price if USD amount is set
      if (usdAmount > 0) {
        setTokenAmount(calculateTokensFromUsd(usdAmount, tokenData.price));
      }
      
      // Refresh price history once every 5 minutes
      if (!lastUpdated || 
          (tokenData.lastUpdated.getTime() - (lastUpdated?.getTime() || 0)) > 5 * 60 * 1000) {
        fetchPriceHistory();
      }
      
      return tokenData.price;
    } catch (error) {
      console.error('Error refreshing token price:', error);
      return price; // Return current price if refresh fails
    } finally {
      setIsLoading(false);
    }
  }, [usdAmount, price, lastUpdated, fetchPriceHistory]);
  
  // Purchase tokens function
  const purchaseTokens = useCallback(async () => {
    // Get the toast function inside the callback to ensure it's available
    const { toast } = useToast();
    
    // Validate inputs
    if (usdAmount <= 0) {
      setPurchaseError('Please enter a valid USD amount');
      return false;
    }
    
    if (tokenAmount <= 0) {
      setPurchaseError('Token amount must be greater than zero');
      return false;
    }
    
    if (!connected || !publicKey) {
      setPurchaseError('Please connect your wallet to purchase tokens');
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to purchase THC tokens',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      // Reset previous errors
      setPurchaseError(null);
      
      // Start purchase process
      setPurchaseStatus('preparing');
      
      // In a real implementation, this would create a Solana transaction
      // Here we'll simulate the process with delays
      
      // Create a simulated transaction (dummy implementation)
      // In a real app, this would be a proper token purchase transaction
      const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(THC_TOKEN.tokenAddress),
          lamports: web3.LAMPORTS_PER_SOL * (usdAmount / 100) // Simulated cost in SOL
        })
      );
      
      // Set purchase status to confirming (waiting for user to confirm in wallet)
      setPurchaseStatus('confirming');
      
      // Simulate a delay for user confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set status to processing
      setPurchaseStatus('processing');
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update balance after successful purchase
      setBalance(prev => prev + tokenAmount);
      
      // Set purchase status to success
      setPurchaseStatus('success');
      
      // Show success toast
      toast({
        title: 'Purchase Successful',
        description: `You have successfully purchased ${formatTokenAmount(tokenAmount)}`,
        variant: 'default'
      });
      
      // Reset status after a delay
      setTimeout(() => {
        setPurchaseStatus('idle');
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      
      // Set purchase status to error
      setPurchaseStatus('error');
      
      // Set error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setPurchaseError(`Failed to purchase tokens: ${errorMessage}`);
      
      // Show error toast
      toast({
        title: 'Purchase Failed',
        description: `Failed to purchase tokens: ${errorMessage}`,
        variant: 'destructive'
      });
      
      // Reset status after a delay
      setTimeout(() => {
        setPurchaseStatus('idle');
      }, 3000);
      
      return false;
    }
  }, [usdAmount, tokenAmount, connected, publicKey, connection, sendTransaction]);
  
  return {
    // Token data
    price,
    priceChange24h,
    totalSupply: THC_TOKEN.totalSupply,
    circulatingSupply: THC_TOKEN.circulatingSupply,
    marketCap,
    tradingVolume24h,
    holderCount: THC_TOKEN.holderCount,
    priceHistory,
    isLoading,
    lastUpdated,
    
    // User data
    balance,
    pendingRewards,
    
    // Purchase state
    usdAmount,
    tokenAmount,
    purchaseFee: THC_TOKEN.purchaseFee,
    totalUsdCost: usdAmount,
    purchaseStatus,
    purchaseError,
    
    // Functions
    updateUsdAmount,
    updateTokenAmount,
    purchaseTokens,
    refreshPrice
  };
}

export default useThcToken;