import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUp, ArrowDown, Wallet, CreditCard, History, BarChart4 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

type PricePoint = {
  timestamp: number;
  price: number;
};

export function ThcPriceWidget() {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you'd fetch this from an API
    const generatePriceData = () => {
      const now = Date.now();
      const basePrice = 2.45;
      const points: PricePoint[] = [];
      
      // Generate data for the last 7 days
      for (let i = 0; i < 168; i++) { // 24 hours * 7 days
        const timePoint = now - (168 - i) * 3600 * 1000; // hours in milliseconds
        const randomFactor = 1 + (Math.random() * 0.2 - 0.1); // +/- 10%
        const price = basePrice * randomFactor;
        points.push({ timestamp: timePoint, price });
      }
      
      const lastPrice = points[points.length - 1].price;
      const prevPrice = points[points.length - 25].price; // 24 hours ago
      const change = ((lastPrice - prevPrice) / prevPrice) * 100;
      
      setPriceHistory(points);
      setCurrentPrice(lastPrice);
      setPriceChange(change);
    };
    
    generatePriceData();
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const handleBuy = () => {
    if (!buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to buy.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Purchase successful!",
        description: `You've purchased ${buyAmount} THC tokens.`,
      });
      setBuyAmount('');
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">THC Token</CardTitle>
            <CardDescription>
              Trade Hybrid Coin on Solana
            </CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold">${formatPrice(currentPrice)}</div>
            <div className={`flex items-center text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(priceChange).toFixed(2)}% (24h)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="buy" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>Buy</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy">
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="text-sm font-medium mb-1 block">
                  Amount (THC)
                </label>
                <div className="flex gap-2">
                  <input
                    id="amount"
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <Button variant="outline" size="sm" onClick={() => setBuyAmount('100')}>
                    +100
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setBuyAmount('500')}>
                    +500
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Price</span>
                  <span>${formatPrice(currentPrice)} per THC</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Total</span>
                  <span>${formatPrice(currentPrice * (Number(buyAmount) || 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Network Fee</span>
                  <span>~$0.001</span>
                </div>
              </div>
              
              <Button 
                onClick={handleBuy} 
                className="w-full" 
                disabled={loading || !buyAmount}
              >
                {loading ? "Processing..." : "Buy THC"}
              </Button>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Powered by Solana and Trade Hybrid
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="wallet">
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Available Balance</div>
                  <div className="text-xl font-semibold">1,250 THC</div>
                  <div className="text-sm">≈ ${formatPrice(1250 * currentPrice)}</div>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <BarChart4 className="h-4 w-4" /> Trade
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ArrowRight className="h-4 w-4" /> Send
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Connected Wallet</div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg flex justify-between items-center">
                  <div className="text-sm truncate">0x7F...2aE9</div>
                  <Button variant="ghost" size="sm">Disconnect</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-3">
              <div className="text-sm font-medium">Recent Transactions</div>
              
              <TransactionItem 
                type="buy"
                amount="500 THC"
                value="$1,225.00"
                date="2025-03-20 14:32"
                status="completed"
              />
              
              <TransactionItem 
                type="buy"
                amount="750 THC"
                value="$1,837.50"
                date="2025-03-15 09:17"
                status="completed"
              />
              
              <TransactionItem 
                type="sell"
                amount="250 THC"
                value="$612.50"
                date="2025-03-10 16:43"
                status="completed"
              />
              
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All Transactions
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface TransactionItemProps {
  type: 'buy' | 'sell';
  amount: string;
  value: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

function TransactionItem({ type, amount, value, date, status }: TransactionItemProps) {
  return (
    <div className={`p-3 rounded-lg border ${status === 'failed' ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700/50'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${type === 'buy' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {type === 'buy' ? (
              <ArrowDown className={`h-4 w-4 text-green-600 dark:text-green-400`} />
            ) : (
              <ArrowUp className={`h-4 w-4 text-red-600 dark:text-red-400`} />
            )}
          </div>
          <div>
            <div className="font-medium capitalize">{type}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium">{amount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{value}</div>
        </div>
      </div>
    </div>
  );
}