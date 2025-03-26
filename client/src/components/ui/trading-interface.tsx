import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, DollarSign, 
  Wallet, BarChart2, RefreshCw, Check, 
  BarChart, Settings, ChevronUp, ChevronDown,
  Shield, Zap, Target, Shuffle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTrader } from "@/lib/stores/useTrader";
import { useMarketData } from "@/lib/stores/useMarketData";
import { useBrokerAggregator } from "@/lib/stores/useBrokerAggregator";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { BotCreator } from "./bot-creator";
import { OrderHistoryView } from "./order-history";
import { toast } from "sonner";
import { Badge } from "./badge";
import { BrokerComparison } from "@/lib/services/broker-aggregator-service";


interface TradingInterfaceProps {
  className?: string;
}

export function TradingInterface({ className }: TradingInterfaceProps) {
  const { placeTrade, accountBalance, orderHistory } = useTrader();
  const { currentPrice, symbol } = useMarketData();
  const { 
    initializeAggregator,
    executeTrade,
    compareForSymbol,
    toggleABATEV,
    useABATEV,
    isConnected,
    currentComparisons,
    selectBroker,
    selectedBroker,
    activeBrokers,
    isLoading
  } = useBrokerAggregator();
  
  const [quantity, setQuantity] = useState("0.01");
  const [leverage, setLeverage] = useState(1);
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [comparisonsVisible, setComparisonsVisible] = useState(false);
  
  // Initialize broker aggregator
  useEffect(() => {
    if (!isConnected) {
      initializeAggregator();
    }
  }, [isConnected, initializeAggregator]);
  
  // Update comparison data when symbol changes
  useEffect(() => {
    if (isConnected && comparisonsVisible) {
      compareForSymbol(symbol);
    }
  }, [isConnected, symbol, comparisonsVisible, compareForSymbol]);

  const handleTrade = async (side: "buy" | "sell") => {
    if (parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    
    try {
      const result = await executeTrade({
        symbol,
        action: side,
        quantity: parseFloat(quantity),
        orderType: orderType as 'market' | 'limit',
        limitPrice: orderType === "limit" ? parseFloat(limitPrice) : undefined,
        takeProfit1: showAdvancedOptions && takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
        stopLoss: showAdvancedOptions && stopLossPrice ? parseFloat(stopLossPrice) : undefined,
      });
      
      if (result.success) {
        toast.success(`${side.toUpperCase()} order executed successfully via ${result.broker || 'broker'}`);
        
        // If ABATEV was used, show which broker was selected
        if (useABATEV && result.broker) {
          toast.info(`ABATEV selected ${result.broker} for best execution`);
        }
      } else {
        toast.error(`Failed to execute order: ${result.error}`);
      }
    } catch (error) {
      console.error("Trade execution error:", error);
      toast.error("An error occurred while executing the trade");
    }
  };

  const calculateMargin = () => {
    return (parseFloat(quantity) * currentPrice) / leverage;
  };

  const calculatePotentialProfit = (side: "buy" | "sell") => {
    const price = currentPrice;
    const potentialChange = price * 0.05; 
    const leveragedChange = potentialChange * leverage;
    const totalPosition = parseFloat(quantity) * price;
    return side === "buy" ? leveragedChange : -leveragedChange;
  };
  
  const refreshComparisons = () => {
    compareForSymbol(symbol);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>
            <Wallet className="inline mr-2 h-5 w-5" />
            Trading Terminal
          </span>
          <span className="text-sm">
            <span className="text-muted-foreground mr-1">Balance:</span>
            {formatCurrency(accountBalance)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spot">
          <TabsList className="grid w-full grid-cols-3 h-8 mb-4">
            <TabsTrigger value="spot">Spot</TabsTrigger>
            <TabsTrigger value="futures">Futures</TabsTrigger>
            <TabsTrigger value="bots">Bots</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger> 
          </TabsList>

          <TabsContent value="spot">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm mb-1">Symbol</span>
                  <span className="text-lg font-medium">{symbol}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm mb-1">Current Price</span>
                  <span className="text-lg font-medium">{formatCurrency(currentPrice)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Quantity</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0.0001"
                    step="0.001"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => setQuantity("0.1")}>10%</Button>
                  <Button variant="outline" onClick={() => setQuantity("0.5")}>50%</Button>
                  <Button variant="outline" onClick={() => setQuantity("1")}>100%</Button>
                </div>
              </div>

              <div className="space-y-3 border p-3 rounded-md bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="text-sm font-medium">ABATEV Smart Routing</h4>
                      <p className="text-xs text-muted-foreground">Automatic Best Available Trade Execution Venue</p>
                    </div>
                  </div>
                  <Switch
                    checked={useABATEV}
                    onCheckedChange={toggleABATEV}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {useABATEV ? (
                    <div className="flex items-center gap-1 text-primary">
                      <Zap className="h-3 w-3" />
                      <span>Automatically selecting best broker for execution</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>Manual broker selection enabled</span>
                    </div>
                  )}
                </div>
                
                {!useABATEV && (
                  <div className="grid grid-cols-2 gap-2">
                    {activeBrokers.map(broker => (
                      <Button
                        key={broker}
                        size="sm"
                        variant={selectedBroker === broker ? "default" : "outline"}
                        className="text-xs h-8"
                        onClick={() => selectBroker(broker)}
                      >
                        {selectedBroker === broker && <Check className="h-3 w-3 mr-1" />}
                        {broker.charAt(0).toUpperCase() + broker.slice(1)}
                      </Button>
                    ))}
                  </div>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs flex items-center gap-1"
                  onClick={() => {
                    setComparisonsVisible(!comparisonsVisible);
                    if (!comparisonsVisible) {
                      refreshComparisons();
                    }
                  }}
                >
                  {comparisonsVisible ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      <span>Hide Broker Comparisons</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      <span>Show Broker Comparisons</span>
                    </>
                  )}
                </Button>
              </div>
              
              {comparisonsVisible && (
                <div className="mt-3 border rounded-md p-2 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Broker Comparisons</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={refreshComparisons}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span className="ml-2">Loading comparison data...</span>
                    </div>
                  ) : currentComparisons && currentComparisons.length > 0 ? (
                    <div className="space-y-2">
                      {currentComparisons.map((comparison: BrokerComparison) => (
                        <div 
                          key={comparison.brokerId}
                          className={cn(
                            "p-2 rounded border flex justify-between items-center", 
                            comparison.score > 80 ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "",
                            comparison.score > 60 && comparison.score <= 80 ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "",
                            comparison.score > 40 && comparison.score <= 60 ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" : "",
                            comparison.score <= 40 ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" : ""
                          )}
                        >
                          <div>
                            <div className="font-medium">{comparison.brokerName}</div>
                            <div className="flex space-x-2 text-xs text-muted-foreground">
                              <span>{formatCurrency(comparison.price)}</span>
                              <span>Spread: {comparison.spread.toFixed(5)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{comparison.score.toFixed(0)}%</div>
                            <div className="text-xs text-muted-foreground">{Math.round(comparison.latency)}ms</div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-xs text-muted-foreground italic">
                        ABATEV score factors: price, spread, latency, fees, and available volume
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      No comparison data available
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 mt-6">
                <Button 
                  className="flex-1 h-14" 
                  onClick={() => handleTrade("buy")}
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Buy / Long
                </Button>
                <Button 
                  className="flex-1 h-14" 
                  variant="destructive"
                  onClick={() => handleTrade("sell")}
                >
                  <TrendingDown className="mr-2 h-5 w-5" />
                  Sell / Short
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="futures">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm mb-1">Symbol</span>
                  <span className="text-lg font-medium">{symbol}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm mb-1">Current Price</span>
                  <span className="text-lg font-medium">{formatCurrency(currentPrice)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Quantity</label>
                <Input
                  type="number"
                  min="0.0001"
                  step="0.001"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm">Leverage: {leverage}x</label>
                  <span className="text-xs text-muted-foreground">
                    <DollarSign className="inline h-3 w-3" />
                    {formatCurrency(calculateMargin())} margin required
                  </span>
                </div>
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[leverage]}
                  onValueChange={(value) => setLeverage(value[0])}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Order Type</label>
                <div className="flex gap-2">
                  <Button 
                    variant={orderType === "market" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setOrderType("market")}
                  >
                    Market
                  </Button>
                  <Button 
                    variant={orderType === "limit" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setOrderType("limit")}
                  >
                    Limit
                  </Button>
                </div>
              </div>

              {orderType === "limit" && (
                <div className="space-y-2">
                  <label className="text-sm">Limit Price</label>
                  <Input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder={currentPrice.toString()}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-3 border rounded-md mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Potential Profit (Long)</p>
                  <p className="text-sm text-green-500">
                    {formatCurrency(calculatePotentialProfit("buy"))}
                    <span className="text-xs ml-1">
                      (+5%)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Potential Profit (Short)</p>
                  <p className="text-sm text-red-500">
                    {formatCurrency(calculatePotentialProfit("sell"))}
                    <span className="text-xs ml-1">
                      (-5%)
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs flex items-center justify-center gap-1 mb-3"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  <Settings className="h-3 w-3" />
                  {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
                </Button>
                
                {showAdvancedOptions && (
                  <div className="space-y-3 mb-3 p-3 border rounded-md">
                    <div className="space-y-2">
                      <label className="text-sm">Take Profit Price</label>
                      <Input
                        type="number"
                        value={takeProfitPrice}
                        onChange={(e) => setTakeProfitPrice(e.target.value)}
                        placeholder={`Suggested: ${(currentPrice * 1.05).toFixed(2)}`}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm">Stop Loss Price</label>
                      <Input
                        type="number"
                        value={stopLossPrice}
                        onChange={(e) => setStopLossPrice(e.target.value)}
                        placeholder={`Suggested: ${(currentPrice * 0.95).toFixed(2)}`}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm">ABATEV Smart Routing</label>
                      <div className="flex items-center justify-between border p-2 rounded-md bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <div className="text-xs">
                            {useABATEV ? "Automatic best broker selection" : "Manual broker selection"}
                          </div>
                        </div>
                        <Switch
                          checked={useABATEV}
                          onCheckedChange={toggleABATEV}
                        />
                      </div>
                    </div>
                    
                    {!useABATEV && (
                      <div className="grid grid-cols-2 gap-2">
                        {activeBrokers.map(broker => (
                          <Button
                            key={broker}
                            size="sm"
                            variant={selectedBroker === broker ? "default" : "outline"}
                            className="text-xs h-8"
                            onClick={() => selectBroker(broker)}
                          >
                            {selectedBroker === broker && <Check className="h-3 w-3 mr-1" />}
                            {broker.charAt(0).toUpperCase() + broker.slice(1)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 h-14" 
                    onClick={() => handleTrade("buy")}
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Long {leverage}x
                  </Button>
                  <Button 
                    className="flex-1 h-14" 
                    variant="destructive"
                    onClick={() => handleTrade("sell")}
                  >
                    <TrendingDown className="mr-2 h-5 w-5" />
                    Short {leverage}x
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bots">
            <BotCreator />
          </TabsContent>

          <TabsContent value="history"> 
            <OrderHistoryView orders={orderHistory} /> 
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}