import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleCheck, CircleX, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTrader } from "@/lib/stores/useTrader";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TradeJournalProps {
  className?: string;
}

export function TradeJournal({ className }: TradeJournalProps) {
  const { trades, tradeStats, fetchTrades, loading } = useTrader();
  
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>
            <BarChart2 className="inline mr-2 h-5 w-5" />
            Trading Journal
          </span>
          {loading && <span className="text-sm text-muted-foreground">Loading...</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats">
          <TabsList className="grid w-full grid-cols-2 h-8 mb-4">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Win Rate</p>
                <Progress value={tradeStats.winRate} className="h-2" />
                <p className="text-xs text-right">{tradeStats.winRate.toFixed(0)}%</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-semibold">Profit Factor</p>
                <Progress value={Math.min(tradeStats.profitFactor * 20, 100)} className="h-2" />
                <p className="text-xs text-right">{tradeStats.profitFactor.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border p-3">
                <div className="flex justify-between items-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-semibold">
                    {formatCurrency(tradeStats.totalProfit)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total Profit</p>
              </div>
              
              <div className="rounded-lg border p-3">
                <div className="flex justify-between items-center">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span className="text-red-500 font-semibold">
                    {formatCurrency(tradeStats.totalLoss)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total Loss</p>
              </div>
            </div>
            
            <div className="rounded-lg border p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Net P&L</span>
                <span className={cn(
                  "font-semibold",
                  tradeStats.netPnL >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {formatCurrency(tradeStats.netPnL)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Win</p>
                  <p className="text-sm text-green-500">
                    {formatCurrency(tradeStats.avgWin)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Loss</p>
                  <p className="text-sm text-red-500">
                    {formatCurrency(tradeStats.avgLoss)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Largest Win</p>
                  <p className="text-sm text-green-500">
                    {formatCurrency(tradeStats.largestWin)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Largest Loss</p>
                  <p className="text-sm text-red-500">
                    {formatCurrency(tradeStats.largestLoss)}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trades">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>
                        {trade.profit >= 0 ? (
                          <CircleCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <CircleX className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <span className={trade.side === "buy" ? "text-green-500" : "text-red-500"}>
                          {trade.side.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-medium",
                        trade.profit >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {formatCurrency(trade.profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {trades.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No trades recorded yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
