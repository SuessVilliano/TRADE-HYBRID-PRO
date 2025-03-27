import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowUpDown,
  BarChart4, 
  Brain,
  Check, 
  ChevronDown, 
  ChevronsUpDown, 
  CircleDollarSign, 
  Clock, 
  Cog, 
  CornerDownLeft,
  Eye,
  Info, 
  Lock, 
  RefreshCw, 
  Settings, 
  Trash, 
  Trophy, 
  Unlock, 
  WalletCards,
  X
} from "lucide-react";

// Use Brain icon from lucide as BrainCircuit is not available
const BrainCircuit = Brain;

import { useBrokerAggregator } from "@/lib/stores/useBrokerAggregator";
import { useTrader } from "@/lib/stores/useTrader";
import { useMarketData } from "@/lib/stores/useMarketData";
import { orderBy } from "lodash";
import { ALL_TRADING_SYMBOLS, SMART_TRADE_PANEL_DEFAULT_SETTINGS, THC_TOKEN } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { brokerAggregatorService, BrokerPriceComparison } from "@/lib/services/broker-aggregator-service";
import { openAIService } from "@/lib/services/openai-service";
import { ask_secrets, check_secrets } from "@/lib/utils";

interface BrokerComparison {
  brokerId: string;
  brokerName: string;
  price: number;
  spread: number;
  latency: number;
  score: number;
}

interface SignalItemProps {
  pair: string;
  action: 'BUY' | 'SELL';
  entry: string;
  sl: string;
  tp: string[];
  risk: string;
  riskReward: string;
  created: string;
  lastTriggered: string;
}

interface SmartTradePanelProps {
  className?: string;
  defaultSymbol?: string;
}

