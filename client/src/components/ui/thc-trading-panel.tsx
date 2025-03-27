import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Coins, ArrowDownUp, Wallet, ShieldCheck, ArrowRight, RefreshCcw } from "lucide-react";
import { THC_TOKEN } from "@/lib/constants";

interface ThcTradingPanelProps {
  className?: string;
}

export function ThcTradingPanel({ className }: ThcTradingPanelProps) {
  // States for buy tab
  const [buyAmount, setBuyAmount] = useState("");
  const [buyTotal, setBuyTotal] = useState("");
  const [buyPaymentMethod, setBuyPaymentMethod] = useState("usd");
  
  // States for sell tab
  const [sellAmount, setSellAmount] = useState("");
  const [sellTotal, setSellTotal] = useState("");
  const [sellReceiveMethod, setSellReceiveMethod] = useState("usd");
  
  // States for swap tab
  const [swapFromAmount, setSwapFromAmount] = useState("");
  const [swapFromToken, setSwapFromToken] = useState("usdc");
  const [swapToAmount, setSwapToAmount] = useState("");
  const [swapToToken, setSwapToToken] = useState("thc");
  
  // States for stake tab
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeDuration, setStakeDuration] = useState("90");
  const [stakeEstimatedReward, setStakeEstimatedReward] = useState("");
  const [autoCompound, setAutoCompound] = useState(true);
  
  // Other states
  const [currentPrice, setCurrentPrice] = useState(THC_TOKEN.price);
  const [walletBalance, setWalletBalance] = useState({
    thc: 250,
    usdc: 500,
    usdt: 300,
    sol: 2.5
  });
  const [slippage, setSlippage] = useState(0.5);
  
  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomChange = (Math.random() - 0.5) * 0.001;
      setCurrentPrice(prev => {
        const newPrice = prev * (1 + randomChange);
        return parseFloat(newPrice.toFixed(6));
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate buy total
  useEffect(() => {
    if (buyAmount) {
      const total = parseFloat(buyAmount) * currentPrice;
      setBuyTotal(total.toFixed(2));
    } else {
      setBuyTotal("");
    }
  }, [buyAmount, currentPrice]);
  
  // Calculate sell total
  useEffect(() => {
    if (sellAmount) {
      const total = parseFloat(sellAmount) * currentPrice;
      setSellTotal(total.toFixed(2));
    } else {
      setSellTotal("");
    }
  }, [sellAmount, currentPrice]);
  
  // Calculate swap to amount
  useEffect(() => {
    if (swapFromAmount && swapFromToken && swapToToken) {
      let rate = 1;
      
      // Mock exchange rates
      if (swapFromToken === 'usdc' && swapToToken === 'thc') {
        rate = 1 / currentPrice;
      } else if (swapFromToken === 'thc' && swapToToken === 'usdc') {
        rate = currentPrice;
      } else if (swapFromToken === 'sol' && swapToToken === 'thc') {
        rate = 95 / currentPrice; // Assuming SOL is $95
      } else if (swapFromToken === 'thc' && swapToToken === 'sol') {
        rate = currentPrice / 95;
      }
      
      const toAmount = parseFloat(swapFromAmount) * rate;
      setSwapToAmount(toAmount.toFixed(6));
    } else {
      setSwapToAmount("");
    }
  }, [swapFromAmount, swapFromToken, swapToToken, currentPrice]);
  
  // Calculate stake rewards
  useEffect(() => {
    if (stakeAmount && stakeDuration) {
      const amount = parseFloat(stakeAmount);
      const days = parseInt(stakeDuration);
      const apy = THC_TOKEN.stakingApy;
      
      // Calculate based on duration
      let adjustedApy = apy;
      if (days === 30) adjustedApy = apy * 0.8;
      if (days === 180) adjustedApy = apy * 1.2;
      
      // Simple reward calculation (not compound)
      const reward = amount * (adjustedApy / 100) * (days / 365);
      
      // Add compound effect if enabled
      let finalReward = reward;
      if (autoCompound && days >= 90) {
        // Simple approximation of compound effect
        finalReward = reward * 1.15;
      }
      
      setStakeEstimatedReward(finalReward.toFixed(2));
    } else {
      setStakeEstimatedReward("");
    }
  }, [stakeAmount, stakeDuration, autoCompound]);
  
  // Handle max button for buy
  const handleBuyMax = () => {
    if (buyPaymentMethod === 'usd') {
      const maxTokens = (walletBalance.usdc / currentPrice).toFixed(6);
      setBuyAmount(maxTokens);
    }
  };
  
  // Handle max button for sell
  const handleSellMax = () => {
    setSellAmount(walletBalance.thc.toString());
  };
  
  // Handle max button for swap
  const handleSwapMax = () => {
    if (swapFromToken === 'thc') {
      setSwapFromAmount(walletBalance.thc.toString());
    } else if (swapFromToken === 'usdc') {
      setSwapFromAmount(walletBalance.usdc.toString());
    } else if (swapFromToken === 'usdt') {
      setSwapFromAmount(walletBalance.usdt.toString());
    } else if (swapFromToken === 'sol') {
      setSwapFromAmount(walletBalance.sol.toString());
    }
  };
  
  // Handle max button for stake
  const handleStakeMax = () => {
    setStakeAmount(walletBalance.thc.toString());
  };
  
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Coins size={20} /> Trade THC Token
            </CardTitle>
            <CardDescription className="text-gray-100 mt-1">
              Buy, sell, swap or stake the Trade Hybrid token
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-white/10 p-2 rounded">
            <div className="text-xs opacity-80">Current Price:</div>
            <div className="font-bold">${currentPrice.toFixed(6)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
            <TabsTrigger value="swap" className="flex-1">Swap</TabsTrigger>
            <TabsTrigger value="stake" className="flex-1">Stake</TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            {/* Buy Tab Content */}
            <TabsContent value="buy" className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Available Balance:</span>
                  <span>{walletBalance.usdc} USDC</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="buyAmount">Amount to Buy</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleBuyMax}>
                      MAX
                    </Button>
                  </div>
                  <div className="flex">
                    <Input
                      id="buyAmount"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      type="number"
                      placeholder="0.00"
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 flex items-center rounded-r-md border border-l-0 border-input">
                      {THC_TOKEN.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buyPaymentMethod">Payment Method</Label>
                  <Select value={buyPaymentMethod} onValueChange={setBuyPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USDC</SelectItem>
                      <SelectItem value="sol">SOL</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buyTotal">Total Cost</Label>
                  <div className="flex">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 flex items-center rounded-l-md border border-r-0 border-input">
                      $
                    </div>
                    <Input
                      id="buyTotal"
                      value={buyTotal}
                      readOnly
                      className="rounded-l-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Buy {THC_TOKEN.symbol}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Sell Tab Content */}
            <TabsContent value="sell" className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Available Balance:</span>
                  <span>{walletBalance.thc} {THC_TOKEN.symbol}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="sellAmount">Amount to Sell</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleSellMax}>
                      MAX
                    </Button>
                  </div>
                  <div className="flex">
                    <Input
                      id="sellAmount"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      type="number"
                      placeholder="0.00"
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 flex items-center rounded-r-md border border-l-0 border-input">
                      {THC_TOKEN.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sellReceiveMethod">Receive In</Label>
                  <Select value={sellReceiveMethod} onValueChange={setSellReceiveMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select receive method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USDC</SelectItem>
                      <SelectItem value="sol">SOL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sellTotal">Total Received</Label>
                  <div className="flex">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 flex items-center rounded-l-md border border-r-0 border-input">
                      $
                    </div>
                    <Input
                      id="sellTotal"
                      value={sellTotal}
                      readOnly
                      className="rounded-l-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Sell {THC_TOKEN.symbol}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Swap Tab Content */}
            <TabsContent value="swap" className="mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="swapFrom">Swap From</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleSwapMax}>
                      MAX
                    </Button>
                  </div>
                  <div className="flex">
                    <Input
                      id="swapFrom"
                      value={swapFromAmount}
                      onChange={(e) => setSwapFromAmount(e.target.value)}
                      type="number"
                      placeholder="0.00"
                      className="rounded-r-none"
                    />
                    <Select value={swapFromToken} onValueChange={setSwapFromToken}>
                      <SelectTrigger className="w-28 rounded-l-none border-l-0">
                        <SelectValue placeholder="Token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thc">{THC_TOKEN.symbol}</SelectItem>
                        <SelectItem value="usdc">USDC</SelectItem>
                        <SelectItem value="usdt">USDT</SelectItem>
                        <SelectItem value="sol">SOL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <ArrowDownUp className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="swapTo">Swap To</Label>
                  <div className="flex">
                    <Input
                      id="swapTo"
                      value={swapToAmount}
                      readOnly
                      className="rounded-r-none"
                      placeholder="0.00"
                    />
                    <Select value={swapToToken} onValueChange={setSwapToToken}>
                      <SelectTrigger className="w-28 rounded-l-none border-l-0">
                        <SelectValue placeholder="Token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thc">{THC_TOKEN.symbol}</SelectItem>
                        <SelectItem value="usdc">USDC</SelectItem>
                        <SelectItem value="usdt">USDT</SelectItem>
                        <SelectItem value="sol">SOL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Exchange Rate</span>
                    <span>
                      1 {swapFromToken.toUpperCase()} = {swapFromToken === 'thc' && swapToToken === 'usdc' 
                        ? currentPrice.toFixed(6) 
                        : swapFromToken === 'usdc' && swapToToken === 'thc' 
                          ? (1/currentPrice).toFixed(6) 
                          : '1.00'} {swapToToken.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Slippage Tolerance</span>
                    <span>{slippage}%</span>
                  </div>
                  <div className="pt-1">
                    <Slider 
                      value={[slippage]} 
                      min={0.1} 
                      max={3} 
                      step={0.1} 
                      onValueChange={(value) => setSlippage(value[0])} 
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Swap Tokens
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Stake Tab Content */}
            <TabsContent value="stake" className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Available Balance:</span>
                  <span>{walletBalance.thc} {THC_TOKEN.symbol}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="stakeAmount">Amount to Stake</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleStakeMax}>
                      MAX
                    </Button>
                  </div>
                  <div className="flex">
                    <Input
                      id="stakeAmount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      type="number"
                      placeholder="0.00"
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 flex items-center rounded-r-md border border-l-0 border-input">
                      {THC_TOKEN.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stakeDuration">Staking Period</Label>
                  <Select value={stakeDuration} onValueChange={setStakeDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staking period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Days - {(THC_TOKEN.stakingApy * 0.8).toFixed(1)}% APY</SelectItem>
                      <SelectItem value="90">90 Days - {THC_TOKEN.stakingApy}% APY</SelectItem>
                      <SelectItem value="180">180 Days - {(THC_TOKEN.stakingApy * 1.2).toFixed(1)}% APY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="auto-compound" checked={autoCompound} onCheckedChange={setAutoCompound} />
                  <Label htmlFor="auto-compound">Auto-compound rewards (90+ day periods)</Label>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <RefreshCcw size={16} className="text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium">Estimated Rewards</span>
                    </div>
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {stakeEstimatedReward ? `+${stakeEstimatedReward} ${THC_TOKEN.symbol}` : '-'}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
                    Stake {THC_TOKEN.symbol}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="p-4 border-t flex justify-between items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Wallet size={14} />
            <span>Connected: 0x7A5f...3F1</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <ShieldCheck size={14} />
            <span>Verified by Solscan</span>
            <ArrowRight size={12} className="ml-1 text-blue-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}