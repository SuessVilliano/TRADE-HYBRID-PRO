import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWallet } from '@solana/wallet-adapter-react';
import { Users, Award, BadgeHelp, Lock, ArrowRight, Shield, Check, AlertTriangle } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ForsageMatrixVisualization } from '@/components/affiliate/forsage-matrix-visualization';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import '@solana/wallet-adapter-react-ui/styles.css';

const MatrixPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [error, setError] = useState<string | null>(null);
  
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Matrix System | Trade Hybrid</title>
      </Helmet>
      
      <PageHeader
        title="Matrix System"
        description="Participate in the Trade Hybrid affiliate matrix system with direct crypto payments"
      />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="bg-blue-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <CardTitle className="text-white">X3 Matrix System</CardTitle>
            <CardDescription className="text-gray-400">
              100% direct payments to your wallet via smart contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-gray-300">First position filled pays you directly</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-gray-300">Second position passes up to your sponsor</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-gray-300">12 levels from $25 to $51,200</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="bg-purple-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <CardTitle className="text-white">X4 Matrix System</CardTitle>
            <CardDescription className="text-gray-400">
              Deeper team building with enhanced spillover benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-gray-300">Higher earning potential with 4-level matrix</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-gray-300">Two positions pass up, creating cascading team growth</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-gray-300">Automatic recycling for continuous income</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="bg-amber-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <Award className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle className="text-white">Direct Crypto Payments</CardTitle>
            <CardDescription className="text-gray-400">
              100% commission goes directly to your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-gray-300">Smart contract ensures transparency</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-gray-300">No admin fees or waiting periods</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span className="text-gray-300">Automated payments for matrix positions</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {!connected ? (
        <Card className="mb-6">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Connect your Solana wallet to view your matrix structure and manage your affiliate positions.
            </p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="matrix" className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matrix">Matrix Visualization</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="levels">Levels & Pricing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="matrix" className="pt-6">
              <ForsageMatrixVisualization userWalletAddress={publicKey?.toString()} />
            </TabsContent>
            
            <TabsContent value="earnings" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-amber-500" />
                      Total Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-muted-foreground">X3 Matrix</div>
                          <div className="text-2xl font-bold">$2,450.00</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">X4 Matrix</div>
                          <div className="text-2xl font-bold">$1,875.00</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Total Earned</div>
                        <div className="text-xl font-bold">$4,325.00</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      Your Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md text-center">
                          <div className="text-2xl font-bold">37</div>
                          <div className="text-sm text-muted-foreground">Total Partners</div>
                        </div>
                        
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md text-center">
                          <div className="text-2xl font-bold">12</div>
                          <div className="text-sm text-muted-foreground">Direct Referrals</div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                        <div className="flex justify-between mb-2">
                          <div className="text-sm text-muted-foreground">Team Growth</div>
                          <div className="text-sm">+4 this week</div>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: '65%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Earnings</CardTitle>
                  <CardDescription>
                    Direct payments received from matrix positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { amount: 100, from: 'Wallet4...7xp9', date: '2 hours ago', level: 2, matrix: 'X3' },
                      { amount: 200, from: 'Wallet8...3kq2', date: '1 day ago', level: 3, matrix: 'X3' },
                      { amount: 400, from: 'Wallet2...9fj4', date: '3 days ago', level: 3, matrix: 'X4' },
                      { amount: 50, from: 'Wallet3...5rt7', date: '5 days ago', level: 1, matrix: 'X3' },
                      { amount: 800, from: 'Wallet6...2hp8', date: '1 week ago', level: 4, matrix: 'X4' }
                    ].map((earning, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                        <div>
                          <div className="font-medium text-green-600 dark:text-green-400">+${earning.amount}.00</div>
                          <div className="text-xs text-muted-foreground">
                            From {earning.from} • {earning.date}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            Level {earning.level}
                          </Badge>
                          <div className="text-xs text-muted-foreground">{earning.matrix} Matrix</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="levels" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-500" />
                    Matrix Levels and Pricing
                  </CardTitle>
                  <CardDescription>
                    Each level provides increasing rewards with the same proven matrix structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="py-3 px-4 text-left font-medium">Level</th>
                          <th className="py-3 px-4 text-left font-medium">Price</th>
                          <th className="py-3 px-4 text-left font-medium">X3 Direct Earnings</th>
                          <th className="py-3 px-4 text-left font-medium">X4 Team Earnings</th>
                          <th className="py-3 px-4 text-left font-medium">Your Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { level: 1, price: 25, x3: 25, x4: 25, status: 'active' },
                          { level: 2, price: 50, x3: 50, x4: 50, status: 'active' },
                          { level: 3, price: 100, x3: 100, x4: 100, status: 'active' },
                          { level: 4, price: 200, x3: 200, x4: 200, status: 'active' },
                          { level: 5, price: 400, x3: 400, x4: 400, status: 'active' },
                          { level: 6, price: 800, x3: 800, x4: 800, status: 'inactive' },
                          { level: 7, price: 1600, x3: 1600, x4: 1600, status: 'inactive' },
                          { level: 8, price: 3200, x3: 3200, x4: 3200, status: 'inactive' },
                          { level: 9, price: 6400, x3: 6400, x4: 6400, status: 'inactive' },
                          { level: 10, price: 12800, x3: 12800, x4: 12800, status: 'inactive' },
                          { level: 11, price: 25600, x3: 25600, x4: 25600, status: 'inactive' },
                          { level: 12, price: 51200, x3: 51200, x4: 51200, status: 'inactive' }
                        ].map((level) => (
                          <tr key={level.level} className="border-b dark:border-gray-700">
                            <td className="py-3 px-4">
                              <div className="font-medium">Level {level.level}</div>
                            </td>
                            <td className="py-3 px-4">${level.price}</td>
                            <td className="py-3 px-4">${level.x3}</td>
                            <td className="py-3 px-4">${level.x4}</td>
                            <td className="py-3 px-4">
                              {level.status === 'active' ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Locked
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                    <ArrowRight className="h-4 w-4" />
                    Upgrade to Level 6
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Upgrading unlocks higher earning potential and larger matrix positions
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">How the Matrix System Works</CardTitle>
              <CardDescription className="text-gray-400">
                The Trade Hybrid matrix system combines the best features of proven matrix models
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <BadgeHelp className="h-5 w-5 mr-2 text-blue-400" />
                    X3 Matrix Structure
                  </h3>
                  <p className="mb-4 text-sm">
                    The X3 matrix is a 2×3 forced matrix that gives you direct commissions from your personally referred members. Each level has specific positions that pay direct to you, while others pass up to your sponsor.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-2 h-4 w-4 mt-0.5 shrink-0" />
                      <span>First position filled pays directly to you</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-2 h-4 w-4 mt-0.5 shrink-0" />
                      <span>Second position passes up to your sponsor</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-2 h-4 w-4 mt-0.5 shrink-0" />
                      <span>When your matrix is filled, it automatically recycles, creating continuous income</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <BadgeHelp className="h-5 w-5 mr-2 text-purple-400" />
                    X4 Matrix Structure
                  </h3>
                  <p className="mb-4 text-sm">
                    The X4 matrix is a 3×4 forced matrix that provides deeper team building and higher earning potential. This matrix creates stronger team spillover and faster growth.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-2 h-4 w-4 mt-0.5 shrink-0" />
                      <span>First two positions filled pay directly to you</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-2 h-4 w-4 mt-0.5 shrink-0" />
                      <span>Third and fourth positions pass up to your sponsor</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-2 h-4 w-4 mt-0.5 shrink-0" />
                      <span>Passing up positions creates automatic spillover for your team</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MatrixPage;