export function SmartTradePanel({ className, defaultSymbol = "BTCUSD" }: SmartTradePanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("trade");
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [quantity, setQuantity] = useState("0.01");
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(SMART_TRADE_PANEL_DEFAULT_SETTINGS.defaultBroker);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [demoMode, setDemoMode] = useState(true);
  const [tradeAnalysis, setTradeAnalysis] = useState("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  
  // Get data from broker aggregator store
  const { 
    isAuthenticated, 
    currentBroker,
    brokerComparisons, 
    compareBrokerPrices,
    authenticateBroker,
    logout,
    accountInfo,
    getAccountInfo,
    positions,
    getPositions,
    placeOrder,
    closePosition
  } = useBrokerAggregator();
  
  // Get market data
  const { 
    currentPrice,
    priceHistory,
    highPrice,
    lowPrice,
    change24h,
    changePercent24h,
    fetchMarketData,
    subscribeToRealTimeData,
    unsubscribeFromRealTimeData
  } = useMarketData();

  // Local state for demo broker comparisons when not authenticated
  const [currentComparisons, setCurrentComparisons] = useState<BrokerPriceComparison[]>([]);
  
  // Check if OpenAI API key is available
  useEffect(() => {
    const checkForOpenAIKey = async () => {
      const secretsAvailable = await check_secrets(["OPENAI_API_KEY"]);
      setHasOpenAIKey(secretsAvailable.includes("OPENAI_API_KEY"));
      
      if (secretsAvailable.includes("OPENAI_API_KEY")) {
        // Initialize OpenAI service with the API key from environment
        openAIService.initialize(process.env.OPENAI_API_KEY || "");
      }
    };
    
    checkForOpenAIKey();
  }, []);
  
  // Load initial market data for the symbol
  useEffect(() => {
    // Fetch market data for the symbol
    fetchMarketData(symbol);
    
    // Subscribe to real-time updates
    subscribeToRealTimeData(symbol);
    
    // Get broker price comparisons
    loadBrokerComparisons();
    
    return () => {
      // Unsubscribe when component unmounts
      unsubscribeFromRealTimeData(symbol);
    };
  }, [symbol, fetchMarketData, subscribeToRealTimeData, unsubscribeFromRealTimeData]);
  
  // Refresh account info and positions if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getAccountInfo();
      getPositions();
    }
  }, [isAuthenticated, getAccountInfo, getPositions]);
  
  // Function to load broker comparisons (authenticated or demo)
  const loadBrokerComparisons = async () => {
    if (isAuthenticated) {
      // Use the store function if authenticated
      await compareBrokerPrices(symbol);
    } else {
      // Use the service directly for demo comparisons
      try {
        const comparisons = await brokerAggregatorService.getBrokerPriceComparisons(symbol);
        setCurrentComparisons(comparisons);
      } catch (error) {
        console.error("Error getting broker comparisons:", error);
      }
    }
  };
  
  // Handle connect to broker
  const handleConnectBroker = async () => {
    if (!selectedBroker || !apiKey || !apiSecret) {
      toast({
        title: "Error",
        description: "Please provide all required information to connect to the broker.",
        variant: "destructive"
      });
      return;
    }
    
    const result = await authenticateBroker({
      brokerId: selectedBroker,
      apiKey,
      apiSecret,
      demoMode
    });
    
    if (result) {
      toast({
        title: "Success",
        description: `Connected to ${selectedBroker} ${demoMode ? 'demo' : 'live'} account successfully.`,
        variant: "default"
      });
      setIsConnectModalOpen(false);
    } else {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to broker. Please check your credentials and try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle trade execution
  const handleExecuteTrade = async (side: 'buy' | 'sell') => {
    if (!isAuthenticated) {
      setIsConnectModalOpen(true);
      return;
    }
    
    // Validate quantity
    const qtyNumber = parseFloat(quantity);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate limit price for limit orders
    if (orderType === 'limit') {
      const limitPriceNumber = parseFloat(limitPrice);
      if (isNaN(limitPriceNumber) || limitPriceNumber <= 0) {
        toast({
          title: "Invalid Limit Price",
          description: "Please enter a valid limit price greater than zero.",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Prepare order object
    const order = {
      symbol,
      side,
      type: orderType as 'market' | 'limit' | 'stop',
      quantity: qtyNumber,
      price: orderType === 'market' ? undefined : parseFloat(limitPrice),
      takeProfitPrice: takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
      stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : undefined
    };
    
    // Place the order
    const result = await placeOrder(order);
    
    if (result.status === 'filled' || result.status === 'pending') {
      toast({
        title: "Order Placed",
        description: `Your ${side.toUpperCase()} order for ${quantity} ${symbol} has been ${result.status}.`,
        variant: "default"
      });
      
      // If order was filled, show the filled price
      if (result.status === 'filled' && result.averagePrice) {
        toast({
          title: "Order Filled",
          description: `Filled at average price of ${result.averagePrice}`,
          variant: "default"
        });
      }
    } else {
      toast({
        title: "Order Failed",
        description: result.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle closing a position
  const handleClosePosition = async (symbolToClose: string) => {
    if (!isAuthenticated) return;
    
    const result = await closePosition(symbolToClose);
    
    if (result.status === 'filled') {
      toast({
        title: "Position Closed",
        description: `Your position in ${symbolToClose} has been closed.`,
        variant: "default"
      });
    } else {
      toast({
        title: "Failed to Close Position",
        description: result.message || "Failed to close position. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle disconnect from broker
  const handleDisconnect = () => {
    logout();
    toast({
      title: "Disconnected",
      description: "You have been disconnected from the broker.",
      variant: "default"
    });
  };
  
  // Handle requesting OpenAI API key
  const handleRequestOpenAIKey = async () => {
    await ask_secrets(
      ["OPENAI_API_KEY"],
      "To provide AI-powered trading analysis, we need an OpenAI API key. This will allow the Smart Trading Panel to generate personalized market insights and trade recommendations."
    );
    
    // After the user has potentially provided the key, check again
    const secretsAvailable = await check_secrets(["OPENAI_API_KEY"]);
    setHasOpenAIKey(secretsAvailable.includes("OPENAI_API_KEY"));
    
    if (secretsAvailable.includes("OPENAI_API_KEY")) {
      // Initialize OpenAI service with the API key from environment
      openAIService.initialize(process.env.OPENAI_API_KEY || "");
      toast({
        title: "API Key Added",
        description: "OpenAI API key has been added successfully. You can now use AI trading analysis features.",
        variant: "default"
      });
    }
  };
  
  // Function to get AI-powered trade analysis
  const getTradeAnalysis = async () => {
    if (!hasOpenAIKey || !openAIService.isInitialized()) {
      toast({
        title: "API Key Required",
        description: "An OpenAI API key is required for AI trading analysis. Please add your API key to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingAnalysis(true);
    
    try {
      // Get market analysis for the current symbol
      const analysis = await openAIService.generateMarketAnalysis({
        symbol,
        currentPrice,
        change24h,
        changePercent24h,
        highPrice,
        lowPrice,
        volume: 0, // We don't have this data available yet
        additionalContext: `The trader is considering a ${orderType} order to ${quantity} ${symbol}.`
      });
      
      setTradeAnalysis(analysis);
    } catch (error) {
      console.error("Error getting trade analysis:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate trade analysis. Please try again later.",
        variant: "destructive"
      });
      setTradeAnalysis("Analysis failed. Please try again later.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };
  
  // Calculate the price color based on change
  const getPriceColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-gray-500";
  };
  
  // Calculate position profit/loss color
  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return "text-green-500";
    if (pnl < 0) return "text-red-500";
    return "text-gray-500";
  };
  
  // Format as currency
  const formatCurrency = (value: number, showCents = true) => {
    if (value >= 1000) {
      return `$${value.toFixed(showCents ? 2 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
    return `$${value.toFixed(showCents ? 2 : 0)}`;
  };
  
  // Function to render broker comparison rows
  const renderBrokerComparisons = () => {
    // Use store data if authenticated, or local state if not
    const comparisons = isAuthenticated ? brokerComparisons : currentComparisons;
    
    if (!comparisons || comparisons.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
            No broker data available for {symbol}
          </TableCell>
        </TableRow>
      );
    }
    
    return comparisons.map((comparison: BrokerPriceComparison) => (
      <TableRow key={comparison.brokerId}>
        <TableCell className="font-medium">{comparison.brokerName}</TableCell>
        <TableCell>{formatCurrency(comparison.price)}</TableCell>
        <TableCell>{comparison.spread.toFixed(4)}%</TableCell>
        <TableCell>{comparison.latency}ms</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="font-medium">{comparison.score.toFixed(1)}/10</span>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full" 
                style={{ width: `${(comparison.score / 10) * 100}%` }}
              />
            </div>
          </div>
        </TableCell>
      </TableRow>
    ));
  };
  
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <CircleDollarSign size={20} className="text-blue-500" />
              Smart Trade Panel
            </CardTitle>
            <CardDescription>
              Advanced trading with ABATEV broker aggregation
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={loadBrokerComparisons}
                  >
                    <RefreshCw size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh broker data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isAuthenticated ? "default" : "outline"}
                    size="sm"
                    onClick={isAuthenticated ? handleDisconnect : () => setIsConnectModalOpen(true)}
                    className="flex items-center gap-1"
                  >
                    {isAuthenticated ? <Unlock size={16} /> : <Lock size={16} />}
                    {isAuthenticated ? 'Disconnect' : 'Connect Broker'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isAuthenticated ? "Disconnect from broker" : "Connect to a broker"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select Symbol" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_TRADING_SYMBOLS.map((sym) => (
                    <SelectItem key={sym} value={sym}>
                      {sym}
                    </SelectItem>
                  ))}
                  {/* Special case for THC token */}
                  <SelectItem value={THC_TOKEN.symbol}>
                    {THC_TOKEN.symbol} (THC Token)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{formatCurrency(currentPrice)}</span>
                <span className={`text-sm ${getPriceColor(changePercent24h)}`}>
                  {changePercent24h >= 0 ? '+' : ''}{changePercent24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                24h Range: {formatCurrency(lowPrice)} - {formatCurrency(highPrice)}
              </div>
            </div>
          </div>
          
          {isAuthenticated && accountInfo && (
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded flex flex-col">
              <div className="text-xs text-gray-500 dark:text-gray-400">Account Balance</div>
              <div className="font-bold text-lg">{formatCurrency(accountInfo.balance)}</div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="trade" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none border-b border-gray-200 dark:border-gray-700">
            <TabsTrigger value="trade" className="flex-1">Trade</TabsTrigger>
            <TabsTrigger value="brokers" className="flex-1">Broker Comparison</TabsTrigger>
            <TabsTrigger value="positions" className="flex-1">Positions</TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1">AI Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trade" className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    value={quantity} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)} 
                    placeholder="Enter quantity" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger id="orderType">
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {orderType !== 'market' && (
                  <div>
                    <Label htmlFor="limitPrice">
                      {orderType === 'limit' ? 'Limit Price' : 'Stop Price'}
                    </Label>
                    <Input 
                      id="limitPrice" 
                      value={limitPrice} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLimitPrice(e.target.value)} 
                      placeholder={`Enter ${orderType} price`} 
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="takeProfit">Take Profit Price (Optional)</Label>
                  <Input 
                    id="takeProfit" 
                    value={takeProfitPrice} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTakeProfitPrice(e.target.value)} 
                    placeholder="Enter take profit price" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="stopLoss">Stop Loss Price (Optional)</Label>
                  <Input 
                    id="stopLoss" 
                    value={stopLossPrice} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStopLossPrice(e.target.value)} 
                    placeholder="Enter stop loss price" 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-sm mb-2">Market Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Symbol:</span>
                      <span className="font-medium">{symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Current Price:</span>
                      <span className="font-medium">{formatCurrency(currentPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">24h Change:</span>
                      <span className={`font-medium ${getPriceColor(changePercent24h)}`}>
                        {changePercent24h >= 0 ? '+' : ''}{change24h.toFixed(2)} ({changePercent24h.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">24h High:</span>
                      <span className="font-medium">{formatCurrency(highPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">24h Low:</span>
                      <span className="font-medium">{formatCurrency(lowPrice)}</span>
                    </div>
                  </div>
                </div>
                
                {isAuthenticated && accountInfo && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-sm mb-2">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                        <span className="font-medium">{formatCurrency(accountInfo.balance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Equity:</span>
                        <span className="font-medium">{formatCurrency(accountInfo.equity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Available Margin:</span>
                        <span className="font-medium">{formatCurrency(accountInfo.marginAvailable)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Used Margin:</span>
                        <span className="font-medium">{formatCurrency(accountInfo.marginUsed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Open Positions:</span>
                        <span className="font-medium">{positions.length}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700" 
                    onClick={() => handleExecuteTrade('buy')}
                  >
                    Buy
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700" 
                    onClick={() => handleExecuteTrade('sell')}
                  >
                    Sell
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="brokers" className="p-0">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">Broker Comparison for {symbol}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Compare prices, spreads, and execution quality across multiple brokers
              </p>
            </div>
            
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Info size={14} />
                <span>ABATEV Technology finds the best execution for your trades</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadBrokerComparisons}
                className="flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Refresh
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broker</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Spread</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderBrokerComparisons()}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="positions" className="p-4 space-y-4">
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <Lock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">Connect to a Broker</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                  Connect to a broker to view your positions and trade history.
                </p>
                <Button onClick={() => setIsConnectModalOpen(true)}>
                  Connect Broker
                </Button>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-3 flex items-center justify-center">
                  <BarChart4 size={32} />
                </div>
                <h3 className="text-lg font-medium mb-2">No Open Positions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                  You don't have any open positions. Start trading to see your positions here.
                </p>
                <Button onClick={() => setActiveTab("trade")}>
                  Start Trading
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-3">Open Positions</h3>
                <div className="space-y-3">
                  {positions.map((position) => (
                    <div 
                      key={position.symbol} 
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${position.side === 'long' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="font-medium">{position.symbol}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                            {position.side.toUpperCase()}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8"
                          onClick={() => handleClosePosition(position.symbol)}
                        >
                          Close
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Quantity</div>
                          <div>{position.quantity}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Entry Price</div>
                          <div>{formatCurrency(position.entryPrice)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Current Price</div>
                          <div>{formatCurrency(position.currentPrice)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">P&L</div>
                          <div className={getPnLColor(position.unrealizedPnL)}>
                            {formatCurrency(position.unrealizedPnL)} ({position.pnlPercentage.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analysis" className="p-4 space-y-4">
            {!hasOpenAIKey ? (
              <div className="text-center py-8">
                <BrainCircuit className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">AI Analysis Requires OpenAI API Key</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                  To use AI-powered trading analysis, you need to provide an OpenAI API key.
                </p>
                <Button onClick={handleRequestOpenAIKey}>
                  Add OpenAI API Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">AI Trading Analysis for {symbol}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={getTradeAnalysis}
                    disabled={isLoadingAnalysis}
                    className="flex items-center gap-1"
                  >
                    {isLoadingAnalysis ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BrainCircuit size={14} />
                        Generate Analysis
                      </>
                    )}
                  </Button>
                </div>
                
                {!tradeAnalysis ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                    <BrainCircuit className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <h4 className="font-medium mb-2">AI Market Analysis</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Get AI-powered insights on market conditions, trend analysis, and trading recommendations for {symbol}.
                    </p>
                    <Button onClick={getTradeAnalysis} disabled={isLoadingAnalysis}>
                      {isLoadingAnalysis ? "Analyzing..." : "Generate Analysis"}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {tradeAnalysis}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Connect Broker Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Connect to Broker</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsConnectModalOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="broker">Select Broker</Label>
                <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                  <SelectTrigger id="broker">
                    <SelectValue placeholder="Select a broker" />
                  </SelectTrigger>
                  <SelectContent>
                    {brokerAggregatorService.getAvailableBrokers().map((broker) => (
                      <SelectItem key={broker.id} value={broker.id}>
                        {broker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input 
                  id="apiKey" 
                  value={apiKey} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)} 
                  placeholder="Enter API key" 
                />
              </div>
              
              <div>
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input 
                  id="apiSecret" 
                  type="password" 
                  value={apiSecret} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiSecret(e.target.value)} 
                  placeholder="Enter API secret" 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="demoMode" 
                  checked={demoMode} 
                  onCheckedChange={(checked: boolean | 'indeterminate') => setDemoMode(!!checked)} 
                />
                <Label htmlFor="demoMode">Use Demo Account</Label>
              </div>
              
              <Alert>
                <AlertTitle>Testing Credentials</AlertTitle>
                <AlertDescription>
                  For demo purposes, you can leave the API Key and Secret fields empty. The system will use simulated data.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsConnectModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleConnectBroker}>
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}