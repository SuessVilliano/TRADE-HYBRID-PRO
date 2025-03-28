import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Users, LineChart, ArrowUpRight, ExternalLink, Award, Lock } from "lucide-react";
import { THC_TOKEN } from "@/lib/constants";

interface ThcTokenInfoProps {
  className?: string;
}

export function ThcTokenInfo({ className }: ThcTokenInfoProps) {
  const [tabValue, setTabValue] = useState("overview");
  const [price, setPrice] = useState(THC_TOKEN.price);
  const [priceChange, setPriceChange] = useState(THC_TOKEN.priceChange24h);
  const [totalSupply, setTotalSupply] = useState(THC_TOKEN.totalSupply);
  const [circulatingSupply, setCirculatingSupply] = useState(THC_TOKEN.circulatingSupply);
  const [marketCap, setMarketCap] = useState(THC_TOKEN.marketCap);
  const [holderCount, setHolderCount] = useState(THC_TOKEN.holderCount);
  const [stakingApy, setStakingApy] = useState(THC_TOKEN.stakingApy);
  const [tradingVolume24h, setTradingVolume24h] = useState(THC_TOKEN.tradingVolume24h);
  
  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomChange = (Math.random() - 0.5) * 0.001;
      setPrice(prev => {
        const newPrice = prev * (1 + randomChange);
        return parseFloat(newPrice.toFixed(6));
      });
      
      setPriceChange(prev => {
        const newChange = prev + (Math.random() - 0.5) * 0.1;
        return parseFloat(newChange.toFixed(2));
      });
      
      setTradingVolume24h(prev => {
        const volumeChange = (Math.random() - 0.4) * 500;
        return Math.max(0, prev + volumeChange);
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate circulating percentage
  const circulatingPercentage = (circulatingSupply / totalSupply) * 100;
  
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Coins size={20} /> {THC_TOKEN.name} ({THC_TOKEN.symbol})
            </CardTitle>
            <CardDescription className="text-gray-100 mt-1">
              Trade Hybrid's native cryptocurrency token
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${price.toFixed(6)}</div>
            <div className={`text-sm flex items-center justify-end gap-1 ${priceChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange}%
              <ArrowUpRight size={14} className={`${priceChange < 0 ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="overview" value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="staking" className="flex-1">Staking</TabsTrigger>
            <TabsTrigger value="utility" className="flex-1">Utility</TabsTrigger>
          </TabsList>
          <div className="p-4">
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Circulating Supply</span>
                    <span>{circulatingSupply.toLocaleString()} {THC_TOKEN.symbol}</span>
                  </div>
                  <Progress value={circulatingPercentage} className="h-2" />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      {circulatingPercentage.toFixed(1)}% of {totalSupply.toLocaleString()} {THC_TOKEN.symbol}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
                    <div className="font-semibold mt-1">${marketCap.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">24h Volume</div>
                    <div className="font-semibold mt-1">${tradingVolume24h.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Token Holders</div>
                    <div className="font-semibold mt-1 flex items-center gap-1">
                      <Users size={14} />
                      {holderCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Token Contract</div>
                    <div className="font-semibold mt-1 flex items-center gap-1 text-blue-500 text-sm truncate">
                      <a href={`https://solscan.io/token/${THC_TOKEN.contractAddress}`} target="_blank" rel="noopener noreferrer" className="truncate flex items-center gap-1">
                        <ExternalLink size={14} />
                        {THC_TOKEN.contractAddress.substring(0, 8)}...
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="staking" className="mt-0">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="text-purple-500" size={20} />
                    <h3 className="font-semibold">Stake & Bake Program</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Earn passive income by staking your THC tokens and help secure the Trade Hybrid network.</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stakingApy}% APY</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">Variable Rate</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Available Staking Pools</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <div className="font-medium">30 Days Lock</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Minimum 100 THC</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 dark:text-green-400 font-semibold">{(stakingApy * 0.8).toFixed(1)}% APY</div>
                          <Button size="sm" variant="outline" className="mt-1">Stake</Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <div className="font-medium">90 Days Lock</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Minimum 500 THC</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 dark:text-green-400 font-semibold">{stakingApy}% APY</div>
                          <Button size="sm" variant="outline" className="mt-1">Stake</Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <div className="font-medium">180 Days Lock</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Minimum 1000 THC</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 dark:text-green-400 font-semibold">{(stakingApy * 1.2).toFixed(1)}% APY</div>
                          <Button size="sm" variant="outline" className="mt-1">Stake</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="utility" className="mt-0">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2">THC Token Utility</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    THC tokens power the entire Trade Hybrid ecosystem with multiple use cases and benefits for holders.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
                    <div className="flex gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit">
                        <LineChart size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Reduced Trading Fees</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Pay trading fees with THC tokens and get up to 50% discount on all transactions.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
                    <div className="flex gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full h-fit">
                        <Lock size={16} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Exclusive Features Access</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Hold THC tokens to unlock premium features including advanced AI signals and priority customer support.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
                    <div className="flex gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full h-fit">
                        <Users size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Governance Rights</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          THC token holders can vote on important platform decisions and feature development priorities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}