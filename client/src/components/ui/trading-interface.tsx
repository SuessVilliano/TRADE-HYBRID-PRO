import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, PercentIcon, Wallet } from "lucide-react";
import { useTrader } from "@/lib/stores/useTrader";
import { useMarketData } from "@/lib/stores/useMarketData";
import { IronBeamService } from "@/lib/services/ironbeam-service";
import { AlpacaService } from "@/lib/services/alpaca-service";
import { cn, formatCurrency } from "@/lib/utils";
import { BotCreator } from "./bot-creator";
import { OrderHistoryView } from "./order-history";


interface TradingInterfaceProps {
  className?: string;
}

export function TradingInterface({ className }: TradingInterfaceProps) {
  const { placeTrade, accountBalance, orderHistory } = useTrader();
  const { currentPrice, symbol } = useMarketData();
  const [quantity, setQuantity] = useState("0.01");
  const [leverage, setLeverage] = useState(1);
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");

  const handleTrade = (side: "buy" | "sell") => {
    placeTrade({
      symbol,
      side,
      quantity: parseFloat(quantity),
      leverage,
      type: orderType,
      limitPrice: orderType === "limit" ? parseFloat(limitPrice) : undefined,
    });
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