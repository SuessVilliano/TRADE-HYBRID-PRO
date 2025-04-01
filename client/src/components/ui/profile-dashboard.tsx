import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LineChart, BarChart, Activity, Trophy, Calendar, Clock, ArrowUpRight, ArrowDownRight, Wallet, Landmark } from 'lucide-react';
import { useTrader } from '@/lib/stores/useTrader';

interface ProfileDashboardProps {
  userId: string;
}

export const ProfileDashboard = ({ userId }: ProfileDashboardProps) => {
  const { trades = [], fetchTrades } = useTrader();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample user data (in a real app, you'd fetch this)
  const user = {
    id: userId,
    name: 'Alex Thompson',
    username: 'alextrader',
    bio: 'Full-time crypto and forex trader. Specializing in swing trading and technical analysis.',
    memberSince: '2022-03-15',
    level: 'Professional',
    trades: trades.length,
    winRate: 68,
    profitFactor: 2.4,
    verifiedBadges: ['Email Verified', 'KYC Verified', 'Pro Trader'],
    skills: ['Technical Analysis', 'Crypto Trading', 'Risk Management', 'Algorithmic Trading'],
    socials: {
      twitter: '@alextrader',
      discord: 'alextrader#1234',
      telegram: '@alex_crypto_trader'
    },
    tradingPerformance: {
      totalPnL: 12450.32,
      lastMonthPnL: 2340.18,
      bestTrade: 4521.75,
      worstTrade: -875.20,
      averageTradeReturn: 120.45,
      returnOnInvestment: 24.8,
      sharpeRatio: 1.85,
      maxDrawdown: 15.3
    }
  };
  
  // Fetch user trades
  useEffect(() => {
    if (fetchTrades) {
      fetchTrades();
    }
  }, [fetchTrades]);
  
  // Calculate summary statistics
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  
  // Calculate portfolio value
  const portfolioValue = trades.reduce((total, trade) => total + trade.pnl, 10000); // Starting with 10k
  
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trading" className="flex items-center gap-1.5">
            <LineChart className="h-4 w-4" />
            Trading History
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-1.5">
            <BarChart className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-2">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                  <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>@{user.username}</CardDescription>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {user.verifiedBadges.map(badge => (
                    <Badge key={badge} variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center mb-4">{user.bio}</p>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Member Since
                    </span>
                    <span>{new Date(user.memberSince).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Activity className="h-4 w-4 mr-1" /> Trader Level
                    </span>
                    <span>{user.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> Total Trades
                    </span>
                    <span>{user.trades}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium mb-2">Trading Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-gray-700/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Edit Profile</Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Trading Performance</CardTitle>
                <CardDescription>
                  Your overall trading metrics and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-500/10 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total P&L</div>
                    <div className="text-2xl font-bold text-blue-500">${user.tradingPerformance.totalPnL.toLocaleString()}</div>
                    <div className="flex items-center text-sm text-green-500 mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +{user.tradingPerformance.returnOnInvestment}%
                    </div>
                  </div>
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                    <div className="text-2xl font-bold text-green-500">{winRate.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Last 30 trades
                    </div>
                  </div>
                  <div className="bg-purple-500/10 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Profit Factor</div>
                    <div className="text-2xl font-bold text-purple-500">{user.tradingPerformance.profitFactor.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Wins to losses ratio
                    </div>
                  </div>
                  <div className="bg-orange-500/10 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Max Drawdown</div>
                    <div className="text-2xl font-bold text-orange-500">{user.tradingPerformance.maxDrawdown}%</div>
                    <div className="flex items-center text-sm text-red-500 mt-1">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Historical max
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Performance Chart</h3>
                    <div className="h-64 w-full bg-gray-800/50 rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">Performance chart visualization goes here</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y divide-gray-800">
                            {trades.slice(0, 5).map((trade, index) => (
                              <div key={index} className="flex justify-between items-center p-3">
                                <div>
                                  <div className="font-medium">{trade.symbol}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(trade.date).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className={trade.pnl > 0 ? 'text-green-500' : 'text-red-500'}>
                                  {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                </div>
                              </div>
                            ))}
                            {trades.length === 0 && (
                              <div className="p-4 text-center text-muted-foreground">
                                No recent trades found
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Trading Statistics</h3>
                      <Card>
                        <CardContent className="p-3">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Best Trade</span>
                              <span className="text-green-500">+${user.tradingPerformance.bestTrade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Worst Trade</span>
                              <span className="text-red-500">${user.tradingPerformance.worstTrade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg. Return per Trade</span>
                              <span>${user.tradingPerformance.averageTradeReturn}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sharpe Ratio</span>
                              <span>{user.tradingPerformance.sharpeRatio}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Monthly Return</span>
                              <span className="text-green-500">+${user.tradingPerformance.lastMonthPnL}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trading">
          <Card>
            <CardHeader>
              <CardTitle>Trading History</CardTitle>
              <CardDescription>
                Your complete trading history and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Trade Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Asset Classes</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="h-48 bg-gray-800/50 rounded-b-lg flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Asset distribution chart</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Win/Loss Ratio</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="h-48 bg-gray-800/50 rounded-b-lg flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Win/loss chart</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">Trade Duration</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="h-48 bg-gray-800/50 rounded-b-lg flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Duration chart</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Trade Journal</h3>
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left p-3">Date</th>
                              <th className="text-left p-3">Symbol</th>
                              <th className="text-left p-3">Type</th>
                              <th className="text-left p-3">Entry</th>
                              <th className="text-left p-3">Exit</th>
                              <th className="text-left p-3">P&L</th>
                              <th className="text-left p-3">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trades.map((trade, index) => (
                              <tr key={index} className="border-b border-gray-800">
                                <td className="p-3">{new Date(trade.date).toLocaleDateString()}</td>
                                <td className="p-3 font-medium">{trade.symbol}</td>
                                <td className="p-3">{trade.type}</td>
                                <td className="p-3">${trade.entry.toFixed(2)}</td>
                                <td className="p-3">${trade.exit.toFixed(2)}</td>
                                <td className={`p-3 ${trade.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">{trade.notes}</td>
                              </tr>
                            ))}
                            {trades.length === 0 && (
                              <tr>
                                <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                  No trades found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>
                Your current portfolio holdings and allocations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-800/70 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2 text-blue-500" />
                    <div className="text-lg font-medium">Total Portfolio Value</div>
                  </div>
                  <div className="text-3xl font-bold mt-2">${portfolioValue.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800/70 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-500" />
                    <div className="text-lg font-medium">Monthly Change</div>
                  </div>
                  <div className="text-3xl font-bold mt-2 text-green-500">+$2,345.67</div>
                </div>
                <div className="bg-slate-800/70 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Landmark className="h-5 w-5 mr-2 text-purple-500" />
                    <div className="text-lg font-medium">Annual ROI</div>
                  </div>
                  <div className="text-3xl font-bold mt-2 text-purple-500">+23.5%</div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Asset Allocation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">Asset allocation chart</span>
                    </div>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-800">
                          <div className="flex justify-between items-center p-3">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              <div>Bitcoin (BTC)</div>
                            </div>
                            <div>42%</div>
                          </div>
                          <div className="flex justify-between items-center p-3">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <div>Ethereum (ETH)</div>
                            </div>
                            <div>28%</div>
                          </div>
                          <div className="flex justify-between items-center p-3">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                              <div>Solana (SOL)</div>
                            </div>
                            <div>15%</div>
                          </div>
                          <div className="flex justify-between items-center p-3">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                              <div>Forex (EURUSD)</div>
                            </div>
                            <div>10%</div>
                          </div>
                          <div className="flex justify-between items-center p-3">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                              <div>Others</div>
                            </div>
                            <div>5%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Current Holdings</h3>
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left p-3">Asset</th>
                              <th className="text-left p-3">Quantity</th>
                              <th className="text-left p-3">Avg. Entry</th>
                              <th className="text-left p-3">Current Price</th>
                              <th className="text-left p-3">Value</th>
                              <th className="text-left p-3">Unrealized P&L</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-800">
                              <td className="p-3 font-medium">Bitcoin (BTC)</td>
                              <td className="p-3">0.85</td>
                              <td className="p-3">$42,500</td>
                              <td className="p-3">$43,567</td>
                              <td className="p-3">$37,031.95</td>
                              <td className="p-3 text-green-500">+$906.45</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                              <td className="p-3 font-medium">Ethereum (ETH)</td>
                              <td className="p-3">5.2</td>
                              <td className="p-3">$2,800</td>
                              <td className="p-3">$2,932</td>
                              <td className="p-3">$15,246.40</td>
                              <td className="p-3 text-green-500">+$686.40</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                              <td className="p-3 font-medium">Solana (SOL)</td>
                              <td className="p-3">75</td>
                              <td className="p-3">$120</td>
                              <td className="p-3">$112.75</td>
                              <td className="p-3">$8,456.25</td>
                              <td className="p-3 text-red-500">-$543.75</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                              <td className="p-3 font-medium">EUR/USD</td>
                              <td className="p-3">0.5 lot</td>
                              <td className="p-3">1.0825</td>
                              <td className="p-3">1.0865</td>
                              <td className="p-3">$5,432.50</td>
                              <td className="p-3 text-green-500">+$200.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Trading Achievements</CardTitle>
              <CardDescription>
                Your badges, rewards and trading milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Unlocked Badges</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                      <div className="h-16 w-16 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="font-medium">Pro Trader</div>
                      <div className="text-xs text-muted-foreground mt-1">Win rate above 60%</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                      <div className="h-16 w-16 mx-auto mb-2 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Activity className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="font-medium">Consistency King</div>
                      <div className="text-xs text-muted-foreground mt-1">30 day streak</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                      <div className="h-16 w-16 mx-auto mb-2 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Wallet className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="font-medium">10K Club</div>
                      <div className="text-xs text-muted-foreground mt-1">$10K or more in profits</div>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4 text-center">
                      <div className="h-16 w-16 mx-auto mb-2 bg-gray-500/20 rounded-full flex items-center justify-center">
                        <Clock className="h-8 w-8 text-gray-500" />
                      </div>
                      <div className="font-medium">1 Year Veteran</div>
                      <div className="text-xs text-muted-foreground mt-1">Member for over 1 year</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Current Challenges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">$25K Challenge</CardTitle>
                        <CardDescription className="text-xs">
                          Reach $25,000 in total profits
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-2">
                          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${(user.tradingPerformance.totalPnL / 25000) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>${user.tradingPerformance.totalPnL.toLocaleString()}</span>
                            <span>$25,000</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">100 Trades Challenge</CardTitle>
                        <CardDescription className="text-xs">
                          Complete 100 trades with positive ROI
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="space-y-2">
                          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${(winningTrades.length / 100) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>{winningTrades.length} trades</span>
                            <span>100 trades</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Trading Milestones</h3>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-700"></div>
                    <div className="space-y-6">
                      <div className="flex">
                        <div className="z-10 flex-shrink-0 h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4 bg-gray-800/50 rounded-lg p-3 flex-grow">
                          <div className="font-medium">Account Verified</div>
                          <div className="text-sm text-muted-foreground">
                            Completed KYC verification and received verified trader status
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            March 18, 2022
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="z-10 flex-shrink-0 h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Wallet className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-4 bg-gray-800/50 rounded-lg p-3 flex-grow">
                          <div className="font-medium">First $1,000 Profit</div>
                          <div className="text-sm text-muted-foreground">
                            Reached first $1,000 in cumulative profits
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            April 25, 2022
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="z-10 flex-shrink-0 h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Activity className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="ml-4 bg-gray-800/50 rounded-lg p-3 flex-grow">
                          <div className="font-medium">Professional Trader Status</div>
                          <div className="text-sm text-muted-foreground">
                            Achieved Professional Trader status with over 60% win rate in more than 50 trades
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            October 12, 2022
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="z-10 flex-shrink-0 h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-orange-500" />
                        </div>
                        <div className="ml-4 bg-gray-800/50 rounded-lg p-3 flex-grow">
                          <div className="font-medium">$10,000 Profit Milestone</div>
                          <div className="text-sm text-muted-foreground">
                            Reached $10,000 in cumulative profits
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            February 3, 2023
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};