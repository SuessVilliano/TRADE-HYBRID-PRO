import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart2, Award, Trophy, Medal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLeaderboard } from "@/lib/stores/useLeaderboard";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const { traders, fetchLeaderboard, loading } = useLeaderboard();
  
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>
            <Trophy className="inline mr-2 h-5 w-5 text-amber-500" />
            Leaderboard
          </span>
          {loading && <span className="text-sm text-muted-foreground">Loading...</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pnl">
          <TabsList className="grid w-full grid-cols-3 h-8 mb-4">
            <TabsTrigger value="pnl">P&L</TabsTrigger>
            <TabsTrigger value="winrate">Win Rate</TabsTrigger>
            <TabsTrigger value="trades">Trade Count</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pnl">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Trader</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {traders
                    .sort((a, b) => b.pnl - a.pnl)
                    .map((trader, index) => (
                      <TableRow key={trader.id}>
                        <TableCell>
                          {index === 0 ? (
                            <Trophy className="h-5 w-5 text-amber-500" />
                          ) : index === 1 ? (
                            <Medal className="h-5 w-5 text-slate-400" />
                          ) : index === 2 ? (
                            <Medal className="h-5 w-5 text-amber-600" />
                          ) : (
                            <span className="text-sm text-muted-foreground">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{trader.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{trader.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          trader.pnl >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {formatCurrency(trader.pnl)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="winrate">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Trader</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {traders
                    .sort((a, b) => b.winRate - a.winRate)
                    .map((trader, index) => (
                      <TableRow key={trader.id}>
                        <TableCell>
                          {index === 0 ? (
                            <Trophy className="h-5 w-5 text-amber-500" />
                          ) : index === 1 ? (
                            <Medal className="h-5 w-5 text-slate-400" />
                          ) : index === 2 ? (
                            <Medal className="h-5 w-5 text-amber-600" />
                          ) : (
                            <span className="text-sm text-muted-foreground">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{trader.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{trader.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {trader.winRate.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="trades">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Trader</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {traders
                    .sort((a, b) => b.tradeCount - a.tradeCount)
                    .map((trader, index) => (
                      <TableRow key={trader.id}>
                        <TableCell>
                          {index === 0 ? (
                            <Trophy className="h-5 w-5 text-amber-500" />
                          ) : index === 1 ? (
                            <Medal className="h-5 w-5 text-slate-400" />
                          ) : index === 2 ? (
                            <Medal className="h-5 w-5 text-amber-600" />
                          ) : (
                            <span className="text-sm text-muted-foreground">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{trader.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{trader.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {trader.tradeCount}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
