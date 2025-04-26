import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Slider } from './slider';
import { Badge } from './badge';
import { 
  TrendingUp, 
  CreditCard, 
  RefreshCw, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  Wallet,
  Loader2,
  Coins
} from 'lucide-react';
import { useThcToken } from '@/lib/hooks/useThcToken';
import { formatUsdAmount, formatTokenAmount } from '@/lib/contracts/thc-token-info';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useToast } from './use-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { THC_TOKEN } from '@/lib/contracts/thc-token-info';

interface ThcTokenPurchaseProps {
  className?: string;
}

export function ThcTokenPurchase({ className }: ThcTokenPurchaseProps) {
  const { 
    price, 
    priceChange24h, 
    totalSupply,
    circulatingSupply,
    marketCap,
    tradingVolume24h,
    balance,
    usdAmount, 
    tokenAmount, 
    purchaseFee,
    totalUsdCost,
    purchaseStatus,
    purchaseError,
    updateUsdAmount,
    updateTokenAmount,
    purchaseTokens,
    refreshPrice
  } = useThcToken();
  
  const { connected } = useWallet();
  const { toast } = useToast();
  
  // Predefined USD amounts
  const predefinedAmounts = [50, 100, 250, 500, 1000];
  
  // Flag to control which input was last changed (to prevent circular updates)
  const [lastChanged, setLastChanged] = useState<'usd' | 'token'>('usd');
  
  // Handle USD amount input change
  const handleUsdInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLastChanged('usd');
    updateUsdAmount(isNaN(value) ? 0 : value);
  };
  
  // Handle token amount input change
  const handleTokenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLastChanged('token');
    updateTokenAmount(isNaN(value) ? 0 : value);
  };
  
  // Handle USD slider change
  const handleUsdSliderChange = (value: number[]) => {
    setLastChanged('usd');
    updateUsdAmount(value[0]);
  };
  
  // Handle predefined amount selection
  const selectPredefinedAmount = (amount: number) => {
    setLastChanged('usd');
    updateUsdAmount(amount);
  };
  
  // Handle purchase button click
  const handlePurchase = async () => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to purchase THC tokens',
        variant: 'destructive'
      });
      return;
    }
    
    await purchaseTokens();
  };
  
  // Format price with appropriate precision
  const formatPrice = (price: number) => {
    return price < 0.01 
      ? price.toFixed(6) 
      : price < 1 
        ? price.toFixed(4) 
        : price.toFixed(2);
  };
  
  // Check if purchase button should be disabled
  const isPurchaseDisabled = 
    purchaseStatus !== 'idle' || 
    usdAmount <= 0 || 
    tokenAmount <= 0 || 
    !connected;
  
  // Get purchase button label based on status
  const getPurchaseButtonLabel = () => {
    switch (purchaseStatus) {
      case 'preparing':
        return 'Preparing Transaction...';
      case 'confirming':
        return 'Confirm in Wallet...';
      case 'processing':
        return 'Processing...';
      case 'success':
        return 'Purchase Successful!';
      case 'error':
        return 'Purchase Failed';
      default:
        return 'Purchase THC Tokens';
    }
  };
  
  // Format chart data for display
  const chartData = THC_TOKEN.priceHistory.map(entry => ({
    date: entry.date.slice(5), // Format as MM-DD
    price: entry.price
  }));
  
  return (
    <div className={className}>
      <Card className="border-slate-700 bg-slate-800/80">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Coins className="h-4 w-4 text-white" />
              </div>
              <CardTitle>Buy THC Tokens</CardTitle>
            </div>
            <div className="flex items-center">
              <div className="text-sm text-slate-400 mr-1">Price:</div>
              <div className="text-base font-semibold">${formatPrice(price)}</div>
              <Badge className={`ml-2 ${priceChange24h >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${priceChange24h >= 0 ? '' : 'rotate-180'}`} />
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-1 text-slate-400 hover:text-white"
                onClick={() => refreshPrice()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Purchase THC tokens to access platform benefits, reduce trading fees, and participate in staking
          </CardDescription>
          
          {/* Price Chart */}
          <div className="h-36 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3349" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(4)}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`$${value}`, 'Price']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#334155' }}
                />
                <ReferenceLine 
                  y={price} 
                  stroke="#60a5fa" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Current', 
                    position: 'insideTopRight',
                    fill: '#60a5fa',
                    fontSize: 10
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  dot={{ r: 0 }}
                  activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center bg-slate-700/30 p-3 rounded-md">
            <div>
              <div className="text-xs text-slate-400">Market Cap</div>
              <div className="text-sm font-semibold">${(marketCap / 1000000).toFixed(2)}M</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Circulating Supply</div>
              <div className="text-sm font-semibold">{(circulatingSupply / 1000000).toFixed(0)}M</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Supply</div>
              <div className="text-sm font-semibold">{(totalSupply / 1000000).toFixed(0)}M</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">24h Volume</div>
              <div className="text-sm font-semibold">${(tradingVolume24h / 1000).toFixed(0)}K</div>
            </div>
          </div>
          
          {/* Wallet Connection Prompt */}
          {!connected && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-md p-3 flex items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 shrink-0" />
              <div>
                <div className="text-sm font-medium text-white mb-2">Connect your wallet to purchase tokens</div>
                <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm" />
              </div>
            </div>
          )}
          
          {/* Purchase Form */}
          <div className="space-y-5">
            {/* USD Input */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-slate-400">Amount in USD</label>
                <div className="text-xs text-slate-500">Fee: {purchaseFee}%</div>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={usdAmount}
                  onChange={handleUsdInputChange}
                  className="pl-8 bg-slate-700 border-slate-600"
                />
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              
              {/* USD Slider */}
              <div className="mt-2">
                <Slider
                  defaultValue={[100]}
                  value={[usdAmount]}
                  min={10}
                  max={1000}
                  step={1}
                  onValueChange={handleUsdSliderChange}
                  className="mt-2"
                />
                <div className="flex justify-between mt-1 text-xs text-slate-500">
                  <span>$10</span>
                  <span>$1000</span>
                </div>
              </div>
              
              {/* Predefined Amounts */}
              <div className="flex flex-wrap gap-2 mt-3">
                {predefinedAmounts.map(amount => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`border-slate-600 ${usdAmount === amount ? 'bg-blue-900/50 border-blue-600 text-blue-200' : 'bg-slate-700/50'}`}
                    onClick={() => selectPredefinedAmount(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Token Amount */}
            <div>
              <label className="text-sm text-slate-400 block mb-1">Amount of THC</label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={tokenAmount}
                  onChange={handleTokenInputChange}
                  className="pl-8 bg-slate-700 border-slate-600"
                />
                <Coins className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Estimated value: {formatUsdAmount(tokenAmount * price)} (excluding fees)
              </div>
            </div>
            
            {/* Purchase Summary */}
            <div className="bg-slate-700/40 p-3 rounded-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Token Price</span>
                <span className="font-medium">${formatPrice(price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Tokens to Receive</span>
                <span className="font-medium">{formatTokenAmount(tokenAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Purchase Fee ({purchaseFee}%)</span>
                <span className="font-medium">{formatUsdAmount(usdAmount - (tokenAmount * price))}</span>
              </div>
              <div className="border-t border-slate-600 mt-2 pt-2 flex justify-between">
                <span className="text-slate-200 font-medium">Total Cost</span>
                <span className="text-white font-semibold">{formatUsdAmount(usdAmount)}</span>
              </div>
            </div>
            
            {/* Current Balance (if connected) */}
            {connected && (
              <div className="flex justify-between bg-slate-700/40 p-3 rounded-md">
                <span className="text-slate-300 flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Current THC Balance
                </span>
                <span className="font-medium">{formatTokenAmount(balance)}</span>
              </div>
            )}
            
            {/* Error Message */}
            {purchaseError && (
              <div className="bg-red-900/20 border border-red-800 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 shrink-0" />
                <div className="text-sm text-red-200">{purchaseError}</div>
              </div>
            )}
            
            {/* Success Message */}
            {purchaseStatus === 'success' && (
              <div className="bg-green-900/20 border border-green-800 rounded-md p-3 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 shrink-0" />
                <div className="text-sm text-green-200">
                  Successfully purchased {formatTokenAmount(tokenAmount)}!
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handlePurchase}
            disabled={isPurchaseDisabled}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
          >
            {purchaseStatus !== 'idle' && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {getPurchaseButtonLabel()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ThcTokenPurchase;