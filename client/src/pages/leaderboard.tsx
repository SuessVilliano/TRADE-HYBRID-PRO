import React from 'react';
import { Layout } from '../components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Trophy, Medal, TrendingUp, Users, Zap } from 'lucide-react';

export default function Leaderboard() {
  const traderLeaderboard = [
    { rank: 1, name: 'Alex Johnson', avatar: '/avatars/avatar-1.png', profit: 145.23, winRate: 68, trades: 124 },
    { rank: 2, name: 'Morgan Zhang', avatar: '/avatars/avatar-2.png', profit: 112.58, winRate: 72, trades: 96 },
    { rank: 3, name: 'Sarah Williams', avatar: '/avatars/avatar-3.png', profit: 98.41, winRate: 65, trades: 142 },
    { rank: 4, name: 'Robert Chen', avatar: '/avatars/avatar-4.png', profit: 87.32, winRate: 61, trades: 103 },
    { rank: 5, name: 'Jamal Peterson', avatar: '/avatars/avatar-5.png', profit: 76.18, winRate: 59, trades: 85 },
    { rank: 6, name: 'Linda Kowalski', avatar: '/avatars/avatar-6.png', profit: 64.92, winRate: 54, trades: 121 },
    { rank: 7, name: 'David Miller', avatar: '/avatars/avatar-7.png', profit: 57.83, winRate: 52, trades: 92 },
    { rank: 8, name: 'Emily Sato', avatar: '/avatars/avatar-8.png', profit: 48.95, winRate: 53, trades: 78 },
    { rank: 9, name: 'Michael Taylor', avatar: '/avatars/avatar-9.png', profit: 42.61, winRate: 48, trades: 115 },
    { rank: 10, name: 'Sofia Garcia', avatar: '/avatars/avatar-10.png', profit: 38.47, winRate: 47, trades: 89 }
  ];

  const challengeLeaderboard = [
    { rank: 1, name: 'Emma Wilson', avatar: '/avatars/avatar-11.png', score: 9842, challenge: 'Prop Firm Challenge', badge: 'Elite' },
    { rank: 2, name: 'Marcus Johnson', avatar: '/avatars/avatar-12.png', score: 9567, challenge: 'Prop Firm Challenge', badge: 'Elite' },
    { rank: 3, name: 'Olivia Martinez', avatar: '/avatars/avatar-13.png', score: 9210, challenge: 'Bitcoin Bull Run', badge: 'Champion' },
    { rank: 4, name: 'Noah Lee', avatar: '/avatars/avatar-14.png', score: 8940, challenge: 'Prop Firm Challenge', badge: 'Pro' },
    { rank: 5, name: 'Sophia Patel', avatar: '/avatars/avatar-15.png', score: 8732, challenge: 'Volatility Master', badge: 'Expert' },
    { rank: 6, name: 'Ethan Brown', avatar: '/avatars/avatar-16.png', score: 8591, challenge: 'Bitcoin Bull Run', badge: 'Champion' },
    { rank: 7, name: 'Ava Robinson', avatar: '/avatars/avatar-17.png', score: 8367, challenge: 'Prop Firm Challenge', badge: 'Pro' },
    { rank: 8, name: 'Jackson Kim', avatar: '/avatars/avatar-18.png', score: 8145, challenge: 'Volatility Master', badge: 'Expert' },
    { rank: 9, name: 'Isabella Clark', avatar: '/avatars/avatar-19.png', score: 7982, challenge: 'Prop Firm Challenge', badge: 'Advanced' },
    { rank: 10, name: 'Liam Rodriguez', avatar: '/avatars/avatar-20.png', score: 7845, challenge: 'Bitcoin Bull Run', badge: 'Veteran' }
  ];

  const referralLeaderboard = [
    { rank: 1, name: 'Jason Smith', avatar: '/avatars/avatar-21.png', referrals: 124, commission: 4567.82, tier: 'Diamond' },
    { rank: 2, name: 'Lisa Wang', avatar: '/avatars/avatar-22.png', referrals: 98, commission: 3298.45, tier: 'Platinum' },
    { rank: 3, name: 'Carlos Mendez', avatar: '/avatars/avatar-23.png', referrals: 87, commission: 2947.31, tier: 'Platinum' },
    { rank: 4, name: 'Rachel Foster', avatar: '/avatars/avatar-24.png', referrals: 75, commission: 2541.19, tier: 'Gold' },
    { rank: 5, name: 'Kyle Johnson', avatar: '/avatars/avatar-25.png', referrals: 64, commission: 2187.63, tier: 'Gold' },
    { rank: 6, name: 'Diana Chen', avatar: '/avatars/avatar-26.png', referrals: 52, commission: 1756.92, tier: 'Silver' },
    { rank: 7, name: 'Omar Hassan', avatar: '/avatars/avatar-27.png', referrals: 47, commission: 1582.45, tier: 'Silver' },
    { rank: 8, name: 'Priya Sharma', avatar: '/avatars/avatar-28.png', referrals: 41, commission: 1375.21, tier: 'Silver' },
    { rank: 9, name: 'Trevor Wilson', avatar: '/avatars/avatar-29.png', referrals: 36, commission: 1198.34, tier: 'Bronze' },
    { rank: 10, name: 'Maya Lopez', avatar: '/avatars/avatar-30.png', referrals: 32, commission: 1075.67, tier: 'Bronze' }
  ];

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Elite': return 'bg-purple-600 hover:bg-purple-700';
      case 'Champion': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'Pro': return 'bg-blue-600 hover:bg-blue-700';
      case 'Expert': return 'bg-green-600 hover:bg-green-700';
      case 'Advanced': return 'bg-teal-600 hover:bg-teal-700';
      case 'Veteran': return 'bg-indigo-600 hover:bg-indigo-700';
      default: return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'bg-blue-500 hover:bg-blue-600';
      case 'Platinum': return 'bg-slate-500 hover:bg-slate-600';
      case 'Gold': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Silver': return 'bg-gray-400 hover:bg-gray-500';
      case 'Bronze': return 'bg-amber-700 hover:bg-amber-800';
      default: return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Leaderboards</h1>
        
        <Tabs defaultValue="traders">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="traders" className="flex-1">
              <TrendingUp className="mr-2 h-4 w-4" />
              Top Traders
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex-1">
              <Trophy className="mr-2 h-4 w-4" />
              Challenge Winners
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex-1">
              <Users className="mr-2 h-4 w-4" />
              Referral Program
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="traders">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  Top Performing Traders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th scope="col" className="px-4 py-3">Rank</th>
                        <th scope="col" className="px-4 py-3">Trader</th>
                        <th scope="col" className="px-4 py-3">Profit %</th>
                        <th scope="col" className="px-4 py-3">Win Rate</th>
                        <th scope="col" className="px-4 py-3">Trades</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traderLeaderboard.map((trader) => (
                        <tr key={trader.rank} className="border-b dark:border-slate-700">
                          <td className="px-4 py-3 font-medium">
                            {trader.rank <= 3 ? (
                              <Badge className={
                                trader.rank === 1 
                                  ? 'bg-yellow-500' 
                                  : trader.rank === 2 
                                    ? 'bg-gray-400' 
                                    : 'bg-amber-700'
                              }>
                                {trader.rank}
                              </Badge>
                            ) : (
                              trader.rank
                            )}
                          </td>
                          <td className="px-4 py-3 flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={trader.avatar} />
                              <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span>{trader.name}</span>
                          </td>
                          <td className="px-4 py-3 flex items-center">
                            <span className={`flex items-center ${trader.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {trader.profit > 0 ? (
                                <ArrowUpRight className="mr-1 h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="mr-1 h-4 w-4" />
                              )}
                              {trader.profit.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">{trader.winRate}%</td>
                          <td className="px-4 py-3">{trader.trades}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="challenges">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  Challenge Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th scope="col" className="px-4 py-3">Rank</th>
                        <th scope="col" className="px-4 py-3">Trader</th>
                        <th scope="col" className="px-4 py-3">Challenge</th>
                        <th scope="col" className="px-4 py-3">Badge</th>
                        <th scope="col" className="px-4 py-3">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challengeLeaderboard.map((trader) => (
                        <tr key={trader.rank} className="border-b dark:border-slate-700">
                          <td className="px-4 py-3 font-medium">
                            {trader.rank <= 3 ? (
                              <div className="flex items-center justify-center">
                                {trader.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                                {trader.rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
                                {trader.rank === 3 && <Medal className="h-5 w-5 text-amber-700" />}
                              </div>
                            ) : (
                              trader.rank
                            )}
                          </td>
                          <td className="px-4 py-3 flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={trader.avatar} />
                              <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span>{trader.name}</span>
                          </td>
                          <td className="px-4 py-3">{trader.challenge}</td>
                          <td className="px-4 py-3">
                            <Badge className={getBadgeColor(trader.badge)}>
                              {trader.badge}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium">{trader.score.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="referrals">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-blue-500" />
                  Top Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th scope="col" className="px-4 py-3">Rank</th>
                        <th scope="col" className="px-4 py-3">Affiliate</th>
                        <th scope="col" className="px-4 py-3">Tier</th>
                        <th scope="col" className="px-4 py-3">Referrals</th>
                        <th scope="col" className="px-4 py-3">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralLeaderboard.map((affiliate) => (
                        <tr key={affiliate.rank} className="border-b dark:border-slate-700">
                          <td className="px-4 py-3 font-medium">
                            {affiliate.rank}
                          </td>
                          <td className="px-4 py-3 flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={affiliate.avatar} />
                              <AvatarFallback>{affiliate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span>{affiliate.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={getTierColor(affiliate.tier)}>
                              {affiliate.tier}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{affiliate.referrals}</td>
                          <td className="px-4 py-3 font-medium">${affiliate.commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}