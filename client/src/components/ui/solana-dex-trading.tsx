import { FC, useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock trading pairs for development
const TRADING_PAIRS = [
  { value: 'THC/SOL', label: 'THC/SOL' },
  { value: 'SOL/USDC', label: 'SOL/USDC' },
  { value: 'THC/USDC', label: 'THC/USDC' },
  { value: 'BTC/USDC', label: 'BTC/USDC' },
  { value: 'ETH/USDC', label: 'ETH/USDC' },
];

const SolanaDexTrading: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  // Trading state
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0].value);
  const [orderType, setOrderType] = useState('limit');
  const [orderSide, setOrderSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Order book/Market data (mock for now)
  const [orderBook, setOrderBook] = useState({
    bids: [
      { price: 0.00543, size: 12500, total: 67.875 },
      { price: 0.00542, size: 8900, total: 48.238 },
      { price: 0.00541, size: 15400, total: 83.314 },
      { price: 0.00540, size: 22000, total: 118.800 },
      { price: 0.00539, size: 18700, total: 100.793 },
    ],
    asks: [
      { price: 0.00544, size: 9800, total: 53.312 },
      { price: 0.00545, size: 7500, total: 40.875 },
      { price: 0.00546, size: 13200, total: 72.072 },
      { price: 0.00547, size: 5600, total: 30.632 },
      { price: 0.00548, size: 11900, total: 65.212 },
    ]
  });
  
  const [recentTrades, setRecentTrades] = useState([
    { price: 0.00544, size: 1250, side: 'buy', time: '13:45:22' },
    { price: 0.00543, size: 987, side: 'sell', time: '13:45:10' },
    { price: 0.00544, size: 2350, side: 'buy', time: '13:44:55' },
    { price: 0.00545, size: 1520, side: 'buy', time: '13:44:32' },
    { price: 0.00542, size: 3100, side: 'sell', time: '13:44:15' },
  ]);
  
  const [marketStats, setMarketStats] = useState({
    lastPrice: 0.00544,
    change24h: 2.45,
    high24h: 0.00552,
    low24h: 0.00535,
    volume24h: 1450000,
  });
  
  // Set price to the best bid/ask when switching sides
  useEffect(() => {
    if (orderSide === 'buy') {
      // Set to lowest ask price
      setPrice(orderBook.asks[0].price.toString());
    } else {
      // Set to highest bid price
      setPrice(orderBook.bids[0].price.toString());
    }
  }, [orderSide, orderBook]);
  
  // Mock order execution function
  const executeOrder = async () => {
    if (!publicKey || !amount || !price) {
      setError('Please connect your wallet and enter amount and price');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In production, this is where you would:
      // 1. Create a DEX transaction using Serum/Raydium/etc.
      // 2. Sign and send the transaction
      
      // For development, let's simulate a transaction
      setTimeout(() => {
        setSuccess(`Successfully ${orderSide === 'buy' ? 'bought' : 'sold'} ${amount} of ${selectedPair.split('/')[0]} at ${price} ${selectedPair.split('/')[1]}`);
        setIsSubmitting(false);
        
        // Reset form
        setAmount('');
        
        // Update mock order book to simulate order effect
        const newOrderBook = {...orderBook};
        if (orderSide === 'buy') {
          newOrderBook.bids.unshift({ 
            price: parseFloat(price), 
            size: parseFloat(amount), 
            total: parseFloat(price) * parseFloat(amount) 
          });
          newOrderBook.bids.sort((a, b) => b.price - a.price); // Sort descending
          newOrderBook.bids.pop(); // Remove last element to keep array size the same
        } else {
          newOrderBook.asks.unshift({ 
            price: parseFloat(price), 
            size: parseFloat(amount), 
            total: parseFloat(price) * parseFloat(amount) 
          });
          newOrderBook.asks.sort((a, b) => a.price - b.price); // Sort ascending
          newOrderBook.asks.pop(); // Remove last element to keep array size the same
        }
        setOrderBook(newOrderBook);
        
        // Add to recent trades
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        const newTrades = [{
          price: parseFloat(price),
          size: parseFloat(amount),
          side: orderSide,
          time: timeStr
        }, ...recentTrades];
        
        newTrades.pop(); // Remove last to keep array size consistent
        setRecentTrades(newTrades);
      }, 1500);
      
    } catch (err) {
      console.error('Error executing order:', err);
      setError('Failed to execute order. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Mock function to calculate total
  const calculateTotal = () => {
    if (!amount || !price) return '0';
    return (parseFloat(amount) * parseFloat(price)).toFixed(6);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left column: Order book & Recent trades */}
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Order Book</h3>
          <div className="grid grid-cols-3 text-xs text-muted-foreground mb-1">
            <div>Price</div>
            <div className="text-right">Size</div>
            <div className="text-right">Total</div>
          </div>
          
          {/* Asks (Sell orders) - displayed in reverse order (lowest ask first) */}
          <div className="space-y-1 mb-2">
            {orderBook.asks.map((ask, index) => (
              <div 
                key={`ask-${index}`} 
                className="grid grid-cols-3 text-xs hover:bg-accent/50 cursor-pointer"
                onClick={() => {
                  setPrice(ask.price.toString());
                  setOrderSide('buy');
                }}
              >
                <div className="text-red-500">{ask.price.toFixed(5)}</div>
                <div className="text-right">{ask.size.toLocaleString()}</div>
                <div className="text-right">{ask.total.toLocaleString()}</div>
              </div>
            ))}
          </div>
          
          {/* Spread */}
          <div className="py-1 text-center text-xs text-muted-foreground">
            Spread: {((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.asks[0].price * 100).toFixed(2)}%
          </div>
          
          {/* Bids (Buy orders) */}
          <div className="space-y-1">
            {orderBook.bids.map((bid, index) => (
              <div 
                key={`bid-${index}`} 
                className="grid grid-cols-3 text-xs hover:bg-accent/50 cursor-pointer"
                onClick={() => {
                  setPrice(bid.price.toString());
                  setOrderSide('sell');
                }}
              >
                <div className="text-green-500">{bid.price.toFixed(5)}</div>
                <div className="text-right">{bid.size.toLocaleString()}</div>
                <div className="text-right">{bid.total.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Recent Trades</h3>
          <div className="grid grid-cols-4 text-xs text-muted-foreground mb-1">
            <div>Price</div>
            <div className="text-right">Size</div>
            <div className="text-right">Value</div>
            <div className="text-right">Time</div>
          </div>
          
          <div className="space-y-1">
            {recentTrades.map((trade, index) => (
              <div key={`trade-${index}`} className="grid grid-cols-4 text-xs">
                <div className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                  {trade.price.toFixed(5)}
                </div>
                <div className="text-right">{trade.size.toLocaleString()}</div>
                <div className="text-right">{(trade.price * trade.size).toLocaleString()}</div>
                <div className="text-right">{trade.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Middle column: Chart & Order form */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">{selectedPair}</h2>
              <Badge 
                variant={marketStats.change24h >= 0 ? "success" : "destructive"} 
                className="ml-2"
              >
                {marketStats.change24h >= 0 ? '+' : ''}{marketStats.change24h.toFixed(2)}%
              </Badge>
            </div>
            <Select
              value={selectedPair}
              onValueChange={setSelectedPair}
              options={TRADING_PAIRS.map(pair => ({ label: pair.label, value: pair.value }))}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
            <div>
              <div className="text-muted-foreground">Last Price</div>
              <div className="font-medium">{marketStats.lastPrice.toFixed(5)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">24h High</div>
              <div className="font-medium">{marketStats.high24h.toFixed(5)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">24h Low</div>
              <div className="font-medium">{marketStats.low24h.toFixed(5)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">24h Volume</div>
              <div className="font-medium">{(marketStats.volume24h / 1000).toFixed(1)}k</div>
            </div>
          </div>
          
          <div className="h-64 w-full bg-muted/30 rounded flex items-center justify-center">
            <div className="text-muted-foreground">
              Price chart will be integrated here
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <Tabs defaultValue="limit" onValueChange={setOrderType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="limit">Limit</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="stop">Stop Limit</TabsTrigger>
            </TabsList>
            
            <div className="flex mt-4 space-x-2">
              <Button 
                className="flex-1" 
                variant={orderSide === 'buy' ? 'default' : 'outline'}
                onClick={() => setOrderSide('buy')}
              >
                Buy
              </Button>
              <Button 
                className="flex-1" 
                variant={orderSide === 'sell' ? 'destructive' : 'outline'}
                onClick={() => setOrderSide('sell')}
              >
                Sell
              </Button>
            </div>
            
            <TabsContent value="limit" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
                  </label>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Price ({selectedPair.split('/')[1]})
                  </label>
                  <Input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total ({selectedPair.split('/')[1]})</span>
                  <span className="font-medium">{calculateTotal()}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-center gap-1">
                  <Button 
                    className="w-1/4"
                    variant="outline" 
                    size="sm"
                    onClick={() => setAmount((parseFloat(amount) || 0) * 0.25 + '')}
                  >
                    25%
                  </Button>
                  <Button 
                    className="w-1/4"
                    variant="outline" 
                    size="sm"
                    onClick={() => setAmount((parseFloat(amount) || 0) * 0.5 + '')}
                  >
                    50%
                  </Button>
                  <Button 
                    className="w-1/4"
                    variant="outline" 
                    size="sm"
                    onClick={() => setAmount((parseFloat(amount) || 0) * 0.75 + '')}
                  >
                    75%
                  </Button>
                  <Button 
                    className="w-1/4"
                    variant="outline" 
                    size="sm"
                    onClick={() => setAmount('100')}
                  >
                    100%
                  </Button>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className="w-full" 
                  disabled={!publicKey || isSubmitting || !amount || !price}
                  onClick={executeOrder}
                  variant={orderSide === 'buy' ? 'default' : 'destructive'}
                >
                  {isSubmitting ? 'Processing...' : orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="market" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
                  </label>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Slippage Tolerance</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[slippage]}
                      min={0.1}
                      max={5}
                      step={0.1}
                      onValueChange={(values) => setSlippage(values[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{slippage}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Total</span>
                  <span className="font-medium">
                    ~{amount && (parseFloat(amount) * (orderSide === 'buy' ? orderBook.asks[0].price : orderBook.bids[0].price)).toFixed(6)}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-center gap-1">
                  <Button className="w-1/4" variant="outline" size="sm">25%</Button>
                  <Button className="w-1/4" variant="outline" size="sm">50%</Button>
                  <Button className="w-1/4" variant="outline" size="sm">75%</Button>
                  <Button className="w-1/4" variant="outline" size="sm">100%</Button>
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={!publicKey || isSubmitting || !amount}
                  variant={orderSide === 'buy' ? 'default' : 'destructive'}
                >
                  {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]} at Market Price
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="stop" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
                  </label>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Stop Price
                    </label>
                    <Input
                      type="number"
                      placeholder="Stop Price"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Limit Price
                    </label>
                    <Input
                      type="number"
                      placeholder="Limit Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{calculateTotal()}</span>
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={!publicKey || isSubmitting || !amount || !price}
                  variant={orderSide === 'buy' ? 'default' : 'destructive'}
                >
                  {orderSide === 'buy' ? 'Buy' : 'Sell'} with Stop Limit
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Right column: Open orders & order history */}
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Trade with THC Token</h3>
          <div className="rounded-lg bg-primary/10 p-4 mb-4">
            <h4 className="font-semibold mb-2">Save on fees with THC</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Trading with Trade Hybrid Coin (THC) reduces fees by up to 50%, enabling more cost-effective trades.
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Standard fee:</span>
              <span className="text-sm">0.25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">With THC token:</span>
              <span className="text-sm font-semibold text-green-500">0.125%</span>
            </div>
          </div>
          
          <div className="bg-background rounded-lg border p-3 mb-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">THC</div>
              <div className="ml-2">
                <div className="font-medium">Trade Hybrid Coin</div>
                <div className="text-xs text-muted-foreground">Fee reduction + staking rewards</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Current Price:</span>
              <span className="text-sm font-medium">$0.0425</span>
            </div>
            <Button className="w-full mt-2" variant="outline" size="sm">
              Buy THC tokens
            </Button>
          </div>
          
          <h4 className="font-semibold mt-6 mb-2">THC Benefits</h4>
          <ul className="text-sm space-y-2">
            <li className="flex">
              <ArrowRight className="h-4 w-4 mr-2 text-primary" />
              <span>Reduced trading fees across all pairs</span>
            </li>
            <li className="flex">
              <ArrowRight className="h-4 w-4 mr-2 text-primary" />
              <span>Staking rewards and governance rights</span>
            </li>
            <li className="flex">
              <ArrowRight className="h-4 w-4 mr-2 text-primary" />
              <span>Access to premium trading features</span>
            </li>
            <li className="flex">
              <ArrowRight className="h-4 w-4 mr-2 text-primary" />
              <span>Community-voted development roadmap</span>
            </li>
          </ul>
        </Card>
        
        <Card className="p-4">
          <Tabs defaultValue="open">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="open">Open Orders</TabsTrigger>
              <TabsTrigger value="history">Order History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="open" className="mt-4">
              <div className="text-center py-8 text-sm text-muted-foreground">
                No open orders
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <div className="text-center py-8 text-sm text-muted-foreground">
                No order history
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default SolanaDexTrading;